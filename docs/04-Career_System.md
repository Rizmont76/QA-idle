# 04 - Career System

## Document Status

**Project:** QA Idle

**Document Type:** Career Progression Design Document

**Owner Role:** Senior Game Designer

**Status:** Frozen v1.0

**Depends On:**

* README.md
* 01 - Vision.md
* 02 - Core Gameplay Loop.md
* 03 - Player Journey.md

This document defines the complete career progression system of QA Idle.

It describes how the player's role evolves throughout the game, how promotions transform gameplay, and how every career stage expands the overall game experience.

This document intentionally does **not** define:

* economy values;
* upgrade costs;
* numerical balancing;
* formulas;
* UI layouts;
* technical implementation.

Its purpose is to establish the design philosophy behind career progression so every future system follows the same vision.

---

# Designer Notes

The following proposals are **not part of the current design**.

They are design ideas that should be evaluated before implementation.

---

# DN-01 — Career Eras

## Proposal

Instead of viewing progression as a long list of promotions, divide the entire game into large "Career Eras".

Example:

```
Personal Career
        ↓
Executive Career
        ↓
Business Expansion
        ↓
Global Expansion
        ↓
Planetary Expansion
        ↓
Interplanetary Expansion
        ↓
Beyond
```

Each era would represent a fundamental shift in the fantasy of the game.

Instead of asking:

> "What rank comes next?"

The player gradually asks:

> "What kind of game am I playing now?"

---

### Example

### Personal Career

Focus:

* learning QA;
* personal productivity;
* promotions;
* tools;
* manual testing.

Fantasy:

> "I want to become a better QA."

---

### Executive Career

Focus:

* people;
* management;
* automation;
* departments.

Fantasy:

> "I want my entire QA organization to perform better."

---

### Business Expansion

Focus:

* clients;
* contracts;
* offices;
* company growth.

Fantasy:

> "I own a successful QA business."

---

### Global Expansion

Focus:

* multiple companies;
* international markets;
* worldwide quality standards.

Fantasy:

> "Companies around the world depend on my QA."

---

### Planetary Expansion

Focus:

Increasingly humorous progression.

Examples:

* testing autonomous cities;
* planetary release management;
* QA for global infrastructure.

Fantasy:

> "I maintain software quality for an entire planet."

---

### Interplanetary Expansion

The game's scale becomes intentionally absurd.

Examples:

* Mars;
* lunar colonies;
* deep-space software;
* AI civilizations.

Fantasy:

> "Humanity cannot launch anything without my QA."

---

### Beyond

The game fully embraces absurd escalation.

Reality is no longer the design constraint.

The only rule is that the player's responsibility keeps expanding.

---

## Pros

* Gives the game clear macro structure.
* Helps pacing feel intentional.
* Makes transitions between realistic and absurd gameplay smoother.
* Allows UI, economy and progression to evolve in chapters.
* Supports long-term content planning.

---

## Cons

* Adds another layer of terminology.
* Risks making promotions feel less important if eras become the primary milestones.
* Requires careful pacing so era transitions feel earned.

---

# DN-02 — Every Promotion Changes the Player's Primary Question

## Proposal

Every promotion should fundamentally change the question the player asks while playing.

The reward is not only:

> "Now I produce more."

The reward is:

> "Now I think differently."

The player's mental model should evolve throughout the career.

---

### Example

**Junior QA**

Primary Question:

> "How do I find more bugs?"

---

**Middle QA**

Primary Question:

> "How do I improve my workflow?"

---

**Senior QA**

Primary Question:

> "How do I build better QA systems?"

---

**QA Lead**

Primary Question:

> "How do I make my team more effective?"

---

**Head of QA**

Primary Question:

> "How do I coordinate multiple teams?"

---

**Director**

Primary Question:

> "How do I improve quality across the company?"

---

**CTO**

Primary Question:

> "What investments produce the biggest long-term impact?"

---

**Founder**

Primary Question:

> "How do I grow an entire QA business?"

---

**Multiple Companies**

Primary Question:

> "Which company deserves my attention?"

---

