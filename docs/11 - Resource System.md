# 11 - Resource System

## Document Status

**Project:** QA Idle

**Document Type:** Resource System Architecture

**Owner Role:** Senior Systems Designer / Lead Technical Game Designer / Software Architect / Economy Architect

**Status:** Frozen v1.0

**Depends On:**

- 00 - Master Project Roadmap.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08 - MVP Vertical Slice Specifica.md
- 09 - Modifier System.md
- 10 - Economy Framework.md

This document defines the complete Resource System architecture used throughout QA Idle.

It establishes the authoritative rules governing every gameplay resource, including registration, storage, transactions, persistence, visibility and interaction with gameplay systems.

This document intentionally does **not** define:

- economy balance;
- resource prices;
- production formulas;
- upgrade effects;
- gameplay statistics;
- modifier calculations;
- progression numbers.

Those responsibilities belong to their respective documents.

This document defines **how Resources exist, behave and are managed** inside the game.

After approval, this document becomes the Single Source of Truth for every Resource implemented in QA Idle.

---

# 1. Purpose

The Resource System provides a unified architecture for every stored gameplay value owned by the player.

While the Economy Framework defines **how value flows**, and the Modifier System defines **how gameplay values are calculated**, the Resource System defines **where gameplay value is stored and how it moves safely between gameplay systems**.

Every gameplay system that creates or consumes persistent value must interact with the Resource System.

The Resource System exists to guarantee:

- deterministic resource handling;
- centralized ownership;
- safe gameplay transactions;
- consistent Save / Load behavior;
- Prestige compatibility;
- UI consistency;
- debugging support;
- future scalability.

It is the only approved layer responsible for managing player-owned Resources.

---

# 2. Resource System Philosophy

Resources are the shared language of gameplay systems.

Gameplay systems should exchange Resources instead of directly modifying each other's internal state.

```text
Gameplay System
        ↓
Resource Transaction
        ↓
Resource System
        ↓
Updated Resource State
        ↓
Gameplay Events
        ↓
Interested Systems
```

This architecture intentionally minimizes coupling.

Manual Testing does not know how Upgrades work.

Bug Reporting does not know how Promotions work.

Promotion does not know how Contracts work.

They all communicate through Resources and Events.

The Resource System therefore becomes one of the central architectural pillars of QA Idle.

---

# 3. Core Definitions

## Resource

A Resource is a persistent gameplay value representing something the player owns, accumulates, spends or progresses toward.

Examples include:

- Bugs Found
- Money
- Reputation
- Company Reputation
- Prestige Currency

Resources represent **player state**.

They are stored by the Resource System.

---

## Resource Definition

A Resource Definition is the immutable description of a Resource.

It defines:

- identity;
- category;
- lifetime behavior;
- persistence rules;
- presentation metadata;
- validation rules.

Definitions are static content.

They should not contain runtime state.

---

## Resource Instance

The runtime value stored for a Resource.

Example:

```text
Money

Definition
↓

money

Current Value

1,250
```

Only the Resource System owns Resource Instances.

Gameplay systems may never create independent copies.

---

## Resource Balance

The authoritative stored amount of a Resource.

Every gameplay query asking

> "How much Money does the player currently have?"

must ultimately read the Resource Balance.

---

## Resource Transaction

A validated state transition applied to one or more Resources.

Examples:

- gaining Bugs;
- spending Money;
- converting Bugs into Money;
- prestige reset;
- reward collection.

Transactions are the only approved way to modify Resource Balances.

---

# 3.1 Resource Production Ownership

The Resource System never decides why economic value is created.

It only validates and applies Resource Transactions requested by owning gameplay systems.

Examples:

- Manual Testing decides that Bugs Found should be added.
- Bug Reporting decides that Bugs Found should be converted into Money.
- Upgrades decide that Money should be spent.

The Resource System records and applies those changes, but it does not create gameplay value by itself.

Progression counters, statistics and achievements may observe Resource Transactions, but their meaning is owned by their respective systems.

