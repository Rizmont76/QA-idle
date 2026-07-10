# 06 - Game Systems

## Document Status

**Project:** QA Idle

**Document Type:** Game Systems Architecture Document

**Owner Role:** Lead Game Designer / Systems Designer

**Status:** Frozen v1.0

**Depends On:**

- README.md
- 01 - Vision.md
- 02 - Core Gameplay Loop.md
- 03 - Player Journey.md
- 04 - Career System.md
- 05 - Progression.md

This document defines the complete architecture of all major gameplay systems in QA Idle.

Its purpose is to establish what systems exist, why they exist, how they interact, when they become relevant, and which future documents own their detailed implementation.

This document intentionally does **not** define:

- balancing;
- economy values;
- production formulas;
- upgrade costs;
- numerical progression;
- UI layouts;
- technical implementation.

Instead, it serves as the architectural "map" of the entire game.

Every future design document should reference this document before introducing or modifying a gameplay system.

---

# Designer Notes

The following proposals are **not part of the current design**.

They are architectural ideas that should be evaluated before implementation.

---

# DN-01 — Unified Resource Architecture

## Proposal

Every gameplay system should communicate through standardized resources rather than directly modifying other systems.

Instead of tightly coupling mechanics together, systems should produce outputs that become inputs for other systems.

```text
Gameplay System
        ↓
Produces Resources
        ↓
Resources
        ↓
Consumed by Other Systems
```

Examples:

```text
Manual Testing
        ↓
Bugs Found
        ↓
Bug Reporting
        ↓
Money
        ↓
Upgrades
        ↓
Improved Manual Testing
```

The same philosophy should apply to every future system.

Systems should exchange resources rather than hidden internal state whenever possible.

### Pros

- Clear architecture.
- Easy to extend.
- Easier balancing.
- Lower system coupling.
- Supports future modular design.

### Cons

- Requires discipline when designing new systems.
- Some interactions may appear indirect compared to hardcoded solutions.

---

# DN-02 — Event-Driven Systems

## Proposal

Gameplay systems should not only exchange resources.

They should also react to important gameplay events.

Examples:

```text
Promotion Earned
        ↓
Unlock System
        ↓
UI Expansion
        ↓
Tutorial
        ↓
Achievements
        ↓
New Events
```

Another example:

```text
Contract Completed
        ↓
Company Reputation
        ↓
Higher Contract Tier
        ↓
Special Event
```

Systems therefore react to meaningful changes instead of constantly polling one another.

### Pros

- Supports modular implementation.
- Easier future expansion.
- Reduces hidden dependencies.
- Helps implementation remain scalable.

### Cons

- Requires clearly defined event ownership.
- More documentation is needed for event flow.

---

# DN-03 — Modular Game Systems

## Proposal

Every gameplay system should exist as an independent module.

Every module should define only:

- Purpose
- Inputs
- Outputs
- Internal progression
- Dependencies

It should avoid hidden knowledge about unrelated systems.

Example:

```text
Automation

Inputs
• Money
• Reputation

Outputs
• Automation Coverage
• Passive Bugs
```

Automation should not directly manipulate Team, Promotion or Contracts.

Instead, those systems react through shared resources and events.

### Pros

- Excellent scalability.
- Easier testing.
- Cleaner implementation.
- Lower maintenance cost.
- Well suited for Codex.

### Cons

- Some concepts may appear duplicated across documentation.
- Requires careful documentation discipline.

---

# DN-04 — Hidden Systems That Unlock Later

## Proposal

Every major gameplay system should follow the same discovery lifecycle.

```text
Hidden
        ↓
Teased
        ↓
Unlocked
        ↓
Expanded
        ↓
Mastered
        ↓
Integrated
```

The player should never immediately understand the entire game.

Instead, systems become part of the player's mental model gradually.

Example:

Automation

```text
Hidden
        ↓
Small references
        ↓
Senior QA Promotion
        ↓
Basic Automation
        ↓
Advanced Automation
        ↓
Automation becomes part of everyday gameplay
```

### Pros

- Reinforces discovery.
- Supports Player Journey.
- Prevents overwhelming the player.
- Makes promotions more exciting.

### Cons

- Unlock pacing becomes more important.
- Requires careful planning across documents.

---

# DN-05 — System Ownership

## Proposal

Every gameplay system should have exactly one authoritative design document.

That document becomes the Single Source of Truth.

Example:

```text
Money
        ↓
Economy.md

Automation
        ↓
Automation.md

Contracts
        ↓
Contracts.md

Team
        ↓
Team.md
```

Other documents may reference these systems but should never redefine their behavior.

### Pros

- Prevents contradictions.
- Makes documentation easier to maintain.
- Gives Codex a clear source for implementation.
- Supports long-term scalability.

### Cons

- Requires frequent cross-referencing.
- Demands good document organization.

---

# 1. Purpose

The purpose of the Game Systems document is to define the complete architecture of QA Idle.

Vision answers:

> "What game are we building?"

Core Gameplay Loop answers:

> "What does the player repeatedly do?"

Player Journey answers:

> "What does the player experience emotionally?"

Career System answers:

> "Who does the player become?"

Progression answers:

> "When do new experiences appear?"

Game Systems answers:

> **"What systems make all of this possible?"**

It serves as the architectural layer connecting every major gameplay mechanic.

Whenever a new gameplay feature is proposed, it should first answer:

- Which existing system owns it?
- Which resources does it consume?
- Which resources does it produce?
- Which systems depend on it?
- Which future document defines it?

If those questions cannot be answered, the feature probably does not yet belong in QA Idle.

---

# 2. Systems Philosophy

QA Idle is not a collection of isolated mechanics.

It is a living ecosystem of interconnected gameplay systems.

Each system exists for a specific purpose.

No system should exist simply because idle games usually have one.

Every system must satisfy at least one of the following goals:

- expand player decisions;
- reinforce the QA career fantasy;
- introduce a new gameplay layer;
- create meaningful progression;
- connect existing mechanics together;
- unlock future responsibilities.

A system that only increases numbers without changing player behavior should be reconsidered.

---

# 3. Core Architecture Principles

## 3.1 Every System Has One Job

Each gameplay system should have a clearly defined responsibility.

Examples:

- Manual Testing discovers bugs.
- Bug Reporting converts bugs into value.
- Money enables investment.
- Upgrades improve efficiency.
- Team scales production.
- Reputation unlocks opportunities.
- Promotion expands gameplay.
- Prestige restarts progression.

The clearer each responsibility becomes, the easier future expansion becomes.

---

## 3.2 Systems Produce Value

Every system should create something valuable.

Examples include:

- resources;
- progression;
- decisions;
- unlocks;
- gameplay opportunities;
- emotional rewards.

If a system neither creates value nor changes player behavior, it likely does not need to exist.

---

## 3.3 Systems Consume Value

Likewise, every system should require meaningful inputs.

Typical inputs include:

