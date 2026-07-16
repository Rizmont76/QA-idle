# 15. Playable Idle MVP Balance and Simulation Specification

## 1. Document Status and Ownership

**Status:** IMPLEMENTATION CANDIDATE — PLAYTEST VALIDATION REQUIRED

This document owns the Playable Idle MVP balance hypothesis, deterministic simulator requirements, provisional numeric parameters and simulation validation gates for the first passive Junior QA Assistant slice.

This document is not Frozen and is not Production-Ready. The numeric balance values in this document are the approved **Provisional Implementation Balance Candidate v1** until implementation verification, playtest validation and any simulator-rerun tuning produce an approved final balance.

## 2. Purpose

This document provides an executable initial balance hypothesis for the Playable Idle MVP. It defines the formulas, parameter IDs, simulation state, actions, scenarios, validation gates and reporting format needed to test whether the approved Phase 5A and Phase 5A.1 experience targets are reachable without changing the approved MVP scope.

## 3. Scope and Non-Scope

In scope:

- Junior QA manual production through the accepted Technical Vertical Slice flow.
- Manual Report converting all available Bugs Found into Money.
- Middle QA unlock of one persistent Junior QA Assistant.
- Assistant passive Bugs Found production immediately at Assistant level 0.
- Capped Assistant level purchases using shared Money.
- One producer milestone multiplier active in MVP.
- A capstone milestone that can exist but is not required for endpoint completion.
- Exactly three optional one-time Assistant Support Upgrades.
- Offline progress after Assistant unlock, producing Bugs Found only within an offline-time cap.
- Deterministic simulation scenarios, gates and iteration procedure.

Non-scope:

- Full Team system.
- Multiple workers, Assistant units or producer types.
- Automation or auto-reporting.
- Direct passive Money production.
- Reputation, Contracts, Office, Company, Prestige, Events, Achievements or Statistics.
- New currencies.
- Repeatable manual upgrades after promotion.
- Repeatable reporting upgrades.
- External analytics or telemetry.
- Big-number abstraction.

## 4. Source Documents and Authority Boundaries

Authority boundaries:

| Area | Owner |
| --- | --- |
| Roadmap/status | `00-Master_Project_Roadmap.md` |
| Active/passive loop | `02-Core_Gameplay _Loop.md` |
| Player journey | `03-Player_Journey.md` |
| Career meaning | `04-Career_System.md` |
| Progression pacing | `05-Progression.md` |
| Assistant runtime/system definition | `06-Game_Systems.md` |
| Tick/offline/save/diagnostics | `07-Technical_Rules.md` |
| MVP boundaries/acceptance | `08-MVP_Vertical_Slice_Specification.md` |
| Modifier order/multiplier scope | `09-Modifier_System.md` |
| Economy and purchase trade-offs | `10-Economy_Framework.md` |
| Resource/cap terminology | `11-Resource_System.md` |
| Upgrade lifecycle/caps/Support Upgrade classification | `12-Upgrade_System.md` |
| Unlock sequence/teasers | `13-Unlock_System.md` |
| Promotion workflow/outcome | `14-Promotion_System.md` |
| UI communication | `VD-01 UI Design System.txt` |
| Balance/simulation/final targets | This document |

This document must not override runtime ownership, resource semantics, unlock ownership, promotion behavior or UI layout rules owned by documents 02-14 or VD-01. It may define provisional parameters and simulator validation rules for the systems those documents authorize.

## 5. Approved Experience Targets

Approved Phase 5A and Phase 5A.1 targets:

- Total MVP duration target: about 25-40 minutes.
- Junior manual phase target: about 8-12 minutes.
- Middle passive phase target: about 15-25 minutes.
- Passive production starts immediately after Middle QA promotion.
- Assistant is one persistent leveled producer.
- Assistant produces Bugs Found at level 0.
- Assistant cap is medium finite and recorded by the implementation candidate.
- First producer milestone is early, around 25-35% of cap.
- Capstone milestone exists but is not endpoint-required.
- Assistant scaling is additive per-level growth before milestone effects.
- Assistant cost scaling uses a geometric-style curve.
- Manual action remains useful, but passive production carries low-click baseline progress.
- Purchase action target: about 10-16 purchase actions.
- Genuine meaningful decision target: about 3-5 decision points.
- No repeatable manual or reporting upgrades after promotion.
- Report converts all available Bugs Found into Money.
- Money is gained only through Report.
- Offline progress exists only after Assistant unlock and produces Bugs Found only.
- Offline efficiency is lower than online passive efficiency.
- Exactly three optional one-time Assistant Support Upgrades are included.
- Support Upgrades compete economically with Assistant levels and are never endpoint requirements.

## 6. Playable MVP Phase Model

The simulator must model these phases:

| Phase ID | Phase | Entry | Exit |
| --- | --- | --- | --- |
| `phase_junior_manual` | Junior manual foundation | New run | Junior to Middle promotion purchased/completed |
| `phase_middle_assistant_intro` | Assistant unlocked | Promotion outcome applied | First Assistant purchase or first passive production tick observed |
| `phase_middle_growth` | Assistant growth | Assistant active | Endpoint conditions satisfied |
| `phase_post_endpoint_sanity` | Capstone reachability sanity | Endpoint complete | Optional capstone sanity scenario complete |

The Technical Vertical Slice remains accepted historical behavior. The Playable Idle MVP simulation begins with that Junior flow and extends only after Middle QA promotion.

## 7. Resource Flow Model

Canonical resource flow:

