# 07 - Technical Rules

## Document Status

**Project:** QA Idle  
**Document Type:** Technical Implementation Rules  
**Owner Role:** Senior Software Architect / Lead Gameplay Programmer  
**Status:** Frozen v1.0  
**Created:** 2026-07-06  
**Depends On:**

- README.md
- 01 - Vision.md
- 02 - Core Gameplay Loop.md
- 03 - Player Journey.md
- 04 - Career System.md
- 05 - Progression.md
- 06 - Game Systems.md

This document converts the existing design documentation into technical implementation rules.

It does not introduce new gameplay features.

It does not change the game design.

Its purpose is to define how implementation should preserve the documented design intent while keeping the codebase scalable, modular, maintainable and safe for long-term expansion.

---

# 1. Purpose

QA Idle is designed around layered career progression, gradual system discovery and expanding responsibility.

The technical architecture must support:

- simple early-game implementation;
- modular gameplay systems;
- data-driven content;
- hidden future systems;
- stable save/load behavior;
- offline progress;
- prestige resets;
- long-term expansion without rewriting core systems.

Implementation must not treat QA Idle as a single static clicker loop.

The game should be implemented as a set of independent gameplay systems coordinated through shared resources, events, unlocks and persistent state.

---

# 2. Core Technical Principles

## 2.1 Design Documents Are the Source of Truth

Implementation must follow documented mechanics only.

Codex and future developers must not invent new systems, resources, formulas, currencies, unlocks, prestige rewards, UI panels or gameplay layers unless they are documented first.

If implementation discovers an undocumented need, the correct response is to document the rule before implementing it.

---

## 2.2 Systems Must Be Modular

Each gameplay system must own a clearly bounded area of responsibility.

A system may:

- own its own state;
- read approved shared state;
- emit events;
- react to events;
- produce resources;
- consume resources;
- expose derived values for UI.

A system must not directly mutate another system's private state.

Cross-system behavior should use resources, events, modifiers or unlock rules rather than hidden direct calls.

---

## 2.3 Data Drives Content

Career stages, upgrades, unlocks, achievements, promotion requirements, resources, event definitions and prestige rules should be expressed as structured data whenever practical.

Code should provide reusable engines.

Data should define specific game content.

This keeps future balancing, content expansion and save compatibility manageable.

---

## 2.4 UI Must Not Own Game Logic

The UI displays state and sends player intents.

The gameplay layer validates and executes those intents.

UI components must not contain authoritative formulas, unlock rules, resource calculations, promotion requirements, prestige reset logic or offline progress simulation.

---

## 2.5 Hidden Systems Must Exist Safely

A system may be implemented before it is visible to the player.

However, hidden systems must not affect gameplay unless explicitly unlocked or enabled by documented rules.

A hidden system can exist in code, but it must be inert in simulation, UI and save presentation until unlocked.

---

# 3. Game Loop / Tick Model

## 3.1 Required Model

QA Idle should use a deterministic simulation loop based on elapsed time.

The game loop should support:

- active production;
- passive production;
- offline progress;
- time-limited modifiers;
- contracts;
- achievements;
- statistics;
- save/load restoration.

The simulation should not depend on frame rate.

Rendering may happen every frame, but gameplay progress must be calculated from time deltas or fixed simulation steps.

---

## 3.2 Time Concepts

Implementation should distinguish:

| Concept | Meaning |
|---|---|
| Real Time | Wall-clock elapsed time. |
| Simulation Time | Time used by gameplay systems. |
| Active Time | Time while the game is open and running. |
| Offline Time | Time between saved timestamp and load timestamp. |
| Tick Delta | Time slice processed by simulation. |

---

## 3.3 Active Tick Rules

Each active simulation tick should follow this order:

1. Read elapsed time since previous simulation update.
2. Clamp extreme delta values to prevent unstable jumps.
3. Process player-independent passive production.
4. Process active timers and temporary modifiers.
5. Update contracts and long-running objectives.
6. Apply resource gains and spends through the resource model.
7. Evaluate unlock conditions.
8. Evaluate promotion availability.
9. Evaluate achievement triggers.
10. Update statistics.
11. Emit relevant events.
12. Persist autosave if autosave interval is reached.
13. Publish derived state for UI.

Manual click actions are not part of passive tick production. They should be handled as explicit player intents.

