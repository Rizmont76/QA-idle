# 08 - MVP Vertical Slice Specifica

## Document Status

**Project:** QA Idle

**Document Type:** MVP Vertical Slice Specification

**Owner Role:** Senior Game Designer / Lead Systems Designer / Technical Game Designer

**Status:** Frozen v1.0

**Depends On:**

- README.md
- 01 - Vision.md
- 02 - Core Gameplay Loop.md
- 03 - Player Journey.md
- 04 - Career System.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md

This document defines the first fully playable implementation of QA Idle.

It serves as the implementation contract between Game Design and development.

Unlike the previous documents, which define the long-term architecture of the project, this document intentionally limits itself to the smallest complete version of the game that still demonstrates the project's core identity.

This document does **not** redefine gameplay systems.

It selects a subset of already approved systems and specifies exactly what must exist for the first production-ready implementation.

---

# Designer Notes

The following proposals are **approved design decisions** that should be considered during implementation.

---

# DN-01 — Define Promotion as the End of the Vertical Slice

## Decision

The first Promotion marks the completion of the Vertical Slice.

Promotion becomes **available**, but the gameplay of the next career stage is intentionally outside the scope of this document.

The next Vertical Slice begins after this milestone.

For implementation acceptance, the slice must support both states:

- **Promotion Available**: the gameplay endpoint of the MVP loop.
- **Promotion Completed**: a confirmed state used to validate explicit player confirmation, events and Save/Load behavior.

After the player confirms Promotion in this Vertical Slice:

- `promotion_junior_to_middle` is marked completed.
- `career.currentStageId` becomes `middle_qa`.
- no Middle QA gameplay systems unlock;
- no Team, Reputation, Automation, Contracts or other future systems appear;
- the UI may show a simple completion state for the Vertical Slice.

The next Vertical Slice begins by defining the actual Middle QA gameplay unlocked after this transition.

### Benefits

- Clear development milestone.
- Prevents scope creep.
- Simplifies QA verification.
- Clean separation between implementation phases.

---

# DN-02 — Implement Future Systems as Inactive Stubs

## Decision

Gameplay systems outside this Vertical Slice may already exist in the project as inactive modules.

Examples:

- Team
- Reputation
- Automation
- Contracts
- Office
- Company
- Prestige
- Events
- Achievements
- Statistics

These modules must not affect gameplay, UI, simulation or progression until explicitly enabled by future Vertical Slice documents.

### Benefits

- Matches the modular architecture.
- Simplifies future implementation.
- Keeps the project scalable from the beginning.

---

# DN-03 — Promotion Requires Explicit Player Confirmation

## Decision

Promotion is **not automatic**.

When all requirements are fulfilled:

- Promotion becomes available.
- The player receives clear feedback.
- A dedicated **Promote** action becomes available.

The player explicitly decides when to accept the promotion.

Future promotion ceremonies, tutorials and unlock sequences will begin from this interaction.

### Benefits

- Makes promotions feel significant.
- Provides a natural transition point.
- Supports future presentation improvements.

---

# DN-04 — Freeze the Vertical Slice Scope

## Decision

The MVP Vertical Slice is considered complete once every Acceptance Criterion defined in this document is satisfied.

Additional mechanics, resources, gameplay systems or UI panels must not be added before the next Vertical Slice specification is approved.

Future ideas should be documented separately rather than expanding this slice.

### Benefits

- Prevents scope creep.
- Creates a reliable implementation target.
- Encourages polish over feature count.

---

# DN-05 - Use Bounded Native Numbers for MVP

## Decision

The MVP Vertical Slice uses bounded native JavaScript numbers for gameplay quantities.

This is allowed only because the slice is intentionally small and all values are capped far below JavaScript precision limits.

The implementation must still isolate numeric operations behind helper functions so a future big-number or decimal abstraction can replace native numbers without rewriting gameplay systems.

### Constraints

- No MVP resource, cost, requirement or multiplier may exceed `1,000,000`.
- Formatting must remain separate from calculation.
- Gameplay code should not spread direct formatting or rounding rules across systems.
- The next slice must re-evaluate numeric strategy before adding passive production, automation, prestige or long-term scaling.

