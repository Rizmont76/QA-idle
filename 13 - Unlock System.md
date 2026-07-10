# 12 - Upgrade System

## Document Status

**Project:** QA Idle  
**Document Type:** Upgrade System Architecture  
**Owner Role:** Lead Systems Designer / Senior Economy Designer / Lead Technical Game Designer / Software Architect  
**Status:** Frozen v1.0  
**Depends On:**

- 00 - Master Project Roadmap.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08 - MVP Vertical Slice Specifica.md
- 09 - Modifier System.md
- 10 - Economy Framework.md
- 11 - Resource System.md

This document defines the complete Upgrade System architecture used throughout QA Idle.

It establishes how upgrades are registered, unlocked, displayed, purchased, owned, persisted, reset, extended and connected to other gameplay systems.

After approval, this document becomes the Single Source of Truth for every Upgrade implemented in QA Idle.

This document intentionally does **not** define:

- concrete upgrade content;
- upgrade prices;
- balance formulas;
- production rates;
- specific upgrade trees;
- Manual Testing upgrade content;
- Automation upgrade content;
- Team upgrade content;
- UI layouts.

Those responsibilities belong to future content, economy, balancing and system-specific documents.

---

# 1. Purpose

The Upgrade System exists to provide one unified architecture for player investments that improve, unlock, specialize or extend gameplay systems.

In QA Idle, upgrades are one of the primary ways the player turns earned value into long-term progress.

The Upgrade System must support the game's core loop:

```text
Produce Value
        ↓
Store Resources
        ↓
Purchase Upgrades
        ↓
Activate Effects
        ↓
Improve Gameplay Capability
        ↓
Reach New Goals
```

The system must scale from the MVP's basic upgrade shop to future late-game upgrade ecosystems across Team, Automation, Reputation, Contracts, Office, Company, Prestige and expansion systems.

The Upgrade System does **not** own economic balance, resource storage or gameplay stat calculation.

Instead:

- Resource System owns resource balances and purchase transactions.
- Modifier System owns gameplay stat changes.
- Unlock System owns unlock state and requirement visibility.
- Economy Framework owns investment philosophy and value flow.
- System-specific documents own upgrade content.
- Upgrade System owns the architecture that connects those pieces safely.

---

# 2. Upgrade Philosophy

Upgrades are not only number increases.

An upgrade should represent a meaningful improvement in how the player performs QA work, manages responsibility or expands operational capacity.

The player should feel:

> "I invested in a better way to work."

not only:

> "+10% production."

Upgrades should support three design goals:

1. **Efficiency Growth** — the player becomes better at existing loops.
2. **Strategic Choice** — the player chooses between competing investments.
3. **Progression Readiness** — upgrades prepare the player for promotions, systems and new responsibilities.

Upgrade architecture must encourage discovery and optimization without exposing future systems too early.

---

# 3. Core Definitions

## Upgrade

An Upgrade is a purchasable or unlockable gameplay investment that changes the player's capabilities, access, specialization or long-term progression state.

An Upgrade may:

- add Modifiers;
- unlock other upgrades;
- unlock system functionality;
- satisfy progression requirements;
- increase maximum levels;
- enable a feature flag;
- provide prestige/meta benefits;
- alter future purchase options through documented rules.

An Upgrade must never directly mutate resource balances or gameplay stats outside approved services.

---

## Upgrade Definition

An Upgrade Definition is the immutable static content record describing an upgrade.

It defines identity, ownership, classification, requirements, cost rules, effects, visibility, purchase behavior, lifetime and persistence behavior.

Definitions are content data.

They must not contain runtime ownership state.

---

## Upgrade Instance

An Upgrade Instance is the runtime state of a specific Upgrade Definition in a player's save.

It records whether the player owns the upgrade, how many levels were purchased, whether it is currently active, and any runtime state required by the upgrade's lifetime rules.

Most upgrades have one instance per definition per save.

Repeatable or generated expansion upgrades may still use stable definitions and deterministic instance keys.

---

## Upgrade Registry

The Upgrade Registry is the authoritative catalog of all Upgrade Definitions known to the game.

Every upgrade must be registered before it can appear, be purchased, be saved, be restored or be referenced by dependencies.

Gameplay systems register their own Upgrade Definitions.

The Upgrade System validates and processes them generically.

---

## Upgrade Ownership

Ownership is the player's persistent relationship with an Upgrade.

Depending on the upgrade type, ownership may mean:

- purchased once;
- purchased at a specific level;
- purchased multiple times;
- selected as one branch in a mutually exclusive group;
- owned permanently across prestige;
- temporarily active until expiration;
- unlocked but not purchased.

Ownership belongs to Upgrade runtime state, not to UI state.

---

## Upgrade Effect

An Upgrade Effect is the standardized outcome applied when an upgrade is purchased, leveled, activated, reset or restored.

Effects must use approved integration points.

