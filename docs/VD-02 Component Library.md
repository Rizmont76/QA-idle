# VD-02 - UI Component Library

## Document Status

**Project:** QA Idle

**Document Type:** Visual Design Documentation

**Owner Roles:**

- Senior Game UI/UX Designer
- Senior Product Designer
- Design Systems Lead
- Game UI Technical Designer
- Art Director

**Status:** Frozen v1.0

**Phase:** Phase 8A

**Depends On:**

- `VD-01 UI Design System.txt`
- `08-MVP_Vertical_Slice_Specification.md`
- `15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`
- `QA-Idle-Playable-MVP-Implementation-Backlog.md`

---

# 1. Purpose

VD-02 defines the reusable player-facing UI component library for the QA Idle Playable Idle MVP.

This document is implementation-facing design authority for components, component states, data contracts, feedback rules, accessibility behavior and component-level responsive behavior.

VD-02 does not define the final page layout, final workspace placement, breakpoint values, panel order or full-screen composition. Those decisions belong to VD-03.

The component library must allow QA Idle to move from the completed Technical Vertical Slice into the Playable Idle MVP without inventing temporary UI patterns. Components should feel like parts of a cozy, professional QA workspace rather than a generic SaaS dashboard, Jira clone, admin panel or debug interface.

---

# 2. Scope

VD-02 defines components for:

- application shell;
- workspace surface;
- header and current-career status;
- resource counters;
- Manual Testing action;
- Report Bugs action;
- primary and secondary buttons;
- Buy 1 and Buy Max controls;
- Assistant panel;
- Assistant level and production-rate display;
- production breakdown;
- upgrade cards;
- repeatable level-up card;
- one-time Support Upgrade card;
- locked and teased content;
- promotion progress;
- goal and requirement rows;
- progress bars;
- milestone indicators;
- unlock feedback;
- purchase feedback;
- offline-return summary;
- endpoint/completion state;
- toasts and contextual notifications;
- tooltips and help text;
- modal/confirmation patterns;
- diagnostics separation boundary;
- empty, loading and error states.

VD-02 does not define:

- gameplay formulas;
- balance values beyond example labels supplied by source docs;
- authoritative runtime calculations;
- final full-page layout;
- final responsive placement;
- React implementation code;
- new currencies, new producers, Automation, auto-reporting, full Team management or future systems.

---

# 3. Authority Boundaries

The component library must obey the following boundaries.

| Area | Owner |
| --- | --- |
| Visual language, tokens, spacing, motion philosophy | `VD-01 UI Design System.txt` |
| Assistant runtime behavior and system boundaries | `06-Game_Systems.md` |
| Tick, offline, save and diagnostics architecture | `07-Technical_Rules.md` |
| Playable Idle MVP scope and acceptance | `08-MVP_Vertical_Slice_Specification.md` |
| Modifier calculation and effect ordering | `09-Modifier_System.md` |
| Economy and purchase trade-offs | `10-Economy_Framework.md` |
| Resource identity, balances and transactions | `11-Resource_System.md` |
| Upgrade definitions, ownership and purchase behavior | `12-Upgrade_System.md` |
| Unlock lifecycle, visibility and teaser metadata | `13-Unlock_System.md` |
| Promotion availability, confirmation and outcome | `14-Promotion_System.md` |
| Assistant balance, active candidate values and simulation gates | `15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md` |
| Implementation sequencing | `QA-Idle-Playable-MVP-Implementation-Backlog.md` |
| Component contracts, states, feedback and accessibility | This document |
| Final workspace layout and exact responsive placement | VD-03 |

Components may display values, effects, prices, requirement progress and before/after previews only when those values are supplied by runtime/domain selectors.

Components must not reimplement:

- Assistant cost formulas;
- Assistant production formulas;
- Support Upgrade effects;
- Buy Max affordability loops;
- milestone detection;
- endpoint detection;
- offline progress calculation;
- promotion requirement evaluation;
- number normalization or authoritative decimal arithmetic.

---

# 4. Core Component Principles

## 4.1 Workspace Native

Components should feel like objects inside a growing QA workspace:

- notes;
- panels;
- checklists;
- monitors;
- compact work cards;
- task strips;
- status meters.

They should not look like issue tracker tickets, cloud admin widgets or analytics dashboards.

## 4.2 Component Reuse Before New Patterns

VD-02 prefers a small, composable library. New mechanics should reuse existing primitives and composites before introducing new component families.

## 4.3 Data In, Presentation Out

Every component receives display-ready domain data and renders it clearly. Components do not own gameplay rules.

Example:

```text
Good:
AssistantLevelCard receives currentLevel, resultingLevel, totalAffordableCost,
levelsPurchasable, productionPreview, crossedMilestones.

Bad:
AssistantLevelCard loops through level costs to calculate Buy Max.
```

## 4.4 Persistent State Beats Temporary Feedback

Toasts, animation and short-lived feedback are never the only indication of:

- unlocks;
- milestones;
- purchases;
- errors;
- endpoint completion.

The relevant component must persistently reflect the result after the feedback ends.

## 4.5 Color Is Never The Only Signal

All meaningful states must combine text, iconography, shape, position, label, motion or component state. Bugs Found and Money must remain distinguishable without relying only on color.

---

# 5. Reference Composition

The following hierarchy is a reference composition only. It explains how component families relate to one another. It is not final workspace placement, final responsive layout or page composition authority.

Names ending in `Group`, `Section` or `Layer` below are non-authoritative composition slots, not standalone component contracts: `ResourceCounterGroup`, `ActionControlGroup`, `UpgradeSection`, `SupportUpgradeGroup` and `FeedbackLayer`. VD-03 may replace, split, reorder or omit these slots without changing the component contracts in this document.

VD-03 owns final placement.

```text
AppShell
  WorkspaceSurface
    WorkspaceHeader
      CareerStatus
    ResourceCounterGroup
      ResourceCounter
    ActionControlGroup
      ManualActionControl
      ReportBugsControl
    UpgradeSection
      UpgradeCard
    PromotionProgressPanel
      RequirementRow
      ProgressBar
    AssistantPanel
      AssistantStatusHeader
      ProductionRateDisplay
      ProductionBreakdown
      AssistantLevelCard
        BuyOneControl
        BuyMaxControl
        MilestoneTrack
      SupportUpgradeGroup
        SupportUpgradeCard
    FeedbackLayer
      Toast
      UnlockFeedback
      PurchaseFeedback
      OfflineReturnSummary
    EndpointState
```

`EndpointState` is intentionally outside the temporary `FeedbackLayer`. Endpoint progress and completion remain persistent player-visible state; toast, motion or event feedback may supplement that state but never replace it.

---

# 6. Component State Model

Component state is dimensional. A component may have one value from each applicable dimension; event results and presentation overlays do not replace authoritative gameplay state.

## 6.1 Normalized State Dimensions

| Dimension | Terms | Meaning |
| --- | --- | --- |
| Visibility | `hidden`, `teased`, `visible` | `hidden` is not rendered. `teased` is limited, non-interactive Unlock System metadata. `visible` allows the applicable access state to render. |
| Unlock/access | `locked`, `unavailable`, `available` | `locked` means Visible Locked from the Unlock System. `unavailable` means visible but the runtime says the action cannot currently occur for a non-unlock reason. `available` means the runtime permits the applicable action or content access. |
| Ownership | `unowned`, `owned` | Persistent one-time purchase ownership. `purchased` is not an ownership state. |
| Progression/lifecycle | `pending`, `requirementCompleted`, `unlockCompleted`, `milestoneReached`, `endpointReady`, `endpointCompleted`, `maxLevel` | Domain-qualified persistent or runtime-derived progression. Generic `completed` is prohibited in contracts because it must not collapse requirement, unlock, endpoint or level-cap meanings. |
| Affordability/action eligibility | `affordable`, `unaffordable`, `eligible`, `ineligible` | Runtime-derived ability to commit an action. `disabled` is a rendered control condition derived from these authoritative values and their reason; it is not gameplay state. |
| Transaction/operation | `idle`, `loading`, `succeeded`, `failed` | Current command or asynchronous operation presentation. `success` and `error` are event-result presentation aliases for `succeeded` and `failed`, not persistent gameplay states. |
| Interaction | `rest`, `hover`, `focusVisible`, `pressed` | Transient input presentation. The shorthand `focus` used in prose means `focusVisible` when a visible focus indicator is required. |
| Feedback visibility | `feedbackHidden`, `feedbackVisible`, `newlyChanged` | Temporary feedback presentation. `newlyUnlocked` is a `newlyChanged` feedback event whose persistent access state is separately supplied. |
| Overlay/summary lifecycle | `closed`, `open`, `closing`, `dismissed` | Modal, toast, feedback and summary presentation lifecycle. Dismissal hides only that presentation instance and never reverses persistent gameplay state. |

Stable event results include `purchased`, unlock, milestone, offline, endpoint and error results. They require a stable runtime-provided result ID and may trigger `succeeded`, `failed`, `newlyChanged` or `feedbackVisible`; they do not become substitute persistent states.

Component specifications may use natural-language labels such as Junior compact or Middle expanded as variants, not state-model terms.

