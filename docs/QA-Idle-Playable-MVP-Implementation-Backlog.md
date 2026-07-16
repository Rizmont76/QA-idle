# QA Idle - Playable Idle MVP Implementation Backlog

Status: Active backlog  
Scope: Playable Idle MVP implementation planning only  
Created for: Phase 7C  
Current task count: 46  
Active balance candidate: `phase-6b.2-stage-a-003`  
Active parameter version: `doc15-provisional-implementation-candidate-v1-phase-6b.2-stage-a-003`  
Required balance validation command: `npm run balance:candidate`

This backlog is the active engineering plan for implementing the Playable Idle MVP. It is subordinate to the numbered production documents and does not authorize mechanics, values, UI behavior or scope beyond those documents.

The historical Technical Vertical Slice backlog remains unchanged at `docs/QA-Idle-MVP-Implementation-Backlog.md`.

## Scope Protection

The Playable Idle MVP explicitly excludes:

- multiple Assistant units;
- full Team management;
- auto-reporting;
- Automation system;
- Reputation;
- Contracts;
- Office;
- Company;
- Prestige;
- Events;
- Achievements;
- expanded Statistics;
- monetization;
- cloud saves.

Future systems may be teased only where the canonical docs allow teaser behavior. They must remain inactive and must not affect runtime calculations, resources, saves, unlocks, promotion, endpoint detection or validation.

## Authoritative Context

- `docs/08-MVP_Vertical_Slice_Specification.md` owns Playable Idle MVP inclusion boundaries and acceptance.
- `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md` owns the provisional implementation candidate, formulas, numeric values, validation scenarios and gates.
- `docs/07-Technical_Rules.md` owns architecture, save compatibility, event ordering, diagnostics and offline technical rules.
- `docs/06-Game_Systems.md` owns the Junior QA Assistant as the first passive producer and MVP subset of Team.
- `docs/10-Economy_Framework.md` and `docs/11-Resource_System.md` own resource flows and resource transactions.
- `docs/12-Upgrade_System.md`, `docs/09-Modifier_System.md`, `docs/13-Unlock_System.md` and `docs/14-Promotion_System.md` own upgrades, modifiers, unlocks and promotions.
- `docs/VD-01 UI Design System.txt` owns MVP visual communication guidance, not runtime behavior.

## Milestones

| Milestone | Included Epics | Exit Criteria |
| --- | --- | --- |
| Runtime Foundation | Epic 0, Epic 1 | Tooling protects historical artifacts; active candidate parity is confirmed; runtime data contracts exist; Modifier System extension is ready; simulation cadence parameters are separated from runtime cooldowns. |
| First Passive Loop | Epic 2, Epic 3, part of Epic 6 | Save schema v2 can persist Assistant state; Middle QA promotion activates Assistant; level 0 produces Bugs Found online through deterministic production logic. |
| Complete Idle Economy | Epic 4, Epic 5, part of Epic 6 | Upgrade System supports finite capped Assistant levels; Assistant level purchases, Buy Max, milestones and exactly three Support Upgrades work through Resource, Upgrade, Modifier and Unlock systems. |
| Offline and Persistence | Epic 2, Epic 7 | v1 and Technical Slice saves migrate safely; offline progress grants capped Bugs Found only and exposes an explicit return summary. |
| Functional UI | Epic 8, Epic 9 | Runtime diagnostics and endpoint state are exposed internally; player-facing functional UI follows approved VD-02/VD-03 and supports Assistant, Support Upgrades, unlocks, milestones, offline summary and accessibility states. |
| Visual Workspace | Epic 10 | VD-02 and VD-03 are approved; component primitives, workspace layout, visual feedback, responsive behavior and accessibility polish are implemented without changing gameplay formulas. |
| Playtest Candidate | Epic 11 | Full regression, candidate validation, scripted runs, production build, visual completion and playtest checklist pass; feedback loop into simulator and doc 15 is ready. |

## Task Backlog

### Epic 0 - Tooling and Contract Protection

#### QA-PLAYABLE-MVP-001

- Task ID: `QA-PLAYABLE-MVP-001`
- Title: Protect historical balance artifacts from accidental overwrite
- Epic: Epic 0 - Tooling and Contract Protection
- Priority: P0
- Status: Ready
- Objective: Add guardrails that keep historical balance artifacts and rejected candidates immutable during Playable Idle MVP work.
- Scope: Identify historical artifact paths; add checks that fail if implementation commands overwrite historical Phase 6A/6B artifacts; document the protected-path policy near the balance tooling.
- Out of Scope: Rewriting simulator behavior; changing balance values; modifying historical reports.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`, `AGENTS.md`
- Dependencies: None
- Implementation Notes: Treat the active candidate output as separate from historical outputs; preserve `phase-6b.2-stage-a-003` as the active candidate namespace.
- Acceptance Criteria: Historical artifacts cannot be overwritten by the active candidate command; failures explain the protected file; active candidate output still writes to its approved active artifact path.
- Required Tests: Tooling/guard test for protected paths; smoke run of active candidate command.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Guardrails are committed with tests and historical artifacts remain byte-for-byte untouched.

#### QA-PLAYABLE-MVP-002

- Task ID: `QA-PLAYABLE-MVP-002`
- Title: Verify active candidate and document parity
- Epic: Epic 0 - Tooling and Contract Protection
- Priority: P0
- Status: Completed
- Objective: Ensure simulator parameters match doc 15's active implementation candidate.
- Scope: Confirm automated parity checks for profile ID, parameter version, candidate values, support IDs, milestone IDs, endpoint level and offline values.
- Out of Scope: Tuning values; freezing doc 15; changing acceptance gates.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-001`
- Implementation Notes: Phase 7B already added active candidate profile selection and doc 15 parity coverage in `scripts/balance/simulator.test.mjs`, active candidate parameters in `scripts/balance/parameters.mjs`, and the active validation command in `package.json`.
- Acceptance Criteria: Satisfied by existing tests for explicit active profile selection, document 15 active candidate parameter parity, parameter version recording, active candidate gate pass, and `npm run balance:candidate`.
- Required Tests: Existing `scripts/balance/simulator.test.mjs` coverage: `selects the active candidate profile explicitly`, `matches document 15 active candidate parameter values`, `records parameter version in historical and active candidate outputs`, and `passes active candidate base Blocker and Major gates`.
- Verification Commands: `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Completed in Phase 7B; do not schedule duplicate implementation.

#### QA-PLAYABLE-MVP-003

- Task ID: `QA-PLAYABLE-MVP-003`
- Title: Define runtime candidate parameter contract
- Epic: Epic 0 - Tooling and Contract Protection
- Priority: P0
- Status: Ready
- Objective: Create a runtime-facing contract for active candidate parameters without coupling gameplay code to simulator-only assumptions.
- Scope: Define a typed parameter shape for Assistant levels, costs, production, milestones, Support Upgrades, endpoint, formatting and offline progress; expose active profile ID and parameter version.
- Out of Scope: Implementing production ticks; implementing purchases; changing simulator strategy profiles.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`
- Dependencies: `QA-PLAYABLE-MVP-002`
- Implementation Notes: Separate runtime parameters from validation-only targets such as scripted cadence and dominant-strategy thresholds.
- Acceptance Criteria: Runtime code can consume candidate parameters through one stable contract; simulator-only fields are not required by runtime gameplay.
- Required Tests: Contract shape validation; type-level or runtime validation for required parameter groups.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Runtime and tooling share a versioned parameter boundary without leaking simulation cadence into gameplay.

#### QA-PLAYABLE-MVP-004

- Task ID: `QA-PLAYABLE-MVP-004`
- Title: Document verification command matrix
- Epic: Epic 0 - Tooling and Contract Protection
- Priority: P1
- Status: Ready
- Objective: Make required checks explicit for implementation, balance validation, UI and playtest candidate work.
- Scope: Add or update project documentation describing when to run `npm run balance:candidate`, targeted tests, `npm run check`, build verification and scripted playtest checks.
- Out of Scope: Adding new gameplay behavior; changing package scripts unless required by missing checks.
- Authoritative Documents: `AGENTS.md`, `docs/README.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-001`, `QA-PLAYABLE-MVP-002`
- Implementation Notes: Keep this concise and link to the active backlog rather than duplicating task details.
- Acceptance Criteria: Contributors can identify the required verification command for each task category; active candidate validation is documented.
- Required Tests: Documentation-only review; no automated test required unless scripts change.
- Verification Commands: `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: Low
- Definition of Done: Verification expectations are findable from the documentation index or workflow docs.

### Epic 1 - Runtime Data Contracts

#### QA-PLAYABLE-MVP-005

- Task ID: `QA-PLAYABLE-MVP-005`
- Title: Define stable Assistant data contract
- Epic: Epic 1 - Runtime Data Contracts
- Priority: P0
- Status: Ready
- Objective: Introduce the Junior QA Assistant definition as one persistent passive producer.
- Scope: Define stable ID, level range, max level 25, level 0 production eligibility, ownership/unlock flags and relationship to Middle QA.
- Out of Scope: Multiple Assistants; full Team management; UI presentation; production tick implementation.
- Authoritative Documents: `docs/06-Game_Systems.md`, `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-003`
- Implementation Notes: The Assistant is the MVP subset of Team but must be implemented as a single stable runtime producer.
- Acceptance Criteria: Assistant definition validates with stable ID; level 0 is valid; max level is enforced by definition.
- Required Tests: Data contract validation tests; invariant tests for level range.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change until state task is implemented
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Runtime has an authoritative Assistant definition that later tasks can consume.

#### QA-PLAYABLE-MVP-006

- Task ID: `QA-PLAYABLE-MVP-006`
- Title: Load active candidate parameters for runtime use
- Epic: Epic 1 - Runtime Data Contracts
- Priority: P0
- Status: Ready
- Objective: Make active candidate values available to gameplay modules through the runtime parameter contract.
- Scope: Include max level 25, endpoint level 8, base cost 200, growth 1.14, linear cost 10, base production 0.8, per-level production 0.2, milestone multiplier 1.3 and decimal precision 6.
- Out of Scope: Balance tuning; simulator scenario cadence; UI formatting implementation.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-003`, `QA-PLAYABLE-MVP-005`
- Implementation Notes: Parameter version must be inspectable for diagnostics and simulator/runtime comparison.
- Acceptance Criteria: Runtime can read active candidate values from one source; missing or malformed values fail loudly.
- Required Tests: Parameter loading tests; active profile/version assertions.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Active candidate parameters are versioned, validated and runtime-readable.