Allowed effect channels are:

- create, enable, disable or update Modifiers;
- emit gameplay events;
- mark unlock flags through the Unlock System;
- update Upgrade ownership state;
- contribute to progression counters;
- activate documented system feature flags.

An Upgrade Effect must not contain arbitrary system-specific gameplay logic inside the Upgrade System.

---

# 4. Upgrade Lifecycle

Every upgrade follows the same lifecycle.

```text
Registered
        ↓
Validated
        ↓
Hidden
        ↓
Discoverable / Teased
        ↓
Visible
        ↓
Available
        ↓
Purchased
        ↓
Owned / Active
        ↓
Expanded / Leveled / Completed
        ↓
Reset or Preserved
```

## Registered

The upgrade exists in the Upgrade Registry.

It is known to the game but may not be visible or available.

## Validated

The Upgrade System confirms that the definition is structurally valid.

Validation happens before gameplay begins.

## Hidden

The player cannot see the upgrade.

Hidden upgrades must not reveal future systems, resources or mechanics unless explicitly allowed by teaser rules.

## Discoverable / Teased

The upgrade may be referenced indirectly.

Teasing may show limited information without exposing locked system details.

## Visible

The upgrade can appear in UI.

Visibility does not mean it can be purchased.

## Available

All purchase requirements are satisfied and the player can attempt to buy the upgrade.

## Purchased

The player has successfully paid the cost and the purchase transaction has completed.

## Owned / Active

The upgrade's ownership state is stored and its effects are active according to lifetime rules.

## Expanded / Leveled / Completed

The upgrade may gain levels, reach a maximum level, unlock dependent upgrades or complete a group/tree branch.

## Reset or Preserved

During prestige or other reset events, the upgrade is reset, archived, disabled or preserved according to its lifetime rules.

---

# 5. Upgrade Architecture

The Upgrade System is a gameplay orchestration layer.

```text
System-Specific Content
        ↓
Upgrade Definitions
        ↓
Upgrade Registry
        ↓
Upgrade State
        ↓
Purchase Service
        ↓
Resource Transactions
        ↓
Upgrade Effects
        ↓
Modifier / Unlock / Events / Feature Flags
        ↓
UI Derived State
```

## Responsibilities Owned by Upgrade System

The Upgrade System owns:

- Upgrade Definition schema;
- Upgrade Registry;
- Upgrade Instance state;
- ownership rules;
- purchase validation;
- dependency evaluation;
- upgrade visibility evaluation;
- upgrade availability evaluation;
- upgrade sorting and grouping metadata;
- effect dispatching through approved channels;
- save/load rules for upgrade state;
- prestige reset behavior for upgrades;
- debug inspection for upgrades.

## Responsibilities Not Owned by Upgrade System

The Upgrade System does not own:

- Resource balances;
- resource transaction internals;
- gameplay stat formulas;
- Modifier calculation;
- promotion requirements;
- unlock state authority;
- concrete upgrade content;
- economy balance;
- UI layout;
- system-specific gameplay simulation.

---

# 6. Upgrade Registry

Every upgrade must be registered in the Upgrade Registry.

No upgrade may be created ad hoc during gameplay without a stable Definition.

The registry must support:

- lookup by `upgradeId`;
- lookup by source system;
- lookup by category;
- lookup by group;
- lookup by tree;
- dependency validation;
- duplicate ID detection;
- missing reference detection;
- save migration support;
- debug inspection.

## Registry Rules

- Every `upgradeId` must be globally unique.
- IDs must be stable after release.
- Renaming an ID requires migration support.
- Upgrade Definitions must be loaded before save data is restored.
- Unknown saved upgrade IDs must be handled safely.
- Disabled or removed upgrades must not crash load.
- The registry is authoritative for static upgrade data.

---

# 7. Upgrade Definitions

Every Upgrade Definition must include the following fields.

| Field | Purpose |
|---|---|
| `upgradeId` | Stable unique internal identifier. |
| `displayName` | Player-facing name. |
| `description` | Player-facing purpose summary. |
| `sourceSystemId` | Gameplay system that owns the content. |
| `categoryId` | Upgrade category. |
| `groupId` | Optional group used for UI and dependency structure. |
| `treeId` | Optional tree used for graph-based progression. |
| `type` | One-time, level-based, repeatable, infinite, exclusive, prestige, temporary or expansion. |
| `maxLevel` | Maximum purchasable level, if finite. |
| `costRule` | Cost requirement evaluated at purchase time. |
| `requirements` | Visibility, unlock, dependency and purchase requirements. |
| `effects` | Standardized effect descriptors. |
| `lifetime` | Reset, preserve, temporary or prestige behavior. |
| `visibilityRule` | When the upgrade may be shown. |
| `sortOrder` | Stable ordering within UI groups. |
| `tags` | Optional search, debug and filtering metadata. |
| `version` | Content version for migration and debugging. |