## 6.2 Deterministic Precedence

Resolve applicable dimensions in this order:

1. `hidden` prevents player rendering and announcements. A dismissed presentation instance is also absent, but its target's persistent state remains unchanged.
2. `teased` renders only authorized teaser metadata and forces non-interactive, ineligible control presentation. It cannot combine with `locked`, availability, affordability or ownership presentation.
3. `loading` or domain `pending` may suppress command activation while preserving the last authoritative visible values. They do not imply success or mutate ownership/progression.
4. `failed`/`error` feedback overlays the underlying legal state and supplies recovery information; it does not erase that state. Critical actionable errors may take announcement priority.
5. `maxLevel` suppresses Assistant level purchase affordances regardless of Money.
6. `owned` suppresses one-time purchase affordances. A `purchased` result may temporarily emphasize the now-owned state.
7. `locked` and `unavailable` force ineligible rendered controls and override affordability presentation. `locked` uses Unlock System data; `unavailable` uses another runtime-owned reason.
8. `available` permits eligibility resolution. `affordable`/`unaffordable` are shown only for runtime-valid purchase actions.
9. `hover`, `focusVisible` and `pressed` may decorate only rendered interactive or explanation-focusable elements and never override eligibility.
10. `newlyChanged`, success feedback and milestone/endpoint feedback are supplementary. `closing` then `dismissed` removes only the feedback or overlay instance.

## 6.3 Legal And Illegal Combinations

| Combination | Legal? | Notes |
| --- | --- | --- |
| `hidden` + any rendered, interactive or announced state | No | Hidden content does not render or announce. |
| `teased` + `locked` | No | Teased and Visible Locked are distinct Unlock lifecycle states. |
| `teased` + known locked requirements/action explanation | No | Teased content receives only teaser metadata authorized by Unlock System. |
| `teased` + `hover`/`pressed`/action focus | No | Teased content is strictly non-interactive. |
| `locked` + `focusVisible` | Yes | An explanation wrapper or control may be focusable and described programmatically. |
| `locked`/`unavailable` + `affordable` | No | Eligibility failure overrides affordability presentation. |
| `available` + `affordable` | Yes | Runtime permits and can fund the purchase. |
| `available` + `unaffordable` | Yes | Runtime permits the purchase category but current funds are insufficient. |
| `owned` + `unowned` | No | Ownership is mutually exclusive. |
| `owned` + purchase eligibility/affordability | No | One-time ownership suppresses repurchase. |
| `maxLevel` + level purchase eligibility/affordability | No | Level cap suppresses further level purchases. |
| `purchased` result + `owned` | Yes | Temporary result feedback accompanies persistent ownership. |
| `purchased` result + `unowned` after commit | No | A committed successful one-time purchase must resolve to runtime-owned state. |
| `loading` + `pressed` | No after dispatch | Pressed resolves when the operation begins; repeated activation is blocked. |
| `failed`/`error` + underlying legal state | Yes | Error presentation overlays the authoritative state and offers recovery. |
| `requirementCompleted` + `endpointReady` | Yes | Qualified states may coexist when runtime supplies both. |
| `milestoneReached` + `endpointCompleted` | Yes | They remain distinct persistent/event meanings. |
| `dismissed` + `open`/`closing` for one instance | No | One overlay instance has one lifecycle value. |
| `newlyChanged` + a persistent visible state | Yes | Temporary emphasis supplements, never replaces, the persistent state. |

## 6.4 Disabled And Explained Controls

Components must not rely exclusively on native disabled buttons when that prevents focus, tooltip access or screen-reader explanation.

For locked, unavailable or unaffordable controls:

- the visible button may use `aria-disabled="true"` instead of native `disabled` when explanation access is needed;
- the component must expose the runtime-provided reason in visible helper text or supplementary tooltip and create a persistent programmatic relationship such as `aria-describedby` or a framework-equivalent accessible-description mechanism;
- keyboard activation must not commit the action when `aria-disabled="true"`;
- focus state must remain visible.

Native `disabled` may be used only when no explanation is required or the explanation is provided by a nearby focusable element. Hover-only tooltip access is never sufficient. `disabled` describes rendered control behavior derived from authoritative eligibility; it is not an independent gameplay state.

---

# 7. Framework-Agnostic Component Data Contracts

These contracts are authoritative at the design level. They describe the data each component expects from runtime/domain selectors. Optional TypeScript or React examples may appear in an appendix, but those examples are illustrative and must not become a second runtime source of truth.

## 7.1 Shared Display Value

All numbers shown in UI use display projections supplied by runtime/domain selectors.

| Field | Purpose |
| --- | --- |
| `rawValue` | Authoritative decimal-preserving value or reference from runtime state. |
| `formattedValue` | Display-only value, already formatted. |
| `accessibleValue` | Screen-reader friendly value when different from visual format. |
| `unitLabel` | Resource, rate or count label. |
| `trendLabel` | Optional player-facing change text. |

Formatting must never feed back into authoritative state.

## 7.2 Shared Requirement Display

| Field | Purpose |
| --- | --- |
| `label` | Requirement text. |
| `current` | Display value for current progress. |
| `target` | Display value for requirement target. |
| `isMet` | Whether requirement is satisfied. |
| `explanation` | Optional human-readable missing condition. |

## 7.3 Shared Purchase Preview

| Field | Purpose |
| --- | --- |
| `purchaseTargetId` | Stable runtime/domain ID of the upgrade or Assistant level target. |
| `actionId` | Stable runtime/domain command ID for this purchase action. |
| `price` | Display value supplied by runtime/domain selector. |
| `canAfford` | Current affordability. |
| `canCommit` | Runtime-committed action eligibility; UI must not derive this from price, label, color or formatted values. |
| `reasonUnavailable` | Runtime-provided explanation for locked, unavailable, unaffordable, owned or max-level state. |
| `before` | Current effect display. |
| `after` | Resulting effect display. |
| `delta` | Optional concise improvement display. |
| `commitLabel` | Player-facing purchase button label. |
| `transactionResultId` | Stable runtime-provided result ID after an attempted commit, when feedback is present. |

## 7.4 Buy Max Preview

| Field | Purpose |
| --- | --- |
| `purchaseTargetId` | Stable runtime/domain ID of the Assistant level target. |
| `actionId` | Stable runtime/domain command ID for Buy Max. |
| `levelsToBuy` | Number of levels runtime says can be bought. |
| `totalPrice` | Full affordable range price. |
| `currentLevel` | Current Assistant level. |
| `resultingLevel` | Level after purchase. |
| `beforeProduction` | Current production display. |
| `afterProduction` | Resulting production display. |
| `crossedMilestones` | Ordered milestone displays supplied by runtime/domain selectors. |
| `endpointProgressImpact` | Display text for endpoint-related consequence, if any. |
| `canCommit` | Runtime-committed action eligibility. |
| `reasonUnavailable` | Runtime-provided explanation when zero levels are affordable, access is unavailable or max level is reached. |
| `transactionResultId` | Stable runtime-provided result ID after an attempted commit, when feedback is present. |

Buy Max previews must show crossed milestones and endpoint progress without calculating gameplay rules inside UI components.

Purchase components must never infer their target, command, eligibility, affordability or outcome from player-facing labels, colors, icons, formatted prices or before/after copy.

## 7.5 Feedback Event Display

| Field | Purpose |
| --- | --- |
| `eventId` | Stable event display identifier. |
| `kind` | Unlock, purchase, milestone, offline, endpoint, error. |
| `title` | Short player-facing title. |
| `message` | Concise explanation. |
| `persistentTargetId` | Component that will show persistent state after feedback ends. |
| `announceMode` | `polite`, `assertive`, `silent` or `aggregate`. |

`eventId` also deduplicates announcement and presentation after rerender, restoration or remounting. Re-presenting an already consumed event must not enqueue the same announcement again.

---

# 8. Number Formatting Rules

Resource, cost and rate components must support decimal-preserving authoritative values.

UI display rules:

- display formatting is read-only;
- visual rounded values must not alter runtime values;
- accessible values should avoid ambiguous compact notation where precision matters;
- costs, rates and before/after previews should use the same formatting rules within one local component group;
- when exact decimals are relevant, components may show a rounded visual value with a tooltip or accessible label containing the fuller value supplied by runtime.

Resource components must visually distinguish:

- **Bugs Found:** production resource, created by Manual Testing and Assistant passive/offline production, consumed by Report.
- **Money:** investment resource, created only by Report, spent on upgrades and Assistant purchases.

Distinction must use label, icon, value grouping and copy, not color alone.

---

# 9. Accessibility Announcement Policy

## 9.1 Live Region Principles

Live regions communicate meaningful changes, not every tick. Passive production ticks are silent by default and must not enqueue periodic time-window announcements.

## 9.2 Announcement Categories