#### QA-PLAYABLE-MVP-007

- Task ID: `QA-PLAYABLE-MVP-007`
- Title: Define Support Upgrade and milestone records
- Epic: Epic 1 - Runtime Data Contracts
- Priority: P0
- Status: Ready
- Objective: Define stable records for the three Support Upgrades and two Assistant milestones.
- Scope: Add `support_immediate_production`, `support_training_economics`, `support_offline_handover`, `milestone_assistant_first` at level 8 and `milestone_assistant_capstone` at level 25.
- Out of Scope: Purchasing Support Upgrades; milestone event emission; UI cards.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/12-Upgrade_System.md`, `docs/09-Modifier_System.md`
- Dependencies: `QA-PLAYABLE-MVP-006`
- Implementation Notes: Support Upgrade names are provisional content names; IDs and mechanical roles are stable for implementation.
- Acceptance Criteria: Exactly three Support Upgrade definitions exist; duplicate or extra Support IDs fail validation; milestone levels match active candidate values.
- Required Tests: Definition validation tests; exact ID set test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change until state task is implemented
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Support and milestone records are stable and ready for purchase/unlock tasks.

#### QA-PLAYABLE-MVP-008

- Task ID: `QA-PLAYABLE-MVP-008`
- Title: Separate simulation cadence from runtime cooldowns
- Epic: Epic 1 - Runtime Data Contracts
- Priority: P0
- Status: Ready
- Objective: Prevent locked simulator cadence assumptions from becoming runtime action cooldowns.
- Scope: Mark candidate cadence parameters as simulator-only; ensure runtime action timing continues to follow existing gameplay rules and documented runtime behavior.
- Out of Scope: Changing simulator scenarios; adding real-time cooldown mechanics.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`, `docs/02-Core_Gameplay _Loop.md`
- Dependencies: `QA-PLAYABLE-MVP-003`
- Implementation Notes: Cadence values such as 10-second baseline manual interval are validation strategy inputs, not player-facing restrictions.
- Acceptance Criteria: Runtime parameter contract excludes scenario cadence from gameplay control paths; tests prove manual actions are not gated by simulator cadence.
- Required Tests: Runtime contract test; regression test for manual action availability.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Simulator strategy cadence cannot accidentally constrain runtime play.

#### QA-PLAYABLE-MVP-042

- Task ID: `QA-PLAYABLE-MVP-042`
- Title: Extend Modifier System for Assistant path
- Epic: Epic 1 - Runtime Data Contracts
- Priority: P0
- Status: Ready
- Objective: Add Modifier System support required by Assistant production, Support Upgrades, milestones and offline efficiency.
- Scope: Support additive Assistant production, first-milestone production multiplier, future-level cost multiplier from Training Support, offline efficiency modifier from Handover Support, deterministic modifier ordering, scope/target validation, and runtime/simulator parity fixtures.
- Out of Scope: Direct Money production; automatic reporting; bypassing Modifier System with hard-coded conditional formulas; adding future modifiers outside the approved Assistant path.
- Authoritative Documents: `docs/09-Modifier_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`
- Dependencies: `QA-PLAYABLE-MVP-006`, `QA-PLAYABLE-MVP-007`
- Implementation Notes: Production, cost, Support and offline calculators must consume modifier outputs or validated modifier-aware stat inputs rather than duplicating Support conditionals in isolated formulas.
- Acceptance Criteria: Modifier definitions validate target/scope; ordering is deterministic; Assistant production, milestone, Training cost and Handover offline effects can be represented; no modifier can produce Money or trigger Report.
- Required Tests: Modifier ordering tests; scope/target validation tests; no-Money/no-auto-reporting tests; runtime/simulator parity fixtures for each approved Assistant modifier.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Approved Assistant effects are represented through the Modifier System and protected by parity tests.

### Epic 2 - State and Save Schema v2

#### QA-PLAYABLE-MVP-009

- Task ID: `QA-PLAYABLE-MVP-009`
- Title: Introduce save schema v2 and Assistant state
- Epic: Epic 2 - State and Save Schema v2
- Priority: P0
- Status: Ready
- Objective: Add save-compatible state for Assistant runtime progress.
- Scope: Persist Assistant unlocked flag, level, max level reference or validated level cap, owned Support Upgrade IDs and reached milestone IDs.
- Out of Scope: Offline progress calculation; purchases; UI display.
- Authoritative Documents: `docs/07-Technical_Rules.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/08-MVP_Vertical_Slice_Specification.md`
- Dependencies: `QA-PLAYABLE-MVP-005`, `QA-PLAYABLE-MVP-007`
- Implementation Notes: Use migration defaults that preserve old saves and do not grant passive progress during migration.
- Acceptance Criteria: New saves include v2 Assistant state; old saves load with safe defaults; invalid levels are clamped or rejected according to existing save policy.
- Required Tests: New-game save test; v1 migration test; malformed Assistant state test.
- Verification Commands: `pnpm test -- --run src/save.test.ts`; `npm run check`
- Save Impact: Changes save data to schema v2
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Assistant state persists safely and v1 saves remain playable.

#### QA-PLAYABLE-MVP-010

- Task ID: `QA-PLAYABLE-MVP-010`
- Title: Persist production-observed and endpoint state
- Epic: Epic 2 - State and Save Schema v2
- Priority: P0
- Status: Ready
- Objective: Track whether the passive loop has been observed after unlock and whether endpoint conditions have been met.
- Scope: Add state for post-unlock production observed, post-milestone production observed and endpoint completion status.
- Out of Scope: Endpoint UI; production calculation; playtest checklist.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`
- Dependencies: `QA-PLAYABLE-MVP-009`
- Implementation Notes: Endpoint requires Assistant level 8, first milestone reached and at least one post-milestone passive production tick.
- Acceptance Criteria: State survives save/load; endpoint is not true before the required post-milestone production tick.
- Required Tests: Save/load tests for observed flags and endpoint state.
- Verification Commands: `pnpm test -- --run src/save.test.ts`; `npm run check`
- Save Impact: Changes save data
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Endpoint-relevant state can be persisted without deriving it incorrectly on load.

#### QA-PLAYABLE-MVP-011

- Task ID: `QA-PLAYABLE-MVP-011`
- Title: Persist offline summary and timestamp state
- Epic: Epic 2 - State and Save Schema v2
- Priority: P0
- Status: Ready
- Objective: Prepare save data for explicit offline-return summaries without granting offline rewards during migration.
- Scope: Add last active timestamp, pending offline summary, consumed offline summary state and invalid timestamp handling fields if needed.
- Out of Scope: Offline reward calculation; offline modal UI; background timers.
- Authoritative Documents: `docs/07-Technical_Rules.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-009`
- Implementation Notes: Migration must initialize timestamps safely and prevent old saves from receiving an accidental offline grant.
- Acceptance Criteria: New saves persist timestamp state; migrated saves do not show or grant offline progress until after a valid post-migration session.
- Required Tests: Migration no-grant test; invalid/future timestamp load test; summary persistence test.
- Verification Commands: `pnpm test -- --run src/save.test.ts`; `npm run check`
- Save Impact: Changes save data
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Offline persistence exists with no accidental migration payout.

#### QA-PLAYABLE-MVP-012

- Task ID: `QA-PLAYABLE-MVP-012`
- Title: Maintain Technical Slice save compatibility
- Epic: Epic 2 - State and Save Schema v2
- Priority: P0
- Status: Ready
- Objective: Keep accepted Technical Vertical Slice saves valid after Playable Idle MVP state is added.
- Scope: Add compatibility fixtures for saves at new game, pre-promotion, promotion-available and Middle QA endpoint states from the old slice.
- Out of Scope: Importing duplicate project folders; changing old backlog tasks; changing historical slice behavior.
- Authoritative Documents: `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/07-Technical_Rules.md`, `docs/README.md`
- Dependencies: `QA-PLAYABLE-MVP-009`, `QA-PLAYABLE-MVP-010`, `QA-PLAYABLE-MVP-011`
- Implementation Notes: Middle QA endpoint saves should become valid starting states for Assistant unlock integration, not broken legacy records.
- Acceptance Criteria: Old slice fixtures load; no old fixture gets Money, Support ownership or offline Bugs from migration; manual loop remains functional.
- Required Tests: Compatibility fixture tests; migration regression tests.
- Verification Commands: `pnpm test -- --run src/save.test.ts`; `npm run check`
- Save Impact: Validates save migration behavior
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Old Technical Slice saves remain compatible and do not receive unintended rewards.

### Epic 3 - Deterministic Production Core

#### QA-PLAYABLE-MVP-013

- Task ID: `QA-PLAYABLE-MVP-013`
- Title: Create shared Assistant production calculator
- Epic: Epic 3 - Deterministic Production Core
- Priority: P0
- Status: Ready
- Objective: Implement a pure calculator for Assistant Bugs Found production shared by online and offline systems.
- Scope: Calculate additive base/per-level production, immediate Support additive production and milestone multiplier using active candidate parameters.
- Out of Scope: Applying resource transactions; UI display; offline efficiency.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`, `docs/09-Modifier_System.md`
- Dependencies: `QA-PLAYABLE-MVP-006`, `QA-PLAYABLE-MVP-007`, `QA-PLAYABLE-MVP-042`
- Implementation Notes: Use fixed-point/decimal precision policy with 6 decimal places and no UI rounding in authoritative math. Do not bypass Modifier System with hard-coded Support or milestone conditionals.
- Acceptance Criteria: Calculator returns 0.8 Bugs/sec at level 0 with no Support; level 8 with first milestone matches candidate formula; Support additive effect is applied before multiplier.
- Required Tests: Pure calculator unit tests; precision/rounding tests; simulator parity fixture for representative levels.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: One deterministic calculator owns Assistant production math for runtime systems.

