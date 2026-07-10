# 05 - Progression

## Document Status

**Project:** QA Idle

**Document Type:** Progression Design Document

**Owner Role:** Senior Game Designer

**Status:** Frozen v1.0

**Depends On:**

- README.md
- 01 - Vision.md
- 02 - Core Gameplay Loop.md
- 03 - Player Journey.md
- 04 - Career System.md

This document defines the overall progression philosophy of QA Idle.

It describes how the player's growth should feel throughout the entire game, how progression should be paced, how new gameplay layers should appear, and how long-term motivation should be maintained.

This document intentionally does **not** define:

- economy values;
- upgrade prices;
- production formulas;
- progression numbers;
- balancing;
- technical implementation.

Its purpose is to establish the design philosophy behind progression so every future system follows the same rhythm.

---

# Designer Notes

The following proposals are **not part of the current design**.

They are design ideas that should be evaluated before implementation.

---

# DN-01 — Alternative Progression Curve

## Proposal

Instead of treating progression as a continuous increase in production, progression should follow repeating psychological waves.

Each wave represents a complete emotional cycle.

```text
New Discovery
        ↓
Learning
        ↓
Optimization
        ↓
Mastery
        ↓
Comfort
        ↓
Plateau
        ↓
Anticipation
        ↓
Major Unlock
        ↓
Repeat
```

The player should repeatedly experience the feeling of entering an unfamiliar system, learning it, mastering it, becoming comfortable with it and finally feeling ready for something bigger.

Progression therefore becomes a sequence of evolving gameplay chapters rather than a single infinitely growing curve.

### Pros

- Creates a satisfying long-term rhythm.
- Makes progression feel intentional instead of repetitive.
- Supports Player Journey and Career System naturally.
- Prevents constant reward inflation.
- Helps designers plan meaningful pacing.

### Cons

- Requires careful economy pacing.
- Poorly timed plateaus may feel frustrating.
- Every career stage must justify its own learning cycle.

---

# DN-03 — Soft Caps vs Hard Caps

## Proposal

Progression should naturally encourage players toward newer mechanics instead of forcing them through artificial limitations.

Older systems should gradually become less efficient compared to newly unlocked systems, while always remaining technically usable.

For example:

The player may continue investing in Manual Testing forever.

However, Automation eventually becomes significantly more effective.

The game never says:

> "You can no longer use Manual Testing."

Instead it communicates:

> "There are now smarter ways to achieve your goals."

Progression should guide behavior rather than restrict it.

### Pros

- Preserves player freedom.
- Keeps early mechanics emotionally relevant.
- Reduces frustration.
- Fits the philosophy that responsibility grows naturally.

### Cons

- Requires more balancing effort.
- Some players may intentionally ignore stronger systems.

---

# DN-05 — Macro WOW Budget

## Proposal

Every career stage should have a limited "WOW Budget."

Large discoveries lose their impact if they happen too frequently.

Each stage should instead contain a carefully planned rhythm:

- several small improvements;
- a few medium discoveries;
- one major gameplay transformation.

The largest surprise should redefine how the player thinks about the game.

That moment should become the emotional highlight of the stage.

The goal is to preserve excitement even after dozens of hours.

### Pros

- Prevents discovery fatigue.
- Makes major unlocks memorable.
- Supports UI growth philosophy.
- Gives future designers clear pacing guidelines.

### Cons

- Requires discipline when adding new features.
- Interesting mechanics may need to be delayed to preserve pacing.

---

# 1. Purpose

The purpose of the Progression document is to define **the rhythm of the entire game**.

Economy determines **how much** the player earns.

Career defines **who** the player becomes.

Player Journey defines **what** the player feels.

Progression defines **when** all of those changes should happen.

Because of this, Progression becomes the document that synchronizes every other major design document.

Whenever another document introduces:

- a new mechanic;
- a new resource;
- a new UI panel;
- a new responsibility;
- a new career stage;

Progression determines **the correct moment** for its introduction.

The player should never feel overwhelmed.

Likewise, the player should never feel that nothing interesting is happening.

