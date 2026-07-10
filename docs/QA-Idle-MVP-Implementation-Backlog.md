# QA Idle MVP Implementation Backlog

Status: Ready for engineering execution  
Scope: MVP Vertical Slice only  
Repository: `Rizmont76/QA-idle`  
Rule: This backlog does not authorize production code changes by itself. Each implementation session should still read the related documentation first.

## Scope Guardrails

- Implement only the Junior QA MVP loop through `promotion_junior_to_middle`.
- Do not expose Team, Automation, Reputation, Contracts, Office, Company, Prestige, Events, Achievements, Statistics, Offline Progress, or future career gameplay.
- Use stable IDs from the MVP specification.
- Keep UI presentation separate from gameplay authority.
- Use data-driven definitions wherever practical.
- Use Resource System for balances and transactions.
- Use Modifier System for gameplay stat changes.
- Use shared requirement evaluation for promotion availability.
- Use Unlock System for visibility/access state.
- Use versioned Save/Load with safe defaults.

## Phase 1 - MVP Scope Lock

### QA-MVP-001 - Audit Current Implementation Against MVP Scope

Status: Complete
Priority: High  
Parent Phase: Phase 1 - MVP Scope Lock  
Suggested Order: 1

Purpose: Identify all existing implementation areas that conflict with the frozen MVP scope before changing behavior.

Scope:
- Inspect current source files for Team, Automation, Reputation, Achievements, Statistics, Offline Progress, passive production, and future-stage UI.
- Produce a short implementation note listing what must be removed, hidden, or made inert during MVP work.
- Do not change production code in this task unless separately authorized.

Files or Systems Expected to Be Modified:
- None for audit-only execution.
- Expected future systems affected: `src/gameData.ts`, `src/gameLogic.ts`, `src/main.tsx`, `src/save.ts`, `src/types.ts`.

Dependencies: None

Estimated Complexity: Small

Acceptance Criteria:
- All non-MVP systems currently present in code are identified.
- Each identified item is classified as `remove`, `hide`, `stub`, or `leave unchanged`.
- The audit references the MVP exclusion list.

Definition of Done:
- Engineering note exists and is clear enough for QA-MVP-002.

Expected Deliverables:
- Scope audit note.

Risks:
- Current implementation may include future mechanics intertwined with MVP state.

Related Documentation Sections:
- `docs/00 - Master Project Roadmap.md` - MVP Scope
- `docs/08 - MVP Vertical Slice Specification.md` - Scope, Excluded, Scope Validation
- `docs/07 - Technical Rules.md` - Hidden Systems Must Exist Safely

### QA-MVP-002 - Make Future Systems Inert for MVP

Status: Complete
Priority: High  
Parent Phase: Phase 1 - MVP Scope Lock  
Suggested Order: 2

Purpose: Ensure excluded systems do not affect simulation, UI, progression, resources, saves, or derived values during the MVP.

Scope:
- Disable or remove active behavior for Team, Automation, Reputation, Achievements, Statistics, Offline Progress, and passive production.
- Hide future tabs, panels, counters, toasts, and upgrade groups.
- Keep future stubs only if they are fully inert and inaccessible.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/save.ts`
- `src/types.ts`

Dependencies:
- QA-MVP-001

Estimated Complexity: Medium

Acceptance Criteria:
- No Team UI appears.
- No Automation UI appears.
- No Reputation resource appears.
- No Achievements or Statistics UI appears.
- No offline or passive production changes resources.
- Future systems do not affect promotion, upgrades, or derived values.

Definition of Done:
- Application behavior reflects only the MVP included systems.
- Existing future-system save fields, if present, do not crash load and do not affect gameplay.

Expected Deliverables:
- Code changes limited to making future systems inert.
- Short implementation note confirming excluded systems.

Risks:
- Removing future state too aggressively may break existing save parsing if not handled safely.

Implementation Note:
- Source review found no active Team, Automation, Reputation, Achievements, Statistics, Offline Progress, passive production, future UI panels, or future resource counters in the MVP code path. Existing save normalization ignores unknown future fields and restores only MVP state, so no production code change was required for this scope-lock item.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Excluded, Hidden Throughout the Entire Vertical Slice
- `docs/13 - Unlock System.md` - Hidden state
- `docs/07 - Technical Rules.md` - Hidden Systems Must Exist Safely

## Phase 2 - Core Data Contracts

### QA-MVP-003 - Define MVP Stable ID Constants

Status: Complete  
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 1

Purpose: Centralize stable IDs used by content definitions, save data, events, tests, and UI selectors.

Scope:
- Add stable identifiers for career stages, promotion, unlocks, UI surfaces, resources, gameplay stats, actions, and MVP upgrades.
- Avoid player-facing names as IDs.
- Do not add non-MVP IDs except inert placeholders required by existing type safety.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- `src/gameData.ts`
- Optional new content/registry file if the codebase structure supports it.

Dependencies:
- QA-MVP-002

Estimated Complexity: Small

Acceptance Criteria:
- IDs include `junior_qa`, `middle_qa`, `promotion_junior_to_middle`, `unlock_promotion_junior_to_middle`, `bugs_found`, `money`, `manual_bugs_per_action`, `money_per_bug_reported`.
- MVP upgrade IDs exactly match the specification.
- UI surface IDs exist for all MVP surfaces listed in documentation.

Definition of Done:
- All MVP implementation work can reference stable IDs from one authoritative place.

Expected Deliverables:
- Stable ID definitions.

Risks:
- Renaming current IDs may require save migration or transitional handling.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Required Stable IDs
- `docs/07 - Technical Rules.md` - Stable IDs
- `docs/13 - Unlock System.md` - Stable ID Rules

### QA-MVP-004 - Define MVP Resource Registry

Status: Complete
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 2

Purpose: Declare MVP resources through structured data instead of ad hoc state fields.

Scope:
- Define `bugs_found` and `money` resource definitions.
- Include display name, description, lifetime category, initial/min/max values, spendability, persistence, visibility, reset behavior, and format metadata.
- Do not implement resource operations in this task.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/types.ts`
- Optional resource definition module.

Dependencies:
- QA-MVP-003

Estimated Complexity: Small

Acceptance Criteria:
- `bugs_found` initial value is 0, min 0, MVP max 1,000,000, spendable by reporting.
- `money` initial value is 0, min 0, MVP max 1,000,000, spendable by upgrades.
- Resource definitions are data-only.

Definition of Done:
- Resource definitions can be consumed by Resource System task.

Expected Deliverables:
- MVP resource registry.

Risks:
- Mixing resources with derived gameplay stats would violate architecture.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Resource Set
- `docs/11 - Resource System.md` - Resource Registry
- `docs/10 - Economy Framework.md` - MVP Classification

### QA-MVP-005 - Define MVP Gameplay Stat Registry

Status: Complete
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 3

Purpose: Register modifiable gameplay stats for MVP calculation.