#### QA-PLAYABLE-MVP-014

- Task ID: `QA-PLAYABLE-MVP-014`
- Title: Integrate online elapsed-time passive production
- Epic: Epic 3 - Deterministic Production Core
- Priority: P0
- Status: Ready
- Objective: Add online passive Bugs Found production after Assistant unlock.
- Scope: Convert elapsed online time into Bugs Found through the shared calculator and Resource System transactions.
- Out of Scope: Money generation; automatic reporting; offline progress; UI animation.
- Authoritative Documents: `docs/06-Game_Systems.md`, `docs/07-Technical_Rules.md`, `docs/11-Resource_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-009`, `QA-PLAYABLE-MVP-013`
- Implementation Notes: Manual Testing remains an active burst; passive production adds Bugs Found only and should emit committed resource events.
- Acceptance Criteria: No passive Bugs before Assistant unlock; level 0 produces after unlock; Bugs Found increases through Resource transactions; Money never increases from passive production.
- Required Tests: Tick tests for locked/unlocked states; elapsed-time accumulation tests; no-Money regression test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Uses existing and v2 state but does not add new fields beyond Epic 2
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Online Assistant production works deterministically and respects resource boundaries.

#### QA-PLAYABLE-MVP-015

- Task ID: `QA-PLAYABLE-MVP-015`
- Title: Add production event ordering and observed-state updates
- Epic: Epic 3 - Deterministic Production Core
- Priority: P1
- Status: Ready
- Objective: Update production-observed and endpoint-related state only after committed production transactions.
- Scope: Emit/record passive production events; update Assistant production-observed flags; mark post-milestone production observed after an eligible tick.
- Out of Scope: UI notifications; endpoint acceptance screen; Support purchases.
- Authoritative Documents: `docs/07-Technical_Rules.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-010`, `QA-PLAYABLE-MVP-014`
- Implementation Notes: Events must not imply new gameplay; they support diagnostics, endpoint checks and future telemetry.
- Acceptance Criteria: Observed flags change only when Bugs Found is actually granted; endpoint state remains false until after a post-milestone tick.
- Required Tests: Event ordering test; endpoint false-before-tick test; post-milestone tick test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Updates v2 observed state
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Passive production state changes are transaction-backed and endpoint-safe.

#### QA-PLAYABLE-MVP-016

- Task ID: `QA-PLAYABLE-MVP-016`
- Title: Add simulator/runtime formula parity tests
- Epic: Epic 3 - Deterministic Production Core
- Priority: P0
- Status: Ready
- Objective: Prove runtime production math matches simulator formulas for active candidate fixtures.
- Scope: Add comparison fixtures for levels 0, 3, 5 and 8, Support/no-Support combinations and milestone multiplier behavior.
- Out of Scope: Full scenario simulation in runtime; playtest telemetry.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-013`, `QA-PLAYABLE-MVP-014`
- Implementation Notes: Use the same candidate profile ID and parameter version in parity fixture metadata.
- Acceptance Criteria: Runtime fixtures match simulator expected values within approved precision; mismatch fails tests with parameter version context.
- Required Tests: Formula parity tests; fixture metadata test.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Runtime and simulator formulas stay aligned under automated tests.

### Epic 4 - Assistant Level Purchases

#### QA-PLAYABLE-MVP-043

- Task ID: `QA-PLAYABLE-MVP-043`
- Title: Extend Upgrade System for finite Assistant levels
- Epic: Epic 4 - Assistant Level Purchases
- Priority: P0
- Status: Ready
- Objective: Extend Upgrade System support beyond `one_time` so Assistant levels have a documented lifecycle.
- Scope: Add finite capped level-based Assistant investment support, current level, max level, next-level eligibility, Buy 1 lifecycle, Buy Max lifecycle, cost resolver integration, and save/state ownership boundaries.
- Out of Scope: Changing one-time Technical Slice upgrades; merging one-time Support Upgrades into the level model; implementing UI buttons; changing balance values.
- Authoritative Documents: `docs/12-Upgrade_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`
- Dependencies: `QA-PLAYABLE-MVP-006`, `QA-PLAYABLE-MVP-007`, `QA-PLAYABLE-MVP-009`, `QA-PLAYABLE-MVP-042`
- Implementation Notes: One-time Support Upgrades remain separate from repeatable Assistant levels. Existing Technical Slice one-time upgrades must stay compatible and continue using their current purchase lifecycle.
- Acceptance Criteria: Upgrade System can represent a finite capped Assistant level investment; next-level eligibility is queryable; Buy 1 and Buy Max lifecycle hooks are available; save ownership boundary is explicit; one-time upgrades remain compatible.
- Required Tests: Level-based upgrade definition tests; next-level eligibility tests; Buy 1/Buy Max lifecycle tests; Technical Slice one-time upgrade regression tests.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Uses v2 Assistant state ownership boundaries
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Assistant levels use Upgrade System level semantics instead of ad hoc purchase state.

#### QA-PLAYABLE-MVP-017

- Task ID: `QA-PLAYABLE-MVP-017`
- Title: Implement Assistant next-level cost calculation
- Epic: Epic 4 - Assistant Level Purchases
- Priority: P0
- Status: Ready
- Objective: Calculate capped Assistant level costs from the active candidate formula.
- Scope: Implement base cost 200, growth 1.14, linear stabilizer 10, future Training discount multiplier 0.76 and currency rounding.
- Out of Scope: Spending Money; Buy Max; UI previews.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/10-Economy_Framework.md`
- Dependencies: `QA-PLAYABLE-MVP-006`, `QA-PLAYABLE-MVP-042`, `QA-PLAYABLE-MVP-043`
- Implementation Notes: Training discount applies only after ownership and must not refund previous purchases.
- Acceptance Criteria: Cost calculator matches candidate fixtures; max-level state has no next purchasable level; discount only affects future costs.
- Required Tests: Cost formula tests; Training ownership timing tests; max-level tests.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Assistant cost math is deterministic and separately testable.

#### QA-PLAYABLE-MVP-018

- Task ID: `QA-PLAYABLE-MVP-018`
- Title: Implement Assistant Buy 1 transaction
- Epic: Epic 4 - Assistant Level Purchases
- Priority: P0
- Status: Ready
- Objective: Allow the player to buy one Assistant level with Money.
- Scope: Validate Assistant unlocked, level below cap, affordability, atomic Money spending, level increment and milestone detection.
- Out of Scope: Buy Max; Support purchases; UI buttons.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/11-Resource_System.md`, `docs/12-Upgrade_System.md`
- Dependencies: `QA-PLAYABLE-MVP-009`, `QA-PLAYABLE-MVP-017`, `QA-PLAYABLE-MVP-043`
- Implementation Notes: Spending and level increment must commit atomically or fail without partial state changes.
- Acceptance Criteria: Affordable purchase spends exact cost and increments one level; unaffordable purchase fails gracefully; max-level purchase is blocked; milestone crossing emits ordered event.
- Required Tests: Buy 1 success/failure tests; affordability and atomicity tests; milestone crossing test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Updates Assistant level and Money in save state
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Buy 1 is a safe Resource-backed Assistant level transaction.

#### QA-PLAYABLE-MVP-019

- Task ID: `QA-PLAYABLE-MVP-019`
- Title: Implement Assistant Buy Max transaction
- Epic: Epic 4 - Assistant Level Purchases
- Priority: P0
- Status: Ready
- Objective: Buy the highest affordable contiguous Assistant level range in one transaction.
- Scope: Simulate costs, spend Money atomically, increase levels, emit one purchase action with levels purchased and emit all crossed milestones in ascending order.
- Out of Scope: Bulk Support purchases; UI feedback; changing cost formula.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-018`, `QA-PLAYABLE-MVP-043`
- Implementation Notes: Honor `PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION` in validation contexts before endpoint while preserving runtime correctness.
- Acceptance Criteria: Buy Max cannot skip costs; emits every crossed milestone; detects endpoint level 8 crossing; does nothing when no level is affordable.
- Required Tests: Buy Max affordability tests; multi-milestone event ordering test; endpoint crossing test; max-level behavior test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Updates Assistant level and Money in save state
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Buy Max is deterministic, atomic and milestone-safe.

