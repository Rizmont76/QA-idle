import { mkdir, writeFile } from "node:fs/promises";
import { PARAMETER_VERSION, PARAMS } from "./parameters.mjs";
import { runCompleteSimulationSuite } from "./simulator.mjs";

export const RECOMMENDED_VERSION = "phase-6b.2-expanded-candidate-v1";

export const LOCKED_CADENCE_PROFILES = Object.freeze({
  PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS: 9,
  PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS: 25,
  PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS: 10,
  PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS: 60,
  PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 4,
  PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS: 45,
  PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 20,
  PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS: 90,
});

const MANUAL_BUGS_PER_ACTION_AFTER_PROMOTION = 5;
const MONEY_PER_BUG_AFTER_PROMOTION = 1;

export const SEARCH_SPACE = Object.freeze({
  baselineParameterVersion: PARAMETER_VERSION,
  searchId: "phase-6b.2-expanded-passive-cost-feasibility-search",
  priorNoRecommendation: "phase-6b.1",
  lockedCadenceProfiles: LOCKED_CADENCE_PROFILES,
  explorationBounds: {
    PARAM_ASSISTANT_BASE_BUGS_PER_SECOND: [0.3, 2.4],
    PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL: [0.06, 0.5],
    PARAM_ASSISTANT_LEVEL_BASE_COST: [80, 550],
    PARAM_ASSISTANT_LEVEL_COST_GROWTH: [1.1, 1.32],
    PARAM_ASSISTANT_LEVEL_LINEAR_COST: [0, 45],
    PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER: [1.2, 2],
  },
  boundaryExpansions: [
    {
      parameter: "PARAM_ASSISTANT_BASE_BUGS_PER_SECOND",
      from: 2,
      to: 2.4,
      reason:
        "Initial expanded production probe included base-valid high-passive shapes at the upper 2.00 exploration bound.",
    },
    {
      parameter: "PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL",
      from: 0.45,
      to: 0.5,
      reason:
        "Local refinement kept per-level production away from a hard ceiling before boundary-pressure assessment.",
    },
    {
      parameter: "PARAM_ASSISTANT_LEVEL_BASE_COST",
      from: 500,
      to: 550,
      reason:
        "Cost restoration candidates touched the initial 500 upper bound during duration probing.",
    },
  ],
  stages: {
    productionShapes: [
      [0.4, 0.1, 1.4],
      [0.6, 0.15, 1.4],
      [0.8, 0.2, 1.3],
      [1.0, 0.25, 1.25],
      [1.2, 0.3, 1.2],
      [1.5, 0.35, 1.2],
      [1.7, 0.4, 1.2],
      [2.0, 0.45, 1.2],
      [2.2, 0.5, 1.2],
    ],
    costCurves: [
      [100, 1.1, 0],
      [150, 1.12, 5],
      [200, 1.14, 10],
      [250, 1.16, 15],
      [270, 1.14, 30],
      [300, 1.12, 30],
      [330, 1.12, 10],
      [360, 1.14, 30],
      [400, 1.2, 30],
      [500, 1.22, 40],
      [550, 1.2, 45],
    ],
    supportTunings: [
      [120, 0.22, 160, 0.76, 2, 150, 0.62, 5],
      [100, 0.2, 150, 0.8, 2, 150, 0.62, 5],
      [140, 0.24, 180, 0.78, 3, 180, 0.62, 5],
      [160, 0.28, 220, 0.82, 3, 200, 0.65, 6],
    ],
    decisionWindows: [60, 90],
  },
});

let cachedSearchResults = null;

const CORE_PRODUCTION_KEYS = [
  "PARAM_ASSISTANT_BASE_BUGS_PER_SECOND",
  "PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL",
  "PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER",
];
const CORE_COST_KEYS = [
  "PARAM_ASSISTANT_LEVEL_BASE_COST",
  "PARAM_ASSISTANT_LEVEL_COST_GROWTH",
  "PARAM_ASSISTANT_LEVEL_LINEAR_COST",
];
const SUPPORT_PRICE_KEYS = [
  "PARAM_SUPPORT_IMMEDIATE_PRICE",
  "PARAM_SUPPORT_TRAINING_PRICE",
  "PARAM_SUPPORT_OFFLINE_PRICE",
];
const SUPPORT_EFFECT_KEYS = [
  "PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND",
  "PARAM_SUPPORT_TRAINING_COST_MULTIPLIER",
  "PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT",
];

