# 14 - Promotion System

## Document Status

**Project:** QA Idle

**Document Type:** Promotion System Architecture

**Owner Role:** Lead Systems Designer / Lead Technical Game Designer / Software Architect / Product Designer

**Status:** Frozen v1.0

**Depends On:**

- 00 - Master Project Roadmap.md
- 04 - Career System.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08 - MVP Vertical Slice Specifica.md
- 09 - Modifier System.md
- 10 - Economy Framework.md
- 11 - Resource System.md
- 12 - Upgrade System.md
- 13 - Unlock System.md

This document defines the complete Promotion System architecture used throughout QA Idle.

It establishes how career transitions are evaluated, coordinated, confirmed, executed, persisted, restored and extended across the lifetime of the game.

After approval, this document becomes the Single Source of Truth for every Promotion implemented in QA Idle.

This document intentionally does **not** define:

- concrete career ranks;
- promotion balance;
- promotion requirements;
- reward values;
- unlock content;
- upgrade content;
- UI layouts;
- tutorials;
- story events.

Those responsibilities belong to their respective authoritative documents.

---

# Designer Notes

The following proposals are **approved architectural decisions** and become part of this document.

---

# DN-01 — Promotion Is a Workflow

## Decision

A Promotion is **not** a single gameplay event.

It is a deterministic workflow executed through a standardized state machine.

This allows:

- explicit confirmation;
- transition animations;
- tutorials;
- rollback support;
- Save / Load during transitions;
- future promotion ceremonies;
- deterministic debugging.

Future implementations must never treat Promotion as a single "PromotePlayer()" operation.

---

# DN-02 — Promotion Coordinates, Never Owns

## Decision

Promotion System never performs gameplay changes directly.

Instead it coordinates specialized systems.

Example:

```text
Promotion
        │
        ├── Career System
        ├── Unlock System
        ├── Modifier System
        ├── Resource System
        └── Event Bus
```

Each participating system remains the authoritative owner of its own data.

Promotion merely orchestrates their execution.

---

# DN-03 — Promotion Executes Through a Pipeline

## Decision

Promotion execution always follows a deterministic evaluation pipeline.

Example:

```text
Validate
        ↓
Lock Transaction
        ↓
Execute Career Transition
        ↓
Grant Rewards
        ↓
Apply Unlocks
        ↓
Activate Modifiers
        ↓
Emit Events
        ↓
Commit
        ↓
Complete
```

Every implementation must preserve this order unless explicitly documented otherwise.

---

# 1. Purpose

Promotion is one of the central progression mechanisms of QA Idle.

Career growth is the primary fantasy of the game.

Promotion therefore represents far more than increasing production.

It represents the player permanently assuming greater responsibility.

Promotion is responsible for coordinating this transition while keeping every gameplay system independent.

It exists to guarantee:

- deterministic career transitions;
- modular orchestration;
- explicit player confirmation;
- consistent Save / Load behavior;
- replay compatibility through Prestige;
- future branching careers;
- scalable expansion.

Promotion System intentionally owns **coordination**, not gameplay mechanics.

Career progression should therefore always follow the same architectural model:

```text
Player Progress
        ↓
Promotion Available
        ↓
Player Decision
        ↓
Promotion Workflow
        ↓
Coordinated System Changes
        ↓
Expanded Responsibilities
```

---

# 2. Promotion Philosophy

Promotion is the architectural bridge between progression and responsibility.

The player should never feel that a promotion simply grants stronger numbers.

Instead the player should feel:

> "My job changed."

Promotion therefore exists to coordinate changes across multiple gameplay systems while preserving clear ownership boundaries.

Promotion supports five architectural goals.

---

## 2.1 Career Progression

Promotion advances the player's career.

Career System remains responsible for defining career stages.

Promotion only coordinates movement between them.

---

## 2.2 Responsibility Expansion

Every promotion should represent increased responsibility.

That increased responsibility may later produce:

- new gameplay systems;
- new UI;
- new decisions;
- new resources;
- new strategic planning.

Promotion itself does not implement those features.

It coordinates their activation.

---

## 2.3 Explicit Commitment

Promotion is intentionally player-confirmed.

Meeting promotion requirements never forces an immediate transition.

Instead:

```text
Requirements Complete
        ↓
Promotion Available
        ↓
Player Chooses
        ↓
Promotion Executes
```

This supports:

- pacing;
- anticipation;
- preparation;
- future presentation improvements.

---

## 2.4 Modular Coordination

Promotion should never become a monolithic gameplay system.

Instead it coordinates specialized systems.

Example:

```text
Career Stage
        ↓
Career System

Resources
        ↓
Resource System

Gameplay Stats
        ↓
Modifier System

Visibility
        ↓
Unlock System
```

Each system performs only the work it already owns.

---

## 2.5 Deterministic Execution

Every promotion must execute identically given identical game state.

Promotion evaluation must never depend on:

- UI state;
- frame timing;
- asynchronous presentation;
- animation completion;
- rendering order.

Gameplay state changes always precede presentation.

---

# 3. Core Definitions

## Promotion

A Promotion is a standardized gameplay object representing an approved transition from one Career Stage to another.