This prevents hidden economic behavior inside the Resource System.

---

# 4. Resource vs Gameplay Stat

Resources and Gameplay Stats intentionally represent different concepts.

Confusing them creates architectural defects.

| Resource | Gameplay Stat |
|----------|---------------|
| Stored player state | Calculated gameplay value |
| Persistent | Derived |
| Owned by Resource System | Owned by Modifier System |
| Can usually be spent | Cannot be spent |
| Saved directly | Recalculated |
| Produced and consumed | Calculated from Modifiers |
| Represents ownership | Represents capability |

Examples:

| Resource | Gameplay Stat |
|----------|---------------|
| Money | Money Per Bug Reported |
| Bugs Found | Manual Bugs Per Action |
| Reputation | Reputation Gain Multiplier |
| Prestige Currency | Prestige Reward Multiplier |

Example:

```text
manual_bugs_per_action

Gameplay Stat

↓

Manual Testing

↓

Produces

↓

Bugs Found

↓

Resource
```

Gameplay Stats answer:

> "How effective am I?"

Resources answer:

> "What do I currently own?"

The following rule is mandatory:

> **Resources must never be implemented as Gameplay Stats, and Gameplay Stats must never be implemented as Resources.**

---

# 5. Resource Registry

Every Resource must exist inside a centralized Resource Registry.

No gameplay system may introduce Resources dynamically.

Every registered Resource should define at least:

| Field | Purpose |
|---------|----------|
| id | Stable internal identifier |
| displayName | Player-facing name |
| description | Gameplay purpose |
| category | Economic domain |
| lifetimeCategory | Disposable / Investment / Progression / Prestige / Temporary |
| unlockId | Unlock controlling visibility |
| initialValue | Starting amount |
| minimumValue | Lower bound |
| maximumValue | Optional upper bound |
| isSpendable | Whether transactions may consume it |
| isPersistent | Whether it is saved |
| resetBehavior | Prestige behavior |
| visibleByDefault | UI visibility |
| format | Display formatting |

Stable IDs must never change after release without migration support.

The Resource Registry is the authoritative source describing every Resource in the game.

---

# 6. Resource State

The Resource System owns all runtime Resource State.

Gameplay systems never own stored balances.

Runtime state consists only of authoritative values.

Example:

```text
money

Current Balance:
275

bugs_found

Current Balance:
31
```

Resource State must never contain gameplay formulas.

It stores values only.

Every mutation must occur through Resource Transactions.

---

# 7. Resource Lifecycle

Every Resource follows the same lifecycle.

```text
Defined
        ↓
Registered
        ↓
Initialized
        ↓
Hidden (optional)
        ↓
Visible
        ↓
Produced
        ↓
Stored
        ↓
Spent (optional)
        ↓
Persisted
        ↓
Reset / Preserved
```

## Registered

The Resource exists in the Registry.

It has a stable identity.

---

## Initialized

The Resource receives its initial value for a new save.

---

## Hidden

The Resource may exist internally before becoming visible to the player.

Hidden Resources must still behave correctly.

---

## Visible

The Unlock System exposes the Resource to the UI.

Visibility never changes Resource behavior.

It only changes presentation.

---

## Produced

Gameplay Systems create Resource Transactions that increase the balance.

---

## Stored

The updated balance becomes the new authoritative state.

---

## Spent

Spendable Resources may decrease through validated transactions.

Non-spendable Resources must reject spend operations.

---

## Persisted

Persistent Resources are written into Save Data.

---

## Reset / Preserved

During Prestige, each Resource follows its documented Reset Behavior.

The Resource System never guesses this behavior.

It always follows the Registry definition.
# 8. Resource Transactions

Resource Transactions are the only approved mechanism for modifying Resource State.

Gameplay Systems never directly change Resource Balances.

Instead, they request the Resource System to execute a transaction.

```text
Gameplay System
        ↓
Create Transaction Request
        ↓
Resource System Validation
        ↓
Apply Transaction
        ↓
Update Resource State
        ↓
Emit Resource Events
```

