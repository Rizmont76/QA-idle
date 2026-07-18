import activeCandidateSource from "../../data/balance/active-candidate.json";

export const ACTIVE_RUNTIME_PARAMETER_PROFILE_ID = activeCandidateSource.profileId;
export const ACTIVE_RUNTIME_PARAMETER_VERSION = activeCandidateSource.parameterVersion;
const ASSISTANT_MILESTONE_COUNT = 2;

export type { AssistantMilestoneId, AssistantSupportUpgradeId } from "../types";

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
  safeBounds: {
    resourceValue: number;
    rateValue: number;
    costValue: number;
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
  | "safeBounds"
>;

export const RUNTIME_CANDIDATE_PARAMETER_GROUPS = Object.freeze([
  "assistant",
  "milestones",
  "supportUpgrades",
  "endpoint",
  "offlineProgress",
  "formatting",
  "safeBounds",
] satisfies readonly RuntimeParameterGroupName[]);

/**
 * Scenario cadence describes how the balance simulator drives player intents.
 * It must never become a runtime cooldown or action-availability input.
 */
export const SIMULATOR_ONLY_CADENCE_PARAMETER_IDS = Object.freeze([
  "PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS",
  "PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS",
  "PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS",
  "PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS",
  "PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS",
] as const);

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
  ...SIMULATOR_ONLY_CADENCE_PARAMETER_IDS,
  "PARAM_LOW_CLICK_MIDDLE_MAX_SECONDS",
  "PARAM_DECISION_NEAR_AFFORD_SECONDS",
  "PARAM_PAYBACK_BUCKET_CHANGE_RATIO",
  "PARAM_MAX_STALL_SECONDS",
  "PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO",
  "PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION",
] as const);

const activeRuntimeCandidateParameterSource = {
  profileId: activeCandidateSource.profileId,
  parameterVersion: activeCandidateSource.parameterVersion,
  ...activeCandidateSource.runtime,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePositiveInteger(value: unknown, path: string, failures: string[]) {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    failures.push(`${path} must be a positive integer.`);
  }
}

function validateNonNegativeNumber(value: unknown, path: string, failures: string[]) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    failures.push(`${path} must be a finite non-negative number.`);
  }
}

function validatePositiveNumber(value: unknown, path: string, failures: string[]) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    failures.push(`${path} must be a finite positive number.`);
  }
}

