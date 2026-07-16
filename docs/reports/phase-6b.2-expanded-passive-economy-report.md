# Phase 6B.2 Expanded Passive Economy Report

Baseline parameter version: doc15-provisional-2026-07-14
Search status: no robust recommendation found after expanded boundary-aware search

## Feasibility Analysis

| Profile | Manual Interval | Manual Bugs/sec | Manual Money/sec |
| --- | ---: | ---: | ---: |
| baseline_middle | 10 | 0.5 | 0.5 |
| active_middle | 4 | 1.25 | 1.25 |
| low_click_middle | 20 | 0.25 | 0.25 |

| Target Active/Mixed Ratio | Required Passive Bugs/sec |
| ---: | ---: |
| 0.7 | 1.25 |
| 0.75 | 1.75 |
| 0.8 | 2.5 |
| 0.85 | 3.75 |

Formula estimates put 0.70 active/mixed near 1.25 passive Bugs/sec before simulator timing effects, so 6B.2 expands base/per-level production well beyond the 6B.1 0.34/0.085 ceilings and pairs those rates with higher cost curves.

## Search Counts

| Stage | Candidates |
| --- | ---: |
| Stage A production shape | 9 |
| Stage B duration restoration | 66 |
| Stage C support/decision tuning | 32 |
| Total | 107 |

Base-valid candidates: 32
Robust candidates: 0

## Boundary Expansions

| Parameter | From | To | Reason |
| --- | ---: | ---: | --- |
| PARAM_ASSISTANT_BASE_BUGS_PER_SECOND | 2 | 2.4 | Initial expanded production probe included base-valid high-passive shapes at the upper 2.00 exploration bound. |
| PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL | 0.45 | 0.5 | Local refinement kept per-level production away from a hard ceiling before boundary-pressure assessment. |
| PARAM_ASSISTANT_LEVEL_BASE_COST | 500 | 550 | Cost restoration candidates touched the initial 500 upper bound during duration probing. |

## Candidate Result

Reference candidate: phase-6b.2-stage-a-003

Recommendation: none

Timing: Junior 8m 20s, Middle 21m 1s, total 29m 21s.

## Diverse Shortlist

| Candidate | Stage | Middle | Total | Active/Mixed | Low-click | Decisions |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| phase-6b.2-stage-a-003 | stage-a-production-shape | 1261 | 1761 | 0.715 | 1441 | 4 |
| phase-6b.2-stage-c-02-02-2 | stage-c-support-decision-tuning | 1261 | 1761 | 0.786 | 1351 | 4 |
| phase-6b.2-stage-b-06-08 | stage-b-duration-restoration | 1201 | 1701 | 0.825 | 1261 | 4 |

## Parameter Diff

| Parameter | Phase 6A.2 | Reference Candidate |
| --- | ---: | ---: |
| PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS | 6 | 9 |
| PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS | 30 | 25 |
| PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS | 12 | 10 |
| PARAM_ASSISTANT_BASE_BUGS_PER_SECOND | 0.08 | 0.8 |
| PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL | 0.035 | 0.2 |
| PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER | 1.35 | 1.3 |
| PARAM_ASSISTANT_LEVEL_BASE_COST | 25 | 200 |
| PARAM_ASSISTANT_LEVEL_COST_GROWTH | 1.18 | 1.14 |
| PARAM_ASSISTANT_LEVEL_LINEAR_COST | 3 | 10 |
| PARAM_SUPPORT_IMMEDIATE_PRICE | 95 | 120 |
| PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND | 0.12 | 0.22 |
| PARAM_SUPPORT_TRAINING_PRICE | 140 | 160 |
| PARAM_SUPPORT_TRAINING_COST_MULTIPLIER | 0.88 | 0.76 |
| PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL | 3 | 2 |
| PARAM_SUPPORT_OFFLINE_PRICE | 110 | 150 |
| PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT | 0.55 | 0.62 |

## Production Shares

| Assistant Level | Passive Bugs/sec | Baseline Passive Share | Baseline Manual Share | Active Manual Share | Low-click Manual Share |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0.8 | 0.6154 | 0.3846 | 0.6098 | 0.2381 |
| 3 | 1.4 | 0.7368 | 0.2632 | 0.4717 | 0.1515 |
| 5 | 1.8 | 0.7826 | 0.2174 | 0.4098 | 0.122 |
| 8 | 3.12 | 0.8619 | 0.1381 | 0.286 | 0.0742 |