Scope:
- Define `manual_bugs_per_action` with base value 1.
- Define `money_per_bug_reported` with base value 1.
- Include minimum value and category metadata.
- Do not implement calculation logic in this task.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/types.ts`
- Optional modifier/stat definition module.

Dependencies:
- QA-MVP-003

Estimated Complexity: Small

Acceptance Criteria:
- Both MVP gameplay stats are registered by stable ID.
- Resources are not represented as gameplay stats.
- Base values match MVP spec.

Definition of Done:
- Modifier calculation task can consume the stat registry.

Expected Deliverables:
- MVP gameplay stat registry.

Risks:
- Current code may use names like `bugsPerClick`; map carefully to documented IDs.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Base Values, Modifier Rules
- `docs/09 - Modifier System.md` - Gameplay Stats
- `docs/11 - Resource System.md` - Resource vs Gameplay Stat

### QA-MVP-006 - Define MVP Upgrade Content

Status: Complete
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 4

Purpose: Replace current upgrade set with exact MVP one-time upgrades from the specification.

Scope:
- Define five one-time upgrades:
  - `upgrade_better_checklist`, cost 10, `manual_bugs_per_action +1`
  - `upgrade_coffee`, cost 25, `manual_bugs_per_action +1`
  - `upgrade_keyboard_shortcuts`, cost 60, `manual_bugs_per_action +2`
  - `upgrade_bug_report_template`, cost 100, `money_per_bug_reported +1`
  - `upgrade_test_case_library`, cost 250, `manual_bugs_per_action +3`
- Define effects declaratively as modifier descriptors.
- Exclude repeatable levels and scaling costs.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/types.ts`
- Optional upgrade definition module.

Dependencies:
- QA-MVP-003
- QA-MVP-005

Estimated Complexity: Medium

Acceptance Criteria:
- Upgrade IDs, costs, effects, max level, and visibility match MVP spec.
- All upgrades visible from New Game.
- All purchased upgrades count toward promotion requirement.
- Upgrade definitions do not execute gameplay logic.

Definition of Done:
- Upgrade Purchase Service can consume definitions without hardcoded per-upgrade behavior.

Expected Deliverables:
- MVP upgrade definitions.

Risks:
- Current repeatable upgrade model may need adaptation to one-time purchase state.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Upgrade Set
- `docs/12 - Upgrade System.md` - Upgrade Definitions, Purchase Rules
- `docs/09 - Modifier System.md` - Modifier Definition

### QA-MVP-007 - Define Career and Promotion Content

Status: Complete
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 5

Purpose: Declare the MVP career stages and first promotion as data.

Scope:
- Define `junior_qa` as starting career stage.
- Define `middle_qa` as target stage after confirmed promotion.
- Define `promotion_junior_to_middle`.
- Include requirements and outcome data, but do not implement evaluation/execution yet.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/types.ts`
- Optional promotion/career definition module.

Dependencies:
- QA-MVP-003
- QA-MVP-006

Estimated Complexity: Small

Acceptance Criteria:
- Promotion definition includes from/to stage IDs.
- Requirements are lifetime bugs >= 100, lifetime money >= 150, purchased upgrades >= 3.
- Reward/outcome is limited to completed promotion and current stage set to `middle_qa`.
- No Middle QA gameplay unlocks are defined.

Definition of Done:
- Requirement and Promotion services can consume this content.

Expected Deliverables:
- Career stage definitions.
- MVP promotion definition.

Risks:
- Current code may model promotion with loose `canPromote` functions; this task should move toward data.

Implementation Note:
- Added structured MVP career stage and promotion definitions. `promotion_junior_to_middle` now carries from/to stage IDs, three documented requirements, and an outcome limited to completing the promotion and setting the current stage to `middle_qa`; no Middle QA gameplay unlocks are defined. Existing promotion-stage UI lookup now reads the registered promotion definition instead of a career-stage-owned `canPromote` predicate, while full promotion runtime state/evaluation remains reserved for later backlog tasks.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Requirement
- `docs/14 - Promotion System.md` - Promotion Definitions
- `docs/04 - Career System.md` - Career Structure

### QA-MVP-008 - Define MVP Unlock and UI Surface Metadata

Status: Complete
Priority: High  
Parent Phase: Phase 2 - Core Data Contracts  
Suggested Order: 6

Purpose: Declare UI visibility and unlock rules for the MVP.

Scope:
- Define UI surface metadata for Manual Testing, Bug Reporting, Basic Resources, Basic Upgrades, Promotion Progress, and Promote Action.
- Define `unlock_promotion_junior_to_middle` controlling Promote action visibility.
- Define initial active surfaces from New Game.
- Do not implement Unlock Service logic in this task.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/types.ts`
- Optional unlock definition module.

Dependencies:
- QA-MVP-003
- QA-MVP-007

Estimated Complexity: Small

Acceptance Criteria:
- Required UI surface IDs match the MVP specification.
- Promote action is hidden by default.
- Promote action availability references the promotion requirements.
- No future system UI surfaces are exposed.

Definition of Done:
- Unlock Service and UI tasks can consume unlock/UI metadata.

Expected Deliverables:
- MVP unlock definitions.
- MVP UI surface metadata.

Risks:
- Treating unlock ID and UI surface ID as the same namespace can cause save/UI ambiguity.

Implementation Note:
- Added declarative MVP UI surface metadata for the five New Game active surfaces plus the hidden Promote action. Added `unlock_promotion_junior_to_middle` as a separate unlock definition targeting `ui_promote_action`, with availability referencing the documented `promotion_junior_to_middle` requirements; no Unlock Service runtime logic or future system surfaces were added.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Required Stable IDs, Unlock Rules
- `docs/13 - Unlock System.md` - Unlock Definition IDs vs UI Surface IDs
- `docs/07 - Technical Rules.md` - UI Visibility States

## Phase 3 - Resource System

### QA-MVP-009 - Implement Resource State Initialization

Priority: High  
Parent Phase: Phase 3 - Resource System  
Suggested Order: 1

Purpose: Initialize runtime resource balances from the resource registry for a new game.