```text
Manual Test -> Bugs Found -> Report -> Money -> Basic Upgrades / Promotion / Assistant Levels / Assistant Support Upgrades
Assistant Passive Production -> Bugs Found -> Report -> Money
Offline Assistant Production -> Bugs Found -> Report -> Money
```

Rules:

- `bugs_found` may be created by manual testing and, after unlock, Assistant passive production.
- `money` is created only by Report.
- Offline progress creates `bugs_found` only.
- Report must convert the full exact authoritative `bugs_found` value.
- No player-facing `bugs_found` storage cap exists in MVP.
- The offline-time cap limits simulated absence duration, not storage.
- Authoritative `bugs_found` and `money` state must preserve deterministic decimal values.
- UI formatting must never modify authoritative numeric state.
- Upgrade prices may remain integer values, but affordability checks use exact authoritative `money`.

## 8. Manual Production Model

Manual testing uses the existing manual production path and current Technical Vertical Slice upgrade effects. For deterministic simulation, manual actions are represented by cadence parameters rather than random input.

Formula:

```text
manual_bugs_per_action =
  PARAM_MANUAL_BASE_BUGS_PER_TEST
  * (1 + manual_upgrade_additive_bonus)
```

Precision and normalization:

- Manual action output may be fractional internally.
- Simulator state must retain deterministic decimal precision for `bugs_found`, `money`, rates and elapsed-time-derived gains.
- The simulator must use fixed-point decimal arithmetic with `PARAM_NUMERIC_SCALE_DECIMAL_PLACES` decimal places for authoritative resources and rates.
- After each resource mutation, normalize by rounding half away from zero to `PARAM_NUMERIC_SCALE_DECIMAL_PLACES`.
- UI display rounding is formatting only and must not feed back into authoritative state.

Junior baseline requirements:

- Manual production parameters must come from a versioned Junior-phase input snapshot generated from authoritative implementation data or exact current Technical Vertical Slice definitions.
- The simulator must record source commit/version, upgrade definitions, costs, effects, promotion requirements, manual production and reporting parameters.
- The simulator must fail the acceptance run if required Junior inputs cannot be resolved.
- The simulator must not silently substitute `PARAM_MANUAL_BASE_BUGS_PER_TEST = 1` if authoritative data differs.
- Junior manual upgrade values are source-owned outside this document and must not be redefined here.

## 9. Reporting Conversion Model

Report converts all available Bugs Found without destroying fractional value.

Formula:

```text
report_money_gain =
  normalize_decimal(
    current_bugs_found * junior_baseline.report_money_per_bug
  )

bugs_found_after_report = 0
money_after_report =
  normalize_decimal(money_before_report + report_money_gain)
```

Rules:

- `junior_baseline.report_money_per_bug` must come from the versioned Junior baseline snapshot.
- Report has no partial mode in MVP.
- Report has no automation in MVP.
- Report does not create passive or offline production.
- Offline return must still require a Report action before Money is gained.
- Authoritative Report output must not be floored.
- After Report, `bugs_found` becomes exactly zero because its full exact value was converted.
- Affordability for every purchase after Report uses exact authoritative `money`.

## 10. Junior QA Assistant Level Model

The Junior QA Assistant is one persistent producer. It is unlocked by Middle QA promotion and immediately produces passive Bugs Found at level 0.

State:

- `assistant_unlocked: boolean`
- `assistant_level: integer`
- `assistant_max_level: integer`
- `assistant_supports_owned: set`
- `assistant_milestones_reached: set`

Rules:

- Minimum active level is 0.
- Level 0 has nonzero production.
- Purchasing one level increases `assistant_level` by 1.
- Assistant levels are capped.
- Assistant levels are the primary repeatable Middle QA investment.
- Support Upgrades are optional one-time purchases and do not replace the level model.

## 11. Assistant Cost Scaling Formula

Assistant level cost uses a geometric-style curve.

Formula for the next level:

```text
next_level = assistant_level + 1

base_level_cost =
  PARAM_ASSISTANT_LEVEL_BASE_COST
  * (PARAM_ASSISTANT_LEVEL_COST_GROWTH ^ (next_level - 1))
  + PARAM_ASSISTANT_LEVEL_LINEAR_COST * (next_level - 1)

discount_multiplier =
  if support_training_owned then
    PARAM_SUPPORT_TRAINING_COST_MULTIPLIER
  else
    1

assistant_next_level_cost =
  round_to_currency(
    base_level_cost * discount_multiplier
  )
```

Calculation order:

1. Determine `next_level`.
2. Calculate geometric base.
3. Add linear stabilizer.
4. Apply future-level support discount if owned.
5. Round to currency.
6. Check affordability.

Support discount applies only to future level purchases after the support is owned. It must not refund prior purchases.

## 12. Assistant Production Scaling Formula

Assistant production is additive by level before milestone effects.

Formula:

```text
level_additive_rate =
  PARAM_ASSISTANT_BASE_BUGS_PER_SECOND
  + assistant_level * PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL

support_additive_rate =
  if support_immediate_owned then
    PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND
  else
    0

pre_milestone_rate =
  level_additive_rate + support_additive_rate

milestone_multiplier =
  if first_producer_milestone_reached then
    PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER
  else
    1

online_assistant_bugs_per_second =
  pre_milestone_rate * milestone_multiplier
```

Rules:

- Additive level growth is calculated before milestone multiplier.
- The Support Upgrade immediate additive effect is added before milestone multiplier.
- Only one producer milestone multiplier is active in MVP.
- Capstone reward is feedback/status only unless a future approved document changes that.

