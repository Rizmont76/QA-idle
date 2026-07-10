# 10 - Economy Framework

## Document Status

**Project:** QA Idle

**Document Type:** Economy Framework

**Owner Role:** Senior Economy Designer / Senior Systems Designer / Lead Technical Game Designer

**Status:** Frozen v1.0

**Depends On:**

- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08-MVP_Vertical_Slice_Specification.md
- 09 - Modifier System.md

This document defines the architectural foundation of the economy used throughout QA Idle.

It establishes how resources flow through the game, how investments create long-term progression, how economic scaling should work, and how future gameplay systems participate in one unified economy.

This document intentionally does **not** define:

- prices;
- production rates;
- formulas;
- balancing values;
- progression numbers;
- upgrade costs;
- reward amounts.

Those belong to future balancing and content documents.

The purpose of this document is to establish the economic architecture that every future gameplay system must follow.

---

# Designer Notes

The following proposals are **approved architectural decisions** that should guide future economy design.

---

# DN-01 — Economic Domains

## Decision

The economy should evolve through multiple economic domains rather than one infinitely expanding economy.

Example:

```text
Personal Economy
        ↓
Department Economy
        ↓
Company Economy
        ↓
Industry Economy
        ↓
Planetary Economy
```

Each domain introduces new responsibilities, new investment opportunities and new decision-making.

Resources should normally remain within their own economic domain.

Cross-domain conversions should be intentional and relatively rare.

### Benefits

- Supports Career progression naturally.
- Prevents uncontrolled inflation.
- Makes promotions feel transformational.
- Scales cleanly into late-game systems.

---

# DN-02 — Opportunity Cost Visibility

## Decision

Whenever possible, important economic decisions should communicate both their benefits and their opportunity costs.

The player should understand not only what an investment provides, but also what alternative progress is being delayed.

Example:

```text
Purchased:
Advanced QA Tool

Delayed:
Next Promotion
```

The economy should encourage strategic planning instead of impulsive spending.

### Benefits

- Encourages thoughtful decision-making.
- Reinforces long-term planning.
- Makes investments feel meaningful.
- Strengthens player agency.

---

# DN-03 — Independent Economic Loops

## Decision

Every major gameplay system should eventually become a partially self-contained economic loop.

Example:

```text
Manual Testing
        ↓
Bugs
        ↓
Money
        ↓
Manual Upgrades
```

Later:

```text
Automation
        ↓
Passive Bugs
        ↓
Money
        ↓
Automation Upgrades
```

Each loop contributes to the overall economy while maintaining its own meaningful investment decisions.

### Benefits

- Highly modular architecture.
- Easier future expansion.
- Supports scalable balancing.
- Fits the Game Systems architecture.

---

# DN-04 — Resource Lifetime Classification

## Decision

Every newly introduced resource should belong to a predefined lifetime category.

Possible categories include:

- Disposable
- Investment
- Progression
- Prestige
- Temporary

The category defines the intended long-term role of the resource inside the economy.

Future design documents should classify every new resource before defining its gameplay behavior.

### Benefits

- Prevents unnecessary resources.
- Improves long-term consistency.
- Simplifies future balancing.
- Creates predictable economic architecture.

### Category Definitions

Every resource must declare exactly one primary lifetime category.

The category defines default technical behavior for save/load, spending, accumulation, expiration and prestige reset handling.

Feature documents may override a default only when the override is explicitly documented in that resource's definition.

| Category | Purpose | Saved? | Spendable? | Accumulates? | Expires? | Default Prestige Behavior |
|----------|---------|--------|------------|--------------|----------|---------------------------|
| Disposable | Short-term resource produced and consumed inside the current gameplay loop. | Yes, if it can exist between sessions. | Usually yes. | Usually limited by normal gameplay flow. | No, unless documented. | Reset. |
| Investment | Resource primarily used to purchase upgrades, hires, infrastructure or other economic sinks. | Yes. | Yes. | Yes. | No. | Reset unless explicitly marked permanent. |
| Progression | Resource or counter used to measure advancement, gates or long-term milestones. | Yes. | Usually no. | Yes. | No. | Keep, archive or reset according to the owning progression system. |
| Prestige | Resource or permanent value created by prestige or meta-progression. | Yes. | Sometimes, depending on prestige design. | Yes. | No. | Keep. |
| Temporary | Resource with an intentionally limited lifetime. | Yes, if active when saved. | Sometimes. | Usually limited. | Yes. | Clear unless explicitly persistent. |

