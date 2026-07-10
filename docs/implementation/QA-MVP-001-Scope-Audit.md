# QA-MVP-001 Scope Audit

Status: Complete  
Task: QA-MVP-001 - Audit Current Implementation Against MVP Scope  
Audit date: 2026-07-10  
Source of truth: frozen documentation in `docs/00 - Master Project Roadmap.md`, `docs/07 - Technical Rules.md`, and `docs/08 - MVP Vertical Slice Specification.md`

## 1. Executive summary

The current implementation is an early prototype and is not aligned with the frozen MVP scope. It implements or exposes several systems explicitly excluded from the MVP: Team, Automation, Reputation, Achievements, Statistics, Offline Progress, passive production, future career stages, future upgrades, and future UI tabs/panels.

The safest QA-MVP-002 path is to make the prototype's future systems inert immediately, then replace the current state shape and hardcoded gameplay functions with the documented MVP architecture in later backlog tasks. The current implementation can provide small reusable pieces, especially the React shell, save wrapper shape, number formatting helper, and some pure utility patterns, but most gameplay state, IDs, upgrade definitions, promotion logic, and UI-owned mutations should be replaced rather than incrementally patched.

Primary conflicts:

- MVP stable IDs are not used. Prototype IDs such as `junior`, `middle`, `checklist`, `coffee`, `juniorQa`, and `automationScripts` conflict with documented IDs such as `junior_qa`, `middle_qa`, `upgrade_better_checklist`, and `upgrade_coffee`.
- Future systems are active or conditionally visible after prototype promotions, but the MVP requires no future systems to appear even after confirming `promotion_junior_to_middle`.
- Passive and offline production are implemented, but the MVP permits explicit player actions only.
- UI handlers directly mutate gameplay state and contain authoritative formulas.
- Save data is an unversioned raw `GameState` snapshot and includes non-MVP fields.

## 2. Current implementation overview

The project is a small Vite/React app with gameplay data in `src/gameData.ts`, calculation helpers in `src/gameLogic.ts`, UI and gameplay action handlers in `src/main.tsx`, persistence in `src/save.ts`, and shared TypeScript types in `src/types.ts`.

Current gameplay loop:

- Manual action adds `bugs` using derived `bugsPerClick`.
- Reporting converts integer `bugs` to `money`, and later can also produce `reputation`.
- Repeatable upgrades increase click and passive production through `bugsPerClick`, `bugsPerSecond`, and `reportMultiplier`.
- Career stages are `junior`, `middle`, and `senior`.
- Middle stage reveals Team upgrades and passive production.
- Senior stage reveals Reputation, Automation upgrades, Achievements, and additional stats.
- Save/load applies offline bugs based on `bugsPerSecond`.

MVP target loop:

- Only `bugs_found` and `money` resources exist.
- Manual Testing immediately adds `manual_bugs_per_action` to `bugs_found`.
- Bug Reporting converts all held `bugs_found` to `money` using `money_per_bug_reported`.
- Five one-time MVP upgrades modify gameplay through documented modifier targets.
- Promotion requires lifetime bugs >= 100, lifetime money >= 150, and purchased upgrades >= 3.
- Confirmed promotion sets `career.currentStageId` to `middle_qa` and does not reveal Team, Automation, Reputation, or Middle QA gameplay.

## 3. File-by-file findings

### `src/gameData.ts`

- `SAVE_KEY = "qa-idle-save-v1"` stores an unversioned prototype save under a v1-style key. Classification: stub for legacy load/migration handling, then replace with versioned schema.
- `BUG_VALUE`, `MAX_OFFLINE_SECONDS`, `OFFLINE_TOAST_MS`, `ACHIEVEMENT_TOAST_MS`, and `PROMOTION_TOAST_MS` mix gameplay constants and UI timing. Offline and achievement constants are non-MVP. Classification: remove offline/achievement constants; leave or replace formatting/UI constants only if still needed.
- `upgrades` includes repeatable manual upgrades with undocumented IDs, costs, cost scaling, and effects. It also includes Team upgrades `juniorQa` and `middleQa`. Classification: replace upgrade definitions with exact MVP one-time upgrade registry; remove Team upgrade content for MVP.
- `automationUpgrades` defines Automation content, Reputation costs, report multipliers, and passive production. Classification: remove from active MVP registries or keep only as fully inert future stubs outside gameplay/save/UI.
- `initialState` includes `reputation`, `totalReputationEarned`, `automationUpgrades`, `achievements`, `careerStage: "junior"`, and direct `bugs`/`money` fields. Classification: replace with MVP save/state factory using resources, career, upgrades, unlocks, and lifetime counters.
- `careerStages` includes future `senior` stage and hardcoded `canPromote` functions with prototype OR requirements. Classification: replace with data-driven `junior_qa`, `middle_qa`, and `promotion_junior_to_middle`; remove senior from MVP active data.
- `achievements` defines excluded Achievements, including Team, Reputation, Automation, and Statistics-like triggers. Classification: remove from active MVP code or keep as inaccessible future stub with no imports from runtime.