A Promotion coordinates multiple gameplay systems while preserving their ownership.

A Promotion may:

- evaluate requirements;
- become available;
- wait for player confirmation;
- execute a coordinated transition;
- grant rewards;
- emit events;
- record history;
- support Prestige repetition.

A Promotion never directly modifies gameplay state owned by another system.

---

## Promotion Definition

A Promotion Definition is the immutable content record describing a promotion.

It defines:

- stable identifier;
- source Career Stage;
- destination Career Stage;
- requirement definitions;
- reward definitions;
- consequence definitions;
- unlock references;
- visibility rules;
- lifetime behavior;
- persistence metadata;
- debugging metadata.

Definitions contain no runtime player state.

---

## Promotion Instance

A Promotion Instance represents the runtime state of a Promotion Definition for a specific save.

It stores information such as:

- current state;
- previous state;
- timestamps;
- confirmation status;
- execution progress;
- completion history;
- prestige iteration;
- runtime transaction identifiers.

Instances never duplicate Definition data.

---

## Promotion Registry

The Promotion Registry is the authoritative catalog of every Promotion Definition known to the game.

Every Promotion must be registered before gameplay begins.

Gameplay systems must never create promotions dynamically outside approved registry rules.

---

## Promotion Service

The Promotion Service is the runtime orchestration layer.

It owns:

- promotion evaluation;
- state transitions;
- confirmation workflow;
- execution pipeline;
- transaction coordination;
- rollback handling;
- persistence;
- event dispatching;
- debug inspection.

The Promotion Service must remain generic.

It must never contain promotion-specific gameplay logic.

---

## Promotion Requirement

A Promotion Requirement is a read-only condition evaluated before Promotion becomes available.

Requirements may reference approved gameplay systems through their public interfaces.

Requirements never mutate gameplay state.

---

## Promotion Reward

A Promotion Reward is a standardized description of gameplay changes requested during promotion execution.

Promotion Rewards describe intent.

Owning systems perform implementation.

---

## Promotion Consequence

A Promotion Consequence is a standardized non-reward outcome triggered by a Promotion.

Examples include:

- career transition;
- unlocking future systems;
- updating progression state;
- enabling tutorials;
- recording history;
- notifying analytics.

Consequences are coordinated through the execution pipeline.

---

## Promotion Transaction

A Promotion Transaction is the authoritative state transition representing one promotion execution.

The transaction coordinates participating systems while ensuring deterministic completion or rollback.

Promotion runtime state may only change through Promotion Transactions.

---

## Promotion Event

A Promotion Event is emitted after successful transaction commit.

Promotion Events notify interested systems that a career transition has completed.

Promotion Events never replace ownership.

Receiving systems decide how to react.

---

# 4. Promotion Lifecycle

Every Promotion follows the same lifecycle.

```text
Registered
        ↓
Validated
        ↓
Hidden
        ↓
Visible
        ↓
Unavailable
        ↓
Available
        ↓
Pending Confirmation
        ↓
Executing
        ↓
Completed
        ↓
Archived / Reset / Preserved
```

Individual promotions may skip specific visibility stages according to documented rules.

Execution stages may never be reordered.

---

## 4.1 Registered

The Promotion Definition exists inside the Promotion Registry.

It is known to the game but has no runtime player state.

---

## 4.2 Validated

The Promotion Registry validates the Promotion Definition before gameplay begins.

Validation includes:

- unique identifier;
- valid source Career Stage;
- valid destination Career Stage;
- valid requirement references;
- valid reward references;
- valid unlock references;
- valid persistence configuration.

Invalid definitions are development errors.

---

## 4.3 Hidden

The Promotion exists but is completely invisible.

Hidden promotions reveal no future mechanics.

Hidden state is typically controlled by the Unlock System.

---

## 4.4 Visible

The player becomes aware that a future Promotion exists.

Visibility does not imply availability.

Visible promotions may display:

- current career;
- next career;
- limited preview;
- progress indicators.

Future gameplay systems remain protected by Unlock System rules.

---

## 4.5 Unavailable

The Promotion can be inspected but cannot yet be accepted.

One or more requirements remain unsatisfied.

The Promotion Service periodically re-evaluates availability using deterministic rules.

---

## 4.6 Available

Every requirement has been satisfied.

The Promotion becomes eligible for player confirmation.

No automatic execution occurs.

The player retains full control over when to accept the Promotion.

---

## 4.7 Pending Confirmation

The Promotion waits for explicit player confirmation.

During this state:

- gameplay continues normally;
- resources continue updating;
- upgrades remain purchasable;
- requirements may optionally become invalid if configured by the definition;
- the player may postpone accepting the Promotion indefinitely unless future content specifies expiration behavior.

The Promotion System owns only the confirmation state.

It does not pause the game unless another system explicitly requests it.

---

## 4.8 Executing

After confirmation, the Promotion enters the execution pipeline.

Execution becomes transactional.

Either:

- the entire Promotion succeeds;

or

- the entire Promotion rolls back.

Partial completion is not permitted.

---

## 4.9 Completed

The Promotion Transaction has committed successfully.

The Promotion Instance records completion.

