import { describe, expect, it } from "vitest";
import { initialState, upgrades } from "./gameData";
import {
  addResource,
  convertResources,
  createActiveModifierRegistry,
  formatNumber,
  getDerivedStats,
  getPermanentModifierInstanceId,
  getPromotionProgress,
  getPromotionStage,
  getUpgradeCost,
  getUpgradeModifierDefinitions,
  performManualTest,
  purchaseUpgrade,
  reportAllBugs,
  spendResource,
  validateResourceTransaction,
} from "./gameLogic";
import { MVP_IDS } from "./types";
import type { ModifierDefinition, ResourceDefinition, ResourceId } from "./types";

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

  it("builds active modifier registry instances from purchased upgrades", () => {
    const modifierDefinitions = getUpgradeModifierDefinitions();
    const checklistModifier = modifierDefinitions.find(
      (modifier) => modifier.sourceId === MVP_IDS.upgrades.betterChecklist,
    );
    const templateModifier = modifierDefinitions.find(
      (modifier) => modifier.sourceId === MVP_IDS.upgrades.bugReportTemplate,
    );

    if (!checklistModifier || !templateModifier) {
      throw new Error("Expected MVP upgrade modifiers are missing.");
    }

    const result = createActiveModifierRegistry({
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
      },
    });

    expect(result.failures).toEqual([]);
    expect(result.registry).toEqual({
      [getPermanentModifierInstanceId(checklistModifier)]: {
        instanceId: getPermanentModifierInstanceId(checklistModifier),
        definitionId: checklistModifier.definitionId,
        enabled: true,
      },
      [getPermanentModifierInstanceId(templateModifier)]: {
        instanceId: getPermanentModifierInstanceId(templateModifier),
        definitionId: templateModifier.definitionId,
        enabled: true,
      },
    });
  });

  it("keeps the modifier registry empty when no upgrades are owned", () => {
    expect(createActiveModifierRegistry(initialState)).toEqual({
      registry: {},
      failures: [],
    });
  });

  it("ignores unsupported modifier definitions and reports failures", () => {
    const unsupportedModifier: ModifierDefinition = {
      definitionId: "upgrade.future_automation.manual_bugs_per_action.temporary",
      sourceType: "upgrade",
      sourceId: MVP_IDS.upgrades.betterChecklist,
      targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
      modifierType: "multiplicative",
      value: 2,
      durationType: "temporary",
      stackingPolicy: "stack",
    };

    const result = createActiveModifierRegistry(
      {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      },
      [unsupportedModifier],
    );

    expect(result.registry).toEqual({});
    expect(result.failures.map((failure) => failure.code)).toEqual([
      "unsupported_modifier_type",
      "unsupported_modifier_duration",
      "unsupported_modifier_stacking",
    ]);
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

  it("returns shared promotion progress rows", () => {
    expect(
      getPromotionProgress({
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 25,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      }),
    ).toEqual([
      {
        id: "current_run_lifetime_bugs_found",
        label: "Lifetime bugs found",
        current: 100,
        required: 100,
        prefix: "",
        complete: true,
      },
      {
        id: "current_run_lifetime_money_earned",
        label: "Lifetime money earned",
        current: 25,
        required: 150,
        prefix: "$",
        complete: false,
      },
      {
        id: "purchased_mvp_upgrades",
        label: "Upgrades purchased",
        current: 1,
        required: 3,
        prefix: "",
        complete: false,
      },
    ]);
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

describe("resource operations", () => {
  it("adds resources after validation and returns transaction metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 2,
    };
    const result = addResource(resources, {
      resourceId: MVP_IDS.resources.bugsFound,
      amount: 3,
      sourceSystem: "manual_testing",
      reason: "Manual Testing action",
      simulationTime: 12,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Add operation should succeed.");
    }

    expect(resources[MVP_IDS.resources.bugsFound]).toBe(2);
    expect(result.resources).toEqual({
      ...resources,
      [MVP_IDS.resources.bugsFound]: 5,
    });
    expect(result.transaction).toMatchObject({
      transactionId: "resource:add:manual_testing:Manual Testing action:12:bugs_found:3",
      operationType: "add",
      sourceSystem: "manual_testing",
      reason: "Manual Testing action",
      simulationTime: 12,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 2,
          newValue: 5,
          delta: 3,
        },
      ],
    });
    expect(result.events).toEqual([
      {
        id: "resource.changed",
        payload: result.transaction,
      },
    ]);
  });

  it("spends resources after validation and returns transaction metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: 10,
    };
    const result = spendResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 4,
      sourceSystem: "upgrades",
      reason: "Buy Better Checklist",
      simulationTime: 20,
      transactionId: "test-transaction-id",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Spend operation should succeed.");
    }

    expect(resources[MVP_IDS.resources.money]).toBe(10);
    expect(result.resources).toEqual({
      ...resources,
      [MVP_IDS.resources.money]: 6,
    });
    expect(result.transaction).toEqual({
      transactionId: "test-transaction-id",
      operationType: "spend",
      sourceSystem: "upgrades",
      reason: "Buy Better Checklist",
      simulationTime: 20,
      changes: [
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 10,
          newValue: 6,
          delta: -4,
        },
      ],
    });
    expect(result.events).toEqual([
      {
        id: "resource.changed",
        payload: result.transaction,
      },
    ]);
  });

  it("leaves resources unchanged and emits no events when an operation fails", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: 1,
    };
    const result = spendResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 2,
      sourceSystem: "upgrades",
      reason: "Insufficient funds",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Spend operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.resources[MVP_IDS.resources.money]).toBe(1);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "balance_below_minimum",
    );
    expect(result.events).toEqual([]);
  });

  it("converts one resource into another atomically with deterministic metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 7,
      [MVP_IDS.resources.money]: 3,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 4,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 8,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
      simulationTime: 70,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Convert operation should succeed.");
    }

    expect(resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 7,
      [MVP_IDS.resources.money]: 3,
    });
    expect(result.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 3,
      [MVP_IDS.resources.money]: 11,
    });
    expect(result.transaction).toEqual({
      transactionId:
        "resource:convert:bug_reporting:Report Bugs Found:70:bugs_found:-4,money:8",
      operationType: "convert",
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
      simulationTime: 70,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 7,
          newValue: 3,
          delta: -4,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 3,
          newValue: 11,
          delta: 8,
        },
      ],
    });
    expect(result.events).toEqual([
      { id: "resource.changed", payload: result.transaction },
    ]);
  });

  it("leaves both resources unchanged when a conversion would partially fail", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 5,
      [MVP_IDS.resources.money]: 1_000_000,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 5,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 1,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Convert operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 5,
      [MVP_IDS.resources.money]: 1_000_000,
    });
    expect(result.failures.map((failure) => failure.code)).toContain(
      "balance_above_maximum",
    );
    expect(result.events).toEqual([]);
  });

  it("rejects zero-amount conversions without mutating resources", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 5,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 0,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 0,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Convert operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.failures.map((failure) => failure.code)).toContain("invalid_amount");
    expect(result.events).toEqual([]);
  });
});