- Money
- Bugs
- Reputation
- Time
- Automation Coverage
- Team Output
- Company Reputation

This creates an interconnected gameplay economy rather than isolated mechanics.

---

## 3.4 Systems Expand Instead of Replacing

New gameplay systems should rarely replace older ones.

Instead they should expand the overall gameplay ecosystem.

Example:

```text
Manual Testing

becomes

Manual Testing
+
Team

becomes

Manual Testing
+
Team
+
Automation

becomes

Manual Testing
+
Team
+
Automation
+
Contracts

becomes

Manual Testing
+
Team
+
Automation
+
Contracts
+
Company Management
```

Older systems remain emotionally relevant even if newer systems become strategically stronger.

---

## 3.5 Systems Grow With The Career

Gameplay systems should appear because the player's responsibilities changed.

Never because enough time has passed.

Example:

Junior QA

does not manage Teams because they are not responsible for people.

QA Lead unlocks Team Management because leadership became part of the job.

Founder unlocks Company Management because ownership became part of the fantasy.

Every new mechanic should feel earned.

---

# 4. Gameplay System Lifecycle

Every major gameplay system should follow the same lifecycle.

```text
Hidden
        ↓
Teased
        ↓
Unlocked
        ↓
Learning
        ↓
Optimization
        ↓
Mastery
        ↓
Integration
```

## Hidden

The player has no knowledge that the system exists.

The interface should not expose future mechanics.

---

## Teased

Small hints begin preparing the player.

Examples:

- dialogue;
- achievements;
- promotion previews;
- humorous flavor text;
- references inside upgrades.

The player becomes curious.

---

## Unlocked

The system becomes available.

Only its core mechanics are introduced.

Complexity should remain low.

---

## Learning

The player experiments.

The game teaches purpose before optimization.

---

## Optimization

The player begins making meaningful strategic decisions.

The system becomes an important part of gameplay.

---

## Mastery

The player fully understands how the system works.

The system becomes reliable and predictable.

---

## Integration

The system no longer feels separate.

Instead, it naturally interacts with multiple gameplay systems.

By this point, the player should think about goals rather than individual mechanics.

---
# 5. Gameplay Systems

---

# Manual Testing

## Purpose

Manual Testing is the foundation of QA Idle.

It represents the player's personal contribution before teams, automation and management become available.

Its purpose is to establish the identity of the game, teach the core gameplay loop and create an emotional attachment to finding bugs.

Manual Testing should remain symbolically important throughout the entire game, even after more efficient production methods become available.

---

## Fantasy

"I personally test software."

The player explores features, reproduces issues, experiments with edge cases and discovers problems before anyone else.

This is the fantasy of being a real QA Engineer at the beginning of a career.

---

## Gameplay Role

Manual Testing is the player's primary active production system.

It introduces:

- active interaction;
- immediate feedback;
- short gameplay loops;
- direct cause-and-effect.

It establishes the rhythm that every later gameplay system expands upon.

---

## Core Loop

```text
Run Manual Test
        ↓
Find Bugs
        ↓
Store Bugs
        ↓
Report Bugs
        ↓
Earn Value
        ↓
Improve Testing
        ↓
Repeat
```

---

## Inputs

- Player interaction
- Manual Testing Upgrades
- QA Tools
- Career Bonuses
- Temporary Events

---

## Outputs

- Bugs Found
- Progress toward Achievements
- Progress toward Promotions
- Event Triggers

---

## Unlock Conditions

Available immediately.

Manual Testing defines the beginning of every new career.

---

## Progression

Manual Testing evolves through multiple stages.

Early game:

- primary production source.

Mid game:

- supported by Team.

Later:

- supported by Automation.

Late game:

- remains emotionally valuable while becoming strategically secondary.

The game should never communicate:

> "Manual Testing is obsolete."

Instead it should communicate:

> "Your responsibilities have grown."

---

## Player Decisions

The player decides:

- when to actively test;
- which upgrades improve manual efficiency;
- whether to continue active play or rely on passive systems;
- how Manual Testing supports larger goals.

---

## Interaction with Other Systems

Produces:

- Bugs Found

Supports:

- Bug Reporting
- Achievements
- Contracts
- Promotion
- Statistics

Improved by:

- Upgrades
- Reputation
- Career
- Automation support
- Team support

---

## Emotional Goal

The player should feel:

"I found this bug."

Manual Testing creates ownership over early progress and establishes emotional continuity throughout the game.

---

## Future Expansion

Possible future additions:

- exploratory testing;
- test techniques;
- bug severity discovery;
- risk-based testing;
- mini-events;
- special testing sessions;
- humorous QA scenarios.

---

# Bug Reporting

## Purpose

Bug Reporting transforms discovered bugs into meaningful progression.

Finding bugs alone has no value.

Only properly reporting them advances the player's career.

This reinforces the fantasy that QA is about communication as much as discovery.

---

## Fantasy

"I write valuable bug reports."

The player converts raw findings into professional QA output.

---

## Gameplay Role

Bug Reporting is the game's first conversion system.

It separates production from value generation.

Without this step, Bugs would simply become another currency.

Instead, Bug Reporting gives context to the entire gameplay loop.

---

## Core Loop

```text
Receive Bugs
        ↓
Prepare Reports
        ↓
Submit Reports
        ↓
Receive Rewards
        ↓
Continue Testing
```

---

## Inputs

- Bugs Found
- Reporting Upgrades
- Reputation Bonuses
- Team Output
- Automation

---

## Outputs

- Money
- Reputation
- Promotion Progress
- Contract Progress
- Achievement Progress

---

## Unlock Conditions

Available immediately.

It is inseparable from Manual Testing.

---

## Progression

Initially, Bug Reporting simply converts Bugs into Money.

As the career grows, reports become increasingly valuable.

Later systems improve:

- report quality;
- reporting speed;
- reporting efficiency;
- automation-assisted reporting.

The player eventually shifts from writing reports personally to managing reporting pipelines.

---

## Player Decisions

The player decides:

- whether to improve reporting or testing;
- how to optimize production chains;
- how reporting fits larger progression goals.

---

## Interaction with Other Systems

Consumes:

- Bugs Found

Produces:

- Money
- Reputation

Supports:

- Contracts
- Career
- Promotions
- Economy

Improved by:

- Automation
- Team
- Upgrades

---

## Emotional Goal

The player should feel that every discovered bug matters.

Reporting transforms effort into career growth.

---

## Future Expansion

Possible additions:

- bug severity;
- duplicate reports;
- report templates;
- developer feedback;
- client-specific reporting standards.

---

# Resources

## Purpose

Resources provide the common language shared by every gameplay system.

Rather than systems interacting directly, they exchange standardized resources.

Resources become the connective tissue of the entire game architecture.

---

## Fantasy

Resources represent everything the player creates, earns or manages throughout their QA career.

---

## Gameplay Role

Resources allow independent systems to interact without becoming tightly coupled.