The destination Career Stage becomes authoritative.

Future systems react through Promotion Events.

---

## 4.10 Archived / Reset / Preserved

After completion, Promotion enters its long-term persistence state.

Depending on lifetime rules, a Promotion may:

- remain permanently completed;
- repeat after Prestige;
- archive historical information;
- preserve analytics;
- preserve lifetime statistics.

Promotion lifetime behavior must be data-driven rather than hardcoded.

---
# 5. Promotion Architecture

The Promotion System is intentionally designed as an orchestration layer.

It does not own gameplay mechanics.

Instead, it coordinates multiple independent gameplay systems through one deterministic workflow.

The architecture follows the project's modular design philosophy.

```text
                    Promotion Definition
                            │
                            ▼
                  Promotion Registry
                            │
                            ▼
                  Promotion Service
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 Requirement Engine   State Machine     Transaction Pipeline
        │                   │                   │
        └───────────────┬───┴───────────────────┘
                        ▼
              Promotion Transaction
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
 Career System   Unlock System   Resource System
        │               │                │
        ▼               ▼                ▼
 Modifier System     Event Bus      Save System
                        │
                        ▼
                         UI
```

Every component has exactly one responsibility.

No component should contain duplicated logic owned by another gameplay system.

---

## 5.1 Architectural Responsibilities

The Promotion System owns:

- promotion registration;
- promotion evaluation;
- promotion availability;
- promotion state transitions;
- confirmation workflow;
- execution orchestration;
- transaction coordination;
- rollback;
- promotion persistence;
- promotion history;
- promotion debugging.

The Promotion System does **not** own:

- Career data;
- Unlock state;
- Resource balances;
- Gameplay Stats;
- Upgrade ownership;
- UI behavior;
- Tutorials;
- Balance.

---

## 5.2 Architectural Principles

Promotion implementation must satisfy the following principles.

### Single Responsibility

Promotion coordinates.

Other systems execute.

---

### Deterministic

Identical save state must always produce identical Promotion evaluation.

---

### Event-Driven

Promotion communicates through events instead of direct system knowledge whenever possible.

---

### Data-Driven

Every Promotion is described through content definitions.

Implementation should never contain hardcoded promotions.

---

### Transactional

Promotion either succeeds completely or not at all.

---

### Extensible

Future professions, branches, prestige paths and DLC promotions must reuse the same architecture.

---

# 6. Promotion Registry

The Promotion Registry is the authoritative catalog of every Promotion Definition.

Every Promotion must exist inside the registry before gameplay begins.

Promotion Definitions are immutable content.

Runtime player state is stored separately inside Promotion Instances.

---

## Registry Responsibilities

The Registry owns:

- Promotion registration;
- identifier uniqueness;
- definition lookup;
- validation;
- dependency resolution;
- content loading;
- debugging metadata.

The Registry does not evaluate gameplay.

---

## Registry Validation

Before gameplay starts, every Promotion Definition must be validated.

Validation includes:

- unique identifier;
- valid source Career Stage;
- valid destination Career Stage;
- no circular self-transition;
- valid reward references;
- valid requirement definitions;
- valid unlock references;
- valid persistence configuration;
- supported repeat policy.

Invalid Promotion Definitions must fail during development.

Silent correction is prohibited.

---

## Stable Identity

Every Promotion requires a permanent identifier.

Example:

```text
promotion_junior_to_middle
```

Identifiers must never depend on:

- localization;
- display name;
- UI text;
- ordering.

Once released, identifiers must remain stable for Save compatibility.

---

# 7. Promotion Definitions

Promotion Definitions describe static promotion content.

Definitions are immutable.

They never contain player progress.

A Promotion Definition should contain fields conceptually similar to:

| Field | Purpose |
|---------|----------|
| promotionId | Stable identifier |
| sourceCareerStage | Origin Career Stage |
| destinationCareerStage | Target Career Stage |
| visibilityRules | Promotion visibility configuration |
| requirementDefinitions | Requirement list |
| rewardDefinitions | Requested rewards |
| consequenceDefinitions | Additional coordinated actions |
| unlockReferences | Unlocks related to the transition |
| repeatPolicy | Repeatability rules |
| persistencePolicy | Save behavior |
| debugMetadata | Development information |

Exact implementation structure is left to code.

Behavior is defined by this document.

---

## Definition Ownership

Promotion Definitions may reference other systems.

They never redefine them.

Example:

```text
Promotion

↓

references

↓

Career Stage
```

not

```text
Promotion

↓

contains

↓

Career implementation
```

The owning system remains authoritative.

---

## Repeat Policy

Every Promotion Definition must declare its repeat behavior.

Possible examples include:

- once per save;
- repeat after Prestige;
- repeat every Career Cycle;
- expansion-defined behavior.

Repeatability is content data.

Never hardcoded.

---

# 8. Promotion States

Promotion runtime state belongs to the Promotion Instance.

Every Promotion Instance must always occupy exactly one primary state.

Core states are:

| State | Description |
|---------|-------------|
| Hidden | Promotion unknown to player |
| Visible | Promotion shown but unavailable |
| Unavailable | Visible, requirements unmet |
| Available | Requirements satisfied |
| PendingConfirmation | Waiting for player |
| Executing | Transaction running |
| Completed | Successfully finished |
| Archived | Historical record only |