This guarantees:

- deterministic behavior;
- centralized validation;
- debugging support;
- statistics integration;
- Save/Load consistency;
- future telemetry compatibility.

---

## Transaction Types

The Resource System supports several standardized transaction types.

### Add

Increases a Resource.

Example:

```text
Manual Testing
        ↓
+5 Bugs Found
```

---

### Spend

Consumes a spendable Resource.

Example:

```text
Upgrade Purchase
        ↓
-150 Money
```

Attempting to spend a non-spendable Resource must fail validation.

---

### Convert

Consumes one Resource while producing another as part of a single atomic transaction.

Example:

```text
25 Bugs Found
        ↓
Bug Reporting
        ↓
250 Money
```

Both operations must succeed together.

Partial execution is not allowed.

---

### Set

Explicitly replaces the current balance.

This operation should be used only when required by system initialization, migrations, debugging tools or documented reset behavior.

Gameplay systems should rarely use Set during normal gameplay.

---

### Reset

Applies the documented Reset Behavior for a Resource.

Typical use cases:

- Prestige
- New Game
- Debug Reset

---

# Transaction Validation

Every transaction must be validated before execution.

Validation should include:

- Resource exists.
- Operation is allowed.
- Spendable rule is respected.
- Balance will not violate minimum value.
- Balance will not violate maximum value.
- Numeric value is valid.
- Transaction parameters are complete.

Invalid transactions must fail safely.

They must never leave the Resource System in a partially updated state.

---

# Atomicity

Transactions affecting multiple Resources must be atomic.

Either:

- every Resource is updated;

or

- none are updated.

Example:

```text
Report Bugs

Consumes:
25 Bugs

Produces:
250 Money
```

If any validation fails:

- Bugs remain unchanged.
- Money remains unchanged.

No partial state is allowed.

---

# Transaction Metadata

Every transaction should expose metadata useful for debugging and future systems.

Typical metadata includes:

| Field | Purpose |
|---------|----------|
| transactionId | Unique runtime identifier |
| operationType | Add, Spend, Convert, Set, Reset |
| sourceSystem | Manual Testing, Upgrades, Promotion, etc. |
| reason | Human-readable explanation |
| simulationTime | Time of execution |
| changes | Ordered list of Resource balance changes |

This metadata supports:

- Debug UI;
- Statistics;
- Offline summaries;
- Future analytics;
- Save validation.

Each transaction change should contain:

| Field | Purpose |
|---------|----------|
| resourceId | Affected Resource |
| previousValue | Balance before transaction |
| newValue | Balance after transaction |
| delta | Amount changed |

Multi-resource transactions such as Convert must expose every affected Resource inside the same `changes` list.

The order of `changes` must be deterministic and must not depend on collection iteration order.

---

# 9. Resource Operations

Gameplay Systems interact with Resources only through approved operations.

The Resource System should expose a minimal public interface.

Approved operations include:

- Read Balance
- Check Affordability
- Add Resource
- Spend Resource
- Convert Resources
- Set Resource
- Reset Resource
- Query Resource Definition

No other operations should directly modify stored Resource State.

---

## Read Balance

Returns the authoritative current balance.

Read operations never modify state.

---

## Check Affordability

Determines whether a spend operation can succeed.

The result must never reserve Resources.

It only validates current availability.

---

## Add Resource

Creates an Add Transaction.

Validation occurs before application.

---

## Spend Resource

Creates a Spend Transaction.

Failure must leave Resource State unchanged.

---

## Convert Resources

Creates one atomic Convert Transaction.

No intermediate state may become visible.

---

## Set Resource

Restricted operation.

Primarily intended for:

- initialization;
- migrations;
- debugging;
- documented reset behavior.

---

## Reset Resource

Applies the Resource's registered Reset Behavior.

The caller never manually determines how a Resource resets.

---

# 10. Resource Visibility

Visibility is controlled independently from existence.

A Resource may exist internally while remaining invisible to the player.

