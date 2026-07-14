import {
  careerStages,
  promotionDefinitions,
  unlockDefinitions,
  upgrades,
} from "../gameData";
import { MVP_IDS } from "../types";
import type {
  CareerStage,
  GameState,
  GameplayEventDescriptor,
  PromotionRequirementDefinition,
  PromotionRequirementSource,
  PromotionRequirementType,
  Upgrade,
} from "../types";
import { getControlledUiSurface } from "./unlocks";

const MVP_UPGRADE_ID_SET = new Set<string>(Object.values(MVP_IDS.upgrades));

export interface PromotionProgressItem {
  id: string;
  label: string;
  current: number;
  required: number;
  prefix: string;
  complete: boolean;
}

export interface PromotionRequirementStatus {
  id: string;
  type: PromotionRequirementType;
  source: PromotionRequirementSource;
  currentValue: number;
  requiredValue: number;
  passed: boolean;
}

export interface PromotionRequirementEvaluation {
  requirements: PromotionRequirementStatus[];
  allRequirementsPassed: boolean;
}

export interface PromotionAvailabilityTransitionResult {
  game: GameState;
  events: readonly GameplayEventDescriptor[];
}

export function getStageIndex(stage: CareerStage) {
  return careerStages.findIndex((careerStage) => careerStage.id === stage);
}

export function getPurchasedUpgradeCount(
  game: GameState,
  upgradeDefinitions: readonly Upgrade[] = upgrades,
) {
  return upgradeDefinitions.reduce<number>((count, upgrade) => {
    if (!MVP_UPGRADE_ID_SET.has(upgrade.id) || upgrade.visibility !== "active") {
      return count;
    }

    const ownedLevel =
      (game.upgrades as Partial<Record<string, number>>)[upgrade.id] ?? 0;

    return count + Math.min(Math.max(ownedLevel, 0), upgrade.maxLevel);
  }, 0);
}

function getLifetimeResourceRequirementValue(
  game: GameState,
  requirement: PromotionRequirementDefinition & {
    type: "lifetime_resource_at_least";
  },
) {
  if (requirement.source === "current_run_lifetime_bugs_found") {
    return game.totalBugsFound;
  }

  return game.totalMoneyEarned;
}

export function evaluatePromotionRequirements(
  game: GameState,
  requirements: readonly PromotionRequirementDefinition[],
): PromotionRequirementEvaluation {
  const purchasedUpgradeCount = getPurchasedUpgradeCount(game);
  const requirementStatuses = requirements.map<PromotionRequirementStatus>(
    (requirement) => {
      const currentValue =
        requirement.type === "purchased_upgrades_at_least"
          ? purchasedUpgradeCount
          : getLifetimeResourceRequirementValue(game, requirement);

      return {
        id: requirement.id,
        type: requirement.type,
        source: requirement.source,
        currentValue,
        requiredValue: requirement.amount,
        passed: currentValue >= requirement.amount,
      };
    },
  );

  return {
    requirements: requirementStatuses,
    allRequirementsPassed: requirementStatuses.every((requirement) => requirement.passed),
  };
}

function getPromotionRequirementLabel(source: PromotionRequirementSource) {
  if (source === "current_run_lifetime_bugs_found") {
    return "Lifetime bugs found";
  }

  if (source === "current_run_lifetime_money_earned") {
    return "Lifetime money earned";
  }

  return "Upgrades purchased";
}

function getPromotionRequirementPrefix(source: PromotionRequirementSource) {
  return source === "current_run_lifetime_money_earned" ? "$" : "";
}

export function getPromotionProgress(game: GameState): PromotionProgressItem[] {
  const promotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );

  if (!promotionDefinition) {
    return [];
  }

  return evaluatePromotionRequirements(
    game,
    promotionDefinition.requirements,
  ).requirements.map((requirement) => ({
    id: requirement.source,
    label: getPromotionRequirementLabel(requirement.source),
    current: requirement.currentValue,
    required: requirement.requiredValue,
    prefix: getPromotionRequirementPrefix(requirement.source),
    complete: requirement.passed,
  }));
}

export function getPromotionStage(game: GameState) {
  const promotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );
  const nextStage = careerStages.find(
    (careerStage) => careerStage.id === promotionDefinition?.toCareerStageId,
  );

  if (!promotionDefinition || !nextStage) {
    return null;
  }

  const requirementsMet = evaluatePromotionRequirements(
    game,
    promotionDefinition.requirements,
  ).allRequirementsPassed;

  if (!requirementsMet) {
    return null;
  }

  return nextStage;
}