## Definition Rules

- Definitions must be declarative whenever practical.
- Definitions must not store player runtime state.
- Definitions must not contain UI layout logic.
- Definitions must not directly alter Resource balances.
- Definitions must not directly calculate final Gameplay Stats.
- Definitions may reference registered Resources, Gameplay Stats, Unlocks, Modifiers and other Upgrades by stable ID.
- Every reference must be validated before gameplay begins.

---

# 8. Upgrade Categories

Upgrade Categories define broad functional meaning.

They support filtering, sorting, UI grouping, economy analysis and debug tooling.

Allowed architectural categories are:

| Category | Purpose |
|---|---|
| `production` | Improves resource production capability. |
| `conversion` | Improves conversion between resources. |
| `efficiency` | Reduces friction, costs or time. |
| `capacity` | Increases limits, storage, slots or maximums. |
| `automation` | Enables or improves passive/automated behavior. |
| `management` | Supports team, office, company or organization-level play. |
| `unlock` | Opens new options, groups, systems or actions. |
| `specialization` | Forces or encourages a strategic direction. |
| `prestige` | Persists through or interacts with prestige. |
| `quality_of_life` | Improves usability without changing core balance. |
| `expansion` | Belongs to future major content modules. |

Category is not the same as source system.

Example:

```text
sourceSystemId: manual_testing
categoryId: production
```

Future systems may add category values only through a documented update to this architecture.

---

# 9. Upgrade Groups

An Upgrade Group is a collection of related upgrades.

Groups are used for:

- UI organization;
- progression pacing;
- dependency structure;
- ownership summaries;
- unlock visibility;
- debug filtering.

Examples of possible group purposes:

- Basic Manual QA Tools;
- Reporting Improvements;
- Early Career Efficiency;
- Team Management;
- Automation Infrastructure;
- Prestige Knowledge.

This document does not define concrete groups.

## Group Rules

- Groups must have stable `groupId` values.
- A group must declare its owning `sourceSystemId`.
- A group may be hidden until an unlock condition is met.
- Group visibility must not automatically reveal hidden upgrades inside it.
- A group may contain upgrades from multiple categories.
- A group should not contain upgrades from unrelated economic domains unless explicitly documented.

---

# 10. Upgrade Trees

An Upgrade Tree is an optional dependency graph of upgrades.

Trees are used when upgrade progression benefits from visible structure.

Not every upgrade must belong to a tree.

The Upgrade System must support tree-based upgrades without requiring every system to use trees.

## Tree Rules

- A tree is a collection of nodes.
- Each node references one Upgrade Definition.
- Edges represent dependency or path relationships.
- Trees must be acyclic unless an infinite repeatable branch is explicitly modeled as a level-based upgrade rather than a graph loop.
- Tree layout is UI presentation data, not gameplay logic.
- Purchase validity must be determined by requirements, not by visual position.

## Tree Use Cases

Upgrade Trees are appropriate for:

- specialization paths;
- prestige meta-progression;
- automation infrastructure;
- company expansion;
- long-term strategic branches.

Upgrade Trees are not required for simple MVP shop upgrades.

---

# 11. Upgrade Dependencies

Dependencies define relationships between upgrades.

Supported dependency types:

| Dependency Type | Meaning |
|---|---|
| `requires_upgrade_owned` | Another upgrade must be owned. |
| `requires_upgrade_level` | Another upgrade must reach a required level. |
| `requires_group_progress` | A group must have a minimum number of owned upgrades or levels. |
| `requires_tree_node` | A tree node must be owned or completed. |
| `requires_unlock` | A specific Unlock must be active. |
| `requires_resource_state` | A resource requirement must be satisfied without spending unless used as cost. |
| `requires_career_stage` | Player must be at or beyond a career stage. |
| `excludes_upgrade` | Upgrade cannot be owned if another upgrade is owned. |
| `exclusive_group_choice` | Only one upgrade from a defined exclusive group may be owned. |

## Dependency Rules

- Dependencies must be deterministic.
- Dependencies must be validated before purchase.
- Dependencies may control visibility, availability or both.
- The definition must clearly specify which layer each dependency affects.
- Missing dependency targets are definition errors.
- Circular dependencies are invalid.
- Exclusive relationships must be symmetrical or resolved through an explicit exclusive group definition.

---

# 12. Purchase Rules

Purchasing an upgrade is a player intent processed by the Upgrade Purchase Service.

The UI may request a purchase.

Only the gameplay layer may validate and execute it.

## Purchase Flow

```text
Player Intent
        ↓
Lookup Upgrade Definition
        ↓
Load Upgrade Instance
        ↓
Validate Visibility
        ↓
Validate Unlocks
        ↓
Validate Dependencies
        ↓
Validate Ownership / Level Rules
        ↓
Evaluate Cost
        ↓
Check Resource Affordability
        ↓
Begin Atomic Transaction
        ↓
Spend Resources
        ↓
Update Upgrade State
        ↓
Apply Effects
        ↓
Emit Events
        ↓
Recalculate Derived State
        ↓
Persist State
```

