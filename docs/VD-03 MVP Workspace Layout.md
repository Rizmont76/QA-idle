# VD-03 - MVP Workspace Layout

## Document Status

**Project:** QA Idle

**Document Type:** Visual Design Documentation

**Owner Roles:**

- Lead Product Designer
- Senior Game UI/UX Designer
- Design System Architect
- Technical Product Director

**Status:** Frozen v1.0

**Phase:** Phase 8B

**Depends On:**

- `VD-01 UI Design System.txt`
- `VD-02 Component Library.md`
- `02-Core_Gameplay _Loop.md`
- `08-MVP_Vertical_Slice_Specification.md`
- `11-Resource_System.md`
- `12-Upgrade_System.md`
- `13-Unlock_System.md`
- `14-Promotion_System.md`
- `15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md`

---

# 1. Purpose

VD-03 defines the complete composition of the QA Idle Playable Idle MVP workspace.

This document owns:

- page composition;
- persistent workspace regions;
- component placement;
- visual hierarchy;
- responsive layout strategy;
- desktop, narrow desktop and tablet composition;
- scroll ownership;
- sticky behavior;
- panel expansion behavior;
- workspace evolution rules.

This document does not redefine components.

It composes the components defined by `VD-02 Component Library.md` according to the visual principles defined by `VD-01 UI Design System.txt`.

---

# 2. Scope

VD-03 covers the player-facing Playable Idle MVP workspace for:

- Junior QA manual workspace;
- Middle QA workspace after Junior QA Assistant unlock;
- resource placement;
- Manual Testing and Report Bugs placement;
- Manual Burst and Passive Baseline upgrade grouping;
- Assistant workspace placement;
- promotion progress placement;
- offline summary placement;
- Buy Max preview placement;
- responsive reflow;
- layout invariants for future visual documents.

VD-03 does not define:

- gameplay systems;
- runtime ownership;
- formulas;
- balance;
- component contracts;
- component internal anatomy;
- new resources;
- new Assistant types;
- multiple Assistants;
- Automation;
- Team management;
- auto-reporting;
- mobile-first layouts;
- production implementation code.

---

# 3. Authority Boundaries

| Area | Owner |
| --- | --- |
| Visual design language, grid, tokens, motion philosophy | `VD-01 UI Design System.txt` |
| Component anatomy, data contracts, component states | `VD-02 Component Library.md` |
| Active/passive loop | `02-Core_Gameplay _Loop.md` |
| MVP scope boundaries and acceptance | `08-MVP_Vertical_Slice_Specification.md` |
| Bugs Found and Money semantics | `11-Resource_System.md` |
| Upgrade groups, level caps, Buy Max behavior | `12-Upgrade_System.md` |
| Visibility, teaser and reveal lifecycle | `13-Unlock_System.md` |
| Promotion confirmation and outcome | `14-Promotion_System.md` |
| Candidate Assistant levels, Support Upgrade thresholds and offline cap | `15-Playable_Idle_MVP_Balance_and_Simulation_Spec.md` |
| Workspace composition and responsive placement | This document |

The UI must receive display-ready values, states, requirements and previews from the appropriate runtime/domain selectors. VD-03 must not become a second source of gameplay truth.

---

# 4. Workspace Composition Philosophy

The Playable Idle MVP workspace is a single evolving professional workspace.

It should always feel like:

```text
My workspace became more capable.
```

not:

```text
The game moved me to the next screen.
```

The Junior QA workspace is the foundation. Middle QA expands that foundation by adding the Junior QA Assistant and passive Bugs Found production around the original manual loop.

## 4.1 Workspace Growth Rule

Workspace expansion must consume previously unused workspace space before relocating existing primary regions.

Preferred order:

1. Preserve the existing workspace.
2. Expand into available space.
3. Relocate existing primary regions only when no reasonable alternative exists.

The player should perceive workspace growth rather than workspace rearrangement.

### Rationale

The manual Junior QA workspace is emotionally important. It represents the player's origin and must remain recognizable after promotion.

### Alternatives Considered

- Replace the Junior QA workspace with a Middle QA dashboard.
- Move Manual Testing into a secondary panel after Assistant unlock.
- Introduce a separate Middle QA screen.

