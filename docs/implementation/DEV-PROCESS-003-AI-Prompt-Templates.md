# DEV-PROCESS-003 - AI Implementation and Review Prompt Templates

Status: Complete

## Usage Guide

Use these templates when starting QA Idle AI-assisted work. Replace bracketed text with the current task details, keep the selected context narrow, and follow the source-of-truth hierarchy before changing files.

| Use This Template | When |
|---|---|
| Feature Implementation | Adding documented gameplay, UI, persistence, or content behavior. |
| Bug Fixing | Correcting a reproducible defect or docs/code mismatch. |
| Behavior-Preserving Refactoring | Moving or simplifying code without approved behavior changes. |
| Production Documentation Creation | Creating or changing canonical numbered design docs. |
| Code Review | Reviewing a concrete code or documentation change for bugs and regressions. |
| Architecture Review | Evaluating boundaries, ownership, coupling, scalability, or context locality. |
| Task Completion Verification | Checking whether a completed task satisfies all acceptance criteria. |
| Documentation Consistency Review | Checking whether docs agree with canonical ownership and each other. |

Do not use a broad template when a narrower one applies. If a task spans multiple categories, start with the template for the highest-risk changed surface and add only the extra required context from `docs/README.md`.

## Shared Source-Of-Truth Hierarchy

Every template uses this hierarchy unless the task explicitly says otherwise:

1. `AGENTS.md`, plus scoped `AGENTS.md` files for changed directories.
2. `docs/README.md` task-context mapping.
3. `docs/00-Master_Project_Roadmap.md` through `docs/14-Promotion_System.md` as canonical production docs.
4. `docs/07-Technical_Rules.md` for architecture, save, event, data-driven, and implementation-readiness rules.
5. Epic, backlog, and implementation report files for task order and historical decisions only.
6. Source code and tests as the current implementation, subordinate to canonical docs.

If code conflicts with selected canonical docs, record the conflict before changing behavior.

## Template 1: Feature Implementation

```text
Role:
You are implementing one documented QA Idle feature with behavior owned by the gameplay layer, not the UI.

Task Objective:
Implement [task id and title] exactly as documented.

Required Context:
- AGENTS.md
- Scoped AGENTS.md files for changed directories, usually src/AGENTS.md and/or docs/AGENTS.md
- docs/README.md task-context mapping
- The relevant canonical system document from docs/00-Master_Project_Roadmap.md through docs/14-Promotion_System.md
- docs/07-Technical_Rules.md when the feature touches architecture, save data, events, resources, unlocks, promotions, or runtime behavior
- Nearest existing source and test files, such as src/game/, src/gameData.ts, src/types.ts, src/save.ts, src/main.tsx, src/styles.css, src/gameLogic.test.ts, src/gameData.test.ts, or src/save.test.ts

Optional Context:
- docs/08-MVP_Vertical_Slice_Specification.md for MVP boundaries
- docs/06-Game_Systems.md for cross-system ownership
- Other docs listed as optional for the task type in docs/README.md
- Prior implementation reports only when the task references them

Excluded Context:
- Full numbered documentation set by default
- Future-system docs unrelated to this feature
- Duplicate imported project folders, generated output, caches, logs, and dependency folders

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- Feature-owned source files and nearest tests
- Minimal documentation or backlog files required by the task

Non-Goals:
- Do not invent undocumented mechanics, IDs, currencies, formulas, panels, upgrades, unlocks, promotions, or save fields.
- Do not activate excluded MVP systems.
- Do not perform unrelated cleanup or formatting-only edits.

Required Validation Commands:
- npm run check
- npm run build or the smallest runtime/build smoke check when runtime behavior changes

Acceptance Criteria:
- The feature follows the selected canonical docs and MVP scope.
- Gameplay behavior is owned outside React components.
- Stable IDs and save compatibility are preserved.
- Focused tests cover changed logic.
- Hidden or future systems remain inert unless documented.
- Unrelated files are not changed.

Expected Final Response Format:
- State the completed task id and title.
- Summarize the changed files and behavior.
- List validation commands and results.
- Mention any documented conflicts, limitations, or handoff notes.

Escalate Instead Of Assuming When:
- Canonical docs conflict or omit required implementation details.
- A save migration, stable ID rename, or MVP scope change seems necessary.
- Required validation cannot run.
```

## Template 2: Bug Fixing