Implementations may internally separate presentation state from execution state.

Gameplay behavior must remain equivalent.

---

## State Transition Rules

Allowed transitions:

```text
Hidden
      ↓
Visible
      ↓
Unavailable
      ↓
Available
      ↓
Pending Confirmation
      ↓
Executing
      ↓
Completed
      ↓
Archived
```

Transitions may never skip directly from:

```text
Unavailable

↓

Completed
```

Likewise:

```text
Available

↓

Completed
```

is prohibited.

Explicit confirmation remains mandatory.

---

## Invalid State Changes

The following transitions are invalid:

- Completed → Available
- Completed → Executing
- Hidden → Executing
- Hidden → Completed
- Executing → Hidden

Attempting an invalid transition is a development error.

---

# 9. Promotion Requirements

Promotion Requirements determine whether a Promotion becomes available.

Requirements are evaluated read-only.

Requirements never mutate gameplay state.

---

## Requirement Philosophy

Requirements answer only one question:

> "May this Promotion become available?"

They do not:

- spend resources;
- grant rewards;
- unlock content;
- modify Career.

---

## Requirement Sources

Requirements may reference:

- Career System;
- Resource System;
- Upgrade System;
- Unlock System;
- Progression counters;
- documented gameplay systems.

Future gameplay systems may contribute additional requirement providers.

---

## Deterministic Evaluation

Requirement evaluation must always produce identical results for identical game state.

Evaluation must not depend on:

- UI visibility;
- animations;
- random timing;
- rendering;
- localization.

---

## Requirement Composition

Promotion Definitions may contain:

- single requirements;
- grouped requirements;
- AND conditions;
- OR conditions;
- nested requirement groups.

Grouping remains content-driven.

The evaluation engine processes requirements generically.

---

## Requirement Caching

Implementations may cache evaluation results.

Caches must become invalid whenever dependent gameplay state changes.

Correctness always has priority over optimization.

---

# 10. Promotion Evaluation Pipeline

Promotion availability is determined through a standardized evaluation pipeline.

Every Promotion follows the same process.

```text
Promotion Definition
        ↓
Visibility Check
        ↓
Dependency Check
        ↓
Requirement Evaluation
        ↓
Availability Decision
        ↓
State Update
        ↓
Events
```

---

## Step 1 — Visibility

Determine whether the Promotion may currently appear.

Visibility typically depends on the Unlock System.

---

## Step 2 — Dependency Validation

Confirm that prerequisite Promotions or Career Stages have completed.

Dependencies establish ordering.

They do not replace requirements.

---

## Step 3 — Requirement Evaluation

Every Requirement is evaluated.

The evaluation produces:

```text
Satisfied

or

Unsatisfied
```

No gameplay state changes occur.

---

## Step 4 — Availability Resolution

If every mandatory requirement succeeds:

```text
Promotion

↓

Available
```

Otherwise:

```text
Promotion

↓

Unavailable
```

---

## Step 5 — State Synchronization

If availability changes, the Promotion State Machine performs a legal state transition.

The transition becomes the only authoritative runtime state.

---

## Step 6 — Event Publication

State changes emit Promotion Events.

Interested systems may react.

No system is required to react.

Promotion remains loosely coupled.

---
# 11. Promotion Transactions

Promotion execution is performed exclusively through Promotion Transactions.

A Promotion Transaction is the authoritative record representing one complete Promotion workflow.

It guarantees that:

- execution is deterministic;
- participating systems remain synchronized;
- partial completion cannot occur;
- rollback is possible before commit;
- Save / Load remains consistent.

Promotion runtime state may never bypass the transaction model.

---

## Transaction Philosophy

Promotion does not directly execute gameplay changes.

Instead it coordinates requests to the systems that own those changes.

Conceptually:

```text
Promotion
        ↓
Create Transaction
        ↓
Validate
        ↓
Execute
        ↓
Commit
        ↓
Emit Events
```

If execution cannot safely complete, the transaction must fail.

---

## Transaction Stages

Every Promotion Transaction follows the same lifecycle.

```text
Created
        ↓
Validated
        ↓
Locked
        ↓
Executing
        ↓
Committed

or

Rolled Back
```

No implementation should skip validation or locking.

---

## Transaction Lock

During execution, the Promotion Transaction becomes the authoritative owner of the Promotion workflow.

Its purpose is to prevent:

- duplicate confirmations;
- double execution;
- conflicting Career transitions;
- inconsistent Save state.

Only one execution may exist for a Promotion Instance at a time.

---

## Commit Rules

Commit occurs only after every participating system reports successful execution.

Commit marks:

- Promotion completed;
- Career transition finalized;
- history recorded;
- events emitted;
- Save state updated.

Until Commit occurs, gameplay must behave as though the Promotion has not completed.

---

# 12. Promotion Execution Pipeline

Promotion execution follows one mandatory deterministic order.