## Purchase Validation Order

Validation must happen in this order:

1. Upgrade Definition exists.
2. Upgrade is enabled in the current build/content set.
3. Upgrade is visible or allowed for hidden/system purchase.
4. Upgrade is unlocked.
5. Dependency requirements are satisfied.
6. Exclusive constraints are satisfied.
7. Ownership rules allow another purchase.
8. Cost rule resolves successfully.
9. Required resources are spendable.
10. Player can afford the full cost.
11. Effects can be applied safely.

## Purchase Error Categories

Purchase failures must return structured errors.

Allowed error categories:

| Error | Meaning |
|---|---|
| `definition_not_found` | Unknown upgrade ID. |
| `content_disabled` | Upgrade exists but is disabled. |
| `not_visible` | Upgrade cannot currently be accessed. |
| `not_unlocked` | Unlock requirements are not met. |
| `dependency_missing` | Required dependency is not satisfied. |
| `exclusive_conflict` | Mutually exclusive upgrade already owned. |
| `already_owned` | One-time upgrade is already owned. |
| `max_level_reached` | Level-based upgrade cannot be purchased further. |
| `cost_invalid` | Cost rule failed to resolve. |
| `resource_missing` | Cost references unknown or unavailable resource. |
| `not_affordable` | Player lacks required resources. |
| `effect_failed` | Effects could not be applied safely. |
| `transaction_failed` | Resource transaction could not complete. |

Errors must be safe for UI, debug logs and automated tests.

## Atomicity and Rollback

An upgrade purchase must be atomic.

Either all of the following happen:

- resources are spent;
- upgrade state is updated;
- effects are applied;
- events are emitted;

or none of them happen.

If any step fails after resource spending begins, the purchase must roll back to the previous state.

Rollback must restore:

- Resource balances;
- Upgrade Instance state;
- active Modifier instances created by the purchase;
- Unlock flags changed by the purchase;
- pending purchase events.

Events should be emitted only after the transaction commits.

---

# 13. Cost Rules

Cost Rules define what the player must pay to purchase an upgrade.

The Upgrade System evaluates the cost rule.

The Resource System executes the spend.

## Supported Cost Structures

| Cost Type | Meaning |
|---|---|
| `fixed` | Same cost for every purchase. |
| `level_based` | Cost depends on current upgrade level. |
| `multi_resource` | Requires multiple resources in one transaction. |
| `scaled_by_context` | Cost depends on approved deterministic context values. |
| `free` | No resource cost, but may still require dependencies. |
| `prestige_cost` | Uses prestige resources or permanent progression values. |

## Cost Rule Requirements

Every cost rule must:

- resolve deterministically;
- return exact resource IDs and amounts;
- avoid side effects;
- use the project's approved numeric abstraction;
- support preview for UI;
- support affordability checks;
- support transaction metadata;
- never spend resources directly.

## Cost Rule Boundaries

The Upgrade System defines cost evaluation architecture.

It does not define actual prices or balance curves.

Cost formulas and values belong to economy and content balancing documents.

For MVP, costs must remain within the numeric limits defined by the MVP Vertical Slice.

---

# 14. Ownership Rules

Upgrade ownership is stored per save.

Supported ownership models:

| Ownership Type | Meaning |
|---|---|
| `none` | Upgrade is not owned. |
| `owned` | One-time upgrade was purchased. |
| `level` | Upgrade has purchased level count. |
| `count` | Repeatable purchase count. |
| `selected` | Upgrade is the chosen option in an exclusive group. |
| `temporary_active` | Upgrade is active until expiration. |
| `archived` | Upgrade existed before reset/migration and is preserved only for history. |

## One-Time Upgrades

A one-time upgrade may be purchased once.

After purchase it becomes owned and cannot be purchased again.

## Level-Based Upgrades

A level-based upgrade has levels from 0 to `maxLevel`.

Each purchase increases level by 1.

Effects may be applied per level or recalculated from total level.

## Repeatable Upgrades

A repeatable upgrade may be purchased multiple times.

It may use purchase count rather than level semantics.

Repeatable upgrades must still have deterministic cost and effect rules.

## Infinite Upgrades

An infinite upgrade has no fixed maximum level.

It is allowed only if:

- its cost rule scales safely;
- its effects are compatible with big number strategy;
- UI can display large levels;
- save/load stores level safely;
- prestige reset rules are explicit.

Infinite upgrades should be avoided in MVP unless explicitly required by the Vertical Slice.

## Mutually Exclusive Upgrades

Mutually exclusive upgrades represent strategic choice.

Once one upgrade in an exclusive group is selected, incompatible upgrades become unavailable unless a documented respec system exists.

No respec system is defined in this document.

