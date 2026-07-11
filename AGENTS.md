# QA Idle Project Rules

## Source Of Truth

- Treat `docs/00-Master_Project_Roadmap.md` through `docs/14-Promotion_System.md` as the design source of truth.
- Use `docs/README.md` as the documentation index and task-context mapping. It is navigation, not a replacement for canonical design documents.
- Use the `qa-idle-context-router` skill before implementation or review work to choose the smallest relevant documentation set.
- If `qa-idle-context-router`, `deep-review`, or another repo-local skill is not listed as an installed skill, read the matching `.codex/skills/<skill-name>/SKILL.md` file and follow it manually.
- Do not invent new mechanics, currencies, resources, stages, formulas, panels, upgrades, or unlock conditions unless the documentation is updated first.

## Scoped Instructions

- Follow directory-local `AGENTS.md` files when working inside their tree.
- `src/AGENTS.md` owns source-code architecture, gameplay, persistence, UI, and source-test rules.
- `docs/AGENTS.md` owns documentation editing rules.
- `.codex/skills/AGENTS.md` owns repo-local skill and review workflow rules.

## Architecture Baseline

- Keep authoritative gameplay behavior outside React components.
- Preserve save compatibility whenever state shape or persisted behavior changes.
- Hidden or future systems must remain inert until unlocked by documented rules.

## Testing And Verification

- The pre-commit hook runs `scripts/guard-commit.ps1` before the full project check to block generated, dependency, cache, log, and duplicate imported project files.
- Before finishing changes, run the validation command required by the active task. Use `npm run check` when the task requests it.
- Do not commit generated build output, dependency folders, caches, logs, duplicate imported project folders, or unrelated changes.

## Token And Context Efficiency

- Read only the docs and source files relevant to the current task; prefer targeted searches over loading every numbered design document.
- Summarize discovered context briefly before acting when the task spans multiple docs, so later work can rely on the summary instead of rereading large files.
- Avoid pasting long source or documentation excerpts into responses; cite filenames and describe the important rule or behavior.
- Do not reduce verification quality to save tokens. Run the smallest check that gives confidence for the change.

## Repository Hygiene

- Use `pnpm` as the package manager.
- Keep edits scoped to the requested task.
- Do not modify duplicate imported folders such as `QA-idle/`, `QA-idle-1/`, `QA-idle-upload/`, or nested `QA-idle*` imports unless the task explicitly targets them.
- Respect existing user changes in the working tree; do not reset or overwrite unrelated files.