```text
Role:
You are fixing one QA Idle bug while preserving documented behavior.

Task Objective:
Fix [bug summary] and prevent regression.

Required Context:
- AGENTS.md
- Scoped AGENTS.md files for changed directories
- docs/README.md task-context mapping
- Bug area source files and nearest tests
- The canonical owner doc for the affected mechanic or UI behavior

Optional Context:
- docs/07-Technical_Rules.md for cross-system, save, event, resource, or architecture impact
- docs/08-MVP_Vertical_Slice_Specification.md for MVP scope questions

Excluded Context:
- Unrelated production docs
- Speculative or future-system material unless the bug concerns visibility or inertness

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- Minimal source and test files needed for the defect
- Brief docs/progress.txt note only for important unresolved limitations

Non-Goals:
- Do not redesign the system around the bug.
- Do not change balance, unlock timing, save shape, or UI scope unless the canonical docs require it.

Required Validation Commands:
- npm run check
- Smallest additional repro, unit, build, or smoke check that proves the fix

Acceptance Criteria:
- The defect is reproducible before the fix or clearly explained from code.
- The fix matches canonical docs.
- A regression test is added or an existing test is updated when practical.
- No unrelated behavior changes are introduced.

Expected Final Response Format:
- Describe the bug fixed and root cause.
- Summarize changed files.
- List validation commands and results.
- Note any residual risk.

Escalate Instead Of Assuming When:
- The bug report conflicts with canonical docs.
- The apparent fix requires undocumented behavior or broad refactoring.
```

## Template 3: Behavior-Preserving Refactoring

```text
Role:
You are refactoring QA Idle code without changing observable behavior.

Task Objective:
Refactor [area] to improve [maintainability/testability/context locality] while preserving behavior.

Required Context:
- AGENTS.md
- src/AGENTS.md for source refactors
- docs/README.md task-context mapping
- docs/07-Technical_Rules.md
- Relevant architecture or audit report when referenced
- Changed modules and nearest tests

Optional Context:
- docs/06-Game_Systems.md for ownership boundaries
- Relevant system doc when a moved module owns a documented mechanic

Excluded Context:
- Gameplay balancing docs unless behavior changes are proposed
- Unrelated UI, docs, and future-system files

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- Refactored source modules and tests
- Compatibility barrels such as src/gameLogic.ts when preserving imports
- Implementation summary docs when required by the task

Non-Goals:
- Do not change formulas, event ordering, save shape, stable IDs, unlock timing, or visible UI behavior.
- Do not mix unrelated cleanup into the refactor.

Required Validation Commands:
- npm run check
- npm run build when module boundaries or bundling behavior change

Acceptance Criteria:
- Existing public behavior and imports are preserved.
- Tests protect the moved responsibilities.
- Dependencies remain acyclic and ownership boundaries remain clear.
- Module responsibilities are documented when the task requires it.

Expected Final Response Format:
- Summarize the moved responsibilities.
- Confirm behavior preservation.
- List validation commands and results.
- Call out any follow-up refactor candidates left intentionally out of scope.

Escalate Instead Of Assuming When:
- Behavior changes appear necessary to complete the refactor.
- Existing tests are insufficient to characterize risky behavior.
```

## Template 4: Production Documentation Creation

```text
Role:
You are creating or updating canonical QA Idle production documentation.

Task Objective:
Create or update [document or section] for [design purpose].

Required Context:
- AGENTS.md
- docs/AGENTS.md
- docs/README.md task-context mapping
- Target canonical owner document
- Direct dependencies listed in the target document status block

Optional Context:
- docs/00-Master_Project_Roadmap.md for phase, scope, or milestone impact
- Existing implementation only when documenting current implementation facts

Excluded Context:
- Source files by default
- Unrelated numbered docs
- Backlog files unless updating task state

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- The target documentation file
- Directly affected index, roadmap, backlog, or progress files

Non-Goals:
- Do not silently move or delete production requirements.
- Do not change frozen behavior unless the task explicitly authorizes it.
- Do not implement code.

Required Validation Commands:
- npm run check

Acceptance Criteria:
- Canonical ownership is clear.
- Dependencies and links remain valid.
- MVP scope and frozen-doc rules are respected.
- New requirements are specific enough for implementation readiness.

Expected Final Response Format:
- Summarize the documentation change and ownership.
- List validation commands and results.
- Note any design decisions that need review.

Escalate Instead Of Assuming When:
- Requirements conflict with frozen docs or roadmap scope.
- A design gap would force implementation invention.
```

## Template 5: Code Review

```text
Role:
You are reviewing QA Idle changes for bugs, regressions, and missing tests.

Task Objective:
Review [branch, diff, PR, or files] for correctness against the selected docs.

Required Context:
- AGENTS.md
- Scoped AGENTS.md files for changed directories
- Changed files and nearest tests
- Relevant canonical docs selected from docs/README.md

Optional Context:
- docs/07-Technical_Rules.md for cross-system, architecture, save, event, resource, unlock, or promotion changes
- Prior implementation reports only if the diff relies on them

Excluded Context:
- Full documentation set by default
- Unchanged unrelated source files

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- None, unless the user explicitly asks for fixes after the review.

Non-Goals:
- Do not summarize before findings.
- Do not review style preferences unless they create risk.

Required Validation Commands:
- Inspect available test results when provided
- Run no commands unless the review request asks for local verification

Acceptance Criteria:
- Findings are ordered by severity.
- Each finding references file and line.
- Findings focus on behavioral regressions, missing tests, save compatibility, docs conflicts, and architecture risks.
- No issue is reported unless it is actionable.

Expected Final Response Format:
- Findings first.
- Open questions or assumptions second.
- Brief change summary last only when useful.

Escalate Instead Of Assuming When:
- Required diff or referenced files are unavailable.
- A suspected issue depends on missing canonical context.
```

