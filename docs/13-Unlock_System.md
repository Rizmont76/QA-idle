# 13 - Unlock System

## Document Status

**Project:** QA Idle  
**Document Type:** Unlock System Architecture  
**Owner Role:** Lead Systems Designer / Lead Technical Game Designer / Software Architect / Product Designer  
**Status:** Frozen v1.0  
**Depends On:**

- 00 - Master Project Roadmap.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08-MVP_Vertical_Slice_Specification.md
- 09 - Modifier System.md
- 10 - Economy Framework.md
- 11 - Resource System.md
- 12 - Upgrade System.md

This document defines the complete Unlock System architecture used throughout QA Idle.

It establishes how content becomes hidden, teased, visible, available, unlocked, completed, preserved, reset and extended across the entire game.

After approval, this document becomes the Single Source of Truth for all unlock behavior in QA Idle.

## Playable Idle MVP Addendum

The Technical Vertical Slice unlock behavior remains historically correct: the
Promote action is revealed when Junior to Middle promotion requirements are met,
and future systems remain inactive.

The Playable Idle MVP adds a first post-promotion unlock sequence:

```text
Manual loop active
        -> some manual upgrades purchased
        -> Junior QA Assistant teased
        -> Middle QA promotion completed
        -> Junior QA Assistant active
        -> Junior QA Assistant producer upgrades visible
        -> Assistant Support Upgrades staged through Middle QA
        -> first producer milestone completed
```

The Assistant teaser may communicate that help or support is coming, but it must
not expose full Team management, Automation, auto-reporting, future resources or
future UI panels.

Auto-reporting may be teased as a future system only after the player has seen
manual reporting and passive Bugs Found accumulation. No teaser may activate
automatic reporting during MVP.

The three optional Assistant Support Upgrades should be revealed in stages during
the Middle QA phase rather than all appearing immediately. A simultaneous reveal
is allowed only if the balance simulation later proves that staged reveal harms
the intended purchase decisions.

Exact Support Upgrade unlock levels, thresholds or prerequisite conditions are
`TBD` and owned by `15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`. Unlock
System owns the visibility states, reveal lifecycle and teaser boundaries only.

This document owns unlock lifecycle, visibility state and teaser boundaries.
Junior QA Assistant runtime behavior is owned by `06-Game_Systems.md`.
Promotion execution is owned by `14-Promotion_System.md`. MVP acceptance is owned
by `08-MVP_Vertical_Slice_Specification.md`.

This document intentionally does **not** define:

- concrete unlock content;
- balance values;
- specific unlock requirements;
- concrete career transitions;
- specific upgrade trees;
- UI layouts;
- tutorial scripts;
- progression trees.

Those responsibilities belong to future content, progression, promotion, system-specific and UI documents.

---

# 1. Purpose

The Unlock System exists to provide one universal architecture for controlling access to gameplay content.

QA Idle is built around discovery. The player should not see the whole game immediately. New mechanics, resources, panels, upgrade groups, actions, tutorials and career responsibilities appear gradually as the player's role expands.

The Unlock System guarantees that this discovery is:

- deterministic;
- modular;
- data-driven;
- save-safe;
- scalable;
- debuggable;
- compatible with prestige;
- reusable by every future gameplay system.

The Unlock System must support the project's core identity:

```text
Player Progress
        ↓
Unlock New Responsibility
        ↓
Reveal New Gameplay Layer
        ↓
Expand UI and Decisions
        ↓
Create New Goals
```

The system must scale from the MVP's first basic unlocks to future late-game content such as Team, Automation, Contracts, Office, Company, Prestige, planet-scale systems, expansion content and DLC.

The Unlock System does **not** own gameplay systems.

Instead:

- Resource System owns resource balances and resource transactions.
- Upgrade System owns upgrade definitions, ownership and purchase behavior.
- Modifier System owns gameplay stat calculation.
- Promotion System owns promotion logic and career transitions.
- UI owns presentation.
- System-specific documents own concrete content.
- Unlock System owns access state, requirement evaluation and unlock lifecycle.

---

# 2. Unlock Philosophy

Unlocks are not only gates.

An unlock is a controlled discovery moment.

In QA Idle, opening new content should communicate that the player's responsibilities have grown. The player should feel:

> "My role changed, so the game changed."

Unlocks should support five design goals.

## 2.1 Discovery

The player should frequently wonder what comes next.

Future mechanics should not be fully exposed too early. The system must support hidden content, limited teasing, visible locked content and full reveal.

## 2.2 Clarity

When content becomes visible, the player should understand why it matters and what is needed to access it.

Unlock rules may hide unknown future systems, but visible content should avoid confusion.

## 2.3 Progression Rhythm

Unlocks must support the progression rhythm defined by the project:

```text
Discovery
        ↓
Learning
        ↓
Optimization
        ↓
Mastery
        ↓
Anticipation
        ↓
Major Unlock
```

Unlocks should not flood the player with too many systems at once.

## 2.4 Modular Growth

Every gameplay system should register its own Unlock Definitions.

The Unlock System must not contain hardcoded conditions for specific systems such as Team, Automation, Office, Company or Prestige.

## 2.5 UI as Gameplay

Unlocking content may reveal UI panels, buttons, tabs, dashboards, indicators or tutorial prompts.

The UI should grow together with the player's career, but UI must never own unlock logic.

---

# 3. Core Definitions

## Unlock

An Unlock is a standardized gameplay object that controls access to content.

An Unlock may control access to:

- Gameplay Systems;
- Gameplay Features;
- UI Panels;
- Resources;
- Upgrade Groups;
- Upgrade Trees;
- Gameplay Actions;
- Career Stages;
- Tutorials;
- Content Packs;
- Prestige Content;
- Future DLC or Expansion content.

An Unlock does not implement the content it opens.

It only answers:

> "What is the player's current access state for this content?"

## Unlock Definition

An Unlock Definition is the immutable static content record describing an unlock.

It defines:

- stable identity;
- ownership;
- category;
- controlled target;
- requirements;
- dependencies;
- visibility rules;
- lifetime rules;
- persistence rules;
- event behavior;
- UI metadata;
- debugging metadata.

Definitions are content data.

They must not contain runtime player state.

## Unlock Instance

An Unlock Instance is the runtime state of a specific Unlock Definition inside a player's save.

It records:

- current state;
- previous state;
- visibility state;
- completion state;
- activation history;
- timestamps or simulation times;
- runtime counters if explicitly required;
- prestige/reset behavior outcomes.

Most unlocks have one instance per definition per save.

Repeatable unlocks may create deterministic repeat instances according to the definition's repeat policy.

## Unlock Registry

The Unlock Registry is the authoritative catalog of all Unlock Definitions known to the game.

