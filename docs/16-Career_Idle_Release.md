# 16 — Playable Career Idle

Status: implemented and verified on 2026-09-18, authorized by the request to turn QA Idle into a playable idle game. This supersedes the small MVP scope for the active application. Docs 08 and 15 and their simulations remain the historical MVP baseline. See [release verification](implementation/CAREER-IDLE-001.md).

## Product and acceptance

A complete single-player browser loop: find bugs, report them, hire producers, automate reporting, earn promotions, complete contracts, and voluntarily start a new career with permanent experience. Six ranks are Junior QA, Middle QA, Senior QA, QA Lead, Head of QA, and Director. No server, account, payments, ads, or network dependency during play.

The first hire should be attainable within the first minute of active play. Automatic reporting should be attainable within the first few minutes. The first career targets roughly 15–45 minutes for an engaged reinvestment strategy; simulation must measure this, not treat it as a promise about player behavior. Low-click play remains viable after the first hire. Every subsequent rank has a visible goal and unlock. Director can continue growing or prestige.

Release gates: deterministic active/offline economy; no negative/NaN balances; gated actions rejected by the engine; affordable bulk purchases; reachable promotions and prestige; faster repeat careers; old-save migration; offline rewards cannot be replayed; storage errors visible; responsive keyboard-accessible UI; production build and existing plus new automated tests.

## Content and economy contract

The typed registry in `src/game/career/content.ts` owns the implementation values below and is re-exported by `src/gameData.ts`. All new state and action types live in `src/types.ts`.

| Rank | Run earnings | Producers owned | Unlock |
| --- | ---: | ---: | --- |
| Junior QA | 0 | 0 | Manual tests, assistant |
| Middle QA | 150 | 3 | QA squad, automatic reporting upgrade |
| Senior QA | 2,500 | 8 | Automated test runners |
| QA Lead | 35,000 | 15 | Contracts |
| Head of QA | 350,000 | 25 | QA labs |
| Director | 2,500,000 | 40 | Voluntary career prestige |

Promotion is explicit, free, and based on cumulative run earnings (spending never undoes progress). Rank money-per-bug multipliers are 1, 1.2, 1.5, 2, 2.5, and 3.

Producers: Assistant ($25, 0.5 bugs/sec, Junior); QA squad ($350, 2/sec, Middle); Test runner ($6,000, 8/sec, Senior); QA lab ($100,000, 50/sec, Head). Next cost is `ceil(baseCost * 1.30^owned)`. Ownership is capped at 100 per type. At 10, 25 and 50 of a type its entire production doubles, cumulatively. Buy 1/10/max purchases only affordable units, with sequential rounded prices.

One-time upgrades (all reset on prestige): checklist $10/Junior/+1 manual base; coffee $40/Junior/manual x2; report templates $100/Junior/report value x1.25; test plan $160/Junior/production x1.25; auto-report $80/Middle; mentoring $400/Middle/production x1.25; handover $1,200/Middle/16h offline at 100%; shortcuts $3,500/Senior/manual x2; parallel runs $12,000/Senior/production x1.5; bug bounty $18,000/Senior/report x1.5; team playbook $60,000/Lead/production x1.5; premium contracts $90,000/Lead/report x1.5; knowledge base $450,000/Head/manual x2; observability $650,000/Head/production x1.5; global coverage $5,000,000/Director/production x1.5.

Derived-stat selectors are the sole modifier calculation owner for the new engine. Production is base producer output times owned milestones times purchased production multipliers times permanent multiplier. Permanent multiplier is `1 + experience * 0.25 + achievements.length * 0.02`. Manual output is `(1 + checklistBonus) * manualUpgradeMultipliers * permanentMultiplier + passiveRate * 0.15`. Report value is rank multiplier times purchased report multipliers. Manual actions generate bugs only; auto-report, when owned, converts all bugs on the next tick. Reinvestment always requires player input.

## Time, contracts, and numeric limits

One pure elapsed-time function is used by visible ticking, background returns, and offline loading. Offline is capped at eight hours and grants 75% production by default; handover gives sixteen hours and 100%. Timers use wall-clock elapsed seconds, never callback counts. Negative time gives nothing. Closing/reopening or a hidden tab cannot double-award. Contracts count effective production and wall-clock eligible time; a completed contract waits for a manual claim and never auto-repeats.

At Lead, choose one contract: smoke check (4,000 new bugs, 60sec, $12,000), regression (16,000, 180sec, $48,000), release audit (60,000, 480sec, $180,000). Work/reward scale by `10^(rankIndex-3)` at selection. Only bugs found after selection count. Goals and reward are snapshotted, so promoting does not move the goalposts. Starting another job is blocked until claim or explicit cancellation. Contracts do not consume bugs. Claims add run and lifetime earnings once.

This release intentionally uses bounded finite numbers: resource and lifetime counters cap at 1e15, owned units at 100, experience at 1e6. This is a finite prestige game, not unbounded astronomical arithmetic. Selectors and save normalization enforce the bounds. No number can silently overflow into Infinity or NaN.

## Prestige and achievements

At Director, prestige awards `floor(5 * sqrt(runEarnings / 2,500,000))` experience. Each experience permanently adds 25% production and manual base power. Preview states exactly what resets: money, bugs, rank, team, upgrades, and active contract. Experience, achievements, lifetime totals, total contracts and career count persist. Subsequent careers start with $50 and auto-report, adding an automation benefit to the repeat loop. Prestige and hard reset require in-game confirmation.

Ten permanent achievements: first bug, $100 earned, first hire, ten producers, Senior, Lead, first contract, $1M lifetime earnings, Director, first prestige. Each grants +2% production. Earned badges never disappear on prestige.

## Persistence and migration

Schema 3 uses `qa-idle-career-v3` and retains the existing `qa-idle-save-v1` untouched as migration backup. If the new key is absent, import legacy raw/v1/v2 saves: balances, lifetime totals, Junior/Middle, purchased basic upgrades, assistant levels and Support effects map into the new registry. No retroactive offline gain is granted during migration. Import and export use JSON with validation; unsupported versions and malformed input leave current progress intact. Loading applies offline progress once and checkpoints the new timestamp immediately. Storage failures are reported and must not silently overwrite a corrupt/unknown save. The UI must retain the playable in-memory state and allow export.

## UI and implementation ownership

Keep the compact dashboard identity, with a dark workspace, mint production accents, Ukrainian interface copy, and English career titles. First screen is the live game. Show spendable money, bugs, rate, next promotion, meaningful unlocks, unit costs/milestones, and explicit automation state. Workspace, career, achievements and settings are functional navigation views. Contracts appear at Lead. Include a mobile layout, focus styles, reduced motion, descriptive unavailable controls, return summary, autosave status, backup export/import, and reset confirmation.

The new career domain lives in `src/game/career/`; React only sends intents. Historical MVP domain modules and tests remain as regression/migration reference, but are not the active application. Replace the obsolete MVP UI acceptance assertions with tests of the new active application. Keep new engine, selectors, persistence, and UI components separate. Preserve prior design documents and balance artifacts as historical evidence rather than retuning the old thirty-minute endpoint.
