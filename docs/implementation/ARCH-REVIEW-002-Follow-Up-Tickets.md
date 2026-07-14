# ARCH-REVIEW-002 - Follow-Up Tickets

Status: Proposed

## Summary

Architecture review follow-up tickets for the current QA Idle MVP implementation.

These tickets are subordinate to the frozen design documents. They do not authorize new gameplay systems, resources, progression rules, unlock conditions, or UI panels. Any implementation must continue to follow `docs/07-Technical_Rules.md` and `docs/08-MVP_Vertical_Slice_Specification.md`.

## Recommended Order

1. `ARCH-002-01` - Prevent hidden upgrade/content leakage.
2. `ARCH-002-02` - Make promotion progress stage-aware.
3. `ARCH-002-03` - Make upgrade save normalization registry-driven.
4. `ARCH-002-04` - Design lifetime progression/stat ownership.
5. `ARCH-002-05` - Design event bus v2 state reaction model.

Tickets 1-3 are implementation-ready. Tickets 4-5 should be designed before code changes because they affect long-term system ownership and event/state flow.

---

## ARCH-002-01 - Prevent Hidden Upgrade And Content Leakage

Status: Completed

Priority: P1

### Problem

`src/main.tsx` renders every entry from the `upgrades` registry directly. If future slices add hidden, locked, stage-gated, or future-system upgrade definitions, their names, descriptions, costs, and availability state can appear immediately in the UI.

Purchase validation blocks non-active upgrades, but the architecture requires hidden/future content to remain invisible until an unlock or selector exposes it.

### Relevant Files

- `src/main.tsx`
- `src/game/upgrades.ts`
- `src/game/unlocks.ts`
- `src/gameData.ts`
- `src/gameLogic.test.ts`
- `src/main.test.tsx`

### Proposed Fix

Add a gameplay-layer selector for visible/purchasable upgrade definitions and have React render only selector-approved upgrades.

Keep authoritative visibility in the game layer. UI should display selector output and send purchase intents only.

### Acceptance Criteria

- UI no longer maps over raw `upgrades`.
- Hidden or locked upgrade definitions do not render in the shop.
- Hidden or locked upgrade definitions remain unpurchasable through command validation.
- Existing MVP upgrade behavior is unchanged.
- Tests cover at least one hidden future upgrade definition staying invisible.

### Verification

- `cmd /c npm run check`
- Passed on 2026-07-14.

---

## ARCH-002-02 - Make Promotion Progress Stage-Aware

Status: Completed

Priority: P1

### Problem

`getPromotionProgress` reads `promotionDefinitions[0]` instead of selecting the active promotion for the current career stage.

Other promotion logic is current-stage aware, so this selector can drift from the actual active promotion once additional promotions or post-MVP stages are added.

### Relevant Files

- `src/game/promotions.ts`
- `src/main.tsx`
- `src/gameData.ts`
- `src/gameLogic.test.ts`
- `src/main.test.tsx`

### Proposed Fix

Select the promotion definition by `game.careerStage`, matching `getPromotionStage` and `evaluatePromotionAvailabilityTransition`.

When no promotion exists for the current stage, return an empty progress list and ensure UI copy handles the completed/no-next-promotion state cleanly.

### Acceptance Criteria

- Promotion progress uses the promotion whose `fromCareerStageId` matches `game.careerStage`.
- A stage with no active promotion returns no progress rows.
- Existing Junior QA to Middle QA MVP behavior is unchanged.
- Tests cover Junior QA progress and Middle QA/no-next-promotion behavior.

### Verification

- `cmd /c npm run check`
- Passed on 2026-07-14.

---

## ARCH-002-03 - Make Upgrade Save Normalization Registry-Driven

Status: Completed

Priority: P2

### Problem

`normalizeUpgrades` manually enumerates every MVP upgrade ID. Future upgrade definitions require matching save-layer edits or they may be dropped, defaulted incorrectly, or missed during save compatibility work.

This conflicts with the data-driven registry direction already used by initial upgrade state creation.

### Relevant Files

- `src/save.ts`
- `src/gameData.ts`
- `src/types.ts`
- `src/save.test.ts`

### Proposed Fix

Normalize upgrade ownership by iterating over the `upgrades` registry, using each upgrade's `maxLevel`.