---

# 1. Purpose

The purpose of the MVP Vertical Slice is to validate the foundation of QA Idle.

It is the smallest implementation that demonstrates the project's core identity while remaining fully aligned with the approved game architecture.

The Vertical Slice exists to prove that:

- the core gameplay loop is enjoyable;
- gameplay systems interact correctly;
- resources flow through the architecture as intended;
- upgrades permanently improve gameplay;
- progression feels meaningful;
- save/load supports continued play;
- the architecture is ready for future expansion.

The Vertical Slice is **not** intended to represent the complete early game.

Its purpose is to validate the project's design, architecture and implementation pipeline.

---

# 2. Scope

## Included

The Vertical Slice includes only the first career loop.

Included gameplay systems:

- New Game
- Manual Testing
- Bug Reporting
- Resources
- Money
- Basic Upgrades
- Promotion
- Unlock System
- Save / Load

Supported gameplay flow:

```text
New Game
        ↓
Manual Testing
        ↓
Find Bugs
        ↓
Report Bugs
        ↓
Earn Money
        ↓
Purchase Upgrades
        ↓
Improve Manual Testing
        ↓
Promotion Available
```

Once Promotion becomes available, the Vertical Slice is complete.

---

## Excluded

The following gameplay systems are intentionally excluded:

- Team
- Reputation
- Automation
- Contracts
- Office
- Company
- Prestige
- Events
- Achievements
- Statistics
- Late-game mechanics

These systems may exist only as inactive implementation stubs.

No gameplay behavior may originate from them.

---

# 3. Gameplay Flow

The Vertical Slice intentionally teaches one complete gameplay loop.

## Step 1 — New Game

The player starts as **Junior QA**.

The save file is initialized.

Only the gameplay systems included in this Vertical Slice are active.

The interface displays only the minimum information required for the first gameplay loop.

---

## Step 2 — Manual Testing

The player performs Manual Testing.

Each completed action produces **Bugs Found**.

Manual Testing is the only production system available.

There is no passive production.

---

## Step 3 — Bug Reporting

The player reports accumulated Bugs Found.

Bug Reporting consumes Bugs Found and produces Money.

This teaches the game's first resource conversion.

---

## Step 4 — Purchase Upgrades

Money is invested into Manual Testing upgrades.

Purchased upgrades permanently improve Manual Testing efficiency.

The player immediately experiences the effect of long-term progression.

---

## Step 5 — Repeat

The player continuously repeats:

```text
Manual Testing
        ↓
Bugs Found
        ↓
Bug Reporting
        ↓
Money
        ↓
Upgrades
```

Each iteration increases the player's efficiency.

---

## Step 6 — Promotion Available

Once all promotion requirements are satisfied:

- Promotion becomes available.
- The UI communicates that promotion can now be accepted.
- A **Promote** action becomes available.

No new gameplay systems unlock during this Vertical Slice.

The implementation milestone ends here.

## 3.1 MVP Action Rules

The MVP Vertical Slice uses explicit player actions only.

There is no passive production, no timers, no offline production and no automatic reporting in this slice.

| Action ID | Player Action | Rule |
|-----------|---------------|------|
| `action_manual_test` | Manual Testing | Immediately adds Bugs Found equal to current `manual_bugs_per_action`. |
| `action_report_bugs` | Bug Reporting | Reports all currently held Bugs Found. Each reported Bug grants current `money_per_bug_reported`. |
| `action_purchase_upgrade` | Purchase Upgrade | Spends Money and applies the upgrade modifier if all purchase rules pass. |
| `action_accept_promotion` | Promote | Completes `promotion_junior_to_middle` after all requirements are satisfied. |

Bug Reporting must fail gracefully if `bugs_found` is 0.

Upgrade purchase must fail gracefully if the player cannot afford the upgrade or already owns a one-time upgrade.

# 4. Included Gameplay Systems

Only the following gameplay systems participate in the MVP Vertical Slice.

Each system retains its responsibilities defined in previous documentation while limiting its implementation to the scope of this document.

---

# Manual Testing

## Purpose

Acts as the player's primary production system.

Introduces the core interaction of personally testing software to discover bugs.

---

