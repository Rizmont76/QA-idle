# QA Idle Documentation Index

This index is the navigation layer for QA Idle documentation. It helps developers and AI agents load the smallest useful context for a task while keeping the numbered production documents as the source of truth.

Do not treat this index as a replacement for canonical design documents. It summarizes ownership, dependencies, and loading guidance only.

## Source Of Truth Order

1. `docs/00-Master_Project_Roadmap.md` through `docs/14-Promotion_System.md` define approved production direction.
2. `docs/07-Technical_Rules.md` defines implementation architecture and technical constraints.
3. Task backlogs and epic files define execution order but do not authorize undocumented mechanics.
4. `docs/implementation/` reports are historical implementation or audit artifacts unless a current task explicitly references them.
5. `docs/progress.txt` is a short handoff log, not canonical design.

## Status Meanings

| Status | Meaning |
|---|---|
| Living | Expected to change as roadmap, backlog, or process state changes. |
| Approved | Accepted for current planning or execution, but may be revised by later tasks. |
| Frozen | Production design source that should not change without an explicit documentation task. |
| Deprecated | Kept for history only; do not use for new work unless a task explicitly asks. |

## Production Document Index

| Document | Category | Status | Canonical Responsibility | Depends On |
|---|---|---|---|---|
| [00 - Master Project Roadmap](00-Master_Project_Roadmap.md) | Roadmap | Living | Project phase, MVP scope, milestone direction, documentation status. | None |
| [01 - Vision](01-Vision.md) | Vision | Frozen | Product fantasy, design pillars, emotional goals, long-term identity. | None |
| [02 - Core Gameplay Loop](02-Core_Gameplay%20_Loop.md) | Core Design | Frozen | Main player loop, manual actions, idle loop philosophy, action/reward rhythm. | README, Vision |
| [03 - Player Journey](03-Player_Journey.md) | Player Experience | Frozen | Career fantasy pacing, discovery moments, interface growth, session experience. | README, Vision, Core Gameplay Loop |
| [04 - Career System](04-Career_System.md) | Progression System | Frozen | Career stages, role transitions, promotion meaning, career-era structure. | README, Vision, Core Gameplay Loop, Player Journey |
| [05 - Progression](05-Progression.md) | Progression System | Frozen | Pacing, plateaus, discovery cadence, offline and prestige progression philosophy. | README, Vision, Core Gameplay Loop, Player Journey, Career System |
| [06 - Game Systems](06-Game_Systems.md) | Systems Architecture | Frozen | Gameplay system map, ownership boundaries, dependencies, lifecycle concepts. | README, Vision, Core Gameplay Loop, Player Journey, Career System, Progression |
| [07 - Technical Rules](07-Technical_Rules.md) | Technical Architecture | Frozen | Implementation rules, save/versioning expectations, ownership, events, data-driven contracts. | README, Vision, Core Gameplay Loop, Player Journey, Career System, Progression, Game Systems |
| [08 - MVP Vertical Slice Specification](08-MVP_Vertical_Slice_Specification.md) | MVP Scope | Frozen | MVP included/excluded systems, stable IDs, MVP flow, acceptance criteria. | Roadmap, Core Gameplay Loop, Career System, Progression, Game Systems, Technical Rules |
| [09 - Modifier System](09-Modifier_System.md) | Gameplay System | Frozen | Modifier registry, calculation order, modifier ownership, stat transformation rules. | Technical Rules, Game Systems, Progression, Economy Framework |
| [10 - Economy Framework](10-Economy_Framework.md) | Economy | Frozen | Resource flows, sinks, scaling philosophy, economic layers, balance guidelines. | Vision, Core Gameplay Loop, Progression, Game Systems |
| [11 - Resource System](11-Resource_System.md) | Gameplay System | Frozen | Resource definitions, transactions, visibility, save/load, MVP resources. | Game Systems, Technical Rules, Economy Framework, MVP Specification |
| [12 - Upgrade System](12-Upgrade_System.md) | Gameplay System | Frozen | Upgrade lifecycle, definitions, purchase rules, costs, modifier/resource integration. | Game Systems, Technical Rules, Modifier System, Resource System, Economy Framework |
| [13 - Unlock System](13-Unlock_System.md) | Gameplay System | Frozen | Unlock lifecycle, visibility states, requirements, transactions, UI integration. | Game Systems, Technical Rules, Career System, Progression, MVP Specification |
| [14 - Promotion System](14-Promotion_System.md) | Gameplay System | Frozen | Promotion lifecycle, requirements, transactions, rewards, system integrations. | Career System, Progression, Game Systems, Technical Rules, Resource System, Upgrade System, Unlock System |

