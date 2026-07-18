# AI Task Workflow

Status: Active Workflow

Use this workflow for QA Idle implementation, review, documentation, and verification tasks. It operationalizes the post-epic AI development process without replacing the canonical numbered production documents.

## Standard Workflow

1. Start with `AGENTS.md` and any scoped `AGENTS.md` files for directories you will change.
2. Use `.codex/skills/qa-idle-context-router/SKILL.md` and `docs/README.md` to select the smallest required context.
3. Select the narrowest matching template from `docs/workflows/AI-Prompt-Templates.md`; use the
   compact ordinary implementation prompt unless the task needs a specialized review or
   documentation template.
4. Identify required, optional, and excluded files before reading additional context.
5. Complete the task without changing unrelated gameplay behavior or broadening MVP scope.
6. Run the validation command required by the template or task, usually `pnpm run check`.
7. Use task completion verification before marking backlog or epic state complete.
8. Record only important unresolved limitations in `docs/progress.txt`.
9. Deliver one selected task on one fresh branch through one PR. Include the implementation,
   focused tests, and selected task's backlog status update in that PR; do not push directly to
   `main`.

## Coverage Matrix

| Task Type | Prompt Template | Context Route | Scoped Instructions | Validation | Completion Verification |
|---|---|---|---|---|---|
| Gameplay feature implementation | Feature Implementation | `docs/README.md` task mapping plus context router mechanic route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; build or smoke check when runtime behavior changes | Task Completion Verification |
| Gameplay balancing | Feature Implementation or Documentation Consistency Review, depending on whether code changes | Economy and relevant mechanic route | `AGENTS.md`, `src/AGENTS.md` or `docs/AGENTS.md` | `pnpm run check` | Task Completion Verification |
| Formula changes | Feature Implementation | Modifier and relevant mechanic route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; focused tests when logic changes | Task Completion Verification |
| UI implementation | Feature Implementation | UI route plus relevant mechanic route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; visual smoke check when practical | Task Completion Verification |
| Visual design documentation | Production Documentation Creation | Visual design documentation route | `AGENTS.md`, `docs/AGENTS.md` | `pnpm run check` | Task Completion Verification |
| Persistence changes | Feature Implementation | Persistence route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; save tests | Task Completion Verification |
| Save migration changes | Feature Implementation | Save migration route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; save tests | Task Completion Verification |
| Upgrade changes | Feature Implementation | Upgrade route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; nearest game-data or logic tests | Task Completion Verification |
| Unlock changes | Feature Implementation | Unlock route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; nearest tests | Task Completion Verification |
| Promotion changes | Feature Implementation | Promotion route | `AGENTS.md`, `src/AGENTS.md` | `pnpm run check`; nearest tests | Task Completion Verification |
| Architecture review | Architecture Review | Architecture review route | `AGENTS.md`; scoped instructions for reviewed directories | No command unless edits are made | Task Completion Verification when task state changes |
| Code review | Code Review | Code review route | `AGENTS.md`; scoped instructions for changed directories | Inspect provided results unless local verification is requested | Task Completion Verification when task state changes |
| Documentation creation | Production Documentation Creation | Documentation creation route | `AGENTS.md`, `docs/AGENTS.md` | `pnpm run check` | Task Completion Verification |
| Bug fixing | Bug Fixing | Bug fixing route plus affected mechanic route | `AGENTS.md`; scoped instructions for changed directories | `pnpm run check`; smallest repro or focused check | Task Completion Verification |
| Refactoring | Behavior-Preserving Refactoring | Refactoring route | `AGENTS.md`, `src/AGENTS.md` for source refactors | `pnpm run check`; build when module boundaries change | Task Completion Verification |

## Dry Run

Sample task: verify the completed `TOOLING-001` repository health check task without changing behavior.

Route context:

- Required: `AGENTS.md`, `docs/AGENTS.md`, `docs/README.md`, `docs/EPIC-AI-Assisted-Repository-Scalability.md`, `docs/implementation/TOOLING-001-Repository-Health-Checks.md`, `package.json`, `scripts/repository-health.mjs`.
- Optional: `.github/workflows/ci.yml` to confirm CI command reuse.
- Excluded: numbered gameplay design docs, future-system docs, and unrelated source modules.

Prompt template:

- Use Task Completion Verification because the sample checks whether an already completed tooling task satisfies acceptance criteria.

Validation:

- `pnpm run check`.

Completion verification:

- Confirmed the task has a health script, package command wiring, documentation, local/CI command alignment, actionable failure behavior, and warning-only file-size checks.
- Confirmed the dry run does not require loading the full numbered documentation set.

Remaining limitations:

- None for the post-epic workflow. The health check may still report warning-only pre-existing large files; those warnings are intentionally non-blocking.
