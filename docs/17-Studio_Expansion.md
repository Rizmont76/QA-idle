# 17 — Studio Expansion

Extension: [19 — Studio Products](19-Studio_Products.md) connects project certificates to owned QA tools and passive product income.

Extension: [18 — Living Office](18-Living_Office.md) adds optional contract dispatch; it owns the explicit automation exception to manual contract claims.

Status: implemented and locally verified on 2026-09-19. Authorized by the request for substantially more game content. Extends [16 — Career Idle](16-Career_Idle_Release.md); unchanged rules remain authoritative. Existing careers continue without reset.

## Scope and acceptance

Preserve the working early loop. Deliver nine ranks, seven producers, at least thirty upgrades, nine contracts, nine authored three-phase projects with three certification tiers, twelve permanent research nodes, six recruitable specialists and at least twenty-four achievements. Projects and research make prestige more than repeated purchases. All actions need engine enforcement, safe persistence, deterministic offline behavior, responsive UI and tests. Simulations measure the original Director path, extended Founder path and research/prestige acceleration, not human enjoyment.

## Extended career

The first six promotion requirements remain unchanged. Prestige remains available from Director (index 5), with its existing earnings formula and award capped to remaining experience capacity. Director additionally unlocks cloud farms. Later ranks require distinct project certificates, which persist through prestige.

| Rank | Run earnings | Crew | Certificates | Report value |
| --- | ---: | ---: | ---: | ---: |
| VP of Quality | 50,000,000 | 70 | 3 | 4 |
| Chief Quality Officer | 1,000,000,000 | 110 | 5 | 5 |
| Founder | 25,000,000,000 | 160 | 8 | 7 |

New producers: cloud farm at Director ($2,500,000 / 350 bugs/sec), AI cluster at VP ($75,000,000 / 2,800/sec), orbital lab at Chief ($2,500,000,000 / 24,000/sec). Existing geometric prices, cap and milestones apply. Research discounts prices before ceiling rounding; bulk costs sum those prices. Additional typed cash upgrades in `expansionData.ts` use existing production/report/manual effects and reset on prestige.

## Projects

Nine sequential projects each have three authored phases. Each phase requires new bugs and minimum elapsed time, then explicit submission. Stored bugs do not count. Offline only progresses the active phase; it never advances phases or claims rewards. There is one project slot independent of contracts. Cancellation requires confirmation. Every certificate tier can be claimed only once.

First certification unlocks the next project. Replays award Silver and Gold; then the project is complete. Tier indices 0/1/2 multiply bug targets by 1/12/144, cash by 1/10/100, insights by 1/2/3 and time by 1/1.25/1.5. Rank requirement: `min(8, baseRank + tierIndex)`. Start snapshots rewards and research work reduction for the entire project. Certificates persist; active projects reset on prestige with explicit warning.

| Project | Rank | Cash | Insights | Phase bug targets | Phase seconds |
| --- | ---: | ---: | ---: | --- | --- |
| Кнопка, яка продає | Middle | 800 | 3 | 80 / 140 / 220 | 20 / 30 / 45 |
| Нічний кошик | Senior | 8,000 | 5 | 800 / 1,600 / 3,200 | 30 / 45 / 60 |
| Мобільний хаос | Lead | 75,000 | 8 | 6,000 / 12,000 / 24,000 | 45 / 60 / 90 |
| Платіжна п’ятниця | Head | 650,000 | 12 | 45,000 / 90,000 / 180,000 | 60 / 90 / 120 |
| Мільйон гравців | Director | 6,000,000 | 18 | 250,000 / 500,000 / 1,000,000 | 90 / 120 / 180 |
| Глобальна мережа | VP | 60,000,000 | 25 | 1,500,000 / 3,000,000 / 6,000,000 | 120 / 180 / 240 |
| Алгоритм довіри | Chief | 600,000,000 | 35 | 10,000,000 / 20,000,000 / 40,000,000 | 180 / 240 / 300 |
| Орбітальний реліз | Chief | 2,000,000,000 | 45 | 30,000,000 / 60,000,000 / 120,000,000 | 180 / 300 / 420 |
| Власна QA-платформа | Founder | 15,000,000,000 | 60 | 100,000,000 / 200,000,000 / 400,000,000 | 240 / 360 / 600 |

Selection previews terms and recruitment rewards. Final completion has a campaign ending; higher certifications remain available.

## Insights and permanent research

Insights are earned by projects and claimed contracts, not random loot or payments. Balance, lifetime total and research persist. Research requires best rank >= Middle and explicit prerequisites. Next-level cost is `ceil(baseCost * 1.8^level)`.

