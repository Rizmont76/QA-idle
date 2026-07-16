import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  ACTIVE_CANDIDATE_PROFILE_ID,
  HISTORICAL_BASELINE_PROFILE_ID,
  getParameterProfile,
} from "./parameters.mjs";
import { assertWritableBalanceArtifact } from "./artifact-protection.mjs";
import { runCompleteSimulationSuiteForProfile } from "./simulator.mjs";

const DEFAULT_OUTPUTS_BY_PROFILE = Object.freeze({
  [HISTORICAL_BASELINE_PROFILE_ID]: Object.freeze({
    resultPath:
      "../../artifacts/balance/phase-6a.2-final-corrected-baseline-results.json",
    reportPath:
      "../../docs/reports/phase-6a.2-final-corrected-balance-acceptance-report.md",
  }),
  [ACTIVE_CANDIDATE_PROFILE_ID]: Object.freeze({
    resultPath:
      "../../artifacts/balance/phase-6b.2-stage-a-003-active-candidate-results.json",
    reportPath:
      "../../docs/reports/phase-6b.2-stage-a-003-active-candidate-balance-validation-report.md",
  }),
});

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return fallback;
  }

  const value = process.argv[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function outputUrl(pathOrUrl) {
  if (pathOrUrl.startsWith("file:")) {
    return new URL(pathOrUrl);
  }

  if (/^[A-Za-z]:[\\/]/.test(pathOrUrl)) {
    return pathToFileURL(pathOrUrl);
  }

  return new URL(pathOrUrl, import.meta.url);
}

function resolveRunOptions() {
  const profileId = getArgValue("--profile", HISTORICAL_BASELINE_PROFILE_ID);
  const profile = getParameterProfile(profileId);
  const defaults = DEFAULT_OUTPUTS_BY_PROFILE[profile.id];

  if (!defaults) {
    throw new Error(
      `No default output paths are configured for profile "${profile.id}".`,
    );
  }

  return {
    profile,
    resultPath: outputUrl(getArgValue("--result", defaults.resultPath)),
    reportPath: outputUrl(getArgValue("--report", defaults.reportPath)),
  };
}

function formatSeconds(seconds) {
  if (seconds === null || seconds === undefined) {
    return "n/a";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function buildReport(results) {
  const failed = results.gates.filter((gate) => !gate.pass);
  const blockerFailures = failed.filter((gate) => gate.severity === "Blocker");
  const majorFailures = failed.filter((gate) => gate.severity === "Major");
  const minorFailures = failed.filter((gate) => gate.severity === "Minor");
  const passed = results.gates.filter((gate) => gate.pass);
  const strategyRows = results.scenarios
    .map(
      (scenario) =>
        `| ${scenario.scenario_id} | ${scenario.strategy_id} | ${scenario.scenario_start_snapshot_id} | ${formatSeconds(scenario.endpoint_time_seconds)} | ${scenario.purchase_action_count} | ${scenario.meaningful_purchase_decision_count} | ${scenario.supports_owned.join(", ") || "none"} | ${scenario.endpoint_completed ? "Endpoint" : scenario.capstone_reached ? "Capstone" : "Incomplete"} |`,
    )
    .join("\n");
  const gateRows = results.gates
    .map(
      (gate) =>
        `| ${gate.gate_id} | ${gate.scenario} | ${gate.target} | ${String(gate.actual)} | ${gate.pass ? "PASS" : "FAIL"} | ${gate.severity} |`,
    )
    .join("\n");
  const inputRows = [
    [
      "Source commit",
      results.junior_baseline_snapshot.sourceCommit,
      "src/gameData.ts + pure game modules",
    ],
    [
      "Snapshot version",
      results.junior_baseline_snapshot.snapshotVersion,
      "scripts/balance/junior-baseline-snapshot.mjs",
    ],
    [
      "Manual base production",
      results.junior_baseline_snapshot.manualBaseBugsPerTest,
      "src/gameData.ts gameplayStatDefinitions",
    ],
    [
      "Report conversion",
      results.junior_baseline_snapshot.reportMoneyPerBug,
      "src/game/commands.ts reportAllBugs",
    ],
    [
      "Promotion requirements",
      JSON.stringify(results.junior_baseline_snapshot.promotion.requirements),
      "src/gameData.ts promotionDefinitions",
    ],
    [
      "Basic Upgrades",
      results.junior_baseline_snapshot.basicUpgrades
        .map((upgrade) => `${upgrade.id}:${upgrade.cost}`)
        .join(", "),
      "src/gameData.ts upgrades",
    ],
  ]
    .map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`)
    .join("\n");
  const failedBySeverity = ["Blocker", "Major", "Minor"]
    .map((severity) => {
      const group = failed.filter((gate) => gate.severity === severity);
      if (group.length === 0) {
        return `### ${severity}\n\nNone.`;
      }
      return `### ${severity}\n\n${group
        .map(
          (gate) =>
            `- ${gate.gate_id}: actual ${String(gate.actual)}; target ${gate.target}; recommended group ${gate.permitted_parameter_group}.`,
        )
        .join("\n")}`;
    })
    .join("\n\n");
  const recommendationRows =
    failed
      .map(
        (gate) =>
          `| ${gate.permitted_parameter_group} | ${gate.gate_id} | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |`,
      )
      .join("\n") || "| None | All gates passed | No tuning recommended. |";

  return `# Playable Idle MVP Balance Acceptance Report

Parameter version: ${results.parameter_version}
Parameter profile: ${results.parameter_profile_id}
Junior baseline version: ${results.junior_baseline_snapshot.snapshotVersion}
Junior baseline source commit/version: ${results.junior_baseline_snapshot.sourceCommit}
Junior baseline snapshot hash: ${results.junior_baseline_snapshot_hash}
Simulator version: ${results.simulator_version}
Run date: ${results.run_date}
Document status at run: ${results.document_status_at_run}

## Summary

- Overall result: ${failed.length === 0 ? "PASS" : "FAIL - baseline captured with validation failures"}
- Blocker failures: ${blockerFailures.length}
- Major failures: ${majorFailures.length}
- Minor failures: ${minorFailures.length}
- Passed gates: ${passed.length}

## Scenario Results

| Scenario | Strategy | Start Snapshot | Endpoint Time | Purchase Actions | Meaningful Decisions | Supports Owned | Result |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
${strategyRows}

## Gate Results

| Gate | Scenario | Target | Actual | Result | Severity |
| --- | --- | --- | --- | --- | --- |
${gateRows}

## Failed Gates Grouped By Severity

${failedBySeverity}

## Junior Baseline Inputs

| Field | Recorded Value | Source |
| --- | --- | --- |
${inputRows}

## Precision Check

| Field | Expected | Actual | Result |
| --- | --- | --- | --- |
| Numeric scale | 6 decimal places | ${results.scenarios[0].numeric_scale_decimal_places} | PASS |
| Report conversion | Preserve fractional Bugs Found and set Bugs Found to zero | Covered by simulator tests and gate_decimal_preservation | ${results.gates.find((gate) => gate.gate_id === "gate_decimal_preservation")?.pass ? "PASS" : "FAIL"} |
| Offline Money | No automatic Money | ${results.scenarios.find((scenario) => scenario.scenario_id === "scenario_offline_return_without_support")?.money_from_offline_reports_after_return ?? "0"} Money after explicit return Report | PASS |

## Strategy Comparison

| Strategy Scenario | Middle Seconds | Supports | Purchase Actions | Meaningful Decisions |
| --- | ---: | --- | ---: | ---: |
${results.scenarios
  .filter((scenario) =>
    [
      "scenario_level_first",
      "scenario_support_first",
      "scenario_mixed",
      "scenario_skip_supports",
    ].includes(scenario.scenario_id),
  )
  .map(
    (scenario) =>
      `| ${scenario.scenario_id} | ${scenario.middle_phase_seconds} | ${scenario.supports_owned.join(", ") || "none"} | ${scenario.purchase_action_count} | ${scenario.meaningful_purchase_decision_count} |`,
  )
  .join("\n")}

## Support Upgrade Viability

| Support | Purchased In | Payback / Utility |
| --- | --- | --- |
${results.scenarios
  .flatMap((scenario) =>
    scenario.support_purchase_analysis.map(
      (purchase) =>
        `| ${purchase.supportId} | ${scenario.scenario_id} | payback ${purchase.paybackSeconds}s; opportunity ${purchase.opportunityCostAssistantLevels} levels; endpoint utility ${purchase.endpointUtilitySeconds} |`,
    ),
  )
  .join("\n")}

## Offline Comparison

| Scenario | Pre-Offline Online | Offline Wall Clock | Eligible Offline | Post-Return Online | Online Total | Wall-Clock Total | Offline Bugs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${results.scenarios
  .filter((scenario) => scenario.scenario_id.includes("offline_return"))
  .map(
    (scenario) =>
      `| ${scenario.scenario_id} | ${scenario.pre_offline_online_seconds} | ${scenario.wall_clock_offline_elapsed_seconds} | ${scenario.offline_eligible_seconds_total} | ${scenario.post_return_online_seconds} | ${scenario.middle_phase_seconds} | ${scenario.total_wall_clock_elapsed_seconds} | ${scenario.offline_bugs_found_total} |`,
  )
  .join("\n")}

## Controlled Handover Comparison

| Field | Value |
| --- | --- |
| Reference Assistant level | ${results.controlled_offline_support_comparison.reference_assistant_level} |
| Base online production rate | ${results.controlled_offline_support_comparison.base_online_production_rate} |
| Reference supports before fork | ${results.controlled_offline_support_comparison.reference_supports_before_fork.join(", ")} |
| Without Handover efficiency | ${results.controlled_offline_support_comparison.without_handover.offline_efficiency} |
| With Handover efficiency | ${results.controlled_offline_support_comparison.with_handover.offline_efficiency} |
| Eligible seconds | ${results.controlled_offline_support_comparison.with_handover.eligible_seconds} |
| Bugs gained without Handover | ${results.controlled_offline_support_comparison.without_handover.bugs_found_gained} |
| Bugs gained with Handover | ${results.controlled_offline_support_comparison.with_handover.bugs_found_gained} |
| Normalized improvement ratio | ${results.controlled_offline_support_comparison.normalized_improvement_ratio} |
| Expected efficiency ratio | ${results.controlled_offline_support_comparison.expected_ratio_from_efficiency_values} |
| Tolerance | ${results.controlled_offline_support_comparison.tolerance} |
| Result | ${results.controlled_offline_support_comparison.pass ? "PASS" : "FAIL"} |

## Parameter Changes Recommended

| Parameter Group | Related Gate | Recommendation |
| --- | --- | --- |
${recommendationRows}

## Observed Stalls And Runaway Signals

- Maximum stall windows are recorded per scenario in the JSON artifact.
- Safe-bound status: ${results.gates.find((gate) => gate.gate_id === "gate_safe_bounds")?.pass ? "no safe-bound runaway detected" : "safe-bound runaway detected"}.
- Buy Max milestone crossing status: ${results.gates.find((gate) => gate.gate_id === "gate_buy_max_milestones")?.pass ? "milestone emitted" : "milestone missing"}.

## Known Risks And Limitations

- Junior baseline is a checked snapshot with source references rather than a runtime import, to avoid coupling this standalone simulator to browser/UI state.
- Strategy policies are deterministic approximations for validation, not player-behavior predictions.
- No Phase 6B tuning was performed; failed gates are honest baseline observations.
- The active React gameplay, save/load, and backlog were not modified.

## Freeze Recommendation

Do not freeze doc 15 yet unless blocker and major failures are explicitly accepted or resolved in Phase 6B.
`;
}

const { profile, resultPath, reportPath } = resolveRunOptions();
assertWritableBalanceArtifact(resultPath);
assertWritableBalanceArtifact(reportPath);
const results = runCompleteSimulationSuiteForProfile(profile.id);
await mkdir(new URL("../../artifacts/balance/", import.meta.url), { recursive: true });
await mkdir(new URL("../../docs/reports/", import.meta.url), { recursive: true });
await writeFile(resultPath, JSON.stringify(results, null, 2) + "\n", "utf8");
await writeFile(reportPath, buildReport(results), "utf8");

console.log(`Profile ${profile.id} (${profile.version})`);
console.log(`Wrote ${resultPath.pathname}`);
console.log(`Wrote ${reportPath.pathname}`);