| Event Type | Announcement Policy |
| --- | --- |
| Manual Testing action | Announce the first result in a rapid burst and aggregate subsequent activations, or expose the changing Bugs Found value through a labelled status region without repeatedly queueing announcements. |
| Report Bugs action | Immediate polite announcement summarizing Bugs converted and Money gained. |
| Passive production tick | Silent by default. Aggregate only on explicit request, focus entry into the relevant resource/Assistant status region, Offline Summary presentation, or a distinct runtime milestone/endpoint event. |
| Purchase success | Polite announcement; persistent owned/level state updates. |
| Purchase error | Assertive only if user attempted an invalid action; otherwise visible helper text. |
| Unlock | Polite announcement once; persistent component state must show availability. |
| Milestone reached | Polite announcement; persistent milestone marker changes. |
| Buy Max crossing milestones | One grouped polite announcement listing crossed milestones. |
| Offline return | Polite summary when shown; summary is dismissible and persistent until dismissed. |
| Endpoint completion | One polite announcement; persistent endpoint state required. |

## 9.3 Aggregation Rules

Passive resource updates may be aggregated only by:

- explicit player status request;
- focus entering the relevant resource or Assistant status region;
- Offline Summary presentation;
- a distinct milestone or endpoint event emitted by runtime.

The implementation must avoid repeated live-region messages for every production tick, timer update, small counter animation or rapid Manual Testing activation. The visible authoritative resource value continues to update without requiring each change to be announced.

---

# 10. Visual And Interaction Baseline

All components inherit VD-01's visual system:

- 8px layout grid;
- optional 4px micro grid inside components;
- restrained semantic colors;
- rounded outline icon style;
- calm productivity-tool motion;
- comfortable hit targets;
- visible focus;
- stable dimensions for counters, buttons and cards.

Component states should be visible through:

- surface elevation;
- border treatment;
- label;
- icon;
- state badge;
- helper text;
- progress change;
- restrained motion.

Avoid:

- aggressive clicker-style effects;
- casino-like purchase states;
- oversized decorative cards;
- Jira-like issue cards;
- admin-dashboard density;
- unexplained disabled controls;
- hover-only critical information.

---

# 11. Component Inventory

VD-02 defines the following component families.

| Component | Category | Primary Use |
| --- | --- | --- |
| `AppShell` | Workspace foundation | Outer product frame. |
| `WorkspaceSurface` | Workspace foundation | Main desk/work surface. |
| `WorkspaceHeader` | Header | Career identity and current goal. |
| `CareerStatus` | Header | Current role and next rank. |
| `ResourceCounter` | Resource | Bugs Found, Money and future resource displays. |
| `ManualActionControl` | Action | Manual Testing action. |
| `ReportBugsControl` | Action | Manual Report-all conversion. |
| `Button` | Primitive | Primary, secondary and destructive-free commands. |
| `BuyOneControl` | Purchase | Buy one Assistant level. |
| `BuyMaxControl` | Purchase | Buy maximum affordable Assistant levels. |
| `AssistantPanel` | Assistant | Middle QA Assistant area container. |
| `AssistantStatusHeader` | Assistant | Assistant level, cap and unlock state. |
| `ProductionRateDisplay` | Assistant | Passive Bugs/sec display. |
| `ProductionBreakdown` | Assistant | Manual Burst vs Passive Baseline source breakdown. |
| `UpgradeCard` | Upgrade | Junior one-time Basic Upgrades. |
| `AssistantLevelCard` | Upgrade | Repeatable capped Assistant level purchase. |
| `SupportUpgradeCard` | Upgrade | One-time Support Upgrade purchase. |
| `TeasedContent` | Unlock | Non-interactive teased content supplied by Unlock System. |
| `LockedContent` | Unlock | Locked visible content with explanation. |
| `PromotionProgressPanel` | Progress | Junior to Middle promotion goal. |
| `RequirementRow` | Progress | Requirement status line. |
| `ProgressBar` | Progress | Bounded progress visualization. |
| `MilestoneTrack` | Progress | Assistant level milestones. |
| `UnlockFeedback` | Feedback | Newly unlocked persistent feedback. |
| `PurchaseFeedback` | Feedback | Purchase and Buy Max feedback. |
| `OfflineReturnSummary` | Feedback | Compact offline Bugs Found summary. |
| `EndpointState` | Completion | Playable MVP endpoint display. |
| `Toast` | Feedback | Temporary contextual notification. |
| `Tooltip` | Help | Supplemental explanation. |
| `Modal` | Overlay | Promotions, major confirmations and non-ordinary flows. |
| `DiagnosticsSeparationBoundary` | Development boundary | Rules for debug-only diagnostics separation. |
| `EmptyState` | State | Empty available surfaces. |
| `LoadingState` | State | Calm loading/sync surfaces. |
| `ErrorState` | State | Recoverable error display. |

---

# 12. Component Specifications

Each component specification uses the following fields:

1. Component name.
2. Purpose.
3. Player-facing role.
4. Content anatomy.
5. Visual hierarchy.
6. Required data.
7. Interactive behavior.
8. Component states.
9. Before/after purchase preview.
10. Feedback behavior.
11. Responsive behavior.
12. Keyboard behavior.
13. Accessibility requirements.
14. Number-formatting behavior.
15. Motion hooks.
16. Implementation notes.
17. Prohibited usage.
18. Example content using QA Idle terminology.

## 12.1 AppShell

1. **Component name:** `AppShell`.
2. **Purpose:** Provides the outer product frame for QA Idle.
3. **Player-facing role:** Makes the game feel like one stable evolving workspace.
4. **Content anatomy:** background, safe content area and global feedback layer slot. Diagnostics are not mounted by the player shell; a separate development-only entry point may mount them outside the player UI tree.
5. **Visual hierarchy:** quiet outer background; workspace surface is dominant.
6. **Required data:** app title, current save/session status if displayed, global feedback queue.
7. **Interactive behavior:** no primary gameplay interaction.
8. **Component states:** visible; operation idle/loading/failed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** hosts toasts and contextual notifications without owning their content.
11. **Responsive behavior:** preserves centered workspace; exact placement belongs to VD-03.
12. **Keyboard behavior:** skip target or landmark should allow direct movement to primary workspace.
13. **Accessibility requirements:** semantic application/main landmarks.
14. **Number-formatting behavior:** not applicable.
15. **Motion hooks:** subtle global background transitions only when workspace state changes.
16. **Implementation notes:** should not contain gameplay selectors beyond global shell state.
17. **Prohibited usage:** do not place debug statistics in normal player frame.
18. **Example content:** QA Idle workspace shell around Junior QA or Middle QA workspace.

## 12.2 WorkspaceSurface

1. **Component name:** `WorkspaceSurface`.
2. **Purpose:** Provides the main visual desk/workspace surface.
3. **Player-facing role:** Communicates that the player's workspace is growing, not being replaced.
4. **Content anatomy:** surface container, section slots, optional workspace expansion state.
5. **Visual hierarchy:** largest player-facing surface below shell.
6. **Required data:** current career stage, workspace evolution state, unlocked surface list.
7. **Interactive behavior:** none by itself.
8. **Component states:** visible; Junior compact or Middle expanded variant; operation idle/loading/failed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** may receive unlock emphasis when Assistant area appears.
11. **Responsive behavior:** flexible inner content; final placement belongs to VD-03.
12. **Keyboard behavior:** contains logical focus order determined by composed children.
13. **Accessibility requirements:** region label that reflects current workspace stage.
14. **Number-formatting behavior:** not applicable.
15. **Motion hooks:** workspace expansion reveal; reduced motion uses instant but clear state change.
16. **Implementation notes:** do not decide Assistant layout placement here.
17. **Prohibited usage:** do not replace Junior workspace after Middle promotion.
18. **Example content:** "Junior QA Workspace" evolving into "Middle QA Workspace".

## 12.3 WorkspaceHeader

1. **Component name:** `WorkspaceHeader`.
2. **Purpose:** Introduces current role, current goal and high-level workspace status.
3. **Player-facing role:** Tells the player who they are and what they are working toward.
4. **Content anatomy:** product mark, role title, short description, current goal summary, optional save/status affordance.
5. **Visual hierarchy:** role title first, current goal second, metadata third.
6. **Required data:** current role, current phase label, next goal summary, completion state.
7. **Interactive behavior:** optional secondary controls only.
8. **Component states:** visible; applicable qualified progression state; newlyChanged feedback; operation failed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** updates persistent goal copy after promotion and endpoint changes.
11. **Responsive behavior:** compress supporting copy before role title.
12. **Keyboard behavior:** secondary controls follow title in focus order.
13. **Accessibility requirements:** page-level heading or equivalent.
14. **Number-formatting behavior:** embedded progress values use shared display values.
15. **Motion hooks:** calm copy/status transition on promotion or endpoint.
16. **Implementation notes:** do not expose debug version or simulator profile in player header.
17. **Prohibited usage:** do not use marketing hero copy or oversized landing-page treatment.
18. **Example content:** "Middle QA Workspace - Your Junior QA Assistant is helping find Bugs Found."

## 12.4 CareerStatus

