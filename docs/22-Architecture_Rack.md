# 22 — Architecture Rack

Status: authorized continuation, 2026-10-04. Extends [21](21-Pipeline_Breakthrough.md).
Owns the discovery after the three pipeline trials. Dependencies: 07, 16, 20, 21.
The objective is a new spatial decision, immediate feedback and automation of the
previous layer. No new currency, project timer or automatic prestige.

## Rack and effects

Claiming all three trial rewards unlocks a permanent 2-row, 3-column server rack.
Six initially empty slots. Placing, replacing and removing modules is free and
reversible; duplicates allowed. Only orthogonal neighbours connect, without wrapping.
Power budget starts at 8. Two +1 upgrades cost 250 and 1500 build credits. Blueprint
2 grants another +1 power, for a maximum of 11. All effects require the rack unlock.

| Module | Power | Effect | Unlock |
| --- | ---: | --- | --- |
| build | 2 | +1 build rate per main pipeline core | rack |
| verify | 2 | +0.75 verify rate per core | rack |
| deploy | 2 | +0.5 deploy rate per core | rack |
| bus | 1 | Each adjacent bus adds 50% to a worker module's contribution | cycle |
| archive | 2 | +25% project throughput per adjacent worker | bus |
| manager | 2 | +20% crew production per adjacent worker | flow |

Worker = build/verify/deploy. Contributions sum; crew/project bonuses are additive
within the rack and multiply their existing system effects. Buses affect worker
contributions only. Trial rates and budgets stay fixed. Show actual per-core rates,
power and crew/project multipliers while editing. Existing manual production that
scales with crew production benefits naturally from manager effects.

## Permanent blueprints

Claims are manual, once each, require the previous blueprint, and have no timer.
Changing the layout afterwards retains rewards. Conditions use the current valid rack.

| ID | Condition | Reward |
| --- | --- | --- |
| cycle | All 3 worker types present | bus module |
| bus | One bus touches 3 workers | archive module and +1 power |
| flow | Sustainable main pipeline rate >= 8 releases/s | manager and optional auto balance |
| studio | An archive and manager each touch >= 2 workers | optional auto core purchases |

Sustainable flow = minimum of effective per-core rate times allocated cores for each
station, not a temporary burst from buffers. With 3 purchased cores and the budget
trial, [build,bus,verify,null,deploy,null] and allocation [2,4,5] produce 8.75/s.
[build,archive,null,manager,verify,null] satisfies studio at 8 power. These are examples,
not forced solutions. After all blueprints, honestly show completion and optional
layout/collection goals, not an unavailable promised layer.

## Automation and simulation

Both policies default off. Auto balance unlocks with flow: choose an integer allocation
using all cores that maximizes sustainable rate; ties minimize distance from current
allocation. Recalculate on enabling, layout edits, core changes and load. Disable main
manual allocation while enabled; trials remain manual. This does not pause production.

Auto cores unlocks with studio. Every existing 5-second automation boundary, after
career policies, buy at most one affordable core through the normal validated action.
It spends build credits, works with all career policies off, and rebalances if enabled.
It never purchases rack power, changes modules or claims blueprints. Changes settle
old production first. Preserve equal-efficiency fine/offline parity and existing cap.

## Persistence and interface

Retain v4 save identity; add pipeline.architecture with layout, powerLevel, blueprints,
autoBalance and autoCores. Missing data defaults empty/off. Validate IDs, finite levels,
power budget, prerequisite-ordered blueprints, module unlocks and policy unlocks.
Purchased power must be affordable from lifetime releases. Keep legal cells in index
order and drop over-budget/unknown/locked cells. Locked rack data is inert/discarded.
Everything survives prestige. Preserve existing career, pipeline and studio progress.

Use an Architecture subview inside CI/CD, visible as a locked preview before unlock.
Slots are keyboard-accessible buttons; select then place a module. Display effective
bonuses, neighbour links, power, blueprint conditions/rewards and opt-in spending.
Show the next blueprint on the existing discovery card; no extra main navigation tab.
Support desktop and 320px. Validate spatial rules, all blueprint paths, automation,
load/migration, prestige and offline parity; full check and portable build, browser QA.
