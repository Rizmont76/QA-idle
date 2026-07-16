# Playable Idle MVP Balance Acceptance Report

Parameter version: doc15-provisional-2026-07-14
Parameter profile: historical-doc15-provisional-2026-07-14
Junior baseline version: junior-baseline-a1e0570-2026-07-14
Junior baseline source commit/version: a1e0570830765e34a848aba71198cd12149d3a12
Junior baseline snapshot hash: 1fe7f506367c028b441ee6ca3781b06a9b1f2bc9ab0ce8a238466c00f5a6c3e8
Simulator version: phase-6a.2-simulator-v3
Run date: 2026-07-16T13:30:08.474Z
Document status at run: DRAFT - Simulation Validation Required

## Summary

- Overall result: FAIL - baseline captured with validation failures
- Blocker failures: 3
- Major failures: 2
- Minor failures: 0
- Passed gates: 25

## Scenario Results

| Scenario | Strategy | Start Snapshot | Endpoint Time | Purchase Actions | Meaningful Decisions | Supports Owned | Result |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| scenario_junior_baseline | junior_baseline | new_run | n/a | 4 | 0 | none | Incomplete |
| scenario_level_first | level_first | post-promotion-1fe7f506367c | 16m 31s | 8 | 5 | none | Endpoint |
| scenario_support_first | support_first | post-promotion-1fe7f506367c | 22m 31s | 11 | 7 | support_immediate_production, support_offline_handover, support_training_economics | Endpoint |
| scenario_mixed | mixed | post-promotion-1fe7f506367c | 16m 31s | 8 | 5 | none | Endpoint |
| scenario_skip_supports | skip_supports | post-promotion-1fe7f506367c | 16m 31s | 8 | 5 | none | Endpoint |
| scenario_low_click_middle | mixed | post-promotion-1fe7f506367c | 20m 31s | 8 | 5 | none | Endpoint |
| scenario_active_click_middle | mixed | post-promotion-1fe7f506367c | 10m 46s | 8 | 8 | none | Endpoint |
| scenario_offline_return_without_support | mixed | post-promotion-1fe7f506367c | 156m 11s | 8 | 6 | none | Endpoint |
| scenario_offline_return_with_support | mixed | post-promotion-1fe7f506367c | 166m 34s | 12 | 6 | support_immediate_production, support_offline_handover, support_training_economics | Endpoint |
| scenario_no_support_completion | skip_supports | post-promotion-1fe7f506367c | 16m 31s | 8 | 5 | none | Endpoint |
| scenario_buy_max_milestone_crossing | buy_max_heavy | controlled-buy-max-1fe7f506367c | 5m 31s | 1 | 0 | none | Endpoint |
| scenario_endpoint_completion | mixed | post-promotion-1fe7f506367c | 16m 31s | 8 | 5 | none | Endpoint |
| scenario_capstone_reachability_sanity | mixed | post-promotion-1fe7f506367c | 16m 31s | 27 | 10 | support_immediate_production, support_training_economics | Endpoint |
| scenario_full_run_low_engagement_info | mixed | post-promotion-1fe7f506367c | 29m 31s | 9 | 7 | support_immediate_production | Endpoint |

## Gate Results

| Gate | Scenario | Target | Actual | Result | Severity |
| --- | --- | --- | --- | --- | --- |
| gate_junior_baseline_inputs | scenario_junior_baseline | complete versioned Junior snapshot | junior-baseline-a1e0570-2026-07-14 | PASS | Blocker |
| gate_junior_duration | scenario_junior_baseline | 480-720 seconds | 330 | FAIL | Major |
| gate_junior_baseline_cadence_validity | scenario_junior_baseline | explicit positive Junior baseline manual/report cadence | manual 6s, report 30s | PASS | Blocker |
| gate_middle_duration | scenario_mixed | 900-1500 seconds after promotion | 661 | FAIL | Blocker |
| gate_total_duration | scenario_junior_baseline + scenario_mixed | 1500-2400 seconds | 991 | FAIL | Blocker |
| gate_purchase_actions | scenario_mixed | 10-16 purchase actions | 12 | PASS | Major |
| gate_meaningful_decisions | scenario_mixed | 3-5 decisions, deduped | 5 | PASS | Major |
| gate_low_click_middle_completion | scenario_low_click_middle | <= 1500 seconds after promotion | 901 | PASS | Blocker |
| gate_active_not_trivial | scenario_active_click_middle | active/mixed ratio 0.70-0.90 | 0.478 | FAIL | Major |
| gate_offline_bugs_only | offline scenarios | offline produces Bugs Found only | money unchanged during offline | PASS | Blocker |
| gate_offline_cap | offline scenarios | <= 7200 eligible seconds | 7200 | PASS | Blocker |
| gate_decimal_preservation | all | fixed-point decimals preserved through Report | 6 decimal places | PASS | Blocker |
| gate_buy_max_milestones | scenario_buy_max_milestone_crossing | one Buy Max action buys >=2 levels, crosses milestone, emits feedback | actions 1, levels 2, 6->8, milestones milestone_assistant_first | PASS | Blocker |
| gate_no_support_completion | scenario_no_support_completion | <= 2700 seconds after promotion | 661 | PASS | Blocker |
| gate_support_not_required | scenario_no_support_completion | no support required | none | PASS | Blocker |
| gate_universal_strategy_dominance | strategy comparison | no strategy beats every alternative by >20% | no universal dominance | PASS | Major |
| gate_support_not_universally_dominant | strategy comparison | support-first is not universally dominant | no universal dominance | PASS | Major |
| gate_safe_bounds | all | resources/rates/costs below safe max | within safe bounds | PASS | Blocker |
| gate_capstone_sanity | scenario_capstone_reachability_sanity | capstone reachable in dedicated capstone scenario | reached at 6270s | PASS | Minor |
| gate_capstone_excluded_from_endpoint_scenarios | ordinary endpoint scenarios | capstone not reached before ordinary endpoints | none | PASS | Blocker |
| gate_scenario_completion | all required endpoint scenarios | all non-capstone Middle scenarios complete endpoint | all completed | PASS | Blocker |
| gate_maximum_stall_window | all | <= 180s | 180 | PASS | Major |
| gate_phase_specific_stalls | Junior and Middle phases | each scenario stall <= 180s | scenario_junior_baseline:120; scenario_level_first:120; scenario_support_first:120; scenario_mixed:120; scenario_skip_supports:120; scenario_low_click_middle:180; scenario_active_click_middle:90; scenario_offline_return_without_support:11; scenario_offline_return_with_support:60; scenario_no_support_completion:120; scenario_buy_max_milestone_crossing:1; scenario_endpoint_completion:120; scenario_capstone_reachability_sanity:120 | PASS | Major |
| gate_endpoint_not_earlier_than_min_duration | scenario_junior_baseline + scenario_mixed | >= 1500s total online gameplay | 991 | FAIL | Blocker |
| gate_buy_max_safe_level_limit | all | <= 5 levels per Buy Max before endpoint | within limit | PASS | Blocker |
| gate_support_immediate_viability | support scenarios | Immediate Support has at least one rational online purchase window | purchased online | PASS | Major |
| gate_support_training_viability | support scenarios | Training Support has payback horizon and is not mandatory | payback recorded and no-support endpoint completed | PASS | Major |
| gate_support_offline_viability | controlled offline handover comparison | isolated Handover ratio matches offline efficiency ratio | 945 -> 1485; ratio 1.5714285714285714 | PASS | Major |
| gate_mixed_support_utility | scenario_mixed | mixed does not buy unsupported negative-utility Support Upgrades | no negative utility support purchases | PASS | Major |
| gate_capstone_stall_informational | scenario_capstone_reachability_sanity | capstone post-endpoint stall reported separately | 660 | PASS | Minor |