## Strategy Timings

| Strategy | Middle Seconds |
| --- | ---: |
| level-first | 1441 |
| mixed | 1261 |
| support-first | 1261 |
| no-support | 1441 |

## Support Utility

| Scenario | Support | Time | Payback Seconds | Endpoint Utility Seconds |
| --- | --- | ---: | ---: | ---: |
| scenario_active_click_middle | support_immediate_production | 545 | 545.455 | 78.47 |
| scenario_support_first | support_immediate_production | 560 | 545.455 | 231.791 |
| scenario_mixed | support_immediate_production | 560 | 545.455 | 231.791 |
| scenario_offline_return_with_support | support_immediate_production | 560 | 545.455 | 231.791 |
| scenario_endpoint_completion | support_immediate_production | 560 | 545.455 | 231.791 |
| scenario_capstone_reachability_sanity | support_immediate_production | 560 | 545.455 | 231.791 |
| scenario_low_click_middle | support_immediate_production | 590 | 545.455 | 363.66 |
| scenario_full_run_low_engagement_info | support_immediate_production | 680 | 545.455 | 471.358 |
| scenario_active_click_middle | support_training_economics | 905 | 54.442 | 128.571 |
| scenario_support_first | support_training_economics | 920 | 62.609 | 227.083 |
| scenario_offline_return_with_support | support_training_economics | 920 | 62.609 | 227.083 |
| scenario_mixed | support_training_economics | 1100 | 54.442 | 174.057 |

## Decision Trace

| # | Online Seconds | Viable Categories | Affordable | Near Affordable |
| ---: | ---: | --- | --- | --- |
| 1 | 60 | assistant_level, support_immediate_production | support_immediate_production | assistant_level |
| 2 | 420 | assistant_level, support_training_economics | support_training_economics | assistant_level |
| 3 | 900 | assistant_level, support_offline_handover | support_offline_handover | assistant_level |
| 4 | 1080 | assistant_level, support_offline_handover | assistant_level, support_offline_handover | none |

## Sensitivity

