# 02 - Core Gameplay Loop

## Document Status

**Project:** QA Idle  
**Document Type:** Core Game Design Document  
**Owner Role:** Senior Game Designer  
**Status:** Frozen v1.0  
**Depends On:**  
- README.md  
- 01 - Vision.md  

This document defines the core gameplay loop of QA Idle.

It must be treated as the main foundation for future documents related to economy, progression, career systems, UI unlocks, upgrades, automation, team management, contracts, prestige and long-term scaling.

This document does not define final balance values.  
Exact numbers, formulas, prices and timing curves should be defined later in the Economy and Progression documents.

---

## 1. Purpose of the Core Gameplay Loop

The purpose of the core gameplay loop is to describe what the player repeatedly does, why those actions are satisfying, how those actions generate progress, and how the game gradually evolves as the player advances through a QA career.

QA Idle is not built around a single static loop that only increases numbers forever.

Instead, the game uses a layered loop structure:

1. A simple manual QA loop at the beginning.
2. A resource conversion loop after the player starts earning money.
3. A career progression loop based on promotions.
4. A team and automation loop in the mid-game.
5. A management and contract loop in the late-game.
6. A prestige loop for long-term replay.

The player should always feel that they are advancing in their QA career, not only increasing production values.

---

## 2. Core Loop Summary

At the highest level, the game follows this loop:

```text
Find Bugs
    ↓
Report Bugs
    ↓
Earn Money / Reputation / Progress
    ↓
Buy Upgrades
    ↓
Improve QA Efficiency
    ↓
Reach Promotion Requirements
    ↓
Unlock New Career Stage
    ↓
Unlock New Gameplay Layer
    ↓
Repeat With Expanded Systems
```

This loop must remain understandable at every stage of the game.

Even when more systems are unlocked, the player should still understand the basic relationship:

**Better QA work creates more value, and more value allows career growth.**

---

## 3. Core Player Actions

The core gameplay loop is built around several recurring player actions.

### 3.1 Manual Testing

Manual testing is the first and most basic action in the game.

The player manually performs QA work by pressing a button such as:

- Run QA Test
- Test Feature
- Find Bugs

This action generates **Bugs Found**.

Manual testing represents the player personally testing software, finding issues, checking edge cases and performing hands-on QA work.

At the start of the game, manual testing is the main source of progress.

Over time, manual testing should become less dominant, but never completely meaningless.

It should remain:

- useful at the start;
- emotionally important as the player's origin;
- optionally relevant through upgrades, achievements or special mechanics;
- weaker than team and automation systems in the mid and late game.

### 3.2 Reporting Bugs

Finding bugs alone is not enough.

The player must convert found bugs into value by reporting them.

Reporting bugs converts **Bugs Found** into **Money** or other progression value.

This creates an important early-game rhythm:

```text
Click to find bugs
    ↓
Accumulate bugs
    ↓
Report bugs
    ↓
Earn money
    ↓
Buy upgrades
```

This conversion step helps the game feel like QA work rather than abstract number generation.

The player is not simply producing currency.  
They are finding bugs, documenting them and receiving career value from that work.

### 3.3 Buying Upgrades

Money is primarily used to buy upgrades.

Upgrades improve the player's ability to generate bugs, report bugs or unlock new forms of efficiency.

Early upgrades should be simple and understandable.

Examples:

- Better Checklist
- Coffee
- Keyboard Shortcuts
- Bug Report Template
- Test Case Library
- Browser Matrix
- DevTools Mastery

Upgrades should not only be numerical.

Each upgrade should communicate a small piece of QA fantasy.

The player should feel:

> "I became better at my job."

not only:

> "+10% production."

### 3.4 Reaching Promotion Requirements

Promotions are the main structural milestones of QA Idle.

A promotion is not just a stat increase.

A promotion should usually unlock:

- a new gameplay system;
- a new UI panel or tab;
- a new resource;
- a new decision type;
- a new responsibility level;
- a new fantasy of work.

