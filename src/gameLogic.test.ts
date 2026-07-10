import { describe, expect, it } from "vitest";
import { initialState, upgrades } from "./gameData";
import {
  formatNumber,
  getDerivedStats,
  getPromotionStage,
  getUpgradeCost,
} from "./gameLogic";
import { MVP_IDS } from "./types";

describe("game logic", () => {
  it("scales upgrade costs by owned level", () => {
    const checklist = upgrades.find(
      (upgrade) => upgrade.id === MVP_IDS.upgrades.betterChecklist,
    );

    if (!checklist) {
      throw new Error("Checklist upgrade is missing.");
    }

    expect(getUpgradeCost(checklist, 0)).toBe(12);
    expect(getUpgradeCost(checklist, 2)).toBe(23);
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
          [MVP_IDS.upgrades.betterChecklist]: 2,
          [MVP_IDS.upgrades.coffee]: 1,
        },
      }),
    ).toEqual({
      bugsPerClick: 6,
      moneyPerBug: 1,
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
          [MVP_IDS.upgrades.betterChecklist]: 2,
          [MVP_IDS.upgrades.coffee]: 1,
        },
      })?.id,
    ).toBe(MVP_IDS.careerStages.middleQa);
  });

  it("does not promote before requirements are met", () => {
    expect(getPromotionStage(initialState)).toBeNull();
  });
});