Every system either:

- produces resources;
- consumes resources;
- or both.

---

## Core Loop

```text
Gameplay System
        ↓
Produces Resource
        ↓
Resource Stored
        ↓
Another System Consumes Resource
        ↓
New Gameplay Opportunity
```

---

## Inputs

Resources are produced by nearly every gameplay system.

Examples:

- Bugs Found
- Money
- Reputation
- Team Output
- Automation Coverage
- Company Reputation

---

## Outputs

Resources themselves unlock gameplay through consumption by other systems.

---

## Unlock Conditions

Different resources unlock gradually throughout the player's career.

The player should never see all resource types at once.

---

## Progression

The number of meaningful resources grows alongside career complexity.

Early game:

- Bugs
- Money

Mid game:

- Reputation
- Team Output
- Automation Coverage

Late game:

- Company Reputation
- Executive Resources
- Business-scale progression

---

## Player Decisions

The player constantly chooses:

- where resources should be invested;
- which resource is currently most valuable;
- which long-term strategy to pursue.

---

## Interaction with Other Systems

Resources connect every gameplay system.

They intentionally have no independent gameplay.

Their value comes entirely from enabling interactions between systems.

---

## Emotional Goal

Resources should feel understandable.

The player should immediately know:

- where a resource comes from;
- why it exists;
- what it can be used for.

---

## Future Expansion

Future documents may introduce additional specialized resources while preserving the unified resource architecture.

---

# Money

## Purpose

Money represents economic progress.

It allows the player to transform successful QA work into long-term growth.

Money is the first universal investment resource.

---

## Fantasy

"I earn money because my QA work creates value."

The meaning of Money evolves with the player's career.

Initially it represents salary.

Later it represents department budget.

Eventually it represents company revenue.

---

## Gameplay Role

Money is the primary investment resource.

It enables almost every progression system without becoming the ultimate goal itself.

Money exists to unlock better gameplay, not to be collected for its own sake.

---

## Core Loop

```text
Perform QA Work
        ↓
Earn Money
        ↓
Invest Money
        ↓
Improve Systems
        ↓
Earn More Value
```

---

## Inputs

- Bug Reporting
- Contracts
- Team Output
- Company Systems
- Offline Progress
- Events

---

## Outputs

Money enables:

- Upgrades
- Hiring
- Office Expansion
- Company Investments
- Unlock Requirements

---

## Unlock Conditions

Available immediately.

---

## Progression

Money evolves alongside the player's career.

Salary becomes:

Department Budget

Department Budget becomes:

Business Revenue

Business Revenue becomes:

Organizational Capital

The resource remains familiar while its narrative meaning evolves.

---

## Player Decisions

The player constantly chooses between:

- short-term growth;
- long-term investment;
- expansion;
- optimization.

Money should always create interesting decisions rather than obvious purchases.

---

## Interaction with Other Systems

Produced by:

- Bug Reporting
- Contracts
- Company

Consumed by:

- Upgrades
- Team
- Automation
- Office
- Company Management

Supports:

Almost every gameplay system.

---

## Emotional Goal

Money should represent opportunity rather than success.

The player should immediately ask:

"What should I build next?"

instead of

"How much do I have?"

---

## Future Expansion

Future systems may introduce investment portfolios, company finance, executive budgeting and global expansion while preserving the same underlying purpose.

---

# Upgrades

## Purpose

Upgrades permanently improve the player's capabilities.

They convert accumulated resources into lasting progression.

Every upgrade should make the player feel better at QA rather than simply richer.

---

## Fantasy

"I became a better QA professional."

Every upgrade should represent knowledge, tools, experience, processes or organizational improvement.

---

## Gameplay Role

Upgrades are the primary long-term investment system.

They reinforce every major gameplay loop without replacing them.

---

## Core Loop

```text
Earn Resources
        ↓
Purchase Upgrade
        ↓
Improve Existing System
        ↓
Increase Efficiency
        ↓
Reach New Goals
```

---

## Inputs

- Money
- Reputation
- Company Resources
- Special Unlocks

---

## Outputs

- Improved production
- New mechanics
- Better efficiency
- New interactions
- Expanded gameplay possibilities

---

## Unlock Conditions

Basic upgrades unlock immediately.

Additional categories unlock naturally through Career progression.

---

## Progression

Upgrade categories evolve together with the player's responsibilities.

Examples include:

- Personal Skills
- QA Tools
- Reporting
- Team
- Automation
- Management
- Company
- Executive Strategy

Each new category reflects the player's changing role.

---

## Player Decisions

Players decide:

- which strategy to prioritize;
- when to specialize;
- when to diversify;
- whether to invest for immediate gains or future scalability.

---

## Interaction with Other Systems

Upgrades improve nearly every gameplay system.

They do not produce gameplay directly.

Instead, they amplify the effectiveness of existing systems.

---

## Emotional Goal

The player should feel continuous professional growth.

An upgrade should communicate:

"I know more."

rather than

"My multiplier increased."

---

## Future Expansion

Future upgrade trees may become increasingly specialized while preserving consistent progression philosophy.

---
# Team

## Purpose

The Team System allows the player to scale beyond individual productivity.

It represents the first major transition from personal contribution to collaborative success.

Its purpose is not simply to increase passive production.

Its purpose is to fundamentally change how the player thinks about progress.

Instead of asking:

> "How can I work faster?"

the player gradually begins asking:

> "How can my team work better?"

This transition represents one of the most important milestones in the player's career.

---

## Fantasy

"I am no longer working alone."

The player builds a QA team capable of discovering, reporting and validating bugs together.

As the career progresses, the player evolves from being a teammate into a leader, mentor and eventually an executive responsible for entire QA organizations.

---

## Gameplay Role

The Team System introduces the first large passive production layer.

It shifts gameplay from:

```text
Personal Productivity
```

toward

```text
Organizational Productivity
```

It also becomes the first system where management decisions become more valuable than direct player actions.

---

## Core Loop

```text
Hire Team Members
        ↓
Increase Team Output
        ↓
Generate More Bugs
        ↓
Earn More Resources
        ↓
Expand Team
        ↓
Improve Team Efficiency
        ↓
Repeat
```

---

## Inputs

- Money
- Reputation
- Team Upgrades
- Office Capacity
- Career Progression
- Company Policies

---

## Outputs

- Team Output
- Passive Bugs
- Contract Progress
- Reputation Growth
- Management Opportunities

---

## Unlock Conditions

Unlocked after the player reaches the appropriate career stage where collaboration naturally becomes part of the role.

The Team System should never feel artificially unlocked.

It should feel like a consequence of becoming more experienced.

---

## Progression

The Team System grows together with the player's career.

Typical evolution:

```text
No Team
        ↓
One Assistant
        ↓
Small QA Team
        ↓
Specialized QA Team
        ↓
Multiple Teams
        ↓
Department
        ↓
Organization
        ↓
Global QA Workforce
```