**Planetary QA**

Primary Question:

> "How do I coordinate quality at planetary scale?"

---

**Interplanetary QA**

Primary Question:

> "How do I keep impossible systems under control?"

---

## Pros

* Makes promotions memorable.
* Prevents promotions from becoming simple multipliers.
* Creates natural gameplay evolution.
* Helps economy, UI and progression stay aligned.
* Encourages meaningful new mechanics.

---

## Cons

* Every promotion requires stronger design effort.
* Some transitions may require larger tutorial moments.
* Difficult to maintain across dozens of future ranks.

---

# 1. Purpose

The purpose of the Career System document is to define how the player evolves throughout QA Idle.

Career progression is not simply a reward structure.

Career progression **is the game**.

Every major system should exist because the player's responsibilities changed.

Every promotion should answer one question:

> "What does my new job allow me to do that I could never do before?"

If a promotion only increases production numbers, it has failed its purpose.

---

# 2. Career Design Philosophy

QA Idle is built around one fundamental belief:

> **Every promotion should feel like starting a new profession rather than receiving a better salary.**

The player should repeatedly experience:

```
Learn current role
        ↓
Master current role
        ↓
Receive promotion
        ↓
Discover completely new gameplay
        ↓
Learn new responsibilities
        ↓
Master new profession
        ↓
Repeat
```

Career progression is therefore the main pacing mechanism of the game.

---

# 3. Core Career Principles

## 3.1 Promotion Is the Primary Reward

The biggest reward in QA Idle is not Money.

It is not Reputation.

It is not Automation.

The biggest reward is receiving a promotion.

Everything else exists to support that moment.

---

## 3.2 New Rank = New Profession

Every rank should introduce a different fantasy.

The player should not feel like:

> "I am still doing the same job, but faster."

Instead they should feel:

> "I have a completely different job now."

---

## 3.3 Previous Systems Never Become Worthless

New systems should never invalidate previous gameplay.

Instead:

```
Manual Testing
        ↓
supports Team

Team
        ↓
supports Automation

Automation
        ↓
supports Management

Management
        ↓
supports Company

Company
        ↓
supports Global Expansion
```

Old systems remain emotionally relevant while newer systems become strategically dominant.

---

## 3.4 Responsibility Always Grows

Power should always come together with responsibility.

Higher ranks should require:

* more decisions;
* broader thinking;
* larger systems;
* greater optimization.

Never simply larger numbers.

---

## 3.5 UI Mirrors Career Growth

The interface should visually represent promotions.

A Junior QA should see a small personal workspace.

A QA Lead should see management tools.

A Founder should see business dashboards.

The player should understand their career level simply by looking at the interface.

---

## 3.6 Discovery Drives Progression

The strongest motivation is curiosity.

Every promotion should answer one mystery while creating another.

The player should constantly think:

> "If this promotion changed the game so much... what happens at the next one?"

---

# 4. Career Structure

The intended career path is:

```
Junior QA
        ↓
Middle QA
        ↓
Senior QA
        ↓
QA Lead
        ↓
Head of QA
        ↓
Director of QA
        ↓
CTO
        ↓
Founder of QA Company
        ↓
Multiple QA Companies
        ↓
Global QA Organization
        ↓
Planetary QA
        ↓
Interplanetary QA
        ↓
Beyond...
```

The first half of the career remains relatively grounded.

The second half gradually embraces increasingly exaggerated and humorous scales while preserving the same core fantasy:

> "My responsibility keeps growing."

---

# 5. Prestige Philosophy

Prestige becomes available after the player reaches **QA Lead** for the first time.

From a narrative perspective, the player is unexpectedly fired.

They lose their position and must begin their career again.

Mechanically, this is a soft reset.

Emotionally, however, it should feel completely different.

The player is no longer a beginner.

They have experience.

They know:

* which upgrades matter;
* how promotions work;
* how to optimize growth;
* what lies ahead.

Prestige should therefore communicate:

> "I've already lived this career once. This time I can build it much better."

The reset should create confidence rather than frustration.

---

# 6. Career Stage Template

