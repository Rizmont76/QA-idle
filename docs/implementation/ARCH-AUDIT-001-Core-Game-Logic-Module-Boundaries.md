# ARCH-AUDIT-001 - Core Game Logic Module Boundary Audit

Status: Complete

## Scope

Target file: `src/gameLogic.ts`

Adjacent context reviewed:

- `src/gameData.ts`
- `src/types.ts`
- `src/save.ts`
- `src/gameLogic.test.ts`
- `src/main.tsx` import surface
- `docs/EPIC-AI-Assisted-Repository-Scalability.md`
- `docs/00-Master_Project_Roadmap.md`
- `docs/07-Technical_Rules.md`

Documentation conflict observed: `docs/00-Master_Project_Roadmap.md` still says MVP implementation has not started, but the repository contains implemented MVP gameplay, save, UI, and tests. This audit treats the current code as the implementation to preserve and does not change behavior.

## 1. Current Responsibility Map

`src/gameLogic.ts` currently owns several distinct responsibilities:

| Area | Current functions / types | Responsibility |
|---|---|---|
| UI/state selectors | `getUnlockState`, `getUiSurfaceState`, `getDerivedStats`, `getPromotionProgress`, `getPromotionStage`, `getStageIndex` | Read derived gameplay or visibility values for UI and tests. |
| Resource transaction validation | `validateResourceTransaction`, `addResource`, `spendResource`, `convertResources`, internal transaction helpers | Validate and apply resource balance changes atomically, build transaction metadata, emit `resource.changed`. |
| Modifier registry | `getUpgradeModifierDefinitions`, `getPermanentModifierInstanceId`, `createActiveModifierRegistry`, internal modifier validation | Convert purchased upgrades into active permanent modifier instances. |
| Stat formulas | `calculateGameplayStat`, `calculateGameplayStats`, `getDerivedStats` | Calculate MVP gameplay stat values and modifier breakdowns. |
| Upgrade purchase validation | `getUpgradeCost`, `validateUpgradePurchase`, internal upgrade failure mapping | Validate upgrade existence, visibility, ownership, affordability, and resolved effects. |
| Promotion requirement evaluation | `evaluatePromotionRequirements`, `getPurchasedUpgradeCount`, promotion progress label/prefix helpers | Evaluate promotion requirements and produce inspectable progress rows. |
| Promotion/unlock transition orchestration | `evaluatePromotionAvailabilityTransition`, `evaluatePromotionAvailability`, `acceptPromotion`, internal promotion unlock/surface lookup | Maintain promotion availability, promotion completion, related unlock/UI surface states, and promotion/career events. |
| Gameplay commands | `performManualTest`, `reportAllBugs`, `purchaseUpgrade`, `acceptPromotion` | Execute player intents by combining formulas, transactions, state mutation, derived totals, and events. |
| Event creation | resource helpers and gameplay commands | Construct event descriptors after committed state changes. |
| Presentation formatting | `formatNumber` | Format numbers for UI display. |

`src/gameData.ts` owns static definitions and initial state factories. `src/save.ts` owns save normalization and persistence, but it depends on game data factories and static definitions.

## 2. Mutable State Ownership

Runtime `GameState` is immutable-by-convention and is returned as cloned objects after each operation. Current ownership is split by fields:

| State field | Current owner in code | Notes |
|---|---|---|
| `resources` | Resource transaction helpers | Gameplay commands request changes; transactions own validation and balance updates. |
| `totalBugsFound`, `totalMoneyEarned` | Gameplay commands | Manual testing/reporting directly increment lifetime totals after resource operations. |
| `lastPlayedAt` | Gameplay commands and save layer | Commands set action time; `saveGame` overwrites on save. |
| `careerStage` | Promotion command | `acceptPromotion` sets the new stage. |
| `promotion` | Promotion availability/completion helpers | Availability and completion mutate promotion lists. |
| `uiSurfaces` | Promotion availability helpers and save normalization | Unlock-to-surface state is currently specialized to promotion. |
| `unlocks` | Promotion availability helpers and save normalization | Unlock state is currently updated directly by promotion logic. |
| `upgrades` | Upgrade purchase command | `purchaseUpgrade` sets ownership after resource spend. |

## 3. Pure Formulas And Calculations

Pure or mostly pure logic that can be extracted safely:

- Number formatting: `formatNumber`.
- Upgrade cost resolution: `getUpgradeCost`.
- Modifier instance ID generation and active registry building.
- Stat calculation and modifier breakdown generation.
- Purchased upgrade counting.
- Promotion requirement evaluation.
- Promotion progress row derivation.
- Resource transaction validation and projection.

These functions do not require React, browser APIs, or persistence APIs.

## 4. Registries And Static Definitions

