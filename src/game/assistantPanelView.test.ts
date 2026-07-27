import { describe, expect, it } from "vitest";
import { initialState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import { acceptPromotion } from "./commands";
import { getAssistantPanelView } from "./assistantPanelView";
import { evaluatePromotionAvailability } from "./promotions";

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
    throw new Error("Expected Assistant panel fixture to complete promotion.");
  }

  return result.game;
}

describe("Assistant panel view selector", () => {
  it("stays hidden until the Assistant is unlocked", () => {
    expect(getAssistantPanelView(initialState)).toBeNull();
  });

  it("supplies runtime-derived Buy 1 and Buy Max previews", () => {
    const view = getAssistantPanelView(buildPromotionCompletedGame(1_000));

    expect(view).not.toBeNull();
    expect(view?.level).toBe(0);
    expect(view?.maxLevel).toBe(25);
    expect(view?.currentProduction).toBe(0.8);
    expect(view?.buyOne).toMatchObject({
      canCommit: true,
      currentLevel: 0,
      resultingLevel: 1,
      levelsToBuy: 1,
      totalPrice: 200,
      beforeProduction: 0.8,
      afterProduction: 1,
    });
    expect(view?.buyMax.canCommit).toBe(true);
    expect(view?.buyMax.levelsToBuy).toBeGreaterThan(1);
    expect(view?.buyMax.totalPrice).toBeLessThanOrEqual(1_000);
  });

  it("includes crossed milestones and endpoint impact in Buy Max previews", () => {
    const view = getAssistantPanelView(buildPromotionCompletedGame(100_000));

    expect(view?.buyMax.crossedMilestoneLevels).toEqual([8, 25]);
    expect(view?.buyMax.resultingLevel).toBe(25);
    expect(view?.buyMax.endpointProgressImpact).toMatch(
      /passive production tick is still required/i,
    );
    expect(view?.buyMax.afterProduction).toBeGreaterThan(
      view?.buyMax.beforeProduction ?? 0,
    );
  });

  it("supplies explained unavailable states at zero funds and max level", () => {
    const unaffordable = getAssistantPanelView(buildPromotionCompletedGame());
    const maxLevel = getAssistantPanelView({
      ...buildPromotionCompletedGame(100_000),
      assistant: {
        ...buildPromotionCompletedGame(100_000).assistant,
        level: 25,
        reachedMilestoneIds: [
          "milestone_assistant_first",
          "milestone_assistant_capstone",
        ],
      },
    });

    expect(unaffordable?.buyOne).toMatchObject({
      canCommit: false,
      totalPrice: 200,
    });
    expect(unaffordable?.buyOne.reasonUnavailable).toMatch(/not affordable/i);
    expect(unaffordable?.buyMax).toMatchObject({
      canCommit: false,
      levelsToBuy: 0,
      totalPrice: null,
    });
    expect(maxLevel?.isMaxLevel).toBe(true);
    expect(maxLevel?.buyOne.reasonUnavailable).toMatch(/max level/i);
    expect(maxLevel?.buyMax.reasonUnavailable).toMatch(/max level/i);
  });
});
