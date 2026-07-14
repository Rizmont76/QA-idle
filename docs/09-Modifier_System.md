# 09 - Modifier System

## Document Status

**Project:** QA Idle

**Document Type:** Modifier System Architecture

**Owner Role:** Senior Systems Designer / Lead Technical Game Designer / Software Architect

**Status:** Frozen v1.0

**Depends On:**

- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08-MVP_Vertical_Slice_Specification.md

This document defines the complete Modifier System architecture for QA Idle.

It establishes the only approved mechanism through which gameplay values may be altered.

Modifier System acts as the central calculation layer between gameplay systems and gameplay statistics.

After approval of this document, gameplay systems must never directly modify gameplay values.

Instead, systems create, remove or update Modifiers.

The Modifier System is responsible for deterministic calculation, persistence, debugging, UI explanations and future compatibility with large-scale progression.

## Playable Idle MVP Addendum

The completed Technical Vertical Slice uses additive permanent modifiers only.
That remains historically correct.

The Playable Idle MVP may introduce at most one clearly gated producer milestone
multiplier. Modifier calculation for that MVP must be deterministic:

1. Resolve base gameplay stat values.
2. Apply additive bonuses.
3. Apply approved multiplier bonuses.
4. Apply rounding only at the documented calculation boundary.
5. Return display formatting to the UI layer rather than the Modifier System.

Multiplier scope must be explicit. A producer milestone multiplier may affect
only the Junior QA Assistant passive production path unless another authoritative
document explicitly expands the target.

If multiple multipliers are introduced after MVP, their stacking order and
combination rule must be documented before implementation. Balance values and
validation targets are owned by
`15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`.

This document intentionally does **not** define:

- economy balance;
- gameplay formulas;
- upgrade content;
- event content;
- promotion rewards;
- prestige bonuses.

Instead, it defines the infrastructure through which those systems affect gameplay.

---

# 1. Purpose

The Modifier System exists to solve one architectural problem:

Multiple gameplay systems need to affect the same gameplay values without becoming tightly coupled.

Examples include:

- Upgrades
- Promotions
- Career
- Events
- Prestige
- Offline Bonuses
- Temporary Buffs
- Future Company Systems

Without a unified Modifier System, every gameplay system would require custom logic for applying bonuses.

That approach leads to:

- duplicated formulas;
- hidden dependencies;
- inconsistent calculations;
- save/load problems;
- difficult debugging;
- poor scalability.

The Modifier System replaces all direct gameplay modifications with one standardized architecture.

---

# 2. Core Philosophy

Modifier System is the only layer allowed to change gameplay statistics.

Gameplay systems never change values directly.

Instead they contribute Modifiers.

```text
Gameplay System
        ↓
Creates Modifier
        ↓
Modifier Registry
        ↓
Calculation Service
        ↓
Final Gameplay Value
```

Examples:

```text
Upgrade Purchased
        ↓
Create Modifier
        ↓
manual_bugs_per_action
        ↓
Final Value Updated
```

```text
Promotion Completed
        ↓
Create Modifier
        ↓
report_speed
        ↓
Final Value Updated
```

```text
Limited-Time Event
        ↓
Create Temporary Modifier
        ↓
money_per_bug
        ↓
Expires Automatically
```

Every gameplay system follows exactly the same architecture.

---

# 3. Architectural Responsibilities

The Modifier System owns:

- modifier definitions;
- modifier registration;
- modifier lifetime;
- modifier stacking;
- deterministic calculation;
- calculation order;
- calculation breakdown;
- modifier persistence;
- modifier expiration;
- modifier visibility;
- final derived gameplay values.

The Modifier System does **not** own:

- upgrades;
- promotions;
- resources;
- events;
- prestige;
- gameplay systems;
- UI presentation.

Those systems only create or remove modifiers.

---

# 4. High-Level Architecture

The complete architecture is intentionally separated into independent layers.

```text
Gameplay Systems
        │
        ▼
Modifier Registry
        │
        ▼
Calculation Service
        │
        ▼
Derived Gameplay Stats
        │
        ▼
Gameplay Systems
        │
        ▼
UI
```

Responsibilities:

Gameplay Systems

- create modifiers;
- remove modifiers;
- never calculate final values.

Modifier Registry

- stores active Modifier Instances;
- validates modifiers;
- groups modifiers by target stat.

Calculation Service

