# EPIC: AI-Assisted Repository Scalability

## Epic Goal

Prepare the QA Idle repository, documentation structure, and AI development workflow for continued project growth.

The project currently has:

- a rapidly growing core game logic implementation;
- a large and expanding documentation set;
- multiple AI instruction and review files;
- increasing context and token requirements for implementation and review tasks.

This Epic must improve repository maintainability, documentation discoverability, AI context locality, and task execution efficiency without changing approved gameplay behavior.

## Problems Addressed

1. Core gameplay logic is becoming concentrated in large files, making implementation and review harder for both developers and AI agents.
2. AI agents may load more documentation than required because there is no explicit task-to-document context mapping.
3. Agent instruction files and task prompts may contain duplicated, outdated, or unnecessarily broad instructions.
4. Mechanical repository rules may rely too heavily on prompt instructions instead of deterministic automated validation.
5. Existing implementation and review prompts may become outdated after repository and documentation restructuring.

## Success Criteria

The Epic is complete when:

- core gameplay module boundaries have been audited;
- any approved refactoring has been completed without behavior changes;
- documentation can be loaded selectively by task type;
- global and directory-specific AI instructions have clear ownership;
- implementation and review prompt templates use the new context structure;
- suitable repository health checks are automated;
- future tasks do not require loading the entire documentation set by default.

---

# ARCH-AUDIT-001: Audit Core Game Logic Module Boundaries

## Type

Architecture Audit

## Status

Complete

## Completion Notes

- Audit report: `docs/implementation/ARCH-AUDIT-001-Core-Game-Logic-Module-Boundaries.md`.
- Final recommendation: refactor now, incrementally, with behavior-preserving extraction and existing characterization tests as the safety net.

## Problem

The core game logic implementation has grown into a large file. File size alone does not prove an architectural problem, but it may indicate mixed responsibilities, weak module boundaries, excessive coupling, and poor context locality for AI-assisted development.

Previous code reviews focused primarily on correctness and task completion and may not have evaluated repository maintainability or AI context efficiency.

## Goal

Analyze the current core game logic implementation and determine whether it should be divided into smaller modules.

## Scope

The audit must identify:

- all responsibilities currently contained in the file;
- mutable state ownership;
- pure formulas and calculations;
- registries and static definitions;
- gameplay commands and state mutations;
- selectors and derived values;
- event creation and dispatch;
- persistence-related logic;
- offline progress logic;
- validation responsibilities;
- dependencies between identified areas;
- safe extraction boundaries;
- potential circular dependency risks.

## Deliverables

Produce an architecture audit report containing:

1. Current responsibility map.
2. Dependency map.
3. Identified architectural risks.
4. Recommended module boundaries.
5. Proposed target file structure.
6. Recommended extraction order.
7. Required characterization tests.
8. Areas that should remain together.
9. Final recommendation:
   - refactor now;
   - refactor after the current milestone;
   - no refactor required.

## Non-Goals

- Do not modify production code.
- Do not change gameplay behavior.
- Do not redesign approved systems.
- Do not create modules based only on file length.
- Do not perform formatting-only changes.

## Acceptance Criteria

- Every significant responsibility in the target file is documented.
- State ownership is explicitly identified.
- Pure logic is separated conceptually from orchestration and mutation.
- Proposed boundaries are based on domain responsibilities.
- The audit explains why each proposed module should exist.
- Risks and required tests are documented.
- No source code is modified.

## Dependencies

None.

---

# DEV-PROCESS-001: Create Documentation Index and Task Context Mapping

## Type

Development Process

## Status

Complete

## Completion Notes

- Created `docs/README.md` as the documentation index and task-context mapping.
- Indexed production and supporting documents with status, ownership, dependencies, required context, optional context, and excluded context guidance.

## Problem

The project contains a growing number of production documents. AI agents may load the full documentation set even when a task only requires a small subset, increasing token usage and making relevant requirements harder to identify.

## Goal

Create a documentation navigation system that allows developers and AI agents to identify the minimum required context for each task type.

## Scope

Create or update:

- `docs/README.md`;
- documentation category indexes where necessary;
- canonical ownership mapping;
- task-to-document mapping;
- document status mapping;
- document dependency references.

The index must identify:

- document title;
- document path;
- document category;
- document status: Living, Approved, Frozen, Deprecated;
- canonical responsibilities;
- documents it depends on;
- task types that require it;
- task types where it is optional;
- task types where it should not be loaded.

## Required Task Context Categories

At minimum, define context requirements for:

- gameplay feature implementation;
- gameplay balancing;
- formula changes;
- UI implementation;
- visual design documentation;
- persistence changes;
- save migration changes;
- upgrade changes;
- unlock changes;
- promotion changes;
- architecture review;
- code review;
- documentation creation;
- bug fixing;
- refactoring.

## Rules

- Full production documents remain the source of truth.
- The index must not duplicate complete document contents.
- The index must link to canonical sources.
- Every rule must have one canonical owner.
- Agents must not be instructed to load all documentation by default.
- Required and optional context must be clearly separated.

## Acceptance Criteria

