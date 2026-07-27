# QA-PLAYABLE-MVP-039 Automated Acceptance Report

Status: Pass  
Task: QA-PLAYABLE-MVP-039 - Run full regression and active candidate validation  
Date: 2026-07-27  
Branch base: `origin/main` at `8a383eb`

## Scope

This report records the automated Playable Idle MVP acceptance evidence required before structured runtime acceptance. It verifies the active balance candidate, regression suite, runtime/simulator parity, visual component and accessibility behavior, repository checks and production build.

This task does not freeze `docs/15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`, tune balance values or replace the structured runtime runs owned by `QA-PLAYABLE-MVP-040`.

## Acceptance Summary

| Acceptance area | Result | Evidence |
| --- | --- | --- |
| Full automated regression | Pass | Vitest completed 23 test files and 334 tests with no failures. |
| Active candidate validation | Pass | Candidate `phase-6b.2-stage-a-003` completed 14 scenarios and passed all 30 gates with 0 Blocker, Major or Minor failures. |
| Runtime/simulator parity | Pass | Formula parity, runtime snapshot fixture and active candidate contract tests passed in the full suite. |
| Visual component behavior | Pass | VD-02 component primitives and MVP UI smoke tests passed, including Junior/Middle workspace composition, Assistant and Support states, committed feedback and endpoint presentation. |
| Accessibility and responsive behavior | Pass | Automated tests passed for responsive focus order, keyboard-dismissible feedback, focusable explained unavailable actions, accessible descriptions, progress semantics and non-color status communication. |
| Repository quality gates | Pass | TypeScript, ESLint, Prettier, repository health and the repeated full test suite passed through `npm.cmd run check`. |
| Production build | Pass | Vite transformed 44 modules and emitted the production HTML, CSS and JavaScript bundles. |

## Balance Candidate Evidence

The canonical balance acceptance outputs were regenerated for the active implementation candidate:

- `artifacts/balance/phase-6b.2-stage-a-003-active-candidate-results.json`
- `docs/reports/phase-6b.2-stage-a-003-active-candidate-balance-validation-report.md`

The report records:

- Overall result: Pass.
- Passed gates: 30.
- Blocker failures: 0.
- Major failures: 0.
- Minor failures: 0.
- Mixed Middle duration: 1,261 seconds.
- Total Junior plus mixed duration: 1,761 seconds.
- Low-click Middle completion: 1,441 seconds.
- No-support completion: 1,441 seconds.
- Offline return: Bugs Found only, capped at 7,200 eligible seconds.
- Endpoint scenarios: all required non-capstone scenarios completed.

No parameter changes are recommended by the automated candidate report.

## Runtime And UI Coverage

Runtime/simulator parity is covered by:

- `scripts/balance/runtime-formula-parity.test.mjs`
- `scripts/balance/runtime-snapshot-fixtures.test.mjs`
- `src/game/assistantProduction.test.ts`
- `src/game/runtimeCandidateParameters.test.ts`

Visual component, responsive and accessibility behavior is covered by:

- `src/main.test.tsx`
- `src/ui/components.test.tsx`

The UI checks exercise the approved component states and interaction semantics in the DOM test environment. Pixel screenshot comparison is not configured in this repository, so this report does not claim a separate image-diff baseline.

## Verification Commands

| Command | Result |
| --- | --- |
| `pnpm run test:run` | Pass: 23 files, 334 tests. |
| `npm.cmd run balance:candidate` | Pass: 30 of 30 gates; canonical candidate outputs regenerated. |
| `npm.cmd run check` | Pass: typecheck, lint, format check, repository health and 334 tests. |
| `npm.cmd run build` | Pass: 44 modules transformed; production bundles emitted. |

On this Windows host, the `.cmd` npm launcher was used because PowerShell execution policy blocks `npm.ps1`. The repository's `test:run` script was used for the non-watch Vitest run because the backlog form `pnpm test -- --run` forwards an extra argument separator with the installed pnpm/Vitest versions.

Repository health reported the existing warning-only oversized source and test files. The health command passed, and this documentation-only task did not expand those files.

## Result And Handoff

`QA-PLAYABLE-MVP-039` passes automated acceptance. The Playable MVP may proceed to `QA-PLAYABLE-MVP-040` for clean, migrated, low-click, active-click, offline-return and endpoint runtime acceptance runs.

Doc 15 remains `IMPLEMENTATION CANDIDATE - PLAYTEST VALIDATION REQUIRED`; this result is not a balance freeze or final player-validation claim.