```text
Player Confirmation
        ↓
Validate Transaction
        ↓
Acquire Lock
        ↓
Execute Career Transition
        ↓
Grant Rewards
        ↓
Apply Unlock Changes
        ↓
Activate Promotion Modifiers
        ↓
Record History
        ↓
Commit Transaction
        ↓
Emit Promotion Events
```

Future systems may extend the pipeline only through documented extension points.

The relative order of existing stages must remain unchanged.

---

## Phase 1 — Validation

Validation confirms:

- Promotion still exists;
- Promotion remains Available;
- confirmation is valid;
- transaction is unique.

Validation must occur immediately before execution.

The player may have changed game state after the Promotion first became Available.

---

## Phase 2 — Lock

The Promotion Transaction acquires execution ownership.

No additional confirmation attempts are accepted until execution finishes.

---

## Phase 3 — Career Transition

Promotion requests Career System to activate the destination Career Stage.

Career System remains the only owner of Career data.

Promotion merely requests the transition.

---

## Phase 4 — Reward Distribution

Promotion requests reward execution.

Reward ownership belongs to the systems receiving those requests.

Examples include:

- Resource rewards;
- Unlock requests;
- progression updates;
- future prestige rewards.

Promotion never grants rewards directly.

---

## Phase 5 — Unlock Coordination

Promotion requests Unlock System to process Promotion-related Unlocks.

Unlock evaluation remains fully owned by Unlock System.

Promotion never changes Unlock state directly.

---

## Phase 6 — Modifier Activation

Promotion requests Modifier System to activate Promotion Modifiers.

Modifier registration, stacking and calculation remain owned by Modifier System.

---

## Phase 7 — History Recording

Promotion History receives a new immutable entry describing the completed Promotion.

History recording occurs before Commit.

---

## Phase 8 — Commit

Promotion runtime state becomes authoritative.

Completion is now permanent according to persistence rules.

---

## Phase 9 — Event Publication

Promotion emits completion events.

Interested systems react independently.

Promotion execution is now finished.

---

# 13. Promotion Rewards

Promotion Rewards describe gameplay benefits associated with completing a Promotion.

Rewards are declarative.

Owning systems implement them.

---

## Reward Philosophy

Promotion does not own reward logic.

Instead it describes what should happen.

Examples:

```text
Promotion

↓

Reward Definition

↓

Resource System
```

or

```text
Promotion

↓

Reward Definition

↓

Unlock System
```

---

## Supported Reward Types

Future content may define rewards including:

- Resource grants;
- Unlock activation;
- Upgrade availability;
- Modifier activation;
- feature flags;
- progression counters;
- tutorial triggers;
- future expansion rewards.

The architecture intentionally remains generic.

---

## Reward Ordering

Rewards execute in deterministic order.

Definitions must never rely on unspecified execution sequencing.

If one reward depends on another, the dependency must be expressed explicitly.

---

## Permanent Rewards

Many Promotion Rewards are permanent.

Examples include:

- new Career Stage;
- permanently available systems;
- new gameplay responsibilities.

Permanent rewards should not require continuous reevaluation.

---

## Repeatable Rewards

Future Prestige-compatible Promotions may generate repeatable rewards.

Repeatability belongs to content definitions.

The Promotion System executes them generically.

---

# 14. Promotion Consequences

Not every Promotion outcome is a reward.

Some outcomes exist because the player's role changed.

Promotion Consequences coordinate these structural changes.

---

## Consequence Philosophy

Rewards answer:

> "What does the player gain?"

Consequences answer:

> "What changes because this Promotion happened?"

The distinction improves architectural clarity.

---

## Typical Consequences

Promotion Consequences may include:

- Career transition;
- Unlock reevaluation;
- tutorial activation;
- progression milestone updates;
- analytics;
- statistics;
- narrative progression;
- achievement checks.

Promotion coordinates them.

Owning systems execute them.

---

## Structural Consequences

Structural changes should always occur after Career transition.

This guarantees that every participating system observes the player's new Career Stage.

---

# 15. Integration with Career System

Career System owns Career progression and committed Career transitions.

Promotion System coordinates Career transition requests.

The relationship is intentionally narrow.

---

## Career Ownership

Career System remains responsible for:

- Career Stage definitions;
- Career hierarchy;
- stage metadata;
- Career persistence.

Promotion must never modify Career state directly.

---

## Transition Requests

Promotion requests:

```text
Activate Career Stage
```

Career System validates and performs the transition.

Promotion records only the outcome.

---

## Read Access

Promotion may read:

- current Career Stage;
- completed Career Stages;
- Career progression metadata.

Promotion must treat Career data as read-only.

---

# 16. Integration with Unlock System

Unlock System owns content accessibility.

Promotion requests Unlock processing.

Promotion never mutates Unlock state.

---

## Unlock Interaction

Promotion may request:

- reevaluate unlocks;
- activate Promotion unlocks;
- process delayed unlocks.

Unlock System remains authoritative.

---

## Promotion Visibility

Promotion visibility itself may depend on Unlocks.

Promotion therefore consumes Unlock information but never owns it.

---

# 17. Integration with Upgrade System

Promotion and Upgrade are intentionally independent.

Neither owns the other.

---

## Promotion Reading Upgrade State

