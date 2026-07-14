# Playable Idle MVP Balance Acceptance Report

Parameter version: doc15-provisional-2026-07-14
Junior baseline version: junior-baseline-a1e0570-2026-07-14
Junior baseline source commit/version: a1e0570830765e34a848aba71198cd12149d3a12
Junior baseline snapshot hash: 1fe7f506367c028b441ee6ca3781b06a9b1f2bc9ab0ce8a238466c00f5a6c3e8
Simulator version: phase-6a-simulator-v1
Run date: 2026-07-14T10:44:43.851Z
Document status at run: DRAFT - Simulation Validation Required

## Summary

- Overall result: FAIL - baseline captured with validation failures
- Blocker failures: 1
- Major failures: 3
- Minor failures: 0
- Passed gates: 13

## Scenario Results

| Scenario | Strategy | Start Snapshot | Endpoint Time | Purchase Actions | Meaningful Decisions | Supports Owned | Result |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| scenario_junior_baseline | junior_baseline | new_run | n/a | 4 | 0 | none | Incomplete |
| scenario_level_first | level_first | post-promotion-1fe7f506367c | 20m 31s | 8 | 6 | none | Endpoint |
| scenario_support_first | support_first | post-promotion-1fe7f506367c | 28m 1s | 11 | 8 | support_immediate_production, support_offline_handover, support_training_economics | Endpoint |
| scenario_mixed | mixed | post-promotion-1fe7f506367c | 22m 1s | 9 | 7 | support_immediate_production | Endpoint |
| scenario_skip_supports | skip_supports | post-promotion-1fe7f506367c | 20m 31s | 8 | 6 | none | Endpoint |
| scenario_low_click_middle | mixed | post-promotion-1fe7f506367c | 22m 1s | 9 | 7 | support_immediate_production | Endpoint |
| scenario_active_click_middle | mixed | post-promotion-1fe7f506367c | 12m 16s | 10 | 7 | support_immediate_production, support_training_economics | Endpoint |
| scenario_offline_return | mixed | post-promotion-1fe7f506367c | 156m 28s | 9 | 4 | support_immediate_production | Endpoint |
| scenario_no_support_completion | skip_supports | post-promotion-1fe7f506367c | 20m 31s | 8 | 6 | none | Endpoint |
| scenario_buy_max_milestone_crossing | buy_max_heavy | post-promotion-1fe7f506367c | 20m 31s | 8 | 0 | none | Endpoint |
| scenario_endpoint_completion | mixed | post-promotion-1fe7f506367c | 22m 1s | 9 | 7 | support_immediate_production | Endpoint |
| scenario_capstone_reachability_sanity | mixed | post-promotion-1fe7f506367c | 22m 1s | 27 | 25 | support_immediate_production, support_training_economics | Endpoint |
| scenario_full_run_low_engagement_info | mixed | post-promotion-1fe7f506367c | 32m 31s | 10 | 9 | support_immediate_production, support_training_economics | Endpoint |

## Gate Results

| Gate | Scenario | Target | Actual | Result | Severity |
| --- | --- | --- | --- | --- | --- |
| gate_junior_baseline_inputs | scenario_junior_baseline | complete versioned Junior snapshot | junior-baseline-a1e0570-2026-07-14 | PASS | Blocker |
| gate_junior_duration | scenario_junior_baseline | 480-720 seconds | 330 | FAIL | Major |
| gate_middle_duration | scenario_mixed | 900-1500 seconds after promotion | 991 | PASS | Blocker |
| gate_total_duration | scenario_junior_baseline + scenario_mixed | 1500-2400 seconds | 1321 | FAIL | Blocker |
| gate_purchase_actions | scenario_mixed | 10-16 purchase actions | 13 | PASS | Major |
| gate_meaningful_decisions | scenario_mixed | 3-5 decisions, deduped | 7 | FAIL | Major |
| gate_low_click_middle_completion | scenario_low_click_middle | <= 1500 seconds after promotion | 991 | PASS | Blocker |
| gate_active_not_trivial | scenario_active_click_middle | active/mixed ratio 0.70-0.90 | 0.41 | FAIL | Major |
| gate_offline_bugs_only | scenario_offline_return | offline produces Bugs Found only | money unchanged during offline | PASS | Blocker |
| gate_offline_cap | scenario_offline_return | <= 7200 eligible seconds | 7200 | PASS | Blocker |
| gate_decimal_preservation | all | fixed-point decimals preserved through Report | 6 decimal places | PASS | Blocker |
| gate_buy_max_milestones | scenario_buy_max_milestone_crossing | every crossed milestone emitted | milestone_assistant_first | PASS | Blocker |
| gate_no_support_completion | scenario_no_support_completion | <= 2700 seconds after promotion | 901 | PASS | Blocker |
| gate_support_not_required | scenario_no_support_completion | no support required | none | PASS | Blocker |
| gate_support_tradeoff | strategy comparison | no universal support-first dominance | not dominant | PASS | Major |
| gate_safe_bounds | all | resources/rates/costs below safe max | within safe bounds | PASS | Blocker |
| gate_capstone_sanity | scenario_capstone_reachability_sanity | capstone reachable only in capstone scenario | reached at 7170s | PASS | Minor |

