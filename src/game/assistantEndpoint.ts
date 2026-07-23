import { MVP_IDS, type GameState } from "../types";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export interface AssistantProgressionStatus {
  firstMilestoneReached: boolean;
  capstoneReached: boolean;
  endpointLevelReached: boolean;
  endpointPendingPostMilestoneProduction: boolean;
  endpointConditionsSatisfied: boolean;
}

export function getAssistantProgressionStatus(
  game: GameState,
): AssistantProgressionStatus {
  const firstMilestoneReached = game.assistant.reachedMilestoneIds.includes(
    "milestone_assistant_first",
  );
  const capstoneReached = game.assistant.reachedMilestoneIds.includes(
    "milestone_assistant_capstone",
  );
  const endpointLevelReached =
    game.assistant.level >=
    activeRuntimeCandidateParameters.endpoint.assistantLevelTarget;
  const baseEndpointConditionsSatisfied =
    game.careerStage === MVP_IDS.careerStages.middleQa &&
    game.promotion.completedPromotionIds.includes(MVP_IDS.promotions.juniorToMiddle) &&
    game.assistant.unlocked &&
    game.assistant.productionObservedAfterUnlock &&
    endpointLevelReached &&
    firstMilestoneReached;

  return {
    firstMilestoneReached,
    capstoneReached,
    endpointLevelReached,
    endpointPendingPostMilestoneProduction:
      baseEndpointConditionsSatisfied && !game.assistant.productionObservedAfterMilestone,
    endpointConditionsSatisfied:
      baseEndpointConditionsSatisfied && game.assistant.productionObservedAfterMilestone,
  };
}