1. **Component name:** `CareerStatus`.
2. **Purpose:** Shows current rank, next rank and career progress context.
3. **Player-facing role:** Reinforces career progression as primary reward.
4. **Content anatomy:** current rank, next rank, status label, optional progress summary.
5. **Visual hierarchy:** current rank and next rank are primary; status metadata is secondary.
6. **Required data:** current career stage, next career stage, promotion status, completion status.
7. **Interactive behavior:** may link focus to PromotionProgressPanel if implemented.
8. **Component states:** available; applicable qualified career/promotion progression supplied by runtime; newlyChanged feedback.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** updates persistently after promotion.
11. **Responsive behavior:** may collapse supporting description but not rank labels.
12. **Keyboard behavior:** if interactive, focus target must have clear name.
13. **Accessibility requirements:** announce career-stage changes once.
14. **Number-formatting behavior:** requirement counts use shared display values.
15. **Motion hooks:** promotion transition; reduced motion preserves status change.
16. **Implementation notes:** career values come from runtime career state.
17. **Prohibited usage:** do not imply future ranks are playable before unlock.
18. **Example content:** "Junior QA to Middle QA".

## 12.5 ResourceCounter

1. **Component name:** `ResourceCounter`.
2. **Purpose:** Displays a resource balance and relevant gain/source context.
3. **Player-facing role:** Helps players understand what they have and what resource loop they are in.
4. **Content anatomy:** icon, resource label, formatted value, source/rate/helper line, optional trend.
5. **Visual hierarchy:** value first, label second, helper/rate third.
6. **Required data:** resource id, display value, accessible value, resource role, optional rate/source.
7. **Interactive behavior:** optional inspect/help affordance.
8. **Component states:** visible; newlyChanged feedback; operation idle/loading/failed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** value may animate; passive changes are not announced every tick.
11. **Responsive behavior:** value remains readable; helper text collapses first.
12. **Keyboard behavior:** focusable only when it exposes detail/help.
13. **Accessibility requirements:** resource name and value must be announced together.
14. **Number-formatting behavior:** supports decimal-preserving raw value plus display-only formatted value.
15. **Motion hooks:** non-layout-shifting count transition.
16. **Implementation notes:** Bugs Found and Money use different icon, label and helper copy.
17. **Prohibited usage:** do not use color alone to distinguish Bugs Found from Money; do not show Money as passively generated.
18. **Example content:** "Bugs Found: 24.5, +1.8/sec from Junior QA Assistant" or "Money: $160, earned by reporting bugs".

## 12.6 ManualActionControl

1. **Component name:** `ManualActionControl`.
2. **Purpose:** Performs Manual Testing.
3. **Player-facing role:** Represents Manual Burst production.
4. **Content anatomy:** primary button, action label, current Bugs Found per action, optional short helper.
5. **Visual hierarchy:** button is dominant; gain per action is secondary.
6. **Required data:** stable action ID, runtime action eligibility, Bugs Found per action display, runtime-provided disabled reason if any.
7. **Interactive behavior:** one activation performs one Manual Testing action.
8. **Component states:** available; eligible/ineligible with derived disabled control condition; rest/focusVisible/pressed; operation idle/failed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** immediate resource feedback and polite action result announcement.
11. **Responsive behavior:** remains reachable at all supported widths.
12. **Keyboard behavior:** Space/Enter activates when available.
13. **Accessibility requirements:** accessible name includes action and produced resource.
14. **Number-formatting behavior:** per-action amount supplied as display value.
15. **Motion hooks:** button press and small resource pulse.
16. **Implementation notes:** no cooldowns from simulator cadence.
17. **Prohibited usage:** do not show it as passive or automated.
18. **Example content:** "Manual Testing +4 Bugs Found".

## 12.7 ReportBugsControl

1. **Component name:** `ReportBugsControl`.
2. **Purpose:** Converts all current Bugs Found into Money through manual Report.
3. **Player-facing role:** Teaches and preserves manual Report-all conversion.
4. **Content anatomy:** action button, Bugs Found available, Money preview, unavailable reason.
5. **Visual hierarchy:** report action first, conversion preview second.
6. **Required data:** current Bugs Found display, expected Money gain display, canReport, reasonUnavailable.
7. **Interactive behavior:** one activation reports all available Bugs Found.
8. **Component states:** available/unavailable; eligible/ineligible with derived disabled control condition; rest/focusVisible/pressed; operation idle/failed.
9. **Before/after purchase preview:** not purchase, but shows conversion preview.
10. **Feedback behavior:** polite summary of Bugs reported and Money gained.
11. **Responsive behavior:** preview must remain visible or accessible before action.
12. **Keyboard behavior:** Space/Enter activates when available.
13. **Accessibility requirements:** unavailable state explains zero Bugs Found or other reason.
14. **Number-formatting behavior:** conversion values supplied by runtime/domain selector.
15. **Motion hooks:** Bugs Found decreases and Money increases without layout shift.
16. **Implementation notes:** Report remains manual; no auto-reporting.
17. **Prohibited usage:** do not imply partial report, passive Money or automatic reporting.
18. **Example content:** "Report 18 Bugs Found -> earn $18".

## 12.8 Button

1. **Component name:** `Button`.
2. **Purpose:** Provides consistent command styling.
3. **Player-facing role:** Communicates available actions.
4. **Content anatomy:** label, optional icon, optional helper line for large action buttons.
5. **Visual hierarchy:** primary button may dominate local context; secondary buttons are quieter.
6. **Required data:** stable action ID, label, variant, runtime eligibility, accessible name, runtime-provided disabled/unavailable reason.
7. **Interactive behavior:** dispatches one command when available.
8. **Component states:** available/unavailable; eligible/ineligible with derived disabled control condition; rest/hover/focusVisible/pressed; operation idle/loading/failed.
9. **Before/after purchase preview:** not owned by primitive.
10. **Feedback behavior:** immediate press feedback; domain component handles result feedback.
11. **Responsive behavior:** label must not overflow; icon-only buttons require tooltip/label.
12. **Keyboard behavior:** Space/Enter activation.
13. **Accessibility requirements:** visible focus and accessible name.
14. **Number-formatting behavior:** not applicable unless label includes supplied display value.
15. **Motion hooks:** micro press/hover motion.
16. **Implementation notes:** use semantic button where possible; use `aria-disabled` pattern when explanation must be focusable.
17. **Prohibited usage:** do not create ordinary upgrade confirmation modals from Button.
18. **Example content:** "Find Bug", "Report Bugs", "Buy 1", "Buy Max".

## 12.9 BuyOneControl

1. **Component name:** `BuyOneControl`.
2. **Purpose:** Purchases one Assistant level.
3. **Player-facing role:** Provides precise repeatable level investment.
4. **Content anatomy:** button, next level cost, current-to-next level preview, production before/after.
5. **Visual hierarchy:** action label and price first; preview second.
6. **Required data:** purchase preview for one level, canCommit, reasonUnavailable.
7. **Interactive behavior:** commits exactly one level purchase when available.
8. **Component states:** available; affordable/unaffordable; eligible/ineligible; maxLevel; rest/focusVisible/pressed; operation idle/loading/succeeded/failed.
9. **Before/after purchase preview:** required; supplied by runtime/domain selectors.
10. **Feedback behavior:** purchase success, level update, crossed milestone if applicable.
11. **Responsive behavior:** never hide price or resulting level.
12. **Keyboard behavior:** Space/Enter activates when available; unavailable state exposes explanation.
13. **Accessibility requirements:** accessible name includes cost and resulting level.
14. **Number-formatting behavior:** price and production use display-only values.
15. **Motion hooks:** small level increment feedback.
16. **Implementation notes:** does not calculate next cost or production.
17. **Prohibited usage:** do not use for one-time Support Upgrades.
18. **Example content:** "Buy 1 - $200 - Level 0 -> 1".

## 12.10 BuyMaxControl

1. **Component name:** `BuyMaxControl`.
2. **Purpose:** Purchases the highest affordable contiguous range of Assistant levels.
3. **Player-facing role:** Offers efficient level investment while preserving consequence visibility.
4. **Content anatomy:** button, levels to buy, total price, current-to-resulting level, production before/after, crossed milestone list, endpoint impact.
5. **Visual hierarchy:** levels and total price first; resulting level and milestone impact second.
6. **Required data:** Buy Max Preview contract.
7. **Interactive behavior:** commits one grouped purchase action when `levelsToBuy > 0`.
8. **Component states:** available; affordable/unaffordable; eligible/ineligible; maxLevel; rest/focusVisible/pressed; operation idle/loading/succeeded/failed.
9. **Before/after purchase preview:** required for level and production.
10. **Feedback behavior:** grouped purchase feedback plus every crossed milestone.
11. **Responsive behavior:** crossed milestone and endpoint impact must remain visible or accessible before action.
12. **Keyboard behavior:** Space/Enter activates when available; explanation reachable when zero levels affordable.
13. **Accessibility requirements:** accessible summary includes levels bought, cost and crossed milestones.
14. **Number-formatting behavior:** all values supplied by runtime/domain selectors.
15. **Motion hooks:** grouped purchase flash; milestone markers update in order.
16. **Implementation notes:** component must not run Buy Max affordability loop.
17. **Prohibited usage:** do not hide milestone crossings; do not skip endpoint consequence.
18. **Example content:** "Buy Max - 3 levels for $690 - Level 5 -> 8 - crosses First Milestone".

