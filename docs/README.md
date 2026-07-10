# QA Idle

> **QA Idle** — це incremental (idle) гра про кар'єрний шлях QA Engineer: від Junior Manual QA до CTO власної QA-компанії.

---

# Vision

Гравець починає як Junior QA, який вручну знаходить баги та отримує за це гроші.

Поступово він:

- стає Middle QA;
- збирає власну команду;
- відкриває Automation;
- керує QA-відділом;
- працює з великими клієнтами;
- створює власну QA-компанію;
- проходить Prestige та починає новий цикл із бонусами.

Основна мета гри — не просто збільшувати числа, а створити відчуття реального кар'єрного росту.

---

# Core Design Principles

- Простий старт.
- Кожен новий ранг відкриває новий шар гри.
- Гравець ніколи не бачить майбутні механіки завчасно.
- Інтерфейс росте разом із персонажем.
- Idle-механіки повинні залишатися зрозумілими.
- Кожне відкриття має викликати відчуття "вау".

---

# Current Project Status

## Current State

Pre-implementation / implementation-ready.

Production Documentation is complete and documents 00-14 are the current source of truth. MVP implementation has not started yet.

## Source of Truth

- 00 - Master Project Roadmap.md
- 01 - Vision.md
- 02 - Core Gameplay Loop.md
- 03 - Player Journey.md
- 04 - Career System.md
- 05 - Progression.md
- 06 - Game Systems.md
- 07 - Technical Rules.md
- 08-MVP_Vertical_Slice_Specification.md
- 09 - Modifier System.md
- 10 - Economy Framework.md
- 11 - Resource System.md
- 12 - Upgrade System.md
- 13 - Unlock System.md
- 14 - Promotion System.md

---

# Documentation Structure

```
00 - Master Project Roadmap
01 - Vision
02 - Core Gameplay Loop
03 - Player Journey
04 - Career System
05 - Progression
06 - Game Systems
07 - Technical Rules
08-MVP_Vertical_Slice_Specification
09 - Modifier System
10 - Economy Framework
11 - Resource System
12 - Upgrade System
13 - Unlock System
14 - Promotion System
```

---

# Additional Directories

```
concepts/
```

UI mockups, concept art, wireframes.

---

```
prompts/
```

Reusable prompts for ChatGPT and Codex.

---

```
decisions/
```

Design decisions with explanations.

Example:

Decision-001.md

Why Team unlocks only after Middle QA.

---

```
ideas/
```

Future mechanics.

Nothing inside this folder is considered part of the current game until documented.

---

```
assets/
```

Icons

Illustrations

Fonts

UI resources

---

# Development Workflow

Every feature must follow this pipeline:

```
Idea
    ↓
Discussion
    ↓
Documentation
    ↓
UI Mockup
    ↓
Economy Design
    ↓
Implementation (Codex)
    ↓
Testing
    ↓
Iteration
```

Implementation never comes before documentation.

---

# Rules for Codex

When implementing new functionality:

- Always read the relevant documentation first.
- Never invent new mechanics that are not documented.
- Follow the existing UI style.
- Reuse components whenever possible.
- Keep UI and game logic separated.
- Keep code modular.
- Keep the project scalable.

---

# Project Goal

The goal is to create a polished incremental game where the player experiences the full career path of a QA Engineer while gradually unlocking entirely new gameplay systems instead of only increasing numbers.

The player should constantly feel:

"I've reached the next stage of my career."

rather than

"My numbers became bigger."

---

Last Updated:
Documentation v1.0 Freeze