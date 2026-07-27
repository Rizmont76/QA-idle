import { calculateAssistantModifierStats } from "./assistantModifiers";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";
import type { AssistantProductionInput } from "./assistantProduction";
import { FixedPoint } from "./fixedPoint";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export interface AssistantOfflineProductionInput extends AssistantProductionInput {
  readonly assistantUnlocked: boolean;
  readonly elapsedOfflineSeconds: number;
}

export interface AssistantOfflineProductionResult {
  readonly elapsedOfflineSeconds: number;
  readonly eligibleOfflineSeconds: number;
  readonly onlineBugsPerSecond: number;
  readonly offlineEfficiency: number;
  readonly bugsFoundGained: number;
}

const parameters = activeRuntimeCandidateParameters;
const decimalPlaces = parameters.formatting.numericScaleDecimalPlaces;

export function calculateAssistantOfflineProduction(
  input: AssistantOfflineProductionInput,
): AssistantOfflineProductionResult {
  if (!Number.isFinite(input.elapsedOfflineSeconds) || input.elapsedOfflineSeconds < 0) {
    throw new Error("Elapsed offline seconds must be a finite non-negative number.");
  }

  if (!input.assistantUnlocked) {
    return {
      elapsedOfflineSeconds: input.elapsedOfflineSeconds,
      eligibleOfflineSeconds: 0,
      onlineBugsPerSecond: 0,
      offlineEfficiency: 0,
      bugsFoundGained: 0,
    };
  }

  const eligibleOfflineSeconds = Math.min(
    input.elapsedOfflineSeconds,
    parameters.offlineProgress.timeCapSeconds,
  );
  const onlineBugsPerSecond = calculateAssistantBugsPerSecond(input);
  const offlineEfficiency = calculateAssistantModifierStats(input, {
    bugsPerSecond: 0,
    futureLevelCost: 0,
    offlineEfficiency: parameters.offlineProgress.baseEfficiency,
  }).offlineEfficiency.value;
  const bugsFoundGained = FixedPoint.fromNumber(onlineBugsPerSecond, decimalPlaces)
    .multiply(FixedPoint.fromNumber(eligibleOfflineSeconds, decimalPlaces))
    .multiply(FixedPoint.fromNumber(offlineEfficiency, decimalPlaces))
    .toNumber();

  return {
    elapsedOfflineSeconds: input.elapsedOfflineSeconds,
    eligibleOfflineSeconds,
    onlineBugsPerSecond,
    offlineEfficiency,
    bugsFoundGained,
  };
}