## 13. Assistant Level Cap

`PARAM_ASSISTANT_MAX_LEVEL` is **IMPLEMENTATION CANDIDATE: 25**.

Rules:

- The simulator must reject purchases above max level.
- Capstone reachability sanity may continue until capstone level or max level, whichever is lower.
- Endpoint completion must not require max level.

## 14. Producer Milestone Model

Milestone events are distinct from purchase actions and endpoint events.

Implementation candidate milestone model:

| Milestone ID | Level | Role | Effect |
| --- | ---: | --- | --- |
| `milestone_assistant_first` | **IMPLEMENTATION CANDIDATE: 8** | First producer milestone and endpoint target | Apply one MVP producer multiplier |
| `milestone_assistant_capstone` | **IMPLEMENTATION CANDIDATE: 25** | Capstone sanity marker | Feedback/status only |

First milestone placement is 32% of the implementation candidate level cap, within the approved 25-35% target range.

Milestone detection:

```text
if previous_assistant_level < milestone_level
and new_assistant_level >= milestone_level:
  emit milestone_event
```

Buy Max must emit every crossed milestone event.

## 15. Three Assistant Support Upgrades

Exactly three optional one-time Assistant Support Upgrades exist in the Playable Idle MVP.

All names are **PROVISIONAL CONTENT NAMES** until reviewed.

| Stable ID | Provisional Name | Role | Effect Type | Endpoint Required |
| --- | --- | --- | --- | --- |
| `support_immediate_production` | Desk Setup Kit | Immediate Production Support | Additive Assistant production | No |
| `support_training_economics` | Mentoring Checklist | Long-Term Training Support | Future Assistant level cost reduction | No |
| `support_offline_handover` | Handover Notes | Offline Handover Support | Offline efficiency improvement | No |

Constraints:

- Optional.
- One-time only.
- Middle QA only.
- Use shared Money.
- Use existing Upgrade + Modifier systems.
- Do not produce Money.
- Do not automate Report.
- Do not add currencies, systems, producers or multiple Assistant units.
- At most one improves offline value: `support_offline_handover`.

## 16. Support Upgrade Unlock Thresholds

Support Upgrades should be staged through Middle QA unless simulation proves simultaneous reveal is required.

Implementation candidate unlock thresholds:

| Support ID | Unlock Condition | Purpose |
| --- | --- | --- |
| `support_immediate_production` | Assistant unlocked | Provides early immediate-output alternative to levels |
| `support_training_economics` | Assistant level >= **IMPLEMENTATION CANDIDATE: 2** | Creates early-investment versus immediate-output decision |
| `support_offline_handover` | Assistant level >= **IMPLEMENTATION CANDIDATE: 5** | Introduces offline value after player understands passive production |

Unlock thresholds are not endpoint conditions.

## 17. Buy 1 and Buy Max Calculation Rules

Definitions:

- Purchase action: one committed transaction that spends Money.
- Meaningful purchase decision: a decision point where at least two materially different affordable or near-affordable purchase options are available.
- Unlock event: a newly visible or newly active option caused by promotion, level, resource or state threshold.
- Milestone event: a level threshold crossed by Assistant level purchase.
- Endpoint event: all endpoint conditions becoming true.

Buy 1:

```text
if assistant_level < PARAM_ASSISTANT_MAX_LEVEL
and money >= assistant_next_level_cost:
  money -= assistant_next_level_cost
  assistant_level += 1
  emit purchase_action
  emit crossed milestone events if any
```

Buy Max:

```text
levels_to_buy = 0
simulated_money = money
simulated_level = assistant_level

while simulated_level < PARAM_ASSISTANT_MAX_LEVEL:
  cost = cost_for_next_level(simulated_level, supports_owned)
  if simulated_money < cost:
    break
  simulated_money -= cost
  simulated_level += 1
  levels_to_buy += 1

if levels_to_buy > 0:
  money = simulated_money
  assistant_level = simulated_level
  emit one purchase_action with levels_purchased = levels_to_buy
  emit each crossed milestone event in ascending level order
```

Buy Max buys the highest affordable contiguous level range. It must not skip costs, skip milestone feedback or hide endpoint completion.

## 18. Offline Progress Parameters

Offline progress exists only after Assistant unlock.

Formula:

```text
eligible_offline_seconds =
  min(elapsed_offline_seconds, PARAM_OFFLINE_TIME_CAP_SECONDS)

offline_efficiency =
  if support_offline_handover_owned then
    PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT
  else
    PARAM_OFFLINE_EFFICIENCY_BASE

offline_bugs_found_gain =
  online_assistant_bugs_per_second
  * eligible_offline_seconds
  * offline_efficiency
```

Rules:

- No offline gains before Assistant unlock.
- Offline progress produces Bugs Found only.
- Offline progress never produces Money directly.
- Offline progress never triggers Report.
- Offline efficiency must remain below online efficiency.
- Offline cap is a time cap, not a storage cap.

## 19. Number Formatting and Safe Bounds

The simulator must track exact deterministic numeric state and separately validate display formatting thresholds. Formatting is a read-only projection of state.

Deterministic numeric precision rules:

- Authoritative resources, production rates, costs after formula calculation and report outputs use fixed-point decimal arithmetic.
- `PARAM_NUMERIC_SCALE_DECIMAL_PLACES` defines the shared scale for authoritative simulation values.
- Normalize after each mutation by rounding half away from zero to the configured scale.
- Upgrade price table entries may be integers, but computed costs and affordability checks compare exact normalized `money`.
- UI formatting, compact notation and display rounding must not alter `bugs_found`, `money`, rates, costs, scenario metrics or gate calculations.

