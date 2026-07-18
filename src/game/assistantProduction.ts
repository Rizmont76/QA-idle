import type { AssistantModifierOwnership } from "./assistantModifiers";
import { calculateAssistantModifierStats } from "./assistantModifiers";
import { juniorQaAssistantDefinition } from "./assistant";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export interface AssistantProductionInput extends AssistantModifierOwnership {
  readonly level: number;
}

const parameters = activeRuntimeCandidateParameters;
const decimalPlaces = parameters.formatting.numericScaleDecimalPlaces;
const DECIMAL_BASE = 10;
const decimalScale = DECIMAL_BASE ** decimalPlaces;

function normalizeProductionRate(value: number) {
  return Math.round((value + Number.EPSILON) * decimalScale) / decimalScale;
}

export function calculateAssistantBugsPerSecond(input: AssistantProductionInput): number {
  if (
    !Number.isInteger(input.level) ||
    input.level < juniorQaAssistantDefinition.level.minimum ||
    input.level > juniorQaAssistantDefinition.level.maximum
  ) {
    throw new Error(
      `Assistant production level must be an integer from ${String(juniorQaAssistantDefinition.level.minimum)} to ${String(juniorQaAssistantDefinition.level.maximum)}.`,
    );
  }

  const baseProduction =
    parameters.assistant.production.baseBugsPerSecond +
    parameters.assistant.production.bugsPerSecondPerLevel * input.level;
  const modifierStats = calculateAssistantModifierStats(input, {
    bugsPerSecond: baseProduction,
    futureLevelCost: 0,
    offlineEfficiency: 0,
  });

  return normalizeProductionRate(modifierStats.bugsPerSecond.value);
}
