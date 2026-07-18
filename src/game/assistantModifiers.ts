import { MVP_IDS } from "../types";
import type {
  GameplayStatCalculationResult,
  GameplayStatDefinition,
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

export const assistantModifierDefinitions: readonly ModifierDefinition[] = Object.freeze([
  {
    definitionId:
      "assistant_support.support_immediate_production.assistant_bugs_per_second.flat",
    sourceType: "assistant_support",
    sourceId: "support_immediate_production",
    targetStatId: statIds.assistantBugsPerSecond,
    modifierType: "flat",
    value:
      activeRuntimeCandidateParameters.assistant.production
        .immediateSupportAddBugsPerSecond,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
  {
    definitionId:
      "assistant_support.support_training_economics.assistant_future_level_cost.multiplicative",
    sourceType: "assistant_support",
    sourceId: "support_training_economics",
    targetStatId: statIds.assistantFutureLevelCost,
    modifierType: "multiplicative",
    value: activeRuntimeCandidateParameters.assistant.cost.trainingSupportCostMultiplier,
    durationType: "permanent",
    stackingPolicy: "ignore",
  },
  {
    definitionId:
      "assistant_support.support_offline_handover.assistant_offline_efficiency.override",
    sourceType: "assistant_support",
    sourceId: "support_offline_handover",
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

function createAssistantStatDefinitions(
  baseStats: AssistantModifierBaseStats,
): readonly GameplayStatDefinition[] {
  return [
    {
      id: statIds.assistantBugsPerSecond,
      displayName: "Assistant Bugs Per Second",
      description: "Derived Assistant passive production.",
      baseValue: baseStats.bugsPerSecond,
      category: "assistant_production",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: false,
    },
    {
      id: statIds.assistantFutureLevelCost,
      displayName: "Assistant Future Level Cost",
      description: "Derived next Assistant level cost.",
      baseValue: baseStats.futureLevelCost,
      category: "assistant_economy",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: false,
    },
    {
      id: statIds.assistantOfflineEfficiency,
      displayName: "Assistant Offline Efficiency",
      description: "Derived Assistant offline production efficiency.",
      baseValue: baseStats.offlineEfficiency,
      category: "offline_progress",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: false,
    },
  ];
}

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

  const statDefinitions = createAssistantStatDefinitions(baseStats);
  return {
    bugsPerSecond: calculateGameplayStat(
      statIds.assistantBugsPerSecond,
      registry,
      assistantModifierDefinitions,
      statDefinitions,
      fixedPointArithmetic,
    ),
    futureLevelCost: calculateGameplayStat(
      statIds.assistantFutureLevelCost,
      registry,
      assistantModifierDefinitions,
      statDefinitions,
      fixedPointArithmetic,
    ),
    offlineEfficiency: calculateGameplayStat(
      statIds.assistantOfflineEfficiency,
      registry,
      assistantModifierDefinitions,
      statDefinitions,
      fixedPointArithmetic,
    ),
  };
}