## 12.11 AssistantPanel

1. **Component name:** `AssistantPanel`.
2. **Purpose:** Groups Assistant level, production and Support Upgrade components after Middle QA promotion.
3. **Player-facing role:** Communicates that the workspace gained support.
4. **Content anatomy:** header, status, production display, level purchase area, Support Upgrade area, milestone track.
5. **Visual hierarchy:** Assistant identity first, production and level second, optional supports third.
6. **Required data:** assistant unlocked state, level, cap, rate, support unlock states, milestone state.
7. **Interactive behavior:** delegates to child controls.
8. **Component states:** hidden/teased/visible; available when unlocked; applicable unlockCompleted or endpointCompleted state; newlyChanged unlock feedback. Teased presentation uses teaser metadata only and is not the active panel contract.
9. **Before/after purchase preview:** delegated to level/support cards.
10. **Feedback behavior:** persistent unlocked state after promotion.
11. **Responsive behavior:** may stack internal groups; VD-03 owns placement.
12. **Keyboard behavior:** focus order follows header, level controls, support cards.
13. **Accessibility requirements:** region label identifies Junior QA Assistant.
14. **Number-formatting behavior:** rate/value displays use shared display values.
15. **Motion hooks:** unlock reveal; reduced motion uses clear static reveal.
16. **Implementation notes:** one Assistant only in MVP.
17. **Prohibited usage:** do not present multiple workers or full Team management.
18. **Example content:** "Junior QA Assistant - Level 5 of 25".

## 12.12 AssistantStatusHeader

1. **Component name:** `AssistantStatusHeader`.
2. **Purpose:** Displays Assistant identity, level and cap.
3. **Player-facing role:** Helps players understand Assistant progression at a glance.
4. **Content anatomy:** Assistant name, level value, cap value, status badge.
5. **Visual hierarchy:** name and level are primary.
6. **Required data:** Assistant display name, current level, max level, unlock state, max state.
7. **Interactive behavior:** optional help tooltip.
8. **Component states:** locked/available; maxLevel or applicable qualified progression state; newlyChanged unlock feedback.
9. **Before/after purchase preview:** not directly; may summarize current level.
10. **Feedback behavior:** updates level and milestone state persistently.
11. **Responsive behavior:** level/cap remains visible.
12. **Keyboard behavior:** focusable only for tooltip/help.
13. **Accessibility requirements:** level and cap announced together.
14. **Number-formatting behavior:** level values are integer display values supplied by runtime.
15. **Motion hooks:** level-change emphasis.
16. **Implementation notes:** cap is supplied by runtime parameter contract.
17. **Prohibited usage:** do not imply uncapped progression.
18. **Example content:** "Junior QA Assistant - Level 8 / 25".

## 12.13 ProductionRateDisplay

1. **Component name:** `ProductionRateDisplay`.
2. **Purpose:** Shows current passive Bugs Found production rate.
3. **Player-facing role:** Communicates Passive Baseline progress.
4. **Content anatomy:** rate value, unit, source label, optional milestone/support marker.
5. **Visual hierarchy:** rate value first, source label second.
6. **Required data:** current rate display, accessible rate, source label, active modifiers summary.
7. **Interactive behavior:** optional inspect/help.
8. **Component states:** locked/available; milestoneReached; operation failed.
9. **Before/after purchase preview:** not directly; cards show preview.
10. **Feedback behavior:** rate changes persist after purchases/milestones.
11. **Responsive behavior:** rate remains visible; modifier detail may collapse.
12. **Keyboard behavior:** focusable only when exposing breakdown.
13. **Accessibility requirements:** passive tick changes not announced every tick.
14. **Number-formatting behavior:** decimal rate display supplied by runtime/domain selector.
15. **Motion hooks:** subtle rate-change transition.
16. **Implementation notes:** displays Bugs/sec only for Assistant passive production.
17. **Prohibited usage:** do not show Money/sec.
18. **Example content:** "+1.8 Bugs Found/sec from Junior QA Assistant".

## 12.14 ProductionBreakdown

1. **Component name:** `ProductionBreakdown`.
2. **Purpose:** Differentiates Manual Burst and Passive Baseline.
3. **Player-facing role:** Helps players understand active clicks versus idle support.
4. **Content anatomy:** source rows, current values, labels, optional proportions.
5. **Visual hierarchy:** source labels first, values second.
6. **Required data:** manual source display, passive source display, optional support/milestone contributions.
7. **Interactive behavior:** optional expand/collapse detail.
8. **Component states:** locked/available; operation idle/loading/failed.
9. **Before/after purchase preview:** may appear inside purchase preview, supplied by runtime.
10. **Feedback behavior:** persistent update after production-affecting purchases.
11. **Responsive behavior:** collapses to two concise rows before hiding.
12. **Keyboard behavior:** expand/collapse if interactive.
13. **Accessibility requirements:** source and value announced together.
14. **Number-formatting behavior:** all values are display-only projections.
15. **Motion hooks:** small row update transition.
16. **Implementation notes:** no formulas in component.
17. **Prohibited usage:** do not imply passive Report or passive Money.
18. **Example content:** "Manual Burst: +4 per action; Passive Baseline: +1.8/sec".

## 12.15 UpgradeCard

1. **Component name:** `UpgradeCard`.
2. **Purpose:** Displays a one-time Junior Basic Upgrade.
3. **Player-facing role:** Shows permanent Manual Testing or Report improvement.
4. **Content anatomy:** title, effect summary, description, price, state badge, purchase control.
5. **Visual hierarchy:** title and effect first; description and price second.
6. **Required data:** Shared Purchase Preview contract, stable upgrade ID, display name, effect display and runtime ownership.
7. **Interactive behavior:** one-time purchase when available and affordable.
8. **Component states:** available; unowned/owned; affordable/unaffordable when unowned and eligible; rest/focusVisible; operation idle/loading/succeeded/failed.
9. **Before/after purchase preview:** optional for Junior upgrades; recommended when effect clarity benefits.
10. **Feedback behavior:** purchase feedback and persistent owned badge.
11. **Responsive behavior:** title/effect/price remain visible; flavor copy may collapse.
12. **Keyboard behavior:** purchase control focusable; owned state not repurchasable.
13. **Accessibility requirements:** state and price announced.
14. **Number-formatting behavior:** price/effect supplied by runtime/domain selectors.
15. **Motion hooks:** owned transition.
16. **Implementation notes:** for one-time upgrades, not level purchases.
17. **Prohibited usage:** do not use for repeatable Assistant levels.
18. **Example content:** "Better Checklist - +1 Bug Found per Manual Testing action - Owned".

## 12.16 AssistantLevelCard

1. **Component name:** `AssistantLevelCard`.
2. **Purpose:** Hosts repeatable capped Assistant level purchase controls.
3. **Player-facing role:** Main Middle QA investment surface.
4. **Content anatomy:** level summary, production preview, Buy 1, Buy Max, milestone track.
5. **Visual hierarchy:** level and production first; purchase controls second; milestones third.
6. **Required data:** current level, max level, Buy 1 preview, Buy Max preview, milestone state, endpoint impact.
7. **Interactive behavior:** delegates to Buy 1 and Buy Max.
8. **Component states:** locked/available; affordable/unaffordable when eligible; maxLevel; milestoneReached; applicable endpointReady/endpointCompleted state; operation idle/loading/succeeded/failed.
9. **Before/after purchase preview:** required for level and production.
10. **Feedback behavior:** persistent level, milestone and endpoint progress updates.
11. **Responsive behavior:** Buy 1 and Buy Max can stack; previews remain visible.
12. **Keyboard behavior:** logical order: Buy 1 then Buy Max then milestone details.
13. **Accessibility requirements:** level, cap and next outcome announced.
14. **Number-formatting behavior:** values supplied by runtime/domain selectors.
15. **Motion hooks:** level increment, milestone marker emphasis.
16. **Implementation notes:** repeatable levels are separate from Support Upgrades.
17. **Prohibited usage:** do not expose internal formulas.
18. **Example content:** "Assistant Level 5 / 25 - next: +0.2 Bugs/sec".

## 12.17 SupportUpgradeCard

1. **Component name:** `SupportUpgradeCard`.
2. **Purpose:** Displays one optional one-time Assistant Support Upgrade.
3. **Player-facing role:** Presents meaningful Middle QA trade-offs without making supports mandatory.
4. **Content anatomy:** title, role label, effect summary, unlock/explanation text, price, owned badge, purchase control.
5. **Visual hierarchy:** title and role first; effect and price second; helper copy third.
6. **Required data:** Shared Purchase Preview contract, stable Support Upgrade ID, provisional display name, authoritative gameplay role, Unlock System state and runtime ownership.
7. **Interactive behavior:** one-time purchase when unlocked and affordable.
8. **Component states:** one visibility state: hidden, teased or visible. When visible, access is locked or available; ownership is unowned or owned; affordability applies only when available, unowned and eligible. NewlyChanged and failed feedback may overlay the visible state. Teased presentation is strictly non-interactive and receives only authorized teaser metadata, never the Visible Locked contract.
9. **Before/after purchase preview:** required; supplied by runtime/domain selectors.
10. **Feedback behavior:** purchase feedback plus persistent owned state.
11. **Responsive behavior:** title, role, price and effect remain visible.
12. **Keyboard behavior:** locked/unavailable explanation reachable.
13. **Accessibility requirements:** role and optional status announced; support not endpoint-required.
14. **Number-formatting behavior:** prices/effects supplied by runtime/domain selectors.
15. **Motion hooks:** newly unlocked and owned transitions.
16. **Implementation notes:** exactly three Support Upgrades exist in MVP content, but the card remains reusable.
17. **Prohibited usage:** do not add extra MVP supports; do not imply Support Upgrades are required for endpoint.
18. **Example content:** "Desk Setup Kit - Immediate Production Support - optional - $120".