Promotion Requirements may inspect:

- purchased upgrades;
- upgrade ownership;
- upgrade completion.

This information is read-only.

---

## Promotion Never Purchases Upgrades

Promotion must never:

- purchase upgrades;
- refund upgrades;
- remove upgrades;
- modify upgrade levels.

Upgrade ownership belongs exclusively to Upgrade System.

---
# 18. Integration with Resource System

Resource System owns every persistent player Resource and every Resource Transaction.

Promotion may request Resource operations.

Promotion never owns Resource balances.

---

## Resource Interaction

Promotion may request:

- grant Resource rewards;
- execute documented Promotion costs;
- trigger standardized Resource Transactions.

Every Resource modification must be validated by the Resource System.

---

## Resource Read Access

Promotion Requirements may inspect:

- current balances;
- lifetime totals;
- progression counters exposed by the Resource System.

Promotion must never maintain duplicate Resource values.

---

## Resource Transactions

Whenever Promotion requests a Resource change:

```text
Promotion
        ↓
Resource Transaction
        ↓
Resource System
        ↓
Committed Balance
```

Promotion records only that the request succeeded.

The Resource System remains the authoritative owner of player Resources.

---

# 19. Integration with Modifier System

Modifier System owns every Gameplay Stat and every Modifier.

Promotion requests Modifier activation.

Promotion never calculates gameplay values.

---

## Promotion Modifiers

Promotion Definitions may reference:

- permanent Modifiers;
- temporary Modifiers;
- Prestige-compatible Modifiers;
- future expansion Modifiers.

Promotion only requests activation.

Modifier System determines:

- registration;
- stacking;
- calculation order;
- derived Gameplay Stats.

---

## Promotion Never Changes Gameplay Stats

The following architecture is prohibited:

```text
Promotion

↓

manual_bugs_per_action += 1
```

Instead:

```text
Promotion

↓

Activate Modifier

↓

Modifier System

↓

Gameplay Stat Updated
```

This rule must never be violated.

---

# 20. Save / Load Rules

Promotion System must support deterministic persistence.

Loading the same save must always restore identical Promotion state.

---

## Saved Data

Promotion persistence should include runtime state only.

Typical runtime data includes:

- Promotion Instance state;
- completion status;
- confirmation state;
- execution progress;
- timestamps;
- history identifiers;
- Prestige iteration;
- pending transaction state if supported.

Static Promotion Definitions must never be duplicated in save files.

---

## Loading Rules

Load order should conceptually follow:

```text
Definitions
        ↓
Promotion Registry
        ↓
Promotion Instances
        ↓
State Validation
        ↓
History
        ↓
Pending Evaluation
```

Promotion availability should be re-evaluated after all gameplay systems finish restoring their state.

---

## Interrupted Execution

If a save occurs before Promotion Commit:

the implementation must restore the Promotion to a deterministic state.

Recommended behavior:

- restore the last committed state;
- discard incomplete execution;
- re-evaluate availability.

No partially executed Promotion may survive loading.

---

## Save Compatibility

Future Promotion fields should be optional whenever possible.

Missing fields should resolve to documented defaults.

Migration must preserve completed Promotions.

---

# 21. Prestige Rules

Promotion System must remain compatible with future Prestige architecture.

Prestige behavior must be data-driven.

---

## Repeatability

Each Promotion Definition specifies its repeat policy.

Examples:

- never repeat;
- repeat after Prestige;
- repeat every Career Cycle;
- future custom policies.

Promotion Service processes every policy generically.

---

## Reset Behavior

Promotion Definitions should declare reset behavior rather than relying on hardcoded logic.

Possible behaviors include:

- Preserve Completed
- Reset to Hidden
- Reset to Visible
- Reset to Available
- Archive Only

Behavior belongs to content.

---

## Lifetime History

Promotion History should distinguish between:

- current cycle;
- lifetime history.

Prestige resets gameplay.

It should not necessarily erase historical records.

---

## Future Compatibility

The architecture must support:

- multiple Prestige systems;
- partial resets;
- permanent Promotions;
- Prestige-exclusive Promotions;
- expansion-specific reset behavior.

No architectural changes should be required.

---

# 22. UI Integration Rules

Promotion System exposes gameplay state.

UI presents it.

UI never owns Promotion logic.

---

## UI Responsibilities

UI may display:

- Promotion visibility;
- requirements;
- progress;
- confirmation dialog;
- completion state;
- history;
- rewards;
- locked information permitted by Unlock System.

UI must never evaluate Promotion Requirements independently.

---

## Player Intent

Promotion confirmation is a player intent.

The flow is:

```text
Player Clicks Promote
        ↓
Promotion Service
        ↓
Validation
        ↓
Execution
```

The UI does not bypass Promotion validation.

---

## Progress Presentation

Promotion progress shown in UI must originate from Promotion Service.

Duplicated calculations inside UI are prohibited.

---

## Future Presentation

Promotion architecture intentionally supports:

- animations;
- ceremonies;
- tutorials;
- cinematic transitions;
- staged presentations.

Presentation timing must never affect gameplay state.

---

# 23. Debug Rules

Promotion debugging is considered an architectural requirement.