function getPromotionUnlock(promotionId: string) {
  return unlockDefinitions.find(
    (unlock) => unlock.availabilityRequirement.promotionId === promotionId,
  );
}

export function evaluatePromotionAvailabilityTransition(
  game: GameState,
  simulationTime = Date.now(),
): PromotionAvailabilityTransitionResult {
  const promotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );
  const requirementEvaluation = promotionDefinition
    ? evaluatePromotionRequirements(game, promotionDefinition.requirements)
    : null;
  const targetCareerStageId = promotionDefinition?.toCareerStageId;
  const nextStage = requirementEvaluation?.allRequirementsPassed
    ? careerStages.find((careerStage) => careerStage.id === targetCareerStageId)
    : null;
  const promotionUnlock = getPromotionUnlock(
    promotionDefinition?.id ?? MVP_IDS.promotions.juniorToMiddle,
  );
  const promoteSurface = getControlledUiSurface(promotionUnlock?.id);

  if (!promotionDefinition || !promotionUnlock || !promoteSurface) {
    return {
      game: {
        ...game,
        promotion: {
          ...game.promotion,
          availablePromotionIds: [],
        },
        unlocks: promotionUnlock
          ? {
              ...game.unlocks,
              [promotionUnlock.id]: promotionUnlock.initialState,
            }
          : game.unlocks,
        uiSurfaces: promoteSurface
          ? {
              ...game.uiSurfaces,
              [promoteSurface.id]: "hidden",
            }
          : game.uiSurfaces,
      },
      events: [],
    };
  }

  if (!nextStage) {
    return {
      game: {
        ...game,
        promotion: {
          ...game.promotion,
          availablePromotionIds: [],
        },
        unlocks: {
          ...game.unlocks,
          [promotionUnlock.id]: promotionUnlock.initialState,
        },
        uiSurfaces: {
          ...game.uiSurfaces,
          [promoteSurface.id]: "hidden",
        },
      },
      events: [],
    };
  }

  const wasAlreadyAvailable = game.promotion.availablePromotionIds.includes(
    promotionDefinition.id,
  );
  const wasPromotionActionRevealed =
    game.unlocks[promotionUnlock.id] === promotionUnlock.availableState &&
    game.uiSurfaces[promoteSurface.id] === "active";
  const availablePromotionIds = game.promotion.availablePromotionIds.includes(
    promotionDefinition.id,
  )
    ? game.promotion.availablePromotionIds
    : [...game.promotion.availablePromotionIds, promotionDefinition.id];
  const events: GameplayEventDescriptor[] = [];

  if (!wasAlreadyAvailable) {
    events.push({
      id: "promotion.available",
      payload: {
        promotionId: promotionDefinition.id,
        fromCareerStageId: promotionDefinition.fromCareerStageId,
        toCareerStageId: promotionDefinition.toCareerStageId,
        simulationTime,
      },
    });
  }

  if (!wasPromotionActionRevealed) {
    events.push({
      id: "unlock.revealed",
      payload: {
        unlockId: promotionUnlock.id,
        targetSurfaceId: promoteSurface.id,
        previousUnlockState: promotionUnlock.initialState,
        currentUnlockState: promotionUnlock.availableState,
        simulationTime,
      },
    });
  }

  return {
    game: {
      ...game,
      promotion: {
        ...game.promotion,
        availablePromotionIds,
      },
      unlocks: {
        ...game.unlocks,
        [promotionUnlock.id]: promotionUnlock.availableState,
      },
      uiSurfaces: {
        ...game.uiSurfaces,
        [promoteSurface.id]: "active",
      },
    },
    events,
  };
}

export function evaluatePromotionAvailability(game: GameState): GameState {
  return evaluatePromotionAvailabilityTransition(game).game;
}

export function applyPromotionCompletion(
  evaluatedGame: GameState,
  completedPromotionId: string,
) {
  const promotionUnlock = getPromotionUnlock(completedPromotionId);
  const promoteSurface = getControlledUiSurface(promotionUnlock?.id);

  return {
    unlocks: promotionUnlock
      ? {
          ...evaluatedGame.unlocks,
          [promotionUnlock.id]: promotionUnlock.initialState,
        }
      : evaluatedGame.unlocks,
    uiSurfaces: promoteSurface
      ? {
          ...evaluatedGame.uiSurfaces,
          [promoteSurface.id]: "hidden",
        }
      : evaluatedGame.uiSurfaces,
  };
}