### `src/gameLogic.ts`

- `getUpgradeCost` supports repeatable exponential scaling. MVP upgrades are one-time fixed-cost purchases. Classification: replace for MVP upgrade purchasing; a generic helper may be reused later only if data-driven and not active for MVP.
- `formatNumber` is a reusable display helper, though it should stay separate from gameplay calculations and support MVP caps. Classification: leave unchanged for now or move to a presentation utility later.
- `getDerivedStats` calculates `bugsPerClick`, `bugsPerSecond`, and `reportMultiplier` by reading current upgrade levels directly. It includes Automation upgrades and passive production. Classification: replace with MVP modifier/stat calculation for `manual_bugs_per_action` and `money_per_bug_reported`; remove passive production from active output.
- `getProgressTarget` mixes money and reputation upgrade targets and drives future UI progress. Classification: remove or replace with MVP promotion progress selector.
- `getStageIndex`, `hasStage`, and `getPromotionStage` use ordered career arrays and hardcoded `canPromote` callbacks. Classification: replace with requirement engine and promotion state; do not use stage order to unlock future systems in MVP.

### `src/main.tsx`

- UI owns gameplay actions in `runQaTest`, `reportBugs`, `buyUpgrade`, `buyAutomationUpgrade`, `promote`, and `resetSave`. These functions directly mutate resources, upgrades, career, reputation, totals, and timestamps. Classification: replace with gameplay service calls; UI should send intents only.
- `useEffect(() => saveGame(game), [game])` autosaves raw state. Classification: stub until versioned save/save events exist.
- Achievement unlock effect evaluates achievements and mutates achievement state when Automation is available. Classification: remove for MVP.
- Passive production interval adds bugs every 100 ms from `stats.bugsPerSecond`. Classification: remove for MVP.
- Offline welcome toast displays `offlineBugs`. Classification: remove or hide; no offline gains in MVP.
- `reportBugs` can create Reputation after Senior QA and uses `reportMultiplier`; it also hardcodes the conversion formula in UI. Classification: replace with MVP bug-reporting service using `money_per_bug_reported`; remove Reputation production.
- `buyAutomationUpgrade` is active future gameplay. Classification: remove or fully hide/inert.
- `promote` automatically changes tabs to Team or Automation after promotion. This directly conflicts with DN-01. Classification: replace; confirmed MVP promotion must set `middle_qa` and show only a completion state.
- `availableTabs` includes Team and Automation tabs. Classification: hide/remove for MVP.
- Top icons expose Achievements and Stats labels. Classification: hide/remove.
- Reputation resource card, Automation shop, Achievements panel, Stats panel, passive production displays, future stage copy, and next-upgrade progress panel expose excluded or future systems. Classification: hide/remove for MVP.

### `src/save.ts`

- Saves and loads raw `GameState` without `meta.schemaVersion`, `createdAt`, `lastSavedAt`, migrations, resource maps, unlock state, promotion history, or modifier restoration. Classification: replace with versioned MVP save schema.
- `normalizeAchievements` imports achievement definitions and preserves excluded achievement state. Classification: remove from MVP save path or quarantine as ignored legacy data.
- `normalizeCareerStage` infers `middle` or `senior` from prototype future fields. Classification: replace; legacy stage IDs should migrate to documented IDs without unlocking future systems.
- Load applies offline production by computing `getDerivedStats(baseGame).bugsPerSecond * elapsedSeconds`. Classification: remove for MVP; loading must not grant offline progress.
- `lastPlayedAt` is used for offline gain and autosave timing. MVP save meta still needs timestamps, but not offline production. Classification: stub timestamp field into versioned meta; remove gameplay effect.

### `src/types.ts`

- `UpgradeId`, `AutomationUpgradeId`, `AchievementId`, `TabId`, and `CareerStage` encode prototype and future IDs. Classification: replace with documented stable IDs and MVP-only active types.
- `Upgrade` model uses `group`, `baseCost`, `costGrowth`, `bugsPerClick`, and `bugsPerSecond`, which supports repeatable and passive effects rather than one-time data-driven modifiers. Classification: replace.
- `AutomationUpgrade`, `Achievement`, and Reputation-bearing `ProgressTarget` are non-MVP active types. Classification: remove from active MVP types or move to inert future-only placeholders.
- `DerivedStats` includes `bugsPerSecond` and `reportMultiplier`; MVP needs `manual_bugs_per_action` and `money_per_bug_reported`. Classification: replace.
- `GameState` directly stores `bugs`, `money`, `reputation`, totals, raw upgrade level maps, automation upgrades, and achievements. Classification: replace with MVP schema-aligned state.
- `CareerStageDefinition.canPromote` embeds requirement logic as functions in data. Classification: replace with structured requirement definitions.