Every career stage in QA Idle should be documented using the same structure.

Each stage must define:

* Fantasy
* Responsibilities
* Gameplay Role
* Primary Question
* New Mechanics
* New Resources
* UI Changes
* New Decisions
* Main Motivation
* Transition Goals
* Emotional Goal

Using a consistent structure makes future balancing, implementation and documentation significantly easier.

---

# 7. Career Stages

---

# Junior QA

## Fantasy

The player is a new QA Engineer.

Everything feels personal, understandable and hands-on.

The player personally discovers bugs and slowly earns recognition.

---

## Responsibilities

* Test features manually.
* Find bugs.
* Report bugs.
* Learn the workflow.
* Improve personal efficiency.

---

## Gameplay Role

Individual contributor.

Everything depends on the player's own actions.

Manual testing is the center of the experience.

---

## Primary Question

> "How do I find bugs faster?"

---

## New Mechanics

* Manual Testing
* Bug Reporting
* Basic Upgrades
* Money
* Promotion Goals

---

## New Resources

* Bugs Found
* Money

---

## UI Changes

The smallest interface in the entire game.

Only the essential information is visible.

The player should feel like they are sitting at a single workstation.

---

## New Decisions

* Which upgrade to buy first?
* Spend or save?
* Improve testing or reporting?

---

## Main Motivation

Become a competent QA.

---

## Transition Goals

Learn the core gameplay loop and earn the first promotion.

---

## Emotional Goal

Curiosity.

Confidence.

"I understand how QA works."

---

# Middle QA

## Fantasy

The player is no longer a beginner.

They understand the basics and begin working together with others.

The career starts feeling larger than one person.

---

## Responsibilities

* Improve productivity.
* Collaborate.
* Begin mentoring.
* Handle more complex work.

---

## Gameplay Role

Transition from purely personal production toward supported production.

---

## Primary Question

> "How can I work more efficiently instead of simply working harder?"

---

## New Mechanics

* First Team Systems
* Passive Production
* Mentoring
* Team-related Upgrades

---

## New Resources

Potential introduction of Team Output.

---

## UI Changes

The interface grows for the first time.

A dedicated team-related area appears.

The player immediately understands:

> "My workplace became bigger."

---

## New Decisions

* Personal upgrades or team investment?
* Manual work or passive growth?
* Expand today or save for promotion?

---

## Main Motivation

Build a workflow that scales beyond personal effort.

---

## Transition Goals

Prepare for becoming a trusted professional.

---

## Emotional Goal

Relief.

Growth.

"I don't have to do everything myself anymore."

---

# Senior QA

## Fantasy

The player becomes an expert.

Instead of simply performing QA work, they begin improving how QA itself is done.

Professional mastery replaces basic execution.

---

## Responsibilities

* Optimize quality processes.
* Introduce automation.
* Improve testing strategies.
* Build professional credibility.

---

## Gameplay Role

Systems Optimizer.

The player now thinks about efficiency rather than activity.

---

## Primary Question

> "How do I build better QA systems?"

---

## New Mechanics

* Reputation
* Automation
* Advanced QA Tools
* Process Optimization

---

## New Resources

* Reputation
* Automation Coverage

---

## UI Changes

The workspace evolves into a professional QA toolkit.

Multiple specialized panels become available.

The interface now reflects expertise instead of experience alone.

---

## New Decisions

* Reputation or Money?
* Automation or Team?
* Immediate gains or long-term efficiency?

---

## Main Motivation

Become recognized as an elite QA Engineer.

---

## Transition Goals

Develop leadership skills and prepare for managing people.

---

## Emotional Goal

Professional pride.

Mastery.

"I know what I'm doing—and I know how to improve it."

---

# QA Lead

## Fantasy

The player stops measuring success by personal productivity.

Their success is now measured by the success of the entire team.

The fantasy shifts from:

> "I find bugs."

to:

> "I create an environment where great QA happens."

---

## Responsibilities

* Lead people.
* Organize processes.
* Improve team performance.
* Remove bottlenecks.
* Balance priorities.

---

## Gameplay Role

People Manager.

