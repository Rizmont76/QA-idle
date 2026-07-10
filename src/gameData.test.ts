import { describe, expect, it } from "vitest";
import { MVP_RESOURCE_MAX, resourceDefinitions } from "./gameData";
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
