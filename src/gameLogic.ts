import {
  BUG_VALUE,
  careerStages,
  promotionDefinitions,
  PROMOTION_REQUIRED_BUGS,
  PROMOTION_REQUIRED_MONEY,
  PROMOTION_REQUIRED_UPGRADES,
  resourceDefinitions,
  upgrades,
} from "./gameData";
import type { CareerStage, DerivedStats, GameState, Upgrade } from "./types";
import { MVP_IDS } from "./types";
import type {
  ResourceChangedEventDescriptor,
  ResourceConversionRequest,
  ResourceDefinition,
  ResourceId,
  ResourceOperationRequest,
  ResourceOperationResult,
  ResourceState,
  ResourceTransactionMetadata,
  ResourceTransactionOperationType,
  ResourceTransactionProjectedChange,
  ResourceTransactionValidationFailure,
  ResourceTransactionValidationRequest,
  ResourceTransactionValidationResult,
} from "./types";

const COMPACT_NUMBER_INTEGER_THRESHOLD = 100;
const RESOURCE_TRANSACTION_OPERATION_TYPES = new Set<ResourceTransactionOperationType>([
  "add",
  "spend",
  "convert",
  "set",
  "reset",
]);

interface ResourceTransactionContext {
  sourceSystem: string;
  reason: string;
  simulationTime?: number;
  transactionId?: string;
}

type ResourceTransactionChangeList = ResourceTransactionValidationRequest["changes"];

export type GameplayActionResult =
  | {
      ok: true;
      game: GameState;
      events: readonly ResourceChangedEventDescriptor[];
    }
  | {
      ok: false;
      game: GameState;
      failures: readonly ResourceTransactionValidationFailure[];
      events: readonly [];
    };

export interface PromotionProgressItem {
  id: string;
  label: string;
  current: number;
  required: number;
  prefix: string;
  complete: boolean;
}

function getResourceDefinition(
  resourceId: ResourceId,
  definitions: readonly ResourceDefinition[],
): ResourceDefinition | undefined {
  return definitions.find((resource) => resource.id === resourceId);
}

function buildResourceFailure(
  failure: ResourceTransactionValidationFailure,
): ResourceTransactionValidationFailure {
  return failure;
}

export function getUpgradeCost(upgrade: Upgrade) {
  return upgrade.cost.amount;
}