- `docs/README.md` provides a complete documentation index.
- Every existing production document is indexed.
- Frozen and Living documents are distinguishable.
- Each supported task type has a required document list.
- Optional context is documented separately.
- Canonical ownership is clear.
- No production requirement is silently moved or deleted.
- Existing documentation links remain valid or are updated.

## Dependencies

None.

---

# DEV-PROCESS-002: Audit and Restructure AI Instruction Hierarchy

## Type

Development Process

## Status

Complete

## Completion Notes

- Audit report: `docs/implementation/DEV-PROCESS-002-AI-Instruction-Hierarchy.md`.
- Restructured active AI guidance into root, `src`, `docs`, and `.codex/skills` scoped instruction files.
- Root `AGENTS.md` now keeps global rules and delegates source, documentation, and skill workflow rules to directory-local files.

## Problem

The project uses AI agent instruction files, but their efficiency, scope, hierarchy, and consistency have not been audited. Instructions may be duplicated, overly broad, outdated, or placed too far from the code they govern.

Simply shortening all instruction files may remove important constraints and reduce agent reliability.

## Goal

Create a clear hierarchy of global and directory-specific AI instructions with minimal duplication and strong context locality.

## Scope

Audit all relevant instruction files, including:

- root `AGENTS.md`;
- nested `AGENTS.md` files;
- Codex-specific instructions;
- documentation-specific instructions;
- review instructions;
- any equivalent AI guidance files.

For every instruction, classify it as:

- global project rule;
- gameplay-specific rule;
- UI-specific rule;
- persistence-specific rule;
- documentation-specific rule;
- task-template rule;
- obsolete rule;
- duplicated rule;
- rule that should become automated validation.

## Expected Target Structure

The exact structure must be based on the repository audit, but may include:

```text
AGENTS.md
src/game/AGENTS.md
src/ui/AGENTS.md
src/persistence/AGENTS.md
docs/AGENTS.md
```

## Rules

- The root instruction file must contain only globally applicable rules.
- Directory-specific rules must live as close as practical to the files they govern.
- Rules must use clear imperative language.
- Important constraints must not be removed solely to reduce token count.
- Duplicate rules must have one canonical owner.
- Instructions that can be enforced deterministically should be proposed for automation.
- Documentation loading instructions must use the mapping created in `DEV-PROCESS-001`.

## Deliverables

1. Instruction inventory.
2. Duplication and conflict report.
3. Proposed instruction hierarchy.
4. Updated instruction files.
5. Removed or relocated rule list.
6. Automation candidates.
7. Before-and-after size comparison.

## Acceptance Criteria

- Global and scoped instructions have clear boundaries.
- No contradictory active instructions remain.
- Duplicate rules are removed or replaced by canonical references.
- Scoped agents do not receive unrelated project instructions.
- Important architectural constraints remain explicit.
- Documentation loading uses task-context mapping.
- Updated instructions are shorter where possible without losing meaning.
- Existing development workflows continue to work.

## Dependencies

- DEV-PROCESS-001.

---

# TECH-DEBT-006: Modularize Core Game Logic

## Type

Technical Debt

## Status

Complete

## Completion Notes

- Refactored `src/gameLogic.ts` into cohesive domain modules under `src/game/`.
- Kept `src/gameLogic.ts` as a compatibility barrel for existing imports.
- Implementation summary and module public interfaces: `docs/implementation/TECH-DEBT-006-Core-Game-Logic-Modularization.md`.

## Problem

The core gameplay implementation may contain multiple responsibilities in one large file, reducing maintainability, testability, review quality, and AI context efficiency.

## Goal

Refactor the core gameplay implementation into cohesive domain modules without changing observable gameplay behavior.

## Preconditions

- `ARCH-AUDIT-001` must be completed.
- The audit must recommend refactoring.
- Required characterization tests must exist before extraction begins.
- The approved target structure must be documented.

## Scope

Refactor according to the approved module-boundary audit.

Potential areas may include:

- game state;
- initial state;
- commands;
- formulas;
- registries;
- gameplay systems;
- selectors;
- events;
- persistence;
- offline progress;
- validation.

The final structure must follow actual domain boundaries rather than arbitrary file-size limits.

## Requirements

- Preserve all approved stable IDs.
- Preserve save compatibility.
- Preserve public behavior.
- Preserve deterministic simulation.
- Preserve system ownership rules.
- Avoid circular dependencies.
- Keep formulas pure where applicable.
- Registry definitions must not own runtime state.
- UI code must not become the owner of gameplay state.
- No excluded MVP systems may become active.
- Avoid unrelated cleanup.

## Implementation Approach

Perform the refactor incrementally:

1. Add characterization tests.
2. Extract pure types and formulas.
3. Extract registries and definitions.
4. Extract selectors and derived values.
5. Extract isolated gameplay systems.
6. Reduce the core engine to orchestration.
7. Run full verification after each extraction.

The exact order must follow the approved architecture audit.

## Acceptance Criteria

