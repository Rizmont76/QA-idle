import { MVP_IDS } from "../types";
import type { AssistantSupportUpgradeId, LevelUpgradeCostResolver } from "../types";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

const TRAINING_SUPPORT_ID: AssistantSupportUpgradeId = "support_training_economics";

export interface AssistantNextLevelCostInput {
  readonly currentLevel: number;
  readonly ownedSupportUpgradeIds: readonly AssistantSupportUpgradeId[];
}

/**
 * Calculates the next Assistant level price from the active balance candidate.
 * A null result means the Assistant is already at its finite level cap.
 */
export function calculateAssistantNextLevelCost({
  currentLevel,
  ownedSupportUpgradeIds,
}: AssistantNextLevelCostInput): number | null {
  const { maxLevel, cost } = activeRuntimeCandidateParameters.assistant;

  if (!Number.isInteger(currentLevel) || currentLevel < 0) {
    throw new Error("Assistant level must be a non-negative integer.");
  }

  if (currentLevel >= maxLevel) {
    return null;
  }

  const nextLevel = currentLevel + 1;
  const baseLevelCost =
    cost.baseCost * cost.growth ** (nextLevel - 1) + cost.linearCost * (nextLevel - 1);
  const discountMultiplier = ownedSupportUpgradeIds.includes(TRAINING_SUPPORT_ID)
    ? cost.trainingSupportCostMultiplier
    : 1;

  return Math.round(baseLevelCost * discountMultiplier);
}

export const resolveAssistantNextLevelCost: LevelUpgradeCostResolver = ({
  currentLevel,
  game,
}) => {
  const amount = calculateAssistantNextLevelCost({
    currentLevel,
    ownedSupportUpgradeIds: game.assistant.ownedSupportUpgradeIds,
  });

  return amount === null
    ? null
    : {
        resourceId: MVP_IDS.resources.money,
        amount,
      };
};
