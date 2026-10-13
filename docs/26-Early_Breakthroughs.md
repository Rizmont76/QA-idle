# 26 — Early Breakthroughs and Connected Production

Authorized 2026-10-12: fix the core loop as an active goal, following the diagnosis
in `ideas/Core_Loop_Diagnosis.md`. This scoped redesign supersedes the named
pacing/unlock/product rules in 20–25. Dependencies: 02, 05, 07, 10, 11, 14,
20–25. Preserve existing purchases, resources, research, certificates and saves.

## First playable experiment

An opening of roughly 10–15 minutes is an observation window, not mandatory rank
residence. Demonstrate growing production between purchases, an investment that
changes a bottleneck, an automation reward and the next concrete capability.
Do not add mandatory counts merely to delay an otherwise completed rank.

Middle promotion grants automatic reporting at no cost. Previously bought auto
reports remain owned; existing Middle-or-higher saves gain the entitlement on
normalization. The original upgrade ID remains supported for compatibility.
Junior still requires one cash upgrade and three purchased assistants.

Senior reveals the permanent pipeline immediately (bestStage >= 2 or careers > 0).
It also starts on repeat careers, retaining its previous releases and allocation.
Main releases both earn their existing build credit and compile a permanent
autotest. No new spendable currency or additional timed project is introduced.

Each compiled autotest finds 0.5 bugs per effective second before shared production
bonuses. It receives the same production upgrades, research, rank, experience,
badge and architecture crew multiplier as ordinary producers, but no specialist
bonus tied to a particular crew type. Thus main pipeline lifetime releases now
represent retained production capital. Trial releases never compile autotests.
Spending credits does not reduce compiled tests. Current production is ordinary
crew output plus compiled-test output; both contribute to work and report income.

Integrate new compiled tests continuously: for a constant deploy rate d over t,
additional bug work is scriptPower * d * t^2 / 2. Integrate piecewise at queue
boundaries and the lifetime-release cap. Long advances, fine ticks and offline
efficiency must agree. Dispatcher completion and passive badge thresholds use
this growing flow, rather than initial-rate estimates. Settling time before a
purchase or role change preserves the effects that actually applied during it.

## Systems interact

Runner ownership speeds Verify per core by 1 + sqrt(runners) / 2; labs speed Deploy
by the same formula, and cloud farms speed Build. AI and orbital ownership add a
shared multiplier 1 + sqrt(AI) / 10 + sqrt(orbital) / 5. Existing crew bug output
and purchase prices remain unchanged. Only crew available at the current rank
contributes to these capacity bonuses. Show station effects at the point of purchase.

Internal products retain project-throughput effects and additionally multiply
all main pipeline station capacities by 1 + internal product boost. Licenses keep
their flat income and additionally pay toolStrength times the current compiled
autotest bug output times report value. Thus License monetizes installed capacity,
while Internal invests in growing it. Integrate licensed script work continuously.
Open source keeps its job insight bonus and generates productBoost(open) / 10
insights per main release. Insight balances and lifetime totals retain fractions
on save/load; research costs and authored job payouts stay unchanged. Model 1
offline periods have neither new royalty nor passive insight effects.
Show actual income, insight rate and pipeline before/after values on role cards.
At the lifetime release cap, passive insight income is zero; existing licensed
production and job insight bonuses continue to work.
Trials
keep their authored constraints: no crew, product or rack capacity bonuses.

## Promotion as capability

Keep independent rank income and x2 rank production. Replace document 25's
mandatory crew/research/tool/staff/contract counts with these opening objectives:

| Current rank | Next-rank income candidate | Required demonstration | Next capability |
| --- | ---: | --- | --- |
| Junior | 150 | one cash upgrade, three assistants | free automatic reporting |
| Middle | 15,000 | first project certificate | pipeline compiling autotests |
| Senior | 300,000 | 100 main releases | Heavy Regression trial |
| QA Lead | 25,000,000 | one claimed trial reward | Slow Deploy trial |
| Head | 1,000,000,000 | two claimed trial rewards | prestige and rack frontier |
| Director | 10,000,000,000 | no additional checklist | cloud/AI growth |
| VP | 1,000,000,000,000 | no additional checklist | orbital growth |
| Chief | 1,000,000,000,000,000 | no additional checklist | platform tool |
| Founder | — | optional mastery | further permanent development |

