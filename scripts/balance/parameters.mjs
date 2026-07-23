import activeCandidateSource from "../../data/balance/active-candidate.json" with { type: "json" };

export const HISTORICAL_BASELINE_PROFILE_ID = "historical-doc15-provisional-2026-07-14";
export const ACTIVE_CANDIDATE_PROFILE_ID = activeCandidateSource.profileId;
export const PARAMETER_VERSION = "doc15-provisional-2026-07-14";

export const PARAMS = Object.freeze({
  PARAM_TOTAL_DURATION_MIN_SECONDS: 1500,
  PARAM_TOTAL_DURATION_MAX_SECONDS: 2400,
  PARAM_JUNIOR_DURATION_MIN_SECONDS: 480,
  PARAM_JUNIOR_DURATION_MAX_SECONDS: 720,
  PARAM_MIDDLE_DURATION_MIN_SECONDS: 900,
  PARAM_MIDDLE_DURATION_MAX_SECONDS: 1500,
  PARAM_PURCHASE_ACTIONS_MIN: 10,
  PARAM_PURCHASE_ACTIONS_MAX: 16,
  PARAM_MEANINGFUL_DECISIONS_MIN: 3,
  PARAM_MEANINGFUL_DECISIONS_MAX: 5,
  PARAM_JUNIOR_BASELINE_REQUIRED: true,
  PARAM_ASSISTANT_MAX_LEVEL: 25,
  PARAM_FIRST_MILESTONE_LEVEL: 8,
  PARAM_CAPSTONE_MILESTONE_LEVEL: 25,
  PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET: 8,
  PARAM_ASSISTANT_LEVEL_BASE_COST: 25,
  PARAM_ASSISTANT_LEVEL_COST_GROWTH: 1.18,
  PARAM_ASSISTANT_LEVEL_LINEAR_COST: 3,
  PARAM_ASSISTANT_BASE_BUGS_PER_SECOND: 0.08,
  PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL: 0.035,
  PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER: 1.35,
  PARAM_SUPPORT_IMMEDIATE_PRICE: 95,
  PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND: 0.12,
  PARAM_SUPPORT_TRAINING_PRICE: 140,
  PARAM_SUPPORT_TRAINING_COST_MULTIPLIER: 0.88,
  PARAM_SUPPORT_OFFLINE_PRICE: 110,
  PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL: 5,
  PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL: 3,
  PARAM_OFFLINE_TIME_CAP_SECONDS: 7200,
  PARAM_OFFLINE_EFFICIENCY_BASE: 0.35,
  PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT: 0.55,
  PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS: 6,
  PARAM_JUNIOR_ACTIVE_MANUAL_ACTION_INTERVAL_SECONDS: 4,
  PARAM_JUNIOR_LOW_ENGAGEMENT_MANUAL_ACTION_INTERVAL_SECONDS: 12,
  PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS: 30,
  PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS: 12,
  PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS: 60,
  PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 20,
  PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS: 90,
  PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 4,
  PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS: 45,
  PARAM_LOW_CLICK_MIDDLE_MAX_SECONDS: 1500,
  PARAM_DECISION_NEAR_AFFORD_SECONDS: 90,
  PARAM_PAYBACK_BUCKET_CHANGE_RATIO: 0.15,
  PARAM_MAX_STALL_SECONDS: 180,
  PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO: 0.2,
  PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION: 5,
  PARAM_NUMERIC_SCALE_DECIMAL_PLACES: 6,
  PARAM_FORMAT_DECIMAL_MAX_BELOW: 100,
  PARAM_FORMAT_INTEGER_MIN: 100,
  PARAM_FORMAT_COMPACT_MIN: 1000000,
  PARAM_SAFE_MAX_RESOURCE_VALUE: 1000000000,
  PARAM_SAFE_MAX_RATE_VALUE: 1000000,
  PARAM_SAFE_MAX_COST_VALUE: 1000000000,
});

export const ACTIVE_CANDIDATE_PARAMETER_VERSION = activeCandidateSource.parameterVersion;