Provisional display thresholds:

| Parameter ID | Value |
| --- | ---: |
| `PARAM_NUMERIC_SCALE_DECIMAL_PLACES` | **PROVISIONAL: 6** |
| `PARAM_FORMAT_DECIMAL_MAX_BELOW` | **PROVISIONAL: 100** |
| `PARAM_FORMAT_INTEGER_MIN` | **PROVISIONAL: 100** |
| `PARAM_FORMAT_COMPACT_MIN` | **PROVISIONAL: 1000000** |
| `PARAM_SAFE_MAX_RESOURCE_VALUE` | **PROVISIONAL: 1000000000** |
| `PARAM_SAFE_MAX_RATE_VALUE` | **PROVISIONAL: 1000000** |
| `PARAM_SAFE_MAX_COST_VALUE` | **PROVISIONAL: 1000000000** |

Safe-bounds failure occurs if any required scenario exceeds the safe max for resource values, rates or costs, or if formatting changes authoritative numeric state.

## 20. MVP Endpoint Conditions

Endpoint completion requires all of the following:

1. Junior to Middle promotion completed.
2. Junior QA Assistant unlocked.
3. Assistant passive production demonstrated at least once after unlock.
4. Assistant reaches `PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET`.
5. First producer milestone reached.
6. At least one post-milestone passive production tick occurs.

Implementation candidate endpoint:

```text
PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET = PARAM_FIRST_MILESTONE_LEVEL
```

With current implementation candidate values, endpoint target level is **IMPLEMENTATION CANDIDATE: 8**.

Support Upgrades are not endpoint requirements.

## 21. Simulation State Model

Minimum deterministic simulator state:

```text
junior_baseline_version
junior_baseline_source_commit
junior_baseline_snapshot_hash
scenario_start_snapshot_id
simulation_time_seconds
phase_id
career_stage
bugs_found
money
numeric_scale_decimal_places
manual_upgrades_owned
promotion_completed
assistant_unlocked
assistant_level
assistant_supports_owned
assistant_milestones_reached
endpoint_completed
capstone_reached
purchase_action_count
meaningful_purchase_decision_count
meaningful_decision_signature_last
unlock_events
milestone_events
endpoint_events
offline_sessions
event_log
```

All scenario runs must start from a known seedless deterministic state. Standard Middle-focused strategy scenarios must start from the same validated post-promotion snapshot. The Junior phase uses one separately validated baseline path that generates that snapshot. If randomization is later introduced for test harness coverage, it must not be used for acceptance balance validation.

Junior baseline input snapshot requirements:

- Include source commit/version.
- Include Basic Upgrade definitions, costs and effects.
- Include promotion requirements and promotion cost.
- Include manual production parameters.
- Include reporting parameters.
- Include expected Junior baseline duration and ending resources at promotion.
- Fail the acceptance run if any required Junior input is missing, ambiguous or inconsistent with the authoritative source.

## 22. Simulation Actions and Purchase Strategies

Required action types:

- `manual_test`
- `report_all`
- `buy_basic_upgrade`
- `buy_promotion`
- `buy_assistant_level_1`
- `buy_assistant_level_max`
- `buy_support_upgrade`
- `advance_time_online`
- `advance_time_offline`

Required purchase strategies:

- `level_first`: prioritizes Assistant levels over Support Upgrades.
- `support_first`: buys available Support Upgrades before additional Assistant levels when affordable.
- `mixed`: buys supports only when their payback or strategic role fits the current phase.
- `skip_supports`: completes endpoint without Support Upgrades.
- `buy_max_heavy`: uses Buy Max whenever it can purchase at least two levels.

## 23. Required Simulation Scenarios

| Scenario ID | Purpose |
| --- | --- |
| `scenario_junior_baseline` | Validate the Junior path and produce the versioned post-promotion snapshot |
| `scenario_level_first` | Start from post-promotion snapshot; validate direct Assistant level path |
| `scenario_support_first` | Start from post-promotion snapshot; validate supports do not become universally dominant |
| `scenario_mixed` | Start from post-promotion snapshot; validate intended trade-off path |
| `scenario_low_click_middle` | Start from post-promotion snapshot; occasional manual tests/reports while passive baseline carries progress |
| `scenario_active_click_middle` | Start from post-promotion snapshot; engaged manual play is faster but does not trivialize endpoint |
| `scenario_offline_return` | Start from post-promotion snapshot; return near offline cap; Bugs Found only; Report still required |
| `scenario_no_support_completion` | Start from post-promotion snapshot; endpoint is reachable without any Support Upgrade |
| `scenario_buy_max_milestone_crossing` | Start from post-promotion snapshot; Buy Max crosses first milestone and emits milestone feedback |
| `scenario_endpoint_completion` | Start from post-promotion snapshot; endpoint conditions are emitted exactly once |
| `scenario_capstone_reachability_sanity` | Start from post-promotion snapshot; capstone can be reached without unsafe runaway |
| `scenario_full_run_low_engagement_info` | Informational full-run low-engagement sanity; must not replace `scenario_low_click_middle` gate |

Scenario boundary rules:

- `scenario_junior_baseline` is the only acceptance scenario responsible for validating the Junior phase path.
- Every standard Middle-focused strategy scenario must load the same `scenario_start_snapshot_id` generated by `scenario_junior_baseline`.
- Low-click and active-click comparison for passive gameplay begins after Middle QA promotion.
- A full-run low-engagement scenario may be reported for context, but its result must not satisfy or replace the post-promotion low-click validation gate.

