import { describe, expect, it } from "vitest";
import { createNewGameState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import { getAssistantProgressionStatus } from "./assistantEndpoint";

function createMilestoneGame(): GameState {
  const game = createNewGameState(0);

  return {
    ...game,
    careerStage: MVP_IDS.careerStages.middleQa,
    promotion: {
      ...game.promotion,
      completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
    },
    assistant: {
      ...game.assistant,
      unlocked: true,
      level: 8,
      reachedMilestoneIds: ["milestone_assistant_first"],
      productionObservedAfterUnlock: true,
    },
  };
}

describe("Assistant milestone and endpoint status", () => {
  it("marks the endpoint pending until post-milestone production is observed", () => {
    expect(getAssistantProgressionStatus(createMilestoneGame())).toEqual({
      firstMilestoneReached: true,
      capstoneReached: false,
      endpointLevelReached: true,
      endpointPendingPostMilestoneProduction: true,
      endpointConditionsSatisfied: false,
    });
  });

  it("does not use Support ownership as an endpoint condition", () => {
    const game = createMilestoneGame();
    game.assistant.productionObservedAfterMilestone = true;

    expect(game.assistant.ownedSupportUpgradeIds).toEqual([]);
    expect(getAssistantProgressionStatus(game).endpointConditionsSatisfied).toBe(true);
  });

  it("reports capstone separately without making it an endpoint requirement", () => {
    const game = createMilestoneGame();
    const statusBeforeCapstone = getAssistantProgressionStatus(game);
    game.assistant.level = 25;
    game.assistant.reachedMilestoneIds.push("milestone_assistant_capstone");
    const statusAtCapstone = getAssistantProgressionStatus(game);

    expect(statusBeforeCapstone.capstoneReached).toBe(false);
    expect(statusAtCapstone.capstoneReached).toBe(true);
    expect(statusBeforeCapstone.endpointPendingPostMilestoneProduction).toBe(true);
    expect(statusAtCapstone.endpointPendingPostMilestoneProduction).toBe(true);
  });
});