### `package.json`

- Scripts are minimal: `dev`, `build`, and `preview`. No test runner is configured. Classification: leave unchanged for QA-MVP-001. QA-MVP-002 can use `pnpm build` for type/build validation, but later test tasks will need test tooling decisions.

## 4. MVP scope violations

- Team: Team upgrades `juniorQa` and `middleQa`, Team tab, Team copy, Team stage unlock, and Team passive output are implemented.
- Automation: Automation upgrade definitions, Automation tab/shop, Automation unlock conditions, Automation achievement triggers, and Automation-derived stat effects are implemented.
- Reputation: `reputation`, `totalReputationEarned`, Reputation card, Reputation costs, and Reputation rewards are implemented.
- Achievements: Achievement definitions, saved achievement state, achievement toast, achievement panel, and achievement unlock effect are implemented.
- Statistics: Stats UI panel and stat-like totals are visible. Lifetime bugs and money are allowed for promotion, but a Statistics system/panel is excluded.
- Offline Progress: load grants offline bugs, offline cap is defined, and welcome-back offline toast is displayed.
- Passive production: `bugsPerSecond` exists in data/types/derived stats and is applied by a timer.
- Future career stages: `senior` is active in types/data/UI, and `middle` unlocks Team gameplay rather than being only the MVP completion state.
- Future upgrades: Team and Automation upgrades are active, repeatable, and not documented in the MVP.
- Future UI panels/tabs: Team tab, Automation tab, Reputation resource card, Achievements panel, Stats panel, future progress panel, and top Achievements/Stats icons are rendered.
- Undocumented resources/gameplay stats: `reputation`, `totalReputationEarned`, `bugsPerClick`, `bugsPerSecond`, and `reportMultiplier` are active prototype constructs outside the documented MVP naming model.

## 5. Classification table

| Area | Location | Classification | QA-MVP-002 action |
|---|---|---:|---|
| Team upgrades `juniorQa`, `middleQa` | `src/gameData.ts`, `src/types.ts`, `src/main.tsx` | remove | Remove from active data, state, UI, and calculations. |
| Team tab/panel/stage unlock | `src/main.tsx` | hide | Do not render during MVP, including after promotion. |
| Automation upgrade registry | `src/gameData.ts` | remove | Remove from active imports/calculation/save. |
| Automation tab/shop/action | `src/main.tsx` | hide | Do not render or allow purchases. |
| Reputation resource and totals | `src/types.ts`, `src/gameData.ts`, `src/main.tsx`, `src/save.ts` | remove | Remove from active state and UI; ignore legacy values on load. |
| Achievements definitions/state/UI | `src/gameData.ts`, `src/types.ts`, `src/main.tsx`, `src/save.ts` | remove | Remove active achievement processing and UI. |
| Stats panel | `src/main.tsx` | hide | Replace with MVP promotion progress and resource displays only. |
| Lifetime bugs and lifetime money counters | `src/types.ts`, `src/main.tsx`, `src/save.ts` | leave unchanged conceptually | Keep the concept for promotion, but rename/rehome under MVP schema. |
| Offline progress calculation | `src/save.ts` | remove | Loading must not grant resources. |
| Offline toast/state | `src/main.tsx`, `src/gameData.ts` | hide | Remove UI and runtime state. |
| Passive production timer | `src/main.tsx` | remove | No timers or passive bugs in MVP. |
| `bugsPerSecond` | `src/gameData.ts`, `src/gameLogic.ts`, `src/types.ts` | remove | Exclude from MVP stat registry and calculations. |
| `bugsPerClick` | `src/gameData.ts`, `src/gameLogic.ts`, `src/types.ts` | replace | Map concept to `manual_bugs_per_action`. |
| `reportMultiplier` | `src/gameData.ts`, `src/gameLogic.ts`, `src/types.ts` | replace | Use additive `money_per_bug_reported`. |
| Career IDs `junior`, `middle`, `senior` | `src/gameData.ts`, `src/types.ts`, `src/save.ts` | replace | Use `junior_qa` and `middle_qa`; quarantine `senior`. |
| Prototype promotion requirements | `src/gameData.ts`, `src/gameLogic.ts` | replace | Use documented AND requirements through requirement engine. |
| Prototype upgrade IDs/costs/scaling | `src/gameData.ts`, `src/types.ts` | replace | Use the five documented one-time MVP upgrade IDs and costs. |
| Raw `GameState` save | `src/save.ts`, `src/types.ts` | replace | Use versioned save schema with resources/career/upgrades/unlocks. |
| `formatNumber` | `src/gameLogic.ts` | leave unchanged | Reuse as display helper if kept isolated from gameplay. |
| Basic React shell and localStorage wrapper | `src/main.tsx`, `src/save.ts` | stub | Reuse shape, but route through MVP services/schema. |

