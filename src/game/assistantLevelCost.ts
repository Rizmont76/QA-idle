import { MVP_IDS } from "../types";
import type { AssistantSupportUpgradeId, LevelUpgradeCostResolver } from "../types";
import { calculateAssistantModifierStats } from "./assistantModifiers";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

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
  const modifiedLevelCost = calculateAssistantModifierStats(
    {
      ownedSupportUpgradeIds,
      reachedMilestoneIds: [],
    },
    {
      bugsPerSecond: 0,
      futureLevelCost: baseLevelCost,
      offlineEfficiency: 0,
    },
  ).futureLevelCost.value;

  return Math.round(modifiedLevelCost);
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