---

## 3.4 Fixed Step vs Variable Delta

The implementation may use either:

- a fixed simulation step with accumulated time; or
- a variable delta model with strict clamping.

Whichever model is chosen must be consistent across active and offline progress.

Offline progress should reuse the same production rules where practical, not a separate unrelated formula.

---

## 3.5 Tick Safety Rules

Simulation must be safe when:

- the browser tab is throttled;
- the player changes system time;
- the game loads an old save;
- very large numbers are reached;
- a system is hidden or locked;
- a feature exists in code but is not yet present in the save file.

---

# 4. Resource Model

## 4.1 Resource Definition

A resource is a standardized value produced and consumed by gameplay systems.

Examples from existing design:

- Bugs Found
- Money
- Reputation
- Automation Coverage
- Team Output
- Company Reputation
- Planetary Stability
- Galactic Reputation

Only documented resources may be implemented.

---

## 4.2 Resource Registry

All resources should be declared in a central registry.

Each resource definition should include:

| Field | Purpose |
|---|---|
| id | Stable internal identifier. Never rename after release. |
| displayName | Player-facing name. |
| description | Short purpose explanation. |
| category | Personal, team, automation, company, prestige, etc. |
| unlockId | Unlock that makes it visible, if any. |
| initialValue | Default value for new saves. |
| minValue | Usually 0. |
| maxValue | Optional cap, if documented. |
| isSpendable | Whether the resource can be consumed. |
| isPersistent | Whether it is saved. |
| resetBehavior | How it behaves during prestige. |
| format | Number display format. |

---

## 4.3 Resource Ownership

The resource system owns stored resource balances.

Gameplay systems request resource changes through approved operations:

- add resource;
- spend resource;
- set resource;
- clamp resource;
- check affordability;
- read resource balance.

Gameplay systems must not directly mutate raw resource state.

---

## 4.4 Resource Transaction Rules

Every resource change should be representable as a transaction.

A transaction should include:

- resource id;
- amount;
- operation type;
- source system;
- reason;
- timestamp or simulation time;
- optional related content id.

This supports debugging, statistics, achievements, offline summaries and future telemetry.

---

## 4.5 Resource Visibility

A resource can exist in save data before it is visible in UI.

UI visibility is controlled by unlock state, not by whether the resource exists internally.

Hidden resources should not be shown in counters, tooltips, upgrade costs or requirement previews unless the design explicitly allows teasing.

---

# 5. Big Number Handling

## 5.1 Requirement

QA Idle is an idle/incremental game and must assume resource values can grow beyond normal JavaScript safe integer ranges or normal floating-point precision expectations.

Implementation must select a number strategy before broad content implementation.

---

## 5.2 Number Strategy

The game should use one consistent numeric abstraction for gameplay quantities.

Allowed approaches:

- a proven big-number / decimal library;
- a custom mantissa-exponent decimal type;
- a carefully bounded native number model for early prototype only.

Native JavaScript numbers may be acceptable for short MVP work, but they are not sufficient as the long-term architecture unless the economy is explicitly capped below precision limits.

---

## 5.3 Number Rules

Gameplay code must not freely mix raw numbers and big-number values.

All production formulas, resource balances, costs, requirements and multipliers should use the selected numeric abstraction.

Formatting must be separate from calculation.

Comparison must use numeric helper functions rather than direct operators if a big-number type is used.

---

## 5.4 Display Formatting

The display layer should support:

- compact notation;
- full numbers when small;
- stable rounding;
- clear upgrade costs;
- clear requirements;
- consistent formatting across resources.

Formatting rules must never alter stored gameplay values.

---

# 6. Save Data Schema and Versioning

## 6.1 Save Data Goals

Save data must support:

- long-term play;
- autosave;
- manual save/load if needed;
- future migrations;
- prestige cycles;
- hidden systems;
- removed or renamed content;
- compatibility across updates.

---

## 6.2 Save Versioning

Every save must include:

- schema version;
- game version, if available;
- created timestamp;
- last saved timestamp;
- migration history, if useful.

Save files without a schema version must be treated as legacy saves and migrated through a defined path.

---

## 6.3 Stable IDs

All saved content must use stable IDs.

This applies to:

- resources;
- upgrades;
- career stages;
- promotions;
- unlocks;
- achievements;
- contracts;
- events;
- statistics;
- prestige rewards.

Player-facing names may change.

Stable IDs must not be renamed after release without a migration.

---

## 6.4 Save Data Structure Draft

This is a structural draft, not final code.

```text
SaveData
  meta
    schemaVersion
    gameVersion
    createdAt
    lastSavedAt
    lastActiveAt
    migratedFromVersions

  settings
    soundEnabled
    musicEnabled
    numberFormat
    reducedMotion

  resources
    resourceId -> amount

  career
    currentStageId
    highestStageReachedId
    promotionHistory
    availablePromotionIds
    completedPromotionIds

  unlocks
    unlockId -> state
    firstUnlockedAt
    firstSeenAt

  upgrades
    upgradeId -> level / purchasedState

  systems
    manualTesting
      systemSpecificState
    bugReporting
      systemSpecificState
    team
      systemSpecificState
    automation
      systemSpecificState
    contracts
      systemSpecificState
    office
      systemSpecificState
    company
      systemSpecificState
    prestige
      systemSpecificState
    events
      systemSpecificState

  achievements
    achievementId -> state
    unlockedAt
    progress

  statistics
    statId -> value
    lifetime
    currentRun
    bestRun

  modifiers
    activeModifierId -> modifierState

  offline
    lastOfflineSummary
    lastOfflineDuration
    offlineCapState

  prestige
    cycleCount
    permanentBonuses
    previousRunsSummary

  debug
    optionalDevelopmentOnlyData
```

---

## 6.5 Save Loading Rules

Save loading should follow this order:

1. Parse raw save.
2. Validate basic structure.
3. Detect schema version.
4. Run migrations in order.
5. Fill missing defaults.
6. Remove or quarantine invalid fields.
7. Validate stable IDs against registries.
8. Restore simulation state.
9. Calculate offline progress if allowed.
10. Publish UI-ready state.

Invalid save data should fail gracefully where possible.

---

# 7. Rules for Preserving Save Compatibility

## 7.1 Never Break Stable IDs Casually

Do not rename IDs after release.

If an ID must change, provide a migration mapping old ID to new ID.

---

## 7.2 Additive Changes Are Preferred

Prefer adding new optional fields over changing existing field meanings.

Missing fields must have safe defaults.

---

## 7.3 Removed Content Must Be Handled

If content is removed:

- old save references must not crash the game;
- removed purchases should be migrated, refunded or archived according to documented rules;
- removed achievements should be preserved as legacy records if appropriate.

---

## 7.4 Migrations Must Be Deterministic

A migration must produce the same result every time for the same input save.

Migrations must not depend on UI state or random values.

---

## 7.5 Prestige and Save Compatibility

Prestige reset logic must not be implemented as deleting most of the save.

It should transform the save from one valid state into another valid state using documented reset rules.

---

# 8. System Ownership Rules

## 8.1 Ownership Definition

A system owns:

- its private state;
- its content definitions;
- its validation rules;
- its emitted events;
- its derived UI values;
- its contribution to save/load.

A system does not own another system's state just because it uses another system's output.

---

## 8.2 Cross-System Interaction Rules

Systems may interact through:

- resource transactions;
- event bus events;
- unlock registry state;
- modifier registry;
- read-only derived selectors;
- documented service APIs.

Systems must avoid:

- direct mutation of another system's state;
- hidden dependencies on UI components;
- duplicated formulas;
- undocumented resource creation;
- circular update dependencies.

---

# 9. System Ownership Matrix