## Failed Gates Grouped By Severity

### Blocker

- gate_middle_duration: actual 661; target 900-1500 seconds after promotion; recommended group group_assistant_cost.
- gate_total_duration: actual 991; target 1500-2400 seconds; recommended group group_cost.
- gate_endpoint_not_earlier_than_min_duration: actual 991; target >= 1500s total online gameplay; recommended group group_cost.

### Major

- gate_junior_duration: actual 330; target 480-720 seconds; recommended group group_manual.
- gate_active_not_trivial: actual 0.478; target active/mixed ratio 0.70-0.90; recommended group group_manual_cadence.

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
| scenario_level_first | 661 | none | 8 | 5 |
| scenario_support_first | 1021 | support_immediate_production, support_offline_handover, support_training_economics | 11 | 7 |
| scenario_mixed | 661 | none | 8 | 5 |
| scenario_skip_supports | 661 | none | 8 | 5 |

## Support Upgrade Viability

| Support | Purchased In | Payback / Utility |
| --- | --- | --- |
| support_immediate_production | scenario_support_first | payback 791.667s; opportunity 1.319444 levels; endpoint utility -85.689 |
| support_offline_handover | scenario_support_first | payback 1800s; opportunity 1.294118 levels; endpoint utility -133.065 |
| support_training_economics | scenario_support_first | payback 300s; opportunity 1.386139 levels; endpoint utility -102.4 |
| support_immediate_production | scenario_offline_return_with_support | payback 791.667s; opportunity 1.319444 levels; endpoint utility -85.689 |
| support_offline_handover | scenario_offline_return_with_support | payback 1800s; opportunity 1.294118 levels; endpoint utility -133.065 |
| support_training_economics | scenario_offline_return_with_support | payback 350s; opportunity 1.647059 levels; endpoint utility 0 |
| support_immediate_production | scenario_capstone_reachability_sanity | payback 791.667s; opportunity 0.805085 levels; endpoint utility 0 |
| support_training_economics | scenario_capstone_reachability_sanity | payback 257.143s; opportunity 1.186441 levels; endpoint utility 0 |
| support_immediate_production | scenario_full_run_low_engagement_info | payback 791.667s; opportunity 1.9 levels; endpoint utility 34.684 |

## Offline Comparison

| Scenario | Pre-Offline Online | Offline Wall Clock | Eligible Offline | Post-Return Online | Online Total | Wall-Clock Total | Offline Bugs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| scenario_offline_return_without_support | 0 | 9000 | 7200 | 41 | 41 | 9371 | 201.6 |
| scenario_offline_return_with_support | 660 | 9000 | 7200 | 4 | 664 | 9994 | 1623.6 |

## Controlled Handover Comparison

| Field | Value |
| --- | --- |
| Reference Assistant level | 5 |
| Base online production rate | 0.375 |
| Reference supports before fork | support_immediate_production, support_training_economics |
| Without Handover efficiency | 0.35 |
| With Handover efficiency | 0.55 |
| Eligible seconds | 7200 |
| Bugs gained without Handover | 945 |
| Bugs gained with Handover | 1485 |
| Normalized improvement ratio | 1.5714285714285714 |
| Expected efficiency ratio | 1.5714285714285716 |
| Tolerance | 0.000001 |
| Result | PASS |

## Parameter Changes Recommended

| Parameter Group | Related Gate | Recommendation |
| --- | --- | --- |
| group_manual | gate_junior_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_assistant_cost | gate_middle_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_cost | gate_total_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_manual_cadence | gate_active_not_trivial | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |
| group_cost | gate_endpoint_not_earlier_than_min_duration | Keep doc 15 value unchanged for Phase 6A; tune this group in Phase 6B if accepted. |

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
