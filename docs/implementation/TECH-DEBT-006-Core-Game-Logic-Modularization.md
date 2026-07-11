# TECH-DEBT-006 - Core Game Logic Modularization

Status: Complete

## Summary

Refactored `src/gameLogic.ts` into the approved `src/game/` domain modules without changing observable gameplay behavior. `src/gameLogic.ts` remains a compatibility barrel so existing UI and test imports continue to work.

## Module Interfaces

| Module | Public responsibility |
|---|---|
| `src/game/formatting.ts` | Number display formatting via `formatNumber`. |
| `src/game/resources.ts` | Resource transaction validation and atomic add, spend, and convert operations. |
| `src/game/modifiers.ts` | Upgrade modifier definition lookup and active modifier registry creation. |
| `src/game/stats.ts` | Gameplay stat calculation and derived MVP stats. |
| `src/game/upgrades.ts` | Upgrade cost lookup and purchase validation. |
| `src/game/promotions.ts` | Promotion requirement evaluation, progress rows, stage selection, availability transitions, and completion visibility helpers. |
| `src/game/unlocks.ts` | Unlock and UI surface selectors plus controlled-surface lookup. |
| `src/game/commands.ts` | Player action orchestration for manual testing, bug reporting, upgrade purchase, and promotion acceptance. |
| `src/game/index.ts` | Public domain barrel for game logic modules. |
| `src/gameLogic.ts` | Backward-compatible re-export barrel for existing imports. |

## Behavior Preservation

- Kept `src/gameData.ts`, `src/types.ts`, and `src/save.ts` at their existing paths.
- Preserved stable IDs, save shape, public exports, event ordering, transaction metadata, and promotion availability behavior.
- Did not activate offline progress or excluded future systems.
- Existing characterization tests continue to import through `src/gameLogic.ts`.

## Verification

- `npm run check`
- `npm run build`