Scope:
- Build initial resource state from registered MVP resource definitions.
- Ensure missing resource values get safe defaults on load.
- Keep resource balances separate from career, upgrades, and gameplay stats.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/save.ts`
- `src/types.ts`
- Optional resource service module.

Dependencies:
- QA-MVP-004

Estimated Complexity: Medium

Acceptance Criteria:
- New game initializes `bugs_found = 0` and `money = 0`.
- Resource state keys use stable resource IDs.
- Resource state does not include lifetime counters.

Definition of Done:
- New game resource state is registry-driven and save-ready.

Expected Deliverables:
- Resource state model.
- Resource initialization helper.

Risks:
- Current state shape uses direct fields; migration must be handled carefully later.

Related Documentation Sections:
- `docs/11 - Resource System.md` - Resource State, Resource Lifecycle
- `docs/08 - MVP Vertical Slice Specification.md` - Save Data, Resources

### QA-MVP-010 - Implement Resource Transaction Validation

Priority: High  
Parent Phase: Phase 3 - Resource System  
Suggested Order: 2

Purpose: Provide safe validation for all MVP resource mutations.

Scope:
- Validate resource existence, operation type, spendability, min/max bounds, and numeric validity.
- Return structured failure information.
- Do not wire gameplay actions yet.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional resource service module.

Dependencies:
- QA-MVP-009

Estimated Complexity: Medium

Acceptance Criteria:
- Spending non-spendable or missing resources fails safely.
- Spending below minimum fails safely.
- Adding beyond MVP max clamps or fails according to chosen documented implementation behavior.
- Invalid amounts do not mutate state.

Definition of Done:
- Validation can be reused by add, spend, and convert operations.

Expected Deliverables:
- Resource transaction validation functions.
- Structured error types.

Risks:
- Need consistent behavior for max cap. MVP documents max value; implementation should choose explicit fail or clamp and test it.

Related Documentation Sections:
- `docs/11 - Resource System.md` - Transaction Validation
- `docs/08 - MVP Vertical Slice Specification.md` - Resource Set

### QA-MVP-011 - Implement Add and Spend Resource Operations

Priority: High  
Parent Phase: Phase 3 - Resource System  
Suggested Order: 3

Purpose: Create approved operations for single-resource mutations.

Scope:
- Implement `addResource`.
- Implement `spendResource`.
- Include deterministic transaction metadata.
- Emit or return `resource.changed` event descriptors after successful mutation.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional resource service module.

Dependencies:
- QA-MVP-010

Estimated Complexity: Medium

Acceptance Criteria:
- Add increases resource balance only after validation.
- Spend decreases resource balance only after validation.
- Failed operations leave state unchanged.
- Successful operations expose transaction metadata with previous/new/delta values.

Definition of Done:
- Manual Testing and Upgrade Purchase tasks can use these operations.

Expected Deliverables:
- Add/spend resource operations.
- Focused unit tests if test framework exists or is introduced later.

Risks:
- If events are not yet implemented, operation should still return event descriptors for later bus integration.

Related Documentation Sections:
- `docs/11 - Resource System.md` - Resource Operations, Transaction Metadata
- `docs/07 - Technical Rules.md` - Resource Model

### QA-MVP-012 - Implement Atomic Convert Resource Operation

Priority: High  
Parent Phase: Phase 3 - Resource System  
Suggested Order: 4

Purpose: Support Bug Reporting as an atomic conversion from Bugs Found to Money.

Scope:
- Implement `convertResources` for consuming one resource and producing another.
- Ensure all validation passes before any state mutation.
- Return full transaction metadata and event descriptors.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional resource service module.

Dependencies:
- QA-MVP-011

Estimated Complexity: Medium

Acceptance Criteria:
- Conversion from `bugs_found` to `money` succeeds when bugs are available.
- Conversion with 0 bugs fails gracefully or returns no-op according to Bug Reporting task needs.
- Partial conversion cannot occur.
- Both resource changes are represented in deterministic metadata order.

Definition of Done:
- Bug Reporting can consume this operation directly.

Expected Deliverables:
- Atomic convert operation.

Risks:
- Rounding must be explicit when converting all currently held bugs.

Related Documentation Sections:
- `docs/11 - Resource System.md` - Convert, Atomicity
- `docs/08 - MVP Vertical Slice Specification.md` - Bug Reporting

## Phase 4 - Modifier and Derived Stat System

### QA-MVP-013 - Implement MVP Modifier Registry State

Priority: High  
Parent Phase: Phase 4 - Modifier and Derived Stat System  
Suggested Order: 1

Purpose: Store active permanent modifier instances granted by purchased upgrades.

Scope:
- Define runtime modifier instance state.
- Support permanent, enabled additive modifier instances only.
- Use deterministic instance IDs for one-time upgrade modifiers.
- Do not implement temporary, multiplicative, override, or future modifier types beyond safe unsupported handling.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- `src/gameLogic.ts`
- Optional modifier service module.

Dependencies:
- QA-MVP-005
- QA-MVP-006

Estimated Complexity: Medium

Acceptance Criteria:
- Modifier instances reference modifier definitions by stable ID.
- Permanent one-time modifier instance IDs are deterministic.
- Unknown modifier definitions fail safely in development or are ignored safely on load according to save policy.

Definition of Done:
- Purchased upgrades can activate modifiers without direct stat mutation.

Expected Deliverables:
- Modifier runtime state model.
- Modifier registration/activation helper.

Risks:
- Overbuilding full future modifier lifecycle can slow MVP; keep to MVP subset.

Related Documentation Sections:
- `docs/09 - Modifier System.md` - Modifier Instance, Identity Rules
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Modifier Rules

### QA-MVP-014 - Implement Additive Stat Calculation

Priority: High  
Parent Phase: Phase 4 - Modifier and Derived Stat System  
Suggested Order: 2

Purpose: Calculate final MVP gameplay stat values from base stats plus active modifiers.

Scope:
- Implement calculation for flat/additive MVP modifiers.
- Return derived values for `manual_bugs_per_action` and `money_per_bug_reported`.
- Keep formatting separate.
- Provide optional calculation breakdown for debugging/tests.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional modifier service module.

Dependencies:
- QA-MVP-013

Estimated Complexity: Medium

Acceptance Criteria:
- Base `manual_bugs_per_action` is 1 without upgrades.
- Base `money_per_bug_reported` is 1 without upgrades.
- Active upgrade modifiers correctly change final stat values.
- Calculation does not read UI state.

Definition of Done:
- Gameplay actions can query final stat values through one calculation path.

Expected Deliverables:
- MVP calculation service.
- Calculation breakdown data if practical.

Risks:
- Existing derived stats may include future passive production; ensure it is not included.

Related Documentation Sections:
- `docs/09 - Modifier System.md` - Calculation Service, Flat Modifier
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Base Values, Modifier Targets

## Phase 5 - Core Gameplay Actions

### QA-MVP-015 - Implement New Game State Factory

Priority: High  
Parent Phase: Phase 5 - Core Gameplay Actions  
Suggested Order: 1

Purpose: Create a clean MVP new-game state using registries and default system states.

Scope:
- Initialize meta timestamps.
- Initialize resources.
- Initialize career at `junior_qa`.
- Initialize lifetime counters to 0.
- Initialize upgrade ownership as unpurchased.
- Initialize unlock states.
- Initialize promotion state.

Files or Systems Expected to Be Modified:
- `src/gameData.ts`
- `src/gameLogic.ts`
- `src/save.ts`
- `src/types.ts`

Dependencies:
- QA-MVP-009
- QA-MVP-013
- QA-MVP-008

Estimated Complexity: Medium

Acceptance Criteria:
- New save starts as Junior QA.
- Only MVP systems are active.
- Resources are initialized correctly.
- No future state is required for gameplay to run.

Definition of Done:
- Reset/new game uses the same factory.

Expected Deliverables:
- `createNewGameState` or equivalent.

Risks:
- Existing `initialState` may need replacement or migration wrapper.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - New Game, Save Data
- `docs/07 - Technical Rules.md` - Save Data Structure Draft

### QA-MVP-016 - Implement Manual Testing Action

Priority: High  
Parent Phase: Phase 5 - Core Gameplay Actions  
Suggested Order: 2

Purpose: Implement the primary active production action.

Scope:
- Process `action_manual_test`.
- Query `manual_bugs_per_action` from calculation service.
- Add Bugs Found through Resource System.
- Increment current-run lifetime Bugs Found.
- Return/emit `manualTest.performed` and `bugs.found` event descriptors.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-011
- QA-MVP-014
- QA-MVP-015

Estimated Complexity: Small

Acceptance Criteria:
- Manual Testing immediately adds Bugs Found equal to final `manual_bugs_per_action`.
- Lifetime Bugs Found increases by the same amount.
- Action is repeatable.
- Action does not produce money or future resources.

Definition of Done:
- UI can trigger Manual Testing through gameplay action handler.

Expected Deliverables:
- Manual Testing action handler.

Risks:
- Current click handler may mutate state directly; refactor with care.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Manual Testing, MVP Action Rules
- `docs/02 - Core Gameplay Loop.md` - Manual Testing

### QA-MVP-017 - Implement Bug Reporting Action

Priority: High  
Parent Phase: Phase 5 - Core Gameplay Actions  
Suggested Order: 3

Purpose: Implement MVP resource conversion from Bugs Found to Money.

Scope:
- Process `action_report_bugs`.
- Report all currently held Bugs Found.
- Use final `money_per_bug_reported`.
- Convert Bugs Found to Money through atomic Resource System operation.
- Increment current-run lifetime Money Earned.
- Return/emit `bugReport.submitted` and `money.earned` event descriptors.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-012
- QA-MVP-014
- QA-MVP-016

Estimated Complexity: Small

Acceptance Criteria:
- Reporting consumes all current Bugs Found.
- Reporting produces Money equal to reported bugs multiplied by final `money_per_bug_reported`.
- Reporting with 0 Bugs Found fails gracefully and leaves state unchanged.
- No Reputation is produced.

Definition of Done:
- UI can trigger Bug Reporting through gameplay action handler.

Expected Deliverables:
- Bug Reporting action handler.

Risks:
- Fractional bug balances should not occur in MVP; if present from legacy saves, handle safely.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Bug Reporting, MVP Action Rules
- `docs/02 - Core Gameplay Loop.md` - Reporting Bugs

## Phase 6 - Upgrade System

### QA-MVP-018 - Implement Upgrade Ownership State

Priority: High  
Parent Phase: Phase 6 - Upgrade System  
Suggested Order: 1

Purpose: Store one-time MVP upgrade purchase state in save-compatible form.

Scope:
- Represent each MVP upgrade as unpurchased/purchased or level 0/1.
- Initialize ownership from upgrade definitions.
- Handle missing or unknown saved upgrades safely.
- Do not support repeatable levels beyond max level 1.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- `src/gameLogic.ts`
- `src/save.ts`

Dependencies:
- QA-MVP-006
- QA-MVP-015

Estimated Complexity: Small

Acceptance Criteria:
- New game has all MVP upgrades unpurchased.
- Purchased upgrades persist as stable IDs.
- Unknown saved upgrade IDs do not crash load.

Definition of Done:
- Purchase validation can read ownership state.

Expected Deliverables:
- Upgrade ownership state model.

Risks:
- Current upgrade state uses non-MVP IDs and numeric levels.

Related Documentation Sections:
- `docs/12 - Upgrade System.md` - Upgrade Instance, Ownership
- `docs/08 - MVP Vertical Slice Specification.md` - Upgrade Set

### QA-MVP-019 - Implement Upgrade Purchase Validation

Priority: High  
Parent Phase: Phase 6 - Upgrade System  
Suggested Order: 2

Purpose: Validate MVP upgrade purchases before mutation.

Scope:
- Check definition exists.
- Check upgrade visible/unlocked for MVP.
- Check one-time ownership.
- Resolve cost.
- Check Money affordability through Resource System.
- Return structured purchase errors.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional upgrade service module.

Dependencies:
- QA-MVP-018
- QA-MVP-011

Estimated Complexity: Medium

Acceptance Criteria:
- Unknown upgrade returns `definition_not_found`.
- Already purchased one-time upgrade returns `already_owned`.
- Insufficient Money returns `not_affordable`.
- Valid purchase returns resolved cost and effects.

Definition of Done:
- Purchase execution task can call validation as a first step.

Expected Deliverables:
- Upgrade purchase validation function.
- Structured purchase error type.

Risks:
- Do not let UI determine affordability authoritatively.

Related Documentation Sections:
- `docs/12 - Upgrade System.md` - Purchase Validation Order, Purchase Error Categories
- `docs/07 - Technical Rules.md` - UI Must Not Own Game Logic

### QA-MVP-020 - Implement Atomic Upgrade Purchase Execution

Priority: High  
Parent Phase: Phase 6 - Upgrade System  
Suggested Order: 3

Purpose: Execute one-time MVP upgrade purchases safely.

Scope:
- Spend Money through Resource System.
- Mark upgrade purchased.
- Activate upgrade modifiers through Modifier System.
- Return/emit `upgrade.purchased` event descriptor.
- Ensure failed purchases leave state unchanged.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-013
- QA-MVP-019

Estimated Complexity: Medium

Acceptance Criteria:
- Successful purchase decreases Money by exact cost.
- Upgrade ownership changes to purchased.
- Related modifier becomes active.
- Re-purchase is impossible.
- Failed purchase rolls back all state.

Definition of Done:
- All five MVP upgrades can be purchased and affect gameplay through modifiers.

Expected Deliverables:
- Upgrade purchase action handler.

Risks:
- True rollback may require pure-state transformation pattern; avoid partial UI state mutation.

Related Documentation Sections:
- `docs/12 - Upgrade System.md` - Purchase Flow, Atomicity and Rollback
- `docs/08 - MVP Vertical Slice Specification.md` - Upgrades

### QA-MVP-021 - Implement Purchased Upgrade Count Selector

Priority: High  
Parent Phase: Phase 6 - Upgrade System  
Suggested Order: 4

Purpose: Provide promotion requirements with a reliable count of purchased MVP upgrades.

Scope:
- Count purchased MVP upgrades from ownership state.
- Exclude unknown, disabled, or future upgrades.
- Provide selector for requirement engine and UI progress.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`

