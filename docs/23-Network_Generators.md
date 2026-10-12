# 23 — Network Generators and Progression Continuity

Status: authorized continuation, 2026-10-12. Extends 20–22. Dependencies: 07, 16,
20, 21, 22. Owns the discovery after the four architecture blueprints, and concrete
guidance through the preceding path. Keep v4 save identity and earlier progression.

## Earlier path and release

Recover reviewed pipeline/architecture changes directly onto main; intermediate PR
merges are not a release. Validate the actual main files after merging.
Measure a reproducible path from new career through first prestige, three trials,
four blueprints and first network reboot, using real validated actions. Existing
campaign measurements remain 650s to Director with studio and 1178/1443s to the first
active/low-click campaign. Measurements are not claims about subjective enjoyment.

Before first prestige, discovery guidance names the next rank and missing crew/income
requirements, then the first prestige. During the flow blueprint, show the maximum
sustainable rate possible with current modules and core pool, so the player can tell
whether to reallocate or buy another core. Do not nerf purchased upgrades or restore
project timers. The network preview is visible inside CI/CD before it unlocks.

## A chain that creates itself

All four architecture rewards unlock Network automatically, including old completed
saves. Start with one Agent. Locked network data is inert. Four persistent generator
tiers are purchased with a new local currency, computations (обчислення):

| Tier | Title | Produces per effective second per unit | Base price | Unlock: best run computations |
| --- | --- | ---: | ---: | ---: |
| 0 | Агенти | 1 computation | 10 | 0 |
| 1 | Планувальники | 0.04 Agents | 80 | 80 |
| 2 | Кластери | 0.015 Schedulers | 1200 | 800 |
| 3 | Регіони | 0.005 Clusters | 20000 | 8000 |

Next price is ceil(base * 1.6^purchased), maximum 40 purchases per tier per run.
Generated units may be fractional and do not raise purchase prices. They immediately
produce. Spending never reduces run/lifetime unlock progress. Show purchased vs
generated units, per-tier production and next unlock. No fixed completion timer.

Integrate the four-tier chain analytically: units are polynomials up to degree 3;
computations use the degree-4 integral. Never approximate a long absence with Euler
steps. Use existing offline cap/efficiency and finite resource bound 1e15. Settle old
time before actions. The network persists through ordinary career prestige.

## Network reboots and permanent choices

At 2000 run computations, a manually confirmed network reboot awards
floor(sqrt(run computations / 2000)) protocols. Reset local computations, run total,
units and purchase counts to the one-Agent seed. Preserve best run, unlocked tiers,
protocols, protocol upgrades, automation flag and reboot count. Earlier game systems
continue. Each completed reboot adds 25% to network rates, additively.

Spend protocols on independently selectable permanent upgrades:

| ID | Effect | Levels | Costs |
| --- | --- | ---: | --- |
| cascade | +50% network generator rates per level, additive with reboot bonus | 3 | 1, 2, 4 |
| bridge | +25% main pipeline per-core rates, crew production and project throughput per level | 3 | 1, 2, 4 |
| autobuy | unlock optional network generator purchases | 1 | 1 |

Auto purchase defaults off, spends computations, checks the existing five-second
automation grid after career/core policies, and buys at most one unit per boundary.
Prefer the highest unlocked affordable tier that is not capped. No automatic reboot
or protocol purchases. This introduces a generator chain and a local prestige loop;
it must not duplicate the three-stage project/trial mechanic.

## Save, interface and validation

pipeline.network stores computations, runTotal, best, units, purchased, reboots,
protocols, totalProtocols, upgrade levels and autoBuy. Missing data gets a one-Agent
seed with empty counters/off; locked data is discarded. Validate finite nonnegative
numbers, four-element arrays, integer levels/purchases, costs against run totals,
protocol spending against lifetime earned protocols, unlocks and opt-in flags.

Use a third Network subview inside CI/CD. Show the chain, upcoming generator tiers,
live feedback, reboot reward/reset scope and permanent protocol choices. Reboot uses
an in-game confirmation. Discovery card continues beyond the fourth blueprint.
Keyboard/mobile controls, 320px layout, no extra main navigation tab.

Test analytic growth vs split advances, affordable actions/unlocks, reboot rewards,
permanent effects, old saves/malformed payloads, prestige, opt-in spending and offline
parity with automation. Measure the complete first path and repeated network runs.
Run full check/build and browser verification on separate test saves. Preserve the
player's actual save and prepare fresh portable/site/source artifacts.

## Measured first path

The shared campaign policy reinvests every five seconds and uses studio research.
The network policy manually reinvests every five seconds until the first reboot,
then chooses Samorozvytok and enables automatic purchases. At reboot 2 it buys Cascade.

| Event | Active path, seconds from new game |
| --- | ---: |
| Director and first prestige | 650 |
| Budget trial reward | 714 |
| Verification trial reward | 774 |
| Deployment reward, four blueprints, Network | 864 |
| Network reboot 1 / generator automation | 1065 |
| Network reboot 2 / Cascade | 1229 |
| Region unlock | 1404 |

The same path with few manual career tests reaches Regions at 1674 seconds. Purchasing
and blueprint choices still require interaction; this is not a fully AFK first run.
All four architecture blueprints can finish at one timestamp when the core pool is
already sufficient. The rack is a set of configuration discoveries, not another wait.
