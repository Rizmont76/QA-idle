import { assistantLevelUpgrade } from "../gameData";
import type { AssistantMilestoneId, GameState } from "../types";
import { getMvpEndpointStatus } from "./assistantEndpoint";
import { resolveAssistantNextLevelCost } from "./assistantLevelCost";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";
import { assistantMilestoneDefinitions } from "./assistantProgression";
import {
  getNextLevelUpgradeEligibility,
  planFiniteLevelUpgradePurchase,
} from "./levelUpgrades";

export interface AssistantPurchasePreview {
  readonly canCommit: boolean;
  readonly reasonUnavailable: string | null;
  readonly currentLevel: number;
  readonly resultingLevel: number;
  readonly levelsToBuy: number;
  readonly totalPrice: number | null;
  readonly beforeProduction: number;
  readonly afterProduction: number;
  readonly crossedMilestoneLevels: readonly number[];
  readonly endpointProgressImpact: string | null;
}

export interface AssistantPanelView {
  readonly level: number;
  readonly maxLevel: number;
  readonly currentProduction: number;
  readonly isMaxLevel: boolean;
  readonly buyOne: AssistantPurchasePreview;
  readonly buyMax: AssistantPurchasePreview;
  readonly endpoint: ReturnType<typeof getMvpEndpointStatus>;
}

function getProductionAtLevel(
  game: GameState,
  level: number,
  crossedMilestoneLevels: readonly number[],
) {
  const crossedMilestoneIds = assistantMilestoneDefinitions
    .filter((milestone) => crossedMilestoneLevels.includes(milestone.level))
    .map((milestone) => milestone.id);
  const reachedMilestoneIds = [
    ...game.assistant.reachedMilestoneIds,
    ...crossedMilestoneIds.filter(
      (milestoneId) => !game.assistant.reachedMilestoneIds.includes(milestoneId),
    ),
  ] satisfies AssistantMilestoneId[];

  return calculateAssistantBugsPerSecond({
    level,
    ownedSupportUpgradeIds: game.assistant.ownedSupportUpgradeIds,
    reachedMilestoneIds,
  });
}

function getEndpointImpact(
  currentLevel: number,
  resultingLevel: number,
  endpointLevelTarget: number,
) {
  if (currentLevel < endpointLevelTarget && resultingLevel >= endpointLevelTarget) {
    return "Reaches the MVP endpoint level; one passive production tick is still required.";
  }

  return null;
}

export function getAssistantPanelView(game: GameState): AssistantPanelView | null {
  if (!game.assistant.unlocked) {
    return null;
  }

  const endpoint = getMvpEndpointStatus(game);
  const currentLevel = game.assistant.level;
  const currentProduction = getProductionAtLevel(game, currentLevel, []);
  const nextEligibility = getNextLevelUpgradeEligibility(
    game,
    assistantLevelUpgrade,
    resolveAssistantNextLevelCost,
  );
  const nextLevel = nextEligibility.nextLevel ?? currentLevel;
  const buyOneCrossedMilestones = assistantLevelUpgrade.milestoneLevels.filter(
    (level) => level > currentLevel && level <= nextLevel,
  );
  const buyOneCost = nextEligibility.resolvedCost?.amount ?? null;
  const nextUnavailableReason = nextEligibility.eligible ? null : nextEligibility.message;
  const buyOne: AssistantPurchasePreview = {
    canCommit: nextEligibility.eligible,
    reasonUnavailable: nextUnavailableReason,
    currentLevel,
    resultingLevel: nextLevel,
    levelsToBuy: nextLevel > currentLevel ? 1 : 0,
    totalPrice: buyOneCost,
    beforeProduction: currentProduction,
    afterProduction:
      nextLevel > currentLevel
        ? getProductionAtLevel(game, nextLevel, buyOneCrossedMilestones)
        : currentProduction,
    crossedMilestoneLevels: buyOneCrossedMilestones,
    endpointProgressImpact: getEndpointImpact(
      currentLevel,
      nextLevel,
      endpoint.endpointLevelTarget,
    ),
  };

  const buyMaxPlan = planFiniteLevelUpgradePurchase(
    game,
    assistantLevelUpgrade,
    "buy_max",
    resolveAssistantNextLevelCost,
  );
  const buyMaxLevel = buyMaxPlan?.targetLevel ?? currentLevel;
  const buyMaxCrossedMilestones = buyMaxPlan?.crossedMilestoneLevels ?? [];
  const buyMax: AssistantPurchasePreview = {
    canCommit: buyMaxPlan !== null,
    reasonUnavailable: buyMaxPlan === null ? nextUnavailableReason : null,
    currentLevel,
    resultingLevel: buyMaxLevel,
    levelsToBuy: buyMaxPlan?.levelsPurchased ?? 0,
    totalPrice: buyMaxPlan?.totalCost.amount ?? null,
    beforeProduction: currentProduction,
    afterProduction:
      buyMaxPlan === null
        ? currentProduction
        : getProductionAtLevel(game, buyMaxLevel, buyMaxCrossedMilestones),
    crossedMilestoneLevels: buyMaxCrossedMilestones,
    endpointProgressImpact: getEndpointImpact(
      currentLevel,
      buyMaxLevel,
      endpoint.endpointLevelTarget,
    ),
  };

  return {
    level: currentLevel,
    maxLevel: assistantLevelUpgrade.maxLevel,
    currentProduction,
    isMaxLevel: currentLevel >= assistantLevelUpgrade.maxLevel,
    buyOne,
    buyMax,
    endpoint,
  };
}
