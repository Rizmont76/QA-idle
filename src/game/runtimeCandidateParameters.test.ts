import { describe, expect, it } from "vitest";
import {
  ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
  ACTIVE_RUNTIME_PARAMETER_VERSION,
  RUNTIME_CANDIDATE_PARAMETER_GROUPS,
  SIMULATOR_ONLY_PARAMETER_IDS,
  activeRuntimeCandidateParameters,
  validateRuntimeCandidateParameterContract,
} from "./runtimeCandidateParameters";
import type { RuntimeCandidateParameterContract } from "./runtimeCandidateParameters";

describe("runtime candidate parameter contract", () => {
  it("exposes the active candidate identity and version through one stable contract", () => {
    expect(activeRuntimeCandidateParameters.profileId).toBe(
      ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
    );
    expect(activeRuntimeCandidateParameters.parameterVersion).toBe(
      ACTIVE_RUNTIME_PARAMETER_VERSION,
    );
    expect(RUNTIME_CANDIDATE_PARAMETER_GROUPS).toEqual([
      "assistant",
      "milestones",
      "supportUpgrades",
      "endpoint",
      "offlineProgress",
      "formatting",
    ]);
  });

  it("contains document 15 runtime groups without simulator cadence or gate targets", () => {
    expect(activeRuntimeCandidateParameters).toMatchObject({
      assistant: {
        maxLevel: 25,
        cost: {
          baseCost: 200,
          growth: 1.14,
          linearCost: 10,
          trainingSupportCostMultiplier: 0.76,
        },
        production: {
          baseBugsPerSecond: 0.8,
          bugsPerSecondPerLevel: 0.2,
          immediateSupportAddBugsPerSecond: 0.22,
        },
      },
      endpoint: {
        assistantLevelTarget: 8,
        supportUpgradesRequired: false,
        capstoneRequired: false,
      },
      offlineProgress: {
        timeCapSeconds: 7200,
        baseEfficiency: 0.35,
        efficiencyWithHandoverSupport: 0.62,
        producedResourceId: "bugs_found",
        moneyProductionAllowed: false,
        automaticReportAllowed: false,
      },
      formatting: {
        numericScaleDecimalPlaces: 6,
        decimalMaxBelow: 100,
        integerMin: 100,
        compactMin: 1_000_000,
      },
    });
    expect(activeRuntimeCandidateParameters.milestones).toEqual([
      {
        id: "milestone_assistant_first",
        level: 8,
        productionMultiplier: 1.3,
        endpointRelevant: true,
      },
      {
        id: "milestone_assistant_capstone",
        level: 25,
        productionMultiplier: null,
        endpointRelevant: false,
      },
    ]);
    expect(activeRuntimeCandidateParameters.supportUpgrades).toEqual([
      {
        id: "support_immediate_production",
        unlockLevel: 0,
        price: 120,
        effect: {
          type: "assistant_production_additive",
          bugsPerSecond: 0.22,
        },
      },
      {
        id: "support_training_economics",
        unlockLevel: 2,
        price: 160,
        effect: {
          type: "future_assistant_level_cost_multiplier",
          multiplier: 0.76,
        },
      },
      {
        id: "support_offline_handover",
        unlockLevel: 5,
        price: 150,
        effect: {
          type: "offline_efficiency_multiplier_source",
          efficiencyWithSupport: 0.62,
        },
      },
    ]);
  });

  it("keeps simulator-only parameter ids out of the runtime contract", () => {
    const serializedContract = JSON.stringify(activeRuntimeCandidateParameters);

    for (const parameterId of SIMULATOR_ONLY_PARAMETER_IDS) {
      expect(serializedContract).not.toContain(parameterId);
    }
  });

  it("validates required runtime groups and cross-group invariants", () => {
    expect(
      validateRuntimeCandidateParameterContract(activeRuntimeCandidateParameters),
    ).toEqual([]);

    const invalidContract = {
      ...activeRuntimeCandidateParameters,
      endpoint: {
        ...activeRuntimeCandidateParameters.endpoint,
        assistantLevelTarget: 26,
      },
      offlineProgress: {
        ...activeRuntimeCandidateParameters.offlineProgress,
        moneyProductionAllowed: true,
      },
    } as unknown as RuntimeCandidateParameterContract;

    expect(validateRuntimeCandidateParameterContract(invalidContract)).toEqual([
      "endpoint.assistantLevelTarget cannot exceed assistant.maxLevel.",
      "First Assistant milestone must align with endpoint level target.",
      "Offline progress must not produce Money directly.",
    ]);
  });
});