These alternatives are rejected because they weaken workspace identity and make progression feel like navigation rather than growth.

### Trade-Offs

Preserving existing regions constrains layout flexibility, especially at narrow widths. This is acceptable because spatial memory is more valuable than maximal packing efficiency.

### Implementation Impact

The layout should be built from stable top-level regions that can accept new content without rewriting component contracts.

### Interaction With VD-01 And VD-02

This rule applies VD-01's workspace evolution principles and composes VD-02 components without changing their internal structure.

---

# 5. Workspace Evolution Diagram

The following diagram is illustrative only. It communicates expansion philosophy and does not define exact production layout, exact dimensions or final breakpoint behavior.

```text
Junior QA Workspace

+--------------------------------------------------+
| Header / Career / Resources                      |
+--------------------------------------------------+
| Primary Work Area                                |
| - Manual Testing                                 |
| - Report Bugs                                    |
+-------------------------+------------------------+
| Manual Burst Upgrades   | Promotion Progress     |
+-------------------------+------------------------+

        |
        | Middle QA promotion + Assistant unlock
        v

Middle QA Workspace After Assistant Unlock

+--------------------------------------------------+
| Header / Career / Resources                      |
+--------------------------------------------------+
| Primary Work Area                                |
| - Manual Testing                                 |
| - Report Bugs                                    |
+-------------------------+------------------------+
| Manual Burst Upgrades   | Promotion Progress     |
+-------------------------+------------------------+
| Assistant Workspace Expansion                    |
| - Junior QA Assistant                            |
| - Passive Bugs Found rate                        |
| - Assistant Levels / Buy Max                     |
| - Support Upgrades                               |
+--------------------------------------------------+
```

The important design principle is addition before replacement.

---

# 6. Primary Visual Hierarchy

The workspace should communicate the core loop in this order:

1. Current resources and career status.
2. Manual Testing.
3. Report Bugs.
4. Assistant passive production source after unlock.
5. Upgrade decisions.
6. Promotion and endpoint progress.
7. Secondary information and contextual feedback.

The player should immediately understand:

- what to click;
- where Bugs Found are;
- where Money is;
- where passive production comes from;
- where upgrades live;
- where progression lives.

## 6.1 Visual Weight Rule

Primary visual weight belongs to manual work.

Secondary visual weight belongs to the Assistant Workspace.

Tertiary visual weight belongs to progression and promotion.

Lowest visual weight belongs to informational and supporting UI.

Promotion should remain visible, but it must never visually compete with the primary gameplay loop during ordinary play.

### Rationale

Manual Testing and Report Bugs are the core player actions. The Assistant is the first passive support layer, not a replacement for player agency. Promotion is important, but it is a goal, not the ordinary interaction center.

### Alternatives Considered

- Promotion-first layout.
- Upgrade-first layout.
- Assistant-first layout after Middle QA.

These alternatives are rejected because they obscure the moment-to-moment loop.

### Trade-Offs

Promotion receives less emphasis during normal play. This is acceptable because promotion availability can still receive stronger feedback when it becomes actionable.

### Implementation Impact

Typography, spacing, surface area and placement should support the weight order without introducing new component variants.

### Interaction With VD-01 And VD-02

VD-01 defines hierarchy through layout, whitespace and typography. VD-02 defines the components that carry each gameplay role.

---

# 7. Persistent Workspace Regions

The MVP workspace uses the following persistent regions.

| Region | Purpose | Persistence |
| --- | --- | --- |
| Header / Status Band | Career identity and workspace context | Always visible |
| Resource Strip | Bugs Found and Money | Always visible |
| Primary Work Area | Manual Testing and Report Bugs | Always visible |
| Investment Area | Manual Burst upgrades and Passive Baseline upgrades | Visible according to unlock state |
| Progression Area | Promotion progress and endpoint state | Visible according to documented state |
| Assistant Workspace | Junior QA Assistant passive production and related purchases | Visible after unlock |
| Feedback Layer | Toasts, unlock feedback, purchase feedback, offline summary | Event-driven, non-authoritative |

