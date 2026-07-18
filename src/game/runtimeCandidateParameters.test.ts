import { describe, expect, it } from "vitest";
import {
  ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
  ACTIVE_RUNTIME_PARAMETER_VERSION,
  RUNTIME_CANDIDATE_PARAMETER_GROUPS,
  SIMULATOR_ONLY_CADENCE_PARAMETER_IDS,
  SIMULATOR_ONLY_PARAMETER_IDS,
  activeRuntimeCandidateParameters,
  loadActiveRuntimeCandidateParameters,
  validateRuntimeCandidateParameterContract,
} from "./runtimeCandidateParameters";

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

  it("marks balance scenario cadence as simulator-only", () => {
    expect(SIMULATOR_ONLY_CADENCE_PARAMETER_IDS).toEqual([
      "PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS",
      "PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS",
      "PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS",
      "PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS",
      "PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
      "PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS",
      "PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
      "PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS",
    ]);
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
    };

    expect(validateRuntimeCandidateParameterContract(invalidContract)).toEqual([
      "endpoint.assistantLevelTarget cannot exceed assistant.maxLevel.",
      "First Assistant milestone must align with endpoint level target.",
      "Offline progress must not produce Money directly.",
    ]);
  });

  it("loads the active candidate through one validated runtime boundary", () => {
    expect(loadActiveRuntimeCandidateParameters(activeRuntimeCandidateParameters)).toBe(
      activeRuntimeCandidateParameters,
    );
  });

  it("rejects missing or malformed active candidate values loudly", () => {
    const malformedCandidate = {
      ...activeRuntimeCandidateParameters,
      assistant: {
        ...activeRuntimeCandidateParameters.assistant,
        maxLevel: "25",
        cost: {
          ...activeRuntimeCandidateParameters.assistant.cost,
          baseCost: Number.NaN,
        },
      },
      formatting: {
        ...activeRuntimeCandidateParameters.formatting,
        numericScaleDecimalPlaces: 0,
      },
    };

    expect(() => loadActiveRuntimeCandidateParameters(undefined)).toThrow(
      "Runtime candidate parameter contract must be an object.",
    );
    expect(() => loadActiveRuntimeCandidateParameters(malformedCandidate)).toThrow(
      "assistant.maxLevel must be a positive integer.",
    );
    expect(() => loadActiveRuntimeCandidateParameters(malformedCandidate)).toThrow(
      "assistant.cost.baseCost must be a finite positive number.",
    );
    expect(() => loadActiveRuntimeCandidateParameters(malformedCandidate)).toThrow(
      "formatting.numericScaleDecimalPlaces must be a positive integer.",
    );
  });

  it("rejects malformed Support effects and formatting thresholds", () => {
    const malformedCandidate = {
      ...activeRuntimeCandidateParameters,
      supportUpgrades: activeRuntimeCandidateParameters.supportUpgrades.map(
        (support, index) =>
          index === 0
            ? { ...support, effect: { type: "wrong", bugsPerSecond: Number.NaN } }
            : support,
      ),
      formatting: {
        ...activeRuntimeCandidateParameters.formatting,
        decimalMaxBelow: 99,
        compactMin: 50,
      },
    };
    const failures = validateRuntimeCandidateParameterContract(malformedCandidate);

    expect(failures).toContain(
      "supportUpgrades[0].effect.type must be assistant_production_additive.",
    );
    expect(failures).toContain(
      "supportUpgrades[0].effect.bugsPerSecond must be a finite non-negative number.",
    );
    expect(failures).toContain(
      "formatting decimal and integer thresholds must meet exactly.",
    );
    expect(failures).toContain(
      "formatting.compactMin must be greater than formatting.integerMin.",
    );
  });
});
