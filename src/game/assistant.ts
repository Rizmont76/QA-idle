import { MVP_IDS } from "../types";
import type { AssistantId, PromotionId, ResourceId } from "../types";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export type AssistantIdentityType = "junior_qa_assistant";
export type AssistantOwnershipType = "single_persistent";

export interface AssistantDefinition {
  readonly id: AssistantId;
  readonly identityType: AssistantIdentityType;
  readonly displayName: string;
  readonly unlock: {
    readonly completedPromotionId: PromotionId;
  };
  readonly ownership: {
    readonly type: AssistantOwnershipType;
    readonly maximumUnits: number;
  };
  readonly level: {
    readonly minimum: number;
    readonly maximum: number;
  };
  readonly production: {
    readonly resourceId: ResourceId;
    readonly eligibleAtLevelZero: boolean;
  };
}

export const JUNIOR_QA_ASSISTANT_ID = MVP_IDS.assistants.juniorQa;

export const juniorQaAssistantDefinition: Readonly<AssistantDefinition> = Object.freeze({
  id: JUNIOR_QA_ASSISTANT_ID,
  identityType: "junior_qa_assistant",
  displayName: "Junior QA Assistant",
  unlock: Object.freeze({
    completedPromotionId: MVP_IDS.promotions.juniorToMiddle,
  }),
  ownership: Object.freeze({
    type: "single_persistent",
    maximumUnits: 1,
  }),
  level: Object.freeze({
    minimum: 0,
    maximum: activeRuntimeCandidateParameters.assistant.maxLevel,
  }),
  production: Object.freeze({
    resourceId: MVP_IDS.resources.bugsFound,
    eligibleAtLevelZero: true,
  }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRecord(value: unknown, fieldName: string, failures: string[]) {
  if (!isRecord(value)) {
    failures.push(`Assistant definition ${fieldName} must be an object.`);
    return null;
  }

  return value;
}

function getInteger(
  value: unknown,
  fieldName: string,
  failures: string[],
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    failures.push(`Assistant definition ${fieldName} must be an integer.`);
    return null;
  }

  return value;
}

export function validateAssistantDefinition(definition: unknown): string[] {
  const failures: string[] = [];
  const candidate = getRecord(definition, "", failures);

  if (!candidate) {
    return failures;
  }

  if (candidate["id"] !== JUNIOR_QA_ASSISTANT_ID) {
    failures.push(`Assistant definition id must be ${JUNIOR_QA_ASSISTANT_ID}.`);
  }

  if (candidate["identityType"] !== "junior_qa_assistant") {
    failures.push("Assistant definition identityType must be junior_qa_assistant.");
  }
  if (
    typeof candidate["displayName"] !== "string" ||
    candidate["displayName"].trim() === ""
  ) {
    failures.push("Assistant definition displayName must be a non-empty string.");
  }

  const unlock = getRecord(candidate["unlock"], "unlock", failures);
  if (unlock?.["completedPromotionId"] !== MVP_IDS.promotions.juniorToMiddle) {
    failures.push(
      "Assistant definition must unlock from the completed Junior to Middle promotion.",
    );
  }

  const ownership = getRecord(candidate["ownership"], "ownership", failures);
  if (ownership?.["type"] !== "single_persistent") {
    failures.push("Assistant definition ownership type must be single_persistent.");
  }
  if (ownership?.["maximumUnits"] !== 1) {
    failures.push("Playable Idle MVP Assistant definition must allow exactly one unit.");
  }

  const level = getRecord(candidate["level"], "level", failures);
  const minimumLevel = getInteger(level?.["minimum"], "level.minimum", failures);
  const maximumLevel = getInteger(level?.["maximum"], "level.maximum", failures);

  if (minimumLevel !== null && minimumLevel !== 0) {
    failures.push("Assistant definition minimum level must be 0.");
  }
  if (
    maximumLevel !== null &&
    maximumLevel !== activeRuntimeCandidateParameters.assistant.maxLevel
  ) {
    failures.push("Assistant definition maximum level must match the active candidate.");
  }
  if (minimumLevel !== null && maximumLevel !== null && minimumLevel > maximumLevel) {
    failures.push("Assistant definition minimum level cannot exceed maximum level.");
  }

  const production = getRecord(candidate["production"], "production", failures);
  if (production?.["resourceId"] !== MVP_IDS.resources.bugsFound) {
    failures.push("Assistant definition production resource must be Bugs Found.");
  }
  if (production?.["eligibleAtLevelZero"] !== true) {
    failures.push("Assistant definition must allow production eligibility at level 0.");
  }

  return failures;
}

export function assertValidAssistantDefinition(
  definition: unknown,
): asserts definition is AssistantDefinition {
  const failures = validateAssistantDefinition(definition);

  if (failures.length > 0) {
    throw new Error(`Invalid Assistant definition: ${failures.join(" ")}`);
  }
}

export function isAssistantLevelValid(
  level: number,
  definition: Readonly<AssistantDefinition> = juniorQaAssistantDefinition,
) {
  return (
    Number.isInteger(level) &&
    level >= definition.level.minimum &&
    level <= definition.level.maximum
  );
}

export function isAssistantProductionEligible(
  level: number,
  hasCompletedUnlockPromotion: boolean,
  definition: Readonly<AssistantDefinition> = juniorQaAssistantDefinition,
) {
  if (!hasCompletedUnlockPromotion || !isAssistantLevelValid(level, definition)) {
    return false;
  }

  return level !== definition.level.minimum || definition.production.eligibleAtLevelZero;
}

assertValidAssistantDefinition(juniorQaAssistantDefinition);
