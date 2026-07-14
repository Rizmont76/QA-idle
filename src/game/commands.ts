import { BUG_VALUE, promotionDefinitions } from "../gameData";
import { MVP_IDS } from "../types";
import type {
  GameState,
  GameplayEventDescriptor,
  ResourceTransactionValidationFailure,
  Upgrade,
} from "../types";
import {
  addResource,
  buildResourceFailure,
  convertResources,
  spendResource,
} from "./resources";
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