#### QA-PLAYABLE-MVP-020

- Task ID: `QA-PLAYABLE-MVP-020`
- Title: Wire Assistant milestone and endpoint detection
- Epic: Epic 4 - Assistant Level Purchases
- Priority: P0
- Status: Ready
- Objective: Detect Assistant milestones and endpoint state without requiring Support ownership.
- Scope: Mark milestone level 8 reached, capstone level 25 reached for feedback/status only, endpoint level target 8 reached and endpoint pending post-milestone production tick.
- Out of Scope: Playtest acceptance; UI endpoint screen; Support requirements.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-015`, `QA-PLAYABLE-MVP-018`, `QA-PLAYABLE-MVP-019`
- Implementation Notes: Support Upgrades are not endpoint requirements; capstone is not MVP endpoint.
- Acceptance Criteria: Level 8 crossing records first milestone; endpoint is not completed until post-milestone production tick; no Support ownership is checked for endpoint.
- Required Tests: Endpoint condition tests; no-support endpoint regression; capstone status test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Updates milestone and endpoint state
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Runtime endpoint logic matches doc 15 exactly.

### Epic 5 - Support Upgrades

#### QA-PLAYABLE-MVP-021

- Task ID: `QA-PLAYABLE-MVP-021`
- Title: Integrate Support Upgrade framework
- Epic: Epic 5 - Support Upgrades
- Priority: P0
- Status: Ready
- Objective: Enable one-time Assistant Support Upgrades through existing Upgrade and Modifier architecture.
- Scope: Implement common ownership, affordability, one-time purchase, stable ID validation and optionality rules for exactly three Support Upgrades.
- Out of Scope: Adding new currencies, systems, producers, Money generation or auto-reporting.
- Authoritative Documents: `docs/12-Upgrade_System.md`, `docs/09-Modifier_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-007`, `QA-PLAYABLE-MVP-009`, `QA-PLAYABLE-MVP-042`, `QA-PLAYABLE-MVP-043`
- Implementation Notes: Support Upgrades use shared Money and are Middle QA only.
- Acceptance Criteria: Support ownership is one-time; duplicate purchase is blocked; all three Supports are optional; no extra Support IDs exist.
- Required Tests: Support purchase framework tests; duplicate-purchase test; exact ID set test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates owned Support Upgrade IDs
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Support Upgrades share a safe purchase path and remain exactly scoped.

#### QA-PLAYABLE-MVP-022

- Task ID: `QA-PLAYABLE-MVP-022`
- Title: Implement Immediate Production Support
- Epic: Epic 5 - Support Upgrades
- Priority: P0
- Status: Ready
- Objective: Implement `support_immediate_production` as the early additive production option.
- Scope: Unlock when Assistant is active; price 120 Money; add 0.22 Bugs/sec before milestone multiplier after ownership.
- Out of Scope: Money production; Report automation; additional production sources.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/09-Modifier_System.md`
- Dependencies: `QA-PLAYABLE-MVP-013`, `QA-PLAYABLE-MVP-021`, `QA-PLAYABLE-MVP-042`
- Implementation Notes: Effect must flow through the same production calculator used for online and offline calculations.
- Acceptance Criteria: Purchase spends 120 Money once; production increases by additive 0.22 before multiplier; no Money is generated.
- Required Tests: Purchase test; production calculator with Support test; no-Money test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates Support ownership
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Immediate Support provides only its documented additive Bugs/sec effect.

#### QA-PLAYABLE-MVP-023

- Task ID: `QA-PLAYABLE-MVP-023`
- Title: Implement Training Support
- Epic: Epic 5 - Support Upgrades
- Priority: P0
- Status: Ready
- Objective: Implement `support_training_economics` as the future-level cost discount option.
- Scope: Unlock at Assistant level >= 2; price 160 Money; apply 0.76 cost multiplier only to future Assistant level purchases after ownership.
- Out of Scope: Refunds; retroactive discounts; production changes.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/12-Upgrade_System.md`
- Dependencies: `QA-PLAYABLE-MVP-017`, `QA-PLAYABLE-MVP-021`, `QA-PLAYABLE-MVP-042`, `QA-PLAYABLE-MVP-043`
- Implementation Notes: Tests must prove prior purchases are not refunded or recalculated.
- Acceptance Criteria: Locked before level 2; purchase spends 160 once; future costs use 0.76 multiplier; historical spend remains unchanged.
- Required Tests: Unlock threshold test; future-only discount test; no-refund test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates Support ownership
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Training Support affects only future Assistant level costs.

#### QA-PLAYABLE-MVP-024

- Task ID: `QA-PLAYABLE-MVP-024`
- Title: Implement Offline Handover Support
- Epic: Epic 5 - Support Upgrades
- Priority: P0
- Status: Ready
- Objective: Implement `support_offline_handover` as the only offline-efficiency Support Upgrade.
- Scope: Unlock at Assistant level >= 5; price 150 Money; switch offline efficiency from 0.35 to 0.62 after ownership.
- Out of Scope: Online production changes; Money production; automatic Report; extra offline systems.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-021`, `QA-PLAYABLE-MVP-030`, `QA-PLAYABLE-MVP-042`
- Implementation Notes: Controlled Handover simulator diagnostics must not be implemented as direct Money or auto-reporting.
- Acceptance Criteria: Locked before level 5; purchase spends 150 once; offline summary uses 0.62 efficiency; online rate is unchanged by this Support.
- Required Tests: Unlock threshold test; offline efficiency test; no-online-effect test; no-Money/no-Report test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates Support ownership
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Offline Handover improves only offline Bugs Found efficiency.

### Epic 6 - Promotion and Unlock Integration

#### QA-PLAYABLE-MVP-025

- Task ID: `QA-PLAYABLE-MVP-025`
- Title: Activate Assistant on Middle QA promotion
- Epic: Epic 6 - Promotion and Unlock Integration
- Priority: P0
- Status: Ready
- Objective: Connect completed Middle QA promotion to Assistant unlock and level 0 passive production.
- Scope: On promotion completion, unlock Assistant, initialize level 0 state and allow immediate passive Bugs Found production.
- Out of Scope: Full Team activation; Automation activation; Support purchase UI.
- Authoritative Documents: `docs/14-Promotion_System.md`, `docs/13-Unlock_System.md`, `docs/06-Game_Systems.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-014`, `QA-PLAYABLE-MVP-009`
- Implementation Notes: Technical Slice promotion regression must remain intact through the new post-promotion behavior.
- Acceptance Criteria: Middle QA promotion activates Assistant; level 0 produces on the next eligible tick; full Team and Automation remain inactive.
- Required Tests: Promotion integration test; Technical Slice promotion regression; no-Team/no-Automation activation test.
- Verification Commands: `pnpm test -- --run src/gameLogic.test.ts`; `npm run check`
- Save Impact: Updates Assistant unlocked state
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Promotion starts the first passive loop without activating future systems.

#### QA-PLAYABLE-MVP-026

- Task ID: `QA-PLAYABLE-MVP-026`
- Title: Implement staged Support unlock thresholds
- Epic: Epic 6 - Promotion and Unlock Integration
- Priority: P0
- Status: Ready
- Objective: Reveal Support Upgrades at the documented Assistant progression thresholds.
- Scope: Immediate Support unlocks with Assistant; Training unlocks at level 2; Offline Handover unlocks at level 5; future systems remain hidden or teased only as documented.
- Out of Scope: Changing thresholds; endpoint requirements; visual polish.
- Authoritative Documents: `docs/13-Unlock_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-021`, `QA-PLAYABLE-MVP-025`
- Implementation Notes: Unlock processing must be deterministic and event ordered when Buy Max crosses multiple thresholds.
- Acceptance Criteria: Supports unlock at exact thresholds; Buy Max triggers unlocks in ascending dependency order; hidden future systems do not appear as active gameplay.
- Required Tests: Threshold unlock tests; Buy Max unlock ordering test; future-system hidden/inactive test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates unlock state
- UI Impact: Enables later UI states but no direct UI change
- Risk Level: High
- Definition of Done: Support visibility and availability follow documented progression.

#### QA-PLAYABLE-MVP-027