Progression is therefore the rhythm that keeps QA Idle engaging from the first click to the latest prestige cycle.

---

# 2. Progression Philosophy

Progression in QA Idle is not defined by increasing numbers.

It is defined by increasing possibilities.

The player should rarely think:

> "I now earn twice as much."

Instead they should think:

> "I can play the game differently now."

Every progression milestone should increase one or more of the following:

- responsibility;
- decision-making;
- strategic depth;
- system interaction;
- gameplay variety;
- player fantasy.

Whenever possible, progression should introduce a **new way to think**, not simply a faster way to produce resources.

The ultimate goal is that the player remembers promotions because of what changed, not because of how much production increased.

---

# 3. Player Progression Curve

The progression curve follows repeating emotional waves.

Each wave consists of eight phases.

```text
Discovery
      ↓
Learning
      ↓
Experimentation
      ↓
Optimization
      ↓
Mastery
      ↓
Comfort
      ↓
Anticipation
      ↓
Major Unlock
```

Every career stage should complete this cycle before the next stage begins.

Skipping phases weakens progression.

For example:

If new mechanics appear before the player understands the previous ones, the game becomes overwhelming.

If mastery lasts too long, progression becomes repetitive.

If anticipation is too short, promotions lose emotional impact.

The quality of progression therefore depends more on **timing** than on **content quantity**.

---

# 4. Core Progression Principles

## 4.1 Progression Is Built Around Discovery

The strongest reward is discovering something new.

Numbers support progression.

Discovery creates progression.

Every major gameplay layer should answer the player's curiosity while immediately creating a new mystery.

The player should repeatedly think:

> "I didn't know the game could do this."

---

## 4.2 Learning Comes Before Complexity

Every newly unlocked system should begin simple.

Only after the player understands its purpose should additional interactions appear.

Complexity should emerge gradually.

Never instantly.

---

## 4.3 Mastery Must Exist

A mechanic should remain relevant long enough for the player to understand it.

Players should have time to feel competent before another major system appears.

Without mastery, every unlock feels temporary.

---

## 4.4 Plateaus Are Intentional

Not every session should contain exciting discoveries.

Periods of stability allow players to:

- optimize;
- understand systems;
- experiment;
- appreciate previous rewards.

Plateaus are part of progression rather than signs of poor pacing.

---

## 4.5 Every Plateau Must End With Something Worth Waiting For

Whenever progression intentionally slows down, the player should already know that something meaningful is approaching.

Waiting without visible purpose creates frustration.

Waiting with anticipation creates motivation.

---

## 4.6 Progression Must Continuously Change Player Identity

The player should repeatedly transition between identities.

Examples:

```text
Beginner
      ↓
Professional
      ↓
Expert
      ↓
Leader
      ↓
Executive
      ↓
Founder
      ↓
Industry
      ↓
Planet
```

The player's identity should evolve as often as their production grows.

---

# 5. Early Game Progression

The early game exists to establish trust.

The player should quickly understand:

- what the game is;
- why actions matter;
- how progression works;
- what promotion means.

Early progression should emphasize:

- clarity;
- frequent feedback;
- visible improvement;
- fast discoveries;
- minimal complexity.

Almost every upgrade should teach a new idea.

Almost every session should end with meaningful progress.

Curiosity is more important than optimization.

The player should leave the early game believing:

> "If the beginning is already this interesting, I want to see what comes later."

---

# 6. Mid Game Progression

The mid game shifts progression from discovery toward optimization.

The player already understands the foundations.

Now they begin connecting systems together.

Progression slows slightly.

Decision-making becomes deeper.

The player starts thinking less about individual upgrades and more about long-term efficiency.

This is where:

- Team;
- Automation;
- Reputation;
- Process Management;

begin interacting.

The emotional goal changes from:

> "I found something new."

to:

> "I built something that works."

The player should increasingly feel ownership over their growing QA ecosystem.

---

# 7. Late Game Progression

Late-game progression should focus on strategic scale rather than production scale.

By now the player expects new mechanics.

Simply introducing additional currencies is no longer enough.

