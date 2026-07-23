import { assistantLevelUpgrade, BUG_VALUE, promotionDefinitions } from "../gameData";
import { MVP_IDS } from "../types";
import type {
  GameState,
  GameplayEventDescriptor,
  LevelUpgradePurchaseMode,
  ResourceTransactionValidationFailure,
  Upgrade,
} from "../types";
import {
  addResource,
  buildResourceFailure,
  convertResources,
  spendResource,
} from "./resources";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";
import { resolveAssistantNextLevelCost } from "./assistantLevelCost";
import { assistantMilestoneDefinitions } from "./assistantProgression";
import { getAssistantProgressionStatus } from "./assistantEndpoint";
import { FixedPoint } from "./fixedPoint";
import {
  getNextLevelUpgradeEligibility,
  planFiniteLevelUpgradePurchase,
} from "./levelUpgrades";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";
import { getDerivedStats } from "./stats";
import {
  applyPromotionCompletion,
  evaluatePromotionAvailabilityTransition,
  getPromotionStage,
} from "./promotions";
import { dispatchGameplayEvents, type GameplayEventListener } from "./events";
import { validateUpgradePurchase } from "./upgrades";

export type GameplayActionResult =
  | {
      ok: true;
      game: GameState;
      events: readonly GameplayEventDescriptor[];
    }
  | {
      ok: false;
      game: GameState;
      failures: readonly ResourceTransactionValidationFailure[];
      events: readonly [];
    };

function buildGameplayFailure(
  message: string,
): readonly ResourceTransactionValidationFailure[] {
  return [
    {
      code: "operation_not_allowed",
      message,
    },
  ];
}

export function advanceOnlineAssistantProduction(
  game: GameState,
  elapsedSeconds: number,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure(
        "Online Assistant production requires finite non-negative elapsed seconds.",
      ),
      events: [],
    };
  }

  if (!game.assistant.unlocked || elapsedSeconds === 0) {
    return { ok: true, game, events: [] };
  }

  const decimalPlaces =
    activeRuntimeCandidateParameters.formatting.numericScaleDecimalPlaces;
  const bugsPerSecond = calculateAssistantBugsPerSecond({
    level: game.assistant.level,
    ownedSupportUpgradeIds: game.assistant.ownedSupportUpgradeIds,
    reachedMilestoneIds: game.assistant.reachedMilestoneIds,
  });
  const bugsFound = FixedPoint.fromNumber(bugsPerSecond, decimalPlaces)
    .multiply(FixedPoint.fromNumber(elapsedSeconds, decimalPlaces))
    .toNumber();

  if (bugsFound === 0) {
    return { ok: true, game, events: [] };
  }

  const currentBugsFound = game.resources[MVP_IDS.resources.bugsFound];
  const nextBugsFound = FixedPoint.fromNumber(currentBugsFound, decimalPlaces)
    .add(FixedPoint.fromNumber(bugsFound, decimalPlaces))
    .toNumber();
  const result = addResource(game.resources, {
    resourceId: MVP_IDS.resources.bugsFound,
    amount: nextBugsFound - currentBugsFound,
    sourceSystem: "assistant_production",
    reason: "Online Assistant passive production",
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }

  const productionObservedAfterMilestone =
    game.assistant.productionObservedAfterMilestone ||
    game.assistant.reachedMilestoneIds.includes("milestone_assistant_first");
  const gameAfterProduction: GameState = {
    ...game,
    resources: result.resources,
    totalBugsFound: FixedPoint.fromNumber(game.totalBugsFound, decimalPlaces)
      .add(FixedPoint.fromNumber(bugsFound, decimalPlaces))
      .toNumber(),
    lastPlayedAt: simulationTime,
    assistant: {
      ...game.assistant,
      productionObservedAfterUnlock: true,
      productionObservedAfterMilestone,
    },
  };
  const endpointCompleted =
    game.endpointCompleted ||
    getAssistantProgressionStatus(gameAfterProduction).endpointConditionsSatisfied;
  const endpointCompletedNow = endpointCompleted && !game.endpointCompleted;
  const events = dispatchGameplayEvents(
    [
      ...result.events,
      {
        id: MVP_IDS.events.assistantProductionCommitted,
        payload: {
          assistantId: MVP_IDS.assistants.juniorQa,
          bugsFound,
          elapsedSeconds,
          productionObservedAfterMilestone,
          simulationTime,
        },
      },
      ...(endpointCompletedNow
        ? [
            {
              id: MVP_IDS.events.endpointCompleted,
              payload: {
                assistantId: MVP_IDS.assistants.juniorQa,
                assistantLevel: gameAfterProduction.assistant.level,
                simulationTime,
              },
            } as const,
          ]
        : []),
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: {
      ...gameAfterProduction,
      endpointCompleted,
    },
    events,
  };
}

export function acceptPromotion(
  game: GameState,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  const evaluatedGame = evaluatePromotionAvailabilityTransition(
    game,
    simulationTime,
  ).game;
  const promotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );
  const nextStage = getPromotionStage(evaluatedGame);

  if (
    !promotionDefinition ||
    !nextStage ||
    !evaluatedGame.promotion.availablePromotionIds.includes(promotionDefinition.id) ||
    evaluatedGame.promotion.completedPromotionIds.includes(promotionDefinition.id)
  ) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure("Promotion requirements are not met."),
      events: [],
    };
  }

  const completedPromotionId = promotionDefinition.outcome.completedPromotionId;
  const completedPromotionIds = evaluatedGame.promotion.completedPromotionIds.includes(
    completedPromotionId,
  )
    ? evaluatedGame.promotion.completedPromotionIds
    : [...evaluatedGame.promotion.completedPromotionIds, completedPromotionId];
  const completionVisibility = applyPromotionCompletion(
    evaluatedGame,
    completedPromotionId,
  );

  const events = dispatchGameplayEvents(
    [
      {
        id: "promotion.completed",
        payload: {
          promotionId: completedPromotionId,
          fromCareerStageId: promotionDefinition.fromCareerStageId,
          toCareerStageId: promotionDefinition.outcome.setCurrentStageId,
          simulationTime,
        },
      },
      {
        id: "career.stageChanged",
        payload: {
          promotionId: completedPromotionId,
          previousCareerStageId: promotionDefinition.fromCareerStageId,
          currentCareerStageId: promotionDefinition.outcome.setCurrentStageId,
          simulationTime,
        },
      },
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: {
      ...evaluatedGame,
      careerStage: promotionDefinition.outcome.setCurrentStageId,
      lastPlayedAt: simulationTime,
      promotion: {
        availablePromotionIds: [],
        completedPromotionIds,
      },
      unlocks: completionVisibility.unlocks,
      uiSurfaces: completionVisibility.uiSurfaces,
    },
    events,
  };
}