- Task ID: `QA-PLAYABLE-MVP-027`
- Title: Preserve teaser and future-system boundaries
- Epic: Epic 6 - Promotion and Unlock Integration
- Priority: P1
- Status: Ready
- Objective: Ensure Playable Idle MVP integration does not accidentally activate Team, Automation or other excluded systems.
- Scope: Add guards and regression coverage for full Team inactive, Automation inactive, auto-reporting inactive and teaser-only future-system exposure.
- Out of Scope: Implementing future systems; expanding Statistics; visual redesign.
- Authoritative Documents: `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/13-Unlock_System.md`, `docs/06-Game_Systems.md`
- Dependencies: `QA-PLAYABLE-MVP-025`, `QA-PLAYABLE-MVP-026`
- Implementation Notes: Teasers may communicate future help, but must not create active mechanics.
- Acceptance Criteria: Excluded systems have no runtime production, resource effects, endpoint effects or save activation from MVP actions.
- Required Tests: Future-system inactivity regression tests; auto-reporting no-op test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No new save data beyond unlock state validation
- UI Impact: May constrain teaser visibility rules
- Risk Level: Medium
- Definition of Done: Excluded systems remain inert across promotion, unlock, purchases and save/load.

### Epic 7 - Offline Progress

#### QA-PLAYABLE-MVP-028

- Task ID: `QA-PLAYABLE-MVP-028`
- Title: Implement shared offline production calculation
- Epic: Epic 7 - Offline Progress
- Priority: P0
- Status: Ready
- Objective: Calculate offline Bugs Found with the same Assistant production calculator used online.
- Scope: Use eligible seconds, 7200-second cap, base efficiency 0.35 and Support efficiency 0.62.
- Out of Scope: Money generation; automatic Report; UI summary display.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`, `docs/09-Modifier_System.md`
- Dependencies: `QA-PLAYABLE-MVP-013`, `QA-PLAYABLE-MVP-011`, `QA-PLAYABLE-MVP-042`
- Implementation Notes: Offline cap is a time cap, not a storage cap.
- Acceptance Criteria: No offline gain before Assistant unlock; capped elapsed time is used; efficiency remains below online; Handover Support changes only offline efficiency.
- Required Tests: Offline calculator tests; cap test; with/without Support efficiency tests; no-pre-unlock gain test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Uses offline timestamp state
- UI Impact: No UI change
- Risk Level: High
- Definition of Done: Offline math is deterministic and reuses authoritative production logic.

#### QA-PLAYABLE-MVP-029

- Task ID: `QA-PLAYABLE-MVP-029`
- Title: Apply offline return transaction and summary
- Epic: Epic 7 - Offline Progress
- Priority: P0
- Status: Ready
- Objective: Grant capped offline Bugs Found and record an explicit return summary.
- Scope: On valid return, add Bugs Found only through Resource transactions and store summary fields for elapsed seconds, capped seconds, efficiency, rate and Bugs Found gained.
- Out of Scope: Reporting Bugs automatically; granting Money; modal visual design.
- Authoritative Documents: `docs/11-Resource_System.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/07-Technical_Rules.md`
- Dependencies: `QA-PLAYABLE-MVP-028`
- Implementation Notes: Offline summary is player-facing later, but core logic should not depend on UI acknowledgment.
- Acceptance Criteria: Offline return grants Bugs Found only; Money is unchanged; Report is not called; summary survives until consumed or replaced according to save policy.
- Required Tests: Offline grant test; no-Money/no-Report test; summary persistence test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Updates Bugs Found and offline summary state
- UI Impact: Supplies data for later offline summary UI
- Risk Level: High
- Definition of Done: Offline return is explicit, bounded and resource-safe.

#### QA-PLAYABLE-MVP-030

- Task ID: `QA-PLAYABLE-MVP-030`
- Title: Protect offline timestamps and migration behavior
- Epic: Epic 7 - Offline Progress
- Priority: P0
- Status: Ready
- Objective: Prevent invalid clocks, future timestamps and migrated saves from producing unintended offline rewards.
- Scope: Handle negative elapsed time, far-future timestamps, missing timestamps, first load after migration and repeated load cycles.
- Out of Scope: Anti-cheat systems; cloud time validation; monetization.
- Authoritative Documents: `docs/07-Technical_Rules.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-011`, `QA-PLAYABLE-MVP-029`
- Implementation Notes: Clamp or discard invalid elapsed time according to existing save safety patterns; record diagnostics for suspicious cases.
- Acceptance Criteria: Invalid timestamps do not grant resources; migrated saves do not get offline grants until after a valid saved timestamp; repeated returns do not double grant.
- Required Tests: Future timestamp test; missing timestamp test; migration no-grant test; double-grant prevention test.
- Verification Commands: `pnpm test -- --run src/save.test.ts`; `pnpm test -- --run`; `npm run check`
- Save Impact: Hardens offline timestamp state
- UI Impact: May provide no-summary state for invalid elapsed time
- Risk Level: High
- Definition of Done: Offline progress is robust against migration and clock manipulation edge cases.

### Epic 8 - Runtime Endpoint and Diagnostics

#### QA-PLAYABLE-MVP-031

- Task ID: `QA-PLAYABLE-MVP-031`
- Title: Expose runtime endpoint status
- Epic: Epic 8 - Runtime Endpoint and Diagnostics
- Priority: P0
- Status: Ready
- Objective: Provide internal endpoint status for the Playable Idle MVP acceptance flow.
- Scope: Expose Assistant level target 8 reached, first milestone reached, post-milestone production tick observed and endpoint complete.
- Out of Scope: Player-facing completion ceremony; Support ownership requirements; playtest checklist.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/08-MVP_Vertical_Slice_Specification.md`
- Dependencies: `QA-PLAYABLE-MVP-020`
- Implementation Notes: Endpoint complete must not require Support Upgrades.
- Acceptance Criteria: Diagnostic endpoint status is queryable; no-support endpoint path can complete; endpoint remains incomplete before post-milestone tick.
- Required Tests: Endpoint diagnostic tests; no-support path test; pre/post tick tests.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Reads and updates endpoint state
- UI Impact: Supplies data for later endpoint UI
- Risk Level: High
- Definition of Done: Endpoint state is explicit and testable.

#### QA-PLAYABLE-MVP-032

- Task ID: `QA-PLAYABLE-MVP-032`
- Title: Add production breakdown diagnostics
- Epic: Epic 8 - Runtime Endpoint and Diagnostics
- Priority: P1
- Status: Ready
- Objective: Provide debug-only insight into Assistant production composition.
- Scope: Expose base rate, per-level contribution, immediate Support contribution, pre-milestone rate, milestone multiplier, final online rate and active parameter version.
- Out of Scope: Player-facing formula text; visual polish; telemetry export.
- Authoritative Documents: `docs/07-Technical_Rules.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-013`, `QA-PLAYABLE-MVP-031`
- Implementation Notes: Diagnostics must not mutate state or create gameplay.
- Acceptance Criteria: Debug breakdown matches calculator output; parameter version is visible; diagnostics are unavailable or clearly debug-only in production UI.
- Required Tests: Breakdown fixture tests; read-only diagnostics test.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: Debug-only UI/data surface possible
- Risk Level: Medium
- Definition of Done: Internal diagnostics can explain production without influencing it.

#### QA-PLAYABLE-MVP-033

- Task ID: `QA-PLAYABLE-MVP-033`
- Title: Add simulator/runtime comparison fixtures
- Epic: Epic 8 - Runtime Endpoint and Diagnostics
- Priority: P1
- Status: Ready
- Objective: Create fixtures that compare runtime state snapshots with simulator expectations.
- Scope: Include active parameter version, Junior baseline version, Assistant level, Support ownership, milestones, endpoint and offline summary fields.
- Out of Scope: Full automated playtest runner; new balance tuning.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-016`, `QA-PLAYABLE-MVP-031`, `QA-PLAYABLE-MVP-032`
- Implementation Notes: Fixtures should support future acceptance runs without freezing doc 15.
- Acceptance Criteria: Runtime snapshots can be compared to simulator fixtures; mismatches name candidate ID and parameter version.
- Required Tests: Fixture generation/validation tests; mismatch reporting test.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Runtime/simulator comparison is repeatable and versioned.

### Epic 9 - Gameplay UI Functional Expansion

#### QA-PLAYABLE-MVP-034

- Task ID: `QA-PLAYABLE-MVP-034`
- Title: Add functional Assistant panel
- Epic: Epic 9 - Gameplay UI Functional Expansion
- Priority: P1
- Status: Ready
- Objective: Let players inspect and buy Assistant levels after Middle QA promotion.
- Scope: Display Assistant level, max level, passive Bugs/sec, next cost, Buy 1, Buy Max, affordability, max-level state and before/after production preview.
- Out of Scope: Full visual redesign; final Cozy Corporate Workspace layout; Support cards; temporary player-facing layout that conflicts with approved VD-02/VD-03.
- Authoritative Documents: `docs/VD-01 UI Design System.txt`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/08-MVP_Vertical_Slice_Specification.md`
- Dependencies: `QA-PLAYABLE-MVP-019`, `QA-PLAYABLE-MVP-031`, `QA-PLAYABLE-MVP-037`, `QA-PLAYABLE-MVP-038`
- Implementation Notes: UI must not own formulas; use derived runtime data. Small debug/developer surfaces may exist earlier, but player-facing UI must follow approved VD-02 components and VD-03 workspace layout.
- Acceptance Criteria: Buttons reflect affordability and max-level state; previews match runtime calculations; responsive layout does not overlap existing Junior UI.
- Required Tests: Component or integration tests for button states; purchase interaction tests; accessibility state checks.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No new save fields; invokes purchase transactions
- UI Impact: Adds functional Assistant UI
- Risk Level: Medium
- Definition of Done: Assistant levels are playable through functional UI.

