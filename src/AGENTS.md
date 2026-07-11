# QA Idle Source Rules

## Required Context

- Start from the root `AGENTS.md`.
- Use `docs/README.md` and the `qa-idle-context-router` skill to select the smallest relevant design docs before changing gameplay, economy, progression, unlocks, promotions, resources, modifiers, save behavior, or UI behavior.
- If code conflicts with the selected design docs, record the conflict before changing behavior.

## Gameplay Architecture

- Keep authoritative gameplay behavior outside React components. UI may display state and send player intents; game modules validate and calculate results.
- Prefer data-driven definitions in `src/gameData.ts` for upgrades, career stages, requirements, constants, and future content.
- Keep shared types in `src/types.ts`; update tests and save normalization when state shape changes.
- Make gameplay logic deterministic and testable with pure functions where practical.
- Do not let UI-only labels define mechanics. If a number affects gameplay, it belongs in typed data or logic.
- Promotion, unlock, resource, and upgrade requirements should be expressed in reusable predicates or structured data, not copied across components.
- Manual player actions and passive or offline production should remain distinct concepts.
- Economy tuning should preserve the MVP scope unless the relevant design docs say otherwise.

## Save And Compatibility

- Treat `SAVE_KEY` data as user-owned. Never make a save-shape change without migration or normalization logic.
- Saved numbers must be sanitized on load and must not allow `NaN`, `Infinity`, negative resources, or unknown enum values into `GameState`.
- When adding a new persisted field, define its initial value, load fallback, and test coverage in the same change.

## Frontend Rules

- Keep the first screen as the playable game, not a marketing page.
- Follow the existing compact dashboard style in `src/styles.css`.
- Avoid adding explanatory feature text that describes how the UI works unless it is necessary in-game copy.
- Ensure controls remain usable on mobile and desktop, with no overlapping text or layout jumps.

## Tests

- For focused logic changes, add or update Vitest coverage near `src/gameLogic.test.ts`.
- For data registry changes, add or update coverage near `src/gameData.test.ts`.
- For save/load behavior, add or update coverage near `src/save.test.ts`.
- For UI changes, run the app locally and visually check affected viewport sizes when practical.