Visibility is governed by the Unlock System.

The Resource System only exposes visibility metadata.

---

## Hidden Resources

Hidden Resources:

- exist in the Registry;
- may exist in Save Data;
- may accumulate values if documented;
- must not appear in gameplay UI.

Examples include future Reputation or Company Resources before they are unlocked.

---

## Visible Resources

Visible Resources may appear in:

- HUD;
- inventory panels;
- tooltips;
- upgrade costs;
- progression screens;
- statistics.

Visibility should always be consistent across the entire UI.

---

## Visibility Rules

The following rules are mandatory.

A hidden Resource:

- must not suddenly appear because its value changed;
- must not appear in upgrade requirements unless intentionally documented;
- must not leak through debugging UI intended for players.

Developer tools may ignore visibility restrictions.

---

# 11. Save / Load Rules

The Resource System owns persistence of every Resource Balance.

Gameplay Systems must never serialize their own copies of Resource values.

The save file contains one authoritative Resource collection.

Example structure:

```text
resources

money: 250
bugs_found: 31
```

MVP progression counters such as `lifetime_money_earned` and `lifetime_bugs_found` are stored outside the Resource collection unless a future document explicitly registers them as Resources.

Resource IDs are used as save keys.

Player-facing names must never be serialized.

---

## Save Rules

Every persistent Resource must be written exactly once.

Duplicate storage is prohibited.

Derived Gameplay Stats must never be saved as Resources.

They are recalculated after loading through the Modifier System.

---

## Load Rules

During loading:

1. Registry is loaded.
2. Saved Resource values are restored.
3. Missing Resources receive initial values.
4. Invalid Resources are ignored or migrated.
5. Gameplay Systems begin reading Resource Balances.

Gameplay Systems should never repair Resource data themselves.

That responsibility belongs to the Resource System.

---

## Missing Resources

When loading an older save:

- newly added Resources receive default values;
- removed Resources are handled through migrations;
- unknown IDs must not crash loading.

The Resource Registry remains authoritative.
# 12. Prestige / Reset Rules

The Resource System is responsible for executing documented Resource reset behavior during Prestige.

It is **not** responsible for deciding what resets.

Those decisions belong to:

- the Resource Registry;
- the Economy Framework;
- the Prestige System.

The Resource System only applies the registered behavior consistently.

---

## Reset Behaviors

Every Resource must declare one reset behavior.

Typical behaviors include:

| Behavior | Description |
|----------|-------------|
| Reset | Resource returns to its initial value. |
| Preserve | Resource remains unchanged. |
| Archive | Current value is moved into historical statistics before resetting. |
| Custom | Special behavior explicitly documented by the owning system. |

No Resource may have undefined Prestige behavior.

---

## Default MVP Behavior

The MVP Vertical Slice contains the following Resource System Resources.

| Resource | Lifetime Category | Prestige Behavior |
|----------|-------------------|-------------------|
| Bugs Found | Disposable | Reset |
| Money | Investment | Reset |

The MVP also tracks `Lifetime Bugs Found` and `Lifetime Money Earned` as progression counters for promotion requirements.

Those counters are not Resource System Resources in the MVP Vertical Slice.

They may be stored under Career, Promotion or MVP progress state according to **08 - MVP Vertical Slice Specifica.md**.

They may observe Resource Transactions, but they must not be registered as MVP Resources unless a future frozen document explicitly changes that scope.

Future Resources must explicitly define their own reset behavior before implementation.

---

## Prestige Safety Rules

During Prestige:

- Resource IDs never change.
- Resource Definitions remain unchanged.
- Only Resource Balances may change.
- Gameplay Systems must react to updated balances rather than implementing custom reset logic.

This guarantees deterministic Prestige behavior across all systems.

---

# 13. MVP Resource Definitions

The MVP Vertical Slice implements only two Resource System Resources.

No additional Resources may participate in gameplay until approved by future documentation.

---

## Bugs Found

**Purpose**