#### QA-PLAYABLE-MVP-035

- Task ID: `QA-PLAYABLE-MVP-035`
- Title: Add functional Support Upgrade cards
- Epic: Epic 9 - Gameplay UI Functional Expansion
- Priority: P1
- Status: Ready
- Objective: Let players understand and buy the three Support Upgrades.
- Scope: Display cards/states for Immediate Production Support, Training Support and Offline Handover Support with locked, newly unlocked, affordable, unaffordable and owned states.
- Out of Scope: New Support types; final visual polish; hidden formula exposition; temporary player-facing layout that conflicts with approved VD-02/VD-03.
- Authoritative Documents: `docs/VD-01 UI Design System.txt`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/13-Unlock_System.md`
- Dependencies: `QA-PLAYABLE-MVP-022`, `QA-PLAYABLE-MVP-023`, `QA-PLAYABLE-MVP-024`, `QA-PLAYABLE-MVP-026`, `QA-PLAYABLE-MVP-037`, `QA-PLAYABLE-MVP-038`
- Implementation Notes: Separate repeatable Assistant levels from one-time Support Upgrades visually and semantically using approved VD-02/VD-03 patterns.
- Acceptance Criteria: Exactly three cards are shown when eligible; locked states respect thresholds; owned cards cannot be repurchased; previews use runtime data.
- Required Tests: UI state tests for thresholds and ownership; purchase interaction tests; accessibility labels/states.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No new save fields; invokes Support purchase transactions
- UI Impact: Adds Support Upgrade UI
- Risk Level: Medium
- Definition of Done: All three Support Upgrades are functional and clearly distinct from level purchases.

#### QA-PLAYABLE-MVP-036

- Task ID: `QA-PLAYABLE-MVP-036`
- Title: Add functional feedback, formatting and accessibility states
- Epic: Epic 9 - Gameplay UI Functional Expansion
- Priority: P1
- Status: Ready
- Objective: Communicate unlocks, milestones, Manual Burst vs Passive Baseline, offline return and endpoint state without final visual redesign.
- Scope: Add unlock feedback, milestone feedback, Buy Max crossed-milestone feedback, passive-rate labels, offline summary, endpoint status, number formatting and responsive/accessibility states.
- Out of Scope: Creating VD-02/VD-03; final visual polish beyond the approved functional states; changing gameplay formulas.
- Authoritative Documents: `docs/VD-01 UI Design System.txt`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/13-Unlock_System.md`
- Dependencies: `QA-PLAYABLE-MVP-029`, `QA-PLAYABLE-MVP-031`, `QA-PLAYABLE-MVP-034`, `QA-PLAYABLE-MVP-035`, `QA-PLAYABLE-MVP-037`, `QA-PLAYABLE-MVP-038`
- Implementation Notes: Number formatting should follow candidate display thresholds while authoritative calculations keep full precision.
- Acceptance Criteria: Offline summary is explicit; endpoint state is visible; milestone feedback appears for Buy Max crossings; UI remains usable on supported responsive widths and keyboard navigation.
- Required Tests: UI feedback tests; number formatting tests; accessibility checks; responsive smoke check.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: Consumes existing offline summary state
- UI Impact: Expands functional gameplay UI
- Risk Level: Medium
- Definition of Done: Functional UX supports the complete playable loop without claiming final visual polish.

### Epic 10 - Visual Workspace Implementation

#### QA-PLAYABLE-MVP-037

- Task ID: `QA-PLAYABLE-MVP-037`
- Title: Create and approve VD-02 UI Component Library
- Epic: Epic 10 - Visual Workspace Implementation
- Priority: P0
- Status: Ready
- Objective: Create and approve `VD-02 - UI Component Library` for Playable Idle MVP player-facing UI.
- Scope: Define components and states for the Assistant panel, Buy 1, Buy Max, Support cards, locked/unlocked/affordable/owned/max-level states, resource displays, milestone feedback, offline summary, endpoint presentation, accessibility and responsive behavior.
- Out of Scope: Implementing components in runtime code; changing gameplay formulas; inventing mechanics beyond current backlog scope.
- Authoritative Documents: `docs/VD-01 UI Design System.txt`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, this backlog
- Dependencies: Approved VD-01, approved doc 15 implementation candidate, current backlog approval
- Implementation Notes: Execution surface is ChatGPT Work/design documentation workflow. This task can run in parallel with runtime implementation after backlog approval.
- Acceptance Criteria: VD-02 exists, is approved, covers all required component states, and explicitly states that UI components consume runtime-derived data rather than owning formulas.
- Required Tests: Documentation review only; no runtime tests
- Verification Commands: `npm run check`
- Save Impact: No save data change
- UI Impact: Creates design authority for player-facing UI components
- Risk Level: Medium
- Definition of Done: VD-02 is approved and ready to guide functional and visual UI implementation.

#### QA-PLAYABLE-MVP-038

- Task ID: `QA-PLAYABLE-MVP-038`
- Title: Create and approve VD-03 MVP Workspace Layout
- Epic: Epic 10 - Visual Workspace Implementation
- Priority: P0
- Status: Ready
- Objective: Create and approve `VD-03 - MVP Workspace Layout` for the Junior to Middle workspace expansion.
- Scope: Define Junior workspace, Middle expansion, Assistant workspace area, hierarchy of manual/passive controls, upgrade surfaces, responsive layout, Cozy Corporate Workspace composition and endpoint state.
- Out of Scope: Runtime implementation; changing gameplay formulas; adding systems outside Playable Idle MVP scope.
- Authoritative Documents: `docs/VD-01 UI Design System.txt`, `docs/03-Player_Journey.md`, `docs/04-Career_System.md`, `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- Dependencies: `QA-PLAYABLE-MVP-037`, Docs 03, 04, 08 and 15 loaded for design context
- Implementation Notes: Execution surface is ChatGPT Work/design documentation workflow. This task can run in parallel with runtime implementation after VD-02 is approved.
- Acceptance Criteria: VD-03 exists, is approved, defines the Junior to Middle expansion and endpoint state, and keeps visual workspace implementation separate from mechanics.
- Required Tests: Documentation review only; no runtime tests
- Verification Commands: `npm run check`
- Save Impact: No save data change
- UI Impact: Creates design authority for workspace layout and expansion
- Risk Level: Medium
- Definition of Done: VD-03 is approved and ready to guide workspace implementation.

#### QA-PLAYABLE-MVP-044

- Task ID: `QA-PLAYABLE-MVP-044`
- Title: Implement VD-02 component primitives and states
- Epic: Epic 10 - Visual Workspace Implementation
- Priority: P1
- Status: Ready
- Objective: Implement approved VD-02 component primitives and interaction states for the Playable Idle MVP.
- Scope: Build component primitives and states for Assistant panel controls, Buy 1, Buy Max, Support cards, resource displays, milestone feedback, offline summary, endpoint presentation, accessibility and responsive behavior.
- Out of Scope: Changing gameplay formulas; adding new mechanics; implementing workspace layout beyond component composition hooks.
- Authoritative Documents: Approved VD-02, `docs/VD-01 UI Design System.txt`
- Dependencies: `QA-PLAYABLE-MVP-037`, `QA-PLAYABLE-MVP-019`, `QA-PLAYABLE-MVP-024`, `QA-PLAYABLE-MVP-026`, `QA-PLAYABLE-MVP-029`, `QA-PLAYABLE-MVP-031`
- Implementation Notes: Components must consume runtime state and derived values from functional mechanics; they must not calculate authoritative formulas.
- Acceptance Criteria: Approved component primitives and states are implemented; locked/unlocked/affordable/owned/max-level/accessibility states render correctly; responsive behavior matches VD-02.
- Required Tests: Component tests; interaction-state tests; accessibility checks; responsive smoke checks.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: Implements approved component layer
- Risk Level: Medium
- Definition of Done: VD-02 components are implemented and tested without gameplay changes.

#### QA-PLAYABLE-MVP-045

- Task ID: `QA-PLAYABLE-MVP-045`
- Title: Implement VD-03 workspace layout and Junior to Middle expansion
- Epic: Epic 10 - Visual Workspace Implementation
- Priority: P1
- Status: Ready
- Objective: Implement the approved MVP workspace layout and visible Junior to Middle expansion.
- Scope: Implement Junior workspace, Middle expansion, Assistant workspace area, manual/passive control hierarchy, upgrade surfaces, responsive layout, Cozy Corporate Workspace composition and endpoint state.
- Out of Scope: Changing mechanics; changing formulas; adding future-system gameplay.
- Authoritative Documents: Approved VD-03, approved VD-02, `docs/VD-01 UI Design System.txt`
- Dependencies: `QA-PLAYABLE-MVP-038`, `QA-PLAYABLE-MVP-034`, `QA-PLAYABLE-MVP-035`, `QA-PLAYABLE-MVP-036`
- Implementation Notes: Layout must preserve the familiar Junior workspace while visibly adding Assistant support after Middle QA promotion.
- Acceptance Criteria: Workspace follows VD-03; Junior and Middle states are visually distinct; Assistant area appears only when appropriate; endpoint state has an approved presentation; responsive layout avoids overlap.
- Required Tests: Layout/component integration tests; responsive smoke checks; accessibility checks.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: Implements approved workspace layout
- Risk Level: Medium
- Definition of Done: VD-03 workspace is implemented and tested without gameplay changes.

#### QA-PLAYABLE-MVP-046

- Task ID: `QA-PLAYABLE-MVP-046`
- Title: Integrate visual feedback, motion and final responsive accessibility polish
- Epic: Epic 10 - Visual Workspace Implementation
- Priority: P1
- Status: Ready
- Objective: Complete final visual feedback, motion, responsive behavior and accessibility polish for the Playable Idle MVP.
- Scope: Integrate approved milestone feedback, unlock feedback, purchase feedback, offline summary feedback, endpoint feedback, motion rules, focus states, keyboard behavior and responsive polish.
- Out of Scope: Formula changes; balance changes; new systems; undocumented animations.
- Authoritative Documents: Approved VD-02, approved VD-03, `docs/VD-01 UI Design System.txt`
- Dependencies: `QA-PLAYABLE-MVP-044`, `QA-PLAYABLE-MVP-045`, `QA-PLAYABLE-MVP-036`
- Implementation Notes: Motion and feedback must communicate committed runtime events and never imply unimplemented automation, Money generation or future systems.
- Acceptance Criteria: Feedback matches committed events; reduced-motion and keyboard/accessibility states work; responsive layouts remain stable; final polish does not alter gameplay outcomes.
- Required Tests: Visual/component regression tests; accessibility checks; responsive smoke checks; reduced-motion checks where supported.
- Verification Commands: `pnpm test -- --run`; `npm run check`
- Save Impact: No save data change
- UI Impact: Completes final visual presentation layer
- Risk Level: Medium
- Definition of Done: Visual feedback and polish are implemented, accessible and responsive without gameplay changes.

### Epic 11 - Acceptance and Playtest Candidate

#### QA-PLAYABLE-MVP-039

- Task ID: `QA-PLAYABLE-MVP-039`
- Title: Run full regression and active candidate validation
- Epic: Epic 11 - Acceptance and Playtest Candidate
- Priority: P0
- Status: Ready
- Objective: Verify the implemented Playable Idle MVP against automated regression and balance candidate gates.
- Scope: Run full test suite, active balance candidate validation, runtime/simulator parity, visual regression/accessibility checks and production build.
- Out of Scope: Freezing doc 15; tuning values; creating GitHub Issues.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/08-MVP_Vertical_Slice_Specification.md`, `AGENTS.md`
- Dependencies: All runtime, functional UI and visual implementation tasks: `QA-PLAYABLE-MVP-001` through `QA-PLAYABLE-MVP-036`, plus `QA-PLAYABLE-MVP-042`, `QA-PLAYABLE-MVP-043`, `QA-PLAYABLE-MVP-044`, `QA-PLAYABLE-MVP-045` and `QA-PLAYABLE-MVP-046`
- Implementation Notes: This is an acceptance task after gameplay and functional UI work, not a balance tuning task.
- Acceptance Criteria: Full regression passes; `npm run balance:candidate` reports all required gates passing; visual/accessibility checks pass; production build succeeds.
- Required Tests: Full automated suite; balance candidate validation; visual/component checks; accessibility checks; production build smoke.
- Verification Commands: `pnpm test -- --run`; `npm run balance:candidate`; `npm run check`; production build command from package scripts
- Save Impact: No save schema changes expected
- UI Impact: No new UI expected
- Risk Level: High
- Definition of Done: Automated acceptance evidence is recorded without freezing doc 15.