The player becomes responsible for multiplying the effectiveness of others.

---

## Primary Question

> "How do I make my team more effective?"

---

## New Mechanics

* Advanced Team Management
* Process Policies
* Leadership Systems
* Team Performance

---

## New Resources

* Expanded Team Output
* Team Efficiency
* Leadership-related progression

---

## UI Changes

The interface transforms into a management dashboard.

Personal production panels become less visually dominant.

Leadership tools take center stage.

---

## New Decisions

* Hire or train?
* Process or tooling?
* Short-term delivery or long-term quality?
* Team expansion or automation investment?

---

## Main Motivation

Build the strongest QA team possible.

---

## Transition Goals

Expand influence beyond a single team.

Prepare for organization-level responsibility.

---

## Emotional Goal

Ownership.

Responsibility.

Pride in helping others succeed.

---

# Head of QA

## Fantasy

The player is no longer responsible for a single team.

They are now responsible for the quality direction of an entire department.

The fantasy shifts from:

> "I manage my team."

to:

> "I build the QA organization."

---

## Responsibilities

* Coordinate multiple QA teams.
* Define QA standards.
* Allocate department resources.
* Improve cross-team collaboration.
* Deliver organization-wide quality.

---

## Gameplay Role

Department Architect.

The player begins optimizing entire departments instead of individual teams.

---

## Primary Question

> "How do I make every QA team perform at its best?"

---

## New Mechanics

* Multiple Teams
* Department Policies
* Cross-Team Optimization
* Department Objectives
* Company-wide QA Standards

---

## New Resources

* Department Capacity
* Organizational Reputation

---

## UI Changes

The interface expands into a department dashboard.

Multiple teams become visible simultaneously.

The player now sees the organization instead of individuals.

---

## New Decisions

* Which team receives more investment?
* Standardize or specialize?
* Hire more people or improve existing teams?

---

## Main Motivation

Create the most efficient QA department possible.

---

## Transition Goals

Become responsible for company-wide quality.

---

## Emotional Goal

Authority.

Influence.

"My decisions affect hundreds of people."

---

# Director of QA

## Fantasy

Quality is no longer one department.

Quality becomes company strategy.

The player influences every software product.

---

## Responsibilities

* Manage company-wide QA.
* Balance priorities between products.
* Coordinate releases.
* Work with executives.
* Protect company reputation.

---

## Gameplay Role

Strategic Executive.

The player makes high-level decisions with long-term consequences.

---

## Primary Question

> "How should the company invest in quality?"

---

## New Mechanics

* Company-wide Strategy
* Product Portfolio
* Executive Decisions
* Large Contracts
* Company KPIs

---

## New Resources

* Company Reputation
* Strategic Influence

---

## UI Changes

The interface becomes executive-focused.

Strategic dashboards replace operational views.

---

## New Decisions

* Invest in automation or expansion?
* Grow faster or improve quality?
* Focus on reputation or revenue?

---

## Main Motivation

Become indispensable to the company.

---

## Transition Goals

Reach executive leadership.

---

## Emotional Goal

Strategic thinking.

Confidence.

"I shape the future of the company."

---

# CTO

## Fantasy

The player becomes responsible for technology itself.

QA is now only one part of a much larger ecosystem.

The player decides how technology evolves.

---

## Responsibilities

* Define technology vision.
* Balance engineering investments.
* Scale infrastructure.
* Coordinate long-term development.

---

## Gameplay Role

Technology Executive.

---

## Primary Question

> "Which decisions create the greatest long-term impact?"

---

## New Mechanics

* Executive Investments
* Technology Strategy
* Infrastructure Scaling
* Company Expansion Preparation

---

## New Resources

* Executive Budget
* Technology Influence

---

## UI Changes

Executive dashboards gain financial and strategic panels.

The player no longer focuses on operations.

---

## New Decisions

* Expand or optimize?
* Build internally or outsource?
* Short-term profit or long-term growth?

---

## Main Motivation

Prepare to build something of your own.

---

## Transition Goals

Leave employment behind.

Create your own company.

---

## Emotional Goal