The player should always understand what they are working toward.

Each stage should clearly show the next major goal, but future hidden systems should not be shown too early.

Example:

```text
Current Rank: Junior QA
Next Promotion: Middle QA
Requirements:
- Earn enough Money
- Find enough total Bugs
- Buy enough basic QA upgrades
Reward:
- Unlock Team
```

The reward can be teased in a limited way, but the full system should only appear after promotion.

---

## 4. Primary Resources

This document defines the role of each major resource in the loop.

Exact formulas are not defined here.

### 4.1 Bugs Found

**Bugs Found** is the first resource the player interacts with.

It represents issues discovered through testing.

Main sources:

- manual testing;
- QA team members;
- automation;
- contracts;
- special events;
- future advanced systems.

Main uses:

- reporting for money;
- fulfilling promotion requirements;
- completing contracts;
- unlocking achievements;
- feeding future progression systems.

Bugs Found should feel like the most iconic resource of the game.

### 4.2 Money

**Money** is the first major spendable currency.

It represents salary, rewards, budget, freelance income or business revenue depending on the player's career stage.

Main sources:

- reporting bugs;
- team output;
- contracts;
- company systems;
- offline progress.

Main uses:

- buying upgrades;
- hiring team members;
- improving tools;
- unlocking career requirements;
- expanding company systems in later stages.

Money should be easy to understand and should remain relevant across most of the game.

### 4.3 Reputation

**Reputation** represents professional credibility.

It should appear after the player has moved beyond basic manual QA work.

Reputation can represent:

- trust from developers;
- trust from managers;
- public professional credibility;
- client confidence;
- perceived QA expertise.

Main sources:

- consistent bug reporting;
- high-value bugs;
- automation milestones;
- contracts;
- achievements;
- promotion milestones.

Main uses:

- unlocking automation upgrades;
- unlocking advanced career stages;
- gaining better contracts;
- improving team effectiveness;
- enabling prestige or company systems later.

Reputation should not feel like another version of Money.

Money buys tools.  
Reputation opens doors.

### 4.4 Automation Coverage

**Automation Coverage** represents the percentage or strength of the product covered by automated testing.

It should become important after the player reaches a more advanced QA role.

Main sources:

- automation upgrades;
- test framework investments;
- CI/CD improvements;
- automation engineers;
- nightly regression systems.

Main effects:

- passive bugs per second;
- offline progress improvement;
- reporting efficiency;
- contract completion support;
- advanced multipliers.

Automation should shift the game from manual effort to system design.

### 4.5 Team Output

Team Output represents the combined work of hired QA team members.

It can be expressed directly as passive bugs per second or through a separate internal production value.

Main sources:

- Junior QA hires;
- Middle QA hires;
- Automation QA hires;
- QA Leads;
- process upgrades;
- morale systems.

Main effects:

- passive bug generation;
- faster contract progress;
- scaling beyond the player's manual work;
- unlocking management fantasy.

Team Output should gradually become a main production source after the player is promoted beyond individual contributor roles.

### 4.6 Company Reputation

**Company Reputation** is a late-game or prestige-related resource.

It represents the market position of the player's QA company.

Main sources:

- completing major contracts;
- founding a company;
- prestige;
- office expansion;
- global QA systems.

Main uses:

- permanent bonuses;
- prestige rewards;
- unlocking larger scale progression;
- accessing absurd late-game layers.

Company Reputation should support the transition from personal career growth to organizational dominance.

---

## 5. Loop Layers by Career Stage

QA Idle should not show all systems at once.

The core loop expands as the player's career evolves.

Each career stage should add a new layer to the loop while keeping the previous layer understandable.

---

## 6. Stage 1: Junior QA Loop

### 6.1 Player Fantasy

The player is a Junior Manual QA.

They are learning the basics, manually testing features and reporting bugs.

The game should feel small, clear and direct.

### 6.2 Available Systems