describe("gameplay action operations", () => {
  it("performs manual testing through a resource transaction", () => {
    const result = performManualTest(
      {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      },
      30,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Manual testing should succeed.");
    }

    expect(result.game.resources[MVP_IDS.resources.bugsFound]).toBe(2);
    expect(result.game.totalBugsFound).toBe(2);
    expect(result.events[0]?.payload).toMatchObject({
      operationType: "add",
      sourceSystem: "manual_testing",
    });
  });

  it("rejects manual testing when the resource cap would be exceeded", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 1_000_000,
      },
    };
    const result = performManualTest(game);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_above_maximum",
      );
    }
  });

  it("reports all bugs through one atomic convert transaction", () => {
    const result = reportAllBugs(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.bugsFound]: 5,
        },
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.bugReportTemplate]: 1,
        },
      },
      40,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Bug reporting should succeed.");
    }

    expect(result.game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 10,
    });
    expect(result.game.totalMoneyEarned).toBe(10);
    expect(result.events[0]?.payload).toMatchObject({
      operationType: "convert",
      sourceSystem: "bug_reporting",
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 5,
          newValue: 0,
          delta: -5,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 0,
          newValue: 10,
          delta: 10,
        },
      ],
    });
  });

  it("purchases upgrades through a resource spend transaction", () => {
    const result = purchaseUpgrade(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.money]: 10,
        },
      },
      MVP_IDS.upgrades.betterChecklist,
      50,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Upgrade purchase should succeed.");
    }

    expect(result.game.resources[MVP_IDS.resources.money]).toBe(0);
    expect(result.game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(1);
    expect(result.events[0]?.payload).toMatchObject({
      operationType: "spend",
      sourceSystem: "upgrades",
    });
  });

  it("leaves state unchanged when an upgrade purchase fails", () => {
    const result = purchaseUpgrade(initialState, MVP_IDS.upgrades.betterChecklist, 60);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(initialState);
    expect(result.events).toEqual([]);
  });
});