### Category Rules

- A resource category does not replace the Resource Registry fields defined in Technical Rules.
- The Resource Registry remains authoritative for `isSpendable`, `isPersistent`, `resetBehavior`, min/max values and formatting.
- The lifetime category provides the default economic intent that those registry fields should follow.
- If registry behavior contradicts the resource's lifetime category, the resource definition must explain why.
- Resources used only as derived calculations should not be Resources; they should be Gameplay Stats handled through the Modifier System.
- Lifetime totals used for requirements are Progression data, even when they are derived from Disposable or Investment resource activity.

### MVP Classification

The MVP Vertical Slice uses the following classifications:

| Resource / Counter | Category | Notes |
|--------------------|----------|-------|
| Bugs Found | Disposable | Produced by Manual Testing and consumed by Bug Reporting. |
| Money | Investment | Earned through Bug Reporting and spent on Upgrades. |
| Lifetime Bugs Found | Progression | Used for promotion requirements; not spendable. |
| Lifetime Money Earned | Progression | Used for promotion requirements; not spendable. |

---

# DN-05 — Economic Pressure Waves

## Decision

The economy should intentionally alternate between periods of abundance and periods of scarcity.

Typical rhythm:

```text
Major Unlock
        ↓
Many Investment Options
        ↓
Resource Shortage
        ↓
Optimization
        ↓
Economic Stability
        ↓
Next Major Unlock
```

Economic pressure should naturally motivate optimization without relying on artificial restrictions.

### Benefits

- Reinforces Progression rhythm.
- Makes optimization meaningful.
- Prevents permanent resource overflow.
- Creates satisfying long-term pacing.

---

# 1. Purpose

The purpose of the Economy Framework is to define the architectural rules governing every economic interaction in QA Idle.

Progression determines **when** growth happens.

Game Systems determine **where** gameplay occurs.

Modifier System determines **how** gameplay values change.

Economy Framework determines **how value flows through the entire game.**

It establishes the common economic language shared by every gameplay system.

Whenever future systems introduce:

- new resources;
- new income;
- new investments;
- new currencies;
- new production methods;
- new progression layers;

they must follow the principles defined in this document.

Economy Framework therefore becomes the Single Source of Truth for every future economic decision.

---

# 2. Economy Philosophy

The economy of QA Idle exists to create meaningful decisions rather than maximize numbers.

Resources are valuable because they create new possibilities.

They are not the player's ultimate objective.

Money should feel like investment capital.

Resources should feel like professional assets.

Economic growth should continuously reinforce the player's evolving career.

As responsibilities increase, the player's economy should become broader rather than merely larger.

Whenever possible, progression should reward:

- better planning;
- better prioritization;
- better system interaction;
- better strategic thinking;
- better understanding of gameplay systems.

The player should rarely think:

> "I earned more money."

Instead they should think:

> "I can build something new."

Every important purchase should represent a professional investment.

The economy should constantly encourage players to make interesting trade-offs rather than obvious purchases.

---

# 3. Core Economic Principles

## 3.1 Every Resource Needs a Purpose

Every resource must solve a specific gameplay problem.

Every resource should answer three questions:

- Why is it earned?
- Why is it spent?
- Which decisions does it create?

Resources without meaningful gameplay purpose should never be introduced.

---

## 3.2 Every Income Needs a Sink

Every major income source should have one or more meaningful long-term sinks.

Resources should continuously circulate through the economy.

Accumulation without investment eventually destroys meaningful decision-making.

---

## 3.3 Every Sink Creates New Opportunities

Economic sinks should never exist merely to remove resources.

