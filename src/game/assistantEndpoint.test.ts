import { describe, expect, it } from "vitest";
import { createNewGameState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import {
  getAssistantProgressionStatus,
  getMvpEndpointStatus,
  isMvpEndpointComplete,
} from "./assistantEndpoint";

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
  it("exposes every endpoint condition without treating Middle QA promotion as completion", () => {
    const game = createNewGameState(0);
    game.careerStage = MVP_IDS.careerStages.middleQa;
    game.promotion.completedPromotionIds = [MVP_IDS.promotions.juniorToMiddle];

    expect(getMvpEndpointStatus(game)).toEqual({
      middleQaPromotionCompleted: true,
      assistantUnlocked: false,
      productionObservedAfterUnlock: false,
      endpointLevelTarget: 8,
      endpointLevelReached: false,
      firstMilestoneReached: false,
      postMilestoneProductionObserved: false,
      endpointConditionsSatisfied: false,
      endpointComplete: false,
    });
    expect(isMvpEndpointComplete(game)).toBe(false);
  });

  it("marks the endpoint pending until post-milestone production is observed", () => {
    const game = createMilestoneGame();

    expect(getAssistantProgressionStatus(game)).toEqual({
      firstMilestoneReached: true,
      capstoneReached: false,
      endpointLevelReached: true,
      endpointPendingPostMilestoneProduction: true,
      endpointConditionsSatisfied: false,
    });
    expect(getMvpEndpointStatus(game)).toMatchObject({
      endpointLevelTarget: 8,
      endpointLevelReached: true,
      firstMilestoneReached: true,
      postMilestoneProductionObserved: false,
      endpointConditionsSatisfied: false,
      endpointComplete: false,
    });
  });

  it("does not use Support ownership as an endpoint condition", () => {
    const game = createMilestoneGame();
    game.assistant.productionObservedAfterMilestone = true;
    game.endpointCompleted = true;

    expect(game.assistant.ownedSupportUpgradeIds).toEqual([]);
    expect(getMvpEndpointStatus(game)).toMatchObject({
      endpointConditionsSatisfied: true,
      endpointComplete: true,
    });
    expect(isMvpEndpointComplete(game)).toBe(true);
  });

  it("does not report completion from a persisted flag when endpoint conditions are invalid", () => {
    const game = createNewGameState(0);
    game.endpointCompleted = true;

    expect(getMvpEndpointStatus(game).endpointComplete).toBe(false);
    expect(isMvpEndpointComplete(game)).toBe(false);
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