## Template 6: Architecture Review

```text
Role:
You are reviewing QA Idle architecture boundaries and scalability.

Task Objective:
Evaluate [area] for ownership, coupling, maintainability, and AI context locality.

Required Context:
- AGENTS.md
- docs/README.md task-context mapping
- docs/07-Technical_Rules.md
- docs/06-Game_Systems.md
- Relevant system docs and changed source modules

Optional Context:
- Prior architecture or implementation reports explicitly referenced by the task
- Nearest tests for changed boundaries

Excluded Context:
- Unrelated numbered docs
- Gameplay balance docs unless formulas or economy ownership are under review

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- None for review-only tasks
- Architecture report files only when the task asks for a written audit

Non-Goals:
- Do not judge subjective style unless it affects ownership, coupling, testability, or context locality.
- Do not propose new gameplay behavior.

Required Validation Commands:
- None for review-only tasks unless the user asks for verification
- npm run check if the task includes edits

Acceptance Criteria:
- Responsibilities and dependencies are identified.
- Risks include circular dependencies, hidden direct mutation, UI ownership of logic, save compatibility, and future-system activation.
- Recommendations distinguish required fixes from optional improvements.
- Context locality impact is addressed.

Expected Final Response Format:
- Findings ordered by severity.
- Architecture risks and recommended boundaries.
- Required tests or verification gaps.

Escalate Instead Of Assuming When:
- The reviewed area lacks enough docs or source context to identify the canonical owner.
```

## Template 7: Task Completion Verification

```text
Role:
You are verifying whether one QA Idle task is truly complete.

Task Objective:
Verify [task id and title] against its acceptance criteria and selected canonical docs.

Required Context:
- AGENTS.md
- Scoped AGENTS.md files for changed directories
- docs/README.md task-context mapping
- The task definition and acceptance criteria
- Changed files and nearest tests
- Relevant canonical docs selected by task type

Optional Context:
- docs/07-Technical_Rules.md for architecture, save, event, resource, unlock, promotion, or runtime impact
- Prior implementation report for the same task

Excluded Context:
- Unrelated backlog tasks
- Full documentation set by default

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- None unless the user explicitly asks for fixes.
- If verification passes and the task request includes backlog updates, only the selected task state may be changed.

Non-Goals:
- Do not complete adjacent backlog tasks.
- Do not accept partial implementation because tests pass.

Required Validation Commands:
- npm run check
- Smallest additional build, runtime, or smoke check when build/runtime behavior changed

Acceptance Criteria:
- Every task acceptance criterion is explicitly verified.
- Functional correctness is checked against canonical docs.
- Architecture ownership and context locality are checked.
- Documentation consistency is checked.
- Save compatibility is checked when applicable.
- Test coverage is adequate for the risk.
- No unrelated changes, generated output, dependency folders, caches, logs, or duplicate imports are included.
- Newly introduced technical debt is identified.
- Agent instructions and context mappings are still current.

Expected Final Response Format:
- Pass/fail conclusion.
- Acceptance criteria checklist.
- Validation commands and results.
- Blocking issues, residual risks, or handoff note.

Escalate Instead Of Assuming When:
- Required validation cannot run.
- Acceptance criteria are ambiguous or conflict with canonical docs.
```

## Template 8: Documentation Consistency Review

```text
Role:
You are reviewing QA Idle documentation for consistency and canonical ownership.

Task Objective:
Review [documents or topic] for conflicts, stale paths, ownership drift, and task-context accuracy.

Required Context:
- AGENTS.md
- docs/AGENTS.md
- docs/README.md
- Documents directly named in the task
- Canonical owner docs for the reviewed subject

Optional Context:
- docs/00-Master_Project_Roadmap.md for phase or MVP scope conflicts
- Implementation reports only when reviewing historical task claims

Excluded Context:
- Source files unless the review includes implementation-path accuracy
- Unrelated numbered docs

Source-Of-Truth Hierarchy:
Use the shared hierarchy in docs/implementation/DEV-PROCESS-003-AI-Prompt-Templates.md.

Files Allowed To Change:
- None for review-only tasks
- Target docs and index files only when the task asks for fixes

Non-Goals:
- Do not rewrite prose for style alone.
- Do not move canonical rules without updating references and explaining ownership.

Required Validation Commands:
- npm run check when edits are made

Acceptance Criteria:
- Conflicts identify the documents and canonical owner.
- Stale paths and obsolete template references are reported or fixed.
- Required and optional context remain clearly separated.
- Frozen-doc behavior is preserved unless explicitly authorized.

Expected Final Response Format:
- Findings ordered by severity.
- Suggested fixes or completed edits.
- Validation commands and results when edits are made.

Escalate Instead Of Assuming When:
- Two canonical docs appear to own the same rule.
- Resolving a conflict would change approved production behavior.
```

## Obsolete Template Review

Targeted repository searches found no existing standalone prompt template files to update or deprecate. The active guidance now lives in `AGENTS.md`, scoped `AGENTS.md` files, repo-local skills, `docs/README.md`, and this template guide.