Power.

Vision.

"I could build something even greater myself."

---

# Founder of QA Company

## Fantasy

The player is no longer climbing someone else's career ladder.

They have created their own company.

Everything now belongs to them.

---

## Responsibilities

* Acquire clients.
* Expand the business.
* Hire leaders.
* Build company reputation.
* Grow revenue.

---

## Gameplay Role

Business Owner.

---

## Primary Question

> "How do I build the best QA company?"

---

## New Mechanics

* Company Management
* Clients
* Offices
* Business Expansion
* High-Level Contracts

---

## New Resources

* Company Reputation
* Business Revenue

---

## UI Changes

The interface transforms into a company management system.

Personal career panels become secondary.

Business systems dominate the screen.

---

## New Decisions

* Open another office?
* Hire executives?
* Enter new markets?
* Focus on enterprise clients?

---

## Main Motivation

Build a successful QA business.

---

## Transition Goals

Expand beyond a single company.

---

## Emotional Goal

Ownership.

Freedom.

"This company exists because I built it."

---

# Multiple QA Companies

## Fantasy

The player is no longer running a company.

They manage an entire network of companies.

---

## Responsibilities

* Coordinate multiple businesses.
* Allocate investments.
* Balance specialization.
* Expand globally.

---

## Gameplay Role

Business Network Manager.

---

## Primary Question

> "Which company should grow next?"

---

## New Mechanics

* Multiple Companies
* Global Markets
* Company Synergies
* Shared Resources

---

## New Resources

* Global Revenue
* Corporate Influence

---

## UI Changes

The interface evolves into a portfolio management view.

Multiple companies appear simultaneously.

---

## New Decisions

* Expand an existing company?
* Create a new specialization?
* Merge companies?
* Enter another continent?

---

## Main Motivation

Create the largest QA business network.

---

## Transition Goals

Become the global standard for software quality.

---

## Emotional Goal

Scale.

Ambition.

"I own an industry."

---

# Global QA Organization

## Fantasy

Companies around the world depend on your organization.

Quality becomes an international system.

---

## Responsibilities

* Coordinate worldwide QA.
* Standardize processes.
* Support global software releases.

---

## Gameplay Role

Global Coordinator.

---

## Primary Question

> "How do I maintain quality across the world?"

---

## New Mechanics

* Global Standards
* Regional Offices
* Worldwide Contracts
* International Coordination

---

## New Resources

* Global Influence

---

## UI Changes

A world-scale interface appears.

The game clearly leaves realistic company management behind.

---

## New Decisions

* Expand into new regions?
* Improve worldwide standards?
* Balance continents?

---

## Main Motivation

Become the world's quality authority.

---

## Transition Goals

Expand beyond Earth.

---

## Emotional Goal

Prestige.

Global recognition.

---

# Planetary QA

## Fantasy

Entire civilizations rely on your QA systems.

The game's humor begins fully embracing absurdity.

---

## Responsibilities

* Planet-wide releases.
* Planetary infrastructure.
* AI ecosystems.
* Mega-scale quality systems.

---

## Gameplay Role

Planetary Architect.

---

## Primary Question

> "How do I coordinate quality for an entire planet?"

---

## New Mechanics

* Planet-scale Infrastructure
* Mega Projects
* Planetary Releases

---

## New Resources

* Planetary Stability

---

## UI Changes

The interface shifts from business dashboards toward planetary management.

---

## New Decisions

* Prioritize infrastructure?
* Improve planetary automation?
* Prepare for interplanetary expansion?

---

## Main Motivation

Push beyond realistic limits.

---

## Transition Goals

Take QA beyond Earth.

---

## Emotional Goal

Wonder.

Humor.

"I can't believe this game became this."

---

# Interplanetary QA

## Fantasy

Human civilization spans multiple worlds.

Everything depends on your QA organization.

---

## Responsibilities

* Coordinate multiple planets.
* Maintain interplanetary systems.
* Prevent catastrophic failures.

---

## Gameplay Role

Interplanetary Director.

---

## Primary Question

> "How do I keep impossible systems working together?"