## Responsibilities

- Accept Manual Testing actions.
- Produce Bugs Found.
- Apply purchased upgrade effects.
- Emit gameplay events related to successful testing.

---

## Inputs

- Player interaction.
- Manual Testing upgrades.

---

## Outputs

- Bugs Found.
- Promotion progress.

---

## Dependencies

- Resources
- Upgrades
- Promotion
- Save/Load

---

# Bug Reporting

## Purpose

Converts Bugs Found into Money.

Introduces the first resource conversion loop.

---

## Responsibilities

- Consume Bugs Found.
- Produce Money.
- Apply reporting-related upgrade effects.
- Emit reporting events.

---

## Inputs

- Bugs Found.
- Bug Reporting upgrades.

---

## Outputs

- Money.
- Promotion progress.

---

## Dependencies

- Resources
- Upgrades
- Promotion
- Save/Load

---

# Resources

## Purpose

Provide the shared resource layer between gameplay systems.

---

## Responsibilities

- Store resource values.
- Validate resource transactions.
- Expose current balances.
- Prevent invalid resource operations.

---

## Inputs

- Manual Testing.
- Bug Reporting.
- Upgrades.

---

## Outputs

- Current Bugs Found.
- Current Money.

---

## Dependencies

None.

Resources act as the shared foundation used by all gameplay systems.

---

# Money

## Purpose

Acts as the first investment resource.

Allows the player to permanently improve Manual Testing.

---

## Responsibilities

- Receive income from Bug Reporting.
- Validate upgrade purchases.
- Track current balance.

---

## Inputs

- Bug Reporting.

---

## Outputs

- Upgrade purchases.

---

## Dependencies

- Resources
- Upgrades
- Save/Load

---

# Upgrades

## Purpose

Provide permanent progression within the Vertical Slice.

Every purchased upgrade should improve the Manual Testing gameplay loop.

---

## Responsibilities

- Validate purchases.
- Apply permanent bonuses.
- Expose purchased state.
- Notify affected gameplay systems.

---

## Inputs

- Money.

---

## Outputs

- Improved Manual Testing.
- Improved Bug Reporting through `upgrade_bug_report_template`.

---

## Dependencies

- Money
- Resources
- Save/Load

---

# Promotion

## Purpose

Defines the completion goal of the Vertical Slice.

Promotion represents successful completion of the Junior QA gameplay loop.

---

## Responsibilities

- Evaluate promotion requirements.
- Detect when all requirements are fulfilled.
- Expose Promotion availability.
- Execute Promotion when the player confirms.

Promotion does **not** unlock additional gameplay in this Vertical Slice.

---

## Inputs

- Lifetime Bugs Found.
- Lifetime Money Earned.
- Purchased Upgrades.

---

## Outputs

- Promotion Available state.
- Promotion Completed event.

---

## Dependencies

- Resources
- Upgrades
- Unlock System
- Save/Load

---

# Save / Load

## Purpose

Persist player progress between sessions.

---

## Responsibilities

- Save gameplay state.
- Restore gameplay state.
- Restore purchased upgrades.
- Restore unlocked UI.
- Restore promotion progress.

---

## Inputs

- All persistent gameplay systems.

---

## Outputs

- Restored gameplay state.

---

## Dependencies

All implemented gameplay systems.

---

# Unlock System

## Purpose

Control which gameplay elements are visible to the player.

Prevent future gameplay systems from appearing before their intended career stage.

---

## Responsibilities

- Determine UI visibility.
- Hide unavailable systems.
- Reveal Promotion when requirements are satisfied.
- Preserve unlock state in saves.

---

## Inputs

- Career progression.
- Promotion state.

---

## Outputs

- UI visibility.
- Unlock state.

---

## Dependencies

- Promotion
- Save/Load

---

# 5. Resource Set

Only two gameplay resources exist during the MVP Vertical Slice.

No additional resources should be implemented or exposed to the player.

| Resource ID | Display Name | Purpose | Produced By | Consumed By | Initial Value | Min Value | MVP Max |
|-------------|--------------|---------|-------------|-------------|---------------|-----------|---------|
| `bugs_found` | Bugs Found | Primary production resource | Manual Testing | Bug Reporting | 0 | 0 | 1,000,000 |
| `money` | Money | Primary investment resource | Bug Reporting | Upgrades | 0 | 0 | 1,000,000 |