## 24. Meaningful Decision Measurement

A purchase action is any completed transaction. The target total purchase action count across full endpoint completion is **PROVISIONAL: 10-16**.

A meaningful purchase decision is a materially new decision point, not every repeated evaluation of the same unchanged choice. The target genuine meaningful decision count across endpoint completion is **PROVISIONAL: 3-5**.

A meaningful purchase decision is counted only when the simulator reaches a decision point where:

- at least two purchase categories are visible;
- at least two choices are affordable now or expected to become affordable within `PARAM_DECISION_NEAR_AFFORD_SECONDS`;
- the choices have different strategic effects, such as direct level progress, immediate production, long-term level economics or offline value.
- the decision signature differs from the previous emitted meaningful decision.

A new meaningful decision may be emitted only after a material state change:

- purchase;
- unlock;
- milestone;
- affordability transition;
- material payback comparison change.

Formula:

```text
decision_signature =
  hash(visible_viable_purchase_categories,
       affordable_purchase_categories,
       near_affordable_purchase_categories,
       relative_payback_bucket,
       assistant_level,
       supports_owned,
       milestones_reached)

if material_state_change_since_last_decision
and visible_viable_purchase_categories >= 2
and time_to_second_viable_option <= PARAM_DECISION_NEAR_AFFORD_SECONDS
and decision_signature != meaningful_decision_signature_last:
  meaningful_purchase_decision_count += 1
  meaningful_decision_signature_last = decision_signature
```

Repeated polling while the same options remain visible, affordable and strategically equivalent must not increment `meaningful_purchase_decision_count`.

## 25. Stall Detection

Stall is a period where no meaningful player progress occurs and no useful action is available except waiting.

Detection:

```text
stall_window =
  time_since_last(
    purchase_action,
    unlock_event,
    milestone_event,
    endpoint_event,
    meaningful_purchase_decision
  )

stall_failure if stall_window > PARAM_MAX_STALL_SECONDS
```

Stall checks must run separately for Junior manual phase, Middle passive phase and total run.

## 26. Runaway Growth Detection

Runaway growth occurs when costs, production, offline gains or Buy Max behavior collapse pacing.

Failure signals:

- Endpoint reached before `PARAM_TOTAL_DURATION_MIN_SECONDS`.
- Active-click reaches endpoint faster than the allowed acceleration ratio.
- Buy Max purchases more than `PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION` levels before endpoint.
- Capstone reached during endpoint scenario without intentionally running capstone scenario.
- Any resource, rate or cost exceeds safe bounds.

## 27. Dominant-Strategy Detection

A strategy is dominant if it beats every alternative by too much while also satisfying every safety and pacing gate.

Detection:

```text
best_time = min(endpoint_time_by_strategy)
comparison_time = endpoint_time_for_strategy

dominance_ratio =
  (comparison_time - best_time) / comparison_time
```

Failure if one strategy is more than `PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO` faster than all alternatives and has equal or better stall, decision and safety metrics.

Support-first must not be universally dominant. Skipping supports must remain possible but should not erase intended trade-offs.

## 28. Validation Gates

| Gate ID | Metric | Target Band | Failure Condition | Severity | Fixable Parameter Group |
| --- | --- | --- | --- | --- | --- |
| `gate_total_duration` | Junior baseline time + mixed Middle endpoint time | **PROVISIONAL: 25-40 min** | Combined duration outside band | Blocker | `group_cost`, `group_production`, `group_manual_cadence` |
| `gate_junior_baseline_inputs` | Versioned Junior snapshot completeness | Source commit/version, upgrade definitions, costs, effects, promotion requirements, manual production and reporting parameters recorded | Any required Junior input missing, ambiguous or silently substituted | Blocker | `group_junior_baseline_inputs` |
| `gate_junior_duration` | `scenario_junior_baseline` promotion time | **PROVISIONAL: 8-12 min** | Outside band | Major | `group_manual`, `group_basic_upgrade_import`, `group_promotion_cost_import` |
| `gate_middle_duration` | Post-promotion mixed endpoint time | **PROVISIONAL: 15-25 min** | Outside band | Blocker | `group_assistant_cost`, `group_assistant_production`, `group_support_prices` |
| `gate_purchase_actions` | Full endpoint purchase actions | **PROVISIONAL: 10-16** | Below 10 or above 16 | Major | `group_unlock_thresholds`, `group_support_prices`, `group_cost` |
| `gate_meaningful_decisions` | Genuine meaningful purchase decisions | **PROVISIONAL: 3-5** | Below 3, above 5, or repeated unchanged choices counted | Major | `group_unlock_thresholds`, `group_support_prices`, `group_decisions` |
| `gate_low_click_middle_completion` | Post-promotion low-click endpoint time | **PROVISIONAL: <= 25 min after promotion** | Low-click Middle scenario cannot complete or exceeds max | Blocker | `group_passive_baseline`, `group_offline`, `group_cost` |
| `gate_active_not_trivial` | Post-promotion active vs mixed time ratio | **PROVISIONAL: 0.70-0.90** | Active below 70% or above 90% of mixed Middle endpoint time | Major | `group_manual_cadence`, `group_passive_baseline`, `group_cost` |
| `gate_offline_bugs_only` | Offline resources gained | Bugs Found only | Money gained or Report automated | Blocker | `group_offline` |
| `gate_offline_cap` | Eligible offline seconds | `<= PARAM_OFFLINE_TIME_CAP_SECONDS` | Cap exceeded | Blocker | `group_offline` |
| `gate_decimal_preservation` | Authoritative Bugs Found and Money precision | Exact decimal values preserved and normalized only by precision rule | Report floors output, formatting mutates state, or fractional value is lost | Blocker | `group_precision`, `group_reporting` |
| `gate_buy_max_milestones` | Milestone events emitted | Every crossed milestone | Missing feedback/event | Blocker | `group_buy_max_rules` |
| `gate_no_support_completion` | Endpoint without supports | Completes in **PROVISIONAL: <= 45 min** | Endpoint impossible without supports | Blocker | `group_support_prices`, `group_assistant_baseline`, `group_cost` |
| `gate_support_not_required` | Support ownership at endpoint | No support required | Any support required by condition | Blocker | `group_endpoint`, `group_unlock_thresholds` |
| `gate_support_tradeoff` | Strategy spread | No universal support-first dominance | Support-first dominates all scenarios | Major | `group_support_effects`, `group_support_prices` |
| `gate_safe_bounds` | Max resource/rate/cost | Below safe max values | Any safe bound exceeded | Blocker | `group_cost`, `group_production`, `group_formatting` |
| `gate_capstone_sanity` | Capstone reachability | Reachable only in capstone scenario | Capstone reached too early or impossible in sanity run | Minor | `group_capstone`, `group_cost`, `group_production` |