New MVP content must attach to one of these regions. New top-level regions are prohibited unless a future approved visual document explicitly changes the layout model.

---

# 8. Desktop Layout Strategy

The primary desktop target is a desktop browser using a bounded workspace width consistent with VD-01 guidance.

Recommended desktop composition:

```text
Workspace
|
|-- Header / Status Band
|-- Resource Strip
|-- Main Workspace Grid
|   |-- Primary Work Area
|   |-- Investment / Progression Column
|-- Assistant Workspace Expansion
|-- Feedback Layer
```

The desktop layout should use available horizontal space without stretching content across the full display.

## 8.1 Desktop Region Behavior

The Primary Work Area should remain visually central.

The Investment Area may sit beside the Primary Work Area when width allows.

The Assistant Workspace should appear as an expansion connected to the existing workspace, either below the primary grid or adjacent to the investment area if sufficient width exists.

The Progression Area should remain visible but secondary.

### Rationale

Desktop space allows the player to scan actions, resources, upgrades and goals without excessive scrolling.

### Alternatives Considered

- Three equal columns.
- Full-width stacked cards.
- Separate assistant tab.

Three equal columns weaken visual priority. Full-width stacking wastes desktop space. A separate tab hides the first passive producer.

### Trade-Offs

The layout requires careful constraints, but it preserves both clarity and workspace growth.

### Implementation Impact

Use stable grid regions and tokenized spacing. Avoid layout-specific component variants.

### Interaction With VD-01 And VD-02

Uses VD-01's desktop-first grid philosophy and composes VD-02 panels in stable regions.

---

# 9. Narrow Desktop Adaptations

Narrow desktop should preserve the same mental model while reducing column pressure.

When horizontal space becomes limited:

1. Preserve Header / Status Band and Resource Strip.
2. Preserve Primary Work Area.
3. Stack secondary regions below the primary work loop.
4. Collapse descriptions before values, prices, state labels or controls.
5. Introduce vertical page scroll before hiding core gameplay.

## 9.1 Layout Priority Rule

If layout space becomes limited, preserve visibility in this order:

1. Resources
2. Manual Testing
3. Report Bugs
4. Assistant Workspace
5. Upgrade Groups
6. Promotion Progress
7. Secondary informational content

Future visual documents must preserve this priority.

### Rationale

The constrained-width hierarchy must protect the playable loop first. Resources, Manual Testing and Report Bugs are required to understand and act. The Assistant Workspace becomes the source of passive Bugs Found after unlock and therefore has higher priority than upgrade browsing.

### Alternatives Considered

- Preserve promotion above Assistant.
- Preserve upgrade groups above Assistant.
- Hide Report Bugs behind a compact action group.

These alternatives are rejected because they obscure the current resource conversion loop or the passive production source.

### Trade-Offs

Promotion may move lower on narrow desktop. This is acceptable as long as it remains visible and accessible.

### Implementation Impact

Responsive ordering must be explicit. DOM and focus order should remain logical after reflow.

### Interaction With VD-01 And VD-02

This applies VD-01 responsive priorities and VD-02 component-level responsive rules.

---

# 10. Tablet Adaptations

Tablet layouts should remain desktop-derived. They are not mobile-first layouts.

Recommended tablet composition:

```text
Header / Status Band
Resource Strip
Primary Work Area
Assistant Workspace
Investment Area
Progression Area
Feedback Layer
```

Tablet should favor a single-column or two-band layout with generous vertical spacing.

## 10.1 Tablet Rules

- Do not introduce mobile navigation patterns.
- Do not hide Manual Testing or Report Bugs behind menus.
- Do not create bottom-tab navigation for MVP.
- Ensure hover-only information has focus or touch alternatives.
- Keep tap targets comfortable.
- Preserve readable resource values.

### Rationale

Large tablets are a secondary support target. The experience should remain resilient without redefining the product around mobile constraints.

### Alternatives Considered

- Scaled-down desktop grid.
- Mobile-first bottom navigation.
- Collapsible accordion-only workspace.

These alternatives either create overflow, redefine navigation or hide too much context.

### Trade-Offs

Tablet uses more vertical scroll. This is acceptable because the priority order remains clear.