The player should repeatedly experience the feeling that their influence extends further than before.

---

## Player Decisions

Examples include:

- Hire or upgrade existing members?
- Expand or optimize?
- Invest in people or automation?
- Build balanced or specialized teams?
- Improve productivity or quality?

The Team System should reward thoughtful organizational decisions.

---

## Interaction with Other Systems

Consumes:

- Money
- Reputation
- Office Capacity

Produces:

- Team Output
- Passive Bugs
- Management Progress

Supports:

- Automation
- Contracts
- Promotion
- Company Management
- Offline Progress

Improved by:

- Upgrades
- Career
- Reputation
- Office
- Events

---

## Emotional Goal

The player should feel:

> "The success of my team is my success."

The emotional shift from individual achievement to shared achievement should be clearly noticeable.

---

## Future Expansion

Possible future additions include:

- mentoring;
- specialization;
- morale;
- training;
- leadership;
- QA culture;
- cross-team collaboration;
- distributed teams.

---

# Reputation

## Purpose

Reputation represents trust.

Unlike Money, which purchases capabilities, Reputation unlocks opportunities.

It reflects how the player's work is perceived by developers, managers, clients and eventually the software industry itself.

---

## Fantasy

"I became someone people trust."

The player earns recognition through consistently delivering high-quality QA work.

---

## Gameplay Role

Reputation is the primary progression gate for professional growth.

It prevents progression from becoming purely economic.

Some opportunities should require credibility rather than wealth.

---

## Core Loop

```text
Perform Excellent QA
        ↓
Earn Reputation
        ↓
Unlock Better Opportunities
        ↓
Improve Career
        ↓
Earn More Reputation
```

---

## Inputs

- Bug Reporting
- Contracts
- Automation
- Achievements
- Events
- Career Milestones

---

## Outputs

- Promotion Access
- Better Contracts
- New Upgrade Categories
- Team Improvements
- Automation Opportunities

---

## Unlock Conditions

Professional Reputation unlocks naturally once the player moves beyond basic manual work.

Company Reputation becomes available only after founding a company.

The two systems intentionally remain separate.

---

## Progression

Professional Reputation evolves into Company Reputation.

```text
Professional Reputation
        ↓
Industry Reputation
        ↓
Company Reputation
```

Although they are related, they represent different scales of influence.

---

## Player Decisions

Players decide:

- pursue immediate income;
- build long-term trust;
- invest in prestige rather than profit;
- accept easier or more prestigious work.

---

## Interaction with Other Systems

Produced by:

- Bug Reporting
- Contracts
- Automation
- Achievements

Consumed by:

- Promotion
- Team
- Automation
- Company

Supports:

- Career
- Unlock System
- Events

---

## Emotional Goal

The player should feel respected.

Reputation should create the feeling that the player's work matters beyond financial reward.

---

## Future Expansion

Examples include:

- client trust;
- industry awards;
- conference invitations;
- open-source influence;
- community recognition.

---

# Automation

## Purpose

Automation transforms QA from manual execution into system design.

Rather than replacing Manual Testing, Automation expands the player's ability to produce quality at scale.

It marks one of the largest gameplay transitions in the entire game.

---

## Fantasy

"I built systems that test software even when I am not."

The player no longer thinks only about finding bugs.

They begin designing testing infrastructure.

---

## Gameplay Role

Automation introduces scalable passive production.

It also reinforces optimization, planning and long-term investment.

Automation should feel fundamentally different from Team.

Team represents people.

Automation represents systems.

---

## Core Loop

```text
Invest in Automation
        ↓
Increase Automation Coverage
        ↓
Generate Passive QA Value
        ↓
Earn Resources
        ↓
Improve Automation
        ↓
Repeat
```

---

## Inputs

- Money
- Reputation
- Automation Upgrades
- Team Support
- Executive Decisions

---

## Outputs

- Automation Coverage
- Passive Bugs
- Offline Progress
- Reporting Support
- Contract Efficiency

---

## Unlock Conditions

Unlocked naturally once the player reaches an experienced QA role where automation becomes part of professional responsibilities.

---

## Progression

Automation grows through several conceptual stages.

```text
Basic Scripts
        ↓
Regression Testing
        ↓
CI/CD Integration
        ↓
Large Automation Suites
        ↓
Self-Managing QA Infrastructure
```

The player should increasingly think like an architect rather than a tester.

---

## Player Decisions

Examples include:

- expand coverage or improve reliability;
- invest in automation or people;
- optimize existing pipelines;
- prepare for future contracts.

---

## Interaction with Other Systems

Consumes:

- Money
- Reputation

Produces:

- Automation Coverage
- Passive Bugs

Supports:

- Team
- Contracts
- Offline Progress
- Promotion
- Company

Improved by:

- Upgrades
- Career
- Events

---

## Emotional Goal

Automation should create the feeling:

> "My systems keep working without me."

It should reward planning instead of constant activity.

---

## Future Expansion

Potential additions:

- flaky tests;
- AI-assisted testing;
- continuous deployment;
- automated maintenance;
- infrastructure optimization.

---

# Promotion

## Purpose

Promotion is the primary structural reward of QA Idle.

Its purpose is not simply to increase production.

Its purpose is to transform the game.

Every promotion should introduce at least one meaningful change in how the player experiences QA Idle.

---

## Fantasy

"My career has evolved."

The player earns greater responsibility rather than a larger paycheck.

---

## Gameplay Role

Promotion synchronizes every major gameplay system.

It acts as the central pacing mechanism connecting:

- Career;
- Unlock System;
- UI Expansion;
- Resources;
- Team;
- Automation;
- Company.

---

## Core Loop

```text
Meet Requirements
        ↓
Receive Promotion
        ↓
Unlock New Gameplay Layer
        ↓
Learn New Responsibilities
        ↓
Master New Systems
        ↓
Prepare For Next Promotion
```

---

## Inputs

- Career Progress
- Reputation
- Resources
- Achievements
- System Mastery

---

## Outputs

- New Gameplay Systems
- UI Expansion
- Career Progress
- New Resources
- New Decisions

---

## Unlock Conditions

Promotions occur only when the player's career naturally advances.

They should never feel arbitrary.

---

## Progression

Every promotion increases:

- responsibility;
- decision complexity;
- gameplay variety;
- system interaction;
- player identity.

---

## Player Decisions

The player decides:

- whether they are ready;
- how to prepare;
- which systems deserve investment before promotion.

---

## Interaction with Other Systems

Promotion interacts with almost every gameplay system.

It acts as the primary trigger for unlocking new gameplay layers.

---

## Emotional Goal

The player should always think:

> "I'm playing a different game now."

rather than

> "I gained another multiplier."

---

## Future Expansion

Future promotions may unlock entirely new gameplay genres while preserving the core QA fantasy.

---

# Career

## Purpose

Career defines the player's long-term identity.