Every Unlock Definition must be registered before it can be evaluated, shown, saved, restored, referenced by dependencies or used by another system.

## Unlock Service

The Unlock Service is the runtime orchestration layer responsible for evaluating and changing unlock state.

It owns:

- unlock evaluation;
- state transitions;
- transaction creation;
- event dispatching;
- cache invalidation;
- rollback support;
- save/load restoration;
- debug inspection.

The Unlock Service processes definitions generically. It must not contain system-specific content logic.

## Unlock State

Unlock State is the player's current access status for a registered unlock.

Core states are defined in section 14.

## Unlock Visibility

Unlock Visibility determines how much information about an unlock is exposed to the player.

Visibility is separate from access.

Example:

```text
Visible Locked
```

means the player can see the content exists but cannot use it yet.

## Unlock Requirement

An Unlock Requirement is a data-driven condition that must be satisfied for an unlock state transition to occur.

Requirements may reference other systems through approved read-only interfaces.

## Unlock Dependency

An Unlock Dependency is a relationship between unlocks.

Example:

```text
Unlock B cannot become available until Unlock A is unlocked or completed.
```

Dependencies control ordering. Requirements control conditions.

## Unlock Transaction

An Unlock Transaction is a validated state transition applied to one or more Unlock Instances.

Transactions are the only approved way to mutate unlock runtime state.

## Unlock Event

An Unlock Event is emitted after an unlock transaction is committed.

Events notify other systems that access state changed.

---

# 4. Unlock Lifecycle

Every unlock follows the same general lifecycle.

```text
Registered
        ↓
Validated
        ↓
Hidden
        ↓
Teased
        ↓
Visible Locked
        ↓
Available
        ↓
Unlock Pending
        ↓
Unlocked
        ↓
Completed
        ↓
Reset / Preserved / Archived
```

Not every unlock uses every state.

The lifecycle is universal, but individual definitions may skip states according to documented rules.

## 4.1 Registered

The Unlock Definition exists in the Unlock Registry.

It is known to the game but may not be visible, active or evaluated for UI presentation yet.

## 4.2 Validated

The Unlock Registry validates the definition before gameplay begins.

Invalid unlock definitions must fail loudly during development.

## 4.3 Hidden

The player has no visible information about the content.

Hidden content must not appear in UI, tutorials, resource displays or upgrade screens unless explicitly allowed by teaser rules.

## 4.4 Teased

The content may be hinted at without fully revealing details.

Teasing may appear through:

- vague promotion previews;
- flavor text;
- locked silhouettes;
- narrative hints;
- limited UI labels;
- future goal hints.

Teasing must not expose complex future systems too early.

## 4.5 Visible Locked

The content is visible but cannot yet be accessed.

The UI may show:

- name;
- short description;
- partial requirements;
- locked state;
- progress toward known requirements.

Unknown or future-facing requirements may remain hidden.

## 4.6 Available

All availability requirements are satisfied.

The content can now be unlocked automatically or through explicit player confirmation depending on its activation mode.

## 4.7 Unlock Pending

The unlock is ready but waiting for a required confirmation, animation, tutorial step, ceremony or system-specific acknowledgement.

This state exists so important unlocks are not consumed silently.

Promotions and major system reveals should usually use player confirmation.

## 4.8 Unlocked

The content is accessible.

The owning system may now activate its feature, UI, action, resource, upgrade group or gameplay module.

## 4.9 Completed

The unlock has fulfilled its full purpose.

Completion is optional and definition-dependent.

Examples:

- a tutorial unlock becomes completed after the tutorial is viewed;
- a chain step becomes completed after its reward is claimed;
- a one-time content gate becomes completed after the content is permanently activated.

## 4.10 Reset / Preserved / Archived

During prestige, save migration, content removal or special resets, unlocks may be:

- reset to an earlier state;
- preserved permanently;
- archived for historical tracking;
- disabled if their owning content no longer exists.

Reset behavior must be defined by the Unlock Definition.

---

# 5. Unlock Architecture

The Unlock System is an access-control and discovery orchestration layer.

```text
System-Specific Content
        ↓
Unlock Definitions
        ↓
Unlock Registry
        ↓
Unlock Service
        ↓
Requirement Evaluation
        ↓
Unlock Transactions
        ↓
Unlock Events
        ↓
Owning Systems / UI / Save State
```

## 5.1 Responsibilities Owned by Unlock System

The Unlock System owns:

- Unlock Definition schema;
- Unlock Registry;
- Unlock Instance state;
- state machine rules;
- visibility evaluation;
- availability evaluation;
- dependency evaluation;
- generic requirement evaluation;
- unlock transactions;
- unlock events;
- unlock persistence;
- unlock reset behavior;
- unlock debugging;
- unlock graph validation;
- cache invalidation.

## 5.2 Responsibilities Not Owned by Unlock System

The Unlock System does not own:

- resource balances;
- upgrade ownership;
- modifier calculation;
- promotion completion logic;
- gameplay production;
- economy balance;
- UI layout;
- tutorial copy;
- content design;
- system-specific behavior.

## 5.3 Dependency Ownership Rule

The Unlock System may evaluate dependencies across systems, but it never owns those systems.

Examples:

```text
Resource System owns Money.
Unlock System may read Money balance through approved query interfaces.
```

```text
Upgrade System owns upgrade ownership.
Unlock System may read whether an upgrade is owned.
```

```text
Promotion System owns career stage transitions.
Unlock System may react to Promotion Completed events.
```

This prevents Unlock System from becoming a hidden God object.

---

# 6. Unlock Registry

The Unlock Registry is the authoritative source of all Unlock Definitions.

No gameplay system may create unlock definitions dynamically during normal gameplay unless that behavior is explicitly documented for generated content packs.

## 6.1 Registry Responsibilities

The registry must:

- store all Unlock Definitions by stable ID;
- expose definitions for evaluation;
- validate definitions at startup;
- reject duplicate IDs;
- reject missing required fields;
- detect missing references;
- detect circular dependencies;
- validate requirement schemas;
- validate group and chain membership;
- validate controlled target references where possible;
- provide debug metadata.

## 6.2 Stable ID Rules

Every unlock must have a stable internal ID.

Rules:

- IDs must be unique.
- IDs must not be renamed after release.
- IDs must use a consistent naming convention.
- IDs must not contain player-facing text.
- Save files store IDs, not display names.

Example format:

```text
unlock.manual_testing.basic_actions
unlock.upgrades.manual_testing_group
unlock.ui.bug_reporting_panel
unlock.promotion.middle_qa_available
```

The exact naming convention may be implementation-specific, but stability is mandatory.

