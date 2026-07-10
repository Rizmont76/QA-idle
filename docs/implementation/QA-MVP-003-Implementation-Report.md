# QA-MVP-003 Implementation Report

Status: Complete  
Task: QA-MVP-003 - Define MVP Stable ID Constants

## What Changed

- Added centralized MVP stable ID constants and derived ID union types in `src/types.ts`.
- Updated current career, UI surface group, and active prototype upgrade references to use the MVP stable IDs.
- Preserved minimal legacy save normalization for old `junior`/`middle`, `checklist`, and `coffee` values.

## Key Files

- `src/types.ts`
- `src/gameData.ts`
- `src/save.ts`
- `src/main.tsx`
- `src/gameLogic.test.ts`
- `src/save.test.ts`

## Validation

- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed.
- `pnpm run test:run`: passed.
- Focused Prettier check on touched source/test files: passed.
- `pnpm run check`: passed.

## Limitation / Follow-Up

- QA-MVP-003 only centralizes stable IDs. Later backlog items still need to replace prototype upgrade economics and build resource/stat registries from these IDs.