#### QA-PLAYABLE-MVP-040

- Task ID: `QA-PLAYABLE-MVP-040`
- Title: Execute structured runtime acceptance runs
- Epic: Epic 11 - Acceptance and Playtest Candidate
- Priority: P0
- Status: Ready
- Objective: Validate clean, migrated, low-click, active-click, offline-return and endpoint flows in the implemented runtime.
- Scope: Run clean new-game, migrated v1, low-click structured, active-click structured, offline-return and no-support endpoint acceptance paths.
- Out of Scope: External playtest recruitment; balance tuning; final visual polish.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/08-MVP_Vertical_Slice_Specification.md`
- Dependencies: `QA-PLAYABLE-MVP-039`
- Implementation Notes: Use simulator scenarios as references but validate actual runtime behavior and saves.
- Acceptance Criteria: Each structured run reaches expected state; migrated v1 run has no accidental offline grant; offline-return run grants Bugs Found only; endpoint acceptance includes post-milestone tick.
- Required Tests: Scripted acceptance runs or documented manual-run checklist with captured results; save compatibility fixtures.
- Verification Commands: `npm run balance:candidate`; `npm run check`; any approved runtime acceptance script
- Save Impact: Validates save migration and offline state
- UI Impact: Validates functional UI paths if manual/scripted UI is included
- Risk Level: High
- Definition of Done: Runtime acceptance paths are documented with pass/fail evidence.

#### QA-PLAYABLE-MVP-041

- Task ID: `QA-PLAYABLE-MVP-041`
- Title: Prepare internal and external playtest candidate package
- Epic: Epic 11 - Acceptance and Playtest Candidate
- Priority: P1
- Status: Ready
- Objective: Prepare a playtest-ready candidate and structured observation loop.
- Scope: Create internal playtest checklist, external playtest preparation notes, structured observation template and feedback loop for simulator/doc 15 balance updates.
- Out of Scope: Freezing doc 15; changing balance values in this task; creating GitHub Issues.
- Authoritative Documents: `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, `docs/03-Player_Journey.md`, `docs/08-MVP_Vertical_Slice_Specification.md`
- Dependencies: `QA-PLAYABLE-MVP-040`, `QA-PLAYABLE-MVP-044`, `QA-PLAYABLE-MVP-045`, `QA-PLAYABLE-MVP-046`
- Implementation Notes: Observations should capture duration, purchase decisions, stalls, low-click viability, offline comprehension, endpoint clarity and UI confusion.
- Acceptance Criteria: Playtest package lists build/version, active candidate profile, checklist, observation template and balance feedback routing back into simulator and doc 15.
- Required Tests: Documentation review; production build verification from `QA-PLAYABLE-MVP-039`
- Verification Commands: `npm run check`
- Save Impact: No save data change
- UI Impact: No UI change
- Risk Level: Medium
- Definition of Done: Team can begin structured playtest validation without treating provisional balance as Frozen.

## Dependency Table

| Task | Depends On |
| --- | --- |
| QA-PLAYABLE-MVP-001 | None |
| QA-PLAYABLE-MVP-002 | Completed by Phase 7B evidence |
| QA-PLAYABLE-MVP-003 | 002 |
| QA-PLAYABLE-MVP-004 | 001, 002 |
| QA-PLAYABLE-MVP-005 | 003 |
| QA-PLAYABLE-MVP-006 | 003, 005 |
| QA-PLAYABLE-MVP-007 | 006 |
| QA-PLAYABLE-MVP-008 | 003 |
| QA-PLAYABLE-MVP-009 | 005, 007 |
| QA-PLAYABLE-MVP-010 | 009 |
| QA-PLAYABLE-MVP-011 | 009 |
| QA-PLAYABLE-MVP-012 | 009, 010, 011 |
| QA-PLAYABLE-MVP-013 | 006, 007, 042 |
| QA-PLAYABLE-MVP-014 | 009, 013 |
| QA-PLAYABLE-MVP-015 | 010, 014 |
| QA-PLAYABLE-MVP-016 | 013, 014 |
| QA-PLAYABLE-MVP-017 | 006, 042, 043 |
| QA-PLAYABLE-MVP-018 | 009, 017, 043 |
| QA-PLAYABLE-MVP-019 | 018, 043 |
| QA-PLAYABLE-MVP-020 | 015, 018, 019 |
| QA-PLAYABLE-MVP-021 | 007, 009, 042, 043 |
| QA-PLAYABLE-MVP-022 | 013, 021, 042 |
| QA-PLAYABLE-MVP-023 | 017, 021, 042, 043 |
| QA-PLAYABLE-MVP-024 | 021, 030, 042 |
| QA-PLAYABLE-MVP-025 | 009, 014 |
| QA-PLAYABLE-MVP-026 | 021, 025 |
| QA-PLAYABLE-MVP-027 | 025, 026 |
| QA-PLAYABLE-MVP-028 | 011, 013, 042 |
| QA-PLAYABLE-MVP-029 | 028 |
| QA-PLAYABLE-MVP-030 | 011, 029 |
| QA-PLAYABLE-MVP-031 | 020 |
| QA-PLAYABLE-MVP-032 | 013, 031 |
| QA-PLAYABLE-MVP-033 | 016, 031, 032 |
| QA-PLAYABLE-MVP-034 | 019, 031, 037, 038 |
| QA-PLAYABLE-MVP-035 | 022, 023, 024, 026, 037, 038 |
| QA-PLAYABLE-MVP-036 | 029, 031, 034, 035, 037, 038 |
| QA-PLAYABLE-MVP-037 | Approved VD-01, doc 15 implementation candidate, current backlog approval |
| QA-PLAYABLE-MVP-038 | 037; Docs 03, 04, 08 and 15 loaded for design context |
| QA-PLAYABLE-MVP-039 | 001, 003-036, 042-046; 002 already completed |
| QA-PLAYABLE-MVP-040 | 039 |
| QA-PLAYABLE-MVP-041 | 040, 044, 045, 046 |
| QA-PLAYABLE-MVP-042 | 006, 007 |
| QA-PLAYABLE-MVP-043 | 006, 007, 009, 042 |
| QA-PLAYABLE-MVP-044 | 037, 019, 024, 026, 029, 031 |
| QA-PLAYABLE-MVP-045 | 038, 034, 035, 036 |
| QA-PLAYABLE-MVP-046 | 044, 045, 036 |