MVP Support Upgrade content:

| Stable ID | Provisional example name | Gameplay role |
| --- | --- | --- |
| `support_immediate_production` | Desk Setup Kit | Immediate Production Support |
| `support_training_economics` | Mentoring Checklist | Long-Term Training Support |
| `support_offline_handover` | Handover Notes | Offline Handover Support |

Names are provisional examples. Stable IDs and gameplay roles are authoritative.

## 12.18 TeasedContent

1. **Component name:** `TeasedContent`.
2. **Purpose:** Shows non-interactive preview content when Unlock System explicitly supplies teased state.
3. **Player-facing role:** Signals future workspace growth without implying current playability.
4. **Content anatomy:** title, short hint, requirement or "later" label supplied by Unlock System.
5. **Visual hierarchy:** hint is quieter than available content.
6. **Required data:** explicit Teased state plus only the label, hint and limited teaser metadata authorized by the Unlock System for that state.
7. **Interactive behavior:** none.
8. **Component states:** teased only. A later runtime transition replaces this component with the distinct Visible Locked or Available presentation; states are never combined.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** none beyond the current teased display; transition feedback requires a distinct runtime unlock event.
11. **Responsive behavior:** may collapse before active gameplay content.
12. **Keyboard behavior:** not focusable unless it exposes help.
13. **Accessibility requirements:** must communicate "not available yet".
14. **Number-formatting behavior:** only supplied display values.
15. **Motion hooks:** minimal reveal only.
16. **Implementation notes:** cannot invent future features or unlock conditions.
17. **Prohibited usage:** do not combine teased and locked contracts; expose known locked requirements or actionable lock explanations; or tease Automation, full Team or future systems unless Unlock System explicitly supplies the exact teaser metadata.
18. **Example content:** "More workspace tools later" only if supplied by Unlock System.

## 12.19 LockedContent

1. **Component name:** `LockedContent`.
2. **Purpose:** Displays visible but inaccessible content with a clear reason.
3. **Player-facing role:** Explains what condition is missing.
4. **Content anatomy:** title, locked badge, requirement/explanation, unavailable action area.
5. **Visual hierarchy:** component identity first; missing condition second.
6. **Required data:** locked reason, requirements, unlock source.
7. **Interactive behavior:** no committed action; help/tooltip may be focusable.
8. **Component states:** visible + locked; ineligible with derived disabled control condition; rest/focusVisible; operation failed if an attempted action is rejected.
9. **Before/after purchase preview:** only if supplied and useful; must not imply purchase is possible.
10. **Feedback behavior:** persistent state changes when unlock occurs.
11. **Responsive behavior:** explanation must remain accessible.
12. **Keyboard behavior:** focusable explanation when native disabled controls would hide help.
13. **Accessibility requirements:** use `aria-disabled` or an explanation wrapper as appropriate and associate the runtime-provided reason persistently through `aria-describedby` or a framework-equivalent accessible description.
14. **Number-formatting behavior:** requirement values supplied by runtime.
15. **Motion hooks:** unlock transition to available state.
16. **Implementation notes:** distinguish locked from unaffordable.
17. **Prohibited usage:** do not hide why a visible component is unavailable.
18. **Example content:** "Unlocks at Assistant Level 5".

## 12.20 PromotionProgressPanel

1. **Component name:** `PromotionProgressPanel`.
2. **Purpose:** Shows progress toward Junior QA to Middle QA promotion.
3. **Player-facing role:** Gives the player a clear first career goal.
4. **Content anatomy:** current rank, next rank, requirement rows, progress summary, promote action when available.
5. **Visual hierarchy:** goal summary first; requirement rows second; action last when ready.
6. **Required data:** promotion id, requirements, availability, completion state.
7. **Interactive behavior:** may expose Promote action only when runtime says available.
8. **Component states:** locked/available; qualified promotion requirement or promotion completion state; newlyChanged feedback; rest/focusVisible.
9. **Before/after purchase preview:** not purchase; may show promotion outcome.
10. **Feedback behavior:** persistent requirement completion and promotion availability.
11. **Responsive behavior:** rows may stack; requirements remain readable.
12. **Keyboard behavior:** Promote action reachable when available.
13. **Accessibility requirements:** each requirement status announced as met/not met.
14. **Number-formatting behavior:** lifetime values supplied by runtime.
15. **Motion hooks:** requirement complete tick and promotion available emphasis.
16. **Implementation notes:** does not own requirement evaluation.
17. **Prohibited usage:** do not unlock Middle QA gameplay before promotion completion.
18. **Example content:** "Find 100 lifetime bugs, earn $150 lifetime money, buy 3 upgrades."

## 12.21 RequirementRow

1. **Component name:** `RequirementRow`.
2. **Purpose:** Displays one goal or requirement line.
3. **Player-facing role:** Makes progression requirements scannable.
4. **Content anatomy:** status icon, label, current/target value, optional explanation.
5. **Visual hierarchy:** status and label first; numbers second.
6. **Required data:** Shared Requirement Display contract.
7. **Interactive behavior:** optional tooltip/help.
8. **Component states:** pending/requirementCompleted; operation failed when display data cannot be resolved.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** persistent completion mark.
11. **Responsive behavior:** label wraps cleanly; numbers remain aligned.
12. **Keyboard behavior:** focusable only if help is available.
13. **Accessibility requirements:** status must not rely on color alone.
14. **Number-formatting behavior:** current/target values supplied by runtime.
15. **Motion hooks:** small completion transition.
16. **Implementation notes:** reusable for promotion, endpoint and unlock requirements.
17. **Prohibited usage:** do not use for debug assertions in player UI.
18. **Example content:** "Upgrades purchased: 2 of 3".

## 12.22 ProgressBar

1. **Component name:** `ProgressBar`.
2. **Purpose:** Displays bounded progress.
3. **Player-facing role:** Gives quick sense of goal completion.
4. **Content anatomy:** track, fill, label, current/target text.
5. **Visual hierarchy:** label and numeric progress remain available; bar is supporting.
6. **Required data:** current display, target display, normalized visual progress.
7. **Interactive behavior:** none.
8. **Component states:** pending/requirementCompleted; operation failed when display data cannot be resolved.
9. **Before/after purchase preview:** may show preview only if supplied by parent.
10. **Feedback behavior:** persistent fill change.
11. **Responsive behavior:** maintain minimum width or stack label above.
12. **Keyboard behavior:** not focusable unless inspectable.
13. **Accessibility requirements:** expose `progressbar` semantics where appropriate.
14. **Number-formatting behavior:** display-only values supplied by runtime.
15. **Motion hooks:** fill transition; reduced motion uses instant fill.
16. **Implementation notes:** avoid using progress bars for unbounded resources.
17. **Prohibited usage:** do not make bar color the only status cue.
18. **Example content:** "Assistant milestone: Level 5 of 8".

## 12.23 MilestoneTrack

1. **Component name:** `MilestoneTrack`.
2. **Purpose:** Shows Assistant level milestones.
3. **Player-facing role:** Separates milestone progress from promotion progress.
4. **Content anatomy:** level track, current level marker, milestone markers, reached state, reward/effect summary.
5. **Visual hierarchy:** current level and next milestone first.
6. **Required data:** current level, max level, ordered milestone display list, reached states, endpoint marker.
7. **Interactive behavior:** optional milestone tooltip.
8. **Component states:** pending/milestoneReached; endpointCompleted only when the runtime separately supplies it.
9. **Before/after purchase preview:** Buy Max may highlight crossed milestones using supplied data.
10. **Feedback behavior:** persistent reached marker plus feedback event.
11. **Responsive behavior:** can collapse to current/next milestone summary.
12. **Keyboard behavior:** milestone details focusable if tooltip exists.
13. **Accessibility requirements:** announce milestone reached once, not every render.
14. **Number-formatting behavior:** level values supplied by runtime.
15. **Motion hooks:** reached marker emphasis.
16. **Implementation notes:** first milestone level 8 and capstone level 25 are supplied by runtime/domain data.
17. **Prohibited usage:** do not use this track for promotion requirements.
18. **Example content:** "First Assistant Milestone at Level 8".

## 12.24 UnlockFeedback