Dependencies:
- QA-MVP-020

Estimated Complexity: Small

Acceptance Criteria:
- Count is 0 on new game.
- Count increases by 1 per purchased MVP upgrade.
- Count maxes at 5 for MVP.

Definition of Done:
- Promotion requirement can consume purchased-upgrade count without inspecting UI.

Expected Deliverables:
- Purchased upgrade count selector.

Risks:
- Future inactive upgrades must not accidentally count.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Requirement
- `docs/12 - Upgrade System.md` - Upgrade Ownership

## Phase 7 - Requirement and Promotion Systems

### QA-MVP-022 - Implement Shared Requirement Evaluation

Priority: High  
Parent Phase: Phase 7 - Requirement and Promotion Systems  
Suggested Order: 1

Purpose: Evaluate structured requirements for promotion and unlock availability.

Scope:
- Support MVP requirement types:
  - current-run lifetime resource total
  - purchased upgrade count
- Return per-requirement status for UI progress.
- Avoid custom hardcoded promotion checks.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional requirement service module.

Dependencies:
- QA-MVP-016
- QA-MVP-017
- QA-MVP-021

Estimated Complexity: Medium

Acceptance Criteria:
- Lifetime Bugs Found >= 100 evaluates correctly.
- Lifetime Money Earned >= 150 evaluates correctly.
- Purchased Upgrades >= 3 evaluates correctly.
- All requirements result can be consumed by Promotion and Unlock systems.

Definition of Done:
- Requirement engine handles the MVP promotion without promotion-specific code.

Expected Deliverables:
- Requirement evaluation service.

Risks:
- Do not treat current Money balance as lifetime Money Earned.

Related Documentation Sections:
- `docs/14 - Promotion System.md` - Promotion Requirement
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Requirement
- `docs/07 - Technical Rules.md` - Promotion Requirement Format

### QA-MVP-023 - Implement Promotion Runtime State

Priority: High  
Parent Phase: Phase 7 - Requirement and Promotion Systems  
Suggested Order: 2

Purpose: Represent promotion availability, confirmation, completion, and persistence state.

Scope:
- Add runtime state for `promotion_junior_to_middle`.
- Track available/completed state.
- Track completion timestamp if consistent with state model.
- Do not execute promotion in this task.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- `src/gameLogic.ts`
- `src/save.ts`