| System | Owns | May Read | Produces / Emits | Must Not Own |
|---|---|---|---|---|
| Manual Testing | Manual testing action state, active production rules | Resources, upgrades, modifiers, unlock state | Bugs Found, manual test events, stats events | Reporting rewards, team state, automation state |
| Bug Reporting | Bug conversion rules, reporting action state | Bugs Found, upgrades, reputation modifiers | Money, Reputation, report events | Manual production, promotion decisions |
| Resources | Resource balances and transaction operations | Resource registry | Resource changed events | System-specific formulas |
| Money | Money definition through resource registry | Resource state | Money transactions | Upgrade logic, hiring logic |
| Upgrades | Upgrade definitions, purchase validation, upgrade levels | Resources, unlocks, career, prerequisites | Upgrade purchased events, modifiers | Resource balances, promotion state |
| Team | Team members, team output rules, team upgrades integration | Resources, office capacity, career, modifiers | Team Output, passive Bugs, team events | Automation internals, contracts state |
| Reputation | Reputation resource definitions and earning rules where applicable | Reports, contracts, achievements, career | Reputation transactions, reputation milestone events | Money, team state, company state |
| Automation | Automation coverage, automation production, automation modifiers | Resources, upgrades, team output where documented | Automation Coverage, passive Bugs, offline contribution | Manual testing state, team ownership |
| Promotion | Promotion availability and completion state | Career, resources, achievements, system mastery, unlocks | Promotion available/completed events | Unlock implementation details, UI layout |
| Career | Current stage, career history, stage metadata | Promotion state, prestige state | Career stage changed events | Individual system internals |
| Contracts | Contract definitions, active contracts, contract progress | Team Output, Automation Coverage, Reputation, Office, Company | Contract events, rewards | Team state, automation state, office state |
| Office | Office capacity and infrastructure state | Money, career, upgrades | Capacity changes, office events | Team member ownership, company progression |
| Company Management | Company state, company progression, company-level decisions | Contracts, office, team, automation, reputation | Company Reputation, company events | Prestige reset rules |
| Prestige | Prestige eligibility, reset transformation, permanent bonuses | Career, company, achievements, statistics | Prestige preview, prestige completed events | Normal career progression rules |
| Achievements | Achievement definitions, trigger state, progress | Events, statistics, resources, career | Achievement unlocked events, rewards if documented | Core progression state |
| Events | Event definitions, active events, event choices, temporary modifiers | Career, contracts, reputation, company state | Event started/resolved events, modifiers | Permanent progression ownership |
| Offline Progress | Offline simulation summary and offline caps | Team, automation, company, upgrades, modifiers | Offline gains, offline summary event | Active tick ownership, manual click production |
| Statistics | Stat definitions and recorded values | Events from all systems | Stat changed events | Gameplay authority or unlock ownership |
| Unlock System | Unlock definitions and visibility state | Career, promotion, achievements, resources, system mastery | Unlock changed events | Gameplay formulas, UI component layout |
| UI Layer | Presentation state and player intents | Derived gameplay selectors | UI actions / intents | Authoritative gameplay state |

---

# 10. Event Bus / Event Contracts

## 10.1 Event Bus Purpose

The event bus allows systems to react to important gameplay changes without direct coupling.

Events should describe something that happened.

Events should not be commands disguised as events.

Good event:

```text
promotion.completed
```

Poor event:

```text
unlockTeamPanelNow
```

The Unlock System may listen to `promotion.completed` and decide whether a team panel unlock should occur.

---

## 10.2 Event Contract Format

Each event definition should include:

| Field | Purpose |
|---|---|
| id | Stable event identifier. |
| sourceSystem | System that emits the event. |
| payloadSchema | Expected payload fields. |
| timing | When the event is emitted. |
| listeners | Systems allowed or expected to listen. |
| persistence | Whether the event is stored, logged or transient. |
| replayBehavior | Whether it can be replayed during migration/debugging. |

---

## 10.3 Event Payload Rules

Event payloads should include stable IDs and values, not direct object references.

Events should be serializable where possible.

Events should not expose private mutable system state.

---

## 10.4 Event Ordering Rules

Core simulation events should be emitted in deterministic order.

If multiple systems react to the same event, their reactions must not depend on unspecified listener order.

When ordering matters, define a coordinator or explicit processing phase.

---

## 10.5 MVP Runtime Event Guarantees

Gameplay events are emitted only after the state change they describe has committed.

Listeners execute deterministically in registered priority order. If priority is equal, listeners execute by stable listener ID in lexicographic order.

If the originating transaction rolls back or fails validation, no event from that transaction is emitted.

Event listeners may update their own system state only through documented public services and transactions. They must not directly mutate another system's private state, and they must not create hidden ordering dependencies. If a listener needs additional state changes with strict ordering, that work must be modeled as an explicit transaction phase or coordinator.

Events are either transient or persistent:

| Event Type | Behavior |
|---|---|
| Transient | Delivered during the current runtime only; not saved as pending gameplay work. |
| Persistent | Stored only when a document explicitly requires event history, debugging, replay or recovery. |

