import { describe, expect, it } from "vitest";
import { Fixed } from "./fixed-point.mjs";
import {
  assistantNextLevelCost,
  assistantRate,
  emitStrategicDecisionForTest,
  moneyAcquisitionRatePerSecond,
  runCompleteSimulationSuite,
  strategicDecisionSignatureForTest,
  validateJuniorBaselineSnapshot,
} from "./simulator.mjs";
import { SUPPORTS } from "./parameters.mjs";

function scenario(results, id) {
  const found = results.scenarios.find((item) => item.scenario_id === id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }
  return found;
}

describe("Phase 6A balance simulator", () => {
  it("runs deterministically", () => {
    const first = runCompleteSimulationSuite();
    const second = runCompleteSimulationSuite();

    expect(first.scenarios.map((item) => item.event_log_digest)).toEqual(
      second.scenarios.map((item) => item.event_log_digest),
    );
  });

  it("normalizes fixed-point values half away from zero", () => {
    expect(Fixed.from(1.1234565).toString()).toBe("1.123457");
    expect(Fixed.from(-1.1234565).toString()).toBe("-1.123457");
  });

  it("preserves fractional Report value and clears Bugs Found", () => {
    const results = runCompleteSimulationSuite();
    const lowClick = scenario(results, "scenario_low_click_middle");
    const fractionalReport = lowClick.event_log.find(
      (event) =>
        event.category === "report_action" && String(event.reportedBugs).includes("."),
    );

    expect(fractionalReport).toBeTruthy();
    expect(lowClick.final_bugs_found_exact).not.toBe("NaN");
  });

  it("fails clearly when required Junior snapshot fields are missing", () => {
    expect(() => validateJuniorBaselineSnapshot({})).toThrow(
      /Junior baseline snapshot is missing required fields/,
    );
  });

  it("enforces Assistant level cap and endpoint detection", () => {
    const results = runCompleteSimulationSuite();
    const capstone = scenario(results, "scenario_capstone_reachability_sanity");

    expect(capstone.assistant_final_level).toBeLessThanOrEqual(25);
    expect(scenario(results, "scenario_endpoint_completion").endpoint_completed).toBe(
      true,
    );
  });

  it("calculates cost order and training discount for future levels only", () => {
    const baseState = {
      assistantLevel: 3,
      assistantSupportsOwned: new Set(),
    };
    const discountedState = {
      assistantLevel: 3,
      assistantSupportsOwned: new Set([SUPPORTS.training]),
    };

    expect(
      assistantNextLevelCost(discountedState).lt(assistantNextLevelCost(baseState)),
    ).toBe(true);
  });

  it("keeps Support Upgrades one-time and optional", () => {
    const results = runCompleteSimulationSuite();

    expect(scenario(results, "scenario_no_support_completion").supports_owned).toEqual(
      [],
    );
    expect(new Set(scenario(results, "scenario_support_first").supports_owned).size).toBe(
      scenario(results, "scenario_support_first").supports_owned.length,
    );
  });

  it("records milestone crossing and Buy Max milestone crossing", () => {
    const results = runCompleteSimulationSuite();

    expect(
      scenario(results, "scenario_endpoint_completion").milestones_reached,
    ).toContain("milestone_assistant_first");
    expect(
      scenario(results, "scenario_buy_max_milestone_crossing").milestones_reached,
    ).toContain("milestone_assistant_first");
  });

  it("caps offline progress, grants Bugs Found only, and does not auto-report", () => {
    const results = runCompleteSimulationSuite();
    const offline = scenario(results, "scenario_offline_return_without_support");
    const offlineEvent = offline.event_log.find(
      (event) => event.category === "offline_return",
    );

    expect(offline.offline_eligible_seconds_total).toBe(7200);
    expect(Number(offline.offline_bugs_found_total)).toBeGreaterThan(0);
    expect(offlineEvent.moneyBefore).toBe(offlineEvent.moneyAfter);
    expect(Number(offline.money_from_offline_reports_after_return)).toBeGreaterThan(0);
  });

  it("deduplicates meaningful decisions and evaluates gates", () => {
    const results = runCompleteSimulationSuite();

    expect(
      scenario(results, "scenario_mixed").meaningful_purchase_decision_events.length,
    ).toBe(scenario(results, "scenario_mixed").meaningful_purchase_decision_count);
    expect(results.gates.map((gate) => gate.gate_id)).toContain("gate_safe_bounds");
  });

  it("keeps standard Middle scenario start snapshots consistent", () => {
    const results = runCompleteSimulationSuite();
    const starts = results.scenarios
      .filter(
        (item) =>
          item.scenario_id !== "scenario_junior_baseline" &&
          item.scenario_id !== "scenario_buy_max_milestone_crossing",
      )
      .map((item) => item.scenario_start_snapshot_id);

    expect(new Set(starts).size).toBe(1);
  });

  it("separates baseline, low-click, and active Middle cadence", () => {
    const results = runCompleteSimulationSuite();

    expect(scenario(results, "scenario_mixed").middle_phase_seconds).not.toBe(
      scenario(results, "scenario_low_click_middle").middle_phase_seconds,
    );
    expect(
      scenario(results, "scenario_active_click_middle").middle_phase_seconds,
    ).toBeLessThan(scenario(results, "scenario_mixed").middle_phase_seconds);
  });

  it("deduplicates repeated equivalent level-versus-support decisions", () => {
    const results = runCompleteSimulationSuite();
    const levelFirst = scenario(results, "scenario_level_first");

    expect(levelFirst.purchase_action_events.length).toBeGreaterThan(
      levelFirst.meaningful_purchase_decision_count,
    );
    expect(
      levelFirst.meaningful_purchase_decision_events.every(
        (event, index, events) =>
          index === 0 || event.signature !== events[index - 1].signature,
      ),
    ).toBe(true);
  });

  it("deduplicates strategic signatures globally within a scenario", () => {
    const seen = new Set();
    const signatureA = strategicDecisionSignatureForTest({
      viableCategories: ["assistant_level", SUPPORTS.immediate],
      affordableCategories: ["assistant_level"],
      nearAffordableCategories: [SUPPORTS.immediate],
      strategicOrdering: ["assistant_level", SUPPORTS.immediate],
    });
    const signatureB = strategicDecisionSignatureForTest({
      viableCategories: ["assistant_level", SUPPORTS.immediate],
      affordableCategories: ["assistant_level", SUPPORTS.immediate],
      nearAffordableCategories: [],
      strategicOrdering: [SUPPORTS.immediate, "assistant_level"],
    });

    expect(emitStrategicDecisionForTest(seen, signatureA)).toBe(true);
    expect(emitStrategicDecisionForTest(seen, signatureA)).toBe(false);
    expect(emitStrategicDecisionForTest(seen, signatureB)).toBe(true);
    expect(emitStrategicDecisionForTest(seen, signatureA)).toBe(false);
  });

  it("emits new signatures for unlocks and payback-order changes", () => {
    const locked = strategicDecisionSignatureForTest({
      viableCategories: ["assistant_level"],
      affordableCategories: ["assistant_level"],
      strategicOrdering: ["assistant_level"],
    });
    const unlockedSupport = strategicDecisionSignatureForTest({
      viableCategories: ["assistant_level", SUPPORTS.training],
      affordableCategories: ["assistant_level"],
      nearAffordableCategories: [SUPPORTS.training],
      strategicOrdering: ["assistant_level", SUPPORTS.training],
    });
    const paybackOrderChanged = strategicDecisionSignatureForTest({
      viableCategories: ["assistant_level", SUPPORTS.training],
      affordableCategories: ["assistant_level"],
      nearAffordableCategories: [SUPPORTS.training],
      strategicOrdering: [SUPPORTS.training, "assistant_level"],
    });

    expect(new Set([locked, unlockedSupport, paybackOrderChanged]).size).toBe(3);
  });

  it("uses Money acquisition rate for near-affordability with money-per-bug above 1", () => {
    const state = {
      assistantUnlocked: true,
      assistantLevel: 0,
      assistantSupportsOwned: new Set(),
      assistantMilestonesReached: new Set(),
      manualUpgradesOwned: new Set(["upgrade_bug_report_template"]),
    };
    const rate = moneyAcquisitionRatePerSecond(state, {
      manualInterval: 10,
      reportInterval: 30,
    });

    expect(rate).toBeCloseTo(0.36);
  });

  it("compares supported and unsupported offline return with timing fields", () => {
    const results = runCompleteSimulationSuite();
    const unsupported = scenario(results, "scenario_offline_return_without_support");
    const supported = scenario(results, "scenario_offline_return_with_support");

    expect(supported.supports_owned).toContain(SUPPORTS.offline);
    expect(supported.offline_bugs_found_total).toBeGreaterThan(
      unsupported.offline_bugs_found_total,
    );
    expect(supported.wall_clock_offline_elapsed_seconds).toBeGreaterThan(0);
    expect(supported.total_wall_clock_elapsed_seconds).toBeGreaterThan(
      supported.total_online_gameplay_seconds,
    );
  });

  it("isolates Handover Support in a controlled offline comparison", () => {
    const results = runCompleteSimulationSuite();
    const comparison = results.controlled_offline_support_comparison;

    expect(comparison.pass).toBe(true);
    expect(comparison.without_handover.assistant_level).toBe(
      comparison.with_handover.assistant_level,
    );
    expect(comparison.with_handover.supports_owned).toContain(SUPPORTS.offline);
    expect(comparison.normalized_improvement_ratio).toBeCloseTo(
      comparison.expected_ratio_from_efficiency_values,
      6,
    );
  });

  it("uses a genuine controlled multi-level Buy Max crossing", () => {
    const results = runCompleteSimulationSuite();
    const buyMax = scenario(results, "scenario_buy_max_milestone_crossing");
    const purchase = buyMax.purchase_action_events.find(
      (event) => event.action === "buy_assistant_level_max",
    );

    expect(buyMax.purchase_action_count).toBe(1);
    expect(purchase.levelsPurchased).toBeGreaterThanOrEqual(2);
    expect(purchase.previousLevel).toBeLessThan(8);
    expect(purchase.newLevel).toBeGreaterThanOrEqual(8);
    expect(buyMax.milestones_reached).toEqual(["milestone_assistant_first"]);
    expect(buyMax.endpoint_completed).toBe(true);
  });

  it("evaluates corrected stall, runaway, dominance, support, and capstone gates", () => {
    const results = runCompleteSimulationSuite();
    const gateIds = results.gates.map((gate) => gate.gate_id);

    expect(gateIds).toContain("gate_maximum_stall_window");
    expect(gateIds).toContain("gate_universal_strategy_dominance");
    expect(gateIds).toContain("gate_support_offline_viability");
    expect(gateIds).toContain("gate_buy_max_safe_level_limit");
    expect(gateIds).toContain("gate_capstone_excluded_from_endpoint_scenarios");
    expect(gateIds).toContain("gate_capstone_stall_informational");
    expect(scenario(results, "scenario_endpoint_completion").capstone_reached).toBe(
      false,
    );
    expect(
      results.gates.find((gate) => gate.gate_id === "gate_maximum_stall_window").pass,
    ).toBe(true);
    expect(
      results.gates.find((gate) => gate.gate_id === "gate_phase_specific_stalls").pass,
    ).toBe(true);
  });

  it("calculates Assistant rate with support and milestone multipliers", () => {
    const state = {
      assistantUnlocked: true,
      assistantLevel: 8,
      assistantSupportsOwned: new Set([SUPPORTS.immediate]),
      assistantMilestonesReached: new Set(["milestone_assistant_first"]),
    };

    expect(assistantRate(state).toNumber()).toBeGreaterThan(0.4);
  });
});
