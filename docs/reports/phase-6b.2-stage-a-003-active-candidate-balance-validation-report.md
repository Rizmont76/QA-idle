# Playable Idle MVP Balance Acceptance Report

Parameter version: doc15-provisional-implementation-candidate-v1-phase-6b.2-stage-a-003
Parameter profile: phase-6b.2-stage-a-003
Junior baseline version: junior-baseline-a1e0570-2026-07-14
Junior baseline source commit/version: a1e0570830765e34a848aba71198cd12149d3a12
Junior baseline snapshot hash: 1fe7f506367c028b441ee6ca3781b06a9b1f2bc9ab0ce8a238466c00f5a6c3e8
Simulator version: phase-6a.2-simulator-v3
Run date: 2026-07-16T13:29:59.830Z
Document status at run: DRAFT - Simulation Validation Required

## Summary

- Overall result: PASS
- Blocker failures: 0
- Major failures: 0
- Minor failures: 0
- Passed gates: 30

## Scenario Results

| Scenario | Strategy | Start Snapshot | Endpoint Time | Purchase Actions | Meaningful Decisions | Supports Owned | Result |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| scenario_junior_baseline | junior_baseline | new_run | n/a | 4 | 0 | none | Incomplete |
| scenario_level_first | level_first | post-promotion-1fe7f506367c | 32m 21s | 8 | 9 | none | Endpoint |
| scenario_support_first | support_first | post-promotion-1fe7f506367c | 29m 21s | 11 | 3 | support_immediate_production, support_offline_handover, support_training_economics | Endpoint |
| scenario_mixed | mixed | post-promotion-1fe7f506367c | 29m 21s | 10 | 4 | support_immediate_production, support_training_economics | Endpoint |
| scenario_skip_supports | skip_supports | post-promotion-1fe7f506367c | 32m 21s | 8 | 9 | none | Endpoint |
| scenario_low_click_middle | mixed | post-promotion-1fe7f506367c | 32m 21s | 10 | 4 | support_immediate_production, support_training_economics | Endpoint |
| scenario_active_click_middle | mixed | post-promotion-1fe7f506367c | 23m 21s | 10 | 6 | support_immediate_production, support_training_economics | Endpoint |
| scenario_offline_return_without_support | mixed | post-promotion-1fe7f506367c | 159m 44s | 10 | 4 | support_immediate_production, support_training_economics | Endpoint |
| scenario_offline_return_with_support | mixed | post-promotion-1fe7f506367c | 172m 24s | 12 | 3 | support_immediate_production, support_offline_handover, support_training_economics | Endpoint |
| scenario_no_support_completion | skip_supports | post-promotion-1fe7f506367c | 32m 21s | 8 | 9 | none | Endpoint |
| scenario_buy_max_milestone_crossing | buy_max_heavy | controlled-buy-max-1fe7f506367c | 8m 21s | 1 | 0 | none | Endpoint |
| scenario_endpoint_completion | mixed | post-promotion-1fe7f506367c | 29m 21s | 10 | 4 | support_immediate_production, support_training_economics | Endpoint |
| scenario_capstone_reachability_sanity | mixed | post-promotion-1fe7f506367c | 29m 21s | 27 | 6 | support_immediate_production, support_training_economics | Endpoint |
| scenario_full_run_low_engagement_info | mixed | post-promotion-1fe7f506367c | 35m 21s | 10 | 4 | support_immediate_production, support_training_economics | Endpoint |

## Gate Results

