import {
  careerStages,
  promotionDefinitions,
  resourceDefinitions,
  upgrades,
} from "./gameData";
import type { CareerStage, DerivedStats, GameState, Upgrade } from "./types";
import { MVP_IDS } from "./types";
import type {
  ResourceDefinition,
  ResourceId,
  ResourceTransactionOperationType,
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

  const purchasedUpgrades = Object.values(game.upgrades).reduce(
    (sum, owned) => sum + owned,
    0,
  );
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
