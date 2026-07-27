import type { AssistantModifierOwnership } from "./assistantModifiers";
import { calculateAssistantModifierStats } from "./assistantModifiers";
import type { GameplayStatCalculationResult } from "../types";
import { juniorQaAssistantDefinition } from "./assistant";
import {
  ACTIVE_RUNTIME_PARAMETER_VERSION,
  activeRuntimeCandidateParameters,
} from "./runtimeCandidateParameters";
import { FixedPoint } from "./fixedPoint";

export interface AssistantProductionInput extends AssistantModifierOwnership {
  readonly level: number;
}

export interface AssistantProductionDebugBreakdown {
  readonly scope: "debug_only";
  readonly parameterVersion: string;
  readonly baseRate: number;
  readonly perLevelContribution: number;
  readonly immediateSupportContribution: number;
  readonly preMilestoneRate: number;
  readonly milestoneMultiplier: number;
  readonly finalOnlineRate: number;
}

const parameters = activeRuntimeCandidateParameters;
const decimalPlaces = parameters.formatting.numericScaleDecimalPlaces;

function validateAssistantProductionInput(input: AssistantProductionInput) {
  if (
    !Number.isInteger(input.level) ||
    input.level < juniorQaAssistantDefinition.level.minimum ||
    input.level > juniorQaAssistantDefinition.level.maximum
  ) {
    throw new Error(
      `Assistant production level must be an integer from ${String(juniorQaAssistantDefinition.level.minimum)} to ${String(juniorQaAssistantDefinition.level.maximum)}.`,
    );
  }
}

function calculateAssistantLevelProduction(level: number) {
  const baseRate = FixedPoint.fromNumber(
    parameters.assistant.production.baseBugsPerSecond,
    decimalPlaces,
  );
  const perLevelContribution = FixedPoint.fromNumber(
    parameters.assistant.production.bugsPerSecondPerLevel,
    decimalPlaces,
  ).multiply(FixedPoint.fromNumber(level, decimalPlaces));

  return {
    baseRate: baseRate.toNumber(),
    perLevelContribution: perLevelContribution.toNumber(),
    levelAdditiveRate: baseRate.add(perLevelContribution).toNumber(),
  };
}

export function calculateAssistantProductionStat(
  input: AssistantProductionInput,
): GameplayStatCalculationResult {
  validateAssistantProductionInput(input);
  const { levelAdditiveRate } = calculateAssistantLevelProduction(input.level);

  return calculateAssistantModifierStats(input, {
    bugsPerSecond: levelAdditiveRate,
    futureLevelCost: 0,
    offlineEfficiency: 0,
  }).bugsPerSecond;
}

export function calculateAssistantBugsPerSecond(input: AssistantProductionInput): number {
  return calculateAssistantProductionStat(input).value;
}

/**
 * Internal diagnostic projection of the canonical Assistant production calculation.
 * This is deliberately marked debug-only and is not a player-facing formula contract.
 */
export function getAssistantProductionDebugBreakdown(
  input: AssistantProductionInput,
): Readonly<AssistantProductionDebugBreakdown> {
  const result = calculateAssistantProductionStat(input);
  const { baseRate, perLevelContribution } = calculateAssistantLevelProduction(
    input.level,
  );
  const immediateSupportModifier = result.breakdown.appliedModifiers.find(
    ({ sourceId }) => sourceId === "support_immediate_production",
  );
  const milestoneModifier = result.breakdown.appliedModifiers.find(
    ({ sourceId }) => sourceId === "milestone_assistant_first",
  );

  return Object.freeze({
    scope: "debug_only",
    parameterVersion: ACTIVE_RUNTIME_PARAMETER_VERSION,
    baseRate,
    perLevelContribution,
    immediateSupportContribution: immediateSupportModifier?.value ?? 0,
    preMilestoneRate: milestoneModifier?.previousValue ?? result.value,
    milestoneMultiplier: milestoneModifier?.value ?? 1,
    finalOnlineRate: result.value,
  });
}
