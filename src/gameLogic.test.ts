import { describe, expect, it } from "vitest";
import { initialState, upgrades } from "./gameData";
import {
  formatNumber,
  getDerivedStats,
  getPromotionStage,
  getUpgradeCost,
  validateResourceTransaction,
} from "./gameLogic";
import { MVP_IDS } from "./types";
import type { ResourceDefinition, ResourceId } from "./types";

describe("game logic", () => {
  it("uses fixed one-time upgrade costs", () => {
    const checklist = upgrades.find(
      (upgrade) => upgrade.id === MVP_IDS.upgrades.betterChecklist,
    );

    if (!checklist) {
      throw new Error("Checklist upgrade is missing.");
    }

    expect(getUpgradeCost(checklist)).toBe(10);
  });

  it("formats compact resource numbers", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1_500)).toBe("1.5K");
    expect(formatNumber(-2_000_000)).toBe("-2.0M");
  });

  it("derives click stats from owned upgrades", () => {
    expect(
      getDerivedStats({
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
          [MVP_IDS.upgrades.bugReportTemplate]: 1,
          [MVP_IDS.upgrades.testCaseLibrary]: 1,
        },
      }),
    ).toEqual({
      bugsPerClick: 8,
      moneyPerBug: 2,
    });
  });

  it("returns the next promotion stage when requirements are met", () => {
    expect(
      getPromotionStage({
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      })?.id,
    ).toBe(MVP_IDS.careerStages.middleQa);
  });

  it("does not promote before requirements are met", () => {
    expect(getPromotionStage(initialState)).toBeNull();
  });
});

describe("resource transaction validation", () => {
  it("accepts valid add, spend, and convert requests with projected changes", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 10,
      [MVP_IDS.resources.money]: 5,
    };

    expect(
      validateResourceTransaction(resources, {
        operationType: "add",
        changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: 3 }],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 10,
          newValue: 13,
          delta: 3,
        },
      ],
    });

    expect(
      validateResourceTransaction(resources, {
        operationType: "spend",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: -4 }],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 5,
          newValue: 1,
          delta: -4,
        },
      ],
    });

    expect(
      validateResourceTransaction(resources, {
        operationType: "convert",
        changes: [
          { resourceId: MVP_IDS.resources.bugsFound, delta: -2 },
          { resourceId: MVP_IDS.resources.money, delta: 2 },
        ],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 10,
          newValue: 8,
          delta: -2,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 5,
          newValue: 7,
          delta: 2,
        },
      ],
    });
  });

  it("rejects missing resources without mutating state", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "add",
      changes: [{ resourceId: "future_resource" as ResourceId, delta: 1 }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "resource_not_found",
      );
    }
    expect(initialState.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 0,
    });
  });

  it("rejects invalid operation shapes and numeric amounts", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "add",
      changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: Number.NaN }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain("invalid_amount");
    }

    const malformedConvert = validateResourceTransaction(initialState.resources, {
      operationType: "convert",
      changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: 1 }],
    });

    expect(malformedConvert.ok).toBe(false);
    if (!malformedConvert.ok) {
      expect(malformedConvert.failures.map((failure) => failure.code)).toContain(
        "operation_not_allowed",
      );
    }
  });

  it("rejects spends below the minimum balance", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "spend",
      changes: [{ resourceId: MVP_IDS.resources.money, delta: -1 }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_below_minimum",
      );
    }
  });

  it("rejects additions above the MVP maximum balance", () => {
    const result = validateResourceTransaction(
      {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 1_000_000,
      },
      {
        operationType: "add",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: 1 }],
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_above_maximum",
      );
    }
  });

  it("rejects spending a registered non-spendable resource", () => {
    const nonSpendableDefinitions: ResourceDefinition[] = [
      {
        id: MVP_IDS.resources.money,
        displayName: "Money",
        description: "Test-only non-spendable resource definition.",
        category: "personal_economy",
        lifetimeCategory: "investment",
        producedBy: [],
        consumedBy: [],
        initialValue: 0,
        minimumValue: 0,
        maximumValue: 1_000_000,
        isSpendable: false,
        isPersistent: true,
        visibleByDefault: true,
        resetBehavior: "reset",
        format: {
          style: "integer",
          maximumFractionDigits: 0,
        },
      },
    ];
    const result = validateResourceTransaction(
      { ...initialState.resources, [MVP_IDS.resources.money]: 10 },
      {
        operationType: "spend",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: -1 }],
      },
      nonSpendableDefinitions,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "resource_not_spendable",
      );
    }
  });
});