Every investment should create one or more of the following:

- higher efficiency;
- broader gameplay;
- deeper strategy;
- new responsibilities;
- future unlocks.

The player should feel stronger after spending resources.

---

## 3.4 Growth Creates Responsibility

Economic growth should increase decision complexity.

Larger income should create:

- more investment choices;
- additional strategic planning;
- broader management responsibilities.

Growth should expand gameplay instead of eliminating it.

---

## 3.5 Discovery Before Optimization

Players should first discover new gameplay systems.

Only afterwards should optimization become meaningful.

Discovery should remain the primary emotional reward.

Optimization should become the long-term reward.

---

## 3.6 Multiple Valid Investment Choices

Players should regularly face several reasonable investment options.

The economy should rarely contain one universally optimal purchase.

Different strategies should remain viable.

---

## 3.7 No Dead Resources

Resources should remain useful throughout the game.

As new systems appear, older resources should continue supporting meaningful progression rather than becoming obsolete.

When possible, new mechanics should expand previous economic layers instead of replacing them.
# 4. Economic Layers

The economy of QA Idle is intentionally structured into multiple interconnected layers.

Each layer has one clear responsibility.

Resources should flow forward through these layers, creating increasingly valuable gameplay opportunities.

```text
Production
        ↓
Conversion
        ↓
Investment
        ↓
Efficiency
        ↓
Progression
        ↓
Unlocks
```

---

## Production

Production introduces new value into the economy.

Gameplay systems create resources through player actions or automated systems.

Examples include:

- Manual Testing producing Bugs Found;
- Team producing Passive Bugs;
- Automation producing Automated Bugs;
- Company systems producing Revenue.

Production is the beginning of every economic loop.

Without production, no further economic activity can occur.

---

## Conversion

Conversion transforms produced resources into resources with greater strategic value.

Examples:

```text
Bugs Found
        ↓
Bug Reporting
        ↓
Money
```

Future examples:

```text
Company Revenue
        ↓
Corporate Budget
```

Conversion creates economic meaning.

Raw production alone should rarely be directly useful.

---

## Investment

Investment permanently transforms economic value into future capability.

Examples include:

- purchasing upgrades;
- hiring employees;
- improving automation;
- expanding office infrastructure;
- funding company growth.

Investment represents delayed gratification.

The player sacrifices immediate wealth for greater long-term potential.

---

## Efficiency

Investments improve the effectiveness of existing systems.

Efficiency should rarely introduce entirely new mechanics.

Instead it enhances already understood gameplay.

Examples include:

- producing more Bugs;
- reporting Bugs faster;
- improving automation quality;
- increasing team productivity.

Efficiency allows older gameplay systems to remain relevant throughout the game.

---

## Progression

Economic growth enables broader responsibilities.

Instead of only producing more resources, the player gains access to increasingly complex gameplay.

Examples:

- leadership;
- department management;
- company ownership;
- planetary expansion.

Progression transforms scale into new gameplay.

---

## Unlocks

Unlocks represent qualitative growth.

They expose new gameplay systems, mechanics, interfaces and responsibilities.

Unlocks are the primary long-term purpose of the economy.

The player should ultimately spend resources to discover entirely new ways to play rather than endlessly improving existing ones.

---

# 5. Resource Flow

Every resource should follow a predictable lifecycle.

Resources should continuously circulate throughout the economy rather than accumulate indefinitely.

The generalized flow is:

```text
Gameplay
        ↓
Production
        ↓
Resource
        ↓
Conversion
        ↓
Investment
        ↓
Improved Systems
        ↓
Higher Production
```

This architecture creates self-reinforcing progression while preserving meaningful player decisions.

---

## Resource Producers

Gameplay systems introduce resources into the economy.

Examples:

- Manual Testing;
- Team;
- Automation;
- Company;
- Future Planetary Systems.

Only gameplay systems may create economic value.

---

## Resource Consumers

Resources are consumed by gameplay systems.

Examples include:

- Upgrades;
- Hiring;
- Automation;
- Promotions;
- Office Expansion;
- Company Investments.