## Supporting Document Index

| Document | Category | Status | Canonical Responsibility | Required When |
|---|---|---|---|---|
| [EPIC - AI-Assisted Repository Scalability](EPIC-AI-Assisted-Repository-Scalability.md) | Epic Backlog | Living | Repository scalability task order, dependencies, and acceptance criteria. | Working this epic or checking its task state. |
| [QA Idle MVP Implementation Backlog](QA-Idle-MVP-Implementation-Backlog.md) | Implementation Backlog | Living | MVP engineering task list, execution order, and task-level acceptance criteria. | Selecting or executing MVP backlog tasks. |
| [progress.txt](progress.txt) | Handoff Log | Living | Brief handoff notes for known local limitations or follow-up. | Continuing recent implementation work or checking unresolved handoffs. |
| [docs/implementation/](implementation/) | Implementation Reports | Approved | Completed audits and implementation reports. | A task explicitly references a report or depends on its recommendation. |

## Canonical Ownership Map

| Subject | Canonical Owner |
|---|---|
| Project phase, MVP included/excluded list, milestone status | `docs/00-Master_Project_Roadmap.md` |
| Product promise, fantasy, emotional design | `docs/01-Vision.md` |
| Manual action loop, active play loop, idle loop philosophy | `docs/02-Core_Gameplay _Loop.md` |
| Player-facing discovery, emotional pacing, interface growth | `docs/03-Player_Journey.md` |
| Career stages, career role identity, stage transitions | `docs/04-Career_System.md` |
| Progression pacing, plateaus, session-to-session growth | `docs/05-Progression.md` |
| System list, system ownership, system dependency map | `docs/06-Game_Systems.md` |
| Technical architecture, save compatibility, events, implementation readiness | `docs/07-Technical_Rules.md` |
| MVP boundaries, MVP stable IDs, vertical-slice acceptance | `docs/08-MVP_Vertical_Slice_Specification.md` |
| Gameplay stat modifiers and calculation order | `docs/09-Modifier_System.md` |
| Economy flows, sources, sinks, balance philosophy | `docs/10-Economy_Framework.md` |
| Resource registry, balances, resource transactions | `docs/11-Resource_System.md` |
| Upgrade registry, costs, purchases, upgrade effects | `docs/12-Upgrade_System.md` |
| Unlock states, visibility, unlock evaluation | `docs/13-Unlock_System.md` |
| Promotion availability, completion pipeline, promotion rewards | `docs/14-Promotion_System.md` |
| Repository scalability epic state | `docs/EPIC-AI-Assisted-Repository-Scalability.md` |
| MVP implementation task state | `docs/QA-Idle-MVP-Implementation-Backlog.md` |

Every rule should have one canonical owner. If two documents appear to conflict, follow the more specific canonical owner for that subject and record the conflict before changing behavior.

## Task Context Mapping

Use the required context first. Load optional context only when the task touches that subject or the required docs point to it. Do not load documents listed as excluded unless the task explicitly asks for them.