Dependencies:
- QA-MVP-007
- QA-MVP-022

Estimated Complexity: Small

Acceptance Criteria:
- New game promotion state is unavailable and incomplete.
- Promotion can become available without becoming completed.
- Completed state is representable separately from available state.

Definition of Done:
- Promotion availability and execution tasks can use runtime state.

Expected Deliverables:
- Promotion runtime state model.

Risks:
- Existing code promotes directly based on `canPromote`; avoid collapsing states.

Related Documentation Sections:
- `docs/14 - Promotion System.md` - Promotion Instance, Lifecycle
- `docs/08 - MVP Vertical Slice Specification.md` - DN-01, Promotion

### QA-MVP-024 - Implement Promotion Availability Evaluation

Priority: High  
Parent Phase: Phase 7 - Requirement and Promotion Systems  
Suggested Order: 3

Purpose: Make `promotion_junior_to_middle` available when all requirements are satisfied.

Scope:
- Evaluate promotion requirements through shared requirement engine.
- Update promotion availability state through a controlled state transition.
- Return/emit `promotion.available` event descriptor once when availability first becomes true.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-022
- QA-MVP-023

Estimated Complexity: Medium

Acceptance Criteria:
- Promotion becomes available only after all three MVP requirements pass.
- Availability does not automatically change career stage.
- Availability persists through Save/Load after the save task is complete.
- Event descriptor is not emitted repeatedly every render.

Definition of Done:
- Promote action visibility can be driven by promotion availability.

Expected Deliverables:
- Promotion availability evaluator.

Risks:
- Repeated event emission can occur if availability is recomputed without state transition tracking.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion, MVP Event Contracts
- `docs/14 - Promotion System.md` - Available, Pending Confirmation

### QA-MVP-025 - Implement Confirmed Promotion Execution

Priority: High  
Parent Phase: Phase 7 - Requirement and Promotion Systems  
Suggested Order: 4

Purpose: Execute promotion only after explicit player confirmation.

Scope:
- Process `action_accept_promotion`.
- Validate promotion is available and incomplete.
- Mark `promotion_junior_to_middle` completed.
- Set `career.currentStageId` to `middle_qa`.
- Return/emit `promotion.completed` and `career.stageChanged` event descriptors.
- Do not unlock Middle QA gameplay.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-024

Estimated Complexity: Medium

Acceptance Criteria:
- Promotion cannot be accepted before availability.
- Promotion requires explicit action.
- Confirming promotion sets current career stage to `middle_qa`.
- Confirming promotion does not reveal Team, Automation, Reputation, or other future systems.
- Completion state is saved after Save/Load task.

Definition of Done:
- MVP endpoint supports both Promotion Available and Promotion Completed states.

Expected Deliverables:
- Promotion confirmation action handler.

Risks:
- UI may try to navigate to future tabs after promotion; prevent that.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - DN-03, Promotion Acceptance Criteria
- `docs/14 - Promotion System.md` - Promotion Executes Through a Pipeline

## Phase 8 - Unlock and Visibility System

### QA-MVP-026 - Implement MVP Unlock State Initialization

Priority: High  
Parent Phase: Phase 8 - Unlock and Visibility System  
Suggested Order: 1

Purpose: Initialize unlock state for MVP UI surfaces and promotion action.

Scope:
- Active from New Game: Manual Testing UI, Bug Reporting UI, Basic Resources, Basic Upgrades, Promotion Progress.
- Hidden from New Game: Promote action.
- Future systems absent or hidden/inert.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- `src/save.ts`

Dependencies:
- QA-MVP-008
- QA-MVP-015

Estimated Complexity: Small

Acceptance Criteria:
- New game unlock state matches MVP Unlock States table.
- Unlock states use unlock definition IDs.
- UI surface state can be queried separately from unlock definition state.

Definition of Done:
- UI can render MVP surfaces by querying unlock/visibility state.

Expected Deliverables:
- Unlock runtime state initialization.

Risks:
- Confusing active UI surfaces with completed unlocks.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Unlock States
- `docs/13 - Unlock System.md` - Unlock State, UI Surface IDs

### QA-MVP-027 - Implement Promote Action Unlock Transition

Priority: High  
Parent Phase: Phase 8 - Unlock and Visibility System  
Suggested Order: 2

Purpose: Reveal Promote action when promotion requirements become satisfied.

Scope:
- Listen to or evaluate promotion availability.
- Transition `unlock_promotion_junior_to_middle` from hidden to available/unlocked according to MVP state mapping.
- Return/emit `unlock.revealed` event descriptor once.
- Do not reveal future systems.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-024
- QA-MVP-026

Estimated Complexity: Medium

Acceptance Criteria:
- Promote action is hidden before all requirements pass.
- Promote action appears when promotion is available.
- Unlock state persists through Save/Load after save task is complete.
- No other UI surfaces appear because of this unlock.

Definition of Done:
- Promote button visibility is controlled by Unlock System state, not direct UI condition only.

Expected Deliverables:
- Promote action unlock transition.

Risks:
- Duplicating promotion checks in UI could drift from requirement engine.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Visibility
- `docs/13 - Unlock System.md` - Unlock Service, Unlock Events

### QA-MVP-028 - Implement UI Visibility Selectors

Priority: Medium  
Parent Phase: Phase 8 - Unlock and Visibility System  
Suggested Order: 3

Purpose: Provide UI-safe selectors for deciding which MVP surfaces render.