## 6.3 Registry Validation

Before gameplay begins, the registry must validate:

- duplicate unlock IDs;
- invalid categories;
- invalid lifecycle settings;
- invalid activation modes;
- missing controlled targets;
- missing dependency references;
- circular dependency graphs;
- invalid requirement references;
- invalid reward/effect channel references;
- invalid group membership;
- invalid chain ordering;
- orphan unlocks that are never reachable unless intentionally marked as developer-only or future content;
- prestige behavior contradictions;
- missing save migration rules for renamed or removed unlocks.

Validation errors should block development builds.

Production builds should fail safely and log clear diagnostics.

---

# 7. Unlock Definitions

An Unlock Definition should contain enough data for the Unlock System to evaluate and manage it without hardcoded logic.

Required fields:

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier. |
| `ownerSystem` | System that owns the content being unlocked. |
| `category` | Unlock category. |
| `targetType` | Type of content controlled by the unlock. |
| `targetId` | Stable identifier of controlled content, if applicable. |
| `lifetime` | One-time, repeatable, temporary, prestige, permanent, etc. |
| `activationMode` | Automatic or player-confirmed. |
| `initialState` | Starting state for a new save. |
| `visibilityRules` | Rules for Hidden / Teased / Visible states. |
| `requirements` | Conditions for availability or unlock. |
| `dependencies` | Required unlock ordering. |
| `persistence` | Save/load behavior. |
| `prestigeBehavior` | Reset/preserve/archive behavior. |
| `eventPolicy` | Events emitted on state changes. |
| `uiMetadata` | Presentation metadata without layout ownership. |
| `debugMetadata` | Developer-facing description and tags. |

Optional fields:

| Field | Purpose |
|---|---|
| `groupId` | Unlock Group membership. |
| `chainId` | Unlock Chain membership. |
| `sortOrder` | Stable ordering for UI lists. |
| `teaserMetadata` | Limited information for teased state. |
| `repeatPolicy` | Rules for repeatable unlocks. |
| `expirationRules` | Rules for temporary unlocks. |
| `featureFlagId` | Feature flag activated by this unlock. |
| `migrationPolicy` | Save compatibility instructions. |

Definitions must be declarative.

They should describe what the Unlock System needs to know, not execute gameplay logic.

## 7.1 Unlock Definition IDs vs UI Surface IDs

`id` identifies the Unlock Definition.

`targetId` identifies the content controlled by that Unlock Definition.

When `targetType` is a UI surface, `targetId` must reference a UI Surface ID owned by the UI layer. The Unlock Definition ID and UI Surface ID may look similar, but they are separate namespaces and must not be treated as interchangeable.

Example:

```text
Unlock Definition ID: unlock.ui.bug_reporting_panel
targetType: ui_surface
UI Surface ID targetId: ui.bug_reporting_panel
```

Save data stores Unlock Instance state by Unlock Definition ID. UI visibility code consumes UI Surface IDs after querying Unlock state through the Unlock System.

---

# 8. Unlock Categories

Unlock Categories classify the purpose of an unlock.

Every unlock must declare exactly one primary category.

| Category | Purpose |
|---|---|
| Gameplay System | Opens a major gameplay system. |
| Gameplay Feature | Opens a feature inside an existing system. |
| UI Panel | Reveals interface surface. |
| Resource | Makes a resource visible or usable. |
| Upgrade Group | Reveals or enables a group of upgrades. |
| Upgrade Tree | Reveals or enables a structured upgrade tree. |
| Gameplay Action | Enables a player action. |
| Career Stage | Controls access to career-stage content. |
| Tutorial | Controls onboarding or explanation content. |
| Prestige Content | Controls meta-progression content. |
| Content Pack | Controls future expansion or DLC content. |
| Developer / Debug | Used only for testing and tooling. |

Categories are metadata and validation aids.

They do not create hardcoded behavior.

The Unlock System should process all categories through the same lifecycle and evaluation pipeline.

---

# 9. Unlock Groups

An Unlock Group is a collection of related unlocks presented or evaluated together.

Examples of possible group ownership:

- a UI panel and its child actions;
- an upgrade group and its upgrades;
- tutorial steps;
- expansion pack content;
- prestige unlock cluster.

Groups do not replace dependencies.

Groups answer:

> "Which unlocks belong together?"

Dependencies answer:

> "Which unlocks must happen before another?"

## 9.1 Group Rules

- A group must have a stable ID.
- A group may define ordering metadata.
- A group may define shared visibility behavior.
- A group may define group-level completion rules.
- A group must not create hidden system-specific logic.
- A group may contain unlocks from multiple categories only when explicitly intended.

## 9.2 Group Completion

Group completion may be calculated from members.

Supported policies:

| Policy | Meaning |
|---|---|
| All Completed | Group completes when all member unlocks are completed. |
| Any Completed | Group completes when any member unlock is completed. |
| Required Members | Group completes when selected required members complete. |
| Manual Completion | Owning system explicitly marks group complete through Unlock Service. |

Group completion must be deterministic.

---

# 10. Unlock Chains

An Unlock Chain is an ordered sequence of unlocks.

Chains are used when content should open step by step.

Examples:

```text
Tease Automation
        ↓
Reveal Automation Panel
        ↓
Enable First Automation Action
        ↓
Unlock Automation Upgrade Group
```

The Unlock System must support chains without knowing what Automation is.

## 10.1 Chain Rules

- A chain must have a stable ID.
- Chain steps must have deterministic order.
- Chain steps may still use normal requirements.
- A chain may branch only if represented as a graph or multiple linked chains.
- Chain validation must detect impossible ordering.

## 10.2 Chain Progression

A chain step may become available when:

- previous required step is unlocked;
- previous required step is completed;
- its own requirements are satisfied;
- group or graph policy allows it.

The definition must specify which rule applies.

---

# 11. Unlock Dependencies

Unlock Dependencies define relationships between unlocks.

A dependency may require another unlock to be:

- visible;
- available;
- unlocked;
- completed;
- preserved after prestige;
- active in the current run.

## 11.1 Dependency Types

| Type | Meaning |
|---|---|
| Requires Visible | Another unlock must be visible. |
| Requires Available | Another unlock must be available. |
| Requires Unlocked | Another unlock must be unlocked. |
| Requires Completed | Another unlock must be completed. |
| Blocks Until Reset | Unlock cannot progress until another unlock is reset or inactive. |
| Mutually Exclusive | Only one unlock in a set may be active. |
| Soft Dependency | Used for sorting, hints or UI grouping, not gating. |

## 11.2 Dependency Rules

