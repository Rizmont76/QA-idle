import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  LOCKED_CADENCE_PROFILES,
  SEARCH_SPACE,
  productionShareDiagnostics,
  runCandidateSearch,
  runFeasibilityAnalysis,
  runSensitivity,
} from "./search-balance-parameters.mjs";

describe("Phase 6B.2 expanded passive/cost feasibility search", () => {
  it("preserves locked cadence profiles", () => {
    expect(LOCKED_CADENCE_PROFILES).toEqual({
      PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS: 9,
      PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS: 25,
      PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS: 10,
      PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS: 60,
      PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 4,
      PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS: 45,
      PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS: 20,
      PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS: 90,
    });
  });

  it("calculates feasibility reproducibly", () => {
    const first = runFeasibilityAnalysis();
    const second = runFeasibilityAnalysis();

    expect(first).toEqual(second);
    expect(first.manualProductionRates).toContainEqual({
      id: "active_middle",
      manualIntervalSeconds: 4,
      manualBugsPerSecond: 1.25,
      manualMoneyPerSecond: 1.25,
    });
    expect(first.requiredPassiveForActiveMixedRatios).toContainEqual({
      activeMixedRatio: 0.7,
      requiredPassiveBugsPerSecond: 1.25,
    });
  });

  it("records production-share diagnostics", () => {
    const results = runCandidateSearch();
    const reference = results.base_valid_top_candidates[0] ?? results.top_candidates[0];

    expect(reference.production_share_diagnostics.map((item) => item.level)).toEqual([
      0, 3, 5, 8,
    ]);
    expect(
      reference.production_share_diagnostics.every(
        (item) =>
          item.low_click_middle_passive_share > item.baseline_middle_passive_share,
      ),
    ).toBe(true);
  }, 240000);

  it("runs staged search in the requested order", () => {
    const results = runCandidateSearch();

    expect(results.stage_counts.stage_a_production_shapes).toBeGreaterThan(0);
    expect(results.stage_counts.stage_b_cost_candidates).toBeGreaterThan(0);
    expect(results.stage_counts.stage_c_support_decision_candidates).toBeGreaterThan(0);
    expect(results.candidates[0].stage).toMatch(/^stage-/);
  }, 240000);

  it("detects and records critical boundary expansion", () => {
    expect(SEARCH_SPACE.boundaryExpansions.length).toBeGreaterThan(0);
    expect(
      SEARCH_SPACE.boundaryExpansions.some(
        (item) => item.parameter === "PARAM_ASSISTANT_BASE_BUGS_PER_SECOND",
      ),
    ).toBe(true);
  });

  it("keeps production-share calculations independent of cost tuning", () => {
    const [shape] = SEARCH_SPACE.stages.productionShapes;
    const base = {
      PARAM_ASSISTANT_BASE_BUGS_PER_SECOND: shape[0],
      PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL: shape[1],
      PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER: shape[2],
      PARAM_ASSISTANT_LEVEL_BASE_COST: 100,
    };
    const changedCost = {
      ...base,
      PARAM_ASSISTANT_LEVEL_BASE_COST: 500,
    };

    expect(productionShareDiagnostics(base)).toEqual(
      productionShareDiagnostics(changedCost),
    );
  }, 240000);

  it("scores robustness consistently", () => {
    const results = runCandidateSearch();
    const candidate = results.base_valid_top_candidates[0] ?? results.top_candidates[0];
    const sensitivity = runSensitivity(candidate);

    expect(sensitivity.runs.map((run) => run.id)).toContain("cost-plus-5");
    expect(typeof sensitivity.zero_blocker_failures_under_individual_5_percent).toBe(
      "boolean",
    );
  }, 240000);

  it("does not delete previous artifacts", () => {
    expect(existsSync("artifacts/balance/phase-6b.1-robust-candidate-results.json")).toBe(
      true,
    );
    expect(existsSync("artifacts/balance/phase-6b-candidate-results.json")).toBe(true);
  });
});