export const ACTIVE_CANDIDATE_PARAMS = Object.freeze({
  ...activeCandidateSource.simulatorOnly,
  PARAM_ASSISTANT_MAX_LEVEL: activeCandidateSource.runtime.assistant.maxLevel,
  PARAM_FIRST_MILESTONE_LEVEL: activeCandidateSource.runtime.milestones[0].level,
  PARAM_CAPSTONE_MILESTONE_LEVEL: activeCandidateSource.runtime.milestones[1].level,
  PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET:
    activeCandidateSource.runtime.endpoint.assistantLevelTarget,
  PARAM_ASSISTANT_LEVEL_BASE_COST: activeCandidateSource.runtime.assistant.cost.baseCost,
  PARAM_ASSISTANT_LEVEL_COST_GROWTH: activeCandidateSource.runtime.assistant.cost.growth,
  PARAM_ASSISTANT_LEVEL_LINEAR_COST:
    activeCandidateSource.runtime.assistant.cost.linearCost,
  PARAM_ASSISTANT_BASE_BUGS_PER_SECOND:
    activeCandidateSource.runtime.assistant.production.baseBugsPerSecond,
  PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL:
    activeCandidateSource.runtime.assistant.production.bugsPerSecondPerLevel,
  PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER:
    activeCandidateSource.runtime.milestones[0].productionMultiplier,
  PARAM_SUPPORT_IMMEDIATE_PRICE: activeCandidateSource.runtime.supportUpgrades[0].price,
  PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND:
    activeCandidateSource.runtime.supportUpgrades[0].effect.bugsPerSecond,
  PARAM_SUPPORT_TRAINING_PRICE: activeCandidateSource.runtime.supportUpgrades[1].price,
  PARAM_SUPPORT_TRAINING_COST_MULTIPLIER:
    activeCandidateSource.runtime.supportUpgrades[1].effect.multiplier,
  PARAM_SUPPORT_OFFLINE_PRICE: activeCandidateSource.runtime.supportUpgrades[2].price,
  PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL:
    activeCandidateSource.runtime.supportUpgrades[2].unlockLevel,
  PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL:
    activeCandidateSource.runtime.supportUpgrades[1].unlockLevel,
  PARAM_OFFLINE_TIME_CAP_SECONDS:
    activeCandidateSource.runtime.offlineProgress.timeCapSeconds,
  PARAM_OFFLINE_EFFICIENCY_BASE:
    activeCandidateSource.runtime.offlineProgress.baseEfficiency,
  PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT:
    activeCandidateSource.runtime.offlineProgress.efficiencyWithHandoverSupport,
  PARAM_NUMERIC_SCALE_DECIMAL_PLACES:
    activeCandidateSource.runtime.formatting.numericScaleDecimalPlaces,
  PARAM_FORMAT_DECIMAL_MAX_BELOW:
    activeCandidateSource.runtime.formatting.decimalMaxBelow,
  PARAM_FORMAT_INTEGER_MIN: activeCandidateSource.runtime.formatting.integerMin,
  PARAM_FORMAT_COMPACT_MIN: activeCandidateSource.runtime.formatting.compactMin,
  PARAM_SAFE_MAX_RESOURCE_VALUE: activeCandidateSource.runtime.safeBounds.resourceValue,
  PARAM_SAFE_MAX_RATE_VALUE: activeCandidateSource.runtime.safeBounds.rateValue,
  PARAM_SAFE_MAX_COST_VALUE: activeCandidateSource.runtime.safeBounds.costValue,
});

export const PARAMETER_PROFILES = Object.freeze({
  [HISTORICAL_BASELINE_PROFILE_ID]: Object.freeze({
    id: HISTORICAL_BASELINE_PROFILE_ID,
    version: PARAMETER_VERSION,
    description: "Historical Phase 6A.2 corrected baseline profile.",
    params: PARAMS,
  }),
  [ACTIVE_CANDIDATE_PROFILE_ID]: Object.freeze({
    id: ACTIVE_CANDIDATE_PROFILE_ID,
    version: ACTIVE_CANDIDATE_PARAMETER_VERSION,
    description:
      "Active Provisional Implementation Balance Candidate v1 from document 15.",
    params: ACTIVE_CANDIDATE_PARAMS,
  }),
});

export function getParameterProfile(profileId) {
  const profile = PARAMETER_PROFILES[profileId];

  if (!profile) {
    const knownProfiles = Object.keys(PARAMETER_PROFILES).sort().join(", ");
    throw new Error(
      `Unknown balance parameter profile "${profileId}". Known profiles: ${knownProfiles}.`,
    );
  }

  return profile;
}

const activeSupportIds = activeCandidateSource.runtime.supportUpgrades.map(
  ({ id }) => id,
);

export const SUPPORTS = Object.freeze({
  immediate: activeSupportIds[0],
  training: activeSupportIds[1],
  offline: activeSupportIds[2],
});

export const SUPPORT_DEFINITIONS = Object.freeze([
  {
    id: SUPPORTS.immediate,
    name: "Desk Setup Kit",
    category: "immediate_production",
    priceParam: "PARAM_SUPPORT_IMMEDIATE_PRICE",
    unlockLevel: 0,
  },
  {
    id: SUPPORTS.training,
    name: "Mentoring Checklist",
    category: "training_economics",
    priceParam: "PARAM_SUPPORT_TRAINING_PRICE",
    unlockLevel: PARAMS.PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL,
  },
  {
    id: SUPPORTS.offline,
    name: "Handover Notes",
    category: "offline_handover",
    priceParam: "PARAM_SUPPORT_OFFLINE_PRICE",
    unlockLevel: PARAMS.PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL,
  },
]);