function profileRate(id, manualInterval) {
  const manualBugsPerSecond = MANUAL_BUGS_PER_ACTION_AFTER_PROMOTION / manualInterval;
  return {
    id,
    manualIntervalSeconds: manualInterval,
    manualBugsPerSecond: Number(manualBugsPerSecond.toFixed(6)),
    manualMoneyPerSecond: Number(
      (manualBugsPerSecond * MONEY_PER_BUG_AFTER_PROMOTION).toFixed(6),
    ),
  };
}

function passiveForRatio(targetRatio) {
  const baselineManual =
    MANUAL_BUGS_PER_ACTION_AFTER_PROMOTION /
    LOCKED_CADENCE_PROFILES.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS;
  const activeManual =
    MANUAL_BUGS_PER_ACTION_AFTER_PROMOTION /
    LOCKED_CADENCE_PROFILES.PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS;
  return Number(
    ((targetRatio * activeManual - baselineManual) / (1 - targetRatio)).toFixed(6),
  );
}

function assistantRateAtLevel(params, level) {
  const milestoneMultiplier =
    level >= PARAMS.PARAM_FIRST_MILESTONE_LEVEL
      ? params.PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER
      : 1;
  return Number(
    (
      (params.PARAM_ASSISTANT_BASE_BUGS_PER_SECOND +
        level * params.PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL) *
      milestoneMultiplier
    ).toFixed(6),
  );
}