| Candidate | Perturbation | Total | Middle | Low-click | Active/Mixed | Blocker/Major | Catastrophic |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| phase-6b.2-stage-a-003 | base | 1761 | 1261 | 1441 | 0.715 | 0/0 | no |
| phase-6b.2-stage-a-003 | production-minus-5 | 1821 | 1321 | 1531 | 0.716 | 1/3 | no |
| phase-6b.2-stage-a-003 | production-plus-5 | 1701 | 1201 | 1441 | 0.75 | 0/0 | no |
| phase-6b.2-stage-a-003 | cost-minus-5 | 1581 | 1081 | 1261 | 0.709 | 0/1 | no |
| phase-6b.2-stage-a-003 | cost-plus-5 | 2001 | 1501 | 1711 | 0.75 | 2/2 | no |
| phase-6b.2-stage-a-003 | production-minus-10 | 1821 | 1321 | 1531 | 0.716 | 1/0 | no |
| phase-6b.2-stage-a-003 | production-plus-10 | 1701 | 1201 | 1351 | 0.713 | 0/1 | no |
| phase-6b.2-stage-a-003 | cost-minus-10 | 1401 | 901 | 1081 | 0.7 | 2/1 | no |
| phase-6b.2-stage-a-003 | cost-plus-10 | 2301 | 1801 | 2071 | 0.75 | 2/2 | no |
| phase-6b.2-stage-a-003 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1801 | 0.721 | 2/2 | no |
| phase-6b.2-stage-a-003 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1171 | 0.75 | 0/1 | no |
| phase-6b.2-stage-a-003 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 1441 | 0.75 | 0/1 | no |
| phase-6b.2-stage-a-003 | support-price-minus-10-effect-plus-10 | 1761 | 1261 | 1531 | 0.75 | 1/0 | no |
| phase-6b.2-stage-b-01-03 | base | 1761 | 1261 | 1441 | 0.715 | 0/0 | no |
| phase-6b.2-stage-b-01-03 | production-minus-5 | 1821 | 1321 | 1531 | 0.716 | 1/3 | no |
| phase-6b.2-stage-b-01-03 | production-plus-5 | 1701 | 1201 | 1441 | 0.75 | 0/0 | no |
| phase-6b.2-stage-b-01-03 | cost-minus-5 | 1581 | 1081 | 1261 | 0.709 | 0/1 | no |
| phase-6b.2-stage-b-01-03 | cost-plus-5 | 2001 | 1501 | 1711 | 0.75 | 2/2 | no |
| phase-6b.2-stage-b-01-03 | production-minus-10 | 1821 | 1321 | 1531 | 0.716 | 1/0 | no |
| phase-6b.2-stage-b-01-03 | production-plus-10 | 1701 | 1201 | 1351 | 0.713 | 0/1 | no |
| phase-6b.2-stage-b-01-03 | cost-minus-10 | 1401 | 901 | 1081 | 0.7 | 2/1 | no |
| phase-6b.2-stage-b-01-03 | cost-plus-10 | 2301 | 1801 | 2071 | 0.75 | 2/2 | no |
| phase-6b.2-stage-b-01-03 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1801 | 0.721 | 2/2 | no |
| phase-6b.2-stage-b-01-03 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1171 | 0.75 | 0/1 | no |
| phase-6b.2-stage-b-01-03 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 1441 | 0.75 | 0/1 | no |
| phase-6b.2-stage-b-01-03 | support-price-minus-10-effect-plus-10 | 1761 | 1261 | 1531 | 0.75 | 1/0 | no |
| phase-6b.2-stage-c-01-01-1 | base | 1761 | 1261 | 1441 | 0.715 | 0/0 | no |
| phase-6b.2-stage-c-01-01-1 | production-minus-5 | 1821 | 1321 | 1531 | 0.716 | 1/2 | no |
| phase-6b.2-stage-c-01-01-1 | production-plus-5 | 1701 | 1201 | 1441 | 0.75 | 0/0 | no |
| phase-6b.2-stage-c-01-01-1 | cost-minus-5 | 1581 | 1081 | 1261 | 0.709 | 0/0 | no |
| phase-6b.2-stage-c-01-01-1 | cost-plus-5 | 2001 | 1501 | 1711 | 0.75 | 2/2 | no |
| phase-6b.2-stage-c-01-01-1 | production-minus-10 | 1821 | 1321 | 1531 | 0.716 | 1/0 | no |
| phase-6b.2-stage-c-01-01-1 | production-plus-10 | 1701 | 1201 | 1351 | 0.713 | 0/0 | no |
| phase-6b.2-stage-c-01-01-1 | cost-minus-10 | 1401 | 901 | 1081 | 0.7 | 2/1 | no |
| phase-6b.2-stage-c-01-01-1 | cost-plus-10 | 2301 | 1801 | 2071 | 0.75 | 2/2 | no |
| phase-6b.2-stage-c-01-01-1 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1801 | 0.721 | 2/2 | no |
| phase-6b.2-stage-c-01-01-1 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1171 | 0.75 | 0/1 | no |
| phase-6b.2-stage-c-01-01-1 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 1441 | 0.75 | 0/0 | no |
| phase-6b.2-stage-c-01-01-1 | support-price-minus-10-effect-plus-10 | 1761 | 1261 | 1531 | 0.75 | 1/0 | no |
| phase-6b.2-stage-c-01-01-2 | base | 1761 | 1261 | 1441 | 0.715 | 0/0 | no |
| phase-6b.2-stage-c-01-01-2 | production-minus-5 | 1821 | 1321 | 1531 | 0.716 | 1/3 | no |
| phase-6b.2-stage-c-01-01-2 | production-plus-5 | 1701 | 1201 | 1441 | 0.75 | 0/0 | no |
| phase-6b.2-stage-c-01-01-2 | cost-minus-5 | 1581 | 1081 | 1261 | 0.709 | 0/1 | no |
| phase-6b.2-stage-c-01-01-2 | cost-plus-5 | 2001 | 1501 | 1711 | 0.75 | 2/2 | no |
| phase-6b.2-stage-c-01-01-2 | production-minus-10 | 1821 | 1321 | 1531 | 0.716 | 1/0 | no |
| phase-6b.2-stage-c-01-01-2 | production-plus-10 | 1701 | 1201 | 1351 | 0.713 | 0/1 | no |
| phase-6b.2-stage-c-01-01-2 | cost-minus-10 | 1401 | 901 | 1081 | 0.7 | 2/1 | no |
| phase-6b.2-stage-c-01-01-2 | cost-plus-10 | 2301 | 1801 | 2071 | 0.75 | 2/2 | no |
| phase-6b.2-stage-c-01-01-2 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1801 | 0.721 | 2/2 | no |
| phase-6b.2-stage-c-01-01-2 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1171 | 0.75 | 0/1 | no |
| phase-6b.2-stage-c-01-01-2 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 1441 | 0.75 | 0/1 | no |
| phase-6b.2-stage-c-01-01-2 | support-price-minus-10-effect-plus-10 | 1761 | 1261 | 1531 | 0.75 | 1/0 | no |
| phase-6b.2-stage-c-02-02-2 | base | 1761 | 1261 | 1351 | 0.786 | 0/0 | no |
| phase-6b.2-stage-c-02-02-2 | production-minus-5 | 1761 | 1261 | 1441 | 0.822 | 0/0 | no |
| phase-6b.2-stage-c-02-02-2 | production-plus-5 | 1701 | 1201 | 1351 | 0.825 | 0/0 | no |
| phase-6b.2-stage-c-02-02-2 | cost-minus-5 | 1581 | 1081 | 1171 | 0.792 | 0/1 | no |
| phase-6b.2-stage-c-02-02-2 | cost-plus-5 | 2001 | 1501 | 1621 | 0.81 | 2/2 | no |
| phase-6b.2-stage-c-02-02-2 | production-minus-10 | 1821 | 1321 | 1531 | 0.818 | 1/0 | no |
| phase-6b.2-stage-c-02-02-2 | production-plus-10 | 1641 | 1141 | 1261 | 0.829 | 0/0 | no |
| phase-6b.2-stage-c-02-02-2 | cost-minus-10 | 1401 | 901 | 991 | 0.8 | 2/1 | no |
| phase-6b.2-stage-c-02-02-2 | cost-plus-10 | 2241 | 1741 | 1981 | 0.828 | 2/2 | no |
| phase-6b.2-stage-c-02-02-2 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1711 | 0.779 | 2/2 | no |
| phase-6b.2-stage-c-02-02-2 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1081 | 0.794 | 0/1 | no |
| phase-6b.2-stage-c-02-02-2 | support-price-plus-10-effect-minus-10 | 1701 | 1201 | 1351 | 0.788 | 0/0 | no |
| phase-6b.2-stage-c-02-02-2 | support-price-minus-10-effect-plus-10 | 1821 | 1321 | 1441 | 0.784 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | base | 1761 | 1261 | 1441 | 0.822 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | production-minus-5 | 1821 | 1321 | 1441 | 0.818 | 0/2 | no |
| phase-6b.2-stage-c-02-04-2 | production-plus-5 | 1701 | 1201 | 1351 | 0.825 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | cost-minus-5 | 1581 | 1081 | 1171 | 0.792 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | cost-plus-5 | 2001 | 1501 | 1711 | 0.81 | 2/2 | no |
| phase-6b.2-stage-c-02-04-2 | production-minus-10 | 1881 | 1381 | 1531 | 0.783 | 1/2 | no |
| phase-6b.2-stage-c-02-04-2 | production-plus-10 | 1701 | 1201 | 1351 | 0.825 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | cost-minus-10 | 1461 | 961 | 1081 | 0.797 | 2/0 | no |
| phase-6b.2-stage-c-02-04-2 | cost-plus-10 | 2301 | 1801 | 1981 | 0.825 | 2/2 | no |
| phase-6b.2-stage-c-02-04-2 | production-minus-5-cost-plus-5 | 2061 | 1561 | 1711 | 0.808 | 2/2 | no |
| phase-6b.2-stage-c-02-04-2 | production-plus-5-cost-minus-5 | 1521 | 1021 | 1171 | 0.838 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | support-price-plus-10-effect-minus-10 | 1761 | 1261 | 1351 | 0.786 | 0/0 | no |
| phase-6b.2-stage-c-02-04-2 | support-price-minus-10-effect-plus-10 | 1821 | 1321 | 1441 | 0.818 | 0/0 | no |

## Remaining Risks

- Expanded search found base-valid candidates, but none satisfied the stricter robustness preference.
- Cost sensitivity remains tight: cost reductions can shorten total duration below the approved minimum, while cost increases can push low-click/stall gates over limits.
- No values were applied to runtime gameplay, document 15 or the implementation backlog.
