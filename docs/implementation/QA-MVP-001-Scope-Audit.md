# QA-MVP-001 Scope Audit

Status: Complete
Task: QA-MVP-001 - Audit Current Implementation Against MVP Scope
Audit date: 2026-07-10
Source of truth: `docs/00 - Master Project Roadmap.md`, `docs/07 - Technical Rules.md`, and `docs/08 - MVP Vertical Slice Specification.md`

## Summary

The current implementation is already reduced to an MVP-only runtime. No active Team, Automation, Reputation, Achievements, Statistics, Offline Progress, passive production, or future-stage gameplay modules were found in `src/`.

The code still has prototype architecture and content that later backlog items must replace, but those issues are not active excluded systems:

- UI handlers in `src/main.tsx` still own gameplay mutations.
- Upgrades in `src/gameData.ts` are still repeatable and cost-scaled instead of the exact five one-time MVP upgrades.
- Resource balances are direct `GameState` fields rather than registry-driven resource state.
- Promotion checks are callback-based rather than shared requirement evaluation.
- Save/load is tolerant and MVP-only, but not yet the final versioned MVP schema.

Documentation conflicts found: none in the frozen docs. Where implementation is still prototype-shaped, the docs remain the authority for later backlog tasks.

## Exclusion Audit

| Excluded or future area | Current implementation finding | Classification | Follow-up |
|---|---|---:|---|
| Team | No Team data, UI, save fields, production, or unlock behavior found. | leave unchanged | None for QA-MVP-002. |
| Automation | No Automation data, UI, save fields, production, or unlock behavior found. | leave unchanged | None for QA-MVP-002. |
| Reputation | No Reputation resource, UI, save field, or earning path found. | leave unchanged | None for QA-MVP-002. |
| Achievements | No Achievement definitions, UI, save fields, or runtime checks found. | leave unchanged | None for QA-MVP-002. |
| Statistics | No Statistics system or stats panel found. Lifetime bugs and lifetime money are present only as MVP promotion counters. | leave unchanged | Keep counters scoped to promotion until the later save/progression tasks rehome them. |
| Offline Progress | Load does not compute elapsed offline gains and no offline summary UI exists. `lastPlayedAt` is timestamp metadata only. | leave unchanged | Ensure later save work does not add offline gains during the MVP. |
| Passive production | No `setInterval`, tick loop, `bugsPerSecond`, or passive resource production found. | leave unchanged | None for QA-MVP-002. |
| Future career gameplay | `middle_qa` exists only as the documented MVP completion state. No Middle QA systems unlock after promotion. | leave unchanged | Preserve this behavior until a future vertical slice documents Middle QA gameplay. |
| Future UI panels | Current UI renders Manual Work, resources, actions, promotion progress, and completion copy only. No excluded panels were found. | leave unchanged | None for QA-MVP-002. |

## File Notes

- `src/types.ts`: Contains MVP stable ID constants and MVP-facing types. No excluded system types are active.
- `src/gameData.ts`: Contains only Junior QA, Middle QA, two prototype manual upgrades, and MVP promotion constants. Upgrade economics still conflict with the later MVP upgrade-content task, not with this scope-lock audit.
- `src/gameLogic.ts`: Contains formatting, upgrade-cost, derived-stat, and promotion helpers. No passive or excluded-system calculations are present.
- `src/main.tsx`: Renders the playable MVP loop and completion state. Gameplay logic still lives in UI handlers and should be moved by later architecture tasks.
- `src/save.ts`: Loads and saves only MVP-compatible fields, normalizes legacy `checklist`/`coffee` and `middle` values, and ignores excluded legacy fields by omission.
- `src/styles.css`: Styling only; no excluded gameplay surfaces were identified by source search.

## QA-MVP-002 Guidance

QA-MVP-002 appears effectively satisfied by the current source state, but the backlog item itself should still be handled separately because it has its own acceptance and verification requirements.

Recommended next checks for QA-MVP-002:

1. Confirm no excluded strings or identifiers exist in `src/` beyond documentation or test-safe terminology.
2. Confirm no load path restores excluded fields from legacy saves.
3. Confirm promotion to `middle_qa` does not reveal Team, Automation, Reputation, or other future systems.
4. Run the project check and the smallest runtime/build verification required by the backlog.

## Verification Performed

- Read the related frozen docs named by the backlog item.
- Inspected `src/gameData.ts`, `src/gameLogic.ts`, `src/main.tsx`, `src/save.ts`, `src/types.ts`, and current tests.
- Searched `src/` for Team, Automation, Reputation, Achievements, Statistics, Offline Progress, passive production, timers, future career UI, and related identifiers.