### Implementation Impact

Panel widths, spacing and focus order must be tested at tablet sizes.

### Interaction With VD-01 And VD-02

VD-01 defines desktop-first responsiveness; VD-02 requires component resilience across tablet.

---

# 11. Scroll Ownership

The page workspace owns vertical scrolling.

Individual panels should not introduce independent scroll containers in the Playable Idle MVP unless a future approved document adds a dense management surface that requires it.

## 11.1 Scroll Rules

- The main workspace scrolls vertically as one page.
- Resource and status visibility may be preserved through sticky behavior.
- Upgrade groups should expand naturally rather than scroll internally.
- Assistant Workspace should expand naturally rather than scroll internally.
- Feedback overlays must not create permanent layout traps.

### Rationale

Nested scrolling harms scanning, keyboard navigation and tablet usability.

### Alternatives Considered

- Scrollable upgrade shop.
- Scrollable Assistant panel.
- Scrollable right column.

These alternatives are premature for MVP information density.

### Trade-Offs

The page may become taller after Assistant unlock. This supports the feeling of a growing workspace.

### Implementation Impact

Use stable section spacing and avoid fixed-height panels for core gameplay.

### Interaction With VD-01 And VD-02

VD-01 prioritizes visual stability; VD-02 requires non-overlapping responsive components.

---

# 12. Sticky Behavior

Only the Header / Status Band and Resource Strip may use sticky behavior in the Playable Idle MVP.

Sticky behavior should preserve awareness of career stage, Bugs Found and Money without covering content.

## 12.1 Sticky Rules

- Sticky regions must remain compact.
- Sticky regions must not obscure focus indicators.
- Sticky regions must not cover feedback overlays.
- Upgrade groups should not be sticky.
- Assistant Workspace should not be sticky.
- Promotion Progress should not be sticky during ordinary play.

### Rationale

Bugs Found and Money are constantly relevant. Sticky upgrades or promotion cards would shift emphasis away from the primary loop.

### Alternatives Considered

- Sticky purchase column.
- Sticky promotion panel.
- Sticky primary action.

These alternatives overemphasize secondary choices or create excessive visual persistence.

### Trade-Offs

Some controls require scrolling on tablet or narrow desktop, but the player keeps resource awareness.

### Implementation Impact

Sticky offsets should be tokenized and tested across reduced viewport heights.

### Interaction With VD-01 And VD-02

Supports VD-01 stable resources and VD-02 accessible state requirements.

---

# 13. Resource Placement

Bugs Found and Money live together in the Resource Strip near the top of the workspace.

The Resource Strip must make clear:

- Bugs Found is the production resource.
- Money is the investment resource.
- Bugs Found can be produced by Manual Testing and, after unlock, Assistant passive/offline production.
- Money is produced only by manual Report Bugs.

## 13.1 Resource Placement Rules

- Bugs Found and Money should remain globally visible.
- The two resources must be visually distinct through label, icon, grouping and copy, not color alone.
- Local panels may show previews, but the authoritative balances remain in the Resource Strip.
- Offline Summary must add Bugs Found only and must not imply Money gain.

### Rationale

The resource conversion loop is the clearest way to understand QA Idle.

### Alternatives Considered

- Place Bugs Found beside Manual Testing and Money beside upgrades.
- Put resources inside the header only.

These alternatives weaken global scanning or crowd career identity.

### Trade-Offs

Local panels may need secondary previews, but the player always has one stable balance location.

### Implementation Impact

Use VD-02 `ResourceCounter` components fed by Resource System display projections.

### Interaction With VD-01 And VD-02

Follows VD-01 stable resource placement and VD-02 resource counter rules.

---

# 14. Manual Interaction Area

Manual Testing and Report Bugs belong in the Primary Work Area.

They remain visible before and after Middle QA promotion.

## 14.1 Manual Interaction Rules

- Manual Testing is the primary action.
- Report Bugs is the primary conversion action.
- Report Bugs should remain close enough to Manual Testing and Bugs Found to explain the conversion loop.
- Report Bugs must not be replaced by auto-reporting.
- Disabled or unavailable states must explain why the action cannot currently commit.