Therefore, exclusive choices are permanent within the relevant reset lifetime.

---

# 15. Visibility Rules

Visibility determines whether the player can see an upgrade.

Visibility is separate from availability.

An upgrade may be:

| State | Meaning |
|---|---|
| `hidden` | Not shown to the player. |
| `teased` | Limited hint may be shown. |
| `visible_locked` | Shown but cannot be purchased. |
| `visible_available` | Shown and can be purchased. |
| `visible_owned` | Shown as owned or completed. |
| `disabled` | Not available in current build or content set. |

## Visibility Principles

- Future systems should remain hidden until relevant.
- Locked upgrades may show requirements only if those requirements do not spoil hidden systems.
- Hidden resources must not appear in upgrade costs.
- Hidden gameplay stats must not appear in effect previews.
- Teased upgrades may use vague flavor text instead of exact effects.
- UI must never infer visibility from cost affordability alone.

---

# 16. Unlock Rules

Unlock Rules determine whether an upgrade is allowed to become available.

The Unlock System is authoritative for unlock state.

The Upgrade System may query unlock state, but must not replace the Unlock System.

## Unlock Integration

An upgrade may require:

- a career stage unlock;
- a system unlock;
- a resource visibility unlock;
- a promotion milestone;
- a previous upgrade unlock;
- a group/tree progression unlock;
- a prestige unlock.

## Unlock vs Dependency

Unlocks answer:

> "Is this gameplay concept allowed to exist for the player now?"

Dependencies answer:

> "Has the player satisfied the specific prerequisite path for this upgrade?"

Both may be required.

---

# 17. Upgrade Effects

Effects are the result of purchasing or owning upgrades.

The Upgrade System must support effects through standardized descriptors.

## Supported Effect Channels

| Effect Channel | Purpose |
|---|---|
| `modifier_grant` | Creates or enables Modifier instances. |
| `modifier_update` | Updates modifier runtime parameters for level-based upgrades. |
| `unlock_grant` | Grants an Unlock through the Unlock System. |
| `feature_enable` | Enables documented functionality inside the owning system. |
| `event_emit` | Emits a gameplay event after purchase commit. |
| `counter_progress` | Updates approved progression/statistics counters. |
| `upgrade_state_change` | Changes upgrade state such as level or selection. |

## Effect Rules

- Effects must be deterministic.
- Effects must be reversible during rollback.
- Effects must not bypass Resource System for resource changes.
- Effects must not calculate final gameplay stat values directly.
- Effects must not directly mutate another system's private runtime state.
- Effects must include source metadata for debug tracing.
- Effects must be reapplied or reconstructed safely after Save / Load.

## Passive Ownership Effects

Some effects are active because the upgrade is owned.

For example, an owned upgrade may grant a permanent modifier.

On load, the system must be able to reconstruct such effects from saved ownership state and registered definitions.

---

# 18. Integration with Modifier System

Upgrades must use the Modifier System for gameplay stat changes.

The following rule is mandatory:

> **No Upgrade may directly modify a Gameplay Stat.**

If an upgrade affects production, conversion, speed, multipliers, caps, limits or efficiency, it must do so by granting or updating Modifiers.

## Modifier Source Metadata

Modifiers created by upgrades must include:

- `sourceType: upgrade`;
- `sourceId: upgradeId`;
- optional `sourceLevel`;
- optional `purchaseInstanceId` for repeatable upgrades;
- visibility metadata;
- lifetime metadata.

## Level-Based Modifier Rules

For level-based upgrades, the implementation may use either:

1. one Modifier Instance updated when level changes; or
2. one Modifier Instance per level purchased.

The choice must be deterministic and defined by the Upgrade Definition.

The Calculation Service remains responsible for final values.

## Modifier Lifetime Alignment

Upgrade lifetime and Modifier lifetime must be aligned.

Examples:

- reset upgrade = reset modifier;
- prestige-preserved upgrade = preserved modifier or reconstructed modifier;
- temporary upgrade = temporary modifier with expiration;
- disabled upgrade = disabled modifier.

---

# 19. Integration with Resource System

The Resource System is the only approved owner of spendable resource balances.

Upgrade purchases must use Resource Transactions.

## Purchase Transaction Requirements

Every upgrade purchase transaction must include:

- transaction type: `spend` or `multi_resource_spend`;
- source system: `upgrade_system`;
- source upgrade ID;
- purchase level or count;
- resource IDs;
- previous balances;
- resulting balances;
- simulation timestamp;
- success/failure status.

## Resource Rules

- Upgrade System may check affordability through Resource System APIs.
- Upgrade System may request spends through Resource System APIs.
- Upgrade System may not directly modify balances.
- Upgrade System may not create resources.
- Cost previews must use Resource Definitions for formatting and visibility.
- Hidden resources must not appear in cost previews until visible or explicitly teased.

---

# 20. Save / Load Rules