Scope:
- Add selectors for resource counters, action buttons, upgrade panel, promotion progress, and promote action.
- Selectors consume unlock state and game state.
- UI should not independently evaluate unlock eligibility.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`
- `src/types.ts`

Dependencies:
- QA-MVP-027

Estimated Complexity: Small

Acceptance Criteria:
- MVP surfaces render when active.
- Promote action renders only when unlock state allows.
- Future surfaces are never returned by visibility selectors.

Definition of Done:
- UI rendering can be simplified around derived visibility selectors.

Expected Deliverables:
- UI visibility selector functions.

Risks:
- If selectors are too UI-specific, they may become presentation logic; keep them state-focused.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - UI Visibility States, UI Must Not Own Game Logic
- `docs/13 - Unlock System.md` - UI as Gameplay

## Phase 9 - Save and Load

### QA-MVP-029 - Define MVP Save Data Schema

Priority: High  
Parent Phase: Phase 9 - Save and Load  
Suggested Order: 1

Purpose: Establish the persisted MVP save structure and schema version.

Scope:
- Define save meta: schema version, created timestamp, last saved timestamp, last active timestamp.
- Persist resources, career, promotion state, lifetime counters, upgrades, unlocks, and supported settings if any.
- Do not persist future systems unless required as inert compatibility defaults.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- `src/save.ts`

Dependencies:
- QA-MVP-015
- QA-MVP-018
- QA-MVP-023
- QA-MVP-026

Estimated Complexity: Medium

Acceptance Criteria:
- Save data has explicit schema version.
- All MVP persistent fields are included.
- Future systems are absent or safely defaulted.
- Save shape uses stable IDs.

Definition of Done:
- Save and Load implementation tasks have a clear target schema.

Expected Deliverables:
- MVP save data types/schema.

Risks:
- Existing localStorage data may not match new schema.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - Save Data Schema and Versioning
- `docs/08 - MVP Vertical Slice Specification.md` - Save Data

### QA-MVP-030 - Implement Save Serialization

Priority: High  
Parent Phase: Phase 9 - Save and Load  
Suggested Order: 2

Purpose: Persist MVP gameplay state safely.

Scope:
- Serialize current MVP state to localStorage or existing save target.
- Update timestamps.
- Persist only authoritative gameplay state, not presentation-only UI state unless documented.
- Return/emit `game.saved` event descriptor if event bus exists.

Files or Systems Expected to Be Modified:
- `src/save.ts`
- `src/gameLogic.ts`
- `src/types.ts`

Dependencies:
- QA-MVP-029

Estimated Complexity: Small

Acceptance Criteria:
- Resources persist.
- Purchased upgrades persist.
- Modifier activation can be restored from purchased upgrade state.
- Career and promotion state persist.
- Unlock state persists.
- Lifetime counters persist.

Definition of Done:
- Reloading the browser can restore saved MVP progress after load task.

Expected Deliverables:
- Save serialization function.

Risks:
- Duplicating derived values in save can create stale state.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Save / Load Acceptance Criteria
- `docs/07 - Technical Rules.md` - Save Data Goals

### QA-MVP-031 - Implement Load, Defaults, and Legacy Handling

Priority: High  
Parent Phase: Phase 9 - Save and Load  
Suggested Order: 3

Purpose: Restore MVP gameplay state from persisted data without crashes.

Scope:
- Parse raw save.
- Validate basic structure and schema version.
- Fill missing defaults.
- Ignore or quarantine invalid/unknown fields.
- Restore MVP state.
- Do not calculate offline progress in MVP.
- Return/emit `game.loaded` event descriptor if event bus exists.

Files or Systems Expected to Be Modified:
- `src/save.ts`
- `src/gameLogic.ts`
- `src/types.ts`

Dependencies:
- QA-MVP-030

Estimated Complexity: Medium

Acceptance Criteria:
- No save starts a new MVP game.
- Valid MVP save restores exactly.
- Missing optional fields default safely.
- Legacy/current pre-MVP saves do not crash.
- Offline progress is not awarded.

Definition of Done:
- Save/load acceptance criteria can be tested end to end.

Expected Deliverables:
- Load and normalization implementation.
- Basic migration/default behavior for existing saves.

Risks:
- Legacy saves containing future systems may imply non-MVP career stages; normalize carefully to MVP-safe state.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - Save Loading Rules
- `docs/08 - MVP Vertical Slice Specification.md` - Save / Load

### QA-MVP-032 - Implement Save Reset / New Game Flow

Priority: Medium  
Parent Phase: Phase 9 - Save and Load  
Suggested Order: 4

Purpose: Provide a reliable way to start a fresh MVP save.

Scope:
- Clear persisted save.
- Recreate game state using new game state factory.
- Reset transient UI notifications if present.
- Avoid carrying future system data forward.

Files or Systems Expected to Be Modified:
- `src/save.ts`
- `src/main.tsx`
- `src/gameLogic.ts`

Dependencies:
- QA-MVP-031

Estimated Complexity: Small

Acceptance Criteria:
- Reset returns to Junior QA.
- Resources are 0.
- Upgrades unpurchased.
- Promotion unavailable/incomplete.
- Unlocks return to MVP initial state.

Definition of Done:
- Manual QA can repeat MVP golden path from a clean state.

Expected Deliverables:
- Reset/new game flow.

Risks:
- UI transient state may show stale promotion or purchase feedback after reset.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - New Game
- `docs/07 - Technical Rules.md` - Save Loading Rules

## Phase 10 - MVP UI Integration

### QA-MVP-033 - Build Junior QA MVP Layout

Priority: Medium  
Parent Phase: Phase 10 - MVP UI Integration  
Suggested Order: 1

Purpose: Present a focused Junior QA workspace matching the MVP scope.

Scope:
- Display current role.
- Display Bugs Found and Money.
- Display Manual Testing action.
- Display Bug Reporting action.
- Display basic upgrade panel.
- Display promotion progress.
- Do not display future tabs/panels.

Files or Systems Expected to Be Modified:
- `src/main.tsx`
- `src/styles.css`

Dependencies:
- QA-MVP-028
- QA-MVP-016
- QA-MVP-017
- QA-MVP-020

Estimated Complexity: Medium

Acceptance Criteria:
- First screen is the playable MVP, not a landing page.
- Player can perform the complete loop from UI.
- UI does not reveal excluded systems.
- Buttons reflect disabled states for invalid actions.

Definition of Done:
- MVP is playable through UI through promotion availability.

Expected Deliverables:
- MVP UI integration.

Risks:
- Current UI has future-stage layout; remove or hide without redesigning beyond MVP.

Related Documentation Sections:
- `docs/03 - Player Journey.md` - Stage 1 Junior QA
- `docs/08 - MVP Vertical Slice Specification.md` - Visible at New Game
- `docs/07 - Technical Rules.md` - UI Must Not Own Game Logic

### QA-MVP-034 - Build Promotion Progress UI

Priority: Medium  
Parent Phase: Phase 10 - MVP UI Integration  
Suggested Order: 2

Purpose: Show the player's next goal and progress toward Middle QA promotion.

Scope:
- Display current rank and next rank.
- Display the three MVP requirements and current progress.
- Indicate Promotion Available when all requirements pass.
- Keep future reward details hidden or minimal.

Files or Systems Expected to Be Modified:
- `src/main.tsx`
- `src/styles.css`
- `src/gameLogic.ts`

Dependencies:
- QA-MVP-022
- QA-MVP-024
- QA-MVP-028

Estimated Complexity: Medium

Acceptance Criteria:
- Requirements show lifetime bugs, lifetime money, purchased upgrades.
- Progress uses requirement engine output.
- Promote action is not visible until unlock state permits.
- UI does not tease Team/Automation as MVP reward.

Definition of Done:
- Player understands promotion goal without seeing future systems.

Expected Deliverables:
- Promotion progress UI.

Risks:
- Documentation allows limited anticipation, but MVP explicitly excludes future gameplay reveals; keep copy conservative.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Progress, Promotion Visibility
- `docs/03 - Player Journey.md` - Curiosity hook

### QA-MVP-035 - Build Promote Completion State UI

Priority: Medium  
Parent Phase: Phase 10 - MVP UI Integration  
Suggested Order: 3

Purpose: Represent the completed vertical slice after confirmed promotion.

Scope:
- Show current stage as Middle QA after promotion.
- Show a simple MVP completion state.
- Do not reveal or activate Middle QA gameplay.
- Keep existing MVP state visible or locked according to simplest documented behavior.

Files or Systems Expected to Be Modified:
- `src/main.tsx`
- `src/styles.css`

Dependencies:
- QA-MVP-025
- QA-MVP-033
- QA-MVP-034

Estimated Complexity: Small

Acceptance Criteria:
- After confirming promotion, UI indicates Middle QA reached.
- No Team, Automation, Reputation, Contracts, or future systems appear.
- Save/Load restores completion state.

Definition of Done:
- MVP endpoint is clear and testable.

Expected Deliverables:
- Promotion completion UI state.

Risks:
- Existing code may automatically switch tabs after promotion; remove that behavior for MVP.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - DN-01, Promotion Acceptance Criteria
- `docs/14 - Promotion System.md` - Completed

### QA-MVP-036 - Implement MVP Number Formatting Helpers

Priority: Low  
Parent Phase: Phase 10 - MVP UI Integration  
Suggested Order: 4

Purpose: Keep numeric display separate from gameplay calculations.

Scope:
- Format bounded MVP numbers consistently.
- Do not mutate stored values during formatting.
- Support values up to MVP max 1,000,000.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/main.tsx`

