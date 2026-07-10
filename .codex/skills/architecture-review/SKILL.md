---
name: architecture-review
description: QA Idle architecture review for committed, uncommitted, and untracked project changes. Checks feature-level correctness, design-doc alignment, gameplay architecture, save compatibility, and test coverage. Read-only by default.
user-invocable: true
---

# QA Idle Architecture Review

Review QA Idle changes at the feature and architecture level. This is a read-only review unless
the user separately approves implementation work.

## Scope

Review everything relevant since the resolved base:

```bash
git status --short
git log <base>..HEAD --oneline
git diff <base> --stat
git diff <base> --name-only
git ls-files --others --exclude-standard
```

If used from `deep-review`, use that skill's base. Otherwise use the user's requested base or ask
for one when the correct baseline is ambiguous.

## Required Context

1. Read `AGENTS.md`.
2. Use `qa-idle-context-router` to select the smallest relevant numbered docs and source files.
3. Read every changed file fully unless it is generated, dependency, cache, log, duplicate import,
   or archive metadata.
4. Expand only to surrounding files needed to understand the changed behavior.

## What To Look For

### Design-Doc Alignment

- Mechanics, resources, stages, upgrades, unlocks, promotions, panels, formulas, or currencies not backed by docs.
- MVP scope drift, especially economy/progression tuning outside the relevant design document.
- Future or hidden systems becoming active before their documented unlock rules.

### Gameplay Architecture

- Gameplay behavior implemented in React instead of `src/gameLogic.ts`, `src/gameData.ts`, or other game modules.
- UI labels or component state defining mechanics.
- Requirements copied across components instead of represented as typed data or reusable predicates.
- Shared state shape changes missing updates in `src/types.ts`.
- Logic that is hard to test because it is not deterministic or pure where practical.

### Save And Compatibility

- Persisted shape changes without fallback, normalization, or migration.
- `NaN`, `Infinity`, negative resources, or invalid enum/string values able to enter `GameState`.
- Missing compatibility tests in `src/save.test.ts`.

### Tests And Verification

- Gameplay behavior without focused Vitest coverage near `src/gameLogic.test.ts`.
- Data registry changes without coverage near `src/gameData.test.ts`.
- Save/load behavior without coverage near `src/save.test.ts`.
- UI changes that likely need a local visual check.

### Frontend Fit

- First screen no longer works as the playable game.
- New UI diverges from the compact dashboard style in `src/styles.css`.
- Text or controls likely overlap, jump, or become hard to use on mobile/desktop.
- In-app copy explains UI mechanics unnecessarily instead of serving gameplay.

## Output Format

```md
## Feature: <identified feature/change set>

## Scope: <changed files, untracked files, base>

## Docs Loaded: <files and why>

### Critical

- [file:line] Problem. Suggested fix.

### Should Fix

- [file:line] Problem. Suggested fix.

### Consider

- [file:line] Problem. Suggested fix.

### Positive Notes

- What is done well.
```

## Boundaries

- Do not edit or write files during the architecture review.
- Focus on changed behavior and directly related context.
- Be specific: cite file and line whenever possible.
- Do not nitpick formatting.
- If the review needs more docs, name why before reading them.