## 29. Simulation Output Schema

Each scenario output must include:

```text
scenario_id
strategy_id
parameter_version
junior_baseline_version
junior_baseline_source_commit
junior_baseline_snapshot_hash
scenario_start_snapshot_id
endpoint_completed
endpoint_time_seconds
junior_phase_seconds
middle_phase_seconds
capstone_reached
capstone_time_seconds
purchase_action_count
meaningful_purchase_decision_count
meaningful_purchase_decision_events
purchase_action_events
manual_action_count
report_action_count
assistant_final_level
supports_owned
milestones_reached
offline_sessions_count
offline_elapsed_seconds_total
offline_eligible_seconds_total
offline_bugs_found_total
money_from_offline_reports_after_return
max_bugs_found
max_money
final_bugs_found_exact
final_money_exact
numeric_scale_decimal_places
max_assistant_rate
max_level_cost
stall_windows
gate_results
event_log_digest
```

## 30. Balance Iteration Procedure

1. Generate or load the versioned Junior baseline input snapshot.
2. Run `scenario_junior_baseline` and record the post-promotion snapshot.
3. Run all Middle-focused scenarios from the same post-promotion snapshot.
4. Produce an acceptance report and mark each validation gate pass/fail.
5. For each failure, adjust only the parameter groups permitted by the failed gate.
6. Record changed parameter IDs, old values, new values and reason.
7. Re-run the Junior baseline and all required Middle-focused scenarios after any parameter change that can affect the snapshot or downstream pacing.
8. Do not freeze this document until implementation verification and playtest validation meet the freeze criteria in section 36.

## 31. Provisional Implementation Balance Candidate v1

Approved implementation candidate:

`phase-6b.2-stage-a-003`

This candidate is approved for implementation as `Provisional Implementation Balance Candidate v1`. It is not Frozen and is not final player-validated balance.

Validation source:

- Phase 6B.2 expanded passive/cost feasibility search.
- Deterministic simulator using `doc15-provisional-2026-07-14` baseline inputs.
- Fixed locked cadence profiles from Phase 6B.1 and Phase 6B.2.

Base validation result:

| Metric | Result |
| --- | ---: |
| Junior baseline | 500 seconds |
| Middle mixed | 1261 seconds |
| Total | 1761 seconds |
| Level-first Middle | 1441 seconds |
| Mixed Middle | 1261 seconds |
| Support-first Middle | 1261 seconds |
| No-support Middle | 1441 seconds |
| Meaningful decisions | 4 |
| Base Blocker gates | all passed |
| Base Major gates | all passed |

Support evidence:

| Support | Evidence |
| --- | --- |
| Immediate Support | Positive online utility in active, support-first, mixed, endpoint, low-click and capstone paths. Mixed path utility: 231.791 seconds. |
| Training Support | Positive utility when purchased early. Mixed path purchase at 1100 seconds records 54.442 second payback and 174.057 second endpoint utility. |
| Offline Support | Controlled Handover remains isolated; offline Support improves offline Bugs Found only through offline efficiency. |
| Optionality | No-support endpoint remains valid at 1441 seconds. Supports are not endpoint requirements. |
| Resource safety | No Support Upgrade produces Money directly, and no Support automates Report. Offline progress produces Bugs Found only until explicit Report. |

Controlled Handover comparison remains an isolated simulator diagnostic and must not be implemented as a direct Money or auto-reporting feature.

Production-share evidence:

| Assistant Level | Passive Bugs/sec | Baseline Passive Share | Baseline Manual Share | Active Passive Share | Active Manual Share | Low-click Passive Share | Low-click Manual Share |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0.8 | 0.6154 | 0.3846 | 0.3902 | 0.6098 | 0.7619 | 0.2381 |
| 3 | 1.4 | 0.7368 | 0.2632 | 0.5283 | 0.4717 | 0.8485 | 0.1515 |
| 5 | 1.8 | 0.7826 | 0.2174 | 0.5902 | 0.4098 | 0.8780 | 0.1220 |
| 8 | 3.12 | 0.8619 | 0.1381 | 0.7140 | 0.2860 | 0.9258 | 0.0742 |