Represents discovered bugs waiting to be reported.

**Lifetime Category**

Disposable

**Produced By**

- Manual Testing

**Consumed By**

- Bug Reporting

**Spendable**

Yes

**Persistent**

Yes

**Prestige Behavior**

Reset

---

## Money

**Purpose**

Primary investment Resource.

**Lifetime Category**

Investment

**Produced By**

- Bug Reporting

**Consumed By**

- Upgrades

**Spendable**

Yes

**Persistent**

Yes

**Prestige Behavior**

Reset

---

# 13.1 MVP Progression Counters

The MVP Vertical Slice also uses progression counters:

- `Lifetime Bugs Found`
- `Lifetime Money Earned`

These counters are not Resource System Resources in the MVP.

They are progression state used by Promotion and Unlock requirements.

For the MVP, the Statistics System owns these lifetime progression counters through a dedicated Progression Counter store.

The Statistics System owns:

- save data for `lifetime_bugs_found` and `lifetime_money_earned`;
- all counter mutation;
- reset behavior;
- read-only counter queries exposed to Promotion and Unlock systems.

Successful Resource Transactions are the authoritative update source. Counter updates must be derived from the committed transaction changes, not from UI display values or duplicate resource totals.

Counter mutation occurs inside the same committed gameplay transaction that applies the Resource change and before post-commit gameplay events are emitted. If the Resource transaction rolls back or fails validation, no lifetime counter may change.

MVP lifetime progression counters reset only when starting a new save or performing an explicit full save reset. Spending Resources does not reduce them. Future Prestige behavior must be documented before Prestige can reset or preserve these counters differently.

Promotion and Unlock systems must read these values only through a public read interface equivalent to:

```text
ProgressionCounterService.getLifetimeCounter(counterId)
```

The interface returns the committed saved value for the requested counter and does not allow mutation.

The Resource System must not create these counters as gameplay value by itself.

If a future document promotes lifetime counters into registered Resources, that document must define stable IDs, Resource Registry entries, reset behavior, visibility, save ownership and migration behavior.

---

# 14. Resource System Events

The Resource System publishes standardized events whenever Resource State changes.

Gameplay Systems should react to these events rather than polling Resource balances continuously.

The canonical Resource System events are:

| Event ID | Emitted When |
|----------|--------------|
| `resource.changed` | A Resource Transaction successfully changes one or more Resource balances. |
| `resource.spendFailed` | A Spend or Convert transaction fails because required Resources cannot be consumed. |

Add, Spend, Convert, Set and Reset operations all emit `resource.changed` when they succeed.

Convert emits one `resource.changed` event for the whole atomic transaction, not separate unrelated events per Resource.

Legacy names such as `resource_added`, `resource_spent`, `resource_converted` and `resource_reset` must not be used as authoritative Resource System event IDs.

Examples include:

```text
Resource Added

↓

resource_added
```

```text
Resource Spent

↓

resource_spent
```

```text
Resource Converted

↓

resource_converted
```

```text
Resource Reset

↓

resource_reset
```

These events are intentionally generic.

They communicate **what happened**, not **why it happened**.

The originating Gameplay System owns the gameplay context.

---

## Event Payload

Every Resource event should expose enough information for interested systems.

Recommended `resource.changed` payload:

| Field | Purpose |
|---------|----------|
| transactionId | Related transaction |
| operationType | Add, Spend, Convert, Set or Reset |
| sourceSystem | Originating Gameplay System |
| reason | Human-readable explanation |
| simulationTime | Time of execution |
| changes | Ordered list of Resource changes |

Each item in `changes` should contain:

| Field | Purpose |
|---------|----------|
| resourceId | Affected Resource |
| previousValue | Balance before transaction |
| newValue | Balance after transaction |
| delta | Amount changed |

Recommended `resource.spendFailed` payload:

| Field | Purpose |
|---------|----------|
| transactionId | Related transaction |
| operationType | Spend or Convert |
| sourceSystem | Originating Gameplay System |
| reason | Human-readable failure explanation |
| failedResourceIds | Resources that prevented the transaction |
| requiredAmounts | Required amounts where applicable |
| currentBalances | Current balances where applicable |

Additional fields may be added in future without breaking compatibility.

---

## Event Consumers

Typical consumers include:

- Unlock System;
- Promotion System;
- Achievements;
- Statistics;
- Tutorial System;
- UI;
- Debug Tools.

The Resource System should never know why another system listens to these events.

This preserves modular architecture.

---

# 15. UI Integration Rules

The UI must never own Resource logic.

It is a presentation layer only.

All displayed values originate from the Resource System.

---

## Responsibilities of the UI

The UI may:

- display Resource balances;
- display affordability;
- display transaction feedback;
- display formatting;
- display animations.

The UI must not:

- calculate balances;
- predict transaction results;
- maintain duplicate Resource state;
- modify balances directly.

---

## Resource Formatting

Formatting belongs to the presentation layer.

Stored values must remain unaffected.

Different Resources may define different display formats through the Resource Registry.

Examples:

```text
Money

1,250
```

```text
Bugs Found

37
```

Future Resources may use compact notation if required by scale.

---

## Affordability Feedback

The UI may query the Resource System to determine affordability.

The result should be treated as advisory.

Final validation always occurs during transaction execution.

This prevents desynchronization between UI and gameplay logic.

---

## Transaction Feedback

Whenever appropriate, successful transactions should provide immediate visual feedback.

Examples:

- floating numbers;
- updated counters;
- purchase animations;
- resource gain effects.

Presentation details remain outside the scope of this document.

Only the architectural rule is defined.
# 16. Debugging Rules

The Resource System must provide enough information to diagnose gameplay behavior without inspecting gameplay code.

Every Resource should be fully traceable throughout its lifetime.

Debugging support is considered an architectural requirement rather than an optional development feature.

---

## Resource Inspection

Developer tools should allow inspection of every registered Resource.

At minimum, the following information should be available:

| Field | Description |
|---------|-------------|
| Resource ID | Stable internal identifier |
| Display Name | Player-facing name |
| Current Balance | Authoritative stored value |
| Lifetime Category | Disposable, Investment, Progression, Prestige or Temporary |
| Spendable | Yes / No |
| Persistent | Yes / No |
| Reset Behavior | Registered prestige behavior |
| Visibility State | Hidden / Visible |

---

## Transaction History

The Resource System should expose recent transaction history.

Each entry should contain:

- transaction identifier;
- affected Resource;
- operation type;
- amount;
- previous balance;
- resulting balance;
- originating Gameplay System;
- simulation timestamp.

The history primarily exists for:

- debugging;
- QA verification;
- balancing investigations;
- telemetry;
- future analytics.

The implementation may limit the number of stored entries for memory efficiency.

---

## Validation Errors

Invalid Resource operations should fail safely.

Failures should produce meaningful debug information.

Examples include:

- unknown Resource ID;
- insufficient balance;
- attempting to spend a non-spendable Resource;
- violating minimum value;
- violating maximum value;
- invalid numeric value.

The game must never silently ignore invalid Resource operations.

---

## Developer Commands

Developer-only tools may expose operations such as:

- add Resource;
- remove Resource;
- reset Resource;
- inspect Registry;
- inspect transaction history.

These tools must never bypass Resource validation.

Even debug operations should execute through the Resource System.

---

# 17. Data-Driven Content Rules

The Resource System is designed to support a fully data-driven architecture.

Gameplay code should implement generic Resource behavior.

Game content defines which Resources exist.

---

## Registry-Driven Resources

Every Resource should be created from Resource Registry data.

Gameplay systems should reference Resource IDs instead of hardcoded variables.

Example:

```text
Correct

Resource:
money
```

Instead of:

```text
player.money
```

This allows new Resources to be introduced without rewriting gameplay architecture.

---

## Stable IDs

Every Resource must have a permanent internal identifier.

Stable IDs are used by:

- Save Data;
- Unlocks;
- Upgrades;
- Events;
- Achievements;
- Statistics;
- Debug Tools.

Player-facing names may change.

Stable IDs must not.

---

## Extensibility

Future systems should be able to introduce new Resources by:

1. Adding a new Resource Definition.
2. Registering it.
3. Connecting Gameplay Systems through transactions.

The Resource System itself should not require modification.

This minimizes long-term maintenance cost.

---

## Registry Is Authoritative

Whenever Resource metadata is required, the Registry is the only valid source.

Gameplay Systems must not duplicate:

- display names;
- lifetime categories;
- reset behavior;
- persistence rules;
- formatting rules.

Duplicating Resource metadata creates maintenance risk and is prohibited.

---

# 18. Implementation Contract for Codex

The following rules are mandatory.

---

## Resource Ownership

Only the Resource System owns Resource Balances.

Gameplay Systems must never store authoritative copies.

---

## Resource Modification

All Resource changes must occur through validated Resource Transactions.

Direct mutation of Resource State is prohibited.

---

## Gameplay Stats Separation

Gameplay Stats belong exclusively to the Modifier System.

Resources belong exclusively to the Resource System.

Neither system may assume ownership of the other's data.

---

## Registry Usage

Every implemented Resource must exist in the Resource Registry before use.

Unknown Resources are implementation errors.

---

## Save / Load

Resource persistence must occur exclusively through the Resource System.

Gameplay Systems must restore Resource values by reading the Resource System after loading.

---

## UI

The UI must display Resource values without owning gameplay logic.

---

## Prestige

Prestige must apply documented Reset Behavior through the Resource System.

Gameplay Systems must not individually reset Resources.

---

## Atomic Transactions

Transactions involving multiple Resources must either succeed completely or fail completely.

Partial execution is prohibited.

---

## Event Publication

Every successful Resource Transaction must publish the appropriate Resource System Event.

---

## Deterministic Behavior

Given identical input:

- Registry;
- Save Data;
- Transactions;
- Simulation order;

the Resource System must always produce identical Resource State.

---

# 19. Acceptance Criteria

The Resource System is considered production-ready when all of the following are true:

- Every Resource exists in the Resource Registry.
- Gameplay Systems never directly mutate Resource State.
- Every Resource change occurs through Resource Transactions.
- Multi-Resource operations are atomic.
- Resource State is fully persistent.
- Gameplay Stats remain completely separate from Resources.
- Save / Load restores Resource Balances deterministically.
- Prestige applies documented Reset Behavior.
- Hidden Resources remain fully functional while invisible.
- The UI reads Resource values from the Resource System.
- Resource Events are published after successful transactions.
- Developer tools can inspect Resources and transaction history.
- New Resources can be introduced through Registry data without modifying Resource System architecture.

---

# 20. Out of Scope

The following topics are intentionally excluded from this document:

- economy balance;
- production formulas;
- upgrade costs;
- reward values;
- promotion requirements;
- achievement logic;
- statistics implementation;
- offline simulation formulas;
- prestige rewards;
- gameplay balancing;
- UI layouts and visual design.

These responsibilities belong to their respective production documents.

---


# Codex Review Checklist

- [ ] Resources and Gameplay Stats are fully separated.
- [ ] No Gameplay System directly modifies Resource Balances.
- [ ] All Resource mutations use validated transactions.
- [ ] Multi-resource transactions are atomic.
- [ ] Resource Registry is the single source of metadata.
- [ ] Stable Resource IDs are used throughout the project.
- [ ] Save / Load restores Resource State correctly.
- [ ] Prestige applies registered reset behavior only.
- [ ] Hidden Resources remain operational while invisible.
- [ ] Resource Events are emitted after successful transactions.
- [ ] UI consumes Resource data without owning gameplay logic.
- [ ] Debug tools can inspect balances and transaction history.
- [ ] The implementation is fully compatible with Modifier System, Economy Framework, Technical Rules and future gameplay systems.