Consumption should always create future opportunities.

---

## Resource Circulation

Resources should continually move.

Example:

```text
Manual Testing
        ↓
Bugs Found
        ↓
Bug Reporting
        ↓
Money
        ↓
Upgrade
        ↓
Better Manual Testing
```

Later:

```text
Automation
        ↓
Passive Bugs
        ↓
Money
        ↓
Automation Investment
        ↓
Better Automation
```

Older loops remain active while newer loops are added.

The economy expands horizontally rather than replacing previous gameplay.

---

## Resource Ownership

Each gameplay system owns the production and consumption rules for its own resources.

The Resource System owns:

- balances;
- transactions;
- persistence.

Gameplay systems own:

- why resources are created;
- why resources are consumed.

This preserves clear architectural boundaries.

---

# 6. Sources and Sinks

Every major resource must define three things:

- primary sources;
- primary sinks;
- economic purpose.

The exact balance belongs to future documents.

The architecture belongs here.

---

## Bugs Found

### Primary Sources

- Manual Testing
- Team
- Automation
- Future gameplay systems

### Primary Sinks

- Bug Reporting

### Economic Role

Bugs Found are the primary production resource.

They represent completed QA work waiting to be transformed into economic value.

Bugs should rarely accumulate for long periods.

They are designed to flow continuously into Bug Reporting.

---

## Money

### Primary Sources

- Bug Reporting
- Contracts
- Company systems
- Future gameplay rewards

### Primary Sinks

- Upgrades
- Hiring
- Automation
- Office Expansion
- Company Investments
- Future strategic systems

### Economic Role

Money is the primary investment resource.

It should rarely represent victory.

Instead it represents future possibilities.

The player should constantly reinvest Money into larger economic loops.

---

## Reputation

### Primary Sources

- High-quality QA work
- Contracts
- Promotions
- Company success

### Primary Sinks

- Career opportunities
- Hiring requirements
- Special projects
- Executive systems

### Economic Role

Reputation represents trust rather than wealth.

It gates opportunities instead of purchasing power.

---

## Future Resources

Every future resource introduced into QA Idle must define:

- purpose;
- production;
- consumption;
- lifetime classification;
- economic domain.

Resources failing to satisfy these requirements should not be introduced.

---

# 7. Investment Philosophy

Investments are the primary mechanism through which players transform temporary success into permanent progression.

The economy should consistently encourage planning over hoarding.

---

## Short-Term Investments

Short-term investments improve current gameplay efficiency.

Examples include:

- production upgrades;
- reporting improvements;
- temporary optimization.

These investments produce immediate feedback and maintain satisfying gameplay pacing.

---

## Long-Term Investments

Long-term investments unlock future opportunities.

Examples include:

- Promotions;
- Team growth;
- Automation infrastructure;
- Company expansion.

These investments require patience but fundamentally expand gameplay possibilities.

---

## Permanent Investments

Permanent investments remain valuable throughout the current career.

Examples include:

- permanent upgrades;
- knowledge improvements;
- infrastructure;
- organizational improvements.

Permanent investments create lasting progression.

Whenever possible, permanent investments should be implemented through the Modifier System rather than directly altering gameplay values.

---

## Temporary Investments

Some future systems may consume resources to gain temporary advantages.

Examples include:

- special events;
- company initiatives;
- temporary productivity boosts;
- limited-time contracts.

Temporary investments should create meaningful strategic decisions without replacing permanent progression.

---

## Investment Diversity

Players should regularly choose between multiple investment horizons.

Typical examples include:

- immediate efficiency versus future unlocks;
- personal productivity versus organizational growth;
- manual performance versus automation;
- expansion versus optimization.

The economy should encourage different playstyles without making one universally correct.

Investment diversity is one of the primary drivers of long-term engagement in QA Idle.
# 8. Scaling Philosophy

Scaling is one of the defining characteristics of an incremental game.

In QA Idle, scaling should represent expanding responsibility rather than simply increasing numbers.