## Failed Gates Grouped By Severity

### Blocker

- gate_total_duration: actual 1321; target 1500-2400 seconds; recommended group group_cost.

### Major

- gate_junior_duration: actual 330; target 480-720 seconds; recommended group group_manual.
- gate_meaningful_decisions: actual 7; target 3-5 decisions, deduped; recommended group group_decisions.
- gate_active_not_trivial: actual 0.41; target active/mixed ratio 0.70-0.90; recommended group group_manual_cadence.

### Minor

None.

## Junior Baseline Inputs

| Field | Recorded Value | Source |
| --- | --- | --- |
| Source commit | a1e0570830765e34a848aba71198cd12149d3a12 | src/gameData.ts + pure game modules |
| Snapshot version | junior-baseline-a1e0570-2026-07-14 | scripts/balance/junior-baseline-snapshot.mjs |
| Manual base production | 1 | src/gameData.ts gameplayStatDefinitions |
| Report conversion | 1 | src/game/commands.ts reportAllBugs |
| Promotion requirements | [{"id":"requirement_lifetime_bugs_found_100","type":"lifetime_resource_at_least","source":"current_run_lifetime_bugs_found","resourceId":"bugs_found","amount":100},{"id":"requirement_lifetime_money_earned_150","type":"lifetime_resource_at_least","source":"current_run_lifetime_money_earned","resourceId":"money","amount":150},{"id":"requirement_purchased_upgrades_3","type":"purchased_upgrades_at_least","source":"purchased_mvp_upgrades","amount":3}] | src/gameData.ts promotionDefinitions |
| Basic Upgrades | upgrade_better_checklist:10, upgrade_coffee:25, upgrade_keyboard_shortcuts:60, upgrade_bug_report_template:100, upgrade_test_case_library:250 | src/gameData.ts upgrades |

## Precision Check

| Field | Expected | Actual | Result |
| --- | --- | --- | --- |
| Numeric scale | 6 decimal places | 6 | PASS |
| Report conversion | Preserve fractional Bugs Found and set Bugs Found to zero | Covered by simulator tests and gate_decimal_preservation | PASS |
| Offline Money | No automatic Money | 201.6 Money after explicit return Report | PASS |

## Strategy Comparison

| Strategy Scenario | Middle Seconds | Supports | Purchase Actions | Meaningful Decisions |
| --- | ---: | --- | ---: | ---: |
| scenario_level_first | 901 | none | 8 | 6 |
| scenario_support_first | 1351 | support_immediate_production, support_offline_handover, support_training_economics | 11 | 8 |
| scenario_mixed | 991 | support_immediate_production | 9 | 7 |
| scenario_skip_supports | 901 | none | 8 | 6 |

## Parameter Changes Recommended

| Parameter Group | Related Gate | Recommendation |
| --- | --- | --- |
| group_manual | gate_junior_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_cost | gate_total_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_decisions | gate_meaningful_decisions | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_manual_cadence | gate_active_not_trivial | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |

## Observed Stalls And Runaway Signals

- Maximum stall windows are recorded per scenario in the JSON artifact.
- Safe-bound status: no safe-bound runaway detected.
- Buy Max milestone crossing status: milestone emitted.

## Known Risks And Limitations

- Junior baseline is a checked snapshot with source references rather than a runtime import, to avoid coupling this standalone simulator to browser/UI state.
- Strategy policies are deterministic approximations for validation, not player-behavior predictions.
- No Phase 6B tuning was performed; failed gates are honest baseline observations.
- The active React gameplay, save/load, and backlog were not modified.

## Freeze Recommendation

Do not freeze doc 15 yet unless blocker and major failures are explicitly accepted or resolved in Phase 6B.