At this stage, the player should mainly see:

- Bugs Found;
- Money;
- manual testing button;
- report bugs button;
- basic upgrade shop;
- simple stats;
- next promotion goal.

No team management, automation, contracts or prestige should be visible yet.

### 6.3 Main Loop

```text
Run QA Test
    ↓
Gain Bugs Found
    ↓
Report Bugs
    ↓
Gain Money
    ↓
Buy Manual Upgrades
    ↓
Find Bugs Faster
    ↓
Reach Middle QA Requirements
```

### 6.4 Design Goals

The Junior QA loop should:

- be understandable in seconds;
- teach the basic resource conversion;
- make the player feel personally involved;
- create the first satisfaction of upgrade growth;
- prepare the player for promotion.

### 6.5 What This Stage Should Avoid

This stage should avoid:

- too many resources;
- complex UI;
- hidden formulas;
- too many upgrade categories;
- early automation;
- team management;
- contract complexity.

The player should feel like they are starting their career, not managing a company.

---

## 7. Stage 2: Middle QA Loop

### 7.1 Player Fantasy

The player is no longer only a beginner.

They understand QA basics and start getting access to more responsibility.

This is the first point where the game may introduce early team-related systems.

### 7.2 New Layer

The Middle QA stage should introduce the idea that progress can come from more than manual clicking.

Possible unlock:

- Team panel;
- first QA assistant;
- passive bug generation;
- simple hiring or mentoring system.

### 7.3 Main Loop

```text
Manual Testing + Team Output
    ↓
Generate Bugs
    ↓
Report Bugs
    ↓
Earn Money
    ↓
Hire / Improve Team
    ↓
Increase Passive Bug Generation
    ↓
Reach Senior QA Requirements
```

### 7.4 Design Goals

The Middle QA loop should:

- reduce dependence on manual clicking;
- introduce idle progression clearly;
- make the player feel promoted;
- unlock a visible new UI layer;
- preserve the simple bug-to-money loop.

### 7.5 Important Rule

Team must not feel like a random factory.

It should feel like QA collaboration.

Names, upgrades and descriptions should reinforce QA work.

Examples:

- Mentor Junior QA
- Pair Testing
- Shared Test Cases
- Bug Triage Session
- Daily QA Sync

---

## 8. Stage 3: Senior QA Loop

### 8.1 Player Fantasy

The player becomes a strong individual contributor.

They are trusted, experienced and capable of improving QA systems instead of only doing more work.

### 8.2 New Layer

Senior QA should introduce deeper professional systems.

Possible unlocks:

- Reputation;
- Automation;
- advanced upgrades;
- higher-value bugs;
- better reporting efficiency.

### 8.3 Main Loop

```text
Manual Testing + Team + Automation
    ↓
Generate Bugs
    ↓
Report Bugs
    ↓
Earn Money and Reputation
    ↓
Invest in Tools and Automation
    ↓
Increase Passive and Offline Progress
    ↓
Reach QA Lead Requirements
```

### 8.4 Design Goals

The Senior QA loop should:

- introduce Reputation as professional credibility;
- make Automation feel like a new type of power;
- create new optimization decisions;
- reward players who balance money, reputation and automation;
- make the UI feel more professional.

### 8.5 Automation Role

Automation should not simply replace manual testing immediately.

It should start as a support system and grow into a major engine.

Early automation may provide:

- small bugs per second;
- reporting multipliers;
- offline progress bonuses;
- regression testing bonuses.

Later automation may become one of the strongest scaling systems.

---

## 9. Stage 4: QA Lead Loop

### 9.1 Player Fantasy

The player is now responsible for people, process and quality strategy.

The fantasy shifts from "I test features" to "I make the QA team effective."

### 9.2 New Layer

QA Lead should deepen team management.

Possible unlocks:

- team roles;
- morale;
- process upgrades;
- task assignment;
- quality strategy;
- events related to people and deadlines.