Preserve legacy aliases for previous raw save fields such as `checklist` and `coffee` through a small alias map.

### Acceptance Criteria

- Save normalization derives all current upgrade keys from the `upgrades` registry.
- Missing upgrade keys default to `0`.
- Invalid, negative, non-finite, or over-max values are sanitized.
- Legacy `checklist` and `coffee` aliases still migrate correctly.
- Tests prove a newly registered upgrade key is normalized without adding per-ID code.

### Verification

- `cmd /c npm run check`
- Passed on 2026-07-14.

---

## ARCH-002-04 - Design Lifetime Progression And Stat Ownership

Status: Completed

Priority: P2

### Problem

`totalBugsFound` and `totalMoneyEarned` are incremented directly in gameplay commands beside resource transactions. This is acceptable for the MVP, but future passive, offline, team, automation, contract, or company systems could add resources without updating lifetime progression counters.

The architecture expects statistics and lifetime progress to observe transactions/events or use a clearly owned progression model.

### Relevant Files

- `src/game/commands.ts`
- `src/game/resources.ts`
- `src/game/stats.ts`
- `src/save.ts`
- `src/types.ts`
- `docs/07-Technical_Rules.md`
- `docs/11-Resource_System.md`

### Design Questions

- Are lifetime counters resource-derived statistics, current-run career progress fields, or a dedicated MVP progress system?
- Should resource transactions update lifetime counters directly, emit events consumed by statistics, or return structured deltas for a coordinator?
- Which lifetime counters survive prestige, reset per run, or archive into previous-run history?
- How should offline gains feed the same lifetime accounting path?

### Acceptance Criteria

- A design note identifies the owning system for lifetime counters.
- The update path covers active actions, passive production, offline progress, and future resource-producing systems.
- Save/load and prestige implications are documented before implementation.
- No code change is made until the ownership decision is recorded.

### Design Decision

The ownership decision is recorded in `docs/11-Resource_System.md` under MVP Progression Counters.

- MVP `Lifetime Bugs Found` and `Lifetime Money Earned` counters are not Resource System Resources.
- The Statistics System owns their saved progression-counter state, mutation rules, reset behavior, and read-only query interface for Promotion and Unlock systems.
- Successful Resource Transactions are the authoritative source for counter updates. Counter mutation happens inside the same committed gameplay transaction that applies the resource change, before post-commit gameplay events are emitted.
- Failed or rolled-back resource transactions must not update lifetime counters.
- Active actions, passive production, offline progress, and future resource-producing systems must feed lifetime accounting through the same committed transaction path rather than scattered direct increments.
- MVP lifetime progression counters reset only for a new save or explicit full save reset. Future Prestige behavior must be documented before Prestige can reset, preserve, convert, or archive these counters differently.

### Verification

- Documentation review against `docs/07-Technical_Rules.md` and `docs/11-Resource_System.md`.
- `pnpm run check`
- Passed on 2026-07-14.

---

## ARCH-002-05 - Design Event Bus V2 State Reaction Model

Status: Needs Design

Priority: P2

### Problem

The current event bus delivers ordered notifications to listeners but does not support state-producing reactions, deterministic transaction phases, rollback behavior, or listener-owned state updates.

That is enough for MVP test observation. It is not enough for future unlocks, statistics, achievements, offline summaries, temporary modifiers, and event-driven reactions without hidden side effects.

### Relevant Files

- `src/game/events.ts`
- `src/game/commands.ts`
- `src/game/resources.ts`
- `src/game/promotions.ts`
- `docs/07-Technical_Rules.md`
- `docs/06-Game_Systems.md`

### Design Questions

- Can listeners return state transitions, or are events purely observational?
- If listeners can update state, which coordinator applies those updates?
- How are listener order, rollback, validation failure, and repeated reactions handled?
- Which events are transient and which, if any, are persisted?
- How do unlocks, statistics, achievements, and future temporary events subscribe without circular dependencies?

### Acceptance Criteria

- A design note defines event listener capabilities and limits.
- State-producing reactions, if allowed, have explicit ordering and rollback rules.
- The design preserves the MVP rule that events emit only after committed changes.
- The design identifies at least one future implementation path for unlock/stat/achievement reactions.
- No code change is made until the event reaction model is recorded.

### Verification

- Documentation review against `docs/07-Technical_Rules.md` event bus requirements.