| Gate | Scenario | Target | Actual | Result | Severity |
| --- | --- | --- | --- | --- | --- |
| gate_junior_baseline_inputs | scenario_junior_baseline | complete versioned Junior snapshot | junior-baseline-a1e0570-2026-07-14 | PASS | Blocker |
| gate_junior_duration | scenario_junior_baseline | 480-720 seconds | 500 | PASS | Major |
| gate_junior_baseline_cadence_validity | scenario_junior_baseline | explicit positive Junior baseline manual/report cadence | manual 9s, report 25s | PASS | Blocker |
| gate_middle_duration | scenario_mixed | 900-1500 seconds after promotion | 1261 | PASS | Blocker |
| gate_total_duration | scenario_junior_baseline + scenario_mixed | 1500-2400 seconds | 1761 | PASS | Blocker |
| gate_purchase_actions | scenario_mixed | 10-16 purchase actions | 14 | PASS | Major |
| gate_meaningful_decisions | scenario_mixed | 3-5 decisions, deduped | 4 | PASS | Major |
| gate_low_click_middle_completion | scenario_low_click_middle | <= 1500 seconds after promotion | 1441 | PASS | Blocker |
| gate_active_not_trivial | scenario_active_click_middle | active/mixed ratio 0.70-0.90 | 0.715 | PASS | Major |
| gate_offline_bugs_only | offline scenarios | offline produces Bugs Found only | money unchanged during offline | PASS | Blocker |
| gate_offline_cap | offline scenarios | <= 7200 eligible seconds | 7200 | PASS | Blocker |
| gate_decimal_preservation | all | fixed-point decimals preserved through Report | 6 decimal places | PASS | Blocker |
| gate_buy_max_milestones | scenario_buy_max_milestone_crossing | one Buy Max action buys >=2 levels, crosses milestone, emits feedback | actions 1, levels 2, 6->8, milestones milestone_assistant_first | PASS | Blocker |
| gate_no_support_completion | scenario_no_support_completion | <= 2700 seconds after promotion | 1441 | PASS | Blocker |
| gate_support_not_required | scenario_no_support_completion | no support required | none | PASS | Blocker |
| gate_universal_strategy_dominance | strategy comparison | no strategy beats every alternative by >20% | no universal dominance | PASS | Major |
| gate_support_not_universally_dominant | strategy comparison | support-first is not universally dominant | no universal dominance | PASS | Major |
| gate_safe_bounds | all | resources/rates/costs below safe max | within safe bounds | PASS | Blocker |
| gate_capstone_sanity | scenario_capstone_reachability_sanity | capstone reachable in dedicated capstone scenario | reached at 6020s | PASS | Minor |
| gate_capstone_excluded_from_endpoint_scenarios | ordinary endpoint scenarios | capstone not reached before ordinary endpoints | none | PASS | Blocker |
| gate_scenario_completion | all required endpoint scenarios | all non-capstone Middle scenarios complete endpoint | all completed | PASS | Blocker |
| gate_maximum_stall_window | all | <= 180s | 180 | PASS | Major |
| gate_phase_specific_stalls | Junior and Middle phases | each scenario stall <= 180s | scenario_junior_baseline:175; scenario_level_first:180; scenario_support_first:180; scenario_mixed:180; scenario_skip_supports:180; scenario_low_click_middle:180; scenario_active_click_middle:90; scenario_offline_return_without_support:58; scenario_offline_return_with_support:180; scenario_no_support_completion:180; scenario_buy_max_milestone_crossing:1; scenario_endpoint_completion:180; scenario_capstone_reachability_sanity:180 | PASS | Major |
| gate_endpoint_not_earlier_than_min_duration | scenario_junior_baseline + scenario_mixed | >= 1500s total online gameplay | 1761 | PASS | Blocker |
| gate_buy_max_safe_level_limit | all | <= 5 levels per Buy Max before endpoint | within limit | PASS | Blocker |
| gate_support_immediate_viability | support scenarios | Immediate Support has at least one rational online purchase window | purchased online | PASS | Major |
| gate_support_training_viability | support scenarios | Training Support has payback horizon and is not mandatory | payback recorded and no-support endpoint completed | PASS | Major |
| gate_support_offline_viability | controlled offline handover comparison | isolated Handover ratio matches offline efficiency ratio | 5090.4 -> 9017.28; ratio 1.7714285714285716 | PASS | Major |
| gate_mixed_support_utility | scenario_mixed | mixed does not buy unsupported negative-utility Support Upgrades | no negative utility support purchases | PASS | Major |
| gate_capstone_stall_informational | scenario_capstone_reachability_sanity | capstone post-endpoint stall reported separately | 420 | PASS | Minor |

## Failed Gates Grouped By Severity

### Blocker

None.

### Major

None.

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
| Offline Money | No automatic Money | 2016 Money after explicit return Report | PASS |

## Strategy Comparison

