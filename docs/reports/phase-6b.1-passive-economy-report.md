# Phase 6B.1 Passive Economy Robustness Search Report

Baseline parameter version: doc15-provisional-2026-07-14
Search status: no robust recommendation found within locked Phase 6B.1 search space
Candidates evaluated: 60
Base-valid candidates: 0
Robust candidates: 0

## Locked Cadence Profiles

| Profile | Manual Interval | Report Interval |
| --- | ---: | ---: |
| Junior baseline | 9s | 25s |
| Middle baseline | 10s | 60s |
| Middle active | 4s | 45s |
| Middle low-click | 20s | 90s |

## Search Ranges

The full bounded search space is recorded in `artifacts/balance/phase-6b.1-robust-search-space.json`.

## Result

No Phase 6B.1 parameters were applied to runtime gameplay or document 15.

Best candidate: phase-6b.1-fine-01-2

Best timing: Junior 8m 20s, Middle 20m 1s, total 28m 21s.

Best active/mixed ratio: 0.638

Best remaining failures: gate_low_click_middle_completion (Blocker), gate_active_not_trivial (Major)

## Top Candidates

| Candidate | Phase | Junior | Middle | Total | Active/Mixed | Low-click | Decisions | Blocker/Major |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| phase-6b.1-fine-01-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-02-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-03-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-04-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-05-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-06-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-07-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |
| phase-6b.1-fine-08-2 | fine | 500 | 1201 | 1701 | 0.638 | 1531 | 5 | 1/1 |

## Best Candidate Parameter Diff

| Parameter | Phase 6A.2 | Candidate |
| --- | ---: | ---: |
| PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS | 6 | 9 |
| PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS | 30 | 25 |
| PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS | 12 | 10 |
| PARAM_ASSISTANT_BASE_BUGS_PER_SECOND | 0.08 | 0.34 |
| PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL | 0.035 | 0.07 |
| PARAM_ASSISTANT_LEVEL_BASE_COST | 25 | 90 |
| PARAM_ASSISTANT_LEVEL_COST_GROWTH | 1.18 | 1.14 |
| PARAM_ASSISTANT_LEVEL_LINEAR_COST | 3 | 14 |
| PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER | 1.35 | 1.55 |
| PARAM_SUPPORT_IMMEDIATE_PRICE | 95 | 120 |
| PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND | 0.12 | 0.22 |
| PARAM_SUPPORT_TRAINING_PRICE | 140 | 160 |
| PARAM_SUPPORT_TRAINING_COST_MULTIPLIER | 0.88 | 0.76 |
| PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT | 0.55 | 0.62 |

## Support Diagnostics

| Scenario | Support | Time | Payback Seconds | Endpoint Utility Seconds |
| --- | --- | ---: | ---: | ---: |
| scenario_active_click_middle | support_immediate_production | 545 | 545.455 | 44.982 |
| scenario_support_first | support_immediate_production | 680 | 545.455 | 186.14 |
| scenario_mixed | support_immediate_production | 680 | 545.455 | 186.14 |
| scenario_offline_return_with_support | support_immediate_production | 680 | 545.455 | 186.14 |
| scenario_endpoint_completion | support_immediate_production | 680 | 545.455 | 186.14 |
| scenario_capstone_reachability_sanity | support_immediate_production | 680 | 545.455 | 186.14 |
| scenario_full_run_low_engagement_info | support_immediate_production | 680 | 545.455 | 871.103 |
| scenario_low_click_middle | support_immediate_production | 770 | 545.455 | 377.5 |
| scenario_active_click_middle | support_training_economics | 815 | 97.627 | 66.832 |
| scenario_support_first | support_training_economics | 1040 | 97.627 | 106.299 |
| scenario_mixed | support_training_economics | 1040 | 97.627 | 106.299 |
| scenario_offline_return_with_support | support_training_economics | 1040 | 97.627 | 106.299 |

## Robustness

| Candidate | Perturbation | Total | Middle | Active/Mixed | Blocker/Major | Catastrophic |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| phase-6b.1-fine-01-2 | base | 1701 | 1201 | 0.638 | 1/1 | no |
| phase-6b.1-fine-01-2 | production-minus-5 | 1761 | 1261 | 0.607 | 1/4 | no |
| phase-6b.1-fine-01-2 | production-plus-5 | 1701 | 1201 | 0.638 | 1/4 | no |
| phase-6b.1-fine-01-2 | cost-minus-5 | 1581 | 1081 | 0.625 | 0/2 | no |
| phase-6b.1-fine-01-2 | cost-plus-5 | 1941 | 1441 | 0.625 | 1/3 | no |
| phase-6b.1-fine-01-2 | production-minus-10 | 1821 | 1321 | 0.58 | 1/4 | no |
| phase-6b.1-fine-01-2 | production-plus-10 | 1701 | 1201 | 0.6 | 0/2 | no |
| phase-6b.1-fine-01-2 | cost-minus-10 | 1401 | 901 | 0.65 | 2/2 | no |
| phase-6b.1-fine-01-2 | cost-plus-10 | 2181 | 1681 | 0.643 | 2/3 | no |
| phase-6b.1-fine-01-2 | production-minus-5-cost-plus-5 | 2001 | 1501 | 0.6 | 2/3 | no |
| phase-6b.1-fine-01-2 | production-plus-5-cost-minus-5 | 1521 | 1021 | 0.618 | 0/2 | no |
| phase-6b.1-fine-01-2 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 0.638 | 1/2 | no |
| phase-6b.1-fine-01-2 | support-price-minus-10-effect-plus-10 | 1761 | 1261 | 0.607 | 1/3 | no |

## Conclusion

The locked active cadence remains the limiting constraint in this bounded search. The strongest base candidate still misses at least one Blocker or Major gate, so Phase 6B.1 returns no recommended parameter file instead of weakening gates or modifying approved behavior.