Every Promotion must be fully inspectable.

---

## Promotion Inspection

Developer tools should expose every Promotion Instance.

Minimum inspection fields:

| Field | Description |
|---------|-------------|
| Promotion ID | Stable identifier |
| Current State | Runtime state |
| Source Career Stage | Origin |
| Destination Career Stage | Target |
| Visibility | Current visibility |
| Availability | Current evaluation result |
| Confirmation State | Waiting / Confirmed |
| Repeat Policy | Lifetime behavior |
| Prestige Iteration | Current cycle |
| Last Evaluation Time | Simulation timestamp |

---

## Requirement Inspection

Every Requirement should expose:

- current evaluation result;
- dependent system;
- failure reason;
- cached state if applicable.

This greatly simplifies balancing and QA verification.

---

## Transaction Inspection

Promotion Transactions should expose:

- transaction identifier;
- execution phase;
- current status;
- rollback status;
- participating systems;
- execution timestamps.

---

## History Inspection

Promotion History should expose:

- completed Promotion;
- Career transition;
- execution time;
- transaction identifier;
- Prestige iteration.

Historical records should remain immutable.

---

# 24. Extension Architecture

Promotion System must support future project growth without architectural modification.

The implementation should scale through new data, not new engine logic.

---

## Supported Future Extensions

The architecture must support:

- additional Career Stages;
- new professions;
- alternative careers;
- branching promotions;
- company ownership;
- executive careers;
- Prestige paths;
- DLC;
- expansion content.

All should reuse the same Promotion workflow.

---

## Multiple Promotion Tracks

Future content may introduce multiple Promotion tracks.

Example:

```text
Senior QA

        ├── Automation Specialist

        ├── QA Lead

        └── Performance Specialist
```

Promotion Service remains generic.

Definitions determine available paths.

---

## Expansion Safety

Future gameplay systems may attach additional behavior to Promotion Events.

Promotion System itself should not require modification.

---

# 25. Data-Driven Rules

Promotion content must be defined through data.

Implementation provides reusable services.

Content provides specific Promotions.

---

## Engine vs Content

Engine owns:

- evaluation;
- state machine;
- transactions;
- persistence;
- rollback;
- history;
- events.

Content owns:

- Career transitions;
- requirements;
- rewards;
- consequences;
- visibility;
- repeat behavior.

---

## Hardcoding Rules

The following must never be hardcoded:

- Promotion identifiers;
- Career transitions;
- requirements;
- rewards;
- branching logic;
- Prestige behavior.

Only the generic execution engine belongs in code.

---
# 26. Implementation Contract for Codex

The following rules are mandatory for every implementation of the Promotion System.

Any implementation violating these rules is considered architecturally incorrect, even if gameplay appears to function.

---

## Ownership Rules

Promotion System owns only:

- Promotion Definitions;
- Promotion Registry;
- Promotion Instances;
- Promotion evaluation;
- Promotion state machine;
- confirmation workflow;
- execution orchestration;
- transaction coordination;
- history;
- persistence;
- debugging.

Promotion System must never become the owner of:

- Career data;
- Unlock state;
- Resource balances;
- Upgrade ownership;
- Gameplay Stats;
- UI logic;
- tutorials;
- balance.

---

## Integration Rules

Promotion interacts with other gameplay systems exclusively through their documented public interfaces.

Direct mutation of another system's internal runtime state is prohibited.

Example:

Allowed:

```text
Promotion
        ↓
Career Service
        ↓
Activate Career Stage
```

Forbidden:

```text
Promotion
        ↓
career.currentStage = middle
```

---

## Transaction Rules

Every Promotion execution must be transactional.

Implementation must guarantee:

- deterministic validation;
- exclusive execution lock;
- ordered execution;
- successful commit;
- rollback before commit if execution fails.

Partial execution is prohibited.

---

## Evaluation Rules

Promotion evaluation must remain deterministic.

Given identical game state:

- visibility;
- availability;
- requirements;
- state transitions;

must always produce identical results.

Evaluation must never depend on:

- rendering;
- UI timing;
- animation completion;
- asynchronous presentation;
- frame rate.

---

## State Machine Rules

Promotion state transitions must always pass through legal states.

Illegal transitions must fail loudly during development.

Automatic correction is prohibited.

---

## Event Rules

Promotion Events are notifications.

They must never become the primary implementation mechanism for gameplay ownership.

Promotion emits events after successful Commit.

Receiving systems remain responsible for validating and executing their own behavior.

---

## Registry Rules

Every Promotion must exist inside the Promotion Registry.

Implementations must never construct hidden Promotion definitions dynamically during gameplay.

Dynamic runtime content should register deterministic Definitions before gameplay begins.

---

## Save Rules

Promotion save data contains runtime state only.

Promotion Definitions remain part of content.

Save files must remain resilient to:

- new Promotion fields;
- future Promotion Definitions;
- Prestige additions;
- DLC content;
- optional metadata.

---

## Performance Rules

Promotion evaluation should scale with content.

Implementations may use:

- caches;
- dependency tracking;
- incremental evaluation.

Optimizations must never change gameplay behavior.

Correctness always has priority over performance.