### 9.3 Main Loop

```text
Manage Team and Automation
    ↓
Generate Bugs / Quality Value
    ↓
Maintain Team Efficiency
    ↓
Earn Money and Reputation
    ↓
Improve Processes
    ↓
Unlock Larger Responsibilities
```

### 9.4 Design Goals

The QA Lead loop should:

- make team management meaningful;
- introduce decisions beyond pure production;
- increase the sense of responsibility;
- make the interface visibly more managerial;
- prepare the player for department-level systems.

### 9.5 Management Decisions

At this stage, upgrades can become less about personal tools and more about process.

Examples:

- Bug Triage Policy
- Regression Strategy
- Test Planning Standards
- QA Onboarding
- Definition of Done
- Release Checklist

These should create a sense that the player is shaping how quality works across the team.

---

## 10. Stage 5: Head of QA / Director Loop

### 10.1 Player Fantasy

The player manages QA at a larger organizational level.

They are responsible for departments, clients, releases and quality reputation.

### 10.2 New Layer

This stage should introduce larger-scale goals.

Possible unlocks:

- Contracts;
- office or department expansion;
- larger clients;
- quality KPIs;
- organizational upgrades.

### 10.3 Main Loop

```text
Manage QA Department
    ↓
Generate Bugs, Reputation and Quality Value
    ↓
Accept Contracts
    ↓
Meet Contract Requirements
    ↓
Earn Large Rewards
    ↓
Expand Department / Improve Systems
    ↓
Reach Executive Requirements
```

### 10.4 Design Goals

This loop should:

- give the player medium-term objectives;
- make progress feel less click-focused;
- introduce strategic planning;
- create larger reward moments;
- support the transition to executive or company ownership fantasy.

### 10.5 Contract Role

Contracts should act as structured goals.

A contract may require:

- enough Bugs Found;
- enough Automation Coverage;
- enough Reputation;
- enough Team Output;
- specific upgrades;
- completion within a progression threshold.

Contracts should reward:

- Money;
- Reputation;
- Company Reputation;
- unlocks;
- multipliers;
- prestige progress.

Contracts are useful because they give players goals beyond "buy the next upgrade."

---

## 11. Stage 6: CTO / Own QA Company Loop

### 11.1 Player Fantasy

The player is no longer only working inside a company.

They now control quality strategy at the highest level or create their own QA organization.

The fantasy shifts from career growth to empire building.

### 11.2 New Layer

This stage should introduce late-game systems.

Possible unlocks:

- Own QA Company;
- Company Reputation;
- multiple clients;
- offices;
- high-value contracts;
- prestige preparation.

### 11.3 Main Loop

```text
Run QA Organization
    ↓
Complete Major Contracts
    ↓
Gain Money and Company Reputation
    ↓
Expand Company Systems
    ↓
Reach Prestige Requirements
    ↓
Found / Reset / Scale Further
```

### 11.4 Design Goals

This loop should:

- make the player feel powerful;
- shift the scale from individual career to organization;
- prepare the long-term replay system;
- unlock absurd future progression naturally;
- make prestige feel earned, not forced.

---

## 12. Prestige Loop

### 12.1 Purpose of Prestige

Prestige exists to create long-term replay and allow the player to restart with permanent bonuses.

Prestige should not feel like punishment.

It should feel like founding a stronger version of the QA career.

### 12.2 Prestige Loop

```text
Reach High Career Stage
    ↓
Complete Major Requirements
    ↓
Preview Prestige Reward
    ↓
Choose Prestige
    ↓
Soft Reset Earlier Progress
    ↓
Gain Permanent Bonus
    ↓
Start New Cycle Faster
    ↓
Unlock New Possibilities
```

### 12.3 Prestige Design Rules

Prestige should:

- clearly preview rewards before reset;
- never surprise-delete progress;
- make the next run faster or deeper;
- eventually unlock new mechanics or paths;
- support the fantasy of becoming greater each cycle.