Late progression should instead transform perspective.

Instead of managing individuals, the player manages organizations.

Instead of optimizing production, the player optimizes entire systems.

Every unlock should represent a broader level of responsibility.

The player should repeatedly feel:

> "I am no longer playing the same game I started."

Progression must continue surprising experienced players without abandoning the familiar rhythm established during the early game.

---

# 8. Progression by Career Stage

Every career stage should follow the same progression structure.

```text
Promotion
        ↓
Major Discovery
        ↓
Learning
        ↓
Optimization
        ↓
Mastery
        ↓
Comfort
        ↓
Plateau
        ↓
Anticipation
        ↓
Next Promotion
```

Although mechanics change dramatically between career stages, the emotional rhythm should remain consistent.

This consistency allows the player to subconsciously understand the pace of the game while still feeling surprised by each new responsibility.# 9. Unlock Pacing

Unlocks are the heartbeat of progression.

Every unlock should feel meaningful.

The player should never unlock several major systems at the same time, because each new mechanic deserves attention.

Likewise, the player should never spend too long without discovering something new.

The ideal pacing alternates between:

- small rewards;
- medium rewards;
- major transformations.

The player should repeatedly experience the following rhythm:

```text
Small Upgrade
      ↓
Small Upgrade
      ↓
Medium Unlock
      ↓
Optimization
      ↓
Major Career Unlock
      ↓
Learning
      ↓
Repeat
```

Major unlocks should redefine gameplay.

Small unlocks should improve existing gameplay.

Medium unlocks should connect existing systems together.

Every unlock should answer one question while creating another.

---

# 10. Discovery Pacing

Discovery is the strongest long-term motivation in QA Idle.

Progression should always leave the player feeling that there is another layer waiting to be uncovered.

Discovery should happen on multiple scales.

## Micro Discovery

Examples:

- a new upgrade;
- a new achievement;
- a new QA tool;
- a humorous flavor text;
- a better optimization strategy.

Micro discoveries keep short sessions satisfying.

---

## Medium Discovery

Examples:

- a new resource;
- a new upgrade category;
- a new production source;
- a new UI panel.

These discoveries redefine part of the current gameplay loop.

---

## Major Discovery

Major discoveries fundamentally change how the player thinks about the game.

Examples:

- Team
- Automation
- Reputation
- Contracts
- Company Management
- Prestige

A major discovery should always create a strong emotional reaction.

The player should immediately think:

> "Everything feels different now."

---

# 11. Progression Plateaus

Plateaus are intentional periods of stability.

They are not signs that progression has stopped.

Instead, they exist to allow the player to:

- understand new mechanics;
- optimize decisions;
- experiment with strategies;
- enjoy growing production;
- prepare emotionally for the next discovery.

Without plateaus, the player becomes overwhelmed.

Without discoveries, the player becomes bored.

The balance between these two states defines the quality of progression.

Every plateau should have a visible purpose.

The player should always understand what they are working toward.

---

# 12. Catch-up Mechanics

Returning players should never feel punished.

Instead, the game should help them quickly reconnect with progression.

Catch-up mechanics should reduce unnecessary repetition without removing meaningful gameplay.

Possible examples include:

- stronger offline gains after long absences;
- accelerated early-game progression after Prestige;
- permanent quality-of-life improvements;
- improved automation efficiency;
- simplified early decisions for experienced players.

Catch-up systems should respect the player's previous accomplishments.

They should never trivialize the game.

---

# 13. Offline Progression

Offline progression exists to reward planning rather than absence.

The player should feel:

> "My QA systems kept working while I was away."

Offline progression should never become the primary source of advancement.

Instead, it should prepare the next active session.

When returning, the player should immediately have meaningful decisions to make.

Offline progression should therefore create opportunities rather than complete the game automatically.

The ideal return loop is:

```text
Return
      ↓
Collect Offline Progress
      ↓
Review Changes
      ↓
Spend Resources
      ↓
Unlock Something
      ↓
Set Next Goal
```

---

# 14. Promotion Pacing

Promotions are the largest milestones in QA Idle.