1. **Component name:** `UnlockFeedback`.
2. **Purpose:** Provides contextual feedback when content unlocks.
3. **Player-facing role:** Helps the player notice new capability.
4. **Content anatomy:** title, short message, link/reference to unlocked component.
5. **Visual hierarchy:** event title first; explanation second.
6. **Required data:** Feedback Event Display contract and persistent target id.
7. **Interactive behavior:** optional focus target action.
8. **Component states:** newlyChanged feedback; feedbackVisible; overlay open/closing/dismissed.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** temporary feedback plus persistent component state.
11. **Responsive behavior:** compact and non-blocking.
12. **Keyboard behavior:** dismiss and focus target reachable if present.
13. **Accessibility requirements:** polite announcement once.
14. **Number-formatting behavior:** any values supplied by runtime.
15. **Motion hooks:** subtle appear/disappear.
16. **Implementation notes:** cannot be the only indication of unlock.
17. **Prohibited usage:** do not announce future systems that are not actually unlocked/teased by runtime.
18. **Example content:** "Junior QA Assistant unlocked."

## 12.25 PurchaseFeedback

1. **Component name:** `PurchaseFeedback`.
2. **Purpose:** Confirms successful purchases or failed purchase attempts.
3. **Player-facing role:** Reassures the player that investment was applied.
4. **Content anatomy:** purchase title, spent amount, gained effect, crossed milestones if any.
5. **Visual hierarchy:** purchase result first; effect second.
6. **Required data:** purchase event display, persistent target id, optional crossed milestones.
7. **Interactive behavior:** optional dismiss.
8. **Component states:** operation result succeeded/failed; feedbackVisible; overlay open/closing/dismissed. Success/error are event presentation, not persistent purchase state.
9. **Before/after purchase preview:** displays committed result, not speculative preview.
10. **Feedback behavior:** temporary confirmation plus persistent card state.
11. **Responsive behavior:** compact; do not obscure purchase controls.
12. **Keyboard behavior:** dismiss/focus target reachable if present.
13. **Accessibility requirements:** polite for success; assertive for user-triggered error when needed.
14. **Number-formatting behavior:** values supplied by runtime event.
15. **Motion hooks:** quick calm feedback.
16. **Implementation notes:** Buy Max feedback groups purchase and lists each crossed milestone.
17. **Prohibited usage:** do not use as only ownership/level indicator.
18. **Example content:** "Bought 3 Assistant levels. Reached First Milestone."

## 12.26 OfflineReturnSummary

1. **Component name:** `OfflineReturnSummary`.
2. **Purpose:** Summarizes offline Bugs Found gained after Assistant unlock.
3. **Player-facing role:** Shows what happened while away without blocking play.
4. **Content anatomy:** title, elapsed time summary, eligible time if shown, Bugs Found gained, dismiss action, optional Report reminder.
5. **Visual hierarchy:** Bugs Found gained first; time detail second.
6. **Required data:** stable runtime-provided offline summary/event-result ID, Bugs Found gained display, elapsed/eligible time display and dismiss state.
7. **Interactive behavior:** dismissible; may provide focus to Report Bugs but must not report automatically.
8. **Component states:** overlay open/closing/dismissed; operation failed only for a runtime-provided summary error.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** polite summary when shown; persistent until dismissed. The stable summary/event-result ID deduplicates presentation and announcement after rerender, restoration or remounting.
11. **Responsive behavior:** compact, non-blocking, stackable above/beside gameplay per VD-03.
12. **Keyboard behavior:** dismiss reachable; Report focus action reachable if present.
13. **Accessibility requirements:** announces Bugs Found only; no Money gain implication.
14. **Number-formatting behavior:** Bugs Found and time values supplied by runtime.
15. **Motion hooks:** soft entry; reduced motion static.
16. **Implementation notes:** offline progress produces Bugs Found only.
17. **Prohibited usage:** do not show Money gained; do not imply automatic Report.
18. **Example content:** "While away: +320 Bugs Found. Report bugs to earn Money."

## 12.27 EndpointState

1. **Component name:** `EndpointState`.
2. **Purpose:** Shows Playable Idle MVP endpoint completion.
3. **Player-facing role:** Provides a satisfying completion state for the implemented slice.
4. **Content anatomy:** completion title, satisfied conditions, next-play guidance, persistent state.
5. **Visual hierarchy:** completion message first; conditions second.
6. **Required data:** endpoint completion state, condition displays, post-milestone tick observed state.
7. **Interactive behavior:** no required purchase/action; optional continue playing.
8. **Component states:** pending, endpointReady, endpointCompleted.
9. **Before/after purchase preview:** Buy Max/level cards may show endpoint impact before commit.
10. **Feedback behavior:** memorable but calm feedback plus persistent completion.
11. **Responsive behavior:** visible without covering core workspace permanently.
12. **Keyboard behavior:** any actions reachable.
13. **Accessibility requirements:** announce completion once and preserve visible state.
14. **Number-formatting behavior:** values supplied by runtime.
15. **Motion hooks:** milestone-level completion motion; reduced motion simplified.
16. **Implementation notes:** endpoint requires runtime/domain state, not UI inference.
17. **Prohibited usage:** do not freeze balance or imply non-MVP systems are playable.
18. **Example content:** "Playable MVP endpoint reached. Runtime evaluation confirmed the Assistant milestone and all additional authoritative endpoint conditions, including the required post-milestone passive production tick." This is illustrative result copy, not an endpoint formula or UI evaluation rule.

## 12.28 Toast

1. **Component name:** `Toast`.
2. **Purpose:** Temporary contextual notification.
3. **Player-facing role:** Provides light confirmation or guidance.
4. **Content anatomy:** icon, title, message, optional action, dismiss.
5. **Visual hierarchy:** title first, message second.
6. **Required data:** Feedback Event Display contract.
7. **Interactive behavior:** optional action/dismiss.
8. **Component states:** feedbackVisible/feedbackHidden; overlay open/closing/dismissed; operation failed for error events.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** temporary only; persistent component state required elsewhere.
11. **Responsive behavior:** compact and non-blocking.
12. **Keyboard behavior:** reachable without trapping focus.
13. **Accessibility requirements:** announce according to event policy.
14. **Number-formatting behavior:** values supplied by event.
15. **Motion hooks:** short entry/exit.
16. **Implementation notes:** use sparingly.
17. **Prohibited usage:** never the only indication of unlock, milestone, purchase or error.
18. **Example content:** "Coffee purchased. Manual Testing improved."

## 12.29 Tooltip

1. **Component name:** `Tooltip`.
2. **Purpose:** Provides supplemental explanation.
3. **Player-facing role:** Clarifies unfamiliar icons, locked states or compact values.
4. **Content anatomy:** short title, one or two lines of explanation.
5. **Visual hierarchy:** explanation text only.
6. **Required data:** trigger label, tooltip text, relationship to trigger.
7. **Interactive behavior:** hover and focus reveal; content remains open while the pointer moves from the trigger into the tooltip.
8. **Component states:** overlay closed/open/closing/dismissed; interaction rest/hover/focusVisible.
9. **Before/after purchase preview:** not owner; may explain preview fields.
10. **Feedback behavior:** none.
11. **Responsive behavior:** must fit viewport; use alternative disclosure if needed.
12. **Keyboard behavior:** available on focus and dismissible with Escape without moving focus unexpectedly.
13. **Accessibility requirements:** hoverable, keyboard accessible, dismissible and persistent while trigger or tooltip is hovered/focused; never the only source of essential information.
14. **Number-formatting behavior:** may include display values supplied by runtime.
15. **Motion hooks:** instant or very short fade.
16. **Implementation notes:** helpful for icon-only controls or supplementary disabled explanations; essential disabled reasons also require persistent accessible-description association.
17. **Prohibited usage:** do not hide required purchase consequences only in tooltip.
18. **Example content:** "Buy Max purchases the highest affordable Assistant levels."

## 12.30 Modal

1. **Component name:** `Modal`.
2. **Purpose:** Handles explicit major confirmations or blocking messages.
3. **Player-facing role:** Reserves interruption for significant moments.
4. **Content anatomy:** title, body, primary action, secondary action, close if safe.
5. **Visual hierarchy:** decision title first, consequence second.
6. **Required data:** modal purpose, actions, consequence text.
7. **Interactive behavior:** traps focus while open; explicit close/confirm.
8. **Component states:** overlay closed/open/closing/dismissed; operation failed if confirmation cannot complete.
9. **Before/after purchase preview:** only for major non-ordinary flows if ever needed.
10. **Feedback behavior:** should not replace persistent state.
11. **Responsive behavior:** fits supported tablet/narrow desktop.
12. **Keyboard behavior:** focus trap, Escape behavior defined per modal type.
13. **Accessibility requirements:** proper dialog semantics and labelled title.
14. **Number-formatting behavior:** supplied values only.
15. **Motion hooks:** short calm entry; reduced motion static.
16. **Implementation notes:** Promotion System owns whether confirmation or acknowledgement is required. When runtime supplies that state, a modal may present it; VD-03 owns only presentation, placement, responsive behavior and visual composition.
17. **Prohibited usage:** do not introduce purchase confirmation modals for ordinary upgrades, Assistant levels or Support Upgrades.
18. **Example content:** "Accept Middle QA Promotion?" if the promotion flow uses confirmation.

## 12.31 DiagnosticsSeparationBoundary