Interpretation:

- Passive production is already the majority of baseline Middle production at Assistant level 0 and becomes stronger by the first milestone.
- Active manual play remains a burst that accelerates progression without dominating total production by the first milestone.
- Low-click remains viable because passive production carries most production even when manual input is sparse.

Known sensitivity risks:

- The strict optional +/-5% robustness requirement did not pass.
- Production -5% misses the low-click target by approximately 31 seconds in the reference sensitivity run.
- Cost +5% can cross Middle and low-click limits; reference `cost-plus-5` reached 1501 seconds Middle and 1711 seconds low-click.
- The candidate is sensitive around Assistant cost thresholds.
- Cost -5% can shorten total duration toward the approved minimum boundary.
- Tuning must be performed through the deterministic simulator and rerun through the required scenarios.
- Player behavior may differ from deterministic strategies.
- Final balance requires playtest telemetry or structured manual observations.

These risks do not invalidate implementation candidacy. They prevent Frozen or final Production-Ready status.

Historical references:

- Phase 6A.2 corrected baseline established trustworthy simulator correctness and baseline failures before tuning.
- Phase 6B rejected `phase-6b-recommended-candidate-v1` remains historical only because it changed locked behavior profiles.
- Phase 6B.1 returned no recommendation under narrower passive/cost bounds.
- Phase 6B.2 proved base feasibility with expanded passive production and paired costs.

Reference artifacts:

- `docs/reports/phase-6a.2-final-corrected-balance-acceptance-report.md`
- `docs/reports/phase-6b-balance-tuning-report.md`
- `docs/reports/phase-6b.1-passive-economy-report.md`
- `artifacts/balance/phase-6b.2-feasibility-analysis.json`
- `artifacts/balance/phase-6b.2-expanded-search-space.json`
- `artifacts/balance/phase-6b.2-expanded-candidate-results.json`
- `artifacts/balance/phase-6b.2-expanded-sensitivity-results.json`
- `docs/reports/phase-6b.2-expanded-passive-economy-report.md`

## 32. Authoritative Implementation Candidate Parameter Table

All values in this table are the active **Implementation Candidate v1** values for implementation. They remain provisional until playtest validation.

| Parameter ID | Group | Candidate Value | Notes |
| --- | --- | ---: | --- |
| `PARAM_TOTAL_DURATION_MIN_SECONDS` | `group_targets` | 1500 | 25 minutes |
| `PARAM_TOTAL_DURATION_MAX_SECONDS` | `group_targets` | 2400 | 40 minutes |
| `PARAM_JUNIOR_DURATION_MIN_SECONDS` | `group_targets` | 480 | 8 minutes |
| `PARAM_JUNIOR_DURATION_MAX_SECONDS` | `group_targets` | 720 | 12 minutes |
| `PARAM_MIDDLE_DURATION_MIN_SECONDS` | `group_targets` | 900 | 15 minutes |
| `PARAM_MIDDLE_DURATION_MAX_SECONDS` | `group_targets` | 1500 | 25 minutes |
| `PARAM_PURCHASE_ACTIONS_MIN` | `group_targets` | 10 | Lower full endpoint purchase-action target |
| `PARAM_PURCHASE_ACTIONS_MAX` | `group_targets` | 16 | Upper full endpoint purchase-action target |
| `PARAM_MEANINGFUL_DECISIONS_MIN` | `group_targets` | 3 | Lower genuine decision target |
| `PARAM_MEANINGFUL_DECISIONS_MAX` | `group_targets` | 5 | Upper genuine decision target |
| `PARAM_JUNIOR_BASELINE_REQUIRED` | `group_junior_baseline_inputs` | true | Acceptance runs fail without versioned Junior snapshot |
| `PARAM_MANUAL_BASE_BUGS_PER_TEST` | `group_manual` | from versioned Junior snapshot | Do not substitute a default if authoritative data differs |
| `PARAM_REPORT_MONEY_PER_BUG` | `group_reporting` | from versioned Junior snapshot | Do not substitute a default if authoritative data differs |
| `PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS` | `group_scenarios` | 9 | Locked Junior baseline cadence |
| `PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS` | `group_scenarios` | 25 | Locked Junior baseline cadence |
| `PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS` | `group_scenarios` | 10 | Locked Middle baseline cadence |
| `PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS` | `group_scenarios` | 60 | Locked Middle baseline cadence |
| `PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS` | `group_scenarios` | 4 | Locked active Middle cadence |
| `PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS` | `group_scenarios` | 45 | Locked active Middle cadence |
| `PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS` | `group_scenarios` | 20 | Locked low-click cadence |
| `PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS` | `group_scenarios` | 90 | Locked low-click cadence |
| `PARAM_ASSISTANT_MAX_LEVEL` | `group_assistant_levels` | 25 | Medium finite cap |
| `PARAM_FIRST_MILESTONE_LEVEL` | `group_milestones` | 8 | 32% of cap |
| `PARAM_CAPSTONE_MILESTONE_LEVEL` | `group_milestones` | 25 | Feedback/status only |
| `PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET` | `group_endpoint` | 8 | Same as first milestone |
| `PARAM_ASSISTANT_LEVEL_BASE_COST` | `group_assistant_cost` | 200 | First level cost |
| `PARAM_ASSISTANT_LEVEL_COST_GROWTH` | `group_assistant_cost` | 1.14 | Geometric growth |
| `PARAM_ASSISTANT_LEVEL_LINEAR_COST` | `group_assistant_cost` | 10 | Linear stabilizer |
| `PARAM_ASSISTANT_BASE_BUGS_PER_SECOND` | `group_assistant_production` | 0.8 | Level 0 production |
| `PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL` | `group_assistant_production` | 0.2 | Additive per level |
| `PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER` | `group_milestones` | 1.3 | First producer multiplier |
| `PARAM_SUPPORT_IMMEDIATE_PRICE` | `group_support_prices` | 120 | Immediate Support price |
| `PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND` | `group_support_effects` | 0.22 | Immediate additive production |
| `PARAM_SUPPORT_TRAINING_PRICE` | `group_support_prices` | 160 | Training Support price |
| `PARAM_SUPPORT_TRAINING_COST_MULTIPLIER` | `group_support_effects` | 0.76 | Future level cost multiplier |
| `PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL` | `group_unlock_thresholds` | 2 | Early-purchase Training window |
| `PARAM_SUPPORT_OFFLINE_PRICE` | `group_support_prices` | 150 | Optional offline value |
| `PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL` | `group_unlock_thresholds` | 5 | Staged reveal |
| `PARAM_OFFLINE_TIME_CAP_SECONDS` | `group_offline` | 7200 | 2 hours |
| `PARAM_OFFLINE_EFFICIENCY_BASE` | `group_offline` | 0.35 | Lower than online |
| `PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT` | `group_offline` | 0.62 | Still lower than online |
| `PARAM_LOW_CLICK_MIDDLE_MAX_SECONDS` | `group_scenarios` | 1500 | Post-promotion low-click maximum |
| `PARAM_DECISION_NEAR_AFFORD_SECONDS` | `group_decisions` | 90 | Decision measurement window |
| `PARAM_PAYBACK_BUCKET_CHANGE_RATIO` | `group_decisions` | 0.15 | Material payback comparison change threshold |
| `PARAM_MAX_STALL_SECONDS` | `group_stall` | 180 | 3 minutes |
| `PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO` | `group_strategy` | 0.20 | 20% advantage limit |
| `PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION` | `group_buy_max_rules` | 5 | Before endpoint |
| `PARAM_NUMERIC_SCALE_DECIMAL_PLACES` | `group_precision` | 6 | Authoritative fixed-point scale |
| `PARAM_FORMAT_DECIMAL_MAX_BELOW` | `group_formatting` | 100 | Display validation |
| `PARAM_FORMAT_INTEGER_MIN` | `group_formatting` | 100 | Display validation |
| `PARAM_FORMAT_COMPACT_MIN` | `group_formatting` | 1000000 | Display validation |
| `PARAM_SAFE_MAX_RESOURCE_VALUE` | `group_safe_bounds` | 1000000000 | Resource bound |
| `PARAM_SAFE_MAX_RATE_VALUE` | `group_safe_bounds` | 1000000 | Rate bound |
| `PARAM_SAFE_MAX_COST_VALUE` | `group_safe_bounds` | 1000000000 | Cost bound |