Dependencies:
- QA-MVP-033

Estimated Complexity: Small

Acceptance Criteria:
- Bugs and Money display consistently.
- Costs and requirements use the same formatting helper.
- Formatting is not used for calculations.

Definition of Done:
- UI number display is consistent and isolated.

Expected Deliverables:
- Number formatting helper usage cleanup.

Risks:
- Existing formatter may be acceptable; avoid unnecessary redesign.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - Display Formatting
- `docs/08 - MVP Vertical Slice Specification.md` - Bounded Native Numbers

## Phase 11 - Events and Observability

### QA-MVP-037 - Define MVP Event Types

Priority: Medium  
Parent Phase: Phase 11 - Events and Observability  
Suggested Order: 1

Purpose: Establish typed event descriptors required by the MVP architecture.

Scope:
- Define MVP event IDs:
  - `manualTest.performed`
  - `bugs.found`
  - `bugReport.submitted`
  - `money.earned`
  - `resource.changed`
  - `upgrade.purchased`
  - `promotion.available`
  - `promotion.completed`
  - `career.stageChanged`
  - `unlock.revealed`
  - `game.saved`
  - `game.loaded`
- Define payload shape enough for tests/debugging.
- Do not build a future gameplay Events system.

Files or Systems Expected to Be Modified:
- `src/types.ts`
- Optional event module.

Dependencies:
- QA-MVP-003

Estimated Complexity: Small

Acceptance Criteria:
- Event IDs exactly match MVP spec.
- Event descriptors are serializable.
- Event definitions do not trigger future systems.

Definition of Done:
- Action handlers can return/emit typed MVP events.

Expected Deliverables:
- MVP event type definitions.

Risks:
- Confusing technical events with excluded gameplay Events system.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Event Contracts
- `docs/07 - Technical Rules.md` - Event Bus / Event Contracts

### QA-MVP-038 - Implement Minimal Runtime Event Dispatch

Priority: Medium  
Parent Phase: Phase 11 - Events and Observability  
Suggested Order: 2

Purpose: Provide deterministic event observation for MVP tests and future expansion without coupling systems.

