# 18 — Living Office and Contract Dispatch

Authorized 2026-09-20: the user approved the proposed living office and automation expansion. Extends 16/17; this document owns its exceptions to manual contract claims and repetition. All unrelated rules stay unchanged.

## Office

Add an Office navigation view with an animated, responsive, code-native illustration driven by real state. Five permanent visual locations unlock at best ranks 0/2/4/6/8: first desk, team room, device laboratory, cloud campus, headquarters. Producer ownership controls desks and equipment; assigned specialists appear in the room. The view links to existing crew, projects and studio screens. Decoration is presentational and grants no hidden bonuses. Respect reduced motion.

## Dispatcher

A permanent dispatcher license costs 20 insights, requires best rank at least Lead and three completed contracts. New typed office rules own these values. Buying the license does not choose a contract. The player explicitly selects one currently unlocked contract, or pauses dispatch. The same contract slot is used; there is no extra parallel income slot.

When enabled, dispatch starts the selected contract if the slot is empty, progresses it, claims it when both work and time are complete, and repeats. Every new contract snapshots its current terms. An already active matching contract keeps its old terms. A different active contract is left for manual completion or cancellation; its progress and reward never change when switching policy. Pausing retains the active job. Canceling a contract also pauses dispatch. Projects retain explicit phase submissions and are never auto-claimed.

Elapsed time must be split at automatic contract completion boundaries. Remaining elapsed time works on subsequent contracts, with effective offline production and the same offline time cap. No per-second loop: process contract events, bounded by the capped elapsed interval and positive contract duration. Zero production cannot complete missing work. Negative/nonfinite elapsed time grants nothing. License purchase, policy changes, research and staff changes settle prior elapsed time first. Automatic payments update cash, earned totals, insights, total contracts and permanent dispatcher statistics once. The return banner reports automatic jobs and insights from that absence.

License and lifetime dispatcher statistics survive prestige; the selected policy resets to paused along with the active contract. No automatic purchases, promotions or project transitions. Prestige copy states this behavior.

## Persistence and verification

This is an additive schema-4 change: office defaults to an unlicensed, paused dispatcher with zero counters. Existing v4 saves remain valid. Normalize office fields with finite nonnegative bounds, allowlist contract IDs, require license prerequisites and current rank before restoring an active policy. V3 and legacy imports get fresh office defaults. The existing checkpoint-after-offline behavior prevents replay. Hard reset clears the office.

Required coverage: unlock/cost gates, no retroactive work when enabling, matching/different jobs, pause/cancel, offline cap and replay, zero production, multiple payouts plus partial final job, policy snapshots, prestige retention, corrupt/old saves, office UI and responsive browser checks. Run full check and portable build. Ship a fresh branch/PR and updated release artifacts without replacing the user's gameplay with test fixtures.

## Verification — 2026-09-20

Implemented as an additive v4 release. The pure simulation splits at contract completion events and reuses the existing production, reports, project progression and badge calculation for each interval. An invalid policy or a different active job follows the original manual simulation path. Final timestamps checkpoint the entire absence, including discarded time beyond the offline cap.

Local `pnpm run check` passed 404 tests in 30 files, including 15 new domain cases and 3 integrated UI cases. TypeScript, ESLint and formatting passed; repository health passed with advisory file-size warnings. `pnpm run build:portable` passed. The 354,900-byte standalone HTML contains one inline JavaScript entry and one stylesheet; the embedded script passed `node --check`.

Browser verification used a separate test origin: license purchase, waiting for a different active contract, manual claim of that job, automatic claim/repeat with actual elapsed time, and pause retaining the partial job. At 320px and 390px the navigation and office fit without horizontal overflow. Production verification covered an empty starting office, a disabled unearned license, import of an active dispatcher with elapsed time, two automatic payouts, and reload without duplicate rewards. No browser console errors were observed. Direct file-URL launching remains unavailable in the test browser; the portable structure is validated separately.

The original early game, nine-client campaign, research and specialist rules remain covered by the existing regression and balance suites. Automatic contract rewards are deliberately an additional income/insight source; the license never automates spending or prestige.
