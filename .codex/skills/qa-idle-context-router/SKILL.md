---
name: qa-idle-context-router
description: Route QA Idle implementation, review, or documentation tasks to the smallest relevant design docs and source files. Use before reading project docs for QA Idle work, especially when the task mentions upgrades, unlocks, promotions, resources, save/load, UI, frontend layout, testing, or architecture.
---

# QA Idle Context Router

Use this skill to choose the minimum context needed before editing or reviewing QA Idle.

## Routing

- **Always start**: `AGENTS.md`.
- **Architecture or cross-system behavior**: `docs/07 - Technical Rules.md`.
- **MVP scope or feature boundaries**: `docs/08 - MVP Vertical Slice Specification.md`.
- **Core loop, manual actions, idle/offline flow**: `docs/02 - Core Gameplay Loop.md`.
- **Career stages and role progression**: `docs/04 - Career System.md`.
- **Progression pacing**: `docs/05 - Progression.md`.
- **General systems map**: `docs/06 - Game Systems.md`.
- **Modifiers**: `docs/09 - Modifier System.md`.
- **Economy, pricing, rewards**: `docs/10 - Economy Framework.md`.
- **Resources and currencies**: `docs/11 - Resource System.md`.
- **Upgrades**: `docs/12 - Upgrade System.md`, `src/gameData.ts`, `src/gameLogic.ts`.
- **Unlocks**: `docs/13 - Unlock System.md`.
- **Promotions**: `docs/14 - Promotion System.md`, `src/gameData.ts`, `src/gameLogic.ts`.
- **Save/load or persisted state**: `docs/07 - Technical Rules.md`, `src/save.ts`, `src/types.ts`, `src/save.test.ts`.
- **UI changes**: `src/main.tsx`, `src/styles.css`, plus the relevant gameplay doc for any displayed mechanic.
- **Tests**: nearest existing test file, usually `src/gameLogic.test.ts` or `src/save.test.ts`.

## Workflow

1. Identify the task category from the routing list.
2. Read only the listed docs/files first.
3. Use targeted search for exact terms before opening extra numbered docs.
4. If more docs are needed, name why before reading them.
5. Summarize the loaded context in 2-5 bullets for multi-doc tasks.
6. Do not paste long excerpts; cite filenames and the rule or behavior.

Keep outcome-critical rules in `AGENTS.md`; this skill only narrows what to read.