---

## Testing Rules

Promotion implementation should support automated verification of:

- requirement evaluation;
- legal state transitions;
- transaction execution;
- rollback behavior;
- Save / Load restoration;
- Prestige resets;
- branching Promotion paths;
- history generation.

The architecture should encourage isolated testing without requiring UI.

---

# 27. Acceptance Criteria

The Promotion System is considered complete when all of the following conditions are satisfied.

---

## Architecture

- Every Promotion is registered through the Promotion Registry.
- Promotion Definitions contain no runtime player state.
- Promotion Instances contain no duplicated definition data.
- Promotion execution is coordinated through the Promotion Service.
- Promotion architecture is completely data-driven.

---

## State Machine

- Every Promotion follows the documented lifecycle.
- Illegal state transitions are rejected.
- Explicit player confirmation is required before execution.
- Promotion execution always passes through the Executing state.

---

## Requirements

- Promotion Requirements are evaluated read-only.
- Requirement evaluation is deterministic.
- Requirements support grouped conditions.
- Availability updates automatically when dependent state changes.

---

## Transactions

- Promotion execution is transactional.
- Exclusive execution locking exists.
- Commit occurs only after successful execution.
- Partial completion cannot occur.
- Rollback is supported before Commit.

---

## Integration

- Career transitions are delegated to Career System.
- Unlock changes are delegated to Unlock System.
- Gameplay Stat changes are delegated to Modifier System.
- Resource operations are delegated to Resource System.
- Upgrade ownership remains owned by Upgrade System.

No ownership violations exist.

---

## Persistence

- Promotion runtime state survives Save / Load.
- Promotion History is restored correctly.
- Completed Promotions remain deterministic after loading.
- Interrupted execution cannot corrupt save data.

---

## Debugging

- Every Promotion is inspectable.
- Requirement evaluation is inspectable.
- Promotion Transactions are inspectable.
- Promotion History is inspectable.

---

## Extensibility

The architecture supports without modification:

- additional Career Stages;
- alternative professions;
- branching Career paths;
- multiple Promotion Tracks;
- Prestige;
- expansion content;
- DLC.

New Promotions can be added entirely through data.

---

# 28. Out of Scope

The Promotion System intentionally does **not** define:

- Career hierarchy;
- specific Promotion content;
- promotion balancing;
- exact requirement values;
- reward amounts;
- UI layouts;
- animations;
- tutorials;
- localization;
- narrative;
- company mechanics;
- reputation mechanics;
- team management;
- automation;
- contracts;
- achievements;
- statistics.

Those systems may integrate with Promotion, but they remain responsible for their own architecture.

---

# Remaining Notes

No architectural blocking issues were identified based on the current frozen documentation.

The existing documents establish clear ownership boundaries between:

- Career System;
- Unlock System;
- Upgrade System;
- Resource System;
- Modifier System;
- Promotion System.

These boundaries are sufficient to implement the Promotion System without introducing circular ownership or undocumented responsibilities.

Future documents should continue to preserve these boundaries.

---

# Future Compatibility Questions

The following items are **not blockers** for implementation planning, but should be explicitly confirmed once their respective systems are designed.

1. Will some future Promotion Tracks become permanently mutually exclusive?

2. Will Prestige introduce Promotions that permanently persist across every cycle?

3. Will Expansion Content be allowed to inject Promotion Definitions at runtime (for example through DLC registries), or must every Promotion be registered during application startup?

All three questions are fully supported by the current architecture and only affect future content definitions rather than the Promotion engine.

---

# Codex Review Checklist

## Architectural Integrity

- [ ] Promotion owns orchestration only.
- [ ] Career ownership remains inside Career System.
- [ ] Unlock ownership remains inside Unlock System.
- [ ] Resource ownership remains inside Resource System.
- [ ] Modifier ownership remains inside Modifier System.
- [ ] Upgrade ownership remains inside Upgrade System.

---

## Runtime Behavior

- [ ] Promotion evaluation is deterministic.
- [ ] State Machine follows documented transitions.
- [ ] Explicit confirmation is required.
- [ ] Transaction pipeline follows documented execution order.
- [ ] Commit and rollback behavior are correctly implemented.

---

## Persistence

- [ ] Save / Load restores Promotion Instances correctly.
- [ ] Promotion Definitions remain external to save files.
- [ ] History survives loading.
- [ ] Prestige compatibility is preserved.

---

## Scalability

- [ ] New Promotions require only data.
- [ ] Alternative Career Tracks require only data.
- [ ] Multiple Promotion Tracks require only data.
- [ ] Future professions require only data.
- [ ] Expansion Content requires no engine modification.

---

## Debug Support

- [ ] Promotion inspection is available.
- [ ] Requirement inspection is available.
- [ ] Transaction inspection is available.
- [ ] Promotion History inspection is available.

---

## Documentation Compliance

- [ ] Promotion System remains the Single Source of Truth for all Promotion behavior.
- [ ] No duplicated ownership exists.
- [ ] No hardcoded Promotion content exists.
- [ ] All integrations follow documented ownership boundaries.
- [ ] Implementation matches every architectural rule defined in this document.

---