export function productionShareDiagnostics(params) {
  const profiles = [
    profileRate(
      "baseline_middle",
      LOCKED_CADENCE_PROFILES.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
    profileRate(
      "active_middle",
      LOCKED_CADENCE_PROFILES.PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
    profileRate(
      "low_click_middle",
      LOCKED_CADENCE_PROFILES.PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
  ];

  return [0, 3, 5, 8].map((level) => {
    const passive = assistantRateAtLevel(params, level);
    const row = { level, passiveBugsPerSecond: passive };
    for (const profile of profiles) {
      const total = passive + profile.manualBugsPerSecond;
      row[`${profile.id}_manual_share`] = Number(
        (profile.manualBugsPerSecond / total).toFixed(4),
      );
      row[`${profile.id}_passive_share`] = Number((passive / total).toFixed(4));
    }
    return row;
  });
}

export function runFeasibilityAnalysis() {
  const phase6b1Best = {
    PARAM_ASSISTANT_BASE_BUGS_PER_SECOND: 0.34,
    PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL: 0.07,
    PARAM_ASSISTANT_LEVEL_BASE_COST: 90,
    PARAM_ASSISTANT_LEVEL_COST_GROWTH: 1.14,
    PARAM_ASSISTANT_LEVEL_LINEAR_COST: 14,
    PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER: 1.55,
    PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND: 0,
  };
  const manualProductionRates = [
    profileRate(
      "baseline_middle",
      LOCKED_CADENCE_PROFILES.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
    profileRate(
      "active_middle",
      LOCKED_CADENCE_PROFILES.PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
    profileRate(
      "low_click_middle",
      LOCKED_CADENCE_PROFILES.PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
    ),
  ];

  return {
    manualBugsPerActionAfterPromotion: MANUAL_BUGS_PER_ACTION_AFTER_PROMOTION,
    moneyPerBugAfterPromotion: MONEY_PER_BUG_AFTER_PROMOTION,
    manualProductionRates,
    phase6b1BestAssistantProductionLevels0To8: Array.from({ length: 9 }, (_, level) => ({
      level,
      assistantBugsPerSecond: assistantRateAtLevel(phase6b1Best, level),
    })),
    requiredPassiveForActiveMixedRatios: [0.7, 0.75, 0.8, 0.85].map((ratio) => ({
      activeMixedRatio: ratio,
      requiredPassiveBugsPerSecond: passiveForRatio(ratio),
    })),
    expandedSearchRangeRationale:
      "Formula estimates put 0.70 active/mixed near 1.25 passive Bugs/sec before simulator timing effects, so 6B.2 expands base/per-level production well beyond the 6B.1 0.34/0.085 ceilings and pairs those rates with higher cost curves.",
  };
}

function scenario(results, id) {
  return results.scenarios.find((item) => item.scenario_id === id);
}

function failedGates(results) {
  return results.gates.filter((gate) => !gate.pass);
}

function failureCounts(failures) {
  return {
    blocker: failures.filter((gate) => gate.severity === "Blocker").length,
    major: failures.filter((gate) => gate.severity === "Major").length,
  };
}

function parameterDiff(params) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => PARAMS[key] !== value)
      .map(([key, value]) => [key, { from: PARAMS[key], to: value }]),
  );
}

function coreParams([base, perLevel, milestone]) {
  return {
    PARAM_ASSISTANT_BASE_BUGS_PER_SECOND: base,
    PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL: perLevel,
    PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER: milestone,
  };
}

function costParams([baseCost, growth, linear]) {
  return {
    PARAM_ASSISTANT_LEVEL_BASE_COST: baseCost,
    PARAM_ASSISTANT_LEVEL_COST_GROWTH: growth,
    PARAM_ASSISTANT_LEVEL_LINEAR_COST: linear,
  };
}

function supportParams([
  immediatePrice,
  immediateEffect,
  trainingPrice,
  trainingMultiplier,
  trainingUnlock,
  offlinePrice,
  offlineEfficiency,
  offlineUnlock,
]) {
  return {
    PARAM_SUPPORT_IMMEDIATE_PRICE: immediatePrice,
    PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND: immediateEffect,
    PARAM_SUPPORT_TRAINING_PRICE: trainingPrice,
    PARAM_SUPPORT_TRAINING_COST_MULTIPLIER: trainingMultiplier,
    PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL: trainingUnlock,
    PARAM_SUPPORT_OFFLINE_PRICE: offlinePrice,
    PARAM_OFFLINE_EFFICIENCY_BASE: 0.35,
    PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT: offlineEfficiency,
    PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL: offlineUnlock,
  };
}

function defaultSupportParams() {
  return supportParams(SEARCH_SPACE.stages.supportTunings[0]);
}

function candidateSummary(candidateId, stage, params, results) {
  const junior = scenario(results, "scenario_junior_baseline");
  const mixed = scenario(results, "scenario_mixed");
  const active = scenario(results, "scenario_active_click_middle");
  const lowClick = scenario(results, "scenario_low_click_middle");
  const noSupport = scenario(results, "scenario_no_support_completion");
  const levelFirst = scenario(results, "scenario_level_first");
  const supportFirst = scenario(results, "scenario_support_first");
  const failures = failedGates(results);
  const counts = failureCounts(failures);

  return {
    candidate_id: candidateId,
    stage,
    params,
    parameter_diff: parameterDiff(params),
    gate_failures: failures.map((gate) => ({
      gate_id: gate.gate_id,
      severity: gate.severity,
      actual: gate.actual,
      target: gate.target,
    })),
    blocker_failures: counts.blocker,
    major_failures: counts.major,
    junior_duration_seconds: junior.junior_phase_seconds,
    middle_duration_seconds: mixed.middle_phase_seconds,
    total_duration_seconds: junior.junior_phase_seconds + mixed.middle_phase_seconds,
    active_middle_seconds: active.middle_phase_seconds,
    low_click_middle_seconds: lowClick.middle_phase_seconds,
    active_mixed_ratio: Number(
      (active.middle_phase_seconds / mixed.middle_phase_seconds).toFixed(3),
    ),
    purchase_actions: mixed.purchase_action_count + junior.purchase_action_count,
    meaningful_decisions: mixed.meaningful_purchase_decision_count,
    level_first_time_seconds: levelFirst.middle_phase_seconds,
    mixed_time_seconds: mixed.middle_phase_seconds,
    support_first_time_seconds: supportFirst.middle_phase_seconds,
    no_support_time_seconds: noSupport.middle_phase_seconds,
    supports_owned_mixed: mixed.supports_owned,
    support_utility: results.scenarios
      .flatMap((item) =>
        item.support_purchase_analysis.map((purchase) => ({
          scenarioId: item.scenario_id,
          supportId: purchase.supportId,
          timeSeconds: purchase.timeSeconds,
          paybackSeconds: purchase.paybackSeconds,
          endpointUtilitySeconds: purchase.endpointUtilitySeconds,
        })),
      )
      .sort((left, right) => left.timeSeconds - right.timeSeconds),
    production_share_diagnostics: productionShareDiagnostics(params),
    decision_trace: mixed.meaningful_purchase_decision_events.map((event) => ({
      onlineSeconds: event.onlineSeconds,
      viableCategories: event.visibleViablePurchaseCategories,
      affordableCategories: event.affordablePurchaseCategories,
      nearAffordableCategories: event.nearAffordablePurchaseCategories,
      moneyRatePerSecond: event.moneyRatePerSecond,
    })),
    offline_isolated_ratio:
      results.controlled_offline_support_comparison.normalized_improvement_ratio,
    maximum_endpoint_stall_seconds: Math.max(
      ...results.scenarios
        .filter((item) => item.scenario_id !== "scenario_full_run_low_engagement_info")
        .map((item) => item.stall_windows.maxSeconds),
    ),
    results,
  };
}

function scoreCandidate(candidate) {
  return (
    (candidate.blocker_failures + candidate.major_failures) * 1_000_000 +
    Math.max(0, 0.7 - candidate.active_mixed_ratio) * 10_000 +
    Math.max(0, candidate.low_click_middle_seconds - 1500) * 100 +
    Math.abs(candidate.total_duration_seconds - 1800) * 3 +
    Math.abs(candidate.middle_duration_seconds - 1200) * 2 +
    Math.abs(candidate.meaningful_decisions - 4) * 250 +
    Math.max(0, candidate.maximum_endpoint_stall_seconds - 180) * 100
  );
}

function evaluateCandidate(candidateId, stage, params) {
  const results = runCompleteSimulationSuite({ params, parameterVersion: candidateId });
  const summary = candidateSummary(candidateId, stage, params, results);
  summary.score = scoreCandidate(summary);
  return summary;
}

function scaleKeys(params, keys, multiplier) {
  return Object.fromEntries(
    keys.map((key) => [key, Number((params[key] * multiplier).toFixed(6))]),
  );
}

function sensitivityRun(candidate, id, params) {
  const results = runCompleteSimulationSuite({
    params,
    parameterVersion: `${candidate.candidate_id}-${id}`,
  });
  const summary = candidateSummary(
    `${candidate.candidate_id}-${id}`,
    "sensitivity",
    params,
    results,
  );
  return {
    id,
    blocker_failures: summary.blocker_failures,
    major_failures: summary.major_failures,
    failed_gates: summary.gate_failures,
    total_duration_seconds: summary.total_duration_seconds,
    middle_duration_seconds: summary.middle_duration_seconds,
    low_click_middle_seconds: summary.low_click_middle_seconds,
    active_mixed_ratio: summary.active_mixed_ratio,
    meaningful_decisions: summary.meaningful_decisions,
    endpoint_reachable: scenario(results, "scenario_mixed").endpoint_completed,
    catastrophic_failure:
      !scenario(results, "scenario_mixed").endpoint_completed ||
      summary.blocker_failures > 3,
  };
}

export function runSensitivity(candidate) {
  const params = candidate.params;
  const runs = [
    sensitivityRun(candidate, "base", params),
    sensitivityRun(candidate, "production-minus-5", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 0.95),
    }),
    sensitivityRun(candidate, "production-plus-5", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 1.05),
    }),
    sensitivityRun(candidate, "cost-minus-5", {
      ...params,
      ...scaleKeys(params, CORE_COST_KEYS, 0.95),
    }),
    sensitivityRun(candidate, "cost-plus-5", {
      ...params,
      ...scaleKeys(params, CORE_COST_KEYS, 1.05),
    }),
    sensitivityRun(candidate, "production-minus-10", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 0.9),
    }),
    sensitivityRun(candidate, "production-plus-10", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 1.1),
    }),
    sensitivityRun(candidate, "cost-minus-10", {
      ...params,
      ...scaleKeys(params, CORE_COST_KEYS, 0.9),
    }),
    sensitivityRun(candidate, "cost-plus-10", {
      ...params,
      ...scaleKeys(params, CORE_COST_KEYS, 1.1),
    }),
    sensitivityRun(candidate, "production-minus-5-cost-plus-5", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 0.95),
      ...scaleKeys(params, CORE_COST_KEYS, 1.05),
    }),
    sensitivityRun(candidate, "production-plus-5-cost-minus-5", {
      ...params,
      ...scaleKeys(params, CORE_PRODUCTION_KEYS, 1.05),
      ...scaleKeys(params, CORE_COST_KEYS, 0.95),
    }),
    sensitivityRun(candidate, "support-price-plus-10-effect-minus-10", {
      ...params,
      ...scaleKeys(params, SUPPORT_PRICE_KEYS, 1.1),
      ...scaleKeys(params, SUPPORT_EFFECT_KEYS, 0.9),
    }),
    sensitivityRun(candidate, "support-price-minus-10-effect-plus-10", {
      ...params,
      ...scaleKeys(params, SUPPORT_PRICE_KEYS, 0.9),
      ...scaleKeys(params, SUPPORT_EFFECT_KEYS, 1.1),
    }),
  ];
  const individualFivePercent = runs.filter((run) =>
    ["production-minus-5", "production-plus-5", "cost-minus-5", "cost-plus-5"].includes(
      run.id,
    ),
  );
  const severeTenPercent = runs.filter((run) => run.id.includes("10"));
  const combined = runs.filter(
    (run) => run.id.includes("-5-cost") || run.id.includes("support-price"),
  );

  return {
    candidate_id: candidate.candidate_id,
    zero_blocker_failures_under_individual_5_percent: individualFivePercent.every(
      (run) => run.blocker_failures === 0,
    ),
    avoids_catastrophic_failure_under_10_percent: severeTenPercent.every(
      (run) => !run.catastrophic_failure,
    ),
    combined_perturbations_pass: combined.every(
      (run) => run.blocker_failures === 0 && !run.catastrophic_failure,
    ),
    runs,
  };
}