## 33. Remaining TBD Register

Resolved by Implementation Candidate v1:

- Assistant endpoint level target.
- Assistant max level cap.
- First producer milestone level.
- Capstone milestone level.
- Assistant base production value.
- Assistant per-level production value.
- First milestone multiplier.
- Assistant level cost parameters.
- Support Upgrade prices.
- Support Upgrade numeric effects.
- Support Upgrade unlock thresholds.
- Offline-time cap.
- Offline efficiency values.
- Purchase action count bands.
- Meaningful purchase decision count bands.
- Stall bands.
- Runaway thresholds.
- Dominant-strategy thresholds.
- Scenario action cadences.
- Validation gates.

Remaining TBD fields:

- Player-validated balance adjustments after implementation.
- Post-playtest tuning values, if deterministic simulator reruns support a change.
- Final production-ready acceptance report.
- Final Junior baseline source snapshot for the implementation branch if runtime data changes before implementation verification.

## 34. Exact Simulator Requirements

- Deterministic, seedless acceptance runs.
- Uses fixed-point decimal arithmetic with `PARAM_NUMERIC_SCALE_DECIMAL_PLACES`.
- Preserves authoritative fractional `bugs_found` and `money` values through Report and purchase affordability.
- Treats UI formatting as read-only and verifies formatting does not mutate authoritative state.
- Requires a versioned Junior baseline input snapshot for acceptance runs.
- Records Junior baseline version, source commit/version, snapshot hash, upgrade definitions, costs, effects, promotion requirements, manual production and reporting parameters.
- Fails acceptance if required Junior baseline inputs cannot be resolved.
- Implements all formulas using stable parameter IDs from this document.
- Emits purchase actions, meaningful purchase decisions, unlock events, milestone events and endpoint events as distinct records.
- Runs every required scenario.
- Reports every validation gate with metric, target, actual result, severity and permitted parameter group.
- Records parameter version for every run.
- Records Junior baseline version for every acceptance run.
- Does not claim final balance validity unless all required scenarios have executed and playtest validation has approved the result.

## 35. Implementation Candidate Confirmation

- This document is not Frozen.
- This document is not Production-Ready.
- Provisional Implementation Balance Candidate v1 is approved for implementation.
- No implementation code is changed by this document.
- The implementation backlog is not changed by this document.

## 36. Freeze Criteria

This document may become Frozen only after:

1. Implementation matches the recorded candidate.
2. Automated gameplay tests pass.
3. Internal playthrough confirms basic usability.
4. External or structured playtests validate pacing.
5. Necessary balance adjustments are rerun through the simulator.
6. Final acceptance report is approved.