All future resources defined in previous documentation remain outside the scope of this Vertical Slice.

Examples include:

- Reputation
- Team Output
- Automation Coverage
- Company Reputation

These resources may exist as inactive definitions but must not participate in gameplay.

---

# 5.1 Required Stable IDs

The MVP Vertical Slice must use the following stable IDs.

These IDs are part of the implementation contract and must be used in save data, content definitions, events, tests and unlock rules.

| Content Type | Stable ID | Notes |
|--------------|-----------|-------|
| Career Stage | `junior_qa` | Starting career stage. |
| Career Stage | `middle_qa` | Target stage after confirmed promotion; no Middle QA gameplay unlocks in this slice. |
| Promotion | `promotion_junior_to_middle` | First promotion and completion milestone for the slice. |
| Unlock | `unlock_promotion_junior_to_middle` | Controls visibility and availability of the Promote action. |
| UI Surface | `ui_manual_testing` | Visible from New Game. |
| UI Surface | `ui_bug_reporting` | Visible from New Game. |
| UI Surface | `ui_resources_basic` | Visible from New Game. |
| UI Surface | `ui_upgrades_basic` | Visible from New Game. |
| UI Surface | `ui_promotion_progress` | Visible from New Game as next-goal progress. |
| UI Surface | `ui_promote_action` | Hidden until promotion is available. |

---

# 6. Upgrade Set

The MVP Vertical Slice requires only a small upgrade pool.

Its purpose is to validate the upgrade architecture rather than provide deep progression.

Each upgrade should permanently improve one part of the core gameplay loop.

## MVP Upgrade Definitions

All MVP upgrades are one-time purchases.

Upgrade effects must be implemented through the shared modifier model, not hardcoded inside UI buttons.

| Upgrade ID | Display Name | Cost | Effect | Max Level | Unlock | Promotion Contribution |
|------------|--------------|------|--------|-----------|--------|------------------------|
| `upgrade_better_checklist` | Better Checklist | 10 Money | `manual_bugs_per_action +1` | 1 | Visible from New Game | Counts as purchased upgrade. |
| `upgrade_coffee` | Coffee | 25 Money | `manual_bugs_per_action +1` | 1 | Visible from New Game | Counts as purchased upgrade. |
| `upgrade_keyboard_shortcuts` | Keyboard Shortcuts | 60 Money | `manual_bugs_per_action +2` | 1 | Visible from New Game | Counts as purchased upgrade. |
| `upgrade_bug_report_template` | Bug Report Template | 100 Money | `money_per_bug_reported +1` | 1 | Visible from New Game | Counts as purchased upgrade. |
| `upgrade_test_case_library` | Test Case Library | 250 Money | `manual_bugs_per_action +3` | 1 | Visible from New Game | Counts as purchased upgrade. |

## MVP Base Values

The MVP loop uses the following base values before upgrades:

| Value ID | Initial Value | Notes |
|----------|---------------|-------|
| `manual_bugs_per_action` | 1 | Each Manual Testing action produces 1 Bug before modifiers. |
| `money_per_bug_reported` | 1 | Each reported Bug produces 1 Money before modifiers. |

This specification requires that:

- upgrades are permanent;
- upgrades require Money;
- upgrades modify gameplay;
- purchased upgrades persist through Save/Load;
- all purchased MVP upgrades count toward the Purchased Upgrades promotion requirement.

---

# 6.1 Promotion Requirement

The MVP Vertical Slice has exactly one promotion.

| Field | Value |
|-------|-------|
| Promotion ID | `promotion_junior_to_middle` |
| From Career Stage | `junior_qa` |
| To Career Stage | `middle_qa` |
| Display Name | Middle QA Promotion |
| Availability Requirement 1 | Lifetime Bugs Found >= 100 |
| Availability Requirement 2 | Lifetime Money Earned >= 150 |
| Availability Requirement 3 | Purchased Upgrades >= 3 |
| Confirmation | Explicit player action required. |
| Reward in this Slice | Mark promotion completed and set current career stage to `middle_qa`. |
| Out of Scope Reward | No Team, Reputation, Automation or Middle QA gameplay unlocks. |

