import { resourceDefinitions } from "../gameData";
import type {
  GameState,
  GameplayEventDescriptor,
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
} from "../types";

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

function getResourceDefinition(
  resourceId: ResourceId,
  definitions: readonly ResourceDefinition[],
): ResourceDefinition | undefined {
  return definitions.find((resource) => resource.id === resourceId);
}

export function buildResourceFailure(
  failure: ResourceTransactionValidationFailure,
): ResourceTransactionValidationFailure {
  return failure;
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

  const seenResourceIds = new Set<ResourceId>();
  const duplicateResourceIds = new Set<ResourceId>();

  for (const change of request.changes) {
    if (seenResourceIds.has(change.resourceId)) {
      duplicateResourceIds.add(change.resourceId);
    }

    seenResourceIds.add(change.resourceId);
  }

  for (const resourceId of duplicateResourceIds) {
    failures.push(
      buildResourceFailure({
        code: "duplicate_resource_change",
        resourceId,
        message: `Resource ${resourceId} appears more than once in one transaction.`,
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
      } satisfies GameplayEventDescriptor,
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