Static definitions already live in `src/gameData.ts`:

- resources;
- gameplay stats;
- upgrades;
- career stages;
- promotions;
- UI surfaces;
- unlocks;
- initial state factories.

`src/gameLogic.ts` still performs registry lookup and validation against these definitions. That is acceptable for MVP, but extraction should keep definitions separate from runtime state and place registry-specific query helpers with their domain modules.

## 5. Gameplay Commands And State Mutations

The command layer currently consists of:

- `performManualTest`;
- `reportAllBugs`;
- `purchaseUpgrade`;
- `acceptPromotion`.

Each command follows the same broad pattern:

1. Calculate or validate command-specific inputs.
2. Call a resource transaction where applicable.
3. Clone and update `GameState`.
4. Re-evaluate promotion availability when relevant.
5. Emit events only after the state change succeeds.

This orchestration pattern should remain together in a command/engine module after lower-level domains are extracted.

## 6. Selectors And Derived Values

Selectors are mixed into `gameLogic.ts` beside mutations. Current UI imports from `src/main.tsx` are limited to:

- `formatNumber`;
- `acceptPromotion`;
- `getDerivedStats`;
- `getPromotionProgress`;
- `performManualTest`;
- `purchaseUpgrade`;
- `reportAllBugs`.

Selectors should be extracted separately from commands so UI can import read-only derived values without pulling in every mutation helper.

## 7. Event Creation And Dispatch

The code creates event descriptors but does not contain an event bus or listener dispatch. Event creation is currently local to:

- resource transactions: `resource.changed`;
- manual testing: `manualTest.performed`, `bugs.found`;
- bug reporting: `bugReport.submitted`, `money.earned`;
- upgrade purchase: `upgrade.purchased`;
- promotion availability/completion: `promotion.available`, `promotion.completed`, `career.stageChanged`, `unlock.revealed`.

Events are deterministic and emitted after successful state changes, matching the technical rule direction. A future extraction should keep event construction close to the command or transaction that commits the state change.

## 8. Persistence-Related Logic

`src/gameLogic.ts` does not read or write saves. Persistence logic is in `src/save.ts`, which normalizes:

- resources;
- upgrades;
- promotion state;
- career stage;
- unlock state;
- UI surface state;
- legacy raw game state fields.

The coupling risk is type/data-level rather than direct runtime coupling: future module extraction must preserve `GameState`, stable IDs, and initial state factories consumed by save normalization.

## 9. Offline Progress Logic

No offline progress simulation exists in `src/gameLogic.ts`. `lastPlayedAt` is updated by gameplay actions and save writes, but loading does not calculate offline gains. Future offline logic should be a separate domain module and should not be folded into the command module.

## 10. Validation Responsibilities

Current validation responsibilities:

- Resource transaction shape, resource existence, finite amounts, spendability, min/max bounds.
- Modifier support for MVP-only source/type/duration/stacking/target.
- Upgrade purchase existence, visibility, ownership, affordability.
- Promotion requirements and duplicate completion prevention.
- Save normalization in `src/save.ts`.

Validation is currently deterministic and testable. Extraction should preserve validation result shapes to avoid broad test churn.

## 11. Dependency Map

Current dependencies:

```text
src/main.tsx
  -> src/gameLogic.ts
    -> src/gameData.ts
    -> src/types.ts

src/save.ts
  -> src/gameData.ts
  -> src/types.ts

src/gameData.ts
  -> src/types.ts

src/gameLogic.test.ts
  -> src/gameLogic.ts
  -> src/gameData.ts
  -> src/types.ts
```

Internal conceptual dependencies inside `gameLogic.ts`:

```text
Gameplay commands
  -> resource operations
  -> stat selectors / modifier calculations
  -> upgrade validation
  -> promotion availability
  -> event descriptor creation

Promotion availability
  -> promotion definitions
  -> requirement evaluation
  -> unlock definitions
  -> UI surface definitions

Stat calculations
  -> gameplay stat definitions
  -> upgrade modifier definitions
  -> active modifier registry

Upgrade validation
  -> upgrade definitions
  -> resource transaction validation
```

## 12. Architectural Risks

1. `gameLogic.ts` is a broad domain aggregate: resource, modifier, upgrade, promotion, unlock/UI visibility, command orchestration, and formatting code are co-located in one 1,350-line file.
2. Promotion availability directly updates unlock and UI surface state, which is acceptable for the current MVP but will not scale when unlocks listen to more systems.
3. Gameplay commands re-run promotion availability after multiple actions. This is explicit but creates a growing orchestration dependency as more systems affect unlocks.
4. Formatting lives beside gameplay logic, which encourages UI presentation helpers to remain coupled to command code.
5. Resource operation types include `set` and `reset`, but the public transaction metadata only supports `add`, `spend`, and `convert`; this is harmless now but should be clarified before adding set/reset behavior.
6. Tests are strong but concentrated against the public aggregate module. Refactoring without maintaining a compatibility barrel would create unnecessary test and UI churn.