The player should repeatedly gain access to broader gameplay instead of endlessly multiplying production.

---

## Production Scaling

Production should evolve through new gameplay layers rather than relying exclusively on larger multipliers.

Typical progression:

```text
Manual Production
        ↓
Improved Manual Production
        ↓
Team-Assisted Production
        ↓
Automation
        ↓
Company Production
        ↓
Industry Production
        ↓
Planetary Production
```

Every new production layer should introduce new decisions, not merely higher output.

---

## Cost Scaling

Costs should naturally evolve alongside player capabilities.

Early costs primarily challenge resource accumulation.

Later costs increasingly challenge prioritization.

The player should eventually ask:

- Which investment is most valuable?
- Which system should grow first?
- Which opportunity should be delayed?

Cost scaling should gradually shift from affordability toward strategy.

---

## Qualitative Growth Over Quantitative Growth

Whenever possible, the game should reward the player with:

- new mechanics;
- new gameplay systems;
- new management responsibilities;
- new optimization opportunities;
- new interactions between systems.

Instead of:

- larger multipliers;
- larger percentages;
- larger resource values.

Large numerical growth should support gameplay expansion, not replace it.

---

## Horizontal Expansion Before Vertical Scaling

The preferred method of growth is introducing additional gameplay systems.

Example:

Instead of:

```text
Manual Testing

↓

+100%

↓

+200%

↓

+500%
```

Prefer:

```text
Manual Testing
        ↓
Team
        ↓
Automation
        ↓
Company
```

Each additional system creates new strategic decisions.

This keeps gameplay interesting over hundreds of hours.

---

## Runaway Growth Prevention

The economy should avoid situations where exponential growth removes meaningful decision-making.

Growth should remain exciting without becoming uncontrollable.

Preferred approaches include:

- introducing new investment opportunities;
- expanding economic domains;
- creating new strategic responsibilities;
- increasing interaction between systems.

Artificial limitations should remain a last resort.

Whenever possible, player behavior should naturally shift toward newer mechanics instead of older mechanics becoming invalid.

---

## Economic Plateaus

Periods of slower growth are intentional.

Plateaus allow players to:

- optimize existing systems;
- prepare for future unlocks;
- accumulate investment capital;
- experiment with alternative strategies.

Every meaningful plateau should clearly lead toward a future breakthrough.

The player should always understand why additional growth matters.

---

# 9. Idle Economy

QA Idle is fundamentally an incremental game.

However, active gameplay should remain valuable throughout the player's career.

Idle mechanics expand gameplay rather than replacing player interaction.

---

## Active Income

Active gameplay represents the player's direct contribution.

Examples include:

- Manual Testing;
- important management decisions;
- future interactive mechanics.

Active gameplay should remain the most engaging way to play.

It should consistently provide:

- immediate feedback;
- satisfying interactions;
- meaningful progression.

---

## Passive Income

Passive production represents the player's growing organization.

Examples include:

- Team output;
- Automation;
- Company systems.

Passive income rewards previous investments.

It should reduce repetitive actions without eliminating meaningful decision-making.

---

## Active and Passive Balance

Neither active nor passive gameplay should completely dominate.

Active gameplay should reward attention.

Passive gameplay should reward planning.

The player should feel encouraged to combine both approaches.

---

## Offline Progress

Offline progress is an extension of passive production.

It should simulate gameplay using the same architectural rules as active simulation whenever practical.

Offline progress should never become a separate economy.

Instead it reuses existing production systems under documented limitations.

This preserves consistency between active and offline play.

---

## Automation Philosophy

Automation exists to remove repetitive execution rather than meaningful decisions.

Automation should never eliminate strategic planning.

Instead it allows the player to focus on increasingly important responsibilities.

As automation expands, gameplay shifts from execution toward management.

---

## Manual Testing Relevance

Manual Testing should remain emotionally relevant throughout the game.

Although it eventually becomes a smaller percentage of total production, it continues representing the player's personal expertise.

New gameplay systems should expand beyond Manual Testing instead of replacing it.

The player should never feel that the game's original identity has disappeared.