A promotion should never feel like a simple increase in income.

Every promotion should satisfy four conditions.

## 14.1 Mechanical Reward

The player unlocks something fundamentally new.

---

## 14.2 Psychological Reward

The player feels that their career has evolved.

---

## 14.3 Visual Reward

The interface visibly grows.

The player's workspace becomes larger because their responsibilities became larger.

---

## 14.4 Strategic Reward

The player gains new decisions.

A promotion should never reduce decision-making.

It should expand it.

The ideal promotion creates excitement before it happens and satisfaction after it happens.

---

# 15. Prestige Progression

Prestige represents the completion of one career rather than the end of the game.

The player should reach Prestige because they are excited about beginning another journey.

Not because progression became impossible.

Prestige should satisfy three emotional goals.

## Completion

"I achieved something meaningful."

---

## Confidence

"I know how to progress much faster this time."

---

## Curiosity

"What else becomes possible after Prestige?"

Prestige should feel like evolution rather than reset.

The player should never regret choosing it.

---

# 16. Long-Term Retention

Long-term retention should come from curiosity instead of obligation.

The game should avoid forcing daily logins.

Instead, the player should naturally want to return because there is something exciting waiting.

Examples include:

- an upcoming promotion;
- an unfinished contract;
- an affordable upgrade;
- a nearly completed automation milestone;
- a Prestige opportunity.

The player should return because they are interested.

Not because they are afraid of missing rewards.

---

# 17. Session-to-Session Progression

Every play session should answer three questions.

## What changed?

The player immediately notices progress.

---

## What can I do now?

The player has meaningful decisions available.

---

## What do I want next?

The player leaves with a clear future objective.

A successful session usually ends with one of the following thoughts:

> "One more promotion."

> "One more upgrade."

> "Next time I'll unlock something big."

---

# 18. New Player Experience

New players should experience rapid progression with minimal complexity.

The first hours establish trust.

The player should quickly understand:

- the core gameplay loop;
- the purpose of Bugs;
- the purpose of Money;
- why promotions matter;
- that the game constantly evolves.

Most importantly, the player should realize that QA Idle is not a traditional clicker.

The first major unlock should permanently change that expectation.

---

# 19. Veteran Player Experience

Experienced players should enjoy increasingly deeper optimization.

Veteran progression should emphasize:

- strategic planning;
- system interaction;
- efficient investment;
- long-term goals;
- Prestige planning.

The challenge should come from making better decisions.

Not from repetitive grinding.

Veteran players should feel rewarded for understanding how the game's systems interact.

---

# 20. Progression Design Rules

Every future progression feature should follow these rules.

## Rule 1

Progression exists to unlock possibilities, not only increase numbers.

---

## Rule 2

Every major mechanic should justify its place by changing gameplay.

---

## Rule 3

Discovery is more valuable than production.

---

## Rule 4

Every major unlock should have its own learning period.

---

## Rule 5

Plateaus are intentional and should always prepare the player for something meaningful.

---

## Rule 6

Old mechanics should remain emotionally relevant even when they are no longer optimal.

---

## Rule 7

Progression should encourage rather than force player behavior.

---

## Rule 8

The interface should evolve together with progression.

---

## Rule 9

Every career stage should contain one memorable "WOW" moment.

---

## Rule 10

Progression should repeatedly make the player feel smarter, more capable and more responsible.

---

# 21. Requirements for Future Documents

Every future design document must respect the progression philosophy established here.

Future systems should define:

- when they unlock;
- why they unlock at that moment;
- which progression phase they belong to;
- how they contribute to the current gameplay rhythm;
- which previous systems they interact with;
- which future systems they prepare.

No new mechanic should exist in isolation.

Every feature must strengthen the overall progression rhythm.

Future documents should never introduce mechanics simply because they are interesting.

They should exist because the player's career, responsibilities and understanding of the game have naturally evolved to support them.

Ultimately, progression should remain the invisible structure connecting every system in QA Idle.

The player should not consciously notice this structure.

They should simply feel that every new responsibility arrives exactly when they are ready for it.