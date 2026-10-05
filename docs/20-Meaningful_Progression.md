# 20 — Meaningful Progression

The next layer is specified in [21 — Pipeline Breakthrough](21-Pipeline_Breakthrough.md).

Status: approved redesign scope, 2026-10-02, responding to direct player feedback about timer walls, duplicate product/project loops and weak studio research. This supersedes the affected rules in 17 and 19. Unchanged career, contract, offline and prestige rules remain in force.

## Projects: work, not mandatory waiting

Remove minimum phase times. A phase is ready as soon as its work target is reached, whether through manual tests or crew production. Keep authored phase stories and explicit final certification. Replays scale work by 4 per tier instead of 12 (1/4/16 instead of 1/12/144); reward scaling is unchanged. Retain certificate requirements for senior promotions, but replace their waiting wall with useful team/research/product work.

Fieldnotes research level 1 enables automatic intermediate phase submission and carries excess new work forward through the same project, online and offline. The final phase always waits for manual release; no certificate, reward or next project is granted automatically. Without Fieldnotes the player still submits each phase. A ready phase at the start of a tick may advance with Fieldnotes even if production is zero. Manual tests use the same work routing.

Project work per newly found bug is `(1 + internal product boost) / (1 - fieldnotes bonus)`. Research and product changes settle elapsed time first; then affect current work immediately. Newly accepted projects store unit workMultiplier and `flowVersion: 1`. Migrate old active projects preserving their current phase and completion fraction under the old target, mapping it to the new target; retain rewards and insight snapshots. Completed old phases remain ready. Legacy elapsed values no longer gate completion.

## Products: choose what the business does

Replace all product development timers and three-version upgrades with one immediate launch per product, requiring its base rank, its first associated certificate, base cash and base insights from document 19. No Silver/Gold product gates. Owned tools survive prestige and are active from their base rank.

Each owned tool has one freely switchable role:

- License: passive cash at its existing v1 base rate times market strength.
- Internal: no royalty income; add the tool's strength to project work throughput.
- Open source: no royalty income; add half the tool's strength to insight rewards of newly accepted projects/contracts.

Tool base strengths in registry order are 0.25 / 0.35 / 0.5 / 0.65 / 0.8 / 1. The same tool cannot provide several roles simultaneously. Modes affect explicit opportunity costs, not another timed completion loop.

Portfolio clients are a persistent, bounded reputation counter, not spendable currency. Only successful jobs after the first product launch grow clients: +1 per contract, +10 per new project certificate. Maximum 400. Market strength is `1 + sqrt(clients) / 10`, thus 1..3. Repeated canceled work, publishing, changing roles and importing saves do not grant clients. New clients improve every owned product; actual cash begins only in License mode at the eligible rank. Existing reward snapshots are honored. Research + product insight multiplier is bounded by the registry maximum (<7); save validation accepts all legitimate snapshots.

Keep the v4 save key; product model 2 stores owned IDs through releases[id]=1, modes, clients, lifetime earnings and an optional migration-credit notice. Missing product data defaults inert. For legacy products, validate old released versions against certificates and best rank, preserve each owned tool once, refund the cash/insights spent on versions 2/3 and on any valid unfinished development. Each cost is derived from the old registry, never imported amounts. Refund once, with model 2 checkpointed on load/import; no earned/lifetime-earned increase for returned cash. Preserve old accumulated product earnings. An in-game notice shows actual refunded amounts and can be dismissed. Existing modes default License; clients default zero. Invalid jobs never refund.

## Studio: visible, substantial effects

Keep IDs, costs, level caps, prerequisites and owned levels. Automation gives +25% production per level (was 10%); leadership +30% (was 15%); bargaining +15% report value (was 8%); Fieldnotes -10% work per level, plus phase automation from level 1 (was 4%); intuition +100% manual base per level (was 25%); pipelines -10% new contract time per level (was 5%). Existing accepted contracts keep their duration.

Show exact before/after values for the next research level using authoritative selectors: bugs/sec, cash per bug, project throughput, manual power, offline cap/efficiency, hire price, contract time/cash, insight payout and specialist slots. Mark the phase-automation unlock explicitly. Keep these effects distinct from ordinary cash upgrades. Do not nerf already purchased cash upgrades to manufacture new waiting.

## Goals and validation

Project cards/progress show work and estimated time from current throughput, explicitly no mandatory timer. Products show clients, role tradeoffs, live role effect, a meaningful campaign link and portfolio totals instead of versions/development. Career goals continue to connect ranks, clients and tools. Document current goals and redesign in README; preserve the player's actual browser save.

Each applicable project card names the tool its first certificate unlocks, so the next campaign goal has a visible purpose before the player starts it.

Validate migration/refund idempotency, malformed saves, all three modes, no role stacking, earned client events, offline dispatcher boundaries, current-project research changes, work conservation across automatic phases, explicit final rewards, and save reloads. Use deterministic campaign and mastery simulations to measure time; distinguish measurements from subjective enjoyment. Run full checks, production build and desktop/mobile browser checks, then deliver a fresh PR and artifacts.

### Measured pacing

The same deterministic purchasing policy, with no product purchases, gives:

| Scenario | Previous Product Edition | Flow Edition |
| --- | ---: | ---: |
| Active first campaign (all nine clients) | 4,636 seconds | 1,178 seconds |
| Low-click first campaign | 4,904 seconds | 1,443 seconds |
| Remaining gold certifications with the finished campaign team | 12,231 seconds | 32 seconds |

The short final mastery cleanup is intentional: a team that has already completed the
entire campaign can sweep earlier work. It is no longer an additional multi-hour timer
requirement for products. These are simulation results, not a promise of player completion
time or evidence of subjective enjoyment.