---

# 10. Economic Decision Making

The economy should continuously present the player with meaningful choices.

Every stage of progression should contain multiple valid strategies.

Economic decisions should create long-term consequences.

---

## Typical Decisions

Examples include:

- Upgrade now or save for Promotion?
- Improve Manual Testing or Bug Reporting?
- Invest in Team or Automation?
- Expand existing systems or unlock new ones?
- Optimize current production or prepare for future growth?
- Invest in personal efficiency or organizational efficiency?

These decisions should remain meaningful throughout the player's career.

---

## Short-Term vs Long-Term Thinking

The economy should regularly challenge the player to balance immediate rewards against future potential.

Immediate investments provide fast feedback.

Long-term investments fundamentally reshape gameplay.

Both approaches should remain strategically valuable.

---

## Risk vs Stability

Some investments should provide predictable growth.

Others may offer greater rewards with greater uncertainty.

Future systems such as Events, Company Management and Prestige may expand this philosophy further.

---

## Planning as Gameplay

Planning should become an increasingly important skill.

As the player's organization grows, economic success should depend less on individual actions and more on prioritizing investments effectively.

The player's strategic decisions should gradually become the strongest driver of progression.

---

# 11. Economic Balance Guidelines

This section defines architectural balancing principles rather than numerical balance.

Future balance documents should remain compatible with these rules.

---

## New Resources Must Expand Gameplay

A new resource should introduce new decisions.

It should never exist solely to increase complexity.

---

## New Sinks Must Create New Opportunities

Economic sinks should unlock future possibilities.

Pure maintenance costs should remain rare.

Whenever players spend resources, they should feel that progression continues.

---

## Older Systems Must Remain Relevant

New mechanics should expand previous gameplay layers.

Older resources and systems should continue contributing meaningful value.

---

## Plateaus Should Be Intentional

Periods of slower progression are healthy when they encourage optimization and anticipation.

Players should understand that a larger milestone lies ahead.

---

## Major Discoveries Should Be Rare

Large gameplay transformations lose impact if they happen too frequently.

Economic pacing should preserve excitement by limiting major discoveries to meaningful milestones.

---

## No Dominant Strategy

Whenever practical, multiple investment paths should remain viable.

The economy should reward adaptation instead of memorization.

---

## Inflation Should Be Controlled Through Gameplay

The preferred solution to economic inflation is introducing broader responsibilities and new strategic systems.

The economy should avoid relying solely on increasingly expensive costs to preserve balance.
# 12. Interaction with Modifier System

The Economy Framework does not directly modify gameplay values.

Instead, it defines why gameplay values should change.

The Modifier System defines how those changes are applied.

This separation preserves modularity, deterministic calculations and long-term maintainability.

---

## Economic Systems Do Not Modify Gameplay Stats Directly

Economic systems must never directly change Gameplay Stats.

Examples include:

- production speed;
- bugs per action;
- money per reported bug;
- automation efficiency;
- team productivity.

Instead, economic systems create or remove Modifiers according to the rules defined in **09 - Modifier System.md**.

This ensures that every gameplay value has exactly one authoritative calculation path.

---

## Economy Produces Decisions

The economy determines:

- what the player earns;
- what the player purchases;
- what investments become available.

Those investments may activate permanent or temporary Modifiers.

Typical flow:

```text
Earn Money
        ↓
Purchase Upgrade
        ↓
Create Modifier
        ↓
Modifier System
        ↓
Gameplay Stat Updated
```

The economy therefore owns investment decisions.

The Modifier System owns gameplay calculations.

---

## Resource Flow and Gameplay Stats Are Separate

The economy distinguishes between two fundamentally different concepts.

### Resources

Resources represent stored value.

Examples:

- Money;
- Bugs Found;
- Reputation.

Resources belong to the Resource System.

---

### Gameplay Stats

Gameplay Stats determine how efficiently gameplay operates.

Examples:

- Manual Bugs per Action;
- Money per Bug Reported;
- Reporting Speed;
- Team Capacity.

