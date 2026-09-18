# CAREER-IDLE-001 — Playable career release

Status: Complete, 2026-09-18. Scope authorized by the request to make QA Idle a playable idle game. Design owner: [16 — Playable Career Idle](../16-Career_Idle_Release.md).

## Result

The active application now has a complete career and prestige loop instead of ending at the historical Middle assistant endpoint. It includes six ranks, four producers, affordable 1/10/max hiring, fifteen upgrades, automatic reporting, three repeatable contracts, ten permanent achievements, and a voluntary Director restart with permanent experience. The Ukrainian dashboard supports mobile layouts, keyboard controls, offline summaries, save backups, import, and confirmation of destructive game actions.

The new deterministic domain is in `src/game/career/`. Historical MVP modules remain covered by regression tests. Save schema 3 migrates raw/v1/v2 saves and leaves the old storage key untouched. Invalid/future saves pause autosaving; storage failures retain playable memory state and allow export. A second tab pauses the older session to avoid concurrent overwrites.

## Verification

- `pnpm run check`: passed typecheck, strict lint, formatting, repository health, and **353 tests across 25 files**. Health retains non-blocking source-size warnings, including the dashboard stylesheet.
- `pnpm run build:portable`: passed. Produces normal static assets and `dist/qa-idle.html` with inline production JavaScript/CSS and no remote game assets.
- Browser smoke checks: manual tests and reporting, first hire and passive income, mobile navigation and import confirmation, Lead contract start and real timed reward claim, Director prestige confirmation and resulting Junior/$50/5 experience/auto-report, export text, and no browser warnings/errors during the exercised flows.
- Desktop and 390px mobile layout inspected. Mobile document width equaled client width, with no horizontal overflow. The temporary viewport override was reset.
- Direct `file://` browser automation is unavailable under this environment's browser URL policy. The portable artifact was built and structurally checked; gameplay interaction was verified through the local development server.

## Balance evidence

Deterministic scenarios in `src/game/career/balance.test.ts` reinvest at five-second intervals using a marginal-income strategy. These measure reachability and relative pacing, not human enjoyment or guaranteed completion times.

| Scenario | First Director |
| --- | ---: |
| Manual test every two seconds, regular reinvestment | 17m 48s |
| No manual tests after the first producer, regular reinvestment | 23m 07s |
| Next active career after prestige | 8m 25s |

Active rank milestones: Middle 1m31s, Senior 4m45s, Lead 9m34s, Head 13m55s, Director 17m48s. The low-click scenario acquires automatic reporting at four minutes. Offline play uses the same production selectors, caps elapsed time, applies documented efficiency, and requires player input for purchases and contract claims.

## Delivery and limits

`pnpm run dev` starts local play; `pnpm run build:portable` creates a shareable build. Saves belong to each browser/origin; export before moving between localhost, hosted play, and a downloaded HTML file. The game intentionally caps counters and is a finite prestige game. Longer-term pacing still needs player feedback. Historical balance artifacts describe the old MVP and are not measurements of this release.

Prettier now accepts the checkout's line-ending style so Windows CRLF checkouts pass the same formatting gate without a repository-wide rewrite.