## Critical Paths

Critical path is branching rather than one linear chain:

1. Runtime foundation branch: `QA-PLAYABLE-MVP-002 (Completed) -> 003 -> 005 -> 006`.
2. Modifier/production branch: `006 -> 007 -> 042 -> 013 -> 014 -> 015 -> 020 -> 031`.
3. Upgrade/purchase branch: `006 + 007 + 009 + 042 -> 043 -> 017 -> 018 -> 019 -> 020 -> 031`.
4. Save/offline branch: `009 -> 011 -> 028 -> 029 -> 030 -> 024 -> 035 -> 036`.
5. Support/unlock branch: `007 + 009 + 042 + 043 -> 021 -> 022/023/024 -> 026 -> 035 -> 036`.
6. Design branch: `QA-PLAYABLE-MVP-037 -> 038`; this can run in parallel with runtime work after backlog approval.
7. Functional UI merge: `019 + 031 + 037 + 038 -> 034`; `022 + 023 + 024 + 026 + 037 + 038 -> 035`; `029 + 031 + 034 + 035 + 037 + 038 -> 036`.
8. Visual implementation merge: `037 + mechanics -> 044`; `038 + 034 + 035 + 036 -> 045`; `044 + 045 + 036 -> 046`.
9. Acceptance merge: runtime, functional UI and visual implementation complete -> `039 -> 040 -> 041`.

## Tasks Safe To Run In Parallel

| Group | Tasks | Notes |
| --- | --- | --- |
| Remaining tooling/docs | 001, 004 | 002 is complete; 001 remains the first implementation task because overwrite protection is incomplete. |
| Contract split | 005, 008 | Both depend on 003 but touch different concerns. |
| Design documentation | 037, then 038 | VD-02 can begin after backlog approval; VD-03 follows VD-02 and can proceed while runtime implementation continues. |
| Save schema branches | 010, 011 | Both depend on 009; coordinate shared save type edits. |
| Production and upgrade foundations | 013, 043, 017 | Production and cost/upgrade work can progress in parallel after 042/043 dependencies are met; coordinate modifier-facing fixtures. |
| Support implementations | 022, 023 | Can run in parallel after 021; 024 waits for offline timestamp/application behavior. |
| Promotion/unlock hardening | 026, 027 | Can run in parallel after 025 if unlock fixtures are coordinated. |
| Diagnostics | 032, 033 | 033 waits for 032 output shape but fixture planning can begin after 016 and 031. |
| Functional UI | 034, 035 | Can run in parallel after mechanics plus VD-02/VD-03 land; 036 integrates shared feedback. |
| Visual implementation | 044, 045 | Can proceed in parallel once their design and functional dependencies land; 046 merges them. |

## Milestone Boundaries

1. Runtime Foundation: Complete `QA-PLAYABLE-MVP-001`, completed `QA-PLAYABLE-MVP-002`, `QA-PLAYABLE-MVP-003` through `QA-PLAYABLE-MVP-008`, and `QA-PLAYABLE-MVP-042`.
2. First Passive Loop: Complete `QA-PLAYABLE-MVP-009` through `QA-PLAYABLE-MVP-016` and `QA-PLAYABLE-MVP-025`.
3. Complete Idle Economy: Complete `QA-PLAYABLE-MVP-017` through `QA-PLAYABLE-MVP-027` and `QA-PLAYABLE-MVP-043`.
4. Offline and Persistence: Complete `QA-PLAYABLE-MVP-011`, `QA-PLAYABLE-MVP-012`, `QA-PLAYABLE-MVP-028`, `QA-PLAYABLE-MVP-029` and `QA-PLAYABLE-MVP-030`.
5. Functional UI: Complete design prerequisites `QA-PLAYABLE-MVP-037` and `QA-PLAYABLE-MVP-038`, then complete `QA-PLAYABLE-MVP-031` through `QA-PLAYABLE-MVP-036`.
6. Visual Workspace: Complete `QA-PLAYABLE-MVP-037`, `QA-PLAYABLE-MVP-038`, `QA-PLAYABLE-MVP-044`, `QA-PLAYABLE-MVP-045` and `QA-PLAYABLE-MVP-046`.
7. Playtest Candidate: Complete `QA-PLAYABLE-MVP-039` through `QA-PLAYABLE-MVP-041` after runtime, functional UI and visual implementation are complete.

## First Recommended Codex Implementation Task

Start with `QA-PLAYABLE-MVP-001 - Protect historical balance artifacts from accidental overwrite`.

Reason: it reduces the highest planning risk before implementation begins: accidentally overwriting historical artifacts or confusing active candidate outputs with historical evidence.

## Explicit Prerequisites For UI Work

Functional UI work should not begin until:

- VD-02 Component Library is approved (`QA-PLAYABLE-MVP-037`);
- VD-03 MVP Workspace Layout is approved (`QA-PLAYABLE-MVP-038`);
- Assistant runtime data contract exists (`QA-PLAYABLE-MVP-005`);
- active candidate parameters load (`QA-PLAYABLE-MVP-006`);
- save schema v2 persists required state (`QA-PLAYABLE-MVP-009` through `QA-PLAYABLE-MVP-012`);
- online production, purchases, Support Upgrades, unlocks, offline summary and endpoint state exist (`QA-PLAYABLE-MVP-014` through `QA-PLAYABLE-MVP-031`);
- VD-01 has been loaded for visual communication rules.

Visual implementation work should not begin until:

- VD-02 Component Library is approved (`QA-PLAYABLE-MVP-037`);
- VD-03 MVP Workspace Layout is approved (`QA-PLAYABLE-MVP-038`);
- required functional mechanics for each component or layout area are implemented;
- player-facing functional UI is complete where the visual task composes it (`QA-PLAYABLE-MVP-034` through `QA-PLAYABLE-MVP-036`).

## Explicit Prerequisites For Playtesting

Playtesting should not begin until:

- full regression passes;
- `npm run balance:candidate` passes for the active candidate;
- runtime/simulator parity fixtures pass;
- clean new-game, migrated v1, low-click, active-click, offline-return and no-support endpoint runs pass;
- VD-02 and VD-03 are approved;
- visual component, workspace and polish tasks are complete (`QA-PLAYABLE-MVP-044` through `QA-PLAYABLE-MVP-046`);
- production build succeeds;
- internal playtest checklist and structured observation template exist;
- doc 15 remains marked as implementation candidate, not Frozen.

## Highest-Risk Tasks

- `QA-PLAYABLE-MVP-003` because runtime/simulator contract leakage can create wrong gameplay.
- `QA-PLAYABLE-MVP-042` because bypassing Modifier System would split runtime formulas from approved architecture.
- `QA-PLAYABLE-MVP-043` because Assistant levels must extend Upgrade System without breaking one-time Technical Slice upgrades.
- `QA-PLAYABLE-MVP-009` through `QA-PLAYABLE-MVP-012` because save migration mistakes can break existing players or grant resources accidentally.
- `QA-PLAYABLE-MVP-013` through `QA-PLAYABLE-MVP-016` because production math must match simulator evidence.
- `QA-PLAYABLE-MVP-018` through `QA-PLAYABLE-MVP-020` because purchase atomicity, milestone ordering and endpoint detection define the core MVP.
- `QA-PLAYABLE-MVP-028` through `QA-PLAYABLE-MVP-030` because offline progress is vulnerable to timestamp and migration errors.
- `QA-PLAYABLE-MVP-037` and `QA-PLAYABLE-MVP-038` because player-facing UI must not invent incompatible temporary design.
- `QA-PLAYABLE-MVP-044` through `QA-PLAYABLE-MVP-046` because visual implementation must stay formula-neutral while proving accessibility and responsiveness.
- `QA-PLAYABLE-MVP-039` through `QA-PLAYABLE-MVP-041` because acceptance must not freeze provisional balance prematurely.

## Documentation Prerequisites Still Missing

- VD-02 Component Library documentation is not present yet; it is now planned as `QA-PLAYABLE-MVP-037`.
- VD-03 MVP Workspace Layout documentation is not present yet; it is now planned as `QA-PLAYABLE-MVP-038`.
- Doc 15 remains an implementation candidate and still requires playtest validation before it can be Frozen.
