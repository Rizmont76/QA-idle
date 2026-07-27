import { MVP_IDS, type GameState } from "../types";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export interface AssistantProgressionStatus {
  firstMilestoneReached: boolean;
  capstoneReached: boolean;
  endpointLevelReached: boolean;
  endpointPendingPostMilestoneProduction: boolean;
  endpointConditionsSatisfied: boolean;
}

export interface MvpEndpointStatus {
  middleQaPromotionCompleted: boolean;
  assistantUnlocked: boolean;
  productionObservedAfterUnlock: boolean;
  endpointLevelTarget: number;
  endpointLevelReached: boolean;
  firstMilestoneReached: boolean;
  postMilestoneProductionObserved: boolean;
  endpointConditionsSatisfied: boolean;
  endpointComplete: boolean;
}

export function getMvpEndpointStatus(game: GameState): MvpEndpointStatus {
  const middleQaPromotionCompleted =
    game.careerStage === MVP_IDS.careerStages.middleQa &&
    game.promotion.completedPromotionIds.includes(MVP_IDS.promotions.juniorToMiddle);
  const endpointLevelTarget =
    activeRuntimeCandidateParameters.endpoint.assistantLevelTarget;
  const endpointLevelReached = game.assistant.level >= endpointLevelTarget;
  const firstMilestoneReached = game.assistant.reachedMilestoneIds.includes(
    "milestone_assistant_first",
  );
  const endpointConditionsSatisfied =
    middleQaPromotionCompleted &&
    game.assistant.unlocked &&
    game.assistant.productionObservedAfterUnlock &&
    endpointLevelReached &&
    firstMilestoneReached &&
    game.assistant.productionObservedAfterMilestone;

  return {
    middleQaPromotionCompleted,
    assistantUnlocked: game.assistant.unlocked,
    productionObservedAfterUnlock: game.assistant.productionObservedAfterUnlock,
    endpointLevelTarget,
    endpointLevelReached,
    firstMilestoneReached,
    postMilestoneProductionObserved: game.assistant.productionObservedAfterMilestone,
    endpointConditionsSatisfied,
    endpointComplete: game.endpointCompleted && endpointConditionsSatisfied,
  };
}

export function isMvpEndpointComplete(game: GameState): boolean {
  return getMvpEndpointStatus(game).endpointComplete;
}

export function getAssistantProgressionStatus(
  game: GameState,
): AssistantProgressionStatus {
  const endpointStatus = getMvpEndpointStatus(game);
  const capstoneReached = game.assistant.reachedMilestoneIds.includes(
    "milestone_assistant_capstone",
  );

  return {
    firstMilestoneReached: endpointStatus.firstMilestoneReached,
    capstoneReached,
    endpointLevelReached: endpointStatus.endpointLevelReached,
    endpointPendingPostMilestoneProduction:
      endpointStatus.middleQaPromotionCompleted &&
      endpointStatus.assistantUnlocked &&
      endpointStatus.productionObservedAfterUnlock &&
      endpointStatus.endpointLevelReached &&
      endpointStatus.firstMilestoneReached &&
      !endpointStatus.postMilestoneProductionObserved,
    endpointConditionsSatisfied: endpointStatus.endpointConditionsSatisfied,
  };
}
