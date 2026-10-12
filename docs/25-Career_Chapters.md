# 25 — Career Chapters, Resource Overview and Stable Reporting

Authorized 2026-10-12 by player feedback. This scoped continuation extends
16–24 and overrides cumulative promotion income, rank power and the named
automation/UI rules below. Dependencies: 07, 10, 11, 14, 16, 20–24.
Existing cash upgrades, project work, progressive discovery and v4 saves remain.

## Stable reporting

Manual testing and buying automatic reports settle pending bugs into cash in
the same validated action. Preserve project/contract progress and earned totals.
Passive/offline conversion remains analytic. Never discard unsold bugs.
Recompute remaining time from the absolute endpoint after analytic slices, so
fractional badge/contract boundaries cannot skip a five-second automation event.
With automatic reporting, the top resource card shows total bugs processed this
career (`found`) and report price; without it, show unsold bugs. No pulsing balance.

## Resource overview

Reveal an overview with Studio or the first prestige. List discovered resources,
balances, production or event sources, uses, persistence and links to their owner.
Money and bugs are always known; insights, XP, clients, credits, computations and
protocols appear only when discovered. Show crew/core/rack capacity separately.
Rates come from authoritative selectors. Do not spoil future currencies.

## Career chapters

`rankEarned` counts income earned in the current rank, independently of bank and
career income. Increment it in every earning transaction, reset on promotion and
prestige. A missing value in an old save inherits its career income once; sanitize
to finite, nonnegative and at most career income. Refunds/imports do not earn money.
Use an independent counter rather than a baseline subtraction so the global
resource cap cannot deadlock later promotions.

Each rank has an authored objective and parallel evidence from existing systems.
The first Checklist Studio license costs $4,000 and no insights (previously 3).
This keeps Senior reachable even if all early insights were invested in research;
later product licenses retain their insight prices and contracts provide a renewable source.
Guidance shows the cheapest missing chapter tool's cash/insight cost. The balance
player policy reserves these insights before optional research, rather than
simulating repeated spending that starves its own current objective. Manual
research purchases remain the player's choice.
Only the current/reached chapter is shown. Original crew/certificate requirements
remain lower bounds. Retained tools, research and certificates count on repeat
careers; current-run producers must be rebuilt. Founder mastery is optional and
never prevents prestige. No new currency, repeated project timers or cooldowns.

Initial implementation candidate (income required for the next rank):

| Current rank | Rank income | Additional chapter evidence |
|---|---:|---|
| Junior | 150 | One ordinary cash upgrade |
| Middle | 120,000 | Ten squads (first producer milestone), first certificate |
| Senior | 5,000,000 | Ten runners, two certificates, one owned product |
| QA Lead | 200,000,000 | Three completed contracts, six research levels, three certificates |
| Head of QA | 10,000,000,000 | Ten labs, four distinct certificates, one active specialist |
| QA Director | 500,000,000,000 | Ten cloud farms, two products, five certificates |
| VP of Quality | 200,000,000,000,000 | Ten AI producers, three products, six certificates |
| Chief Quality Officer | 30,000,000,000,000,000 | Ten orbital producers, four products, eight certificates |
| Founder | — | Optional ninth certificate |

Measure active, low-click and repeat careers; tune these documented candidates
before final release. Target first Director around 20–40 minutes with reinvestment,
meaningful residence at each rank and no cascade from previously accumulated cash.
This is a simulation target, not a claim of player-validated fun.
The optional first Founder campaign targets 40–75 minutes; no fresh rank after
Junior should take under three minutes in the shared active reinvestment policy.

Cash balances and cash income counters have a separate cap of 10^21, including
royalty and dispatch earnings. Other resource/count caps remain unchanged. This
allows later career goals beyond the old 10^15 bank cap without shrinking owned
upgrades. Display Qa (10^15), Qi (10^18), Sx (10^21) consistently. Automatic
passive reporting pays the entire analytic bug flow; the unsold inventory cap
must not discard paid work during a long absence. Import preserves large cash
and clamps independently counted rank income to career income.

Rank power is `2 ** stage` on crew production and the flat manual-testing term.
The manual share of production already includes this multiplier and is not doubled
again. Keep report prices and purchased upgrade effects. Prestige resets rank power
while preserving existing permanent systems. Each promotion shows numeric before
and after production, manual testing and income; the boost applies immediately.

## Chapter automation

Existing auto-hire prioritizes missing chapter producer minimums before its
cheapest-unit fallback. Add a separate `chapters` policy, unlocked by Deployment,
default OFF in both new and old saves. Explicitly describe cash AND insight spending.
It performs at most one validated action per five-second boundary before ordinary
career policies: essential crew, research, missing product licenses, specialist
assignment only if none is active, and required contract acceptance/claiming.
Repeat a contract when an unmet chapter research/tool goal needs more insights.
It does not replace product roles/staff choices, claim projects/trials/blueprints,
prestige, or spend protocols. Existing policies retain their spending scope.

## Validation and delivery

Verify atomic reporting and conservation; discovered ledger rows/links; independent
rank income, no instant promotion chain, progress at resource caps, chapter gates,
rank boosts, save migration, opt-in spending and online/offline parity. Simulate and
record rank timing. Protect the actual player save; inspect desktop and 320 px UI.
Run complete checks and portable build, then release through checked main PR.
Track four iterations in TODO and report completed/remaining steps after each one.

## Measured release candidate

Deterministic policy in `src/game/career/simulationPolicy.ts`: active manual test
every two seconds, reinvestment every five seconds, parallel projects/contracts,
and insights reserved for the current chapter's tool. Low-click play only clicks
while no producer exists. Bulk stress play performs up to 30 affordable purchases
per reinvestment boundary, using maximum hiring quotes.

| Reached rank | Active, elapsed | Residence on previous rank |
|---|---:|---:|
| Middle | 91 s | 91 s |
| Senior | 451 s | 360 s |
| QA Lead | 730 s | 279 s |
| Head of QA | 1,276 s | 546 s |
| Director | 1,771 s | 495 s |
| VP of Quality | 2,082 s | 311 s |
| Chief | 2,637 s | 555 s |
| Founder | 3,000 s | 363 s |

Low-click Director: 2,034 s; Founder: 3,279 s. Bulk Director: 1,731 s.
Repeat Director after the first prestige: 221 s, with retained knowledge and
rebuilt producers. Fresh ranks after Junior last at least three minutes in both
active and bulk profiles. Optional gold certificates remain attainable; they are
not promotion timers. Actual play times vary with decisions and click frequency.
