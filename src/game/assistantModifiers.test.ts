import { describe, expect, it } from "vitest";
import { MVP_IDS } from "../types";
import type { ModifierDefinition } from "../types";
import {
  assistantModifierDefinitions,
  calculateAssistantModifierStats,
  createAssistantModifierRegistry,
  validateAssistantModifierDefinitions,
} from "./assistantModifiers";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

const allAssistantEffectsOwned = {
  ownedSupportUpgradeIds: [
    "support_immediate_production",
    "support_training_economics",
    "support_offline_handover",
  ] as const,
  reachedMilestoneIds: ["milestone_assistant_first"] as const,
};

describe("Assistant modifier path", () => {
  it("matches the active simulator candidate effects through runtime modifier fixtures", () => {
    expect(assistantModifierDefinitions).toMatchObject([
      {
        sourceId: "support_immediate_production",
        targetStatId: MVP_IDS.gameplayStats.assistantBugsPerSecond,
        modifierType: "flat",
        value:
          activeRuntimeCandidateParameters.assistant.production
            .immediateSupportAddBugsPerSecond,
      },
      {
        sourceId: "support_training_economics",
        targetStatId: MVP_IDS.gameplayStats.assistantFutureLevelCost,
        modifierType: "multiplicative",
        value:
          activeRuntimeCandidateParameters.assistant.cost.trainingSupportCostMultiplier,
      },
      {
        sourceId: "support_offline_handover",
        targetStatId: MVP_IDS.gameplayStats.assistantOfflineEfficiency,
        modifierType: "override",
        value:
          activeRuntimeCandidateParameters.offlineProgress.efficiencyWithHandoverSupport,
      },
      {
        sourceId: "milestone_assistant_first",
        targetStatId: MVP_IDS.gameplayStats.assistantBugsPerSecond,
        modifierType: "multiplicative",
        value: activeRuntimeCandidateParameters.milestones[0].productionMultiplier,
      },
    ]);
  });

  it("applies Assistant additive effects before the approved milestone multiplier", () => {
    const stats = calculateAssistantModifierStats(allAssistantEffectsOwned, {
      bugsPerSecond: 2.4,
      futureLevelCost: 200,
      offlineEfficiency: 0.35,
    });

    expect(stats.bugsPerSecond.value).toBeCloseTo((2.4 + 0.22) * 1.3, 10);
    expect(
      stats.bugsPerSecond.breakdown.appliedModifiers.map((item) => item.modifierType),
    ).toEqual(["flat", "multiplicative"]);
    expect(stats.futureLevelCost.value).toBeCloseTo(152, 10);
    expect(stats.offlineEfficiency.value).toBeCloseTo(0.62, 10);
  });

  it("activates only owned Support and reached milestone modifiers with stable instances", () => {
    const { registry, failures } = createAssistantModifierRegistry({
      ownedSupportUpgradeIds: ["support_immediate_production"],
      reachedMilestoneIds: [],
    });

    expect(failures).toEqual([]);
    expect(Object.values(registry)).toEqual([
      {
        instanceId:
          "instance.assistant_support.support_immediate_production.assistant_bugs_per_second.flat",
        definitionId:
          "assistant_support.support_immediate_production.assistant_bugs_per_second.flat",
        enabled: true,
      },
    ]);
  });

  it("rejects modifier definitions that exceed the approved Assistant scope", () => {
    const firstDefinition = assistantModifierDefinitions[0];
    if (!firstDefinition) {
      throw new Error("Expected Assistant modifier fixture.");
    }
    const invalidDefinition: ModifierDefinition = {
      ...firstDefinition,
      targetStatId: MVP_IDS.gameplayStats.moneyPerBugReported,
    };

    expect(validateAssistantModifierDefinitions([invalidDefinition])).toEqual([
      {
        code: "unsupported_modifier_scope",
        definitionId: invalidDefinition.definitionId,
        message: `Unsupported Assistant modifier scope: ${invalidDefinition.definitionId}.`,
      },
      ...assistantModifierDefinitions.slice(1).map((definition) => ({
        code: "unsupported_modifier_scope" as const,
        definitionId: definition.definitionId,
        message: `Missing approved Assistant modifier: ${definition.definitionId}.`,
      })),
    ]);
  });

  it("does not permit Assistant modifiers to produce Money or trigger reporting", () => {
    const supportedTargetIds = new Set(
      assistantModifierDefinitions.map((definition) => definition.targetStatId),
    );

    expect(supportedTargetIds).not.toContain(MVP_IDS.gameplayStats.moneyPerBugReported);
    expect(supportedTargetIds).not.toContain(MVP_IDS.gameplayStats.manualBugsPerAction);
    expect(JSON.stringify(assistantModifierDefinitions)).not.toContain("money");
    expect(JSON.stringify(assistantModifierDefinitions)).not.toContain("report");
  });
});
