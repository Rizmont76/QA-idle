import {
  BUG_VALUE,
  careerStages,
  promotionDefinitions,
  PROMOTION_REQUIRED_BUGS,
  PROMOTION_REQUIRED_MONEY,
  PROMOTION_REQUIRED_UPGRADES,
  gameplayStatDefinitions,
  resourceDefinitions,
  upgrades,
} from "./gameData";
import type {
  CareerStage,
  DerivedStats,
  GameState,
  GameplayStatCalculationMap,
  GameplayStatCalculationResult,
  GameplayStatId,
  GameplayStatModifierBreakdownItem,
  GameplayStatDefinition,
  ModifierDefinition,
  ModifierInstanceId,
  ModifierRegistrationFailure,
  ModifierRegistryState,
  Upgrade,
} from "./types";
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

export function getUpgradeModifierDefinitions(
  upgradeDefinitions: readonly Upgrade[] = upgrades,
): ModifierDefinition[] {
  return upgradeDefinitions.flatMap((upgrade) =>
    upgrade.effects.map((effect) => effect.modifier),
  );
}

export function getPermanentModifierInstanceId(
  modifier: ModifierDefinition,
): ModifierInstanceId {
  return `instance.${modifier.definitionId}`;
}

function validateModifierDefinition(
  modifier: ModifierDefinition,
): ModifierRegistrationFailure[] {
  const failures: ModifierRegistrationFailure[] = [];

  if (modifier.sourceType !== "upgrade") {
    failures.push({
      code: "unsupported_modifier_source",
      definitionId: modifier.definitionId,
      message: `Unsupported modifier source: ${modifier.sourceType}.`,
    });
  }

  if (
    modifier.sourceType === "upgrade" &&
    !upgrades.some((upgrade) => upgrade.id === modifier.sourceId)
  ) {
    failures.push({
      code: "unsupported_modifier_source",
      definitionId: modifier.definitionId,
      message: `Unknown modifier upgrade source: ${modifier.sourceId}.`,
    });
  }

  if (!gameplayStatDefinitions.some((stat) => stat.id === modifier.targetStatId)) {
    failures.push({
      code: "unknown_modifier_target",
      definitionId: modifier.definitionId,
      message: `Unknown modifier target: ${modifier.targetStatId}.`,
    });
  }

  if (modifier.modifierType !== "flat") {
    failures.push({
      code: "unsupported_modifier_type",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier type: ${modifier.modifierType}.`,
    });
  }

  if (modifier.durationType !== "permanent") {
    failures.push({
      code: "unsupported_modifier_duration",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier duration: ${modifier.durationType}.`,
    });
  }

  if (modifier.stackingPolicy !== "ignore") {
    failures.push({
      code: "unsupported_modifier_stacking",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier stacking policy: ${modifier.stackingPolicy}.`,
    });
  }

  return failures;
}

export function createActiveModifierRegistry(
  game: GameState,
  modifierDefinitions: readonly ModifierDefinition[] = getUpgradeModifierDefinitions(),
): {
  registry: ModifierRegistryState;
  failures: readonly ModifierRegistrationFailure[];
} {
  const failures: ModifierRegistrationFailure[] = [];
  const registry = modifierDefinitions.reduce<ModifierRegistryState>(
    (activeModifiers, modifier) => {
      const validationFailures = validateModifierDefinition(modifier);

      if (validationFailures.length > 0) {
        failures.push(...validationFailures);
        return activeModifiers;
      }

      if (game.upgrades[modifier.sourceId as Upgrade["id"]] < 1) {
        return activeModifiers;
      }

      const instanceId = getPermanentModifierInstanceId(modifier);

      return {
        ...activeModifiers,
        [instanceId]: {
          instanceId,
          definitionId: modifier.definitionId,
          enabled: true,
        },
      };
    },
    {},
  );

  return { registry, failures };
}

function getGameplayStatDefinition(
  statId: GameplayStatId,
  definitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatDefinition {
  const stat = definitions.find((definition) => definition.id === statId);

  if (!stat) {
    throw new Error(`Unknown gameplay stat: ${statId}.`);
  }

  return stat;
}

export function calculateGameplayStat(
  statId: GameplayStatId,
  registry: ModifierRegistryState,
  modifierDefinitions: readonly ModifierDefinition[] = getUpgradeModifierDefinitions(),
  statDefinitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatCalculationResult {
  const stat = getGameplayStatDefinition(statId, statDefinitions);
  const definitionById = new Map(
    modifierDefinitions.map((definition) => [definition.definitionId, definition]),
  );
  const activeModifiers = Object.values(registry)
    .filter((instance) => instance.enabled)
    .map((instance) => {
      const definition = definitionById.get(instance.definitionId);

      if (definition?.targetStatId !== statId) {
        return null;
      }

      return { instance, definition };
    })
    .filter(
      (
        modifier,
      ): modifier is {
        instance: NonNullable<typeof modifier>["instance"];
        definition: ModifierDefinition;
      } => modifier !== null,
    )
    .sort((left, right) => {
      const byDefinition = left.definition.definitionId.localeCompare(
        right.definition.definitionId,
      );

      if (byDefinition !== 0) {
        return byDefinition;
      }

      return left.instance.instanceId.localeCompare(right.instance.instanceId);
    });

  const calculation = activeModifiers.reduce<{
    value: number;
    appliedModifiers: GameplayStatModifierBreakdownItem[];
  }>(
    (current, { instance, definition }) => {
      if (definition.modifierType !== "flat") {
        return current;
      }

      const nextValue = Math.max(stat.minimumValue, current.value + definition.value);

      return {
        value: nextValue,
        appliedModifiers: [
          ...current.appliedModifiers,
          {
            instanceId: instance.instanceId,
            definitionId: definition.definitionId,
            sourceType: definition.sourceType,
            sourceId: definition.sourceId,
            modifierType: definition.modifierType,
            value: definition.value,
            previousValue: current.value,
            newValue: nextValue,
          },
        ],
      };
    },
    {
      value: Math.max(stat.minimumValue, stat.baseValue),
      appliedModifiers: [],
    },
  );

  return {
    statId,
    value: calculation.value,
    breakdown: {
      statId,
      baseValue: stat.baseValue,
      appliedModifiers: calculation.appliedModifiers,
      finalValue: calculation.value,
    },
  };
}

export function calculateGameplayStats(
  game: GameState,
  statDefinitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatCalculationMap {
  const { registry } = createActiveModifierRegistry(game);

  return statDefinitions.reduce(
    (calculatedStats, stat) => ({
      ...calculatedStats,
      [stat.id]: calculateGameplayStat(stat.id, registry),
    }),
    {} as GameplayStatCalculationMap,
  );
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
  const stats = calculateGameplayStats(game);

  return {
    bugsPerClick: stats[MVP_IDS.gameplayStats.manualBugsPerAction].value,
    moneyPerBug: stats[MVP_IDS.gameplayStats.moneyPerBugReported].value,
  };
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