These numbers are candidates to be measured and adjusted, not evidence of fun.
Later ordinary ranks have no fixed crew or certificate-count requirements.
Projects, tools and research remain useful optional investments, with preserved
discovery prerequisites. Do not auto-claim a trial or force a prestige.

The existing opt-in chapters policy, presented as Auto Studio, also invests in optional unlocked tools and
research after current demonstrations. It retains its ID and off-by-default
state; it never changes an owned tool's role or claims a trial. Research reserves
insights for the nearest unlocked unowned tool. These investments are not gates.

Budget trial requires 100 main releases and best rank Senior; verification also
requires best rank QA Lead; deployment requires best rank Head. Existing careers
>= 1 qualify for every trial they previously had. Saved rewards require the
corresponding lifetime/rank eligibility. Trial amounts and rewards are unchanged.
Architecture remains gated by first prestige and all three trial rewards; network
remains gated by all blueprints. This gives the first prestige a new frontier while
earlier automation makes familiar work easier. Future tabs stay hidden.

## Presentation and validation

Use one nearby discovery promise. Workspace and resource overview show compiled
autotest count, current output and growth. The pipeline shows releases creating
autotests and the economic connection. Promotions name their newly opened action;
claiming an automation trial shows what previous work can now be delegated.
Do not imply a flat production rate for a system whose output is growing.
The discovery's action opens its actual destination: a trial opens the main
pipeline, a blueprint opens Architecture, a network goal opens Network, and a
promotion/prestige opens Career. This explicit action overrides a previously
visited workshop subtab; ordinary navigation may retain the chosen subtab.
Keep the destination with the discovery content in authoritative selectors,
and still validate hidden-layer eligibility before rendering.

The existing v4 state already stores total releases. Add pipeline model 2 as a
migration checkpoint; missing/unknown model denotes the old detached pipeline.
Settle its outstanding offline period under the old eligibility, capacities and
zero compiled-test output, then activate model 2 and grant Middle reporting.
Owned unsold bugs are converted once, not discarded. Old main releases remain
production capital after migration, but never earn retrospective autotest income.
Model 1 is temporary during import/load; checkpoint model 2 before live play.
Keep all valid late progress, preserve locked inertness and reject rewards obtained
before their documented prerequisites. Continuous time uses a precise seconds
offset and snaps at automation timestamps, avoiding Date rounding at badge slices.
Check current player save on a separate test origin before updating the live build.

Verify production integrals, queue/cap boundaries, passive badge/dispatcher timing,
role tradeoffs, unlock transitions, trial eligibility, opt-in spending, promotion
entitlements, old-save round trips and repeat careers. Measure meaningful actions
and discoveries as well as total time. Run full checks/build and mobile/desktop QA.
Subjective enjoyment remains player feedback, never a simulated assertion.

## Prototype observations — 2026-10-12

The simulation buys periodically, submits available projects and deliberately
allocates cores. Normal reinvestment discovers Senior at 234 seconds, Lead at 296,
Head at 426 and Director at 624. Low-click Director is 808 seconds; bulk investment
is 484. A retained repeat career reaches Director in 63 seconds. Campaign completion
is 1145–1327 seconds. These measure reachability and compression, not player fun.

Technical checks cover continuous production and licensed output, fractional
insight persistence, role changes settling previous time, Date-sized timestamps,
dispatcher/badge boundaries and pre-update offline settlement. Desktop and 320 px
browser checks cover role payoffs, the resource ledger, trial rewards and promotions.
An exported real Head save preserves rank, team, purchases, certificates, research,
products, roles, specialists, experience and insights on a separate test origin.

Prototype delivery completes TODO stage 2. Player experience and later-frontier
revision remain pending. Existing late layers are retained; do not claim that
their enjoyment, or the entire goal, has been validated by these simulations.