### Rationale

Manual work is the player's origin and the ordinary interaction center.

### Alternatives Considered

- Move Manual Testing into a legacy panel after promotion.
- Move Report Bugs into Assistant or offline summary.
- Collapse both actions into a single combined control.

These alternatives weaken the manual loop or imply automation.

### Trade-Offs

Middle QA retains early-game actions, but this continuity is part of the workspace identity.

### Implementation Impact

Use VD-02 `ManualActionControl` and `ReportBugsControl` without changing their contracts.

### Interaction With VD-01 And VD-02

Supports VD-01 stable primary action and VD-02 action components.

---

# 15. Assistant Workspace

The Junior QA Assistant appears as a new workspace region after Middle QA promotion and Assistant unlock.

The Assistant Workspace should feel like support added to the player's desk, not a full Team management system.

## 15.1 Assistant Workspace Contents

The Assistant Workspace may contain:

- Assistant identity;
- passive Bugs Found production rate;
- production breakdown;
- Assistant level display;
- Assistant level purchase controls;
- Buy Max preview;
- milestone indicators;
- exactly three optional Support Upgrades when visible according to unlock state.

## 15.2 Assistant Workspace Rules

- Show one persistent Junior QA Assistant.
- Do not imply multiple Assistants.
- Do not introduce roster, hiring, assignment or team management UI.
- Do not imply Automation.
- Do not imply passive Money generation.
- Preserve Manual Testing and Report Bugs as visible primary actions.

### Rationale

The Assistant is the first passive producer and must explain where passive Bugs Found comes from.

### Alternatives Considered

- Full Team panel.
- Employee list.
- Assistant hidden inside upgrades.

These alternatives either reopen future systems or hide the passive source.

### Trade-Offs

The Assistant Workspace consumes meaningful space, but it carries essential comprehension.

### Implementation Impact

Compose VD-02 Assistant components in this region using runtime-supplied display data.

### Interaction With VD-01 And VD-02

Applies VD-01 workspace expansion and VD-02 Assistant component contracts.

---

# 16. Upgrade Grouping

Upgrade placement must separate Manual Burst investments from Passive Baseline investments.

## 16.1 Upgrade Groups

Manual Burst group:

- existing manual/basic upgrades;
- reporting-related manual conversion upgrades where applicable to the accepted slice.

Passive Baseline group:

- Assistant level upgrades;
- Assistant Support Upgrades;
- Assistant-related milestone indicators.

## 16.2 Upgrade Group Rules

- Do not merge all upgrades into one undifferentiated shop.
- Do not sort purely by affordability if that obscures investment meaning.
- Owned and max-level states may be visually distinct according to VD-02.
- Support Upgrades must remain visibly distinct from repeatable Assistant levels.

### Rationale

Middle QA decision-making depends on understanding Manual Burst versus Passive Baseline investments.

### Alternatives Considered

- Single sorted upgrade list.
- Assistant levels mixed with Support Upgrades.
- Separate screen for Assistant purchases.

These alternatives reduce decision clarity or fragment the workspace.

### Trade-Offs

Grouping uses extra vertical space but creates better scanability.

### Implementation Impact

Use upgrade grouping metadata from the Upgrade System. Do not hardcode gameplay meaning in layout code.

### Interaction With VD-01 And VD-02

VD-02 requires the grouping distinction; VD-03 defines where the groups appear.

---

# 17. Promotion Placement

Promotion Progress belongs in the Progression Area.

It should be visible from New Game as a next-goal surface and remain visible through the MVP progression flow.

## 17.1 Promotion Placement Rules

- Promotion Progress should not visually compete with Manual Testing during ordinary play.
- Promotion availability may receive significant feedback when requirements are met.
- Promote action visibility and availability must come from Promotion and Unlock systems.
- Promotion Progress may move lower than Assistant and upgrades at constrained widths according to the layout priority rule.

### Rationale

Promotion is a structural goal. It should guide without overpowering the current loop.

### Alternatives Considered

- Promotion in the header only.
- Promotion hidden until available.
- Promotion as the main center panel.

These alternatives either reduce clarity or overemphasize long-term progression.

