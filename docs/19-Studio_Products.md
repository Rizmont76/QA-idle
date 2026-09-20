# 19 — Studio Products

Status: approved implementation scope, 2026-09-20. Authorized by the request to continue expanding the game. Extends [17 — Studio Expansion](17-Studio_Expansion.md) and [18 — Living Office](18-Living_Office.md); existing rules remain unchanged.

## Player loop

Turn client experience into six owned QA tools, each with three releases. A matching Bronze/Silver/Gold project certificate unlocks development of v1/v2/v3. Invest money and insights, validate against newly found bugs and a minimum duration, then explicitly publish. Published products generate money every second independently of bug reporting. No new currency or random reward is added.

The existing final campaign project is now described as the studio's flagship, since smaller owned tools can precede it. Its gameplay and rewards stay unchanged.

There is one development slot, separate from projects and contracts. New bugs count toward all active work; development does not consume stored bugs or divert team production. Manual tests count. Offline progresses only the current development; it never publishes, spends, or starts another version. Publishing is idempotent and cannot reward elapsed time before the action.

## Content and formulas

| Product / ID | Certificate project | Base rank | Cash investment | Insights | New bugs | Seconds | Income/sec |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Checklist Studio / checklist | button | 2 | 4,000 | 3 | 2,000 | 90 | 12 |
| Device Lab / devices | mobile | 3 | 80,000 | 8 | 25,000 | 180 | 200 |
| Sandbox Pay / sandbox | payments | 4 | 900,000 | 15 | 200,000 | 300 | 1,800 |
| Load Cloud / loadcloud | players | 5 | 12,000,000 | 24 | 2,000,000 | 480 | 20,000 |
| Signal Watch / signal | network | 6 | 180,000,000 | 40 | 12,000,000 | 720 | 250,000 |
| QA Operating System / qaos | platform | 8 | 25,000,000,000 | 80 | 300,000,000 | 1,200 | 25,000,000 |

For release index `t = 0..2`: investment `baseCash * 12^t`, insights `baseInsights * (t + 1)`, bugs `baseBugs * 10^t`, time `baseSeconds * 2^t`, income `baseIncome * 5^t`. Development requires current rank `min(8, baseRank + t)` and at least `t + 1` certificates of the associated project. A release replaces its previous income; rates are not summed across versions. Existing research, specialist and achievement multipliers do not multiply product income or alter development terms.

During an upgrade, the published version keeps earning. Canceling discards development with no refund; the UI requires confirmation explaining this. Published releases, certificates and lifetime product earnings survive prestige. Prestige cancels unfinished development without refund, explicitly stated before confirmation. After prestige a product is dormant below its base rank, then its full published-version income resumes. This is a permanent rebuild benefit, not a Junior income shortcut.

## Time, saves and UI

Product income uses the same eligible time cap and offline efficiency as the rest of the team. Integrate it in each existing time slice so dispatcher boundaries cannot duplicate income. Include income in money, run earnings and lifetime earnings (thus promotion/prestige); track product earnings separately for display. Unpublished tools and dormant products are inert. Bound all counters to the existing finite 1e15 cap.

Keep additive schema 4 and the existing save key. Add `products: { releases: Record<string, number>, development: { id, version, progress, elapsed } | null, earned: number }`. Old saves default to an empty portfolio. Allowlist product IDs, bound integer releases to 0..3 and certificate/best-rank eligibility, and validate development as exactly the next version with current rank/certificate requirements. Clamp work/time to the registry terms. Drop malformed development without granting releases or a refund. V3 migration ignores product fields.

Add a Products tab with portfolio totals, an active development/release area, six authored product cards, three release milestones, exact prerequisites, cost, income and development targets. Connect projects and products through a shortcut; show ready-release navigation notification. Keep total income in the main HUD, distinguishing royalties from reports. Include royalties in the return summary and explain product retention in prestige. Ensure mobile navigation fits eight entries and honor reduced-motion preferences.

## Acceptance

Verify spending once, rank/certificate/slot gates, two independent completion conditions, manual and passive work, explicit publication, upgrade continuity, no retroactive income, offline efficiency/caps, dispatcher coexistence, reload idempotency, malformed and legacy saves, prestige retention/dormancy and finite saturation. Run full project checks, portable build, and browser desktop/mobile flows before delivery through a fresh PR and updated artifacts.

## Verification — 2026-09-20

`pnpm run check` passed: 423 tests across 32 files, including 16 new product domain cases and three integrated UI flows. TypeScript, lint, formatting and repository health passed; health reports advisory file-size warnings only. Product investment recovery at full online income ranges from roughly 5.6 minutes for the first checklist to 96 minutes for the final QA OS version, excluding development time. These are registry constraints, not a human playtest claim.

`pnpm run build:portable` passed. Browser checks covered the fresh locked catalog, an old v4 fixture without product fields, investment, timed development, explicit publication, income, starting an upgrade while v1 continues earning, desktop layout at 1440px and mobile widths 390px/320px without horizontal overflow. Production import/reload retained royalties and a ready v2 without publishing it automatically; manual v2 publication changed income to $60/sec. No browser console errors were observed. Test fixtures used separate origins from the player's game.

Direct `file://` execution remains outside the test browser's allowed URLs; the portable HTML is structurally checked separately and the production build exercised over HTTP.
