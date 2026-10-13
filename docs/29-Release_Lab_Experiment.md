# 29 — Release Lab gameplay experiment

Player feedback 2026-10-13 rejects the focused prototype as lifeless. The QA theme
is explicitly acceptable; how it plays is the problem. The earlier 577 tests and
reduced management do not demonstrate success. Dependencies: 01, 02, 07, 24–28.

This is an isolated, playable opening experiment at `?playtest=release-lab`.
It does not replace or migrate the career. Use a separate v1 storage key
`qa-idle-release-lab-v1`; never read/write/delete the player's career keys.
Keep the old game available until this loop earns player interest. The experiment
is gameplay rather than additional narrative screens, mandatory minigames or
another layer attached to the existing dashboard.

## The loop

One screen shows a client build being tested. Work earns reports; reports buy
production or a doubling of efficiency. Lifetime work in this build determines
the reward for shipping it. Shipping resets the live laboratory and keeps
patterns, which strengthen the next build. Show the actual lost assets and new
power before shipping. Shipping remains an explicit player choice.

The player can ship early or hold a productive build for a larger gain. New
mechanisms then grow production between purchases: scripts write productive
test cases, and CI nodes eventually create scripts. Keep that causal chain visible.
No project checklist, simultaneous tab unlocks, phase claims, penalties or wait timer.

## Authored rules

- Fresh: zero reports/work/patterns/producers; a manual test gives 3 work/reports.
- Testers cost `ceil(9 * 1.22^purchases)` and produce 1 report/work per second each.
- Efficiency costs `ceil(60 * 5^level)` and doubles manual/output efficiency, up to
  5 purchases per build. It also speeds script and CI production.
- Persistent pattern power: `(1 + patterns)^2`. Multiply report/manual output
  by this power and `2^efficiency`. The first pattern makes the next build ×4.
- Scripts cost `ceil(1200 * 1.5^purchases)` and create 0.12 test cases/s, before
  efficiency. Each case creates 0.25 report/work per second before output power.
- CI nodes cost `ceil(60000 * 1.7^purchases)` and create 0.05 scripts/s before
  efficiency. Scripts/test cases are live growing stocks, not levels of a cash buff.
- Producer purchase limit: 100 of each type per build. Generated stocks and all
  work/report totals cap at 1e15; patterns cap at 1e6. Keep values finite.
- Alongside buying one producer, offer a maximum affordable batch when at least
  two are affordable. Show the exact count and total cost. Calculate/validate the
  quote in game logic after settling elapsed work; never exceed the purchase cap
  or spend future income. This removes repeated hiring without automating choices.
- Work per reward unit grows with build complexity:
  `min(1e15, 300 * 2.5^min(patterns, 32))`. Patterns still make production and
  purchases stronger, but later builds cannot be completed with one manual click.
  Show the current work requirement and use it for the client build preview too.
- Shipping reward: `floor(sqrt(buildWork / rewardUnitWork))`, capped to the next not-yet-reached
  discovery, the pattern limit and the reward achievable at the work ceiling.
  Thus one shipping action cannot unveil several
  new mechanisms. Spent reports still count as completed build work.
- Shipping resets reports to 9, build work/efficiency/purchases/cases to zero,
  testers to 1, and grants one starter script/CI node only if its mechanism is
  already unlocked. Keep patterns, number of builds, all-time work and opt-in.

Sequential discoveries: first pattern = stronger reusable code; 3 patterns =
scripts/test cases; 8 patterns = optional automatic purchasing; 12 patterns =
CI producing scripts. Show only the nearest next discovery. At 12 patterns the
opening experiment is complete; the factory remains playable, without a fake
promise that the entire career has been redesigned.

Automatic purchasing defaults off, including when unlocked. If chosen, it buys
one cheapest affordable unlocked producer every 5 seconds, with current report
spending disclosed. Efficiency and shipping remain manual choices. Preserve the
choice after shipping. Settle old elapsed work before any player action.

## Time, saves and presentation

Analytically integrate the growing chain between actions/ticks, including the
moments when generated stocks saturate. Offline cap 8 hours; optional purchases
split work at the same five-second boundaries as online play. Normalize unknown,
negative and non-finite values; locked stocks/flags remain inert. Round-trip the
schema and export/import through visible controls. Corrupt data is retained and
autosaving blocked until the player explicitly imports a valid state.

The build preview and client status are derived from current work/release state.
They never award resources or request extra clicks. Existing authored client
Liza supplies the first build. A visible loop shows producers and actual current
rates; production stocks grow continuously. Use code-native visuals, distinct
typography and a focused layout; respect reduced motion and narrow screens.

## Evaluation

Validate spending, reward/reset previews, one discovery per shipment, live
self-growth, hidden controls, strict save isolation and online/offline parity,
including opt-in boundaries and saturation. Measure a reproducible opening
policy, but do not equate its completion time or tests with fun. Visually play
first hire, first shipment and the self-growing layer. Player rejection calls
for another gameplay decision; more cosmetic content is not evidence of success.

The initial fixed 300-work rule was rejected during evaluation: the reference
policy reached the factory in 129 seconds and spent only 24 seconds with scripts.
Complexity scaling gives growing stocks time to contribute without a wait timer.