export function validateRuntimeCandidateParameterContract(contract: unknown): string[] {
  const failures: string[] = [];

  if (!isRecord(contract)) {
    return ["Runtime candidate parameter contract must be an object."];
  }

  if (contract["profileId"] !== ACTIVE_RUNTIME_PARAMETER_PROFILE_ID) {
    failures.push("profileId must match the active implementation candidate.");
  }

  if (contract["parameterVersion"] !== ACTIVE_RUNTIME_PARAMETER_VERSION) {
    failures.push("parameterVersion must match the active candidate version.");
  }

  for (const groupName of RUNTIME_CANDIDATE_PARAMETER_GROUPS) {
    if (contract[groupName] === undefined) {
      failures.push(`Missing runtime parameter group: ${groupName}.`);
    }
  }

  const assistant = isRecord(contract["assistant"]) ? contract["assistant"] : null;
  if (assistant === null && contract["assistant"] !== undefined) {
    failures.push("assistant must be an object.");
  }
  if (assistant !== null) {
    validatePositiveInteger(assistant["maxLevel"], "assistant.maxLevel", failures);

    const cost = isRecord(assistant["cost"]) ? assistant["cost"] : null;
    if (cost === null) {
      failures.push("assistant.cost must be an object.");
    } else {
      validatePositiveNumber(cost["baseCost"], "assistant.cost.baseCost", failures);
      validatePositiveNumber(cost["growth"], "assistant.cost.growth", failures);
      validateNonNegativeNumber(
        cost["linearCost"],
        "assistant.cost.linearCost",
        failures,
      );
    }

    const production = isRecord(assistant["production"]) ? assistant["production"] : null;
    if (production === null) {
      failures.push("assistant.production must be an object.");
    } else {
      validateNonNegativeNumber(
        production["baseBugsPerSecond"],
        "assistant.production.baseBugsPerSecond",
        failures,
      );
      validateNonNegativeNumber(
        production["bugsPerSecondPerLevel"],
        "assistant.production.bugsPerSecondPerLevel",
        failures,
      );
    }
  }

  const endpoint = isRecord(contract["endpoint"]) ? contract["endpoint"] : null;
  if (endpoint === null && contract["endpoint"] !== undefined) {
    failures.push("endpoint must be an object.");
  }
  if (endpoint !== null) {
    validatePositiveInteger(
      endpoint["assistantLevelTarget"],
      "endpoint.assistantLevelTarget",
      failures,
    );
  }

  const formatting = isRecord(contract["formatting"]) ? contract["formatting"] : null;
  if (formatting === null && contract["formatting"] !== undefined) {
    failures.push("formatting must be an object.");
  }
  if (formatting !== null) {
    validatePositiveInteger(
      formatting["numericScaleDecimalPlaces"],
      "formatting.numericScaleDecimalPlaces",
      failures,
    );
    validatePositiveNumber(
      formatting["decimalMaxBelow"],
      "formatting.decimalMaxBelow",
      failures,
    );
    validatePositiveNumber(formatting["integerMin"], "formatting.integerMin", failures);
    validatePositiveNumber(formatting["compactMin"], "formatting.compactMin", failures);
    if (
      typeof formatting["decimalMaxBelow"] === "number" &&
      typeof formatting["integerMin"] === "number" &&
      formatting["decimalMaxBelow"] !== formatting["integerMin"]
    ) {
      failures.push("formatting decimal and integer thresholds must meet exactly.");
    }
    if (
      typeof formatting["integerMin"] === "number" &&
      typeof formatting["compactMin"] === "number" &&
      formatting["compactMin"] <= formatting["integerMin"]
    ) {
      failures.push("formatting.compactMin must be greater than formatting.integerMin.");
    }
  }

  const safeBounds = isRecord(contract["safeBounds"]) ? contract["safeBounds"] : null;
  if (safeBounds === null && contract["safeBounds"] !== undefined) {
    failures.push("safeBounds must be an object.");
  }
  if (safeBounds !== null) {
    validatePositiveNumber(
      safeBounds["resourceValue"],
      "safeBounds.resourceValue",
      failures,
    );
    validatePositiveNumber(safeBounds["rateValue"], "safeBounds.rateValue", failures);
    validatePositiveNumber(safeBounds["costValue"], "safeBounds.costValue", failures);
  }

  if (
    endpoint !== null &&
    assistant !== null &&
    typeof endpoint["assistantLevelTarget"] === "number" &&
    typeof assistant["maxLevel"] === "number" &&
    endpoint["assistantLevelTarget"] > assistant["maxLevel"]
  ) {
    failures.push("endpoint.assistantLevelTarget cannot exceed assistant.maxLevel.");
  }

  const milestones = Array.isArray(contract["milestones"])
    ? contract["milestones"]
    : null;
  if (milestones === null && contract["milestones"] !== undefined) {
    failures.push("milestones must be an array.");
  }
  if (milestones !== null) {
    if (milestones.length !== ASSISTANT_MILESTONE_COUNT) {
      failures.push("milestones must contain exactly the first and capstone milestones.");
    }
    const expectedMilestoneIds = [
      "milestone_assistant_first",
      "milestone_assistant_capstone",
    ];
    expectedMilestoneIds.forEach((id, index) => {
      const milestone = isRecord(milestones[index]) ? milestones[index] : null;
      if (milestone?.["id"] !== id) {
        failures.push(`milestones[${String(index)}].id must be ${id}.`);
      }
      validatePositiveInteger(
        milestone?.["level"],
        `milestones[${String(index)}].level`,
        failures,
      );
    });
    if (isRecord(milestones[0])) {
      validatePositiveNumber(
        milestones[0]["productionMultiplier"],
        "milestones[0].productionMultiplier",
        failures,
      );
    }
  }

  const supportUpgrades = Array.isArray(contract["supportUpgrades"])
    ? contract["supportUpgrades"]
    : null;
  if (supportUpgrades === null && contract["supportUpgrades"] !== undefined) {
    failures.push("supportUpgrades must be an array.");
  }
  const expectedSupportIds = [
    "support_immediate_production",
    "support_training_economics",
    "support_offline_handover",
  ];
  if (supportUpgrades !== null) {
    if (supportUpgrades.length !== expectedSupportIds.length) {
      failures.push("supportUpgrades must contain exactly the three approved supports.");
    }
    expectedSupportIds.forEach((id, index) => {
      const support = isRecord(supportUpgrades[index]) ? supportUpgrades[index] : null;
      if (support?.["id"] !== id) {
        failures.push(`supportUpgrades[${String(index)}].id must be ${id}.`);
      }
      validateNonNegativeNumber(
        support?.["unlockLevel"],
        `supportUpgrades[${String(index)}].unlockLevel`,
        failures,
      );
      validatePositiveNumber(
        support?.["price"],
        `supportUpgrades[${String(index)}].price`,
        failures,
      );
      if (!isRecord(support?.["effect"])) {
        failures.push(`supportUpgrades[${String(index)}].effect must be an object.`);
        return;
      }

      const effect = support["effect"];
      if (index === 0) {
        if (effect["type"] !== "assistant_production_additive") {
          failures.push(
            "supportUpgrades[0].effect.type must be assistant_production_additive.",
          );
        }
        validateNonNegativeNumber(
          effect["bugsPerSecond"],
          "supportUpgrades[0].effect.bugsPerSecond",
          failures,
        );
      } else if (index === 1) {
        if (effect["type"] !== "future_assistant_level_cost_multiplier") {
          failures.push(
            "supportUpgrades[1].effect.type must be future_assistant_level_cost_multiplier.",
          );
        }
        validatePositiveNumber(
          effect["multiplier"],
          "supportUpgrades[1].effect.multiplier",
          failures,
        );
      } else {
        if (effect["type"] !== "offline_efficiency_multiplier_source") {
          failures.push(
            "supportUpgrades[2].effect.type must be offline_efficiency_multiplier_source.",
          );
        }
        validateNonNegativeNumber(
          effect["efficiencyWithSupport"],
          "supportUpgrades[2].effect.efficiencyWithSupport",
          failures,
        );
      }
    });
  }
  if (
    milestones !== null &&
    endpoint !== null &&
    isRecord(milestones[0]) &&
    milestones[0]["level"] !== endpoint["assistantLevelTarget"]
  ) {
    failures.push("First Assistant milestone must align with endpoint level target.");
  }

  if (
    milestones !== null &&
    assistant !== null &&
    isRecord(milestones[1]) &&
    milestones[1]["level"] !== assistant["maxLevel"]
  ) {
    failures.push("Capstone Assistant milestone must align with assistant.maxLevel.");
  }

  const offlineProgress = isRecord(contract["offlineProgress"])
    ? contract["offlineProgress"]
    : null;
  if (offlineProgress === null && contract["offlineProgress"] !== undefined) {
    failures.push("offlineProgress must be an object.");
  }
  if (offlineProgress !== null) {
    validatePositiveNumber(
      offlineProgress["timeCapSeconds"],
      "offlineProgress.timeCapSeconds",
      failures,
    );
    validateNonNegativeNumber(
      offlineProgress["baseEfficiency"],
      "offlineProgress.baseEfficiency",
      failures,
    );
    validateNonNegativeNumber(
      offlineProgress["efficiencyWithHandoverSupport"],
      "offlineProgress.efficiencyWithHandoverSupport",
      failures,
    );
    if (offlineProgress["producedResourceId"] !== "bugs_found") {
      failures.push("offlineProgress.producedResourceId must be bugs_found.");
    }
  }
  if (
    offlineProgress !== null &&
    typeof offlineProgress["efficiencyWithHandoverSupport"] === "number" &&
    typeof offlineProgress["baseEfficiency"] === "number" &&
    offlineProgress["efficiencyWithHandoverSupport"] < offlineProgress["baseEfficiency"]
  ) {
    failures.push("Offline Handover Support efficiency cannot be below base efficiency.");
  }

  if (offlineProgress?.["moneyProductionAllowed"]) {
    failures.push("Offline progress must not produce Money directly.");
  }

  if (offlineProgress?.["automaticReportAllowed"]) {
    failures.push("Offline progress must not automatically Report Bugs.");
  }

  return failures;
}

export function loadActiveRuntimeCandidateParameters(
  source: unknown,
): RuntimeCandidateParameterContract {
  const failures = validateRuntimeCandidateParameterContract(source);

  if (failures.length > 0) {
    throw new Error(`Invalid active runtime candidate parameters: ${failures.join(" ")}`);
  }

  return source as RuntimeCandidateParameterContract;
}

export const activeRuntimeCandidateParameters = Object.freeze(
  loadActiveRuntimeCandidateParameters(activeRuntimeCandidateParameterSource),
);