| Node | Base cost | Max | Per-level effect | Prerequisite |
| --- | ---: | ---: | --- | --- |
| automation | 3 | 5 | +10% production | none |
| fieldnotes | 3 | 4 | -4% project bug targets | none |
| bargaining | 4 | 4 | +8% report value | none |
| procurement | 5 | 4 | -5% producer price | automation 1 |
| intuition | 4 | 3 | +25% manual base | fieldnotes 1 |
| archive | 5 | 4 | +1 hour offline cap | automation 1 |
| pipelines | 6 | 4 | -5% contract minimum time | fieldnotes 1 |
| reputation | 6 | 4 | +10% contract cash | bargaining 1 |
| nightshift | 8 | 4 | +5 percentage points offline efficiency | archive 1 |
| discoveries | 10 | 3 | +20% insights, floor final reward | fieldnotes 2 |
| leadership | 14 | 3 | +15% production | automation 3 |
| coordination | 35 | 1 | Third specialist slot | leadership 1 |

Same-family research bonuses add, then multiply existing effects. Offline efficiency caps at 100%; all counters remain finite, bounded to 1e15.

## Specialists

The first six projects recruit one specialist each. Two assignment slots initially; coordination opens a third. Swapping is free after elapsed time settles. Unassigned/unrecruited staff are inert; assignments persist on prestige.

| Specialist | Recruitment | Assigned effect |
| --- | --- | --- |
| Марта, дослідниця | project 1 | +50% manual base |
| Тарас, автоматизатор | project 2 | +25% runners/cloud farms |
| Софія, переговорниця | project 3 | +20% contract cash |
| Лев, наставник | project 4 | +30% assistants/squads |
| Ніка, архітекторка | project 5 | +25% labs/AI/orbital labs |
| Орест, операційник | project 6 | +15 percentage points offline efficiency, +2h cap |

## Contracts, achievements and persistence

Existing contracts retain base cash/target/time. Add six stage-gated contracts with explicit registry data, trading short cash jobs for longer insight jobs. Bugs and cash scale by `10^(rank - contractBaseRank)`; insights add one per two extra ranks. Start snapshots duration, cash and insights. Changing staff/research cannot alter accepted terms. Old active contracts preserve their existing reward/progress.

Base insight rewards for smoke/regression/release/accessibility/load/migration/resilience/audit/launch are 1/4/12/12/26/44/70/110/180. Longer advanced work deliberately yields more insights per minute than short repeat cash jobs; higher rank short jobs still offer a useful cash-focused alternative.

Add achievements for research, staff, certificates, Gold mastery, campaign completion, higher ranks, repeated prestige, contracts and lifetime wealth. Preserve existing IDs and +2% bonus.

Schema 4 uses `qa-idle-studio-v4`. If absent, read `qa-idle-career-v3`, normalize missing fields, apply capped offline production once and checkpoint v4. Keep v3 and older MVP keys untouched. Accept raw/v1/v2/v3/v4 imports. Unsupported/corrupt saves never silently overwrite. Allowlist collections, bound levels/certificates, enforce research prerequisites and recruitment, keep locked crew inert, discard malformed jobs and validate snapshots without moving their goals.

Keep the visual style. Add Projects and Studio navigation, a workspace project reminder, certificate promotion conditions and accurate prestige copy. Develop in an isolated checkout so the user's existing live game remains available. Deliver a fresh PR, source archive, static build and portable HTML with migration, offline, prerequisites, assignment, phase/claim idempotency, rank and browser coverage.

## Verification record — 2026-09-19

Shipped registries contain 9 ranks, 7 producers, 31 cash upgrades, 9 contracts, 9 projects / 27 authored phases / 27 certificates, 12 research nodes / 43 levels, 6 specialists and 30 achievements.

`pnpm run check`: 386 tests in 28 files passed, including migration from v3, save checkpoint idempotency, malformed saves, project snapshots and claims, research prerequisites, specialist assignment, prestige retention and integrated React flows. TypeScript, ESLint, formatting and repository health checks passed; health still reports advisory file-size warnings. `pnpm run build:portable` passed. The 331,694-byte standalone HTML contains one inline script and one inline stylesheet; its JavaScript passed `node --check`. CI builds both site and portable file.

Deterministic campaign simulations tick once per second, buy/research every five seconds, submit ready work immediately and reinvest by income per cost. They retain the baseline Director tests and add:

| Scenario | Time | Result |
| --- | --- | --- |
| Active, manual test every two seconds | 77m 16s | 9 clients completed; Founder at 57m 16s |
| Manual tests only until first passive producer | 81m 44s | 9 clients completed; Founder at 61m 44s |
| Gold mastery after active campaign | another 3h 23m 51s | All 27 certificates attainable |

These are automated strategy measurements; real play depends on visits, choices and time between phase submissions.

Browser checks cover desktop and 390px mobile layouts, project phase transitions, purchases and prerequisite changes, staff replacement, and the first hire plus v3 import/reload in the production build. Project and contract timers display seconds. A completed project displays its ending and rewards until dismissed or navigation changes. Navigation dots signal a ready project phase or affordable research. Starting a project returns to its progress area.

The site uses relative asset URLs for subdirectory hosting. Direct `file://` launch could not be automated under the browser's URL policy; the standalone structure and script were checked separately, and gameplay was tested over local HTTP.
