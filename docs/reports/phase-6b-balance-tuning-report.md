# Phase 6B Balance Tuning Report

Baseline parameter version: doc15-provisional-2026-07-14
Recommended version: phase-6b-recommended-candidate-v1
Candidates evaluated: 45

## Search Ranges

Search space is recorded in `artifacts/balance/phase-6b-search-space.json`.

## Shortlist

| Candidate | Junior | Middle | Total | Active/Mixed | Decisions | Purchases | Failed Gates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| phase-6b-candidate-002 | 500 | 1321 | 1821 | 0.784 | 5 | 13 | 0 |
| phase-6b-candidate-003 | 500 | 1321 | 1821 | 0.784 | 5 | 13 | 0 |
| phase-6b-candidate-010 | 500 | 1321 | 1821 | 0.784 | 5 | 13 | 0 |

## Recommendation

Recommended candidate: phase-6b-candidate-002

Endpoint timing: Junior 8m 20s, Middle 22m 1s, total 30m 21s.

## Parameter Diff

| Parameter | Phase 6A.2 | Recommended |
| --- | ---: | ---: |
| PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS | 6 | 9 |
| PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS | 30 | 25 |
| PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS | 12 | 10 |
| PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS | 4 | 7 |
| PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS | 20 | 12 |
| PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS | 90 | 60 |
| PARAM_ASSISTANT_LEVEL_BASE_COST | 25 | 60 |
| PARAM_DECISION_NEAR_AFFORD_SECONDS | 90 | 15 |
| PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL | 3 | 5 |
| PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL | 5 | 6 |

## Gate Results

| Failed Gate | Severity | Actual | Target |
| --- | --- | --- | --- |
| None | - | - | - |

## Strategy Comparison

| Strategy | Middle Seconds |
| --- | ---: |
| level-first | 1321 |
| mixed | 1321 |
| support-first | 1501 |
| no-support | 1321 |

## Support Utility

| Support | Payback Seconds | Endpoint Utility Seconds |
| --- | ---: | ---: |
| support_immediate_production | 791.667 | 93.32 |

Controlled Handover ratio: 1.5714285714285712

## Meaningful Decision Trace

| # | Online Seconds | Viable Categories | Affordable | Near Affordable |
| ---: | ---: | --- | --- | --- |
| 1 | 60 | assistant_level, support_immediate_production | assistant_level | support_immediate_production |
| 2 | 180 | assistant_level, support_immediate_production | assistant_level, support_immediate_production | none |
| 3 | 840 | assistant_level, support_training_economics | support_training_economics | assistant_level |
| 4 | 1020 | support_offline_handover, support_training_economics | support_offline_handover, support_training_economics | none |
| 5 | 1260 | assistant_level, support_offline_handover, support_training_economics | support_offline_handover, support_training_economics | assistant_level |

## Sensitivity

| Group | Multiplier | Total | Middle | Active/Mixed | Decisions | Failed Gates |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| assistant_cost | 0.9 | 1281 | 781 | 0.808 | 3 | gate_middle_duration, gate_total_duration, gate_endpoint_not_earlier_than_min_duration |
| assistant_cost | 1 | 1821 | 1321 | 0.784 | 5 | none |
| assistant_cost | 1.1 | 2541 | 2041 | 0.794 | 5 | gate_middle_duration, gate_total_duration, gate_low_click_middle_completion, gate_capstone_sanity, gate_maximum_stall_window, gate_phase_specific_stalls |
| support_prices | 0.9 | 1761 | 1261 | 0.822 | 4 | gate_maximum_stall_window, gate_phase_specific_stalls |
| support_prices | 1 | 1821 | 1321 | 0.784 | 5 | none |
| support_prices | 1.1 | 1821 | 1321 | 0.784 | 4 | gate_low_click_middle_completion |
| support_effects | 0.9 | 1821 | 1321 | 0.784 | 5 | gate_low_click_middle_completion |
| support_effects | 1 | 1821 | 1321 | 0.784 | 5 | none |
| support_effects | 1.1 | 1821 | 1321 | 0.784 | 5 | gate_maximum_stall_window, gate_phase_specific_stalls |
| offline_efficiency | 0.9 | 1821 | 1321 | 0.784 | 5 | none |
| offline_efficiency | 1 | 1821 | 1321 | 0.784 | 5 | none |
| offline_efficiency | 1.1 | 1821 | 1321 | 0.784 | 5 | none |

## Remaining Risks

- Search is intentionally bounded and deterministic; it is not an unconstrained optimizer.
- The recommendation is simulator-only and is not applied to runtime gameplay data.
- Sensitivity failures, where present, indicate groups to review before freezing doc 15.