| Task Type | Required Context | Optional Context | Excluded By Default |
|---|---|---|---|
| Gameplay feature implementation | `AGENTS.md`, relevant system doc, `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/07-Technical_Rules.md` | `docs/06-Game_Systems.md`, `docs/02-Core_Gameplay _Loop.md`, nearest tests | Unrelated future-system docs, implementation reports |
| Gameplay balancing | `docs/10-Economy_Framework.md`, relevant system doc, `docs/05-Progression.md` | `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/09-Modifier_System.md` | Source files unrelated to tuned values |
| Formula changes | `docs/09-Modifier_System.md`, relevant system doc, `docs/07-Technical_Rules.md` | `docs/10-Economy_Framework.md`, nearest logic tests | UI-only docs and unrelated backlog files |
| UI implementation | `AGENTS.md`, `docs/03-Player_Journey.md`, `docs/13-Unlock_System.md`, relevant mechanic doc | `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/07-Technical_Rules.md`, `src/main.tsx`, `src/styles.css` | Unrelated economy or future-system docs |
| Visual design documentation | `docs/03-Player_Journey.md`, relevant feature doc | `docs/01-Vision.md`, `docs/08-MVP_Vertical_Slice_Specification.md` | Production source files unless documenting implemented UI |
| Persistence changes | `AGENTS.md`, `docs/07-Technical_Rules.md`, relevant system doc | `docs/08-MVP_Vertical_Slice_Specification.md`, `src/save.ts`, `src/types.ts`, `src/save.test.ts` | Unrelated UI docs |
| Save migration changes | `AGENTS.md`, `docs/07-Technical_Rules.md`, relevant system doc, `src/save.ts`, `src/types.ts`, `src/save.test.ts` | `docs/11-Resource_System.md`, `docs/12-Upgrade_System.md`, `docs/13-Unlock_System.md`, `docs/14-Promotion_System.md` as applicable | Unrelated gameplay source |
| Upgrade changes | `AGENTS.md`, `docs/12-Upgrade_System.md`, `docs/09-Modifier_System.md`, `docs/11-Resource_System.md`, `docs/08-MVP_Vertical_Slice_Specification.md` | `docs/10-Economy_Framework.md`, `src/gameData.ts`, `src/gameLogic.ts`, nearest tests | Promotion docs unless requirements/rewards change |
| Unlock changes | `AGENTS.md`, `docs/13-Unlock_System.md`, `docs/08-MVP_Vertical_Slice_Specification.md`, `docs/07-Technical_Rules.md` | Relevant owning system doc, UI files, nearest tests | Economy docs unless resource thresholds change |
| Promotion changes | `AGENTS.md`, `docs/14-Promotion_System.md`, `docs/04-Career_System.md`, `docs/13-Unlock_System.md`, `docs/08-MVP_Vertical_Slice_Specification.md` | `docs/11-Resource_System.md`, `docs/12-Upgrade_System.md`, nearest tests | Future career docs outside the changed stage |
| Architecture review | `AGENTS.md`, `docs/07-Technical_Rules.md`, `docs/06-Game_Systems.md`, relevant system docs | Prior implementation reports if referenced by the task | Full numbered docs not touched by reviewed area |
| Code review | `AGENTS.md`, changed files, nearest tests, relevant canonical docs from this mapping | `docs/07-Technical_Rules.md` for cross-system changes | Unchanged unrelated docs and source files |
| Documentation creation | `AGENTS.md`, target canonical owner doc, directly dependent docs listed in its status block | `docs/00-Master_Project_Roadmap.md` for status or scope impact | Source files unless documenting implementation facts |
| Bug fixing | `AGENTS.md`, bug area source files, nearest tests, relevant canonical owner doc | `docs/07-Technical_Rules.md` for architecture or save impact | Broad documentation set unrelated to the bug |
| Refactoring | `AGENTS.md`, `docs/07-Technical_Rules.md`, relevant architecture/audit doc, changed modules and tests | `docs/06-Game_Systems.md`, relevant system doc | Gameplay balancing docs unless behavior changes |

## Optional Context Triggers

Load these only when the task specifically touches the trigger:

| Trigger | Add This Context |
|---|---|
| MVP scope or future-system exposure | `docs/00-Master_Project_Roadmap.md`, `docs/08-MVP_Vertical_Slice_Specification.md` |
| Manual testing or bug reporting loop | `docs/02-Core_Gameplay _Loop.md`, `docs/08-MVP_Vertical_Slice_Specification.md` |
| Career stage identity | `docs/04-Career_System.md`, `docs/03-Player_Journey.md` |
| Economy prices, rewards, or sinks | `docs/10-Economy_Framework.md` |
| Resource balances or transactions | `docs/11-Resource_System.md` |
| Upgrade costs, levels, effects, visibility | `docs/12-Upgrade_System.md`, `docs/09-Modifier_System.md` |
| Unlock state, hidden/teased/visible UI | `docs/13-Unlock_System.md` |
| Promotion availability or completion | `docs/14-Promotion_System.md` |
| Save data shape, migrations, autosave, load safety | `docs/07-Technical_Rules.md`, relevant system doc |
| AI workflow, repository scalability, context locality | `docs/EPIC-AI-Assisted-Repository-Scalability.md` |

## Do Not Load By Default

- Do not load all numbered docs for ordinary implementation.
- Do not load `docs/implementation/` reports unless a task depends on a specific report.
- Do not load speculative or imported duplicate project folders if they exist.
- Do not load future-system docs for MVP work unless the task is explicitly about keeping those systems hidden or inert.

## Local Validation

For documentation-only changes, run the repository check required by the task:

```text
npm run check
```

For build or runtime behavior changes, also run the smallest relevant build or smoke check.
