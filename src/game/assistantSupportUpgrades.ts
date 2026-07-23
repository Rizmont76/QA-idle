import { MVP_IDS } from "../types";
import type {
  AssistantSupportUpgradeId,
  GameState,
  ResourceTransactionValidationFailure,
  UpgradeResolvedCost,
} from "../types";
import {
  assistantSupportUpgradeDefinitions,
  type AssistantSupportUpgradeDefinition,
} from "./assistantProgression";
import { validateResourceTransaction } from "./resources";

export type AssistantSupportPurchaseFailureCode =
  "definition_not_found" | "not_unlocked" | "already_owned" | "not_affordable";

export interface AssistantSupportPurchaseFailure {
  readonly code: AssistantSupportPurchaseFailureCode;
  readonly supportId: string;
  readonly message: string;
}

export type AssistantSupportPurchaseValidationResult =
  | {
      readonly ok: true;
      readonly definition: AssistantSupportUpgradeDefinition;
      readonly resolvedCost: UpgradeResolvedCost;
    }
  | {
      readonly ok: false;
      readonly failures: readonly AssistantSupportPurchaseFailure[];
    };

function failure(
  code: AssistantSupportPurchaseFailureCode,
  supportId: string,
  message: string,
): AssistantSupportPurchaseValidationResult {
  return { ok: false, failures: [{ code, supportId, message }] };
}

function affordabilityMessage(
  definition: AssistantSupportUpgradeDefinition,
  failures: readonly ResourceTransactionValidationFailure[],
): string {
  return (
    failures[0]?.message ??
    `${definition.provisionalName} cannot be purchased with the current Money balance.`
  );
}

export function getAssistantSupportUpgradeDefinition(
  supportId: string,
): AssistantSupportUpgradeDefinition | undefined {
  return assistantSupportUpgradeDefinitions.find(
    (definition) => definition.id === supportId,
  );
}

export function validateAssistantSupportPurchase(
  game: GameState,
  supportId: string,
): AssistantSupportPurchaseValidationResult {
  const definition = getAssistantSupportUpgradeDefinition(supportId);
  if (!definition) {
    return failure(
      "definition_not_found",
      supportId,
      `Unknown Assistant Support Upgrade: ${supportId}.`,
    );
  }

  if (
    game.careerStage !== MVP_IDS.careerStages.middleQa ||
    !game.assistant.unlocked ||
    game.assistant.level < definition.unlockLevel
  ) {
    return failure(
      "not_unlocked",
      supportId,
      `${definition.provisionalName} is not unlocked.`,
    );
  }

  if (game.assistant.ownedSupportUpgradeIds.includes(definition.id)) {
    return failure(
      "already_owned",
      supportId,
      `${definition.provisionalName} is already owned.`,
    );
  }

  const resolvedCost: UpgradeResolvedCost = {
    resourceId: MVP_IDS.resources.money,
    amount: definition.price,
  };
  const affordability = validateResourceTransaction(game.resources, {
    operationType: "spend",
    changes: [
      {
        resourceId: resolvedCost.resourceId,
        delta: -resolvedCost.amount,
      },
    ],
  });
  if (!affordability.ok) {
    return failure(
      "not_affordable",
      supportId,
      affordabilityMessage(definition, affordability.failures),
    );
  }

  return { ok: true, definition, resolvedCost };
}

export function isAssistantSupportUpgradeId(
  value: string,
): value is AssistantSupportUpgradeId {
  return getAssistantSupportUpgradeDefinition(value) !== undefined;
}