Promotion requirements must be evaluated through the shared requirement engine.

Current resource balance is not enough for requirements that specify lifetime totals.

---

# 6.2 MVP Modifier Rules

The MVP modifier model is intentionally minimal.

All modifiers in this slice are:

- permanent after purchase;
- additive;
- applied to base values before the related action resolves;
- saved through the purchased upgrade state rather than as separate temporary modifier state.

MVP modifier targets:

| Modifier Target | Base Value | Modified By |
|-----------------|------------|-------------|
| `manual_bugs_per_action` | 1 | Better Checklist, Coffee, Keyboard Shortcuts, Test Case Library |
| `money_per_bug_reported` | 1 | Bug Report Template |

No multiplicative, temporary, random or conditional modifiers exist in this slice.

---

# 6.3 MVP Event Contracts

The MVP Vertical Slice must emit the following events where the architecture requires event-based reactions or test observation.

These are technical architecture events, not the future gameplay **Events** system.

| Event ID | Source | Purpose |
|----------|--------|---------|
| `manualTest.performed` | Manual Testing | Player performed Manual Testing. |
| `bugs.found` | Manual Testing | Bugs Found increased. |
| `bugReport.submitted` | Bug Reporting | Bugs were reported. |
| `money.earned` | Bug Reporting / Resources | Money increased through reporting. |
| `resource.changed` | Resources | A resource balance changed. |
| `upgrade.purchased` | Upgrades | An upgrade was bought. |
| `promotion.available` | Promotion | All promotion requirements became satisfied. |
| `promotion.completed` | Promotion | Player confirmed the promotion. |
| `career.stageChanged` | Career | Current career stage changed to `middle_qa`. |
| `unlock.revealed` | Unlock System | Promote action became visible. |
| `game.saved` | Save / Load | Save completed successfully. |
| `game.loaded` | Save / Load | Save loaded successfully. |

No event in this slice may trigger future systems.

# 7. Unlock Rules

The Unlock System is responsible for ensuring that the player only sees gameplay systems relevant to the current Vertical Slice.

Future gameplay layers must remain completely hidden.

The player should always feel that the game is simple and focused.

---

## Visible at New Game

The following UI elements are available immediately after starting a new game:

- Manual Testing
- Bugs Found resource
- Bug Reporting
- Money resource
- Upgrade panel
- Current Career Rank
- Promotion progress

These elements form the complete gameplay experience of the Vertical Slice.

---

## Hidden Throughout the Entire Vertical Slice

The following systems remain completely hidden:

- Team
- Reputation
- Automation
- Contracts
- Office
- Company
- Prestige
- Events
- Achievements
- Statistics

Their UI must not appear.

Their resources must not appear.

Their progression must not appear.

Their tutorials must not appear.

Their buttons must not appear.

The player should not feel that parts of the game are "missing."

Instead, the game should feel intentionally small.

---

## Promotion Visibility

Promotion progress is visible from New Game as the player's next goal.

The **Promote** action remains hidden until every promotion requirement has been satisfied.

Once available:

- Promote action UI becomes visible.
- Promotion status changes to Available.
- The player receives clear feedback.
- The **Promote** action becomes available.

No additional gameplay systems become visible after promotion during this Vertical Slice.

## MVP Unlock States

| Unlock ID | Target | Initial State | Available / Unlocked Condition |
|-----------|--------|---------------|--------------------------------|
| `ui_manual_testing` | Manual Testing UI | active | New Game |
| `ui_bug_reporting` | Bug Reporting UI | active | New Game |
| `ui_resources_basic` | Bugs Found and Money counters | active | New Game |
| `ui_upgrades_basic` | Basic Upgrade panel | active | New Game |
| `ui_promotion_progress` | Promotion progress / next goal | active | New Game |
| `unlock_promotion_junior_to_middle` | Promote action | hidden | All `promotion_junior_to_middle` requirements are satisfied. |

---

# 8. Save Data

Only the minimum data required for this Vertical Slice should be persisted.