- calculates final values;
- applies deterministic order;
- produces calculation breakdown.

Derived Gameplay Stats

- read-only values;
- used by gameplay systems;
- displayed by UI.

---

# 5. Core Terminology

## Modifier

A Modifier is a standardized gameplay object that changes one registered Gameplay Stat.

A Modifier never executes gameplay logic.

It only contributes data used during calculation.

Examples:

- +1 Bugs per Manual Test
- +25% Report Speed
- ×2 Money
- Maximum Team Size +5

---

## Modifier Definition

A Modifier Definition is the static content record describing what a modifier does.

It contains stable design data such as:

- `definitionId`;
- source ownership;
- target Gameplay Stat;
- modifier category;
- value;
- stacking policy;
- default lifetime type;
- visibility.

Modifier Definitions are content data.

They should be loaded from code or data registries and should not be duplicated as full static records in save files unless a migration requires it.

---

## Modifier Instance

A Modifier Instance is the runtime activation of a Modifier Definition.

It contains runtime state such as:

- `instanceId`;
- `definitionId`;
- enabled state;
- remaining duration;
- runtime timestamps;
- optional runtime data.

Permanent one-time modifiers may have one long-lived instance.

Temporary or repeatable modifiers may create multiple instances from the same Definition when their stacking policy allows it.

The Modifier Registry stores active Modifier Instances.

The Calculation Service applies Modifier Definitions together with their active runtime Instances.

---

## Gameplay Stat

A Gameplay Stat is a registered value that may be modified.

Examples:

```text
manual_bugs_per_action

money_per_bug_reported

manual_testing_speed

report_speed

promotion_requirement_multiplier
```

Only registered Gameplay Stats may receive modifiers.

---

## Final Value

Final Value is the deterministic result produced after applying every active Modifier to a Gameplay Stat.

Gameplay systems always consume Final Values.

They never calculate them independently.

---

## Source

Every Modifier has exactly one owner.

Examples:

```text
Upgrade

Promotion

Prestige

Career

Event

Developer Debug
```

The Modifier System never understands gameplay meaning.

It only tracks ownership.

---

# 6. Design Goals

The architecture must satisfy the following goals.

## Single Source of Truth

All gameplay modifications originate from one system.

---

## Deterministic

The same inputs always produce the same outputs.

---

## Modular

Gameplay systems remain independent.

---

## Debuggable

Every final value must explain:

- where it came from;
- which modifiers contributed;
- calculation order.

---

## Save Safe

All modifier state can be restored after Save/Load.

---

## Data Driven

Most modifier definitions should eventually live in content data rather than hardcoded logic.

---

## Big Number Ready

The architecture must remain independent of the numeric implementation.

Changing the numeric backend must not require rewriting modifier logic.

---

# 7. Gameplay Rule

The following rule is mandatory for every future gameplay document.

> **No gameplay system is allowed to directly modify a Gameplay Stat.**

Gameplay systems may only:

- create modifiers;
- remove modifiers;
- enable modifiers;
- disable modifiers;
- query final calculated values.

Violations of this rule create undocumented gameplay behavior and are considered architectural defects.

This rule applies equally to:

- Upgrades;
- Promotions;
- Career;
- Prestige;
- Events;
- Automation;
- Team;
- Offline Progress;
- future gameplay systems.

Modifier System is therefore the authoritative calculation layer for the entire project.
# 8. Gameplay Stats

Gameplay Stats are the only gameplay values that may be modified by the Modifier System.

Gameplay systems must never create ad-hoc modifiable variables.

Every Gameplay Stat must be registered before use.

A Gameplay Stat represents a calculated gameplay property rather than stored player progress.

Examples include:

- Bugs produced per Manual Test
- Money earned per Bug
- Reporting Speed
- Manual Testing Speed
- Team Capacity
- Automation Efficiency
- Promotion Requirement Multiplier

Resources such as Money or Bugs Found are **not** Gameplay Stats.

They are Resources managed by the Resource System.

Gameplay Stats determine *how* resources are produced or consumed.

Resources represent *what* the player owns.

---

# 9. Gameplay Stat Registry

Every Gameplay Stat must exist inside a central registry.

Each registered stat should define at least:

| Field | Purpose |
|---------|----------|
| id | Stable internal identifier |
| displayName | Player-facing name |
| description | Short explanation |
| baseValue | Default value before modifiers |
| category | Manual Testing, Reporting, Team, etc. |
| numericType | Numeric abstraction used internally |
| allowNegative | Whether values below zero are valid |
| minimumValue | Optional lower bound |
| maximumValue | Optional upper bound |
| visible | Whether the stat is visible to players |

Example:

```text
manual_bugs_per_action

Base Value:
1

Category:
Manual Testing

Minimum:
0

Maximum:
Unlimited
```

The registry defines which values may receive Modifiers.

Attempting to modify an unknown Gameplay Stat should be considered an implementation error.

---

# 10. Modifier Definition

Every Modifier follows one standardized structure.

A Modifier is immutable after creation except for its runtime state (enabled, remaining duration, etc.).

A Modifier definition should contain:

| Field | Purpose |
|---------|----------|
| definitionId | Stable unique ID for the static Modifier Definition |
| sourceType | Upgrade, Promotion, Event, etc. |
| sourceId | Stable ID of the owner |
| targetStatId | Gameplay Stat affected |
| modifierType | Flat, Additive, Multiplicative, Override, Minimum or Maximum |
| value | Modifier amount |
| priority | Optional execution priority inside the modifier category |
| stackingPolicy | Stack behavior |
| durationType | Permanent or Temporary |
| visibility | Visible or Hidden |

Runtime Modifier Instances should contain:

| Field | Purpose |
|---------|----------|
| instanceId | Stable runtime ID unique among active Modifier Instances |
| definitionId | Reference to the static Modifier Definition |
| enabled | Whether currently active |
| startedAt | Simulation time when activated, if applicable |
| remainingTime | Runtime state for temporary effects, if applicable |
| customRuntimeData | Optional future extension |

This structure intentionally contains no gameplay logic.

It only describes data.

---

# 10.1 Modifier Identity Rules

Modifier identity must be deterministic.

The system uses two separate identifiers:

| Identifier | Scope | Purpose |
|------------|-------|---------|
| `definitionId` | Static content registry | Identifies what the modifier is. |
| `instanceId` | Active Modifier Registry | Identifies one active runtime instance of a modifier. |

`definitionId` must be stable across versions unless a save migration is provided.

`instanceId` must be stable for the lifetime of an active Modifier Instance and must be saved when the instance itself is saved.

For permanent one-time modifiers, `instanceId` should be derived deterministically from `definitionId` and source ownership when possible.

For temporary or repeatable modifiers, `instanceId` may be generated at creation time, but it must be persisted if the instance survives Save/Load.

No implementation may use array position, registration order or object reference identity as modifier identity.

Modifier Definition IDs must follow one deterministic naming convention:

```text
<sourceType>.<sourceId>.<targetStatId>.<modifierType>
```

If one source grants multiple modifiers with the same target stat and modifier type, append a stable semantic suffix:

```text
<sourceType>.<sourceId>.<targetStatId>.<modifierType>.<suffix>
```

The suffix must come from content data and must not be generated from registration order.

Examples:

```text
upgrade.better_bug_notes.manual_bugs_per_action.flat
promotion.middle_qa.report_speed.multiplicative
event.crunch_week.money_per_bug_reported.additive.temporary_bonus
```

---

# 11. Modifier Categories

Modifier System supports several standardized modifier categories.

Every future modifier must belong to exactly one category.

---

## 11.1 Flat Modifier

Adds or subtracts a fixed value.

Formula:

```text
Final = Base + Flat
```

Example:

```text
Manual Bugs per Action

Base:
1

Upgrade:
+2

Result:
3
```

Typical usage:

- better tools;
- equipment;
- permanent upgrades.

---

## 11.2 Additive Percentage

Adds percentage bonuses together before multiplication.

Formula:

```text
Base × (1 + Sum%)
```

Example:

```text
Base

100

Upgrade A

+20%

Promotion

+10%

Result

130
```

This avoids exponential growth from multiple percentage bonuses.

---

## 11.3 Multiplicative Modifier

Applies after additive percentages.

Formula:

```text
Current × Multiplier
```

Example:

```text
Current

130

Event

×2

Result

260
```

Typical usage:

- temporary events;
- prestige rewards;
- rare gameplay effects.

---

## 11.4 Override Modifier

Completely replaces the calculated value.

Example:

```text
Manual Testing Disabled

Value = 0
```

Override Modifiers should remain extremely rare.