### 12.4 Prestige Rewards

Possible prestige rewards:

- Company Reputation;
- permanent bug generation multiplier;
- permanent money multiplier;
- improved automation scaling;
- faster promotions;
- new career branches;
- new absurd-scale systems.

The exact reward structure should be defined in the Prestige or Progression document.

---

## 13. Moment-to-Moment Loop

The moment-to-moment loop is what the player does during a short play session.

```text
Check current resources
    ↓
Click / collect / report
    ↓
Buy available upgrade
    ↓
Watch production increase
    ↓
Check next goal
    ↓
Repeat
```

This loop must feel satisfying even in a short session.

A player should be able to open the game, make progress and understand what changed within a few seconds.

---

## 14. Session Loop

The session loop describes what happens across a typical play session.

```text
Return to game
    ↓
Collect offline progress
    ↓
Review current goal
    ↓
Spend resources
    ↓
Unlock upgrade or promotion
    ↓
Discover new system or improve efficiency
    ↓
Leave with clear next goal
```

The player should almost always end a session with one of these feelings:

- "I got stronger."
- "I unlocked something new."
- "I know what I want next."
- "I am close to the next promotion."

---

## 15. Long-Term Loop

The long-term loop describes the player's full journey.

```text
Start as Junior QA
    ↓
Learn manual bug finding
    ↓
Earn money
    ↓
Get promoted
    ↓
Unlock team
    ↓
Unlock automation
    ↓
Manage department
    ↓
Complete contracts
    ↓
Create company
    ↓
Prestige
    ↓
Repeat with stronger foundation
```

The long-term loop must support the main fantasy:

**Start as a Junior QA. End as the greatest QA in existence.**

---

## 16. Unlock Philosophy

QA Idle should use progressive disclosure.

The player should not see every system at the start.

Instead, each stage should reveal only what is relevant now.

### 16.1 Visible From Start

At the start, the player may see:

- current bugs;
- current money;
- manual action;
- report action;
- basic upgrades;
- next promotion goal.

### 16.2 Hidden Until Relevant

The following systems should remain hidden until unlocked:

- Team;
- Automation;
- Reputation;
- Contracts;
- Company;
- Prestige;
- absurd late-game systems.

### 16.3 Why This Matters

Hiding future systems supports:

- simple onboarding;
- stronger discovery;
- cleaner UI;
- better career fantasy;
- more meaningful promotions.

The player should feel that the interface grows because their job grows.

---

## 17. Upgrade Loop

Upgrades are the primary way the player improves efficiency.

### 17.1 Upgrade Types

Upgrades may affect:

- bugs per click;
- bugs per second;
- report value;
- money gain;
- reputation gain;
- automation efficiency;
- team output;
- offline progress;
- contract speed;
- promotion requirements.

### 17.2 Upgrade Design Principles

Each upgrade should have:

- clear name;
- clear effect;
- QA-themed flavor;
- visible cost;
- visible benefit;
- predictable next step.

### 17.3 Upgrade Categories

Possible categories:

- Manual QA Upgrades;
- Reporting Upgrades;
- Tooling Upgrades;
- Team Upgrades;
- Automation Upgrades;
- Process Upgrades;
- Contract Upgrades;
- Company Upgrades;
- Prestige Upgrades.

Categories should unlock gradually.

---

## 18. Idle Progress Loop

Idle progress is essential, but it should remain understandable.

### 18.1 Passive Production

Passive production can come from:

- team members;
- automation;
- company systems;
- prestige bonuses.

### 18.2 Offline Progress

When the player returns after being away, the game should calculate progress based on active passive systems.

Offline progress should feel rewarding, but not replace active decision-making.

The player should return, collect progress and then make meaningful choices.

### 18.3 Offline Progress Sources

Possible contributors:

- team bug generation;
- automation coverage;
- nightly regression;
- contracts;
- company operations.

Manual clicking should not produce offline progress by itself unless a specific upgrade allows it.