- Dependencies must reference registered unlock IDs.
- Dependencies must be evaluated before requirements when they determine reachability.
- Circular dependencies are invalid unless explicitly marked as non-gating soft dependencies.
- Mutually exclusive dependencies must define deterministic conflict resolution.
- Dependencies must not read unrelated system state directly.

---

# 12. Unlock Requirements

Unlock Requirements are data-driven conditions used by the Unlock Service.

Requirements should be generic and composable.

## 12.1 Requirement Types

The system must support the following requirement types.

| Requirement Type | Reads From | Example Meaning |
|---|---|---|
| Resource Balance | Resource System | Player has enough Money. |
| Resource Lifetime Counter | Statistics / Resource-derived progression data | Player has earned enough total Money. |
| Upgrade Ownership | Upgrade System | Player owns a specific upgrade. |
| Upgrade Level | Upgrade System | Upgrade reached required level. |
| Modifier Presence | Modifier System | A specific modifier instance or source exists. |
| Gameplay Stat Threshold | Modifier System / derived stats | A calculated stat reached a threshold. |
| Unlock State | Unlock System | Another unlock is unlocked or completed. |
| Promotion State | Promotion System | A promotion is available or completed. |
| Career Stage | Career / Promotion System | Current career stage matches requirement. |
| Feature Flag | Feature Flag Service / owning system | Feature is enabled. |
| Tutorial State | Tutorial System | Tutorial step completed. |
| Save Version / Migration | Save System | Save supports a content version. |
| Custom Interface | Approved requirement provider | System-specific requirement exposed through generic interface. |

The Unlock System may evaluate these requirements only through approved read-only query interfaces.

It must not directly inspect private state.

## 12.2 Composite Requirements

Requirements must support composite logic.

Supported operators:

| Operator | Meaning |
|---|---|
| AND | All child requirements must pass. |
| OR | At least one child requirement must pass. |
| NOT | Child requirement must not pass. |
| COUNT | A minimum number of child requirements must pass. |
| GROUP | Named wrapper for nested requirement structure. |

Nested groups are allowed.

Composite requirements must be deterministic and serializable.

## 12.3 Requirement Visibility

Not all requirements should be shown to the player.

Each requirement may define visibility:

| Visibility | Meaning |
|---|---|
| Hidden | Never shown. |
| Teased | Shown vaguely. |
| Partial | Shows progress without full detail. |
| Full | Shows exact requirement. |
| Revealed After Failure | Shown only after player attempts action. |

Requirement visibility must not affect evaluation.

## 12.4 Requirement Result

Every requirement evaluation should produce a structured result:

```text
requirementId
passed
currentValue
requiredValue
visibility
failureReason
sourceSystem
lastEvaluatedAt
```

This supports UI, debugging and player-facing progress explanations.

---

# 13. Unlock Evaluation Pipeline

Unlock evaluation determines whether unlock state should change.

Evaluation must be deterministic.

The same save state, definitions and simulation time must always produce the same result.

## 13.1 Evaluation Order

For each evaluated unlock, the pipeline should follow this order:

1. Confirm Unlock Definition exists.
2. Confirm Unlock Instance exists or create default instance.
3. Check if owning content is enabled for this build/content pack.
4. Check lifetime state and expiration.
5. Check dependency reachability.
6. Evaluate visibility rules.
7. Evaluate availability requirements.
8. Determine target state transition.
9. Validate transition against state machine.
10. Create Unlock Transaction if state changes.
11. Commit transaction.
12. Emit Unlock Events.
13. Invalidate affected caches.
14. Publish derived state for UI.

## 13.2 Evaluation Triggers

Unlock evaluation should not rely on constant blind polling when avoidable.

Evaluation should be triggered by meaningful changes:

- resource balance changed;
- resource lifetime counter changed;
- upgrade purchased;
- upgrade level changed;
- modifier added, removed or expired;
- gameplay stat changed in a way relevant to unlocks;
- promotion became available;
- promotion completed;
- career stage changed;
- tutorial completed;
- feature flag changed;
- prestige started;
- prestige completed;
- save loaded;
- content pack enabled;
- developer force refresh;
- manual player action requiring validation.

The implementation may still perform periodic safety evaluation, but event-driven invalidation should be preferred.

## 13.3 Evaluation Scope

The Unlock Service should avoid reevaluating every unlock on every change if the registry can determine affected unlocks.

Definitions should expose requirement dependencies so the system can build an evaluation index.

Example:

```text
Resource Changed: money
        ↓
Evaluate unlocks that depend on money
```

## 13.4 Caching

Caching is allowed but must never change the authoritative result.

Caches may store:

- last requirement results;
- derived UI state;
- dependency graph reachability;
- affected unlock indexes;
- visible unlock lists.

Caches must be invalidated when relevant source state changes.

Caches must be reconstructable after Save / Load.

Authoritative unlock state must remain in Unlock Instances, not cache data.

## 13.5 Deterministic Evaluation Rules

- Evaluation order must be stable.
- IDs must be sorted consistently when processing multiple unlocks.
- Simultaneous unlocks must resolve in deterministic order.
- Randomness is not allowed inside unlock evaluation.
- Real time must not affect evaluation except through approved simulation time or saved timestamps.
- UI state must not affect evaluation.

---

# 14. Unlock States

Unlock States describe access.

The following states are approved.

| State | Meaning |
|---|---|
| Registered | Definition exists but runtime state may not yet be initialized. |
| Hidden | Player does not know the content exists. |
| Teased | Player receives limited hint. |
| Visible Locked | Player sees content but cannot use it. |
| Available | Requirements are met; content can be unlocked. |
| Pending Confirmation | Waiting for player confirmation or unlock ceremony. |
| Unlocked | Content is accessible. |
| Completed | Unlock fulfilled its purpose. |
| Temporarily Disabled | Previously unlocked but currently inactive due to lifetime, event, prestige or content pack state. |
| Reset | Returned to earlier state through reset or prestige. |
| Preserved | Kept across reset/prestige. |
| Archived | Historical state retained but no longer active. |

## 14.1 State Transition Rules

Valid forward transitions:

```text
Hidden → Teased
Hidden → Visible Locked
Hidden → Available
Teased → Visible Locked
Teased → Available
Visible Locked → Available
Available → Pending Confirmation
Available → Unlocked
Pending Confirmation → Unlocked
Unlocked → Completed
```

Valid reset transitions:

```text
Unlocked → Reset
Completed → Reset
Unlocked → Temporarily Disabled
Completed → Archived
Any Active State → Preserved
```

Invalid transitions must be rejected and logged.

Examples of invalid transitions:

- Completed → Hidden without reset policy;
- Archived → Unlocked without migration policy;
- Hidden → Completed without documented forced completion;
- Reset → Completed without reevaluation.