Unlike Promotion, which represents individual milestones, Career represents the complete professional journey.

It answers one fundamental question:

> "Who has the player become?"

---

## Fantasy

"I built an impossible QA career."

The player evolves from a beginner into the ultimate authority on software quality.

---

## Gameplay Role

Career provides the narrative framework connecting every gameplay system.

It determines:

- available responsibilities;
- available mechanics;
- available resources;
- available fantasies.

Every other major system evolves alongside Career.

---

## Core Loop

```text
Learn Role
        ↓
Master Responsibilities
        ↓
Receive Promotion
        ↓
Adopt New Identity
        ↓
Unlock New Systems
        ↓
Repeat
```

---

## Inputs

- Promotion
- Reputation
- System Mastery
- Long-Term Progression

---

## Outputs

- Gameplay Layers
- Unlock Opportunities
- Player Identity
- System Expansion

---

## Unlock Conditions

Career progression begins immediately and continues throughout the entire game.

---

## Progression

Career evolves from:

```text
Junior QA
        ↓
Professional
        ↓
Leader
        ↓
Executive
        ↓
Founder
        ↓
Global Organization
        ↓
Planetary QA
        ↓
Beyond
```

---

## Player Decisions

Players continuously decide how they want to grow toward future responsibilities.

Career should always provide a meaningful long-term direction.

---

## Interaction with Other Systems

Career influences every gameplay system.

Likewise, every gameplay system contributes toward Career progression.

Career is therefore the highest-level gameplay framework.

---

## Emotional Goal

The player should repeatedly feel:

> "I have become someone I could never imagine at the start of the game."

---

## Future Expansion

Future content may extend Career indefinitely while preserving the same progression philosophy.

---
# Contracts

## Purpose

The Contracts System introduces structured medium- and long-term objectives.

Instead of progressing only by accumulating resources, the player begins working toward meaningful business goals with unique requirements and rewards.

Contracts provide direction, pacing and strategic variety.

---

## Fantasy

"I provide QA services for increasingly important clients."

The player no longer performs QA in isolation.

Their organization now delivers quality assurance for real customers whose expectations, scale and complexity continue to grow throughout the game.

---

## Gameplay Role

Contracts become the primary goal-oriented gameplay system.

Unlike Upgrades, which improve capabilities, Contracts provide objectives that encourage the player to use those capabilities efficiently.

They answer the question:

> "What should I optimize for next?"

---

## Core Loop

```text
Receive Available Contracts
        ↓
Evaluate Requirements
        ↓
Accept Contract
        ↓
Allocate Resources
        ↓
Complete Objectives
        ↓
Receive Rewards
        ↓
Unlock Better Contracts
```

---

## Inputs

- Team Output
- Automation Coverage
- Reputation
- Money
- Office Capacity
- Company Development

---

## Outputs

- Money
- Reputation
- Company Reputation
- Progression
- New Opportunities
- Special Events

---

## Unlock Conditions

Contracts become available once the player reaches a career stage where external clients naturally become part of their responsibilities.

They should feel like a natural evolution of professional trust.

---

## Progression

Contracts gradually evolve.

```text
Small Internal Tasks
        ↓
Department Projects
        ↓
External Clients
        ↓
Enterprise Contracts
        ↓
Global Partnerships
        ↓
Planetary Projects
```

Contract complexity should increase through objectives rather than simply larger rewards.

---

## Player Decisions

The player decides:

- which contracts to accept;
- which to postpone;
- whether current systems are sufficient;
- whether to specialize or diversify.

Choosing contracts should be a strategic decision rather than an obvious optimization.

---

## Interaction with Other Systems

Consumes:

- Team Output
- Automation
- Reputation
- Office Capacity

Produces:

- Money
- Reputation
- Company Reputation

Supports:

- Promotion
- Company Management
- Events
- Achievements

---

## Emotional Goal

The player should feel trusted.

Contracts should communicate:

> "Important companies believe in my QA."

---

## Future Expansion

Possible future additions:

- contract categories;
- premium clients;
- emergency projects;
- seasonal contracts;
- branching contract chains;
- competing client interests.

---

# Office

## Purpose

The Office System represents the player's physical and organizational workspace.

Its purpose is to provide visible growth, support larger teams and reinforce the fantasy that responsibilities continue expanding.

Office should never exist merely as another upgrade tree.

It should feel like the place where the player's career lives.

---

## Fantasy

"My workplace keeps growing because my career keeps growing."

The player starts with a simple workstation.

Eventually they oversee entire office buildings and global QA locations.

---

## Gameplay Role

Office serves as an infrastructure system.

Instead of producing resources directly, it enables other systems to scale.

---

## Core Loop

```text
Expand Office
        ↓
Unlock Capacity
        ↓
Support Larger Teams
        ↓
Increase Production
        ↓
Expand Again
```

---

## Inputs

- Money
- Company Development
- Career Progress
- Office Upgrades

---

## Outputs

- Team Capacity
- Organizational Capacity
- System Unlocks
- New Management Opportunities

---

## Unlock Conditions

Office expands naturally once managing people becomes part of the player's role.

---

## Progression

Office evolves alongside Career.

```text
Personal Desk
        ↓
QA Workspace
        ↓
QA Department
        ↓
Corporate Office
        ↓
Headquarters
        ↓
Multiple Offices
        ↓
Global Network
```

The office should visually communicate the player's career growth.

---

## Player Decisions

Examples include:

- expand now or optimize current space;
- support more people or better tools;
- invest in infrastructure or production.

---

## Interaction with Other Systems

Supports:

- Team
- Company Management
- Contracts
- Events

Improved by:

- Upgrades
- Career
- Money

---

## Emotional Goal

The player should feel that their workplace evolves together with their responsibilities.

---

## Future Expansion

Possible additions:

- specialized departments;
- regional offices;
- remote teams;
- innovation centers;
- absurd late-game facilities.

---

# Company Management

## Purpose

Company Management transforms the player from an employee into an owner.

Instead of improving one department, the player begins managing an entire business.

This marks one of the largest perspective shifts in the game.

---

## Fantasy

"I run my own QA company."

Success is no longer measured by personal productivity.

It is measured by organizational success.

---

## Gameplay Role

Company Management becomes the highest organizational gameplay layer before Prestige.

It coordinates multiple lower-level systems.

---

## Core Loop

```text
Grow Company
        ↓
Expand Operations
        ↓
Complete Major Contracts
        ↓
Increase Reputation
        ↓
Invest In Business
        ↓
Grow Again
```

---

## Inputs

- Money
- Company Reputation
- Team
- Contracts
- Office
- Executive Decisions

---

## Outputs

- Company Growth
- New Opportunities
- Larger Contracts
- Long-Term Progression
- Prestige Preparation

---

## Unlock Conditions

Unlocked when the player establishes their own QA company.

The transition should feel like leaving employment behind.

---

## Progression

Company Management evolves from:

```text
Small Company
        ↓
Growing Business
        ↓
Industry Leader
        ↓
International Organization
        ↓
Global QA Corporation
```

---

## Player Decisions

Examples include:

- growth vs stability;
- expansion vs optimization;
- hiring vs automation;
- prestige vs continued investment.

---

## Interaction with Other Systems

Coordinates:

- Contracts
- Office
- Team
- Automation
- Reputation
- Events

Produces:

- Company Reputation
- Business Progression

---

## Emotional Goal

The player should feel ownership.

The company becomes a reflection of every decision made throughout the game.

---

## Future Expansion

Potential additions:

- acquisitions;
- subsidiaries;
- regional management;
- international markets;
- interplanetary expansion.

---

# Prestige

## Purpose

Prestige provides long-term replayability.

Rather than ending progression, it transforms one completed career into the foundation of the next.

Prestige exists to reward mastery, not repetition.

---

## Fantasy

"I've already built one successful career.

Now I can build an even greater one."

Prestige represents accumulated experience rather than lost progress.

---

## Gameplay Role

Prestige resets temporary progression while preserving meaningful long-term advancement.

It extends the lifespan of every other gameplay system.

---

## Core Loop

```text
Reach Prestige
        ↓
Review Rewards
        ↓
Begin New Career
        ↓
Progress Faster
        ↓
Unlock New Possibilities
        ↓
Reach Greater Scale
```

---

## Inputs

- Career Completion
- Company Development
- Long-Term Achievements

---

## Outputs

- Permanent Progress
- New Unlocks
- Meta Progression
- Stronger Future Runs

---

## Unlock Conditions

Unlocked after the player reaches the intended career milestone.

Prestige should never feel mandatory.

It should feel desirable.

---

## Progression

Each Prestige cycle expands the player's long-term possibilities.

Rather than repeating identical gameplay, every new run should introduce new strategic depth.

---

## Player Decisions

The player decides:

- when to prestige;
- what goals to complete beforehand;
- whether immediate rewards outweigh future potential.

---

## Interaction with Other Systems

Prestige touches nearly every gameplay system.

It resets many systems while permanently enhancing future progression.

---

## Emotional Goal

The player should feel excitement rather than loss.

Prestige should communicate:

> "I'm beginning a better career."

not

> "I'm starting over."

---

## Future Expansion

Future documents may introduce:

- prestige paths;
- prestige challenges;
- legacy bonuses;
- permanent unlock trees;
- alternative career routes.

---

# Achievements

## Purpose

Achievements celebrate meaningful accomplishments.

They acknowledge mastery, experimentation and long-term dedication.

Achievements should reward memorable moments rather than repetitive grinding.

---

## Fantasy

"My career is recognized."

The player builds a professional legacy.

---

## Gameplay Role

Achievements reinforce exploration and encourage players to engage with multiple systems.

They should complement progression rather than replace it.

---

## Core Loop

```text
Play Naturally
        ↓
Reach Milestone
        ↓
Unlock Achievement
        ↓
Receive Recognition
        ↓
Continue Journey
```

---

## Inputs

- Gameplay
- Career Progress
- System Mastery
- Hidden Discoveries

---

## Outputs

- Recognition
- Rewards
- Collection Progress
- Completion Goals

---

## Unlock Conditions

Achievements become available immediately.

Additional categories unlock alongside new gameplay systems.

---

## Progression

Achievement categories grow together with the game.

Examples:

- Career
- Testing
- Team
- Automation
- Contracts
- Company
- Prestige
- Hidden Secrets

---

## Player Decisions

Players may choose to:

- ignore achievements;
- pursue completion;
- discover hidden objectives;
- optimize achievement routes.

---

## Interaction with Other Systems

Achievements observe nearly every gameplay system.

They rarely influence gameplay directly.

Instead they celebrate interaction with existing systems.

---

## Emotional Goal

The player should occasionally think:

> "I didn't even know that was possible."

Achievements should reinforce discovery and pride.

---

## Future Expansion

Possible additions:

- secret achievements;
- humorous achievements;
- community challenges;
- career collections;
- legacy achievements.

---
# Events

## Purpose

The Events System introduces unpredictability into the otherwise predictable progression loop.

Its purpose is to create memorable moments, encourage adaptation and make the world feel alive.

Events should never exist to randomly punish the player.

Instead, they should create interesting opportunities, temporary challenges or humorous situations inspired by software development.

---

## Fantasy

"Every workday is different."

Unexpected bugs appear.

Deadlines change.

Developers accidentally break production.

Clients change priorities.

The QA world continues evolving even when the player's strategy remains the same.

---

## Gameplay Role

Events temporarily influence one or more gameplay systems.

Unlike permanent progression, Events create short-term decision making.

They encourage the player to react rather than simply optimize.

---

## Core Loop

```text
Event Appears
        ↓
Player Evaluates Situation
        ↓
Choose Response
        ↓
Temporary Gameplay Changes
        ↓
Receive Outcome
        ↓
Return To Normal Progression
```

---

## Inputs

- Career Progress
- Contracts
- Reputation
- Company Development
- Time
- Special Conditions

---

## Outputs

- Temporary Bonuses
- Temporary Penalties
- Resources
- Reputation Changes
- Unique Opportunities
- Story Moments

---

## Unlock Conditions

Simple Events may appear early.

More complex Events unlock naturally alongside larger gameplay systems.

Late-game Events should involve multiple systems simultaneously.

---

## Progression

Events evolve together with the player's responsibilities.

```text
Personal Events
        ↓
Team Events
        ↓
Department Events
        ↓
Company Events
        ↓
Industry Events
        ↓
Global Events
```

The scale of Events should always match the player's current Career.

---

## Player Decisions

Examples include:

- accept risk or play safely;
- invest resources now for larger future rewards;
- prioritize one system over another;
- delay long-term plans to handle immediate problems.

---

## Interaction with Other Systems

Events may temporarily influence:

- Manual Testing
- Bug Reporting
- Team
- Automation
- Contracts
- Reputation
- Office
- Company Management

Events intentionally avoid becoming their own progression system.

They amplify existing gameplay instead.

---

## Emotional Goal

The player should feel:

> "Something unexpected happened."

Events should create memorable stories without disrupting long-term progression.

---

## Future Expansion

Possible additions:

- software release disasters;
- hackathons;
- conferences;
- critical production bugs;
- client emergencies;
- humorous workplace situations;
- April Fools events;
- seasonal events.

---

# Offline Progress

## Purpose

Offline Progress rewards preparation rather than absence.

Its purpose is to ensure the player's systems continue working while they are away without replacing active gameplay.

Returning to the game should always create meaningful decisions.

---

## Fantasy

"My QA organization kept working while I was away."

The player feels that their career continues even when they are not actively playing.

---

## Gameplay Role

Offline Progress connects active sessions together.

It bridges breaks in gameplay and reinforces the idle nature of QA Idle.

---