Upgrade state must be saved directly.

Upgrade effects must be restorable deterministically.

## Saved Upgrade State

Save data should include:

| Field | Purpose |
|---|---|
| `upgradeId` | Stable upgrade reference. |
| `ownedState` | Not owned, owned, level, count, selected, temporary, archived. |
| `level` | Current level for level-based upgrades. |
| `purchaseCount` | Number of successful purchases. |
| `selectedAt` | Simulation timestamp for exclusive choices, if relevant. |
| `active` | Whether owned effect is currently active. |
| `remainingDuration` | For temporary upgrades. |
| `lifetimeState` | Reset/preserved/archived status. |
| `definitionVersionAtPurchase` | Useful for migration/debugging. |

## Load Rules

On load:

1. Load Upgrade Definitions.
2. Validate saved upgrade IDs against registry.
3. Restore Upgrade Instance state.
4. Apply migrations if required.
5. Reconstruct owned effects through approved channels.
6. Rebuild Modifier instances created by upgrades.
7. Re-evaluate visibility and availability.
8. Publish derived UI state.

## Missing Definitions

If a saved upgrade references a missing Definition:

- the save must not crash;
- the saved state should be preserved as archived unknown data;
- effects from missing definitions must not be applied;
- debug tools must report the issue;
- migration should resolve it when possible.

## Derived Data

The following should not be saved as authoritative data:

- affordability;
- visible/hidden state;
- final gameplay stat values;
- UI grouping results;
- calculated cost previews.

They must be recalculated from definitions, resources, unlocks and ownership state.

---

# 21. Prestige Rules

Prestige may reset, preserve, archive or transform upgrade ownership.

The Upgrade Definition must declare reset behavior.

Supported reset behaviors:

| Behavior | Meaning |
|---|---|
| `reset` | Ownership and levels are cleared. |
| `preserve` | Ownership and effects remain after prestige. |
| `disable_until_reunlocked` | Ownership remains but effects are inactive until required unlock returns. |
| `archive_history` | Ownership is recorded historically but gameplay effect is removed. |
| `convert_to_prestige_value` | Ownership contributes to prestige reward calculation through the owning Prestige System. |

## Prestige Safety Rules

- Prestige reset must be deterministic.
- Prestige must not delete unknown upgrade data without migration.
- Prestige-preserved upgrades must not reveal hidden systems too early in the next run.
- If an upgrade is preserved but its source system is locked, its effects must follow the declared lifetime behavior.
- Prestige reward calculation is not owned by Upgrade System.
- Upgrade System may expose owned upgrade data to Prestige System through read-only APIs.

---

# 22. UI Integration Rules

UI displays derived upgrade state.

UI does not own upgrade logic.

## UI May Display

- upgrade name;
- description;
- category;
- group;
- current level;
- maximum level;
- current cost preview;
- affordability;
- visible requirements;
- ownership state;
- effect preview;
- dependency hints;
- exclusive choice warnings.

## UI Must Not

- decide whether a purchase is valid;
- spend resources;
- apply effects;
- calculate authoritative costs;
- directly modify upgrade state;
- reveal hidden resources or systems;
- contain hardcoded upgrade behavior.

## Sorting Rules

Upgrade sorting must be deterministic.

Default order:

1. source system order;
2. category order;
3. group order;
4. visible availability state;
5. explicit `sortOrder`;
6. display name as final stable fallback.

Owned/completed upgrades may be shown separately if UI document allows it, but their state must come from Upgrade System.

---

# 23. Debug Rules

Upgrade System must provide enough information to diagnose player progression and purchase behavior.

## Upgrade Inspection

Developer tools should allow inspection of every registered upgrade.

At minimum:

| Field | Description |
|---|---|
| Upgrade ID | Stable internal identifier. |
| Display Name | Player-facing name. |
| Source System | Owning gameplay system. |
| Category | Upgrade category. |
| Group / Tree | Group and tree IDs. |
| Type | One-time, level-based, repeatable, infinite, exclusive, prestige, temporary or expansion. |
| Visibility State | Hidden, teased, locked, available, owned or disabled. |
| Ownership State | Runtime ownership information. |
| Current Level | Current level if applicable. |
| Current Cost | Resolved cost preview. |
| Requirements | Passed and failed requirements. |
| Effects | Effects that would be or are active. |
| Modifier Links | Active modifiers created by this upgrade. |
| Resource Links | Resources used in cost rules. |
| Prestige Behavior | Reset/preserve/archive behavior. |

## Purchase History

Recent purchase attempts should be visible in debug tools.

Each entry should include:

- upgrade ID;
- attempted level/count;
- result;
- failure reason, if any;
- resources requested;
- resources spent;
- effects applied;
- rollback status;
- simulation timestamp.

## Developer Commands

Developer tools may support:

- grant upgrade;
- remove upgrade;
- set upgrade level;
- reset upgrade group;
- preview purchase validation;
- force visibility state for debugging;
- list dependency blockers.

Developer commands must be clearly marked as non-production gameplay paths.

---

# 24. Extension Architecture

Future gameplay systems must extend Upgrade System by registering Upgrade Definitions.

The Upgrade System must not be modified when adding normal content for:

- Manual Testing;
- Team;
- Automation;
- Reputation;
- Contracts;
- Office;
- Company;
- Prestige;
- future expansions.

## Extension Contract

A gameplay system that wants upgrades must provide:

1. stable `sourceSystemId`;
2. Upgrade Definitions;
3. optional groups;
4. optional trees;
5. Modifier Definitions referenced by upgrade effects;
6. Unlock IDs referenced by visibility and availability rules;
7. Resource IDs used by cost rules;
8. feature flags owned by that system, if upgrades enable functionality;
9. tests for its upgrade definitions.

## Upgrade System Generic Behavior

The Upgrade System may generically:

- register definitions;
- validate references;
- evaluate requirements;
- evaluate cost rules;
- process purchases;
- update ownership;
- dispatch effects;
- save/load state;
- apply prestige reset behavior;
- provide debug visibility.

It must not contain hardcoded branches such as:

```text
if upgrade belongs to Automation, do Automation-specific behavior
```

System-specific behavior must live in:

- Modifier definitions;
- Unlock definitions;
- Resource definitions;
- feature flags owned by the source system;
- event listeners owned by the source system.

---

# 25. Data-Driven Rules

Upgrade content should be data-driven whenever practical.

Code provides reusable engines.

Data defines content.

## Data Rules

Every data-driven upgrade definition must:

- use stable IDs;
- validate references at startup;
- avoid executable arbitrary logic;
- use approved requirement descriptors;
- use approved cost descriptors;
- use approved effect descriptors;
- include version metadata;
- include source ownership;
- be testable without UI.

## Validation Rules

Startup/content validation must detect:

- duplicate upgrade IDs;
- missing source system IDs;
- missing resources;
- missing gameplay stats;
- missing modifier definitions;
- missing unlock references;
- invalid dependency targets;
- circular dependency chains;
- invalid exclusive group configuration;
- invalid max level values;
- invalid cost rules;
- unsupported effect descriptors;
- unsupported lifetime behavior.

Invalid production content should fail loudly in development and be safely blocked in production.

---

# 26. Implementation Contract for Codex

Codex must implement Upgrade System according to the following rules.

## Core Services Required

Implementation should provide:

- `UpgradeRegistry`;
- `UpgradeStateStore`;
- `UpgradeRequirementEvaluator`;
- `UpgradeCostEvaluator`;
- `UpgradePurchaseService`;
- `UpgradeEffectDispatcher`;
- `UpgradeVisibilityService`;
- `UpgradeSaveAdapter`;
- `UpgradePrestigeAdapter`;
- `UpgradeDebugService`.

## Mandatory Rules

1. Upgrade Definitions are static content.
2. Upgrade Instances are runtime state.
3. UI sends purchase intents only.
4. Purchase Service validates and executes purchases.
5. Resource System handles all resource spending.
6. Modifier System handles all gameplay stat changes.
7. Unlock System remains authoritative for unlock state.
8. Upgrade System must not know system-specific gameplay logic.
9. Purchase operations must be atomic.
10. Failed purchases must not partially modify state.
11. Save/Load must reconstruct upgrade effects deterministically.
12. Prestige behavior must follow each upgrade's lifetime rule.
13. Debug tooling must expose failed requirements and purchase errors.
14. Content validation must run before gameplay begins.
15. Tests must cover purchase, rollback, save/load and dependency behavior.

## MVP Implementation Scope

For the MVP Vertical Slice, Upgrade System must support at minimum:

- one-time upgrades;
- finite level-based upgrades;
- Money costs;
- Modifier-granting effects;
- visibility rules;
- unlock requirements;
- purchase validation;
- Resource System transaction integration;
- Save / Load;
- debug inspection.

The MVP does not need to implement:

- infinite upgrades;
- prestige upgrades;
- complex trees;
- respec;
- temporary upgrades;
- expansion upgrade packs.

However, the architecture must not prevent those features later.

---

# 27. Acceptance Criteria

The Upgrade System is accepted when all criteria below are satisfied.

## Architecture Criteria

- Upgrade System has clear ownership distinct from Resource, Modifier, Economy and Unlock systems.
- Future systems can add upgrades by registering definitions.
- No system-specific upgrade behavior is hardcoded into the Upgrade System.
- Upgrade state is separate from Upgrade Definitions.
- Upgrade effects use approved channels only.

## Purchase Criteria

- Purchases validate visibility, unlocks, dependencies, ownership, costs and affordability.
- Purchase failures return structured errors.
- Purchase transactions are atomic.
- Rollback restores resources, upgrade state, modifiers and unlock changes.
- Events are emitted only after commit.

