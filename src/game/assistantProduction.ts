import type { AssistantModifierOwnership } from "./assistantModifiers";
import { juniorQaAssistantDefinition } from "./assistant";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";
import { FixedPoint } from "./fixedPoint";

export interface AssistantProductionInput extends AssistantModifierOwnership {
  readonly level: number;
}

const parameters = activeRuntimeCandidateParameters;
const decimalPlaces = parameters.formatting.numericScaleDecimalPlaces;

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
  let production = FixedPoint.fromNumber(baseProduction, decimalPlaces);

  if (input.ownedSupportUpgradeIds.includes("support_immediate_production")) {
    production = production.add(
      FixedPoint.fromNumber(
        parameters.assistant.production.immediateSupportAddBugsPerSecond,
        decimalPlaces,
      ),
    );
  }

  if (input.reachedMilestoneIds.includes("milestone_assistant_first")) {
    production = production.multiply(
      FixedPoint.fromNumber(parameters.milestones[0].productionMultiplier, decimalPlaces),
    );
  }

  return production.toNumber();
}