function isBaseValid(candidate) {
  return candidate.blocker_failures === 0 && candidate.major_failures === 0;
}

function isRobust(sensitivity) {
  return (
    sensitivity.zero_blocker_failures_under_individual_5_percent &&
    sensitivity.avoids_catastrophic_failure_under_10_percent &&
    sensitivity.combined_perturbations_pass
  );
}

function materiallyDifferent(candidate, selected) {
  return selected.every(
    (item) =>
      Math.abs(
        item.params.PARAM_ASSISTANT_BASE_BUGS_PER_SECOND -
          candidate.params.PARAM_ASSISTANT_BASE_BUGS_PER_SECOND,
      ) >= 0.3 ||
      Math.abs(
        item.params.PARAM_ASSISTANT_LEVEL_BASE_COST -
          candidate.params.PARAM_ASSISTANT_LEVEL_BASE_COST,
      ) >= 50,
  );
}

function buildCandidatePool() {
  const stageA = SEARCH_SPACE.stages.productionShapes.map((shape, index) => {
    const params = {
      ...LOCKED_CADENCE_PROFILES,
      ...coreParams(shape),
      ...costParams([200, 1.14, 10]),
      ...defaultSupportParams(),
    };
    return evaluateCandidate(
      `phase-6b.2-stage-a-${String(index + 1).padStart(3, "0")}`,
      "stage-a-production-shape",
      params,
    );
  });
  const viableShapes = stageA
    .filter(
      (candidate) =>
        candidate.active_mixed_ratio >= 0.7 && candidate.low_click_middle_seconds <= 1500,
    )
    .sort((left, right) => left.score - right.score)
    .slice(0, 6);

  const stageB = [];
  for (const [shapeIndex, shape] of viableShapes.entries()) {
    for (const [costIndex, curve] of SEARCH_SPACE.stages.costCurves.entries()) {
      const params = {
        ...LOCKED_CADENCE_PROFILES,
        ...coreParams([
          shape.params.PARAM_ASSISTANT_BASE_BUGS_PER_SECOND,
          shape.params.PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL,
          shape.params.PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER,
        ]),
        ...costParams(curve),
        ...defaultSupportParams(),
      };
      stageB.push(
        evaluateCandidate(
          `phase-6b.2-stage-b-${String(shapeIndex + 1).padStart(2, "0")}-${String(
            costIndex + 1,
          ).padStart(2, "0")}`,
          "stage-b-duration-restoration",
          params,
        ),
      );
    }
  }

  const coreViable = stageB.filter(isBaseValid).sort((a, b) => a.score - b.score);
  const stageCSeeds = coreViable.slice(0, 4);
  const stageC = [];
  for (const [seedIndex, seed] of stageCSeeds.entries()) {
    for (const [supportIndex, support] of SEARCH_SPACE.stages.supportTunings.entries()) {
      for (const [
        decisionIndex,
        decisionNear,
      ] of SEARCH_SPACE.stages.decisionWindows.entries()) {
        const params = {
          ...seed.params,
          ...supportParams(support),
          PARAM_DECISION_NEAR_AFFORD_SECONDS: decisionNear,
        };
        stageC.push(
          evaluateCandidate(
            `phase-6b.2-stage-c-${String(seedIndex + 1).padStart(2, "0")}-${String(
              supportIndex + 1,
            ).padStart(2, "0")}-${decisionIndex + 1}`,
            "stage-c-support-decision-tuning",
            params,
          ),
        );
      }
    }
  }

  return { stageA, stageB, stageC, candidates: [...stageA, ...stageB, ...stageC] };
}