### Trade-Offs

Promotion is less dominant in ordinary play but remains persistent.

### Implementation Impact

Use VD-02 `PromotionProgressPanel`, `RequirementRow` and `ProgressBar` with Promotion Service data.

### Interaction With VD-01 And VD-02

Supports VD-01 career progression visibility and VD-02 promotion component contracts.

---

# 18. Offline Summary Placement

Offline Summary appears only after offline progress is relevant and runtime supplies an offline summary event.

It should appear near the Resource Strip or Primary Work Area as a compact, dismissible, non-blocking summary.

## 18.1 Offline Summary Rules

- Show Bugs Found gained while away.
- Do not show Money gained.
- Do not imply automatic Report.
- Optional action may focus or guide the player toward Report Bugs.
- Summary must persist until dismissed for that event instance.
- Toast alone is insufficient.

### Rationale

Offline progress contributes to Bugs Found only. The player still needs to manually Report Bugs to earn Money.

### Alternatives Considered

- Blocking return modal.
- Toast-only summary.
- Summary inside Assistant panel only.

Blocking modal interrupts ordinary play. Toast-only feedback is not persistent enough. Assistant-only placement may hide the conversion reminder.

### Trade-Offs

The summary briefly consumes important top-level space, but it teaches the correct resource flow.

### Implementation Impact

Use VD-02 `OfflineReturnSummary` with stable runtime event IDs and dismiss state.

### Interaction With VD-01 And VD-02

Follows VD-01 calm feedback and VD-02 offline summary contract.

---

# 19. Buy Max Preview Placement

Buy Max preview belongs inside the Assistant level purchase area.

It must appear adjacent to Assistant level purchasing so the player understands exactly what will change.

## 19.1 Buy Max Preview Rules

- Show levels to buy.
- Show total price.
- Show current and resulting Assistant level.
- Show before and after production.
- Show crossed milestones in order.
- Show endpoint impact when runtime supplies it.
- Do not hide milestone rewards or feedback.
- Do not place Buy Max as a global workspace action.

### Rationale

Buy Max is an Assistant level purchase action. Its consequences are local to Assistant progression and must be previewed before commit.

### Alternatives Considered

- Global Buy Max button.
- Tooltip-only preview.
- Purchase confirmation modal.

Global placement is ambiguous. Tooltip-only preview hides consequences. Ordinary purchase confirmation modals are prohibited by VD-02.

### Trade-Offs

The Assistant level card becomes denser, but milestone clarity is mandatory.

### Implementation Impact

Use VD-02 `BuyMaxControl` and `BuyMaxPreview` data supplied by runtime/domain selectors.

### Interaction With VD-01 And VD-02

Applies VD-02 Buy Max contract while maintaining VD-01 clarity before decoration.

---

# 20. Empty-State Philosophy

Empty states communicate legitimate absence inside already available surfaces.

They must not tease unsupported systems.

## 20.1 Empty-State Rules

- Use empty states for legitimate empty surfaces, such as no offline summary.
- Do not use empty states to hint at Team management, Automation, Reputation, Contracts, Statistics or future systems.
- Do not show blank panels that feel broken.
- Do not show future resource placeholders.

### Rationale

The MVP workspace should feel intentionally focused, not incomplete.

### Alternatives Considered

- Future-system placeholders.
- Locked panels for upcoming systems.
- Empty dashboard zones.

These alternatives leak future scope and reduce polish.

### Trade-Offs

The early workspace may look simpler. This is correct for Junior QA.

### Implementation Impact

Use VD-02 `EmptyState` only for visible, supported surfaces.

### Interaction With VD-01 And VD-02

Protects VD-01 visual noise budget and VD-02 empty-state prohibitions.

---

# 21. Unlock Reveal Philosophy

Unlocks should reveal content through workspace expansion.

The Assistant unlock should add a visible workspace region while preserving the original manual workspace.

## 21.1 Reveal Rules

- Hidden content is absent.
- Teased content may show only approved teaser metadata.
- Visible locked content may show only known requirements.
- Newly unlocked content appears in the region where it will continue to live.
- Unlock feedback must be supported by persistent component state after temporary feedback ends.