Scope:
- Implement minimal transient event dispatch or event collection per action.
- Ensure events are emitted only after state changes commit.
- Keep listeners minimal; do not add future gameplay reactions.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/types.ts`
- Optional event module.

Dependencies:
- QA-MVP-037
- QA-MVP-016
- QA-MVP-017
- QA-MVP-020
- QA-MVP-024
- QA-MVP-025
- QA-MVP-027

Estimated Complexity: Medium

Acceptance Criteria:
- Successful actions expose expected event descriptors.
- Failed transactions do not emit success events.
- Event ordering is deterministic.
- No excluded system reacts to events.

Definition of Done:
- Tests can assert key events without reading UI.

Expected Deliverables:
- Minimal MVP event dispatcher or action event result pattern.

Risks:
- Full event bus may be overkill; keep MVP implementation lean.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - MVP Runtime Event Guarantees
- `docs/08 - MVP Vertical Slice Specification.md` - MVP Event Contracts

## Phase 12 - Validation and Tests

### QA-MVP-039 - Add Content Registry Validation

Priority: Medium  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 1

Purpose: Catch duplicate IDs and invalid content references before gameplay starts.

Scope:
- Validate resource, stat, upgrade, unlock, promotion, and UI surface definitions.
- Check duplicate IDs.
- Check upgrade effects reference known stat IDs.
- Check costs reference known resource IDs.
- Check promotion requirements reference known counters/selectors.
- Check unlock targets exist.

Files or Systems Expected to Be Modified:
- `src/gameLogic.ts`
- `src/gameData.ts`
- Optional validation module.

Dependencies:
- QA-MVP-004
- QA-MVP-005
- QA-MVP-006
- QA-MVP-007
- QA-MVP-008

Estimated Complexity: Medium

Acceptance Criteria:
- Duplicate IDs are detected in development/test.
- Missing references are detected.
- Future inactive content does not need validation unless registered.
- Validation has clear diagnostic output.

Definition of Done:
- Content mistakes fail early during development/test.

Expected Deliverables:
- MVP content validation helper.

Risks:
- Production behavior for validation failures must fail safely and not show broken UI.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - Content Validation
- `docs/13 - Unlock System.md` - Registry Validation
- `docs/12 - Upgrade System.md` - Registry Rules

### QA-MVP-040 - Add Resource System Tests

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 2

Purpose: Verify resource operations are safe and deterministic.

Scope:
- Test initialization.
- Test add.
- Test spend.
- Test failed spend.
- Test convert.
- Test failed convert.
- Test min/max handling.

Files or Systems Expected to Be Modified:
- Test files under the repository's chosen test structure.
- Package/test config if no test runner exists, with separate approval if dependency installation is needed.

Dependencies:
- QA-MVP-012

Estimated Complexity: Medium

Acceptance Criteria:
- All Resource System operations are covered by focused tests.
- Failed operations leave state unchanged.
- Convert is atomic.

Definition of Done:
- Tests run locally through documented command.

Expected Deliverables:
- Resource System test suite.

Risks:
- Repository currently may not include a test runner; adding one may require dependency decision.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - Required Test Categories
- `docs/11 - Resource System.md` - Resource Transactions

### QA-MVP-041 - Add Modifier and Upgrade Tests

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 3

Purpose: Verify upgrades affect gameplay only through modifiers.

Scope:
- Test base stat values.
- Test each MVP upgrade effect.
- Test one-time purchase rules.
- Test insufficient Money purchase failure.
- Test already-owned purchase failure.
- Test purchased upgrade count.

Files or Systems Expected to Be Modified:
- Test files under chosen test structure.

Dependencies:
- QA-MVP-020
- QA-MVP-021

Estimated Complexity: Medium

Acceptance Criteria:
- All five MVP upgrades have tests.
- Final stat values match expected additive results.
- Failed purchase does not spend Money or activate modifiers.

Definition of Done:
- Upgrade and Modifier behavior is covered by tests.

Expected Deliverables:
- Modifier/Upgrade test suite.

Risks:
- Tests must avoid asserting UI implementation details.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Upgrades, Modifier Rules
- `docs/09 - Modifier System.md` - Gameplay Rule

### QA-MVP-042 - Add Gameplay Loop Tests

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 4

Purpose: Verify the core manual QA loop end to end at gameplay-logic level.

Scope:
- New game starts correctly.
- Manual Testing adds bugs.
- Bug Reporting converts bugs to money.
- Upgrade improves Manual Testing.
- Bug Report Template improves reporting value.
- Invalid report with 0 bugs is safe.

Files or Systems Expected to Be Modified:
- Test files under chosen test structure.

Dependencies:
- QA-MVP-016
- QA-MVP-017
- QA-MVP-020

Estimated Complexity: Medium

Acceptance Criteria:
- Core loop can be completed without UI.
- Lifetime counters update correctly.
- No future resources are produced.

Definition of Done:
- MVP loop is covered by integration-style tests.

Expected Deliverables:
- Core gameplay loop test suite.

Risks:
- Avoid relying on timers or frame behavior; MVP has no passive production.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Gameplay Flow, Acceptance Criteria
- `docs/02 - Core Gameplay Loop.md` - Stage 1 Junior QA Loop

### QA-MVP-043 - Add Promotion and Unlock Tests

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 5

Purpose: Verify promotion availability, confirmation, and visibility rules.

Scope:
- Test promotion unavailable on new game.
- Test individual unmet requirements.
- Test promotion availability after all requirements pass.
- Test Promote action unlock reveal.
- Test confirmed promotion changes career stage.
- Test no future systems unlock after promotion.

Files or Systems Expected to Be Modified:
- Test files under chosen test structure.

Dependencies:
- QA-MVP-025
- QA-MVP-027

Estimated Complexity: Medium

Acceptance Criteria:
- Promotion requires all three requirements.
- Promotion available and completed are distinct states.
- Confirmed promotion sets `middle_qa`.
- Team/Automation/Reputation remain hidden/inert.

Definition of Done:
- Promotion endpoint is protected by tests.

Expected Deliverables:
- Promotion/Unlock test suite.

Risks:
- Existing code may have OR-based promotion conditions; tests should catch that regression.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Promotion Acceptance Criteria
- `docs/14 - Promotion System.md` - Promotion Lifecycle
- `docs/13 - Unlock System.md` - Unlock Lifecycle

### QA-MVP-044 - Add Save/Load Tests

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 6

Purpose: Verify MVP progress survives persistence.

Scope:
- Save/load resources.
- Save/load purchased upgrades.
- Save/load active modifier restoration from purchases.
- Save/load lifetime counters.
- Save/load promotion availability and completion.
- Save/load unlock state.
- Load missing/invalid fields safely.

Files or Systems Expected to Be Modified:
- Test files under chosen test structure.
- Possible test helper for localStorage.

Dependencies:
- QA-MVP-031
- QA-MVP-032

Estimated Complexity: Medium

Acceptance Criteria:
- Reload restores MVP state correctly.
- Promotion Available survives reload.
- Promotion Completed survives reload.
- Offline progress is not granted.
- Invalid save does not crash.

Definition of Done:
- Save/Load acceptance criteria are covered.

Expected Deliverables:
- Save/Load test suite.

Risks:
- Browser/localStorage testing may require test environment setup.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Save / Load Acceptance Criteria
- `docs/07 - Technical Rules.md` - Save Loading Rules

### QA-MVP-045 - Add MVP UI Smoke Tests

Priority: Medium  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 7

Purpose: Verify visible UI matches MVP unlock and scope rules.

Scope:
- New game displays MVP surfaces.
- New game does not display future systems.
- Promote action hidden before availability.
- Promote action visible after requirements.
- Completion state shows Middle QA without future panels.

Files or Systems Expected to Be Modified:
- UI smoke test files if UI test tooling exists.
- Package/test config only if approved.

Dependencies:
- QA-MVP-033
- QA-MVP-034
- QA-MVP-035

Estimated Complexity: Medium

Acceptance Criteria:
- UI smoke tests assert presence of MVP actions/resources.
- UI smoke tests assert absence of excluded systems.
- Tests do not rely on fragile styling details.

Definition of Done:
- MVP UI visibility can be regression-tested.

Expected Deliverables:
- UI smoke tests.

Risks:
- If no browser/UI test runner exists, this may need tooling discussion before implementation.

Related Documentation Sections:
- `docs/07 - Technical Rules.md` - UI Smoke Tests
- `docs/08 - MVP Vertical Slice Specification.md` - Scope Validation

### QA-MVP-046 - Run Final MVP Acceptance Checklist

Priority: High  
Parent Phase: Phase 12 - Validation and Tests  
Suggested Order: 8

Purpose: Confirm the implemented MVP matches every acceptance criterion in the Vertical Slice specification.

Scope:
- Review New Game criteria.
- Review Manual Testing criteria.
- Review Bug Reporting criteria.
- Review Resources criteria.
- Review Upgrades criteria.
- Review Promotion criteria.
- Review Unlock System criteria.
- Review Save/Load criteria.
- Review Scope Validation criteria.

Files or Systems Expected to Be Modified:
- None unless issues are found.
- Optional acceptance checklist document.

Dependencies:
- QA-MVP-040
- QA-MVP-041
- QA-MVP-042
- QA-MVP-043
- QA-MVP-044
- QA-MVP-045

Estimated Complexity: Small

Acceptance Criteria:
- Every MVP acceptance criterion is marked pass/fail with evidence.
- Any failures are converted into follow-up tasks.
- No undocumented gameplay feature is present.

Definition of Done:
- MVP is ready for internal playtesting.

Expected Deliverables:
- Final MVP acceptance checklist.

Risks:
- Late discovery of scope leaks from current code.

Related Documentation Sections:
- `docs/08 - MVP Vertical Slice Specification.md` - Acceptance Criteria
- `docs/00 - Master Project Roadmap.md` - Current Milestone Definition of Done

## Final Backlog Review

### Missing Work Review

The backlog includes all major implementation work required by the approved roadmap:

- Scope enforcement for excluded systems.
- Stable ID and content definitions.
- Resource System foundation.
- Modifier System MVP subset.
- Manual Testing and Bug Reporting actions.
- One-time Upgrade System.
- Requirement engine.
- Promotion workflow with explicit confirmation.
- Unlock/visibility handling.
- Versioned Save/Load.
- MVP UI integration.
- Technical event descriptors.
- Content validation and tests.
- Final acceptance checklist.

No gameplay systems outside the MVP were added.

### Duplicated Task Review

Merged duplicates:

- Resource initialization and new-game setup are split because resource initialization is a reusable system concern, while new-game factory composes all systems.
- Promotion availability and unlock reveal remain separate because Promotion owns progression state and Unlock owns UI access.
- Upgrade definition, ownership, validation, and execution remain separate because they can be implemented independently and tested separately.

### Large Task Split Review

Large areas were split into single-session tasks:

- Save/Load split into schema, save, load/defaults, and reset.
- Promotion split into runtime state, availability, and confirmed execution.
- UI split into Junior layout, promotion progress, completion state, and formatting.
- Tests split by system area.

### Dependency Order Verification

Implementation should proceed in this order:

1. QA-MVP-001 to QA-MVP-002
2. QA-MVP-003 to QA-MVP-008
3. QA-MVP-009 to QA-MVP-012
4. QA-MVP-013 to QA-MVP-014
5. QA-MVP-015 to QA-MVP-017
6. QA-MVP-018 to QA-MVP-021
7. QA-MVP-022 to QA-MVP-025
8. QA-MVP-026 to QA-MVP-028
9. QA-MVP-029 to QA-MVP-032
10. QA-MVP-033 to QA-MVP-036
11. QA-MVP-037 to QA-MVP-038
12. QA-MVP-039 to QA-MVP-046

Tasks are independent where practical, but architectural layers intentionally precede gameplay and UI work.

## Engineering Notes for Future Codex Sessions

- Before implementing any task, read the task's related documentation sections.
- If documentation and current code conflict, documentation wins.
- If a required rule is missing from documentation, stop and document/ask before implementing.
- Do not combine unrelated backlog tasks in one implementation session unless explicitly approved.
- Prefer pure gameplay functions that are easy to test.
- UI should send player intents and render derived state only.
- Future systems may remain as inert code stubs only if they do not affect state, UI, saves, events, or progression.