## Integration Criteria

- Resource spending goes through Resource System.
- Gameplay stat changes go through Modifier System.
- Unlock checks use Unlock System.
- Save / Load restores ownership and effects deterministically.
- Prestige reset behavior is data-defined.

## Content Criteria

- Upgrade Definitions are data-driven.
- Stable IDs are used everywhere.
- Content validation catches missing references and circular dependencies.
- Upgrade Categories, Groups and Trees are supported without requiring concrete content.

## UI Criteria

- UI can query visible upgrades.
- UI can preview costs and affordability.
- UI can show failed visible requirements.
- UI cannot perform authoritative purchase logic.
- Hidden upgrades do not leak future systems.

## Debug Criteria

- Developer tools can inspect definitions and instances.
- Purchase history can be reviewed.
- Dependency blockers can be listed.
- Active modifiers created by upgrades can be traced back to upgrade sources.

---

# 28. Out of Scope

This document does not define:

- specific upgrade names;
- specific upgrade effects;
- upgrade prices;
- upgrade balance formulas;
- exact UI layout;
- concrete Manual Testing tree;
- concrete Automation tree;
- concrete Team upgrades;
- concrete Prestige upgrades;
- respec system;
- shop art, icons or copywriting;
- final economy tuning;
- promotion requirements.

---

# Remaining Notes

The following notes do not block the Documentation v1.0 Freeze.

## 1. Unlock System is frozen

Upgrade visibility and availability depend on Unlock System authority as defined in `13 - Unlock System.md`.

The Upgrade System integrates with Unlock System through approved unlock checks and unlock effect channels. Upgrade System does not own unlock state.

## 2. Promotion System is frozen

Some upgrades may be promotion-gated or may contribute to promotion readiness as defined in `14 - Promotion System.md`.

Promotion System may observe upgrade ownership through approved read interfaces, but Upgrade System does not own promotion logic or promotion requirements.

## 3. Lifetime progression counters

Resource System owns resource balances and resource transactions. Resource-derived lifetime counters may be tracked as progression/statistics data and read by Promotion and Unlock systems through approved interfaces. No system should duplicate lifetime counter ownership.

## 4. Prestige System is future documentation

This document supports prestige-compatible upgrade lifetime rules, but exact prestige rewards, conversion behavior and preserved meta-upgrades require a future Prestige System document.

## 5. Numeric strategy after MVP remains open

MVP may use bounded native numbers, but long-term infinite or late-game upgrades require a stable big-number strategy before large-scale content expansion.

---

# Implementation Planning Questions

These questions may be answered during implementation planning without changing the frozen architecture.

1. Should MVP upgrades support only one-time upgrades, or should finite level-based upgrades also be required immediately?
2. Should exclusive upgrades be allowed before Prestige exists, or postponed until respec/prestige reset rules are clearer?
3. Should Upgrade Trees be implemented in the first technical version as data support only, even if MVP UI does not display a tree?
4. Should upgrade-owned feature flags be stored inside Upgrade State, Unlock State or the owning gameplay system's state?
5. Should failed purchase attempts be stored only in debug memory, or also persisted for QA investigation builds?

---

# Codex Review Checklist

Use this checklist during Codex Review.

## Architecture

- [ ] Upgrade System has one clear responsibility.
- [ ] Resource System owns all resource balances.
- [ ] Modifier System owns all gameplay stat changes.
- [ ] Unlock System owns unlock state.
- [ ] Upgrade System does not duplicate Economy Framework rules.
- [ ] Future systems can register upgrades without modifying Upgrade System code.

## Definitions

- [ ] Upgrade Definition and Upgrade Instance are clearly separated.
- [ ] Required definition fields are complete.
- [ ] Stable ID rules are explicit.
- [ ] Categories, groups and trees are generic.
- [ ] Dependencies support future content without hardcoding.

## Purchase Flow

- [ ] Purchase validation order is deterministic.
- [ ] Error categories are structured.
- [ ] Costs are evaluated without side effects.
- [ ] Resource spending is atomic.
- [ ] Rollback behavior is documented.
- [ ] Events emit only after commit.

## Integration

- [ ] Modifier integration is explicit.
- [ ] Resource integration is explicit.
- [ ] Save / Load reconstruction is explicit.
- [ ] Prestige reset behavior is explicit.
- [ ] UI responsibilities and restrictions are explicit.

## Debugging

- [ ] Upgrade inspection fields are sufficient.
- [ ] Purchase history requirements are defined.
- [ ] Dependency blockers can be inspected.
- [ ] Modifier links can be traced to upgrade sources.

## Scope Control

- [ ] No concrete upgrade content is defined.
- [ ] No prices or formulas are defined.
- [ ] No UI layout is defined.
- [ ] No future system content is introduced.
- [ ] Potential blockers are listed honestly.