### Rationale

The UI itself is part of progression. Reveals should show that the player's responsibilities grew.

### Alternatives Considered

- Full-screen Assistant introduction.
- Separate unlock screen.
- Toast-only unlock.

These alternatives either interrupt the loop or fail to persist the change.

### Trade-Offs

In-place reveal is subtler, but it preserves continuity.

### Implementation Impact

Layout should support adding Assistant Workspace without large unexpected shifts to resources or primary actions.

### Interaction With VD-01 And VD-02

Combines VD-01 layout motion philosophy with VD-02 unlock feedback requirements.

---

# 22. Workspace Expansion Rules

Workspace expansion during the Playable Idle MVP follows this order:

1. Junior QA manual workspace exists.
2. Promotion progress guides the player toward Middle QA.
3. Promotion becomes available and is explicitly confirmed.
4. Junior QA Assistant Workspace appears.
5. Assistant passive Bugs Found production becomes visible.
6. Assistant level purchases become available.
7. Support Upgrades reveal in staged order according to runtime unlock state.
8. First producer milestone and endpoint state appear through persistent components.

## 22.1 Expansion Invariants

- Preserve original Manual Testing placement whenever possible.
- Preserve Report Bugs placement whenever possible.
- Preserve Resource Strip placement.
- Add Assistant Workspace before relocating primary regions.
- Relocate primary regions only when constrained widths require it.
- Never introduce multiple Assistant surfaces for MVP.

### Rationale

The player should understand that Middle QA adds support to the existing loop.

### Alternatives Considered

- Reveal all Middle QA content immediately.
- Replace the Junior layout after promotion.
- Move manual work below Assistant.

These alternatives reduce continuity or overwhelm the player.

### Trade-Offs

Staged layout growth requires careful unlock-state composition.

### Implementation Impact

Visibility and ordering should be driven by Unlock System state and runtime display data.

### Interaction With VD-01 And VD-02

Supports VD-01 add-before-replace philosophy and VD-02 visibility/access states.

---

# 23. Information Density

Information density should grow gradually.

Junior QA should feel simple, direct and airy.

Middle QA may introduce moderate density through Assistant and upgrade grouping, but the workspace must remain calm, readable and productivity-oriented.

## 23.1 Density Rules

- Use spacing to group related content before relying on borders.
- Keep primary actions visually clear.
- Collapse helper descriptions before values or controls.
- Avoid dashboard-like metric clutter.
- Avoid decorative panels that do not support gameplay comprehension.
- Keep progression readable but tertiary in visual weight.

### Rationale

The MVP is the first idle expansion. It should teach passive production without making the game feel like enterprise software.

### Alternatives Considered

- High-density dashboard.
- Marketing-style hero layout.
- Card-heavy decorative workspace.

These alternatives conflict with calm productivity and playable clarity.

### Trade-Offs

Some advanced detail remains secondary or hidden behind accessible disclosure.

### Implementation Impact

Use stable dimensions and responsive constraints to prevent layout shift.

### Interaction With VD-01 And VD-02

Applies VD-01 visual noise budget and VD-02 responsive component rules.

---

# 24. Accessibility Implications

The workspace must remain accessible across desktop, narrow desktop and tablet.

## 24.1 Focus Order

Recommended focus order:

1. Header / Status Band
2. Resource Strip
3. Manual Testing
4. Report Bugs
5. Assistant Workspace after unlock
6. Upgrade Groups
7. Promotion Progress
8. Feedback actions

This focus order should remain logical after responsive reflow.

## 24.2 Accessibility Rules

- Important information must not rely on color alone.
- Disabled, locked or unavailable controls must expose explanations according to VD-02.
- Sticky regions must not obscure focused elements.
- Feedback must not be the only indication of persistent state.
- Passive production ticks should not create repetitive live-region announcements.
- Offline Summary should announce Bugs Found gained without implying Money gain.
- Reduced-motion preferences must be respected for layout reveals.

### Rationale

The layout priority and focus priority should teach the same mental model.

### Alternatives Considered

- DOM order by implementation convenience.
- Visual order diverging from keyboard order.

