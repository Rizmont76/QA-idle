# Core loop diagnosis — 2026-10-12

Status: design hypothesis and proposed experiment, not production rules.
Player feedback: the game remains boring and the latest pacing change made it
worse. This invalidates the assumption that longer rank residence means more
meaningful content. Document 25 still describes the shipped implementation.

## Evidence from the current game

- `chapters.ts` requires producer counts, certificate counts, research levels,
  completed contracts and owned products. These are completion checks; they do
  not themselves add an interaction or change the underlying production loop.
- `selectors.ts` makes all career producers additive sources of the same bugs,
  with shared production multipliers. Most purchase decisions are about income
  per dollar. New producer names rarely change what the player is doing.
- Promotions multiply output by two through `rankMultiplier`. Their independent
  income requirement also grows. A larger number alone does not demonstrate
  mastery of an old obstacle or a new way to play.
- `projectFlow.ts` applies production to authored sequential work targets.
  Products offer income, project throughput or insight buffs. Those systems do
  contain choices, but much of early progression remains purchases and filling
  progress bars rather than interacting growth loops.
- `discovery.ts`, `pipelineActions.ts` and `pipelineFlow.ts` keep the pipeline
  unavailable until the first prestige. The most distinct early system, with
  allocation, bottlenecks and constraint trials, comes after five promotions.
- Document 25 measured first Director at 29–34 minutes under reinvestment
  policies. Those timings demonstrate reachability, not engagement. They say
  nothing about an actual player's enjoyment or idle time between purchases.

## What the examples suggest

Primary descriptions, checked 2026-10-12:

- [Revolution Idle](https://store.steampowered.com/app/2763740/Revolution_Idle/):
  layered resets, increasing multipliers/exponents, generator chains,
  challenges and automation strategies.
- [CIFI](https://play.google.com/store/apps/details?id=com.OctocubeGamesCompany.CIFI):
  production fleet, large skill/talent trees and spaceship evolution.
- [Farmer Against Potatoes Idle](https://store.steampowered.com/app/1535560/Farmer_Against_Potatoes_Idle/):
  successive areas, equipment, reversible talent choices and reincarnation
  with different classes.

Design inference, not a claim about every player's motivation: their useful
shared pattern is seeing an obstacle, discovering a growth mechanism, becoming
strong enough to trivialize that obstacle, then encountering a new horizon.
Strategic depth can support this, but requiring constant interaction or adding
minigames is not necessary to make an idle game engaging.

## Proposed experiment

Redesign one playable opening of roughly 10–15 minutes before expanding the
content catalogue. The duration is an observation window, not a minimum time
the player must wait at a rank. Document exact rules and migration before coding.

1. Replace mandatory completion counts with a progression path where the player
   can see the next concrete capability and why it is useful. Keep future tabs
   hidden, as requested, while teasing only the next breakthrough.
2. Bring a genuinely different production interaction into that opening.
   Evaluate reusing the existing pipeline rather than adding another isolated
   currency/tab. It must affect the career economy, not be a detached puzzle.
3. Give a breakthrough a visible consequence: an old bottleneck disappears,
   an old manual task becomes automatic, or production starts scaling through
   another resource. A numeric multiplier may accompany that consequence.
4. Let at least two investments interact. A promising purchase should make a
   previously overlooked system useful. Avoid mandatory micromanagement or
   penalties for leaving an idle game unattended.
5. Keep projects, tools and research only where they support this loop. Removing
   or repurposing redundant steps is preferable to padding them with new goals.

For example, a future pipeline integrated with the economy could make testers
improve throughput while a tool improves the payoff of each release. A milestone
could then enable parallel releases and automated handling of the previous
work. This is an illustration of the desired causal chain, not approved formulas.

## Validation

- Observe meaningful purchases, changed behaviour, visible payoff and the next
  discovery throughout the opening. Count mandatory claims and idle stretches.
- Inspect whether a new unlock changes a decision or only adds another purchase
  card. Explain each breakthrough in terms of the player's actual experience.
- Simulations check solvency, stalls, exploit paths and repeat-run compression;
  they cannot certify that the game is fun.
- Player feedback determines whether to extend the prototype to later layers.
  Preserve the current save before experimentation; do not reset the player's
  progress to obtain a convenient test case.