- All existing tests pass.
- New characterization tests cover current behavior.
- Build, lint, typecheck, and test commands pass.
- No approved gameplay behavior changes.
- No save compatibility regression.
- No circular dependencies are introduced.
- Core responsibilities are separated into cohesive modules.
- The main engine file primarily coordinates modules.
- Module public interfaces are documented.
- The final change includes a summary of moved responsibilities.
- Documentation is updated where file paths or implementation ownership changed.

## Dependencies

- ARCH-AUDIT-001.

---

# DEV-PROCESS-003: Update AI Implementation and Review Prompt Templates

## Type

Development Process

## Problem

Existing AI task prompts may refer to old file paths, load excessive documentation, use outdated instruction hierarchy, or review only functional correctness without evaluating architectural boundaries and context locality.

## Goal

Create standardized prompt templates aligned with the new repository, documentation, and instruction structure.

## Required Templates

Create templates for:

1. Feature implementation.
2. Bug fixing.
3. Behavior-preserving refactoring.
4. Production documentation creation.
5. Code review.
6. Architecture review.
7. Task completion verification.
8. Documentation consistency review.

## Every Template Must Define

- role;
- task objective;
- required context;
- optional context;
- excluded context;
- source-of-truth hierarchy;
- files allowed to change;
- non-goals;
- required validation commands;
- acceptance criteria;
- expected final response format;
- conditions requiring escalation instead of assumptions.

## Completion Review Requirements

The task completion review template must verify:

- every acceptance criterion;
- functional correctness;
- architecture compliance;
- ownership boundaries;
- documentation consistency;
- save compatibility where applicable;
- test coverage;
- unrelated changes;
- newly introduced technical debt;
- whether agent instructions or context mappings became outdated;
- whether the task increased unnecessary context coupling.

## Rules

- Prompts must use `docs/README.md` task-context mapping.
- Prompts must not request all project documents by default.
- Prompts must reference scoped `AGENTS.md` files.
- Prompts must distinguish implementation review from architecture review.
- Prompt wording should be concise but explicit.
- Repeated global rules should be referenced rather than copied when reliable.

## Acceptance Criteria

- All required templates exist.
- Templates reference current repository paths.
- Templates use minimum required context.
- Completion review checks acceptance criteria explicitly.
- Refactor prompts require behavior preservation.
- Documentation prompts enforce canonical ownership.
- Architecture review is separated from ordinary code review.
- Obsolete prompt templates are updated or marked deprecated.
- A usage guide explains which template to use for each task type.

## Dependencies

- DEV-PROCESS-001.
- DEV-PROCESS-002.
- TECH-DEBT-006, only when prompt paths depend on the completed module structure.

---

# TOOLING-001: Add Automated Repository Health Checks

## Type

Tooling

## Problem

Some repository and architecture rules are currently enforced through natural-language instructions and manual review. This consumes AI context and allows mechanical violations to be missed.

## Goal

Move suitable mechanical rules from AI instructions into deterministic automated checks.

## Audit Scope

Evaluate automation for:

- lint;
- typecheck;
- unit tests;
- formatting;
- documentation link validation;
- duplicate stable ID detection;
- duplicate registry key detection;
- forbidden dependency detection;
- circular dependency detection;
- file size warnings;
- complexity warnings;
- forbidden activation of excluded MVP systems;
- documentation index validation;
- stale documentation path detection;
- save schema validation.

## Rules

- Automated checks must enforce deterministic rules only.
- Subjective architecture decisions must remain in review.
- File-size thresholds should initially produce warnings unless a strict limit is justified.
- Checks must have actionable error messages.
- Local execution must be documented.
- CI integration should reuse the same commands used locally.

## Deliverables

1. Repository health check audit.
2. Selected automated checks.
3. Scripts or configuration.
4. Local validation command.
5. CI integration where appropriate.
6. Documentation for resolving failures.

## Acceptance Criteria

- Selected checks run through a documented command.
- Build-breaking checks are deterministic and stable.
- Warning-only checks are clearly distinguished.
- Failure messages identify the file and violated rule.
- AI task prompts reference the validation command instead of repeating mechanical rules.
- Existing valid code passes or justified violations are documented.
- CI and local validation use equivalent logic.

## Dependencies

- DEV-PROCESS-002.
- TECH-DEBT-006 may be completed first if architecture checks depend on the final module structure.

---

# Recommended Execution Order

1. ARCH-AUDIT-001 — Audit Core Game Logic Module Boundaries.
2. DEV-PROCESS-001 — Create Documentation Index and Task Context Mapping.
3. DEV-PROCESS-002 — Audit and Restructure AI Instruction Hierarchy.
4. TECH-DEBT-006 — Modularize Core Game Logic, only if approved by the audit.
5. DEV-PROCESS-003 — Update AI Implementation and Review Prompt Templates.
6. TOOLING-001 — Add Automated Repository Health Checks.

# Execution Rule

Each child task must be completed and reviewed separately.

Do not assign the entire Epic to Codex as one implementation task.

For every child task:

1. Copy only that task into a Codex session.
2. Attach or reference only its required files.
3. Ask Codex to inspect the repository before changing anything.
4. Complete implementation or audit.
5. Run a separate task completion review.
6. Update the backlog status.
7. Continue to the next dependency-unblocked task.
