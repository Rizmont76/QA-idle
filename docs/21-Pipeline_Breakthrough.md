# 21 — Pipeline Breakthrough

Follow-up: [22 — Architecture Rack](22-Architecture_Rack.md) extends the main pipeline with spatial modules after all trial rewards. Trial rules below remain unchanged.

Status: authorized 2026-10-04. Extends 16–20 with discoveries that change play, automation
of earlier work, alternative progression and a visible next unlock. No narrative victory gate.

## First prestige and capacity allocation

First voluntary prestige unlocks a permanent CI/CD workshop; existing careers >= 1
qualify on load. Before then it is visible as the next discovery but entirely inert.
Six shared cores start allocated [3,2,1] to Build / Verify / Deploy. Rates per core are
[3,1.5,1] units per effective second. Reassign whole cores freely, including zero.
Build feeds a 200-unit buffer, Verify transfers work into another 200-unit buffer,
Deploy converts it into permanent build credits. Full queues cause backpressure;
empty queues starve downstream stations. Show capacity, actual rates and limiting station.

Integrate continuous flow analytically between empty/full queue boundaries. Long and
split advances agree; no minimum timer or random failure. Offline uses the existing
cap and efficiency. Changes settle old time first. Credits buy six extra core levels
at ceil(25 * 3^level). Lifetime releases separately retain milestone progress after spending.
At 25 lifetime releases, optional automatic hiring unlocks; at 100, trials unlock.

## Independent trials

One trial at a time alongside the main pipeline and career. Each has its own allocation,
two empty initial queues, work and elapsed time. No entry cost or career reset. All
three become available at 100 main releases:

| ID | Title | Cores | Build / Verify / Deploy per core | Target | Reward |
| --- | --- | ---: | --- | ---: | --- |
| budget | Малий бюджет | 4 | 3 / 2 / 1 | 60 | +2 workshop cores |
| verification | Важка регресія | 6 | 3 / 0.5 / 2 | 120 | automatic project completion and bronze campaign |
| deployment | Повільний деплой | 6 | 3 / 2 / 0.5 | 180 | automatic upgrades and promotions |

Initial allocations [2,1,1], [3,2,1], [3,2,1]. Trial work produces no main credits.
Simulation stops exactly at target, recording elapsed effective time. Offline can
finish work but never claim. Claim once manually; no farming completed trials.
Cancellation grants nothing. Rewards persist through prestige.

## Earlier-layer automation

All policies default off and describe spending. Hire unlocks at 25 releases; project
automation after verification; upgrades/promotions after deployment. Checks run every
five eligible wall-clock seconds on a deterministic grid, each enabled policy doing
at most one action, order: promote, upgrade, hire, project.

Use the same validated actions as manual play. Hire buys one of the cheapest available
crew units; upgrade buys the cheapest available unowned upgrade. Both spend career money.
Promote is free. Project policy submits ready stages/finals, then when idle starts the
next unlocked project without a first certificate. It never starts silver/gold itself;
it may finish a manually selected active project. No auto prestige, research, products,
specialist assignment or trial claim. Changes affect future production only.

Integrate workshop, dispatcher and automation boundaries together. Long offline and
fine ticks at equal efficiency agree. Work is bounded by the existing maximum offline cap.
Policies and all workshop progress survive prestige; policies pause when prerequisites
for an ordinary action are unavailable.

With career policies enabled, also split passive work at income/bug achievement thresholds.
Their existing production bonuses take effect at the crossing, not at the end of an
offline batch. Settle any already reportable bugs before computing those boundaries.

## Save and UI

Retain v4 identity. Add pipeline credits, total, core level, allocation, queues, cleared
trial IDs, optional trial and four policies. Old saves default empty; validate finite
numbers, integer budgets, IDs, unlocks and trial bounds. Preserve current career/studio/
product migration. Cleared trials require the lifetime unlock; malformed states never
grant rewards. Locked workshop data is discarded.

Use a connected station schematic and shared pool, not project stages. Accessible
controls work at 320px. A workspace discovery card and visible trail announce upcoming
behavior. Prestige preview explains the workshop. Existing gameplay stays available.

Validate flow conservation and boundaries, all trial solutions/single rewards, save
normalization/reloads, locked inertness, policy opt-in, old save preservation and offline
parity. Run full check/builds and browser allocation/prestige/trial/automation/mobile checks.
