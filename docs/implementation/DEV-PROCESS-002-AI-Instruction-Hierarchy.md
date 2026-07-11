# DEV-PROCESS-002 - AI Instruction Hierarchy Audit

## Scope

Audited active AI guidance in the repository:

| File | Role | Notes |
|---|---|---|
| `AGENTS.md` | Global project instructions | Previously mixed global, source, docs, UI, persistence, and verification rules. |
| `.codex/skills/qa-idle-context-router/SKILL.md` | Context routing skill | Routes task types to minimal docs and source files. |
| `.codex/skills/qa-idle-context-router/agents/openai.yaml` | Skill launcher metadata | Short UI/default prompt only. |
| `.codex/skills/deep-review/SKILL.md` | Deep review workflow | Read-only review workflow with checkpoint state. |
| `.codex/skills/deep-review/agents/openai.yaml` | Skill launcher metadata | Short UI/default prompt only. |
| `.codex/skills/architecture-review/SKILL.md` | Architecture review workflow | Read-only feature and architecture review. |
| `.codex/skills/simplify-code/SKILL.md` | Behavior-preserving simplification workflow | Review checklist and approved-edit boundaries. |

Targeted searches found no active prompt template files outside these instructions.

## Instruction Classification

| Category | Canonical Owner After Restructure |
|---|---|
| Global source-of-truth hierarchy, context-router requirement, repository hygiene | `AGENTS.md` |
| Gameplay architecture, UI ownership, data-driven content, source tests | `src/AGENTS.md` |
| Save compatibility and persisted-state safety | `src/AGENTS.md` |
| Documentation ownership, frozen-doc rules, epic/backlog updates | `docs/AGENTS.md` |
| Repo-local skill maintenance and review workflow constraints | `.codex/skills/AGENTS.md` |
| Detailed task-to-document mapping | `docs/README.md` and `.codex/skills/qa-idle-context-router/SKILL.md` |
| Deep review procedure and checkpoint updates | `.codex/skills/deep-review/SKILL.md` |
| Architecture review procedure | `.codex/skills/architecture-review/SKILL.md` |
| Clean-code checklist | `.codex/skills/simplify-code/SKILL.md` |

## Duplication And Conflict Report

- `AGENTS.md` repeated detailed source-code rules that apply only under `src`. These now live in `src/AGENTS.md`.
- `AGENTS.md` repeated documentation-loading details that are canonical in `docs/README.md` and the context-router skill. The root file now references those owners instead of restating the mapping.
- Review skills duplicate a small set of project constraints intentionally because they operate as workflow-specific checklists. No contradictory active instructions were found.
- The context-router skill and `docs/README.md` overlap on task-context routing. This is intentional, but `.codex/skills/AGENTS.md` now names `docs/README.md` as the alignment source.
- The root duplicate-folder examples did not include every known duplicate-import pattern from workspace rules. The global hygiene rule now names the known duplicate forms without changing the automated guard.

## Proposed Instruction Hierarchy

The repository currently has a flat `src` directory, so the implemented hierarchy uses existing directories rather than inventing future module paths:

```text
AGENTS.md
src/AGENTS.md
docs/AGENTS.md
.codex/skills/AGENTS.md
```

Future modularization may add narrower files such as `src/game/AGENTS.md`, `src/ui/AGENTS.md`, or `src/persistence/AGENTS.md` after the codebase has matching directories.

## Removed Or Relocated Rules

| Original Location | New Location | Rule Area |
|---|---|---|
| `AGENTS.md` | `src/AGENTS.md` | Gameplay architecture and UI/gameplay ownership. |
| `AGENTS.md` | `src/AGENTS.md` | Save compatibility and persisted-state safety. |
| `AGENTS.md` | `src/AGENTS.md` | Source test placement guidance. |
| `AGENTS.md` | `docs/AGENTS.md` | Frozen docs, speculative ideas, and progress handoff guidance. |
| `AGENTS.md` | `docs/README.md` reference | Detailed task-context mapping. |
| `AGENTS.md` | `.codex/skills/AGENTS.md` | Repo-local skill and review workflow ownership. |

## Automation Candidates

Already automated:

- `scripts/guard-commit.ps1` blocks generated output, dependency folders, caches, logs, archive metadata, generated Vite artifacts, and duplicate imported project folders from commits.
- `npm run check` runs typecheck, lint, format check, and unit tests.

Good candidates for future `TOOLING-001`:

- Documentation link validation.
- Duplicate stable ID and registry key detection.
- Documentation index validation against expected numbered docs.
- Stale documentation path detection after refactors.
- Forbidden dependency or circular dependency detection after `TECH-DEBT-006` establishes final module boundaries.
- Save schema validation for persisted state shape and migration coverage.

Keep as review judgment:

- Whether architecture boundaries are cohesive.
- Whether documentation context is sufficient for a task.
- Whether a rule is too broad or too narrow for a scoped instruction file.

## Before And After Size Comparison

| File | Before | After |
|---|---:|---:|
| `AGENTS.md` | 62 lines | 42 lines |
| `src/AGENTS.md` | 0 lines | 38 lines |
| `docs/AGENTS.md` | 0 lines | 21 lines |
| `.codex/skills/AGENTS.md` | 0 lines | 18 lines |

The root instruction file is shorter and now keeps only global constraints. Scoped files add locality for source, documentation, and skill work without removing important constraints.

## Acceptance Review

- Global and scoped instruction boundaries are explicit.
- No contradictory active instructions were identified.
- Duplicate broad rules were removed from the root file or replaced with references to canonical owners.
- Scoped source instructions avoid documentation and skill workflow details.
- Documentation loading now references `docs/README.md` task-context mapping.
- Important architecture, save, gameplay, UI, and repository hygiene constraints remain active.
- Automated validation candidates are identified for future tooling work.