1. **Boundary name:** `DiagnosticsSeparationBoundary`.
2. **Purpose:** Defines a formal build and data-flow boundary for development-only diagnostics; it does not require a player-facing component.
3. **Player-facing role:** None.
4. **Content anatomy:** development-only entry point, build/environment guard and diagnostics-only presenter outside the player UI tree.
5. **Visual hierarchy:** outside normal player hierarchy.
6. **Required data:** development-only environment/build eligibility and diagnostic payload available only behind the diagnostics entry point. Player-facing presenters must never receive this payload.
7. **Interactive behavior:** development-only controls if enabled.
8. **Boundary states:** absent/unmounted in player production builds; development-only mount when explicitly enabled.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** none for normal players.
11. **Responsive behavior:** must not affect player layout.
12. **Keyboard behavior:** never in the player UI tab order; development tools manage their own keyboard behavior.
13. **Accessibility requirements:** absent from the player accessibility tree because no diagnostics UI mounts in player production builds.
14. **Number-formatting behavior:** not player-facing.
15. **Motion hooks:** none.
16. **Implementation notes:** player production builds must not mount diagnostics UI. Diagnostics-only data stays behind development-only entry points, flags or bundles, must not flow into player presenters, and must not affect gameplay state or player-facing state resolution.
17. **Prohibited usage:** do not expose simulator gates, formula internals, debug tick state or parameter dumps in player surfaces.
18. **Example content:** "Development diagnostics: active candidate version" only in development-only boundary.

## 12.32 EmptyState

1. **Component name:** `EmptyState`.
2. **Purpose:** Shows an available surface with no current entries or actions.
3. **Player-facing role:** Prevents blank panels from feeling broken.
4. **Content anatomy:** short title, explanation, optional next action.
5. **Visual hierarchy:** explanation first; optional action second.
6. **Required data:** empty reason, optional action.
7. **Interactive behavior:** optional focus/action.
8. **Component states:** visible.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** none.
11. **Responsive behavior:** compact.
12. **Keyboard behavior:** optional action focusable.
13. **Accessibility requirements:** communicates empty state clearly.
14. **Number-formatting behavior:** not applicable unless supplied.
15. **Motion hooks:** none or subtle reveal.
16. **Implementation notes:** use for legitimate empty surfaces, not locked future systems.
17. **Prohibited usage:** do not use to tease unsupported systems.
18. **Example content:** "No offline summary right now."

## 12.33 LoadingState

1. **Component name:** `LoadingState`.
2. **Purpose:** Shows calm loading or restoration.
3. **Player-facing role:** Prevents layout jumps during initialization.
4. **Content anatomy:** skeleton or short loading label.
5. **Visual hierarchy:** quiet and temporary.
6. **Required data:** loading label, expected region.
7. **Interactive behavior:** none.
8. **Component states:** loading.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** replaced by loaded state.
11. **Responsive behavior:** preserves component dimensions where possible.
12. **Keyboard behavior:** avoid focus traps.
13. **Accessibility requirements:** announce important loading only once.
14. **Number-formatting behavior:** not applicable.
15. **Motion hooks:** subtle skeleton; respect reduced motion.
16. **Implementation notes:** stable dimensions for counters/cards.
17. **Prohibited usage:** do not use large distracting spinners.
18. **Example content:** "Restoring workspace..."

## 12.34 ErrorState

1. **Component name:** `ErrorState`.
2. **Purpose:** Shows recoverable component or action errors.
3. **Player-facing role:** Explains what went wrong without panic.
4. **Content anatomy:** error title, explanation, recovery action if available.
5. **Visual hierarchy:** explanation first; recovery action second.
6. **Required data:** error message, severity, recovery action.
7. **Interactive behavior:** retry or dismiss if available.
8. **Component states:** operation failed with feedbackVisible; overlay open/closing/dismissed when dismissible.
9. **Before/after purchase preview:** not applicable.
10. **Feedback behavior:** persistent until resolved; toast may supplement.
11. **Responsive behavior:** fits component bounds without overlap.
12. **Keyboard behavior:** recovery action reachable.
13. **Accessibility requirements:** assertive only for user-triggered blocking errors.
14. **Number-formatting behavior:** supplied values only.
15. **Motion hooks:** none or minimal.
16. **Implementation notes:** keep tone calm and specific.
17. **Prohibited usage:** do not hide errors in toast only.
18. **Example content:** "Not enough Money for this Assistant level."

---

# 13. Responsive Support Boundary

VD-02 defines component-level responsive behavior for:

- desktop;
- narrow desktop;
- tablet.

These are required Playable Idle MVP targets.

Mobile receives layout resilience only and is not a formally supported MVP target. Components should avoid catastrophic overflow on mobile-sized screens, but VD-02 does not require a complete mobile experience.

VD-03 owns:

- exact breakpoints;
- final workspace placement;
- panel order;
- column counts;
- scrolling regions;
- mobile fallback composition, if any.

Component-level requirements:

- primary actions remain reachable;
- resource values remain readable;
- purchase consequences remain visible or accessible before commitment;
- descriptions collapse before values, prices or state labels;
- controls do not overlap;
- hover-only information has focus/touch alternatives;
- stable dimensions prevent counter/button/card layout shift.

---

# 14. Motion And Feedback Rules

Motion follows VD-01 Calm Productivity.

Allowed:

- button press feedback;
- small counter transitions;
- purchase confirmation emphasis;
- unlock reveal;
- milestone marker emphasis;
- workspace expansion hooks;
- offline summary entry;
- endpoint completion motion.

Required:

- reduced-motion path for every non-essential animation;
- no layout shift from counter animation;
- no repetitive animation for passive production ticks;
- no screen shake or aggressive scaling;
- no particle-heavy reward loops.

Feedback must be persistent in component state after temporary animation/toast ends.

---

# 15. Prohibited MVP UI Patterns

VD-02 prohibits:

- auto-reporting controls;
- passive Money/sec displays;
- multiple Assistant units;
- full Team management UI;
- Automation UI;
- new currencies;
- ordinary purchase confirmation modals;
- formula/debug readouts in player UI;
- hidden purchase consequences;
- inaccessible disabled controls with no explanation;
- tooltip-only critical information;
- toast-only unlock, milestone, purchase or error communication;
- color-only resource or state distinctions;
- final page layout decisions that belong to VD-03.

---

# 16. Appendix A - Illustrative Component Data Shapes

This appendix is illustrative only. The framework-agnostic contracts in section 7 are authoritative. These examples must not become a second runtime source of truth.

```ts
type DisplayValue = {
  rawValue: unknown;
  formattedValue: string;
  accessibleValue?: string;
  unitLabel: string;
};

type PurchasePreview = {
  purchaseTargetId: string;
  actionId: string;
  price: DisplayValue;
  canAfford: boolean;
  canCommit: boolean;
  reasonUnavailable?: string;
  before?: DisplayValue;
  after?: DisplayValue;
  delta?: string;
  commitLabel: string;
  transactionResultId?: string;
};

type BuyMaxPreview = {
  purchaseTargetId: string;
  actionId: string;
  levelsToBuy: number;
  totalPrice: DisplayValue;
  currentLevel: number;
  resultingLevel: number;
  beforeProduction: DisplayValue;
  afterProduction: DisplayValue;
  crossedMilestones: Array<{
    id: string;
    label: string;
    effectSummary: string;
  }>;
  endpointProgressImpact?: string;
  canCommit: boolean;
  reasonUnavailable?: string;
  transactionResultId?: string;
};
```

---

# 17. Appendix B - Example MVP Copy

Example copy is illustrative and may be revised by content design.

| Context | Example |
| --- | --- |
| Manual action | "Manual Testing" |
| Manual action result | "+4 Bugs Found" |
| Report action | "Report Bugs" |
| Report preview | "Report 18 Bugs Found to earn $18" |
| Assistant identity | "Junior QA Assistant" |
| Passive rate | "+1.8 Bugs Found/sec" |
| Buy 1 | "Buy 1 level" |
| Buy Max | "Buy Max: 3 levels" |
| First milestone | "First Assistant Milestone" |
| Support role | "Immediate Production Support" |
| Offline summary | "While away: +320 Bugs Found" |
| Endpoint | "Playable MVP endpoint reached" |

---

# 18. Approval Checklist

VD-02 is ready for implementation when:

- all required component families are represented;
- component contracts are framework-agnostic;
- final layout decisions are deferred to VD-03;
- state precedence and legal combinations are defined;
- locked/unavailable controls have accessible explanations;
- passive production ticks are silent and aggregates follow the explicit request/focus/offline/event policy;
- persistent component state communicates unlocks, milestones, purchases and errors;
- Buy Max preview requirements include crossed milestones and endpoint impact;
- runtime/domain selectors own values, prices, rates, affordability and milestone crossings;
- resource formatting remains display-only;
- Bugs Found and Money are distinguishable without color alone;
- Offline Summary is compact, dismissible, non-blocking and Bugs Found only;
- ordinary purchase confirmation modals are prohibited;
- exactly three MVP Support Upgrade content entries are documented;
- diagnostics are development-only and separated from player UI.

---

# End of Document