export function performManualTest(
  game: GameState,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  const stats = getDerivedStats(game);
  const bugsFound = stats.bugsPerClick;
  const result = addResource(game.resources, {
    resourceId: MVP_IDS.resources.bugsFound,
    amount: bugsFound,
    sourceSystem: "manual_testing",
    reason: "Manual Testing action",
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }
  const availabilityTransition = evaluatePromotionAvailabilityTransition(
    {
      ...game,
      resources: result.resources,
      totalBugsFound: game.totalBugsFound + bugsFound,
      lastPlayedAt: simulationTime,
    },
    simulationTime,
  );
  const nextGame = availabilityTransition.game;

  const events = dispatchGameplayEvents(
    [
      {
        id: "manualTest.performed",
        payload: {
          actionId: MVP_IDS.actions.manualTest,
          bugsFound,
          simulationTime,
        },
      },
      ...result.events,
      {
        id: "bugs.found",
        payload: {
          resourceId: MVP_IDS.resources.bugsFound,
          amount: bugsFound,
          totalBugsFound: game.totalBugsFound + bugsFound,
          simulationTime,
        },
      },
      ...availabilityTransition.events,
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: nextGame,
    events,
  };
}

export function reportAllBugs(
  game: GameState,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  const stats = getDerivedStats(game);
  const reportedBugs = game.resources[MVP_IDS.resources.bugsFound];

  if (reportedBugs <= 0) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure("Bug Reporting requires at least one bug."),
      events: [],
    };
  }

  const earnedMoney = reportedBugs * BUG_VALUE * stats.moneyPerBug;
  const result = convertResources(game.resources, {
    fromResourceId: MVP_IDS.resources.bugsFound,
    fromAmount: reportedBugs,
    toResourceId: MVP_IDS.resources.money,
    toAmount: earnedMoney,
    sourceSystem: "bug_reporting",
    reason: "Report all Bugs Found",
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }
  const availabilityTransition = evaluatePromotionAvailabilityTransition(
    {
      ...game,
      resources: result.resources,
      totalMoneyEarned: game.totalMoneyEarned + earnedMoney,
      lastPlayedAt: simulationTime,
    },
    simulationTime,
  );
  const nextGame = availabilityTransition.game;

  const events = dispatchGameplayEvents(
    [
      {
        id: "bugReport.submitted",
        payload: {
          actionId: MVP_IDS.actions.reportBugs,
          reportedBugs,
          earnedMoney,
          simulationTime,
        },
      },
      ...result.events,
      {
        id: "money.earned",
        payload: {
          resourceId: MVP_IDS.resources.money,
          amount: earnedMoney,
          totalMoneyEarned: game.totalMoneyEarned + earnedMoney,
          simulationTime,
        },
      },
      ...availabilityTransition.events,
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: nextGame,
    events,
  };
}

function purchaseAssistantLevels(
  game: GameState,
  purchaseMode: LevelUpgradePurchaseMode,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  const eligibility = getNextLevelUpgradeEligibility(
    game,
    assistantLevelUpgrade,
    resolveAssistantNextLevelCost,
  );

  if (!eligibility.eligible) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure(eligibility.message),
      events: [],
    };
  }

  const plan = planFiniteLevelUpgradePurchase(
    game,
    assistantLevelUpgrade,
    purchaseMode,
    resolveAssistantNextLevelCost,
  );

  if (!plan) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure("Assistant level purchase could not be planned."),
      events: [],
    };
  }

  const result = spendResource(game.resources, {
    resourceId: plan.totalCost.resourceId,
    amount: plan.totalCost.amount,
    sourceSystem: "assistant",
    reason:
      purchaseMode === "buy_1"
        ? "Buy 1 Junior QA Assistant level"
        : "Buy Max Junior QA Assistant levels",
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }

  const crossedMilestones = plan.crossedMilestoneLevels.map((milestoneLevel) => {
    const milestone = assistantMilestoneDefinitions.find(
      (definition) => definition.level === milestoneLevel,
    );

    if (!milestone) {
      throw new Error(
        `Missing Assistant milestone definition at level ${String(milestoneLevel)}.`,
      );
    }

    return milestone;
  });
  const reachedMilestoneIds = [
    ...game.assistant.reachedMilestoneIds,
    ...crossedMilestones
      .map((milestone) => milestone.id)
      .filter((milestoneId) => !game.assistant.reachedMilestoneIds.includes(milestoneId)),
  ];
  const nextGame: GameState = {
    ...game,
    resources: result.resources,
    lastPlayedAt: simulationTime,
    assistant: {
      ...game.assistant,
      level: plan.targetLevel,
      reachedMilestoneIds,
    },
  };
  const events = dispatchGameplayEvents(
    [
      ...result.events,
      {
        id: MVP_IDS.events.assistantLevelPurchased,
        payload: {
          assistantId: MVP_IDS.assistants.juniorQa,
          upgradeId: MVP_IDS.upgrades.assistantLevels,
          purchaseMode,
          levelsPurchased: plan.levelsPurchased,
          previousLevel: plan.currentLevel,
          newLevel: plan.targetLevel,
          cost: plan.totalCost,
          simulationTime,
        },
      },
      ...crossedMilestones.map(
        (milestone) =>
          ({
            id: MVP_IDS.events.assistantMilestoneReached,
            payload: {
              assistantId: MVP_IDS.assistants.juniorQa,
              milestoneId: milestone.id,
              milestoneLevel: milestone.level,
              previousLevel: plan.currentLevel,
              newLevel: plan.targetLevel,
              simulationTime,
            },
          }) as const,
      ),
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: nextGame,
    events,
  };
}

export function purchaseAssistantLevel(
  game: GameState,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  return purchaseAssistantLevels(game, "buy_1", simulationTime, eventListeners);
}

export function purchaseMaxAssistantLevels(
  game: GameState,
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  return purchaseAssistantLevels(game, "buy_max", simulationTime, eventListeners);
}

export function purchaseUpgrade(
  game: GameState,
  upgradeId: Upgrade["id"],
  simulationTime = Date.now(),
  eventListeners: readonly GameplayEventListener[] = [],
): GameplayActionResult {
  const validation = validateUpgradePurchase(game, upgradeId);

  if (!validation.ok) {
    return {
      ok: false,
      game,
      failures: validation.failures.map((failure) =>
        buildResourceFailure({
          code: "operation_not_allowed",
          message: failure.message,
        }),
      ),
      events: [],
    };
  }

  const { effects, upgrade, resolvedCost } = validation;
  const previousLevel = game.upgrades[upgrade.id] ?? 0;
  const newLevel = 1 as const;

  const result = spendResource(game.resources, {
    resourceId: resolvedCost.resourceId,
    amount: resolvedCost.amount,
    sourceSystem: "upgrade_system",
    reason: `Buy ${upgrade.name}`,
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }
  const availabilityTransition = evaluatePromotionAvailabilityTransition(
    {
      ...game,
      resources: result.resources,
      lastPlayedAt: simulationTime,
      upgrades: {
        ...game.upgrades,
        [upgrade.id]: 1,
      },
    },
    simulationTime,
  );
  const nextGame = availabilityTransition.game;

  const events = dispatchGameplayEvents(
    [
      ...result.events,
      {
        id: "upgrade.purchased",
        payload: {
          upgradeId: upgrade.id,
          previousLevel,
          newLevel,
          cost: resolvedCost,
          modifierDefinitionIds: effects.map((effect) => effect.modifier.definitionId),
          simulationTime,
        },
      },
      ...availabilityTransition.events,
    ],
    eventListeners,
  ).events;

  return {
    ok: true,
    game: nextGame,
    events,
  };
}
