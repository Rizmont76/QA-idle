import { MVP_IDS } from "../types";
import type {
  GameplayStatCalculationResult,
  ModifierDefinition,
  ModifierRegistrationFailure,
  ModifierRegistryState,
} from "../types";
import type {
  AssistantMilestoneId,
  AssistantSupportUpgradeId,
} from "./runtimeCandidateParameters";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";
import { calculateGameplayStat } from "./stats";
import type { GameplayStatArithmetic } from "./stats";
import { FixedPoint } from "./fixedPoint";
import { assistantSupportUpgradeDefinitions } from "./assistantProgression";

export interface AssistantModifierOwnership {
  readonly ownedSupportUpgradeIds: readonly AssistantSupportUpgradeId[];
  readonly reachedMilestoneIds: readonly AssistantMilestoneId[];
}

export interface AssistantModifierBaseStats {
  readonly bugsPerSecond: number;
  readonly futureLevelCost: number;
  readonly offlineEfficiency: number;
}

export interface AssistantModifierStats {
  readonly bugsPerSecond: GameplayStatCalculationResult;
  readonly futureLevelCost: GameplayStatCalculationResult;
  readonly offlineEfficiency: GameplayStatCalculationResult;
}

const statIds = MVP_IDS.gameplayStats;
const decimalPlaces =
  activeRuntimeCandidateParameters.formatting.numericScaleDecimalPlaces;
const fixedPointArithmetic: GameplayStatArithmetic = {
  add: (left, right) =>
    FixedPoint.fromNumber(left, decimalPlaces)
      .add(FixedPoint.fromNumber(right, decimalPlaces))
      .toNumber(),
  multiply: (left, right) =>
    FixedPoint.fromNumber(left, decimalPlaces)
      .multiply(FixedPoint.fromNumber(right, decimalPlaces))
      .toNumber(),
  clampMinimum: (value, minimum) => Math.max(value, minimum),
};

function supportDefinition(
  role: (typeof assistantSupportUpgradeDefinitions)[number]["role"],
) {
  const definition = assistantSupportUpgradeDefinitions.find(
    (candidate) => candidate.role === role,
  );
  if (!definition) {
    throw new Error(`Missing Assistant Support Upgrade role: ${role}.`);
  }
  return definition;
}

const immediateSupport = supportDefinition("immediate_production");
const trainingSupport = supportDefinition("training_economics");
const offlineSupport = supportDefinition("offline_handover");

export const assistantModifierDefinitions: readonly ModifierDefinition[] = Object.freeze([
  {
    definitionId: immediateSupport.modifierDefinitionId,
    sourceType: "assistant_support",
    sourceId: immediateSupport.id,
    targetStatId: statIds.assistantBugsPerSecond,
    modifierType: "flat",
    value:
      activeRuntimeCandidateParameters.assistant.production
        .immediateSupportAddBugsPerSecond,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
  {
    definitionId: trainingSupport.modifierDefinitionId,
    sourceType: "assistant_support",
    sourceId: trainingSupport.id,
    targetStatId: statIds.assistantFutureLevelCost,
    modifierType: "multiplicative",
    value: activeRuntimeCandidateParameters.assistant.cost.trainingSupportCostMultiplier,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
  {
    definitionId: offlineSupport.modifierDefinitionId,
    sourceType: "assistant_support",
    sourceId: offlineSupport.id,
    targetStatId: statIds.assistantOfflineEfficiency,
    modifierType: "override",
    value: activeRuntimeCandidateParameters.offlineProgress.efficiencyWithHandoverSupport,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
  {
    definitionId:
      "assistant_milestone.milestone_assistant_first.assistant_bugs_per_second.multiplicative",
    sourceType: "assistant_milestone",
    sourceId: "milestone_assistant_first",
    targetStatId: statIds.assistantBugsPerSecond,
    modifierType: "multiplicative",
    value: activeRuntimeCandidateParameters.milestones[0].productionMultiplier,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
]);

const approvedScopes = new Map(
  assistantModifierDefinitions.map((definition) => [
    definition.definitionId,
    `${definition.sourceType}:${definition.sourceId}:${definition.targetStatId}:${definition.modifierType}`,
  ]),
);

export function validateAssistantModifierDefinitions(
  definitions: readonly ModifierDefinition[] = assistantModifierDefinitions,
): readonly ModifierRegistrationFailure[] {
  const failures: ModifierRegistrationFailure[] = [];
  const seenIds = new Set<string>();

  for (const definition of definitions) {
    const expectedScope = approvedScopes.get(definition.definitionId);
    const actualScope = `${definition.sourceType}:${definition.sourceId}:${definition.targetStatId}:${definition.modifierType}`;
    if (seenIds.has(definition.definitionId) || expectedScope !== actualScope) {
      failures.push({
        code: "unsupported_modifier_scope",
        definitionId: definition.definitionId,
        message: `Unsupported Assistant modifier scope: ${definition.definitionId}.`,
      });
    }
    seenIds.add(definition.definitionId);
  }

  for (const definition of assistantModifierDefinitions) {
    if (!seenIds.has(definition.definitionId)) {
      failures.push({
        code: "unsupported_modifier_scope",
        definitionId: definition.definitionId,
        message: `Missing approved Assistant modifier: ${definition.definitionId}.`,
      });
    }
  }

  return failures;
}

export function createAssistantModifierRegistry(
  ownership: AssistantModifierOwnership,
  definitions: readonly ModifierDefinition[] = assistantModifierDefinitions,
): { registry: ModifierRegistryState; failures: readonly ModifierRegistrationFailure[] } {
  const failures = validateAssistantModifierDefinitions(definitions);
  if (failures.length > 0) {
    return { registry: {}, failures };
  }

  const ownedSources = new Set<string>([
    ...ownership.ownedSupportUpgradeIds,
    ...ownership.reachedMilestoneIds,
  ]);
  const registry = definitions.reduce<ModifierRegistryState>((result, definition) => {
    if (!ownedSources.has(definition.sourceId)) {
      return result;
    }

    const instanceId = `instance.${definition.definitionId}`;
    return {
      ...result,
      [instanceId]: { instanceId, definitionId: definition.definitionId, enabled: true },
    };
  }, {});

  return { registry, failures };
}

export function calculateAssistantModifierStats(
  ownership: AssistantModifierOwnership,
  baseStats: AssistantModifierBaseStats,
): AssistantModifierStats {
  if (Object.values(baseStats).some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Assistant modifier base stats must be finite non-negative numbers.");
  }

  const { registry, failures } = createAssistantModifierRegistry(ownership);
  if (failures.length > 0) {
    throw new Error(
      `Invalid Assistant modifier definitions: ${failures.map(({ message }) => message).join(" ")}`,
    );
  }

  return {
    bugsPerSecond: calculateGameplayStat(
      statIds.assistantBugsPerSecond,
      registry,
      assistantModifierDefinitions,
      undefined,
      fixedPointArithmetic,
      baseStats.bugsPerSecond,
    ),
    futureLevelCost: calculateGameplayStat(
      statIds.assistantFutureLevelCost,
      registry,
      assistantModifierDefinitions,
      undefined,
      fixedPointArithmetic,
      baseStats.futureLevelCost,
    ),
    offlineEfficiency: calculateGameplayStat(
      statIds.assistantOfflineEfficiency,
      registry,
      assistantModifierDefinitions,
      undefined,
      fixedPointArithmetic,
      baseStats.offlineEfficiency,
    ),
  };
}
