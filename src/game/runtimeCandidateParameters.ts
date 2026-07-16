export const ACTIVE_RUNTIME_PARAMETER_PROFILE_ID = "phase-6b.2-stage-a-003";
export const ACTIVE_RUNTIME_PARAMETER_VERSION =
  "doc15-provisional-implementation-candidate-v1-phase-6b.2-stage-a-003";

export type AssistantSupportUpgradeId =
  | "support_immediate_production"
  | "support_training_economics"
  | "support_offline_handover";

export type AssistantMilestoneId =
  "milestone_assistant_first" | "milestone_assistant_capstone";

export interface RuntimeCandidateParameterContract {
  profileId: string;
  parameterVersion: string;
  assistant: {
    maxLevel: number;
    cost: {
      baseCost: number;
      growth: number;
      linearCost: number;
      trainingSupportCostMultiplier: number;
    };
    production: {
      baseBugsPerSecond: number;
      bugsPerSecondPerLevel: number;
      immediateSupportAddBugsPerSecond: number;
    };
  };
  milestones: readonly [
    {
      id: "milestone_assistant_first";
      level: number;
      productionMultiplier: number;
      endpointRelevant: true;
    },
    {
      id: "milestone_assistant_capstone";
      level: number;
      productionMultiplier: null;
      endpointRelevant: false;
    },
  ];
  supportUpgrades: readonly [
    {
      id: "support_immediate_production";
      unlockLevel: 0;
      price: number;
      effect: {
        type: "assistant_production_additive";
        bugsPerSecond: number;
      };
    },
    {
      id: "support_training_economics";
      unlockLevel: number;
      price: number;
      effect: {
        type: "future_assistant_level_cost_multiplier";
        multiplier: number;
      };
    },
    {
      id: "support_offline_handover";
      unlockLevel: number;
      price: number;
      effect: {
        type: "offline_efficiency_multiplier_source";
        efficiencyWithSupport: number;
      };
    },
  ];
  endpoint: {
    assistantLevelTarget: number;
    supportUpgradesRequired: boolean;
    capstoneRequired: boolean;
  };
  offlineProgress: {
    timeCapSeconds: number;
    baseEfficiency: number;
    efficiencyWithHandoverSupport: number;
    producedResourceId: string;
    moneyProductionAllowed: boolean;
    automaticReportAllowed: boolean;
  };
  formatting: {
    numericScaleDecimalPlaces: number;
    decimalMaxBelow: number;
    integerMin: number;
    compactMin: number;
  };
}

type RuntimeParameterGroupName = keyof Pick<
  RuntimeCandidateParameterContract,
  | "assistant"
  | "milestones"
  | "supportUpgrades"
  | "endpoint"
  | "offlineProgress"
  | "formatting"
>;

export const RUNTIME_CANDIDATE_PARAMETER_GROUPS = Object.freeze([
  "assistant",
  "milestones",
  "supportUpgrades",
  "endpoint",
  "offlineProgress",
  "formatting",
] satisfies readonly RuntimeParameterGroupName[]);

export const SIMULATOR_ONLY_PARAMETER_IDS = Object.freeze([
  "PARAM_TOTAL_DURATION_MIN_SECONDS",
  "PARAM_TOTAL_DURATION_MAX_SECONDS",
  "PARAM_JUNIOR_DURATION_MIN_SECONDS",
  "PARAM_JUNIOR_DURATION_MAX_SECONDS",
  "PARAM_MIDDLE_DURATION_MIN_SECONDS",
  "PARAM_MIDDLE_DURATION_MAX_SECONDS",
  "PARAM_PURCHASE_ACTIONS_MIN",
  "PARAM_PURCHASE_ACTIONS_MAX",
  "PARAM_MEANINGFUL_DECISIONS_MIN",
  "PARAM_MEANINGFUL_DECISIONS_MAX",
  "PARAM_JUNIOR_BASELINE_REQUIRED",
  "PARAM_MANUAL_BASE_BUGS_PER_TEST",
  "PARAM_REPORT_MONEY_PER_BUG",
  "PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS",
  "PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS",
  "PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS",
  "PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS",
  "PARAM_LOW_CLICK_MIDDLE_MAX_SECONDS",
  "PARAM_DECISION_NEAR_AFFORD_SECONDS",
  "PARAM_PAYBACK_BUCKET_CHANGE_RATIO",
  "PARAM_MAX_STALL_SECONDS",
  "PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO",
  "PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION",
  "PARAM_SAFE_MAX_RESOURCE_VALUE",
  "PARAM_SAFE_MAX_RATE_VALUE",
  "PARAM_SAFE_MAX_COST_VALUE",
] as const);

export const activeRuntimeCandidateParameters = {
  profileId: ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
  parameterVersion: ACTIVE_RUNTIME_PARAMETER_VERSION,
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
  milestones: [
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
  ],
  supportUpgrades: [
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
  ],
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
} as const satisfies RuntimeCandidateParameterContract;

export function validateRuntimeCandidateParameterContract(
  contract: Partial<RuntimeCandidateParameterContract>,
): string[] {
  const failures: string[] = [];

  if (contract.profileId !== ACTIVE_RUNTIME_PARAMETER_PROFILE_ID) {
    failures.push("profileId must match the active implementation candidate.");
  }

  if (contract.parameterVersion !== ACTIVE_RUNTIME_PARAMETER_VERSION) {
    failures.push("parameterVersion must match the active candidate version.");
  }

  for (const groupName of RUNTIME_CANDIDATE_PARAMETER_GROUPS) {
    if (contract[groupName] === undefined) {
      failures.push(`Missing runtime parameter group: ${groupName}.`);
    }
  }

  if (
    contract.endpoint !== undefined &&
    contract.assistant !== undefined &&
    contract.endpoint.assistantLevelTarget > contract.assistant.maxLevel
  ) {
    failures.push("endpoint.assistantLevelTarget cannot exceed assistant.maxLevel.");
  }

  if (
    contract.milestones !== undefined &&
    contract.endpoint !== undefined &&
    contract.milestones[0].level !== contract.endpoint.assistantLevelTarget
  ) {
    failures.push("First Assistant milestone must align with endpoint level target.");
  }

  if (
    contract.milestones !== undefined &&
    contract.assistant !== undefined &&
    contract.milestones[1].level !== contract.assistant.maxLevel
  ) {
    failures.push("Capstone Assistant milestone must align with assistant.maxLevel.");
  }

  if (
    contract.offlineProgress !== undefined &&
    contract.offlineProgress.efficiencyWithHandoverSupport <
      contract.offlineProgress.baseEfficiency
  ) {
    failures.push("Offline Handover Support efficiency cannot be below base efficiency.");
  }

  if (contract.offlineProgress?.moneyProductionAllowed) {
    failures.push("Offline progress must not produce Money directly.");
  }

  if (contract.offlineProgress?.automaticReportAllowed) {
    failures.push("Offline progress must not automatically Report Bugs.");
  }

  return failures;
}