---

## New Mechanics

* Planet Networks
* Space Infrastructure
* Interplanetary Logistics

---

## New Resources

* Galactic Reputation

---

## UI Changes

The interface becomes intentionally epic while remaining readable.

---

## New Decisions

* Colonize?
* Optimize?
* Standardize?
* Expand?

---

## Main Motivation

Reach the ultimate scale.

---

## Transition Goals

Go beyond known civilization.

---

## Emotional Goal

Awe.

Achievement.

Legacy.

---

# Beyond...

## Fantasy

Reality is no longer a limitation.

Every new promotion exists to surprise the player.

The only rule is:

**The next rank must feel impossible until it becomes real.**

---

# Career Transition Rules

Every promotion should satisfy all of the following:

* Introduces at least one new mechanic.
* Changes the player's primary question.
* Expands the interface.
* Increases responsibility.
* Creates at least one meaningful decision.
* Reinforces the current fantasy.
* Generates curiosity about the next promotion.

If a promotion fails any of these goals, it should be redesigned.

---

# Career Technical Contract

The Career System owns the authoritative Career runtime state.

MVP implementation must provide a `CareerRegistry` containing every valid Career Stage definition by stable stage ID.

Saved Career state must include:

```text
CareerState.currentStageId
```

The Career System owns persistence for `CareerState.currentStageId` and any future Career history fields. Other systems may read Career state but must not write it directly.

Career transitions must go through a public service operation equivalent to:

```text
CareerService.activateStage(stageId, reason)
```

`CareerService.activateStage` is responsible for validating that `stageId` exists in `CareerRegistry`, that the requested transition is legal for the provided reason, and that the resulting saved Career state is deterministic.

Promotion may request this operation, but Career performs the validation and writes the committed Career state.

After a successful committed transition, Career emits:

- `career.stageChanged`

The event payload must include previous stage ID, new stage ID and reason.

Failed validation must leave `CareerState.currentStageId` unchanged and must not emit `career.stageChanged`.

---

# Relationship with Other Systems

The Career System drives every major design discipline.

## Economy

Economy supports career progression.

Career does not exist to support economy.

---

## Progression

Progression exists to deliver promotions at satisfying intervals.

---

## UI Bible

The interface expands only when the player's career expands.

---

## Features

Every new feature should answer:

> "Which career stage needs this?"

Not:

> "Would this be cool to add?"

---

## Codex

Implementation follows documentation.

Career documentation is the source of truth.

---

# Prestige Revisited

Prestige is not retirement.

Prestige is accumulated experience.

The player loses position.

They do **not** lose knowledge.

The emotional message should always be:

> "This career made me smarter."

Every prestige cycle should make early promotions feel familiar while revealing new possibilities later.

---

# Career Design Rules

Future career stages should always follow these principles:

1. Bigger responsibility is more valuable than bigger multipliers.
2. New mechanics are more exciting than new currencies.
3. UI growth is part of progression.
4. Previous mechanics remain relevant.
5. Discovery is the strongest reward.
6. Every promotion changes how the player thinks.
7. Humor grows together with the scale.
8. Realism slowly transitions into absurdity.
9. The player should always understand their current objective.
10. Every rank should feel worthy of celebration.

---

# Requirements for Future Documents

Future documentation should respect the Career System.

Economy, Progression, UI, Features and Codex should never introduce mechanics that contradict career fantasy.

Every document should ask:

* Does this reinforce the player's current profession?
* Does this create better decisions?
* Does this make the promotion feel meaningful?
* Does this strengthen discovery?

If the answer is no, the feature should be reconsidered.

---

# Final Career Statement

Career progression is the foundation of QA Idle.

The player does not simply earn more resources.

They become a different professional.

Every promotion changes:

* what the player does;
* what the player thinks about;
* what decisions they make;
* what systems they manage;
* what the interface looks like;
* what the game feels like.

The player begins by manually finding a single bug.

They finish by becoming responsible for quality at a scale beyond imagination.

The career itself is the reward.

The promotion itself is the content.

The next job is always more exciting than the next multiplier.