Gameplay Stats belong to the Modifier System.

Resources should never be treated as Gameplay Stats.

Gameplay Stats should never be stored as Resources.

Maintaining this separation is mandatory.

---

## Future Economic Systems

Every future economic system should interact with gameplay using the same architecture.

Typical examples include:

```text
Team Upgrade
        ↓
Purchase
        ↓
Modifier Created
        ↓
Team Productivity Increased
```

```text
Prestige Bonus
        ↓
Permanent Modifier
        ↓
Future Career Starts Stronger
```

```text
Limited-Time Event
        ↓
Temporary Modifier
        ↓
Temporary Economic Effect
```

Regardless of gameplay source, the architectural pattern remains identical.

---

# 13. Save / Load Considerations

The economy should save only authoritative economic state.

Derived values should be recalculated after loading whenever possible.

This minimizes duplicated data and reduces the risk of inconsistent saves.

---

## Persistent Economic Data

Examples of persistent data include:

- resource balances;
- purchased upgrades;
- unlocked investments;
- completed promotions;
- permanent economic unlocks;
- investment history where required;
- prestige-related permanent progression.

These values represent player progress.

They should be stored.

---

## Derived Economic Data

Examples include:

- current production rates;
- current reporting efficiency;
- automation efficiency;
- final Gameplay Stats;
- calculated costs;
- calculated income.

These values should be recalculated after loading.

They should not be duplicated inside save files.

---

## Modifier Reconstruction

Gameplay values should be restored by rebuilding the active Modifier set.

Typical loading process:

```text
Load Save
        ↓
Restore Resources
        ↓
Restore Purchases
        ↓
Restore Unlocks
        ↓
Recreate Active Modifiers
        ↓
Modifier Calculation
        ↓
Derived Gameplay Stats
```

This guarantees deterministic gameplay after loading.

---

## Resource Integrity

Stored resource balances should remain internally consistent.

Loading must never create additional resources beyond documented migration behavior.

The economy should rely on authoritative resource balances rather than cached totals.

---

## Save Compatibility

Future economic systems should extend the save schema rather than replace it.

Whenever new resources or investments are introduced:

- stable IDs must be preserved;
- safe default values must exist;
- migrations should remain deterministic.

The economy should remain compatible across future content updates.

---

# 14. Future Expansion

The architecture defined in this document is intentionally designed to support the long-term vision of QA Idle.

Future gameplay systems should expand the economy without replacing its foundations.

---

## Team

The Team System introduces organizational production.

It adds new production loops while remaining compatible with the existing investment architecture.

The player expands beyond personal productivity.

---

## Automation

Automation introduces scalable passive production.

Its investments create additional economic loops while preserving active gameplay relevance.

Automation should extend the economy rather than bypass it.

---

## Company

Company systems introduce higher-level investment decisions.

Money evolves from personal salary into organizational capital.

The underlying economic architecture remains unchanged.

Only the scale increases.

---

## Prestige

Prestige introduces long-term meta progression.

Some resources reset.

Some investments remain permanent.

Future Prestige systems should follow the Resource Lifetime Classification defined in this document.

Prestige should transform the economy into a new cycle rather than replacing its architecture.

---

## Planetary Systems

Late-game expansion introduces new economic domains instead of endlessly increasing existing values.

The player gradually transitions from:

```text
Personal Economy
        ↓
Department Economy
        ↓
Company Economy
        ↓
Industry Economy
        ↓
Planetary Economy
```

Each new domain introduces:

- new responsibilities;
- new production loops;
- new investment opportunities;
- new strategic decisions.

The underlying economic principles remain identical.

Only the scope changes.

---

# Conclusion

The Economy Framework establishes the architectural rules governing value creation, investment and progression throughout QA Idle.

It defines how resources should move, how investments should create long-term growth, how scaling should preserve meaningful decisions and how every future gameplay system should participate in one unified economy.

Future design documents may introduce new resources, mechanics and progression systems, but they must remain compatible with the principles established here.

This document therefore serves as the Single Source of Truth for the economic architecture of QA Idle.