export function validateResourceTransaction(
  resources: GameState["resources"],
  request: ResourceTransactionValidationRequest,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceTransactionValidationResult {
  const failures: ResourceTransactionValidationFailure[] = [];

  if (!RESOURCE_TRANSACTION_OPERATION_TYPES.has(request.operationType)) {
    failures.push(
      buildResourceFailure({
        code: "invalid_operation_type",
        message: `Unsupported resource operation: ${request.operationType}.`,
      }),
    );
  }

  if (request.changes.length === 0) {
    failures.push(
      buildResourceFailure({
        code: "missing_transaction_parameter",
        message: "Resource transaction must include at least one change.",
      }),
    );
  }

  if (
    request.operationType === "add" &&
    request.changes.some((change) => change.delta <= 0)
  ) {
    failures.push(
      buildResourceFailure({
        code: "operation_not_allowed",
        message: "Add transactions may only increase resources.",
      }),
    );
  }

  if (
    request.operationType === "spend" &&
    (request.changes.length !== 1 || request.changes.some((change) => change.delta >= 0))
  ) {
    failures.push(
      buildResourceFailure({
        code: "operation_not_allowed",
        message: "Spend transactions must contain one negative resource change.",
      }),
    );
  }

  if (
    request.operationType === "convert" &&
    (!request.changes.some((change) => change.delta < 0) ||
      !request.changes.some((change) => change.delta > 0))
  ) {
    failures.push(
      buildResourceFailure({
        code: "operation_not_allowed",
        message: "Convert transactions must consume and produce resources.",
      }),
    );
  }

  const projectedChanges = request.changes.map((change) => {
    const resourceDefinition = getResourceDefinition(change.resourceId, definitions);
    const previousValue = resources[change.resourceId];
    const newValue = previousValue + change.delta;

    if (!resourceDefinition) {
      failures.push(
        buildResourceFailure({
          code: "resource_not_found",
          resourceId: change.resourceId,
          message: `Unknown resource: ${change.resourceId}.`,
        }),
      );
    }

    if (!Number.isFinite(change.delta) || change.delta === 0) {
      failures.push(
        buildResourceFailure({
          code: "invalid_amount",
          resourceId: change.resourceId,
          message: "Resource transaction amount must be a finite non-zero number.",
        }),
      );
    }

    if (!Number.isFinite(previousValue)) {
      failures.push(
        buildResourceFailure({
          code: "invalid_balance",
          resourceId: change.resourceId,
          message: "Current resource balance must be a finite number.",
        }),
      );
    }

    if (
      resourceDefinition &&
      (request.operationType === "spend" || request.operationType === "convert") &&
      change.delta < 0 &&
      !resourceDefinition.isSpendable
    ) {
      failures.push(
        buildResourceFailure({
          code: "resource_not_spendable",
          resourceId: change.resourceId,
          message: `${resourceDefinition.displayName} cannot be spent.`,
        }),
      );
    }

    if (resourceDefinition && Number.isFinite(newValue)) {
      if (newValue < resourceDefinition.minimumValue) {
        failures.push(
          buildResourceFailure({
            code: "balance_below_minimum",
            resourceId: change.resourceId,
            message: `${resourceDefinition.displayName} cannot go below ${String(
              resourceDefinition.minimumValue,
            )}.`,
          }),
        );
      }

      if (newValue > resourceDefinition.maximumValue) {
        failures.push(
          buildResourceFailure({
            code: "balance_above_maximum",
            resourceId: change.resourceId,
            message: `${resourceDefinition.displayName} cannot exceed ${String(
              resourceDefinition.maximumValue,
            )}.`,
          }),
        );
      }
    }

    return {
      resourceId: change.resourceId,
      previousValue,
      newValue,
      delta: change.delta,
    };
  });

  if (failures.length > 0) {
    return {
      ok: false,
      failures,
    };
  }

  return {
    ok: true,
    changes: projectedChanges,
  };
}

function buildResourceTransactionId(
  operationType: ResourceTransactionMetadata["operationType"],
  request: ResourceTransactionContext,
  changes: readonly ResourceTransactionProjectedChange[],
) {
  if (request.transactionId) {
    return request.transactionId;
  }

  const changeKey = changes
    .map((change) => `${change.resourceId}:${String(change.delta)}`)
    .join(",");

  return [
    "resource",
    operationType,
    request.sourceSystem,
    request.reason,
    String(request.simulationTime ?? 0),
    changeKey,
  ].join(":");
}

function applyResourceTransaction(
  resources: ResourceState,
  operationType: ResourceTransactionMetadata["operationType"],
  request: ResourceTransactionContext,
  changes: ResourceTransactionChangeList,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceOperationResult {
  const validation = validateResourceTransaction(
    resources,
    {
      operationType,
      changes,
    },
    definitions,
  );

  if (!validation.ok) {
    return {
      ok: false,
      resources,
      failures: validation.failures,
      events: [],
    };
  }

  const nextResources = validation.changes.reduce<ResourceState>(
    (updatedResources, change) => ({
      ...updatedResources,
      [change.resourceId]: change.newValue,
    }),
    { ...resources },
  );
  const transaction = {
    transactionId: buildResourceTransactionId(operationType, request, validation.changes),
    operationType,
    sourceSystem: request.sourceSystem,
    reason: request.reason,
    simulationTime: request.simulationTime ?? 0,
    changes: validation.changes,
  };

  return {
    ok: true,
    resources: nextResources,
    transaction,
    events: [
      {
        id: "resource.changed",
        payload: transaction,
      },
    ],
  };
}

function applyResourceOperation(
  resources: ResourceState,
  operationType: Extract<ResourceTransactionMetadata["operationType"], "add" | "spend">,
  request: ResourceOperationRequest,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceOperationResult {
  const delta = operationType === "add" ? request.amount : -request.amount;

  return applyResourceTransaction(
    resources,
    operationType,
    request,
    [{ resourceId: request.resourceId, delta }],
    definitions,
  );
}

export function addResource(
  resources: ResourceState,
  request: ResourceOperationRequest,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceOperationResult {
  return applyResourceOperation(resources, "add", request, definitions);
}

export function spendResource(
  resources: ResourceState,
  request: ResourceOperationRequest,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceOperationResult {
  return applyResourceOperation(resources, "spend", request, definitions);
}

export function convertResources(
  resources: ResourceState,
  request: ResourceConversionRequest,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
): ResourceOperationResult {
  return applyResourceTransaction(
    resources,
    "convert",
    request,
    [
      { resourceId: request.fromResourceId, delta: -request.fromAmount },
      { resourceId: request.toResourceId, delta: request.toAmount },
    ],
    definitions,
  );
}

export function formatNumber(value: number) {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const suffixes = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ];
  const suffix = suffixes.find((item) => absoluteValue >= item.value);

  if (!suffix) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: absoluteValue >= COMPACT_NUMBER_INTEGER_THRESHOLD ? 0 : 1,
    }).format(absoluteValue)}`;
  }

  return `${sign}${(absoluteValue / suffix.value).toFixed(1)}${suffix.suffix}`;
}

export function getDerivedStats(game: GameState): DerivedStats {
  return upgrades.reduce(
    (stats, upgrade) => {
      if (game.upgrades[upgrade.id] < 1) {
        return stats;
      }

      return upgrade.effects.reduce((nextStats, effect) => {
        if (effect.modifier.targetStatId === MVP_IDS.gameplayStats.manualBugsPerAction) {
          return {
            ...nextStats,
            bugsPerClick: nextStats.bugsPerClick + effect.modifier.value,
          };
        }

        return {
          ...nextStats,
          moneyPerBug: nextStats.moneyPerBug + effect.modifier.value,
        };
      }, stats);
    },
    { bugsPerClick: 1, moneyPerBug: 1 },
  );
}

export function getStageIndex(stage: CareerStage) {
  return careerStages.findIndex((careerStage) => careerStage.id === stage);
}

export function getPurchasedUpgradeCount(game: GameState) {
  return Object.values(game.upgrades).reduce((sum, owned) => sum + owned, 0);
}

export function getPromotionProgress(game: GameState): PromotionProgressItem[] {
  const purchasedUpgradeCount = getPurchasedUpgradeCount(game);
  const progress = [
    {
      id: "current_run_lifetime_bugs_found",
      label: "Lifetime bugs found",
      current: game.totalBugsFound,
      required: PROMOTION_REQUIRED_BUGS,
      prefix: "",
    },
    {
      id: "current_run_lifetime_money_earned",
      label: "Lifetime money earned",
      current: game.totalMoneyEarned,
      required: PROMOTION_REQUIRED_MONEY,
      prefix: "$",
    },
    {
      id: "purchased_mvp_upgrades",
      label: "Upgrades purchased",
      current: purchasedUpgradeCount,
      required: PROMOTION_REQUIRED_UPGRADES,
      prefix: "",
    },
  ];

  return progress.map((item) => ({
    ...item,
    complete: item.current >= item.required,
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

  const purchasedUpgrades = getPurchasedUpgradeCount(game);
  const requirementsMet = promotionDefinition.requirements.every((requirement) => {
    if (requirement.type === "purchased_upgrades_at_least") {
      return purchasedUpgrades >= requirement.amount;
    }

    if (requirement.source === "current_run_lifetime_bugs_found") {
      return game.totalBugsFound >= requirement.amount;
    }

    return game.totalMoneyEarned >= requirement.amount;
  });

  if (!requirementsMet) {
    return null;
  }

  return nextStage;
}

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

export function performManualTest(
  game: GameState,
  simulationTime = Date.now(),
): GameplayActionResult {
  const stats = getDerivedStats(game);
  const result = addResource(game.resources, {
    resourceId: MVP_IDS.resources.bugsFound,
    amount: stats.bugsPerClick,
    sourceSystem: "manual_testing",
    reason: "Manual Testing action",
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }

  return {
    ok: true,
    game: {
      ...game,
      resources: result.resources,
      totalBugsFound: game.totalBugsFound + stats.bugsPerClick,
      lastPlayedAt: simulationTime,
    },
    events: result.events,
  };
}

export function reportAllBugs(
  game: GameState,
  simulationTime = Date.now(),
): GameplayActionResult {
  const stats = getDerivedStats(game);
  const bugsFound = game.resources[MVP_IDS.resources.bugsFound];
  const reportedBugs = Math.floor(bugsFound);

  if (reportedBugs <= 0) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure("Bug Reporting requires at least one bug."),
      events: [],
    };
  }

  const earnedMoney = Math.floor(reportedBugs * BUG_VALUE * stats.moneyPerBug);
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

  return {
    ok: true,
    game: {
      ...game,
      resources: result.resources,
      totalMoneyEarned: game.totalMoneyEarned + earnedMoney,
      lastPlayedAt: simulationTime,
    },
    events: result.events,
  };
}

export function purchaseUpgrade(
  game: GameState,
  upgradeId: Upgrade["id"],
  simulationTime = Date.now(),
): GameplayActionResult {
  const upgrade = upgrades.find((item) => item.id === upgradeId);

  if (!upgrade) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure(`Unknown upgrade: ${upgradeId}.`),
      events: [],
    };
  }

  if (game.upgrades[upgrade.id] >= upgrade.maxLevel) {
    return {
      ok: false,
      game,
      failures: buildGameplayFailure(`${upgrade.name} is already owned.`),
      events: [],
    };
  }

  const result = spendResource(game.resources, {
    resourceId: upgrade.cost.resourceId,
    amount: getUpgradeCost(upgrade),
    sourceSystem: "upgrades",
    reason: `Buy ${upgrade.name}`,
    simulationTime,
  });

  if (!result.ok) {
    return { ok: false, game, failures: result.failures, events: [] };
  }

  return {
    ok: true,
    game: {
      ...game,
      resources: result.resources,
      lastPlayedAt: simulationTime,
      upgrades: {
        ...game.upgrades,
        [upgrade.id]: Math.min(upgrade.maxLevel, game.upgrades[upgrade.id] + 1),
      },
    },
    events: result.events,
  };
}