| Strategy Scenario | Middle Seconds | Supports | Purchase Actions | Meaningful Decisions |
| --- | ---: | --- | ---: | ---: |
| scenario_level_first | 1441 | none | 8 | 9 |
| scenario_support_first | 1261 | support_immediate_production, support_offline_handover, support_training_economics | 11 | 3 |
| scenario_mixed | 1261 | support_immediate_production, support_training_economics | 10 | 4 |
| scenario_skip_supports | 1441 | none | 8 | 9 |

## Support Upgrade Viability

| Support | Purchased In | Payback / Utility |
| --- | --- | --- |
| support_immediate_production | scenario_support_first | payback 545.455s; opportunity 0.6 levels; endpoint utility 231.791 |
| support_training_economics | scenario_support_first | payback 62.609s; opportunity 0.571429 levels; endpoint utility 227.083 |
| support_offline_handover | scenario_support_first | payback 1800s; opportunity 0.453172 levels; endpoint utility -59.524 |
| support_immediate_production | scenario_mixed | payback 545.455s; opportunity 0.6 levels; endpoint utility 231.791 |
| support_training_economics | scenario_mixed | payback 54.442s; opportunity 0.490798 levels; endpoint utility 174.057 |
| support_immediate_production | scenario_low_click_middle | payback 545.455s; opportunity 0.6 levels; endpoint utility 363.66 |
| support_training_economics | scenario_low_click_middle | payback 54.442s; opportunity 0.490798 levels; endpoint utility 197.326 |
| support_immediate_production | scenario_active_click_middle | payback 545.455s; opportunity 0.6 levels; endpoint utility 78.47 |
| support_training_economics | scenario_active_click_middle | payback 54.442s; opportunity 0.490798 levels; endpoint utility 128.571 |
| support_immediate_production | scenario_offline_return_without_support | payback 545.455s; opportunity 0.6 levels; endpoint utility 15.377 |
| support_training_economics | scenario_offline_return_without_support | payback 54.442s; opportunity 0.490798 levels; endpoint utility 174.057 |
| support_immediate_production | scenario_offline_return_with_support | payback 545.455s; opportunity 0.6 levels; endpoint utility 231.791 |
| support_training_economics | scenario_offline_return_with_support | payback 62.609s; opportunity 0.571429 levels; endpoint utility 227.083 |
| support_offline_handover | scenario_offline_return_with_support | payback 1800s; opportunity 0.453172 levels; endpoint utility -59.524 |
| support_immediate_production | scenario_endpoint_completion | payback 545.455s; opportunity 0.6 levels; endpoint utility 231.791 |
| support_training_economics | scenario_endpoint_completion | payback 54.442s; opportunity 0.490798 levels; endpoint utility 174.057 |
| support_immediate_production | scenario_capstone_reachability_sanity | payback 545.455s; opportunity 0.6 levels; endpoint utility 231.791 |
| support_training_economics | scenario_capstone_reachability_sanity | payback 54.442s; opportunity 0.490798 levels; endpoint utility 174.057 |
| support_immediate_production | scenario_full_run_low_engagement_info | payback 545.455s; opportunity 0.6 levels; endpoint utility 471.358 |
| support_training_economics | scenario_full_run_low_engagement_info | payback 54.442s; opportunity 0.490798 levels; endpoint utility 213.158 |

## Offline Comparison

| Scenario | Pre-Offline Online | Offline Wall Clock | Eligible Offline | Post-Return Online | Online Total | Wall-Clock Total | Offline Bugs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| scenario_offline_return_without_support | 0 | 9000 | 7200 | 84 | 84 | 9584 | 2016 |
| scenario_offline_return_with_support | 840 | 9000 | 7200 | 4 | 844 | 10344 | 9017.28 |

## Controlled Handover Comparison

| Field | Value |
| --- | --- |
| Reference Assistant level | 5 |
| Base online production rate | 2.02 |
| Reference supports before fork | support_immediate_production, support_training_economics |
| Without Handover efficiency | 0.35 |
| With Handover efficiency | 0.62 |
| Eligible seconds | 7200 |
| Bugs gained without Handover | 5090.4 |
| Bugs gained with Handover | 9017.28 |
| Normalized improvement ratio | 1.7714285714285716 |
| Expected efficiency ratio | 1.7714285714285716 |
| Tolerance | 0.000001 |
| Result | PASS |

## Parameter Changes Recommended

| Parameter Group | Related Gate | Recommendation |
| --- | --- | --- |
| None | All gates passed | No tuning recommended. |

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
