import { describe, expect, it } from "vitest";
import {
  gameplayStatDefinitions,
  MVP_RESOURCE_MAX,
  resourceDefinitions,
} from "./gameData";
import { MVP_IDS } from "./types";

describe("MVP resource registry", () => {
  it("defines exactly the MVP resources", () => {
    expect(resourceDefinitions.map((resource) => resource.id)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
  });

  it("defines Bugs Found as a spendable disposable resource", () => {
    const bugsFound = resourceDefinitions.find(
      (resource) => resource.id === MVP_IDS.resources.bugsFound,
    );

    expect(bugsFound).toMatchObject({
      displayName: "Bugs Found",
      lifetimeCategory: "disposable",
      producedBy: ["Manual Testing"],
      consumedBy: ["Bug Reporting"],
      initialValue: 0,
      minimumValue: 0,
      maximumValue: MVP_RESOURCE_MAX,
      isSpendable: true,
      isPersistent: true,
      visibleByDefault: true,
      resetBehavior: "reset",
      format: {
        style: "integer",
        maximumFractionDigits: 0,
      },
    });
  });

  it("defines Money as a spendable investment resource", () => {
    const money = resourceDefinitions.find(
      (resource) => resource.id === MVP_IDS.resources.money,
    );

    expect(money).toMatchObject({
      displayName: "Money",
      lifetimeCategory: "investment",
      producedBy: ["Bug Reporting"],
      consumedBy: ["Upgrades"],
      initialValue: 0,
      minimumValue: 0,
      maximumValue: MVP_RESOURCE_MAX,
      isSpendable: true,
      isPersistent: true,
      visibleByDefault: true,
      resetBehavior: "reset",
      format: {
        style: "integer",
        maximumFractionDigits: 0,
      },
    });
  });
});

describe("MVP gameplay stat registry", () => {
  it("defines exactly the MVP modifiable gameplay stats", () => {
    expect(gameplayStatDefinitions.map((stat) => stat.id)).toEqual([
      MVP_IDS.gameplayStats.manualBugsPerAction,
      MVP_IDS.gameplayStats.moneyPerBugReported,
    ]);
  });

  it("defines Manual Bugs Per Action with the MVP base value", () => {
    const manualBugsPerAction = gameplayStatDefinitions.find(
      (stat) => stat.id === MVP_IDS.gameplayStats.manualBugsPerAction,
    );

    expect(manualBugsPerAction).toMatchObject({
      displayName: "Manual Bugs Per Action",
      baseValue: 1,
      category: "manual_testing",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: true,
    });
  });

  it("defines Money Per Bug Reported with the MVP base value", () => {
    const moneyPerBugReported = gameplayStatDefinitions.find(
      (stat) => stat.id === MVP_IDS.gameplayStats.moneyPerBugReported,
    );

    expect(moneyPerBugReported).toMatchObject({
      displayName: "Money Per Bug Reported",
      baseValue: 1,
      category: "bug_reporting",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: true,
    });
  });

  it("keeps resource IDs out of the gameplay stat registry", () => {
    const statIds = new Set<string>(gameplayStatDefinitions.map((stat) => stat.id));

    expect(statIds.has(MVP_IDS.resources.bugsFound)).toBe(false);
    expect(statIds.has(MVP_IDS.resources.money)).toBe(false);
  });
});