## Core Loop

```text
Leave Game
        ↓
Systems Continue Working
        ↓
Return
        ↓
Collect Offline Progress
        ↓
Invest Resources
        ↓
Continue Playing
```

---

## Inputs

- Automation Coverage
- Team Output
- Company Systems
- Offline Bonuses

---

## Outputs

- Bugs
- Money
- Reputation
- Contract Progress
- Other Passive Resources

---

## Unlock Conditions

Basic Offline Progress becomes available early.

Its effectiveness naturally improves as larger gameplay systems unlock.

---

## Progression

Offline Progress evolves together with passive production.

Manual work contributes less over time.

Automation and organizational systems become increasingly important.

The player should feel rewarded for building efficient systems.

---

## Player Decisions

Examples include:

- invest in offline efficiency;
- prioritize active or passive progression;
- prepare systems before leaving.

---

## Interaction with Other Systems

Depends primarily on:

- Team
- Automation
- Company
- Upgrades

Supports:

Nearly every resource-producing system.

---

## Emotional Goal

Returning should feel rewarding.

The player should immediately think:

> "Great. Now what should I build next?"

rather than

> "The game played itself."

---

## Future Expansion

Potential additions:

- smarter offline simulations;
- event interaction;
- prestige bonuses;
- advanced idle optimization.

---

# Statistics

## Purpose

Statistics record the player's career history.

They provide visibility into progression without directly affecting gameplay.

Statistics help players appreciate how far they have come.

---

## Fantasy

"My entire QA career has been documented."

The player builds a permanent record of accomplishments.

---

## Gameplay Role

Statistics provide information, comparison and historical context.

They support achievements, progression review and long-term motivation.

---

## Core Loop

```text
Play Game
        ↓
Generate Statistics
        ↓
Review Progress
        ↓
Set New Goals
```

---

## Inputs

Every gameplay system.

---

## Outputs

Career history.

Personal milestones.

Historical records.

Player insights.

---

## Unlock Conditions

Basic statistics exist from the beginning.

Advanced categories appear alongside new gameplay systems.

---

## Progression

Statistics naturally expand.

Examples:

- Bugs Found
- Reports Submitted
- Money Earned
- Promotions
- Team Size
- Automation Coverage
- Contracts Completed
- Prestige Cycles

The statistics menu should grow together with the game.

---

## Player Decisions

Statistics rarely require direct decisions.

Instead, they influence future goals through self-reflection.

---

## Interaction with Other Systems

Statistics observe nearly every gameplay system.

They intentionally avoid modifying gameplay directly.

---

## Emotional Goal

The player should occasionally open Statistics and think:

> "I can't believe I've done all of that."

---

## Future Expansion

Potential additions:

- lifetime graphs;
- career timeline;
- company history;
- comparison between Prestige runs;
- humorous career records.

---

# Unlock System

## Purpose

The Unlock System controls how gameplay complexity is introduced.

Its purpose is not to unlock content for the sake of progression.

Its purpose is to preserve discovery.

The player should never feel overwhelmed by seeing every mechanic from the beginning.

Instead, the game gradually reveals itself as the player's career evolves.

---

## Fantasy

"My career keeps opening new opportunities."

Every unlock represents increased responsibility rather than arbitrary progression.

---

## Gameplay Role

The Unlock System coordinates the appearance of:

- gameplay systems;
- UI panels;
- resources;
- upgrades;
- mechanics;
- tutorials;
- achievements;
- events.

It acts as the central orchestration layer of the game's progression.

---

## Core Loop

```text
Meet Unlock Conditions
        ↓
Reveal New Gameplay
        ↓
Learn New Mechanics
        ↓
Master System
        ↓
Prepare For Next Unlock
```

---

## Inputs

- Career
- Promotion
- Reputation
- Progression
- Achievements
- System Mastery

---

## Outputs

- New Systems
- New Resources
- UI Expansion
- New Decisions
- Tutorials
- Discovery Moments

---

## Unlock Conditions

Every unlock should be justified by the player's career growth.

Unlocks should never exist solely because the player accumulated enough resources.

Responsibility should always come before complexity.

---

## Progression

Every gameplay system follows the same lifecycle.

```text
Hidden
        ↓
Teased
        ↓
Unlocked
        ↓
Expanded
        ↓
Mastered
        ↓
Integrated
```

This lifecycle should remain consistent throughout the game.

---

## Player Decisions

The Unlock System intentionally minimizes player choice.

Its purpose is pacing rather than optimization.

The player's decisions occur inside unlocked systems rather than within the Unlock System itself.

---

## Interaction with Other Systems

The Unlock System coordinates every major gameplay system.

It does not replace them.

Instead, it determines when they become available.

Because of this, it has dependencies on nearly every other system while remaining relatively passive during normal gameplay.

---

## Emotional Goal

The player should repeatedly experience:

> "I didn't know the game could do this."

The Unlock System is the primary driver of surprise and long-term curiosity.

---

## Future Expansion

Future documents may extend the Unlock System through:

- hidden discoveries;
- branching unlock paths;
- prestige-exclusive mechanics;
- secret systems;
- alternate career routes;
- late-game expansion layers.

---
# 6. System Dependency Map

The following map illustrates the high-level relationships between all major gameplay systems.

The purpose of this diagram is **not** to show every possible dependency.

Instead, it defines the primary gameplay flow and the architectural hierarchy of QA Idle.

Future documents should remain consistent with these relationships.

---

## Primary Gameplay Flow

```text
Manual Testing
        ↓
Bug Reporting
        ↓
Money
        ↓
Upgrades
        ↓
Higher Manual Efficiency
        ↓
Promotion
        ↓
Career Expansion
        ↓
Unlock New Gameplay Systems
```

This is the foundation of the entire game.

Every future gameplay layer expands this loop rather than replacing it.

---

## Team Progression

```text
Money
        ↓
Team
        ↓
Team Output
        ↓
More Bugs
        ↓
Bug Reporting
        ↓
More Money
```

The Team System transforms personal productivity into organizational productivity.

---

## Automation Progression

```text
Money
        ↓
Automation
        ↓
Automation Coverage
        ↓
Passive Production
        ↓
Offline Progress
        ↓
More Resources
```

Automation complements Team rather than replacing it.

---

## Professional Growth

```text
Manual Testing
        ↓
Bug Reporting
        ↓
Reputation
        ↓
Promotion
        ↓
Career
        ↓
New Responsibilities
```

Professional Reputation measures trust rather than economic success.

---

## Company Growth

```text
Career
        ↓
Founder
        ↓
Company Management
        ↓
Office
        ↓
Larger Team
        ↓
Larger Contracts
        ↓
Company Reputation
```

The player's perspective gradually shifts from employee to organization owner.

---

## Contract Loop

```text
Contracts
        ↓
Use Existing Systems
        ↓
Meet Requirements
        ↓
Receive Rewards
        ↓
Expand Company
        ↓
Unlock Better Contracts
```