---

## 19. Decision Loop

The game should not only ask the player to buy the cheapest upgrade.

Good idle design gives the player simple but meaningful decisions.

Examples:

```text
Do I improve manual testing or hire more team members?
Do I spend money on tools or save for promotion?
Do I invest reputation into automation or unlock a better contract?
Do I improve automation coverage or team morale?
Do I prestige now or push further?
```

The goal is not to make the game stressful.

The goal is to make optimization satisfying.

---

## 20. Feedback Loop

Every important action should produce feedback.

### 20.1 Immediate Feedback

Used for:

- clicking manual test;
- reporting bugs;
- buying upgrades;
- collecting money;
- unlocking achievements.

Feedback examples:

- number popups;
- button animation;
- small sound;
- short toast;
- resource counter movement.

### 20.2 Milestone Feedback

Used for:

- promotion;
- unlocking a new system;
- completing a contract;
- reaching prestige;
- major achievement.

Milestone feedback should feel more special.

Examples:

- modal;
- title change;
- new UI panel animation;
- short humorous message;
- new career badge;
- visible interface expansion.

### 20.3 Discovery Feedback

When a new gameplay layer appears, the player should understand what happened.

The game should briefly explain the new system without overwhelming the player.

Example:

> You are now a Middle QA. You can mentor junior testers and build your first QA team.

---

## 21. Failure and Friction

QA Idle should not be punishing.

The game should avoid:

- hard failure states;
- forced waiting timers;
- energy limits;
- irreversible mistakes;
- hidden traps;
- punishment-heavy systems.

Friction should come from optimization, not punishment.

The player may progress slower if they make inefficient decisions, but they should not feel locked out.

---

## 22. Relationship Between Systems

The game's systems should connect in a clear hierarchy.

```text
Manual QA
    ↓ supports early Bugs

Team
    ↓ adds passive Bugs

Automation
    ↓ improves passive scaling and offline progress

Reputation
    ↓ unlocks advanced systems and better opportunities

Contracts
    ↓ create medium-term goals and large rewards

Company
    ↓ expands scale and prepares prestige

Prestige
    ↓ resets with permanent growth
```

Each system should have a reason to exist.

No system should be added only because other idle games have it.

---

## 23. Core Loop Requirements for Codex

When implementing features based on this document, Codex should follow these rules:

1. Do not reveal future systems before they are unlocked.
2. Keep the early game UI minimal.
3. Every career stage should unlock either a new mechanic, a new UI layer, or a new decision type.
4. Manual clicking should be important early and gradually less central.
5. Team and automation should become core mid-game systems.
6. Reputation should act as a gate to better opportunities, not only as another currency.
7. Contracts should provide medium-term goals.
8. Prestige should be optional, previewed and rewarding.
9. UI and game logic should remain separated.
10. New systems should be documented before implementation.
11. Do not invent undocumented mechanics during implementation.
12. Preserve save/load compatibility whenever possible.

---

## 24. Out of Scope for This Document

This document does not define:

- final numeric balance;
- exact upgrade prices;
- exact production formulas;
- full promotion requirements;
- detailed UI layouts;
- art direction;
- exact achievement list;
- exact prestige reward formulas;
- monetization;
- technical architecture.

Those topics should be covered in separate documentation files.

---

## 25. Core Loop Design Summary

QA Idle is built around a simple but expandable loop:

```text
Find Bugs
    ↓
Convert Bugs into Value
    ↓
Improve QA Efficiency
    ↓
Reach Career Milestones
    ↓
Unlock New Gameplay Layers
    ↓
Scale From Individual QA to QA Empire
    ↓
Prestige and Repeat Stronger
```

The loop must always support the main identity of the game:

- career progression is the reward;
- new mechanics matter more than bigger numbers;
- the interface evolves with the player;
- each promotion should feel like a new chapter;
- the player starts as Junior QA and grows into the greatest QA in existence.