These alternatives create confusion and should be avoided.

### Trade-Offs

Responsive implementation requires explicit ordering, but it protects usability.

### Implementation Impact

Layout containers should not trap focus, and reflow should not create illogical keyboard jumps.

### Interaction With VD-01 And VD-02

Extends VD-01 accessibility principles and VD-02 component accessibility contracts.

---

# 25. Layout Invariants

Future visual documents must preserve the following invariants unless an approved design-system revision explicitly changes them.

## 25.1 Core Invariants

- Resources remain globally stable and easy to find.
- Bugs Found and Money remain visually distinct without relying on color alone.
- Manual Testing remains a primary visible action.
- Report Bugs remains a primary visible manual conversion action.
- The original Junior QA workspace identity remains recognizable after Middle QA promotion.
- Workspace growth uses addition before replacement.
- Available unused workspace space is consumed before primary regions relocate.
- Assistant Workspace represents one persistent Junior QA Assistant only.
- Assistant passive production produces Bugs Found only.
- Offline Summary communicates Bugs Found only.
- Upgrade Groups preserve Manual Burst versus Passive Baseline distinction.
- Buy Max preview never hides crossed milestones.
- Promotion Progress remains visible but does not visually compete with the primary gameplay loop during ordinary play.
- Unsupported future systems remain hidden unless teased by approved Unlock System metadata.

## 25.2 Responsive Invariants

When constrained, preserve visibility in this order:

1. Resources
2. Manual Testing
3. Report Bugs
4. Assistant Workspace
5. Upgrade Groups
6. Promotion Progress
7. Secondary informational content

This priority is mandatory for future visual documents.

---

# 26. Decisions Deferred To Later Visual Documents

## 26.1 VD-04

VD-04 should own detailed visual treatment for workspace evolution moments, including:

- unlock reveal emphasis;
- promotion ceremony presentation;
- milestone presentation intensity;
- workspace object styling;
- non-layout motion specifics;
- richer visual storytelling for career-stage transitions.

VD-04 must not change VD-03 layout invariants without an approved revision.

## 26.2 VD-05

VD-05 should own production handoff detail if needed, including:

- exact breakpoint tables;
- annotated layout measurements;
- final responsive diagrams;
- visual QA checklist;
- implementation acceptance screenshots;
- detailed spacing specs for production layouts.

VD-05 must not reopen gameplay scope, component contracts or the workspace growth model.

---

# 27. Prohibited Patterns

VD-03 prohibits the following MVP workspace patterns:

- replacing the Junior QA workspace after promotion;
- presenting Middle QA as a separate screen;
- full Team management layout;
- employee roster or assignment UI;
- Automation controls;
- auto-reporting controls;
- passive Money/sec display;
- new currencies;
- multiple Assistant types;
- multiple Assistant units;
- mobile-first navigation;
- future-system placeholder panels;
- upgrade-only placement for Assistant production;
- tooltip-only Buy Max consequences;
- toast-only unlock, purchase, milestone, offline or error communication;
- sticky upgrade shop;
- sticky promotion panel during ordinary play;
- nested scroll panels for core MVP content.

---

# 28. Approval Checklist

VD-03 is ready for implementation when:

- the workspace composes VD-02 components without redefining them;
- VD-01 visual language, grid and workspace philosophy are preserved;
- Manual Testing remains the primary visual action;
- Report Bugs remains visible and manual;
- Bugs Found and Money remain globally stable;
- Assistant Workspace is an expansion, not a replacement;
- one persistent Junior QA Assistant is communicated;
- Manual Burst and Passive Baseline upgrades are grouped separately;
- Promotion Progress is visible but tertiary during ordinary play;
- Offline Summary is compact, dismissible, non-blocking and Bugs Found only;
- Buy Max preview is placed inside Assistant level purchasing and shows crossed milestones;
- page scroll owns MVP vertical overflow;
- sticky behavior is limited to status/resources;
- desktop, narrow desktop and tablet layout strategy are defined;
- constrained-width visibility priority is preserved;
- workspace expansion consumes unused space before relocating primary regions;
- future visual documents inherit the layout invariants.

---

# End of Document
