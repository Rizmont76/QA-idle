import type { AssistantModifierOwnership } from "./assistantModifiers";
import { calculateAssistantModifierStats } from "./assistantModifiers";
import type { GameplayStatCalculationResult } from "../types";
import { juniorQaAssistantDefinition } from "./assistant";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";
import { FixedPoint } from "./fixedPoint";

export interface AssistantProductionInput extends AssistantModifierOwnership {
  readonly level: number;
}

const parameters = activeRuntimeCandidateParameters;
const decimalPlaces = parameters.formatting.numericScaleDecimalPlaces;

export function calculateAssistantProductionStat(
  input: AssistantProductionInput,
): GameplayStatCalculationResult {
  if (
    !Number.isInteger(input.level) ||
    input.level < juniorQaAssistantDefinition.level.minimum ||
    input.level > juniorQaAssistantDefinition.level.maximum
  ) {
    throw new Error(
      `Assistant production level must be an integer from ${String(juniorQaAssistantDefinition.level.minimum)} to ${String(juniorQaAssistantDefinition.level.maximum)}.`,
    );
  }

  const baseProduction = FixedPoint.fromNumber(
    parameters.assistant.production.baseBugsPerSecond,
    decimalPlaces,
  )
    .add(
      FixedPoint.fromNumber(
        parameters.assistant.production.bugsPerSecondPerLevel,
        decimalPlaces,
      ).multiply(FixedPoint.fromNumber(input.level, decimalPlaces)),
    )
    .toNumber();
  return calculateAssistantModifierStats(input, {
    bugsPerSecond: baseProduction,
    futureLevelCost: 0,
    offlineEfficiency: 0,
  }).bugsPerSecond;
}

export function calculateAssistantBugsPerSecond(input: AssistantProductionInput): number {
  return calculateAssistantProductionStat(input).value;
}