MVP gameplay reactions should use transient events unless a system document explicitly declares persistence.

---

# 11. Event List

This list defines the initial technical event vocabulary implied by the current design.

No event below adds new gameplay. Each event exists to support documented systems.

| Event ID | Source | Purpose |
|---|---|---|
| game.loaded | Save/Load | Fired after save is loaded and migrated. |
| game.saved | Save/Load | Fired after successful save. |
| tick.processed | Simulation | Fired after a simulation tick completes. |
| resource.changed | Resources | Fired when a resource balance changes. |
| resource.spendFailed | Resources | Fired when a spend request cannot be completed. |
| manualTest.performed | Manual Testing | Fired when player manually tests. |
| bugs.found | Manual Testing / Team / Automation | Fired when Bugs Found increases. |
| bugReport.submitted | Bug Reporting | Fired when bugs are reported. |
| money.earned | Resources / Reporting / Contracts | Fired when Money increases. |
| reputation.earned | Reputation | Fired when Reputation increases. |
| upgrade.purchased | Upgrades | Fired when an upgrade is bought. |
| upgrade.unlocked | Unlock System / Upgrades | Fired when an upgrade becomes visible or available. |
| team.unlocked | Unlock System | Fired when team system becomes available. |
| team.memberHired | Team | Fired when a team member is hired. |
| team.outputChanged | Team | Fired when Team Output changes. |
| automation.unlocked | Unlock System | Fired when automation becomes available. |
| automation.coverageChanged | Automation | Fired when Automation Coverage changes. |
| promotion.available | Promotion | Fired when promotion requirements are met. |
| promotion.completed | Promotion | Fired when the player receives a promotion. |
| career.stageChanged | Career | Fired after promotion changes current career stage. |
| unlock.teased | Unlock System | Fired when content enters teased state. |
| unlock.revealed | Unlock System | Fired when content becomes visible. |
| unlock.completed | Unlock System | Fired when content becomes fully unlocked. |
| contract.available | Contracts | Fired when a contract becomes available. |
| contract.accepted | Contracts | Fired when player accepts a contract. |
| contract.progressChanged | Contracts | Fired when contract progress changes. |
| contract.completed | Contracts | Fired when contract objectives are met. |
| office.expanded | Office | Fired when office capacity or tier increases. |
| company.founded | Company Management | Fired when own QA company begins. |
| company.reputationChanged | Company Management / Resources | Fired when Company Reputation changes. |
| prestige.previewAvailable | Prestige | Fired when prestige can be previewed. |
| prestige.completed | Prestige | Fired when a prestige reset completes. |
| achievement.unlocked | Achievements | Fired when an achievement is earned. |
| event.started | Events | Fired when a temporary event begins. |
| event.choiceMade | Events | Fired when player chooses an event response. |
| event.resolved | Events | Fired when event outcome is applied. |
| offline.started | Offline Progress | Fired conceptually when game session ends, if tracked. |
| offline.calculated | Offline Progress | Fired when offline progress is calculated on return. |
| statistic.changed | Statistics | Fired when tracked statistic changes. |
| ui.visibilityChanged | Unlock System / UI | Fired when a UI surface changes state. |

---

# 12. Unlock Registry

## 12.1 Purpose

The Unlock Registry controls when systems, resources, UI panels, upgrade categories, achievements, events and tutorials become available.

Unlocks protect progressive disclosure.

They ensure the player does not see future systems too early.

---

## 12.2 Unlock Definition Format

Each unlock should define:

| Field | Purpose |
|---|---|
| id | Stable unlock identifier. |
| targetType | System, resource, UI panel, upgrade category, achievement group, etc. |
| targetId | Stable ID of content being unlocked. |
| defaultState | Usually hidden. |
| teaseCondition | Optional condition for anticipation. |
| revealCondition | Condition for visible but not active state. |
| unlockCondition | Condition for active availability. |
| requiredCareerStage | Career gate, if any. |
| requiredPromotionId | Promotion gate, if any. |
| requiredResources | Resource gate, if any. |
| requiredAchievements | Achievement gate, if any. |
| priority | Used for display/order decisions. |
| tutorialId | Optional tutorial/discovery message. |

---

## 12.3 Unlock State Machine

Allowed unlock states:

```text
hidden
teased
visible
available
unlocked
mastered
integrated
```

Definitions:

| State | Meaning |
|---|---|
| hidden | Player should not know this content exists. |
| teased | Light hint allowed, no full mechanic exposure. |
| visible | UI may show limited preview or locked state. |
| available | Player can interact if final requirements are met. |
| unlocked | Content is active and part of gameplay. |
| mastered | Player has demonstrated understanding or completed core use. |
| integrated | Content is now part of normal gameplay rhythm. |

Not every unlock needs every state.

Early MVP may use hidden and unlocked only, but the schema should support the full lifecycle.

---

# 13. Upgrade Definition Format

## 13.1 Purpose

Upgrades convert resources into lasting improvements.

They should be data-driven wherever practical.

---

## 13.2 Upgrade Definition

Each upgrade should define:

| Field | Purpose |
|---|---|
| id | Stable upgrade identifier. |
| displayName | Player-facing name. |
| description | Player-facing effect/flavor. |
| category | Manual, reporting, team, automation, process, company, prestige, etc. |
| unlockId | Unlock controlling visibility. |
| maxLevel | 1 for one-time purchases, higher for repeatable upgrades. |
| cost | Resource cost definition. |
| costScaling | Cost growth rule, if repeatable. |
| prerequisites | Required upgrades, career stage or unlocks. |
| effects | Structured list of modifiers granted. |
| tags | Optional grouping for achievements/statistics. |
| resetBehavior | How it behaves on prestige. |

---

## 13.3 Upgrade Effect Rules

Upgrade effects should use a shared modifier format.

Examples of modifier targets from existing design:

- bugs per click;
- bugs per second;
- report value;
- money gain;
- reputation gain;
- automation efficiency;
- team output;
- offline progress;
- contract speed;
- promotion requirements.

Effects must not be implemented as arbitrary hidden code inside UI buttons.

---

# 14. Promotion Requirement Format

## 14.1 Purpose

Promotion is the primary structural reward and must be implemented as explicit content data.

Promotion requirements must be understandable, inspectable and testable.

---

## 14.2 Promotion Definition

Each promotion should define:

| Field | Purpose |
|---|---|
| id | Stable promotion identifier. |
| fromCareerStageId | Current stage. |
| toCareerStageId | Resulting stage. |
| displayName | Player-facing promotion name. |
| requirements | Structured requirement list. |
| rewards | Unlocks, resources, UI expansion or other documented rewards. |
| previewText | Limited player-facing preview. |
| completionMessage | Promotion feedback text. |
| unlocks | Unlock IDs triggered by promotion. |
| resetBehavior | Usually retained after prestige only if documented. |

---

## 14.3 Requirement Types

Allowed requirement categories should include only documented concepts:

- resource amount;
- total lifetime resource amount;
- upgrade purchased;
- achievement earned;
- system unlocked;
- system mastery;
- contract completed;
- career stage reached;
- prestige cycle count, if documented.

Requirements must be evaluated by a shared requirement engine rather than custom code per promotion.

---

# 15. Prestige Reset Rules

## 15.1 Prestige Purpose

Prestige converts a completed or advanced career into stronger future progression.

It must feel like accumulated experience, not deletion.

---

## 15.2 Required Prestige Preview

Before confirming prestige, the game must show:

- what will reset;
- what will remain;
- what permanent reward will be gained;
- how the next run improves;
- whether any content becomes newly available.

No surprise loss is allowed.

---

## 15.3 Reset Categories

Every saved field must belong to one reset category:

| Category | Meaning |
|---|---|
| reset | Cleared or returned to initial value. |
| keep | Preserved unchanged. |
| convert | Transformed into permanent progress or reward. |
| archive | Stored in previous-run history. |
| recompute | Rebuilt from permanent state and content definitions. |

---

## 15.4 Prestige Reset Draft

Exact rules require the future Prestige document, but implementation must support this structure:

| Data Area | Default Reset Behavior |
|---|---|
| Temporary resources | reset unless documented otherwise. |
| Permanent resources | keep. |
| Career current stage | reset to starting stage. |
| Highest career reached | keep or archive, depending on design. |
| Purchased temporary upgrades | reset unless marked permanent. |
| Prestige upgrades / bonuses | keep. |
| Achievements | keep if achievements are career legacy; otherwise separate lifetime/current-run state. |
| Statistics | preserve lifetime, reset current-run, archive previous run. |
| Unlocks | recompute from starting state plus permanent bonuses. |
| Active contracts | reset or archive as incomplete. |
| Active events | clear unless explicitly persistent. |
| Offline timestamp | reset to current time after prestige. |