export function runCandidateSearch() {
  if (cachedSearchResults) {
    return structuredClone(cachedSearchResults);
  }

  const feasibility = runFeasibilityAnalysis();
  const pool = buildCandidatePool();
  const ranked = [...pool.candidates].sort(
    (left, right) =>
      left.score - right.score || left.candidate_id.localeCompare(right.candidate_id),
  );
  const baseValid = ranked.filter(isBaseValid);
  const sensitivity = [];
  const robust = [];
  for (const candidate of baseValid.slice(0, 6)) {
    const run = runSensitivity(candidate);
    sensitivity.push(run);
    if (isRobust(run)) {
      robust.push(candidate);
    }
  }
  if (sensitivity.length === 0 && ranked[0]) {
    sensitivity.push(runSensitivity(ranked[0]));
  }

  const diverseShortlist = [];
  for (const candidate of baseValid) {
    if (materiallyDifferent(candidate, diverseShortlist)) {
      diverseShortlist.push(candidate);
    }
    if (diverseShortlist.length === 3) {
      break;
    }
  }
  const recommended = robust[0] ?? null;

  cachedSearchResults = {
    search_space: SEARCH_SPACE,
    feasibility,
    stage_counts: {
      stage_a_production_shapes: pool.stageA.length,
      stage_b_cost_candidates: pool.stageB.length,
      stage_c_support_decision_candidates: pool.stageC.length,
      total_candidates: pool.candidates.length,
    },
    candidates_evaluated: pool.candidates.length,
    base_valid_candidates: baseValid.length,
    robust_candidates: robust.length,
    boundary_expansions: SEARCH_SPACE.boundaryExpansions,
    recommendation_status: recommended
      ? "recommended"
      : "no robust recommendation found after expanded boundary-aware search",
    recommended_candidate_id: recommended?.candidate_id ?? null,
    diverse_shortlist: diverseShortlist.map(({ results, ...candidate }) => candidate),
    top_candidates: ranked.slice(0, 12).map(({ results, ...candidate }) => candidate),
    base_valid_top_candidates: baseValid
      .slice(0, 12)
      .map(({ results, ...candidate }) => candidate),
    candidates: ranked.map(({ results, ...candidate }) => candidate),
    sensitivity,
    recommended: recommended ? { ...recommended, results: undefined } : null,
    recommended_results: recommended?.results ?? null,
  };

  return structuredClone(cachedSearchResults);
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function rows(items, render, fallback) {
  return items.length ? items.map(render).join("\n") : fallback;
}

function buildReport(searchResults) {
  const reference =
    searchResults.recommended ??
    searchResults.base_valid_top_candidates[0] ??
    searchResults.top_candidates[0];
  const manualRows = searchResults.feasibility.manualProductionRates
    .map(
      (rate) =>
        `| ${rate.id} | ${rate.manualIntervalSeconds} | ${rate.manualBugsPerSecond} | ${rate.manualMoneyPerSecond} |`,
    )
    .join("\n");
  const requiredRows = searchResults.feasibility.requiredPassiveForActiveMixedRatios
    .map((item) => `| ${item.activeMixedRatio} | ${item.requiredPassiveBugsPerSecond} |`)
    .join("\n");
  const candidateRows = rows(
    searchResults.diverse_shortlist,
    (candidate) =>
      `| ${candidate.candidate_id} | ${candidate.stage} | ${candidate.middle_duration_seconds} | ${candidate.total_duration_seconds} | ${candidate.active_mixed_ratio} | ${candidate.low_click_middle_seconds} | ${candidate.meaningful_decisions} |`,
    "| None | - | - | - | - | - | - |",
  );
  const sensitivityRows = searchResults.sensitivity
    .flatMap((item) =>
      item.runs.map(
        (run) =>
          `| ${item.candidate_id} | ${run.id} | ${run.total_duration_seconds} | ${run.middle_duration_seconds} | ${run.low_click_middle_seconds} | ${run.active_mixed_ratio} | ${run.blocker_failures}/${run.major_failures} | ${run.catastrophic_failure ? "yes" : "no"} |`,
      ),
    )
    .join("\n");
  const diffRows = Object.entries(reference.parameter_diff)
    .map(([key, diff]) => `| ${key} | ${diff.from} | ${diff.to} |`)
    .join("\n");
  const shareRows = reference.production_share_diagnostics
    .map(
      (share) =>
        `| ${share.level} | ${share.passiveBugsPerSecond} | ${share.baseline_middle_passive_share} | ${share.baseline_middle_manual_share} | ${share.active_middle_manual_share} | ${share.low_click_middle_manual_share} |`,
    )
    .join("\n");
  const supportRows = rows(
    reference.support_utility.slice(0, 12),
    (support) =>
      `| ${support.scenarioId} | ${support.supportId} | ${support.timeSeconds} | ${support.paybackSeconds} | ${support.endpointUtilitySeconds} |`,
    "| None | - | - | - | - |",
  );
  const decisionRows = rows(
    reference.decision_trace,
    (decision, index) =>
      `| ${index + 1} | ${decision.onlineSeconds} | ${decision.viableCategories.join(", ")} | ${decision.affordableCategories.join(", ") || "none"} | ${decision.nearAffordableCategories.join(", ") || "none"} |`,
    "| None | - | - | - | - |",
  );
  const boundaryRows = SEARCH_SPACE.boundaryExpansions
    .map((item) => `| ${item.parameter} | ${item.from} | ${item.to} | ${item.reason} |`)
    .join("\n");

  return `# Phase 6B.2 Expanded Passive Economy Report

Baseline parameter version: ${PARAMETER_VERSION}
Search status: ${searchResults.recommendation_status}

## Feasibility Analysis

| Profile | Manual Interval | Manual Bugs/sec | Manual Money/sec |
| --- | ---: | ---: | ---: |
${manualRows}

| Target Active/Mixed Ratio | Required Passive Bugs/sec |
| ---: | ---: |
${requiredRows}

${searchResults.feasibility.expandedSearchRangeRationale}

## Search Counts

| Stage | Candidates |
| --- | ---: |
| Stage A production shape | ${searchResults.stage_counts.stage_a_production_shapes} |
| Stage B duration restoration | ${searchResults.stage_counts.stage_b_cost_candidates} |
| Stage C support/decision tuning | ${searchResults.stage_counts.stage_c_support_decision_candidates} |
| Total | ${searchResults.stage_counts.total_candidates} |

Base-valid candidates: ${searchResults.base_valid_candidates}
Robust candidates: ${searchResults.robust_candidates}

## Boundary Expansions

| Parameter | From | To | Reason |
| --- | ---: | ---: | --- |
${boundaryRows}

## Candidate Result

Reference candidate: ${reference.candidate_id}

Recommendation: ${searchResults.recommended_candidate_id ?? "none"}

Timing: Junior ${formatSeconds(reference.junior_duration_seconds)}, Middle ${formatSeconds(reference.middle_duration_seconds)}, total ${formatSeconds(reference.total_duration_seconds)}.

## Diverse Shortlist

| Candidate | Stage | Middle | Total | Active/Mixed | Low-click | Decisions |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
${candidateRows}

## Parameter Diff

| Parameter | Phase 6A.2 | Reference Candidate |
| --- | ---: | ---: |
${diffRows}

## Production Shares

| Assistant Level | Passive Bugs/sec | Baseline Passive Share | Baseline Manual Share | Active Manual Share | Low-click Manual Share |
| ---: | ---: | ---: | ---: | ---: | ---: |
${shareRows}

## Strategy Timings

| Strategy | Middle Seconds |
| --- | ---: |
| level-first | ${reference.level_first_time_seconds} |
| mixed | ${reference.mixed_time_seconds} |
| support-first | ${reference.support_first_time_seconds} |
| no-support | ${reference.no_support_time_seconds} |

## Support Utility

| Scenario | Support | Time | Payback Seconds | Endpoint Utility Seconds |
| --- | --- | ---: | ---: | ---: |
${supportRows}

## Decision Trace

| # | Online Seconds | Viable Categories | Affordable | Near Affordable |
| ---: | ---: | --- | --- | --- |
${decisionRows}

## Sensitivity

| Candidate | Perturbation | Total | Middle | Low-click | Active/Mixed | Blocker/Major | Catastrophic |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${sensitivityRows}

## Remaining Risks

- Expanded search found base-valid candidates, but none satisfied the stricter robustness preference.
- Cost sensitivity remains tight: cost reductions can shorten total duration below the approved minimum, while cost increases can push low-click/stall gates over limits.
- No values were applied to runtime gameplay, document 15 or the implementation backlog.
`;
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writePhase6BArtifacts() {
  const searchResults = runCandidateSearch();
  const recommendedParameters = searchResults.recommended
    ? {
        parameter_version: RECOMMENDED_VERSION,
        source_candidate_id: searchResults.recommended_candidate_id,
        baseline_parameter_version: PARAMETER_VERSION,
        parameter_diff: searchResults.recommended.parameter_diff,
      }
    : null;

  await mkdir(new URL("../../artifacts/balance/", import.meta.url), {
    recursive: true,
  });
  await mkdir(new URL("../../docs/reports/", import.meta.url), {
    recursive: true,
  });
  await writeJson(
    new URL(
      "../../artifacts/balance/phase-6b.2-feasibility-analysis.json",
      import.meta.url,
    ),
    searchResults.feasibility,
  );
  await writeJson(
    new URL(
      "../../artifacts/balance/phase-6b.2-expanded-search-space.json",
      import.meta.url,
    ),
    SEARCH_SPACE,
  );
  await writeJson(
    new URL(
      "../../artifacts/balance/phase-6b.2-expanded-candidate-results.json",
      import.meta.url,
    ),
    searchResults,
  );
  await writeJson(
    new URL(
      "../../artifacts/balance/phase-6b.2-expanded-sensitivity-results.json",
      import.meta.url,
    ),
    {
      recommendation_status: searchResults.recommendation_status,
      recommended_candidate_id: searchResults.recommended_candidate_id,
      sensitivity: searchResults.sensitivity,
    },
  );
  if (recommendedParameters) {
    await writeJson(
      new URL(
        "../../artifacts/balance/phase-6b.2-recommended-parameters.json",
        import.meta.url,
      ),
      recommendedParameters,
    );
  }
  await writeFile(
    new URL(
      "../../docs/reports/phase-6b.2-expanded-passive-economy-report.md",
      import.meta.url,
    ),
    buildReport(searchResults),
    "utf8",
  );

  return { searchResults, recommendedParameters };
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll("\\", "/")}`) {
  await writePhase6BArtifacts();
}