Future documents must explicitly justify their use.

---

## 11.5 Minimum Modifier

Guarantees the final value cannot fall below a limit.

Example:

```text
Minimum Report Speed

1
```

---

## 11.6 Maximum Modifier

Caps the final value.

Example:

```text
Maximum Offline Multiplier

5×
```

Caps exist to preserve balance rather than replace progression.

---

## 11.7 Category Aggregation Rules

Each modifier category has a deterministic aggregation rule.

| Category | Aggregation Rule |
|----------|------------------|
| Flat | Sum all active Flat values. |
| Additive Percentage | Sum all active Additive Percentage values, then apply once. |
| Multiplicative | Apply active Multiplicative values in deterministic priority order. If priority is equal, sort by `definitionId`, then `instanceId`. |
| Minimum | Use the highest active Minimum value. |
| Maximum | Use the lowest active Maximum value. |
| Override | Use the single winning Override value selected by Override resolution rules. |

Minimum and Maximum modifiers apply after Flat, Additive Percentage and Multiplicative modifiers.

If both Minimum and Maximum exist and the resolved Minimum is greater than the resolved Maximum, the Maximum wins and the final value is clamped to the resolved Maximum. This situation should be treated as a balancing/content validation warning.

---

## 11.8 Override Resolution Rules

Override Modifiers are allowed but must remain rare.

If exactly one active Override targets a Gameplay Stat, that Override becomes the final value after Minimum and Maximum checks.

If multiple active Overrides target the same Gameplay Stat, the winning Override is selected deterministically:

1. Highest `priority` wins.
2. If priority is tied, lexicographically lowest `definitionId` wins.
3. If `definitionId` is also tied, lexicographically lowest `instanceId` wins.

Multiple active Overrides on the same Gameplay Stat should produce a validation warning unless the source documents explicitly justify the interaction.

Override resolution must never depend on registration order, save order or event timing.

---

# 12. Deterministic Calculation Order

One of the most important responsibilities of the Modifier System is ensuring that every calculation always produces identical results.

The calculation pipeline is fixed.

It must never depend on:

- registration order;
- save order;
- loading order;
- event timing;
- collection iteration order.

Every Gameplay Stat follows the same calculation pipeline.

```text
Base Value
        ↓
Flat Modifiers
        ↓
Additive Percentages
        ↓
Multiplicative Modifiers
        ↓
Minimum Check
        ↓
Maximum Check
        ↓
Override (if present)
        ↓
Final Value
```

Every gameplay calculation uses this pipeline.

No gameplay system may introduce its own calculation order.

---

# 13. Priority Rules

Most modifiers do not require explicit priority.

However, some future mechanics may.

Priority exists only inside the same modifier category.

Example:

```text
Flat Priority

10

↓

Flat Priority

20

↓

Flat Priority

30
```

Priority never changes the overall pipeline.

It only orders modifiers within one stage.

Future documents should avoid priorities whenever possible.

Simple systems are easier to reason about, debug and balance.

---

# 14. Stacking Rules

Multiple modifiers affecting the same Gameplay Stat do not always behave identically.

Each modifier declares its own Stacking Policy.

Supported policies:

## Stack

Every instance contributes independently.

Example:

```text
+1

+1

+1

=

+3
```

---

## Replace

A new modifier replaces the previous matching instance according to the Stacking Match Key.

Typical use:

- active buffs;
- changing difficulty;
- dynamic company policies.

---

## Refresh

The value remains unchanged.

Only the remaining duration is refreshed.

Typical use:

- temporary boosts;
- event rewards.

---

## Ignore

If a matching modifier instance already exists according to the Stacking Match Key, the new one is discarded.

Useful for one-time global effects.

The chosen Stacking Policy belongs to the Modifier itself rather than to the Gameplay Stat.

---

## 14.1 Stacking Match Key

Stacking policies must use a deterministic match key.

Unless a Modifier Definition explicitly provides a narrower documented match key, the default stacking match key is:

```text
definitionId
sourceType
sourceId
targetStatId
modifierType
```

This key defines whether an incoming Modifier Instance matches an existing active Modifier Instance for Replace, Refresh or Ignore behavior.

Implementations must not use display name, array order, object reference, creation order or UI state as part of stacking comparison.

---

## 14.2 Policy Resolution Rules

When a new Modifier Instance is requested:

| Policy | Resolution |
|--------|------------|
| Stack | Always create a new active Modifier Instance. |
| Replace | Remove or disable the existing matching active instance, then create the new instance. |
| Refresh | Keep the existing matching active instance, preserve its value and Definition, and update only its runtime duration fields. |
| Ignore | If a matching active instance exists, discard the new request. Otherwise create the new instance. |

If more than one existing active instance matches a Replace, Refresh or Ignore request, this is an implementation error unless the source document explicitly defines how multiple matches are allowed.

---

# 15. Modifier Lifetime

Every Modifier exists in exactly one lifetime category.

The lifetime determines how the Modifier is created, updated and removed.

The Modifier System itself owns lifetime management.

Gameplay systems only request creation or removal.

---

## 15.1 Permanent Modifiers

Permanent Modifiers remain active until explicitly removed.

Typical sources include:

- Upgrades
- Promotions
- Career Progression
- Prestige Rewards
- Permanent Achievements

Examples:

```text
Upgrade Purchased
        ↓
Create Permanent Modifier
        ↓
Modifier remains active forever
```

Permanent Modifiers normally persist through Save/Load.

Whether they survive Prestige depends on the documented reset behavior of their source system.

---

## 15.2 Temporary Modifiers

Temporary Modifiers automatically expire.

Typical sources include:

- Events
- Temporary Buffs
- Limited Bonuses
- Future Consumables

Temporary Modifiers should contain additional runtime information.

| Field | Purpose |
|---------|----------|
| startedAt | Simulation time when activated |
| duration | Lifetime in simulation time |
| expiresAt | Optional cached expiration time |
| remainingTime | Derived runtime value |

The Modifier System is responsible for determining expiration.

Gameplay systems must not manually remove expired Modifiers every tick.

---

## 15.3 Expiration Rules

Expired Modifiers should be removed automatically.

The expiration process must be deterministic.

Recommended order:

```text
Simulation Tick
        ↓
Update Temporary Modifiers
        ↓
Remove Expired Modifiers
        ↓
Recalculate Gameplay Stats
        ↓
Publish Updated Values
```

Expired Modifiers should never remain active after their expiration time.

---

# 16. Modifier Ownership

Every Modifier has exactly one owner.

Ownership allows the system to understand why a Modifier exists without understanding gameplay logic.

The Modifier System stores ownership information but never interprets it.

---

## Source Type

Defines which gameplay system created the Modifier.

Examples:

```text
Upgrade

Promotion

Career

Prestige

Event

Automation

Developer Debug
```

---

## Source ID

Identifies the specific gameplay object responsible for the Modifier.

Examples:

```text
upgrade_coffee

promotion_junior_to_middle

event_bug_hunt_week
```

Ownership enables several important operations.

Examples:

- remove all Modifiers from an Event;
- disable all Debug Modifiers;
- restore Promotion bonuses after Save/Load;
- inspect Upgrade effects in Debug Mode.

Without ownership these operations become significantly more complex.

---

# 17. Modifier Registry

The Modifier Registry is the authoritative storage for every active Modifier Instance.

Gameplay systems never keep their own copies of active gameplay bonuses.

Instead, every active Modifier Instance exists in exactly one place.

Responsibilities include:

- storing active Modifier Instances;
- validating Modifier Definitions;
- grouping Modifier Instances by Gameplay Stat;
- enabling and disabling Modifiers;
- removing expired Modifiers;
- exposing Modifier collections to the Calculation Service.

The Registry performs no gameplay calculations.

Its responsibility is storage and organization.

---

# 18. Calculation Service

The Calculation Service converts Base Values into Final Values.

It never stores gameplay state.

Instead it evaluates the current Registry whenever a Gameplay Stat must be updated.

Responsibilities include:

- retrieving Base Values;
- retrieving active Modifier Instances and their Definitions;
- applying the deterministic calculation pipeline;
- producing Final Values;
- producing Calculation Breakdown;
- exposing derived Gameplay Stats.

The Calculation Service should be deterministic and side-effect free.

Given identical inputs, it must always return identical outputs.

---

# 19. Cached Values

Final Gameplay Stats may be cached for performance.

However, the cache is never authoritative.

The authoritative data always consists of:

- Base Value
- Active Modifier Instances

Cached values exist only as an optimization.

Whenever the Registry changes:

- Modifier added;
- Modifier removed;
- Modifier enabled;
- Modifier disabled;
- Modifier expired;

the affected Gameplay Stat cache must be invalidated.

The next request recalculates the value.

This approach minimizes unnecessary recalculations while preserving correctness.

---

# 20. Save / Load Integration

Save files never store calculated Gameplay Stats.

Instead, they store runtime Modifier Instance State when that state cannot be deterministically reconstructed from saved owner system state.

During loading:

```text
Load Save
        ↓
Restore Gameplay Systems
        ↓
Rebuild and Restore Modifier Registry
        ↓
Recalculate Gameplay Stats
        ↓
Publish Final Values
```

This guarantees that outdated cached values never survive across versions.

It also makes Save migrations significantly safer.

---

## 20.1 Save Authority Rules

Modifier persistence must have a single authority for each Modifier Instance.

There are two allowed restoration models:

| Model | Used For | Rule |
|-------|----------|------|
| Rebuild From Owner State | Permanent modifiers from persistent owner systems such as purchased upgrades or completed promotions | Restore the owner system first, then deterministically recreate its Modifier Instances. Do not separately save duplicate permanent modifier instances unless required for migration. |
| Restore Saved Instance State | Temporary, runtime, debug or otherwise stateful modifiers | Save and restore the active Modifier Instance state directly. |

Permanent modifiers should normally use **Rebuild From Owner State**.

Temporary modifiers should normally use **Restore Saved Instance State**.

The same active Modifier Instance must never be restored from both models during the same load.

If both saved owner state and saved modifier instance state reference the same deterministic permanent modifier, the owner state wins and duplicate modifier instance state must be ignored or migrated away.

---

## Saved Modifier State

Each saved active Modifier Instance should persist only the information necessary to reconstruct its runtime state.

Typical fields include:

| Field | Purpose |
|---------|----------|
| instanceId | Stable runtime identifier |
| definitionId | Static Modifier Definition identifier |
| sourceType | Owner type |
| sourceId | Owner ID |
| enabled | Active state |
| durationType | Permanent or Temporary |
| remainingTime | Runtime state for temporary effects |
| customRuntimeData | Optional future extension |

Static data should be reconstructed from content definitions whenever possible.

This minimizes save size and simplifies future migrations.

---

# 21. Offline Progress Integration

Offline Progress must reuse the Modifier System.

No separate offline formulas may be introduced.

The same Gameplay Stats used during active play are used during offline simulation.

Example:

```text
Offline Simulation
        ↓
Read Final Gameplay Stats
        ↓
Run Production Formula
        ↓
Generate Resources
```

If a Temporary Modifier expires while the player is offline, Offline Simulation must respect its remaining duration.

Example:

```text
Offline Time

2 hours

Temporary Event

30 minutes

↓

30 minutes with Modifier

+

90 minutes without Modifier
```

This guarantees that Offline Progress behaves exactly like active gameplay.
# 22. UI Integration

The UI must never calculate gameplay values independently.

Instead, every displayed Gameplay Stat should be requested from the Calculation Service.

```text
UI
        ↓
Calculation Service
        ↓
Final Gameplay Value
        ↓
Calculation Breakdown
```

This guarantees that:

- gameplay;
- tooltips;
- upgrade previews;
- promotion requirements;
- debug tools;

all display identical values.

There must never be multiple implementations of the same gameplay formula.

---

# 23. Calculation Breakdown

Every calculated Gameplay Stat should expose a Calculation Breakdown.

The Breakdown exists for three purposes:

- player transparency;
- debugging;
- QA verification.

A Breakdown should contain:

| Field | Purpose |
|---------|----------|
| Base Value | Original stat value |
| Applied Modifiers | Ordered list of all contributing modifiers |
| Intermediate Values | Optional calculation steps |
| Final Value | Final calculated result |

Example:

```text
Manual Bugs per Action

Base
1

Better Checklist
+1

Coffee
+1

Career Bonus
+2

Weekend Event
×1.5

Final
7.5
```

The Calculation Breakdown is generated automatically by the Calculation Service.

Gameplay systems should never construct explanations themselves.

---

# 24. Modifier Visibility

Not every Modifier should necessarily be visible to the player.

Each Modifier therefore declares a visibility policy.

Supported values:

- Visible
- Hidden

---

## Visible Modifiers

Visible Modifiers may appear in:

- tooltips;
- stat breakdowns;
- upgrade descriptions;
- debug panels.

Examples:

- purchased upgrades;
- promotion bonuses;
- prestige bonuses.

---

## Hidden Modifiers

Hidden Modifiers affect gameplay normally but are intentionally omitted from player-facing UI.

Examples:

- developer testing;
- temporary balancing;
- hidden narrative events;
- future secret mechanics.

Hidden Modifiers should still appear in developer debug tools.

Visibility affects presentation only.

It must never affect gameplay calculations.

---

# 25. Debug Support

Modifier System is expected to become one of the most frequently debugged systems in the project.

For that reason, the architecture should expose debug information directly.

Recommended debug features include:

- complete active Modifier Instance list;
- filtering by Gameplay Stat;
- filtering by Source Type;
- filtering by Source ID;
- final Gameplay Stat values;
- Base Values;
- Calculation Breakdown;
- remaining durations;
- expiration timers;
- cached value status.

These tools significantly reduce investigation time for balancing and gameplay bugs.

---

# 26. MVP Implementation

The MVP Vertical Slice intentionally uses only a small subset of the complete Modifier System.

Supported Modifier features:

- Permanent Modifiers
- Flat Modifiers
- Additive Percentage Modifiers
- Modifier Registry
- Calculation Service
- Calculation Breakdown
- Save / Load support

Unused features already supported by the architecture:

- Temporary Modifiers
- Multiplicative Modifiers
- Override Modifiers
- Min / Max Modifiers
- Expiration
- Hidden Modifiers

The implementation should not remove these concepts simply because the MVP does not yet require them.

Doing so would introduce unnecessary technical debt.

---

# 27. Future Compatibility

The Modifier System is intentionally designed to support every future gameplay document.

Examples include:

- Team bonuses;
- Automation efficiency;
- Reputation rewards;
- Company policies;
- Contracts;
- Prestige;
- Achievements;
- Dynamic Events;
- Seasonal content;
- Limited-time bonuses.

Future documents should introduce new Modifier Definitions rather than new calculation architectures.

This allows the game to grow without increasing architectural complexity.

---

# 28. Big Number Compatibility

The Modifier System must remain independent of the underlying numeric implementation.

All mathematical operations should be performed through the project's numeric abstraction.

The Modifier System must never assume that gameplay values are native JavaScript numbers.

Supported implementations include:

- native numbers (MVP);
- decimal libraries;
- custom mantissa/exponent types;
- future arbitrary precision implementations.

Changing the numeric backend must not require modifying:

- Modifier Registry;
- Calculation Service;
- Gameplay Systems;
- UI logic;
- Save structure.

Only the numeric abstraction layer should change.

---

# 29. Architectural Rules

The following rules are mandatory for every future gameplay document.

## Rule 1

Gameplay systems must never modify Gameplay Stats directly.

---

## Rule 2

Every gameplay bonus must be represented as a Modifier.

---

## Rule 3

Every Modifier must target a registered Gameplay Stat.

---

## Rule 4

Every Modifier must have exactly one owner.

---

## Rule 5

Every Gameplay Stat must be calculated through the Calculation Service.

---

## Rule 6

Final Gameplay Stats must never be permanently stored.

They are derived values.

---

## Rule 7

The deterministic calculation pipeline is mandatory.

No gameplay system may define its own modifier order.

---

## Rule 8

UI must never duplicate gameplay calculations.

---

## Rule 9

Offline Progress must reuse the same Gameplay Stats and Modifier calculations as active gameplay.

---

## Rule 10

Every future gameplay system must integrate with the Modifier System instead of introducing custom bonus logic.

---

# 30. Summary

The Modifier System establishes a single, deterministic and scalable architecture for every gameplay bonus in QA Idle.

Instead of allowing each gameplay system to modify values independently, all permanent and temporary effects flow through a shared calculation pipeline.

This architecture provides:

- deterministic calculations;
- modular gameplay systems;
- centralized bonus management;
- transparent UI explanations;
- reliable Save / Load behavior;
- offline simulation consistency;
- production-ready debugging;
- compatibility with future Big Number support.

With this document approved, the Modifier System becomes the authoritative calculation layer of QA Idle.

Every future gameplay feature that changes gameplay values must integrate with this system rather than introducing its own calculation logic.

This document therefore serves as the architectural contract governing all gameplay modifications throughout the lifetime of the project.