## 14.2 Automatic vs Player-Confirmed Unlocks

Unlocks may activate automatically or require player confirmation.

### Automatic Unlocks

Used for small, low-drama content.

Examples:

- minor UI helper;
- small feature availability;
- background flag;
- tutorial eligibility.

### Player-Confirmed Unlocks

Used for meaningful moments.

Examples:

- promotions;
- major gameplay systems;
- major UI panels;
- prestige actions;
- content pack introductions;
- irreversible choices.

Player-confirmed unlocks use Pending Confirmation before Unlocked.

---

# 15. Unlock Visibility

Visibility defines what the player can see.

Visibility is not the same as state.

A content item may be unlocked but not currently visible if the UI context is hidden. Conversely, a content item may be visible while still locked.

## 15.1 Visibility Levels

| Visibility Level | Player Experience |
|---|---|
| Hidden | No UI presence. |
| Teased | Vague hint or partial preview. |
| Locked Visible | Clearly visible but inaccessible. |
| Available Visible | Player can act to unlock or use it. |
| Unlocked Visible | Fully usable and explainable. |
| Completed Visible | Shown as completed, claimed or learned. |
| Debug Visible | Shown only in developer tools. |

## 15.2 Visibility Rules

- Hidden future systems must not leak through resource lists, upgrade lists or UI tabs.
- Teased content must reveal only approved metadata.
- Visible locked content must avoid showing unknown future complexity too early.
- UI may request derived visibility state, but may not calculate it.
- Requirement visibility must be controlled by definitions.
- Debug visibility must never affect player-facing visibility.

## 15.3 Teaser Rules

Teasers should be used carefully.

Allowed teaser content:

- vague name;
- silhouette;
- broad category;
- narrative hint;
- partial requirement;
- promotion anticipation text.

Disallowed teaser content unless explicitly approved:

- exact late-game formulas;
- undiscovered resources;
- full future system tutorials;
- hidden upgrade trees;
- UI panels for systems the player cannot understand yet.

---

# 16. Unlock Events

Unlock Events notify other systems that access state changed.

Events must be emitted after transactions are committed.

## 16.1 Required Events

The Unlock System should support at minimum:

| Event | When Emitted |
|---|---|
| `UnlockTeased` | State changes to Teased. |
| `UnlockVisible` | State changes to Visible Locked. |
| `UnlockAvailable` | Requirements become satisfied. |
| `UnlockPendingConfirmation` | Unlock awaits player confirmation. |
| `UnlockConfirmed` | Player confirms a pending unlock. |
| `UnlockCompleted` | Unlock reaches Completed. |
| `UnlockReset` | Unlock is reset. |
| `UnlockPreserved` | Unlock is preserved through reset/prestige. |
| `UnlockArchived` | Unlock becomes archived. |
| `UnlockDisabled` | Unlock becomes temporarily inactive. |
| `UnlockRestored` | Unlock restored during Save / Load. |

## 16.2 Event Payload

Every event should include:

```text
unlockId
previousState
newState
visibilityState
originatingSystem
reason
simulationTime
transactionId
isPlayerConfirmed
isAutomatic
```

Events should not include large definition copies.

Systems receiving events may query the registry if they need metadata.

## 16.3 Event Rules

- Events are notifications, not authority.
- Events must not be emitted before the state transition is committed.
- Event order must be deterministic.
- Systems must tolerate duplicate-safe restoration after Save / Load.
- Events must not directly mutate unrelated systems without approved handling.

---

# 17. Unlock Transactions

Unlock Transactions are the only approved way to change Unlock Instance state.

They provide traceability, rollback support and debugging.

## 17.1 Transaction Fields

Each transaction should contain:

```text
transactionId
unlockId
previousState
newState
previousVisibility
newVisibility
originatingSystem
reason
requirementResults
simulationTime
realTimestampOptional
wasAutomatic
wasPlayerConfirmed
rollbackPolicy
```

## 17.2 Transaction Types

Supported transaction types:

| Type | Meaning |
|---|---|
| Visibility Change | Hidden / Teased / Visible transition. |
| Availability Change | Requirements became satisfied or unsatisfied. |
| Confirmation | Player confirmed pending unlock. |
| Unlock Activation | Content became unlocked. |
| Completion | Unlock became completed. |
| Reset | Unlock reset through prestige or system reset. |
| Preservation | Unlock preserved through reset. |
| Archive | Unlock archived. |
| Disable / Enable | Temporary content activity changed. |
| Restore | State restored from save. |
| Migration | State changed due to save migration. |
| Developer Override | Debug-only forced transition. |

## 17.3 Rollback

Rollback may be needed when a transaction commits but a dependent operation fails.

Example:

```text
Unlock becomes Unlocked
        ↓
Owning feature fails activation validation
        ↓
Unlock transaction rolls back or moves to Temporarily Disabled
```

Rollback rules:

- Rollback must be deterministic.
- Rollback must restore previous state and visibility.
- Rollback must emit a diagnostic event.
- Rollback must not refund or alter resources unless explicitly paired with Resource Transactions.
- Rollback must not silently hide data corruption.

---

# 18. Integration with Resource System

The Unlock System may read Resource state and observe Resource Transactions.

It must not own Resource balances.

## 18.1 Approved Interactions

The Unlock System may:

- read current resource balances;
- read lifetime progression counters exposed by approved systems;
- react to resource transaction events;
- evaluate resource-based requirements;
- control visibility of resources through resource unlock IDs;
- emit unlock events that resource UI may react to.

The Unlock System must not:

- add resources;
- spend resources;
- convert resources;
- clamp balances;
- define resource lifetime categories;
- override Resource Registry behavior.

## 18.2 Resource Visibility

Resources may reference an Unlock ID controlling their visibility.

When the associated unlock is Hidden, the resource should not appear in normal UI.

When Teased, the resource may appear only through approved teaser metadata.

When Unlocked, the resource may be displayed according to Resource System rules.

## 18.3 Resource Requirement Evaluation

Resource requirements must use Resource System query APIs.

Example:

```text
Requirement:
resource_balance >= X

Unlock System reads:
ResourceSystem.getBalance(resourceId)
```

The Unlock System does not decide how that balance was produced.

---

# 19. Integration with Upgrade System

The Unlock System and Upgrade System are closely connected but separate.

Upgrade System owns upgrades.

Unlock System owns access to upgrades, upgrade groups and upgrade trees.

## 19.1 Approved Interactions

The Unlock System may:

- control visibility of upgrade groups;
- control visibility of upgrade trees;
- evaluate upgrade ownership requirements;
- evaluate upgrade level requirements;
- react to Upgrade Purchased events;
- provide derived unlock state to upgrade UI;
- receive unlock flags triggered by upgrade effects.