No implementation should hardcode prestige deletion behavior before these rules are finalized in the Prestige source document.

---

# 16. Offline Progress Rules

## 16.1 Purpose

Offline Progress rewards preparation.

It must not replace active decision-making.

---

## 16.2 Offline Calculation Inputs

Offline progress may use:

- Team Output;
- Automation Coverage;
- Company systems;
- offline bonuses;
- active passive production systems;
- documented modifiers.

Manual clicking must not produce offline progress unless a documented upgrade or system allows it.

---

## 16.3 Offline Calculation Flow

On load:

1. Determine elapsed offline time from last saved timestamp.
2. Validate and clamp suspicious time values.
3. Apply offline cap rules.
4. Simulate eligible passive systems.
5. Apply eligible modifiers.
6. Generate an offline summary.
7. Apply resources and progress.
8. Update statistics.
9. Save the new timestamp.

---

## 16.4 Offline Summary

The player should be able to understand:

- time away;
- resources gained;
- contracts progressed, if applicable;
- major unlocks or achievements triggered, if applicable;
- what decisions are now available.

Offline summaries are UI presentation, but they should be built from structured simulation results.

---

# 17. Achievement Trigger Model

## 17.1 Purpose

Achievements celebrate meaningful accomplishments and discovery.

They should observe gameplay rather than own core progression.

---

## 17.2 Achievement Definition

Each achievement should define:

| Field | Purpose |
|---|---|
| id | Stable achievement identifier. |
| displayName | Player-facing name. |
| description | Player-facing description. |
| category | Career, Testing, Team, Automation, Contracts, Company, Prestige, Hidden, etc. |
| trigger | Structured condition or event trigger. |
| hiddenUntilUnlocked | Whether to hide it. |
| reward | Optional documented reward. |
| unlockId | Optional visibility gate. |
| resetBehavior | Lifetime, current-run or prestige-specific. |

---

## 17.3 Trigger Rules

Achievements may trigger from:

- events;
- statistics thresholds;
- resource totals;
- career milestones;
- system mastery;
- contract completion;
- prestige cycles.

Achievements must not require UI-specific actions unless the achievement is explicitly about UI interaction.

---

# 18. Statistics Ownership

## 18.1 Purpose

Statistics record the player's career history.

Statistics support achievements, player reflection and long-term motivation.

They should not directly drive core gameplay unless a documented requirement references them.

---

## 18.2 Statistics Model

Each statistic should define:

| Field | Purpose |
|---|---|
| id | Stable statistic identifier. |
| displayName | Player-facing name. |
| scope | Lifetime, current run, best run, session. |
| aggregation | Sum, max, count, last value, duration. |
| sourceEvents | Events that update it. |
| visibilityUnlockId | Optional visibility gate. |
| resetBehavior | What happens on prestige. |

---

## 18.3 Statistics Rules

Statistics should be updated through event observation or resource transactions, not scattered manual increments.

Lifetime statistics should survive prestige.

Current-run statistics should reset or archive during prestige.

Best-run statistics should compare archived run summaries.

---

# 19. UI Visibility States

## 19.1 Purpose

UI growth is part of gameplay progression.

The UI must reflect the player's career stage and unlock state.

---

## 19.2 Visibility States

UI surfaces should support these states:

| State | Meaning |
|---|---|
| hidden | Not rendered and not referenced. |
| teased | Hinted through copy or preview, no interaction. |
| locked | Visible but unavailable with clear requirement. |
| available | Player can unlock or interact conditionally. |
| active | Fully usable. |
| minimized | Available but visually secondary. |
| archived | Historical or previous-run view only. |

---

## 19.3 UI Rules

The UI must not reveal future systems too early.

A locked panel is still a reveal and must be controlled by design.

UI components should receive visibility state from the unlock system or derived selectors.

UI components must not decide unlock eligibility independently.

---

# 20. Data-Driven Content Format

## 20.1 Content Categories

The following should be content-data candidates:

- resources;
- career stages;
- promotions;
- upgrades;
- unlocks;
- achievements;
- contracts;
- events;
- statistics;
- prestige reset categories;
- UI panel metadata;
- tutorials/discovery messages.

---

## 20.2 Content Definition Rules

Every content item should have:

- stable id;
- type;
- display name if player-facing;
- source document owner;
- unlock rules if hidden at start;
- save behavior if persisted;
- validation rules;
- tags for grouping.

---

## 20.3 Content Validation

Development builds should validate content data for:

- duplicate IDs;
- missing references;
- circular prerequisites;
- invalid resource IDs;
- invalid unlock IDs;
- unreachable unlocks;
- missing reset behavior;
- invalid number formats;
- references to undocumented systems.

---

# 21. Testing Strategy

## 21.1 Testing Goals

QA Idle's technical risks are mostly systemic:

- resource calculations;
- unlock timing;
- save/load compatibility;
- offline progress;
- prestige reset behavior;
- large number handling;
- UI visibility correctness.

Tests should focus on those risks.

---

## 21.2 Required Test Categories

| Test Category | Purpose |
|---|---|
| Unit tests | Validate formulas, resource transactions, requirements and modifiers. |
| System tests | Validate each gameplay system in isolation. |
| Integration tests | Validate cross-system loops such as bugs -> reports -> money -> upgrades. |
| Save/load tests | Validate persistence, migration and missing field defaults. |
| Offline tests | Validate offline progress, caps and summaries. |
| Prestige tests | Validate reset/keep/convert/archive/recompute behavior. |
| Unlock tests | Validate hidden/teased/unlocked UI and system states. |
| Big-number tests | Validate calculations above normal number ranges. |
| Regression tests | Protect known progression paths. |
| UI smoke tests | Confirm visible systems match unlock state. |

---

## 21.3 Golden Path Tests

At minimum, automated tests should cover:

1. New player starts with only Junior QA-visible systems.
2. Manual testing creates Bugs Found.
3. Bug Reporting converts Bugs Found into Money.
4. Money buys a basic upgrade.
5. Upgrade changes production through the modifier system.
6. Promotion requirements become available when met.
7. Promotion changes career stage and unlocks the next documented layer.
8. Hidden systems remain hidden until unlocked.
9. Save/load preserves resources, upgrades, career and unlocks.
10. Offline progress grants only eligible passive gains.
11. Prestige preview matches actual reset result.
12. Lifetime statistics survive prestige.

---

# 22. Rules for Codex Implementation

Codex must follow these rules when implementing QA Idle features:

1. Read the relevant design document before changing code.
2. Do not implement undocumented mechanics.
3. Do not expose future systems before unlock rules allow it.
4. Keep UI and gameplay logic separated.
5. Prefer data definitions over hardcoded one-off content.
6. Use stable IDs for saved or referenced content.
7. Preserve save compatibility whenever possible.
8. Add or update migrations when save structure changes.
9. Add focused tests for gameplay logic changes.
10. Keep systems modular and avoid direct cross-system mutation.
11. Use resource transactions for resource changes.
12. Use events for cross-system reactions.
13. Keep prestige behavior explicit and previewable.
14. Keep offline progress understandable and bounded.
15. Never solve an architectural gap by hiding logic inside UI components.
16. If documentation is vague, stop and document the missing rule before implementing.

---

# 23. Implementation Readiness Gate

A gameplay feature is ready for implementation only when the following are known:

- owning system;
- source design document;
- stable IDs;
- unlock condition;
- resources consumed;
- resources produced;
- events emitted;
- events listened to;
- save fields;
- reset behavior;
- UI visibility state;
- test expectations.

If these cannot be answered, the feature is not yet technically ready.

---

# 24. Final Technical Statement

QA Idle should be implemented as a modular, data-driven incremental game where career progression controls complexity.

The architecture must protect the core design promise:

- the game starts simple;
- systems unlock gradually;
- every promotion expands responsibility;
- old systems remain understandable;
- save data survives future growth;
- prestige transforms progress rather than destroying it;
- UI reflects the player's career without owning gameplay rules.

The goal of technical implementation is not only to make the current prototype work.

The goal is to make the game capable of growing from one manually found bug into an entire expanding QA career without collapsing under hidden dependencies.