Contracts consume the player's organizational strength and reward strategic growth.

---

## Prestige Loop

```text
Career
        ↓
Company
        ↓
Prestige
        ↓
Permanent Progress
        ↓
Stronger New Career
        ↓
Repeat
```

Prestige transforms completed careers into stronger future playthroughs.

---

## Resource Architecture

Resources intentionally connect otherwise independent gameplay systems.

```text
Systems
        ↓
Resources
        ↓
Systems
```

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
Upgrades
        ↓
Manual Testing
```

Every major gameplay loop should follow this philosophy whenever possible.

---

## Unlock Flow

The Unlock System coordinates gameplay complexity.

```text
Career
        ↓
Promotion
        ↓
Unlock System
        ↓
New UI
        ↓
New Resources
        ↓
New Systems
        ↓
New Decisions
```

This ensures that complexity follows responsibility.

---

## Event Interaction

Events temporarily modify existing systems.

```text
Events
        ↓
Temporary Modifiers
        ↓
Existing Systems
        ↓
Gameplay Variation
```

Events should amplify gameplay rather than replacing core mechanics.

---

## Statistics Relationship

Statistics observe gameplay but do not actively influence it.

```text
Every Gameplay System
        ↓
Statistics
        ↓
Career History
```

Statistics remain intentionally passive.

---

## Complete System Overview

```text
                 Career
                    │
                    ▼
              Promotion
                    │
                    ▼
             Unlock System
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
 Manual Testing   Team     Automation
        │           │           │
        └──────┬────┴────┬──────┘
               ▼
         Bug Reporting
               │
               ▼
             Money
               │
               ▼
           Upgrades
               │
               ▼
      Improved Production
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
 Reputation  Contracts  Office
      │        │         │
      └────────┼─────────┘
               ▼
      Company Management
               │
               ▼
     Company Reputation
               │
               ▼
           Prestige
               │
               ▼
     Permanent Progress
```

This diagram should remain the highest-level architectural overview of QA Idle.

Every future gameplay system should integrate into this structure instead of creating parallel progression paths.

---

# 7. Source of Truth

Every gameplay system has exactly one authoritative design document.

That document becomes the Single Source of Truth.

Other documents may reference the system but should never redefine its behavior.

| Gameplay System | Source Document |
|-----------------|-----------------|
| Manual Testing | 06 - Game Systems.md / 08-MVP_Vertical_Slice_Specification.md |
| Bug Reporting | 06 - Game Systems.md / 08-MVP_Vertical_Slice_Specification.md |
| Modifier System | 09 - Modifier System.md |
| Economy | 10 - Economy Framework.md |
| Money | 10 - Economy Framework.md / 11 - Resource System.md |
| Resources | 11 - Resource System.md |
| Resource balances and transactions | 11 - Resource System.md |
| Resource-derived lifetime counters | 11 - Resource System.md as progression/statistics data |
| Upgrades | 12 - Upgrade System.md |
| Upgrade content ownership | Owning gameplay system via 12 - Upgrade System.md registry rules |
| Unlock System | 13 - Unlock System.md |
| Promotion | 14 - Promotion System.md |
| Career | 04 - Career System.md |
| Progression Rules | 05 - Progression.md |
| Emotional Pacing | 03 - Player Journey.md |
| Core Gameplay Loop | 02 - Core Gameplay Loop.md |
| Vision | 01 - Vision.md |
| Technical Rules | 07 - Technical Rules.md |
| MVP Scope | 08-MVP_Vertical_Slice_Specification.md |
| Team | Future Team document |
| Reputation | Future Reputation document |
| Automation | Future Automation document |
| Contracts | Future Contracts document |
| Office | Future Office document |
| Company Management | Future Company document |
| Prestige | Future Prestige document |
| Achievements | Future Achievements document |
| Events | Future Events document |
| Offline Progress | Future Offline Progress document |
| Statistics | Future Statistics document |
| UI Expansion | Future UI document |
| UI Components | Future UI component document |
| Art Direction | Future art direction document |

---

# 8. Architectural Principles

The following principles define how every gameplay system should be designed throughout the lifetime of QA Idle.

## 8.1 Systems Solve Problems

Every gameplay system must exist because it solves a gameplay problem.

No mechanic should exist simply because it appears in other idle games.

Whenever a new system is proposed, it should answer:

> "What player problem does this solve?"

If no meaningful answer exists, the mechanic should be reconsidered.

---

## 8.2 Systems Create Decisions

A gameplay system should increase the number of interesting decisions rather than merely increasing production.

The player should frequently ask:

- What should I improve next?
- Which investment is more valuable?
- Which responsibility should I prioritize?
- Which long-term strategy fits my goals?

If a system never changes player decisions, it provides little strategic value.

---

## 8.3 Systems Expand the Career Fantasy

Every gameplay system should reinforce the fantasy of building the ultimate QA career.

Examples:

- Manual Testing reinforces learning.
- Team reinforces leadership.
- Automation reinforces engineering.
- Company reinforces ownership.
- Prestige reinforces legacy.

The fantasy should always evolve together with gameplay.

---

## 8.4 Systems Grow Through Responsibility

Gameplay complexity should always follow responsibility.

The player should never unlock advanced mechanics simply because enough time has passed.

Instead:

```text
Greater Responsibility
        ↓
New Gameplay Layer
        ↓
New Decisions
        ↓
Greater Responsibility
```

This keeps progression intuitive and believable.

---

## 8.5 Discovery Is More Valuable Than Numbers

The strongest reward in QA Idle is discovering something new.

Numbers support progression.

Discovery creates progression.

Whenever possible, new systems should change how the player thinks rather than simply how much they produce.

---

## 8.6 Architecture Before Content

New features should always integrate into the existing architecture.

No future mechanic should bypass the established relationships between systems without a strong design reason.

Maintaining architectural consistency is more valuable than adding isolated content quickly.

---

## 8.7 Single Source of Truth

Each gameplay system has exactly one document responsible for its complete specification.

Other documents should reference that specification instead of duplicating it.

This minimizes contradictions and greatly simplifies future maintenance.

---

# 9. Conclusion

Game Systems serves as the architectural foundation of QA Idle.

It defines:

- what gameplay systems exist;
- why they exist;
- how they interact;
- how they evolve;
- which document owns each system.

This document intentionally avoids implementation details, balancing and technical specifications.

Its responsibility is to ensure that every future design document follows a shared architectural vision.

Whenever a new gameplay mechanic is proposed, it should first be validated against the principles established here.

If it strengthens the overall ecosystem, reinforces the QA career fantasy and integrates naturally with existing systems, it belongs in QA Idle.

If it exists only to increase numbers or duplicate existing functionality, it should be redesigned or rejected.

The long-term goal is to build a game where progression comes not from endless numerical growth, but from an ever-expanding network of meaningful gameplay systems that evolve together with the player's career.

---