## 6. Reusable code

- `formatNumber` can be reused as an MVP display helper after confirming it handles values up to 1,000,000 consistently and remains presentation-only.
- `getUpgradeCost` may be useful later for repeatable future upgrades, but it should not be active for MVP fixed one-time upgrades.
- The high-level React app shell can be reused structurally, but most rendered content should be simplified to MVP surfaces.
- `loadSave`, `saveGame`, and `clearSave` can provide a small localStorage wrapper pattern, but the data shape and offline side effects should be replaced.
- `normalize*` loading patterns are directionally useful for safe defaults, but the current functions normalize excluded systems and prototype IDs.
- The existing `useMemo` pattern for derived display values is reusable if fed by gameplay selectors instead of UI-owned formulas.

## 7. Code recommended for replacement

Replacement is safer than refactoring in these areas:

- `GameState` and save/load shape: current fields conflict with the documented save schema and include excluded systems.
- Upgrade definitions and purchase logic: current model is repeatable, scaling, group-based, and uses non-MVP IDs.
- Derived stat calculation: current `bugsPerClick`/`bugsPerSecond`/`reportMultiplier` model conflicts with MVP modifier target IDs and allows passive production.
- Promotion logic: current callback-based OR requirements conflict with the MVP's structured AND requirements.
- UI action handlers: current handlers are authoritative gameplay logic and mutate state directly.
- Future-system UI: Team, Automation, Reputation, Achievements, Stats, and future progress surfaces should be removed from MVP rendering rather than patched behind more conditionals.
- Offline progress: current load-time mutation should be removed entirely for MVP.

## 8. Risks for QA-MVP-002

- Removing future fields without safe legacy handling may break existing local saves. QA-MVP-002 should ignore or quarantine excluded fields rather than trusting them.
- Current saves may infer `middle` or `senior` based on Team, Automation, or Reputation fields. That migration path must not unlock future systems.
- UI and gameplay logic are tightly coupled, so hiding UI alone will not fully disable future behavior. Passive production and offline progress must be removed from the runtime path.
- Reusing current `careerStage` ordering can accidentally re-enable Team after MVP promotion. The MVP completion state should not be treated as "stage index >= middle unlocks Team."
- Prototype total counters are useful for promotion, but they currently coexist with the excluded Statistics concept. QA-MVP-002 should keep only MVP lifetime counters required by the promotion.
- Lack of tests means QA-MVP-002 should at least run the build and manually inspect for excluded UI strings until formal tests are added later.

## 9. Recommended implementation approach for QA-MVP-002

1. Create an MVP-only active state path that excludes Reputation, Automation, Achievements, senior career stage, passive production, and offline grants.
2. Hide or remove all future UI surfaces first: Team tab, Automation tab, Reputation card, Achievements panel, Stats panel, top Achievements/Stats icons, and offline toast.
3. Remove runtime side effects for passive production, achievement unlocking, automation purchases, reputation earning, and offline gains.
4. Keep legacy save loading tolerant by defaulting non-MVP fields away, but do not let legacy future fields affect career, resources, unlocks, or UI.
5. Replace promotion behavior so confirming the first promotion only records completion and sets the current stage to `middle_qa`; it must not switch to Team or Automation.
6. Preserve only the MVP-visible gameplay loop until later tasks introduce stable IDs, registries, resource transactions, modifiers, requirements, unlocks, and versioned saves.
7. Prefer replacing conflicted prototype modules incrementally by backlog phase instead of trying to preserve current data shapes.

## Deliverable notes

- Created files: `docs/implementation/QA-MVP-001-Scope-Audit.md`
- Modified files: none in production source; no frozen documentation was modified.
- Build/tests run: not run for this audit-only task.
- Blockers: `git` is not available in the current shell, so repository status could not be checked through `git status`.
- Documentation conflicts: none found in the frozen docs. The implementation conflicts with the documented MVP scope, and the docs consistently state that the prototype is not authoritative.
