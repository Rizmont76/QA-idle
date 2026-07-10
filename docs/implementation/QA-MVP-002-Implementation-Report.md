# QA-MVP-002 Implementation Report

Status: Complete  
Task: QA-MVP-002 - Make Future Systems Inert for MVP  
Implementation date: 2026-07-10  
Source of truth: frozen documentation in `docs/00 - Master Project Roadmap.md`, `docs/07 - Technical Rules.md`, `docs/08 - MVP Vertical Slice Specification.md`, and `docs/13 - Unlock System.md`

## 1. Summary

The prototype has been reduced to an MVP-only active runtime. The playable loop now contains manual bug finding, bug reporting for Money, manual upgrades, first-promotion progress, explicit promotion confirmation, save/load, and reset.

Excluded future systems no longer have active runtime behavior, visible UI, purchase actions, derived-stat influence, promotion influence, save restoration influence, notifications, or production timers.

This task intentionally does not implement the final MVP Resource System, Modifier System, Requirement Engine, Unlock System, stable ID registry, final upgrade registry, or versioned save schema. Those remain deferred to later backlog tasks.

## 2. Files Changed

- `src/types.ts`
- `src/gameData.ts`
- `src/gameLogic.ts`
- `src/save.ts`
- `src/main.tsx`
- `src/styles.css`
- `package.json`
- `pnpm-lock.yaml`

Created:

- `docs/implementation/QA-MVP-002-Implementation-Report.md`

## 3. Future Systems Removed or Made Inert

- Passive production was removed from derived stats and runtime effects.
- Offline resource gain was removed from save loading.
- Offline progress notifications were removed from UI.
- Achievement data, evaluation, saved state, notifications, and UI were removed from active runtime.
- Automation data, purchase behavior, saved state, derived-stat effects, and UI were removed from active runtime.
- Reputation state, production, costs, totals, resource display, and UI were removed from active runtime.
- Team upgrade data, tab visibility, purchase behavior, and stage activation were removed from active runtime.
- Statistics panel UI was removed. Only promotion-progress counters remain visible.
- Senior-stage and future career navigation paths were removed from active runtime.
- Future upgrade groups were removed from active gameplay.
- Promotion confirmation no longer navigates to or activates excluded systems.

## 4. Legacy Save Handling

`loadSave` remains tolerant of existing prototype saves and malformed data:

- Invalid JSON falls back to safe initial MVP state.
- Missing values fall back to safe defaults.
- Numeric MVP-compatible values are normalized to non-negative numbers.
- Only MVP-compatible fields are restored: `bugs`, `money`, `totalBugsFound`, `totalMoneyEarned`, `lastPlayedAt`, `careerStage`, and the two preserved manual prototype upgrades.
- Legacy excluded fields are ignored and are not carried into new saved state.
- Legacy `middle` career stage is allowed only as MVP completion state; no future gameplay is revealed or activated from it.
- No elapsed-time calculation is performed on load, so reloading cannot grant resources.

## 5. Remaining Prototype Code Intentionally Preserved

- The existing raw `GameState` shape is still a lightweight prototype state, not the final documented save schema.
- The two existing manual upgrade IDs, `checklist` and `coffee`, remain as temporary prototype content.
- Manual upgrades remain repeatable and cost-scaled for now.
- `bugsPerClick` remains as a temporary prototype derived value until the documented modifier stat IDs are introduced.
- `formatNumber` remains as a presentation helper.
- UI action handlers still execute gameplay directly pending later service-layer tasks.

## 6. Validation Commands and Results

Commands executed:

- `Get-Content` for required backlog, audit, roadmap, technical rules, MVP spec, unlock system, source files, styles, and package metadata.
- `rg --files -g 'QA-Idle-MVP-Implementation-Backlog.md' -g 'package.json'`
- `git status --short` - failed because `git` is not available in this shell.
- `pnpm install --frozen-lockfile` - failed because `pnpm` is not available directly.
- `npm.cmd install` - succeeded after approval; used to install dependencies for validation.
- `npm.cmd run build` - initially failed with a TypeScript 7.0.2 compiler panic.
- `corepack pnpm install --lockfile-only` - succeeded after pinning TypeScript and updated `pnpm-lock.yaml`.
- `npm.cmd run build` - succeeded after pinning TypeScript to `^5.9.3`.
- Final exclusion searches:
  - `rg -n "Team|Automation|Reputation|Achievements|Statistics|Offline Progress|offline progress|passive production|bugsPerSecond|achievement|automation|reputation|statistics|team|offline" src dist package.json`
  - `rg -n "senior|Senior|automationUpgrades|achievements|reputation|totalReputationEarned|getProgressTarget|hasStage|OFFLINE|MAX_OFFLINE|setInterval|offlineBugs" src dist package.json`

Final build result:

- Passed.
- Vite output included `dist/index.html`, one CSS asset, and one JS asset.

Test result:

- No automated test script exists in `package.json`.
- No tests were run beyond production build and static exclusion scans.

## 7. Manual Verification Results

Verified by source inspection and production-bundle search:

- No Team UI appears in source or built runtime.
- No Automation UI appears in source or built runtime.
- No Reputation UI or resource appears in source or built runtime.
- No Achievements or Statistics UI appears in source or built runtime.
- No passive production timer remains.
- No offline progress calculation or notification remains.
- Resources only change through explicit player actions.
- Reloading does not grant resources.
- Promotion sets the first promoted stage only and does not reveal future gameplay.
- Legacy excluded save fields are ignored by load normalization.
- Malformed saves fall back to initial MVP-compatible state.

## 8. Known Limitations Deferred to Later Backlog Tasks

- Final stable IDs are not implemented yet.
- Final MVP resource registry is not implemented yet.
- Final modifier stat registry is not implemented yet.
- Final one-time MVP upgrade definitions are not implemented yet.
- Final requirement engine is not implemented yet.
- Final unlock system is not implemented yet.
- Final versioned save schema is not implemented yet.
- UI still owns gameplay mutations until later service-layer tasks.
- Prototype upgrade semantics remain temporary and will be replaced by later MVP content tasks.

## 9. Documentation Conflicts or Blockers

No frozen-documentation conflict was found.

Tooling blockers encountered:

- `git` is unavailable in the current shell, so repository status could not be checked.
- Direct `pnpm` is unavailable; Corepack was used successfully for lockfile update.
- `npm` through PowerShell was blocked by script policy; `npm.cmd` worked.
- `typescript@7.0.2` crashed during build, so TypeScript was pinned to stable `^5.9.3`.