## 13. Recommended Module Boundaries

Recommended target structure:

```text
src/game/
  resources.ts
  modifiers.ts
  stats.ts
  upgrades.ts
  promotions.ts
  unlocks.ts
  selectors.ts
  commands.ts
  formatting.ts
  index.ts
```

Boundary rationale:

| Module | Owns | Should depend on |
|---|---|---|
| `resources.ts` | Resource transaction validation, add/spend/convert operations, transaction metadata | `types`, resource definitions passed as parameters/defaults |
| `modifiers.ts` | Modifier definition validation, permanent instance IDs, active registry creation | `types`, upgrade/stat definitions |
| `stats.ts` | Gameplay stat calculations and derived stats | `types`, `modifiers`, stat definitions |
| `upgrades.ts` | Upgrade cost and purchase validation | `types`, `resources`, upgrade definitions |
| `promotions.ts` | Promotion requirements, progress rows, stage resolution, availability/completion state transitions | `types`, promotion/career/unlock/surface definitions |
| `unlocks.ts` | Unlock and UI surface lookup/selectors, later generic unlock state transitions | `types`, unlock/surface definitions |
| `selectors.ts` | Read-only UI-facing selectors | domain modules |
| `commands.ts` | Player intent orchestration and post-command event composition | domain modules |
| `formatting.ts` | Display number formatting | no gameplay dependencies |
| `index.ts` | Compatibility exports for existing imports | all public modules |

`src/gameData.ts`, `src/types.ts`, and `src/save.ts` can remain at their current paths initially. Moving them should be a separate decision because save compatibility and import churn are higher risk.

## 14. Recommended Extraction Order

1. Add/confirm characterization tests for public exports and event ordering.
2. Extract `formatNumber` to `src/game/formatting.ts`.
3. Extract resource validation/operations to `src/game/resources.ts`.
4. Extract modifier registry helpers to `src/game/modifiers.ts`.
5. Extract stat calculations and `getDerivedStats` to `src/game/stats.ts`.
6. Extract upgrade cost and validation to `src/game/upgrades.ts`.
7. Extract promotion requirement/progress/stage/availability logic to `src/game/promotions.ts`.
8. Extract unlock/UI surface selectors and lookup helpers to `src/game/unlocks.ts`.
9. Move player action orchestration to `src/game/commands.ts`.
10. Convert `src/gameLogic.ts` into a compatibility barrel or replace imports with `src/game/index.ts`.

Run the full check after each extraction. Keep public behavior stable at every step.

## 15. Required Characterization Tests

Existing tests already cover many required behaviors in `src/gameLogic.test.ts`, including:

- modifier registry behavior;
- gameplay stat calculation;
- promotion requirement evaluation;
- promotion availability event ordering;
- promotion completion;
- future systems remaining hidden;
- resource transaction validation and atomicity;
- manual testing, bug reporting, and upgrade purchase commands.

Before or during extraction, add focused characterization where useful for:

- public export compatibility from `src/gameLogic.ts` or `src/game/index.ts`;
- `formatNumber` edge cases if moved first;
- transaction ID stability for resource operation ordering;
- promotion availability reset when requirements become unmet or stage changes;
- upgrade purchase validation mapping from resource failures;
- no event emission when any command fails.

## 16. Areas That Should Remain Together

- Gameplay command orchestration should remain together because command functions coordinate state, events, resource operations, and promotion availability.
- Promotion availability and promotion completion should remain in one module until a generic unlock engine exists.
- Resource validation and resource application should remain together to preserve atomicity.
- Modifier registry and stat calculation can be separate modules, but stat calculation should consume modifier registry output through a narrow interface.
- Save normalization should remain in `src/save.ts` during the first refactor and only import stable definitions/factories.

## 17. Circular Dependency Risks

The main circular dependency risk is between commands, promotions, upgrades, stats, and resources. Avoid this by enforcing one-way dependencies:

```text
commands -> promotions -> unlocks/selectors
commands -> upgrades -> resources
commands -> stats -> modifiers
commands -> resources

resources -> types/data only
modifiers -> types/data only
stats -> modifiers
upgrades -> resources
promotions -> unlocks/selectors
```

Domain modules must not import `commands.ts`. Formatting must not import gameplay modules.

## 18. Final Recommendation

Refactor now, incrementally.

The current file has clear domain boundaries, meaningful context-locality risks, and an existing characterization test suite that can protect behavior. The refactor should not change gameplay behavior and should be performed as a sequence of small extractions rather than a single large rewrite.
