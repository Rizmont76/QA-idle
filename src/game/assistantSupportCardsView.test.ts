import { describe, expect, it } from "vitest";
import { initialState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import { acceptPromotion } from "./commands";
import { evaluatePromotionAvailability } from "./promotions";
import { getAssistantSupportCardViews } from "./assistantSupportCardsView";

function buildPromotionCompletedGame(money = 0): GameState {
  const promotionReady = evaluatePromotionAvailability({
    ...initialState,
    resources: {
      ...initialState.resources,
      [MVP_IDS.resources.money]: money,
    },
    totalBugsFound: 100,
    totalMoneyEarned: 150,
    upgrades: {
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      [MVP_IDS.upgrades.coffee]: 1,
      [MVP_IDS.upgrades.keyboardShortcuts]: 1,
    },
  });
  const result = acceptPromotion(promotionReady, 100);

  if (!result.ok) {
    throw new Error("Expected Support card fixture to complete promotion.");
  }

  return result.game;
}

describe("Assistant Support card view selector", () => {
  it("stays hidden until the Assistant is unlocked", () => {
    expect(getAssistantSupportCardViews(initialState)).toEqual([]);
  });

  it("returns exactly three staged Support cards in canonical order", () => {
    const views = getAssistantSupportCardViews(buildPromotionCompletedGame(1_000));

    expect(views.map(({ id }) => id)).toEqual([
      "support_immediate_production",
      "support_training_economics",
      "support_offline_handover",
    ]);
    expect(views.map(({ unlocked }) => unlocked)).toEqual([true, false, false]);
    expect(views[1]?.reasonUnavailable).toBe("Unlocks at Assistant level 2.");
    expect(views[2]?.reasonUnavailable).toBe("Unlocks at Assistant level 5.");
  });

  it("derives affordability, ownership, and before/after projections", () => {
    const game = {
      ...buildPromotionCompletedGame(130),
      assistant: {
        ...buildPromotionCompletedGame(130).assistant,
        level: 5,
        availableSupportUpgradeIds: [
          "support_immediate_production",
          "support_training_economics",
          "support_offline_handover",
        ],
        ownedSupportUpgradeIds: ["support_immediate_production"],
      },
    } satisfies GameState;
    const [immediate, training, offline] = getAssistantSupportCardViews(game);

    expect(immediate).toMatchObject({
      owned: true,
      affordable: null,
      canCommit: false,
    });
    expect(immediate?.preview).toMatchObject({
      kind: "production",
      before: 2.02,
      after: 2.02,
    });
    expect(training).toMatchObject({
      unlocked: true,
      owned: false,
      affordable: false,
      canCommit: false,
    });
    expect(training?.preview).toMatchObject({
      kind: "future_level_cost",
      before: 435,
      after: 331,
      multiplier: 0.76,
    });
    expect(offline).toMatchObject({
      unlocked: true,
      owned: false,
      affordable: false,
      canCommit: false,
    });
    expect(offline?.preview).toEqual({
      kind: "offline_efficiency",
      before: 0.35,
      after: 0.62,
      unit: "ratio",
    });
  });
});