The complete SaveData schema is defined in **07 - Technical Rules.md**.

This section specifies only the subset required by the MVP implementation.

---

## Meta

Store:

- schema version
- creation timestamp
- last save timestamp
- last active timestamp

---

## Resources

Persist:

- Bugs Found
- Money

---

## Career

Persist:

- Current Career Rank
- Promotion Available state
- Promotion Completed state (if accepted)
- Current-run lifetime Bugs Found for promotion requirements
- Current-run lifetime Money Earned for promotion requirements

---

## Upgrades

Persist:

- Purchased upgrades
- Upgrade levels (if applicable)

---

## Unlocks

Persist:

- Current unlock states
- Promotion visibility

---

## Systems

Persist only state required by implemented systems:

- Manual Testing
- Bug Reporting

Promotion progress counters may be stored under Career, Promotion or a dedicated MVP progress object, but they must not require the full Statistics system in this slice.

Future systems should either:

- use default values; or
- remain absent until implemented.

---

## Settings

Persist user settings supported by the implementation.

Examples may include:

- sound
- music
- number formatting

The exact settings implementation is outside the scope of this document.

---

# 9. Acceptance Criteria

The MVP Vertical Slice is considered complete only when every criterion below is satisfied.

---

## New Game

- A new save can be created.
- The player starts as Junior QA.
- Initial resources are correctly initialized.
- Only Vertical Slice systems are active.

---

## Manual Testing

- Manual Testing can be performed repeatedly.
- Manual Testing produces Bugs Found.
- Manual Testing increases current-run lifetime Bugs Found.
- Purchased upgrades modify Manual Testing behavior.
- Manual Testing state survives Save/Load.

---

## Bug Reporting

- Bug Reporting consumes Bugs Found.
- Bug Reporting produces Money.
- Bug Reporting increases current-run lifetime Money Earned.
- Reporting cannot occur without sufficient Bugs Found.
- Reporting state survives Save/Load.

---

## Resources

- Bugs Found are stored correctly.
- Money is stored correctly.
- Invalid resource transactions are prevented.
- Resource values are restored after loading a save.

---

## Upgrades

- Upgrades require Money.
- Upgrades use the stable IDs and costs defined in this document.
- Purchased upgrades remain permanently active.
- Purchased upgrades modify gameplay.
- Purchased upgrades persist after Save/Load.

---

## Promotion

- Promotion requirements are evaluated correctly using:
  - Lifetime Bugs Found >= 100
  - Lifetime Money Earned >= 150
  - Purchased Upgrades >= 3
- Promotion becomes available only after all requirements are met.
- Promotion is initiated only by explicit player confirmation.
- Confirming Promotion sets `career.currentStageId` to `middle_qa`.
- Confirming Promotion does not reveal any Middle QA gameplay systems.
- Promotion completion is saved correctly.

---

## Unlock System

- Hidden systems never appear before their intended unlock.
- Promotion progress is visible from New Game.
- Promote action appears only when Promotion is available.
- Unlock state persists after Save/Load.

---

## Save / Load

- Gameplay progress is restored correctly.
- Resources are restored correctly.
- Purchased upgrades are restored correctly.
- Promotion progress is restored correctly.
- Current-run lifetime Bugs Found is restored correctly.
- Current-run lifetime Money Earned is restored correctly.
- Unlock state is restored correctly.

---

## Scope Validation

The implementation must not expose gameplay related to:

- Team
- Reputation
- Automation
- Contracts
- Office
- Company
- Prestige
- Events
- Achievements
- Statistics

Any implementation of these systems must remain inactive and inaccessible.

---

# 10. Future Expansion

The next Vertical Slice begins immediately after the completion of this one.

Its purpose is to validate the first gameplay expansion introduced by promotion.

The next implementation is expected to extend the existing architecture rather than replace it.

Future additions may include:

- Middle QA career stage.
- The first newly unlocked gameplay system.
- Expanded interface.
- Additional upgrades.
- New progression goals.

The gameplay loop introduced in this document remains unchanged.

Future Vertical Slices should build upon the established foundation while preserving the architecture, progression philosophy and gameplay principles defined by the previous design documents.

---

# End of Document