The Unlock System must not:

- purchase upgrades;
- define upgrade costs;
- apply upgrade effects;
- create modifiers from upgrades;
- own upgrade levels;
- own upgrade availability rules except unlock access rules.

## 19.2 Upgrade Unlock Effects

An Upgrade Effect may request an unlock state change through the Unlock Service.

Example:

```text
Upgrade Purchased
        ↓
Upgrade Effect requests Unlock Service
        ↓
Unlock Feature X becomes Visible or Unlocked
```

The Upgrade System does not mutate unlock state directly.

It requests a validated Unlock Transaction.

## 19.3 Avoiding Responsibility Overlap

Upgrade availability and Unlock availability are different.

- Unlock availability determines whether content may be accessed.
- Upgrade purchase availability determines whether a visible upgrade may be bought.

A visible upgrade can be locked by Unlock System and unaffordable by Upgrade System at the same time.

UI must display these causes clearly when needed.

---

# 20. Integration with Modifier System

The Unlock System may use Modifier System data for requirements and may unlock content that creates modifiers through other systems.

It must not calculate gameplay stats.

## 20.1 Approved Interactions

The Unlock System may:

- evaluate requirements based on registered Gameplay Stats;
- evaluate whether a modifier from an approved source exists;
- react to modifier add/remove/expire events;
- unlock features that allow other systems to create modifiers.

The Unlock System must not:

- create modifiers directly unless a definition explicitly uses a generic unlock reward channel approved by Modifier System;
- calculate final gameplay values;
- define modifier stacking;
- define modifier lifetime;
- alter modifier registry state directly.

## 20.2 Gameplay Stat Requirements

If an unlock depends on a Gameplay Stat threshold, the Unlock System must read the final derived value from Modifier System's calculation service.

Example:

```text
manual_bugs_per_action >= X
```

The Unlock System must not recalculate this value itself.

---

# 21. Save / Load Rules

Unlock state must be save-safe.

The player should never lose unlocked content due to reload unless reset behavior explicitly says so.

## 21.1 Saved Data

Save files should store Unlock Instances, not full Unlock Definitions.

Saved instance data should include:

```text
unlockId
currentState
visibilityState
isCompleted
activationCount
lastChangedSimulationTime
completedSimulationTime
runtimeExpirationData
prestigePreservationState
version
```

## 21.2 Not Saved

Save files should not store:

- full definition data;
- cached evaluation results;
- derived UI lists;
- temporary debug-only state;
- requirement descriptions that can be reconstructed.

## 21.3 Load Process

On load, the Unlock System should:

1. Load Unlock Definitions from registry.
2. Load saved Unlock Instances.
3. Create default instances for new definitions missing from old saves.
4. Validate saved states against current definitions.
5. Apply migration rules if needed.
6. Restore temporary unlock expiration state.
7. Rebuild caches.
8. Reevaluate unlocks affected by loaded state.
9. Emit restoration events only when needed by systems.
10. Publish derived UI state.

## 21.4 Missing Definitions

If a save references an unlock ID that no longer exists, the system must not crash.

Allowed handling:

- archive unknown unlock state;
- migrate to a replacement unlock ID;
- ignore if marked obsolete;
- log diagnostic warning.

Silent deletion is not allowed unless explicitly covered by migration policy.

## 21.5 New Definitions in Old Saves

When a new unlock definition appears in an old save:

- create default instance;
- evaluate initial visibility and availability;
- do not auto-complete unless migration policy says so;
- preserve deterministic behavior.

---

# 22. Prestige Rules

The Unlock System must support prestige and other reset flows.

Prestige can reset gameplay progress while preserving selected meta-progression unlocks.

## 22.1 Prestige Behavior Types

Each unlock must define prestige behavior.

| Behavior | Meaning |
|---|---|
| Reset | Return to initial state after prestige. |
| Preserve | Keep current unlock state. |
| Preserve Completion | Keep completed state but reset active runtime state. |
| Archive | Move current run state to history. |
| Convert | Convert to another unlock or meta-unlock through documented policy. |
| Disable Until Reearned | Keep historical ownership but disable in current run. |
| Clear Temporary | Remove temporary unlock state. |

## 22.2 Prestige Unlocks

Prestige content may be controlled by unlocks like any other content.

Prestige unlocks may:

- reveal meta-progression UI;
- enable prestige currency visibility;
- unlock permanent bonuses;
- unlock accelerated future progression;
- unlock prestige tutorials.

The Unlock System does not decide prestige rewards.

Prestige System owns reward logic.

## 22.3 Prestige Reset Order

During prestige, unlock handling should follow a deterministic order:

1. Prestige System begins reset.
2. Systems freeze player actions.
3. Unlock Service evaluates prestige behavior for all unlocks.
4. Unlock Transactions are created for reset/preserve/archive actions.
5. Resource System applies resource prestige behavior.
6. Upgrade System applies upgrade prestige behavior.
7. Modifier System removes or preserves modifiers according to owners.
8. Unlock caches are rebuilt.
9. Preserved and newly available prestige unlocks are reevaluated.
10. UI receives updated derived state.

Exact global reset ordering must be confirmed by the future Prestige System document, but Unlock System must be compatible with this pattern.

---

# 23. Integration with Promotion System

Promotion System owns promotions and career transitions.

Unlock System supports promotion-related content access.

## 23.1 Approved Interactions

The Unlock System may:

- evaluate requirements based on promotion state;
- make promotion-related UI visible;
- unlock content after promotion completion;
- receive Promotion Available and Promotion Completed events;
- expose pending confirmation unlock state for major promotion reveals.

The Unlock System must not:

- decide promotion requirements;
- change current career stage directly;
- grant promotion rewards directly;
- own promotion ceremony logic;
- define specific career transitions.

## 23.2 Promotion-Driven Unlock Flow

Typical flow:

```text
Promotion Requirements Met
        ↓
Promotion System marks promotion available
        ↓
Unlock System may reveal promotion UI / next content teaser
        ↓
Player confirms promotion
        ↓
Promotion System completes career transition
        ↓
Unlock System evaluates unlocks depending on completed promotion
        ↓
New content becomes available or pending confirmation
```

This keeps promotion authority separate from unlock access control.

---

# 24. UI Integration Rules

UI displays unlock state. UI does not calculate unlock state.

## 24.1 UI May Request

UI may request:

- visible unlock list;
- unlock state by ID;
- requirement display data;
- progress toward visible requirements;
- teaser metadata;
- available actions;
- pending confirmations;
- completed unlocks;
- debug data in developer mode.

## 24.2 UI Must Not

UI must not:

- evaluate requirements;
- mutate unlock state directly;
- reveal hidden unlocks accidentally;
- infer future systems from registry data;
- decide whether a content item is unlocked;
- bypass player confirmation.

## 24.3 UI Presentation Rules

- Hidden unlocks are not shown.
- Teased unlocks show only teaser metadata.
- Visible locked unlocks may show known requirements.
- Available unlocks should communicate the next player action clearly.
- Pending confirmation unlocks should be prominent.
- Completed unlocks should be visually distinct when relevant.
- Debug-only unlocks must never appear in player-facing UI.

## 24.4 Unlock Notifications

Unlock notifications should be driven by Unlock Events.

Major unlocks may trigger:

- modal confirmation;
- celebration;
- tutorial prompt;
- UI panel introduction;
- new goal highlight.

Minor unlocks may use subtle notification or no notification.

Notification intensity should be defined by UI metadata, not hardcoded UI assumptions.

---

# 25. Debug Rules

Unlock debugging is an architectural requirement.

The Unlock System must provide enough information to diagnose why content is or is not accessible.

## 25.1 Unlock Inspector

Developer tools should allow inspection of every registered unlock.

At minimum, the inspector should show:

| Field | Description |
|---|---|
| Unlock ID | Stable internal identifier. |
| Owner System | System that owns target content. |
| Category | Unlock category. |
| Target | Controlled target type and ID. |
| Current State | Runtime state. |
| Visibility | Player-facing visibility. |
| Requirements | Current pass/fail result. |
| Dependencies | Current dependency result. |
| Lifetime | One-time, repeatable, temporary, etc. |
| Prestige Behavior | Reset / preserve / archive rule. |
| Last Transaction | Most recent state change. |
| Source Events | Events that triggered last evaluation. |

## 25.2 Requirement Debugging

Each requirement should expose:

- requirement ID;
- requirement type;
- source system;
- current value;
- required value;
- pass/fail;
- visibility mode;
- last evaluated time;
- failure reason.

## 25.3 Transaction History

Unlock transaction history should be available for recent state changes.

It may be capped for performance.

Each entry should include:

- transaction ID;
- unlock ID;
- previous state;
- new state;
- reason;
- originating system;
- simulation time;
- requirement snapshot;
- rollback status.

## 25.4 Debug Actions

Developer-only tools may support:

- force reveal;
- force unlock;
- force complete;
- reset unlock;
- reevaluate unlock;
- simulate dependency event;
- inspect graph path;
- export unlock state.

Debug actions must be clearly separated from normal gameplay and must not ship as player-facing cheats unless intentionally designed.

---

# 26. Extension Architecture

Any future gameplay system should integrate with Unlock System by registering definitions and exposing approved read-only requirement providers.

The Unlock System must not be edited every time a new system is added.

## 26.1 Adding a New System

A new system must provide:

1. Its own system-specific content definitions.
2. Unlock Definitions for content access.
3. Optional requirement provider interface if unlocks need to read system state.
4. Event emissions for meaningful state changes.
5. UI integration using derived unlock state.
6. Save/load compatibility for its own state.

## 26.2 No Hardcoded System Conditions

The Unlock System must never contain logic like:

```text
if system == Automation
if unlock is Team
if Office is unlocked
if Company level is high enough
```

Instead, all logic must be expressed through:

- Unlock Definitions;
- Requirement Types;
- Requirement Providers;
- Dependencies;
- Events;
- Feature Flags;
- UI metadata.

## 26.3 Custom Requirement Providers

Some future systems may need custom requirements.

They may expose a provider interface such as:

```text
RequirementProvider.evaluate(requirementDefinition, playerStateContext)
```

Rules:

- provider must be registered;
- provider must be deterministic;
- provider must be read-only;
- provider must return structured result;
- provider must not mutate unlock state;
- provider must not depend on UI;
- provider must declare invalidation events.

---

# 27. Data-Driven Rules

Unlock content should be data-driven whenever practical.

Code provides reusable engines.

Data defines specific unlocks.

## 27.1 Data Requirements

Unlock Definitions should be serializable and validatable.

They may exist as:

- static code data;
- JSON-like content data;
- generated build-time content;
- expansion content packs.

Runtime gameplay should not require editing Unlock Service code for each unlock.

## 27.2 Data Validation

All unlock data must pass validation before gameplay.

Invalid data must identify:

- unlock ID;
- field path;
- invalid value;
- expected rule;
- owning system.

## 27.3 Content Pack Support

Future content packs may introduce unlocks.

Content pack unlocks must:

- use stable namespaced IDs;
- declare pack ownership;
- avoid ID collisions;
- declare dependency on base-game unlocks if needed;
- define behavior when the pack is disabled;
- preserve or archive save state safely.

## 27.4 Feature Flag Integration

Unlocks may activate feature flags.

Feature flags may control:

- Gameplay Feature;
- UI Feature;
- Simulation Feature;
- Input Action;
- Content Package;
- Tutorial Availability.

Feature flags must not replace unlock state.

Unlock state answers access. Feature flags help systems activate behavior.

---

# 28. Implementation Contract for Codex

Codex must implement Unlock System according to the following contract.

## 28.1 Required Core Components

Implementation should include:

- Unlock Definition model;
- Unlock Instance model;
- Unlock Registry;
- Unlock Service;
- Requirement Evaluator;
- Dependency Graph Validator;
- Unlock Transaction model;
- Unlock Event dispatcher integration;
- Save / Load serialization;
- UI-facing derived state API;
- Debug inspection utilities.

## 28.2 Required Public Operations

The Unlock System should expose operations equivalent to:

```text
registerUnlockDefinition(definition)
validateRegistry()
getUnlockState(unlockId)
getVisibleUnlocks(context)
evaluateUnlock(unlockId, reason)
evaluateAffectedUnlocks(changeEvent)
confirmUnlock(unlockId)
completeUnlock(unlockId, reason)
resetUnlock(unlockId, reason)
applyPrestigeBehavior(context)
serializeUnlockState()
restoreUnlockState(saveData)
getUnlockDebugInfo(unlockId)
```

Exact method names may differ by implementation language, but responsibilities must exist.

## 28.3 Required Safety Rules

- No direct state mutation outside Unlock Transactions.
- No UI-owned unlock logic.
- No system-specific hardcoding.
- No hidden future content leaks.
- No random evaluation.
- No frame-rate-dependent unlock behavior.
- No save-breaking rename without migration.
- No circular hard dependencies.

## 28.4 MVP Implementation Scope

For the MVP Vertical Slice, Unlock System must support at minimum:

- registered unlock definitions;
- hidden and visible states;
- visible locked and available states;
- player-confirmed unlocks;
- automatic unlocks;
- resource-based requirements;
- upgrade ownership requirements;
- promotion availability/completion dependency hooks;
- save/load persistence;
- debug inspection;
- deterministic evaluation.

MVP may defer advanced content packs and complex prestige behavior, but the architecture must not block them.

---

# 29. Acceptance Criteria

The Unlock System is acceptable when all criteria below are true.

## 29.1 Architecture

- Unlocks are registered through data definitions.
- Runtime state is stored separately from definitions.
- Unlock Service owns state transitions.
- Unlock Transactions are used for state mutation.
- Unlock Events are emitted after committed changes.
- The system is deterministic.
- The system is modular and extensible.
- The system contains no hardcoded Team / Automation / Office / Company / Prestige logic.

## 29.2 Integration

- Resource requirements read Resource System state through approved interfaces.
- Upgrade requirements read Upgrade System state through approved interfaces.
- Modifier requirements read Modifier System derived values through approved interfaces.
- Promotion-related unlocks react to Promotion System events without owning promotions.
- UI displays derived unlock state and does not calculate it.
- Save / Load restores unlock state safely.
- Prestige behavior is definable per unlock.

## 29.3 Gameplay

- Hidden content does not leak to the player.
- Teased content shows only approved metadata.
- Visible locked content communicates known requirements.
- Available content can be unlocked automatically or by confirmation.
- Completed unlocks can be tracked separately from unlocked content.
- Temporary, repeatable, prestige and permanent unlocks are supported by architecture.

## 29.4 Debugging

- Developers can inspect each unlock's state.
- Developers can see failed requirements.
- Developers can see dependency results.
- Developers can see recent unlock transactions.
- Developers can force reevaluation in debug tools.
- Invalid definitions produce clear validation errors.

---

# 30. Out of Scope

This document does not define:

- concrete unlock IDs;
- unlock requirement values;
- career stage requirements;
- promotion formulas;
- upgrade trees;
- specific UI layouts;
- tutorial copy;
- DLC content;
- prestige reward design;
- economy balance;
- achievement content;
- content schedule.

Those must be defined in future documents or system-specific content files.

---

# 31. Implementation Notes

The following notes should be handled carefully during implementation planning.

## 31.1 Promotion System Integration

Unlock System supports promotion integration through the ownership boundaries finalized in `14 - Promotion System.md`.

Mitigation:

- use generic promotion requirement/provider interfaces;
- avoid hardcoding promotion content;
- keep Promotion System authoritative.

## 31.2 Global Event Bus Contract May Need Formalization

Unlock System depends on events from Resource, Upgrade, Modifier, Promotion, Save/Load and Prestige flows.

If the event architecture is not formalized, implementation may invent inconsistent event behavior.

Mitigation:

- follow Technical Rules event-driven architecture;
- keep event payloads minimal and stable;
- document event contracts during implementation.

## 31.3 Feature Flag Ownership Must Stay Clear

Unlocks may activate feature flags, but feature flags must not become a second unlock system.

Mitigation:

- unlock state remains authoritative for access;
- feature flags only help systems activate behavior.

## 31.4 Requirement Providers Can Become Hidden Coupling

Custom requirement providers are powerful but may introduce tight coupling if abused.

Mitigation:

- require deterministic read-only providers;
- require structured results;
- require declared invalidation events;
- reject arbitrary gameplay logic inside Unlock System.

## 31.5 Save Migration Must Be Designed Early

Unlock IDs will become save-critical.

Renaming or removing unlocks without migration can break player saves.

Mitigation:

- stable ID policy;
- archived unknown unlock handling;
- migration policy in definitions.

---

# 32. Implementation Planning Questions

These questions may be reviewed during implementation planning without changing the frozen architecture.

1. Should MVP implement the full Unlock Transaction history, or only the latest transaction per unlock plus debug logs?
2. Should Unlock Definitions live in static TypeScript data first, with JSON migration later, or should external data format be introduced immediately?
3. Should feature flags be implemented as part of Unlock System utilities or as a separate lightweight service?
4. Should requirement providers be registered centrally at startup, or owned by each gameplay module and discovered through module registration?
5. Should player-confirmed unlocks always use Pending Confirmation, or can some major unlocks be confirmed directly by the owning system?
6. Should hidden unlocks be completely absent from UI queries, or returned only to developer-mode UI with debug visibility?
7. Should the MVP include circular dependency validation immediately, or defer graph validation beyond simple missing-reference checks?

None of these questions block the core architecture, but they should be answered before implementation freeze.

---

# 33. Codex Review Checklist

Codex should review this document against the following checklist.

## Architecture

- [ ] Unlock System has one clear responsibility.
- [ ] Unlock System does not duplicate Resource, Upgrade, Modifier or Promotion ownership.
- [ ] Unlock Service is defined as the runtime orchestration layer.
- [ ] Unlock Registry is the authoritative definition catalog.
- [ ] Unlock Instances store runtime state separately from definitions.
- [ ] Unlock Transactions are required for state mutation.
- [ ] Unlock Events are emitted after committed state changes.

## Determinism

- [ ] Evaluation order is deterministic.
- [ ] Simultaneous unlocks resolve predictably.
- [ ] Randomness is not used.
- [ ] UI state does not affect evaluation.
- [ ] Cache data is reconstructable.

## Data-Driven Design

- [ ] Unlocks are defined through data.
- [ ] Requirement logic is generic and composable.
- [ ] Composite requirements are supported.
- [ ] Requirement providers are read-only and deterministic.
- [ ] New systems can register unlock definitions without editing Unlock Service logic.

## Integration

- [ ] Resource System integration is read-only except via events.
- [ ] Upgrade System integration respects upgrade ownership boundaries.
- [ ] Modifier System integration uses derived stat queries only.
- [ ] Promotion System remains authoritative over promotions.
- [ ] UI only displays derived state.
- [ ] Save / Load rules preserve unlock state safely.
- [ ] Prestige behavior is supported per unlock.

## Visibility

- [ ] Hidden content cannot leak.
- [ ] Teased content uses limited metadata.
- [ ] Visible locked content can show known requirements.
- [ ] Pending confirmation is supported.
- [ ] Completed state is separate from Unlocked state.

## Debugging

- [ ] Unlock inspector can show state, requirements and dependencies.
- [ ] Requirement failures are explainable.
- [ ] Transaction history is available.
- [ ] Developer force actions are separated from gameplay.
- [ ] Registry validation catches duplicates, missing references and circular dependencies.

## Scope

- [ ] Document does not define concrete unlocks.
- [ ] Document does not define balance values.
- [ ] Document does not define career transitions.
- [ ] Document does not define UI layouts.
- [ ] Document does not introduce hardcoded future systems.
