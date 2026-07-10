# QA Idle Project Rules

## Source Of Truth

- Treat `docs/00-Master_Project_Roadmap.md` through `docs/14-Promotion_System.md` as the design source of truth.
- Use the `qa-idle-context-router` skill before implementation or review work to choose the smallest relevant documentation set.
- If `qa-idle-context-router`, `deep-review`, or another repo-local skill is not listed as an installed skill, read the matching `.codex/skills/<skill-name>/SKILL.md` file and follow it manually.
- Read the relevant design document before changing gameplay, economy, progression, unlocks, promotions, resources, modifiers, or save behavior.
- Do not invent new mechanics, currencies, resources, stages, formulas, panels, upgrades, or unlock conditions unless the documentation is updated first.
- Content in `docs/ideas/`, if present, is speculative until promoted into the main numbered docs.

## Architecture

- Keep authoritative gameplay behavior outside React components. UI may display state and send player intents; game modules validate and calculate results.
- Prefer data-driven definitions in `src/gameData.ts` for upgrades, career stages, requirements, constants, and future content.
- Keep shared types in `src/types.ts`; update tests and save normalization when state shape changes.
- Make gameplay logic deterministic and testable with pure functions where practical.
- Hidden or future systems must remain inert until unlocked by documented rules.

## Save And Compatibility

- Treat `SAVE_KEY` data as user-owned. Never make a save-shape change without migration or normalization logic.
- Saved numbers must be sanitized on load and must not allow `NaN`, `Infinity`, negative resources, or unknown enum values into `GameState`.
- When adding a new persisted field, define its initial value, load fallback, and test coverage in the same change.

## Gameplay Rules

- Do not let UI-only labels define mechanics. If a number affects gameplay, it belongs in typed data or logic.
- Promotion, unlock, resource, and upgrade requirements should be expressed in reusable predicates or structured data, not copied across components.
- Manual player actions and passive or offline production should remain distinct concepts.
- Economy tuning should preserve the MVP scope unless the relevant design docs say otherwise.

## Frontend Rules

- Keep the first screen as the playable game, not a marketing page.
- Follow the existing compact dashboard style in `src/styles.css`.
- Avoid adding explanatory feature text that describes how the UI works unless it is necessary in-game copy.
- Ensure controls remain usable on mobile and desktop, with no overlapping text or layout jumps.

## Testing And Verification

- The pre-commit hook runs `scripts/guard-commit.ps1` before the full project check to block generated, dependency, cache, log, and duplicate imported project files.
- Before finishing code changes, run `pnpm run check` when dependencies are installed.
- For focused logic changes, add or update Vitest coverage near `src/gameLogic.test.ts` or `src/save.test.ts`.
- For UI changes, also run the app locally and visually check the affected viewport sizes when practical.
- Do not commit generated build output, caches, logs, or dependency folders.

## Token And Context Efficiency

- Read only the docs and source files relevant to the current task; prefer targeted searches over loading every numbered design document.
- When a task touches one system, start with that system's design doc plus `docs/07-Technical_Rules.md` only if architecture or cross-system behavior is involved.
- Summarize discovered context briefly before acting when the task spans multiple docs, so later work can rely on the summary instead of rereading large files.
- Avoid pasting long source or documentation excerpts into responses; cite filenames and describe the important rule or behavior.
- Keep implementation notes and final answers concise unless the user asks for detailed reasoning.
- Do not reduce verification quality to save tokens. Run the smallest check that gives confidence for the change.

## Repository Hygiene

- Use `pnpm` as the package manager.
- Keep edits scoped to the requested task.
- Do not modify duplicate imported folders such as `QA-idle/` or `QA-idle-1/` unless the task explicitly targets them.
- Respect existing user changes in the working tree; do not reset or overwrite unrelated files.
