# QA Idle Master Implementation Workflow

Status: Active Workflow

Use this concise workflow for one active Playable Idle MVP backlog task. It supplements
`AGENTS.md`, the active backlog, the context router, and the selected prompt template; it does
not replace them.

## Standard Delivery

1. Select one ready task from `docs/QA-Idle-Playable-MVP-Implementation-Backlog.md`, respecting
   its dependencies, priority, and MVP scope.
2. Start from `AGENTS.md`, read applicable scoped instructions, then use the context router and
   `docs/README.md` to load the smallest required context.
3. Implement only the selected task. If canonical documents conflict or omit required behavior,
   stop and report the gap rather than assuming.
4. Run the task's required verification and the smallest additional runtime or build check when
   the task requires one. Do not reduce save, architecture, scope, or verification safeguards.
5. Complete task verification before changing its backlog status. Record only material unresolved
   limitations in `docs/progress.txt`.
6. Deliver one task on one fresh branch through one PR. The implementation, focused tests, and
   selected task's backlog status update belong in that PR. Do not push directly to `main`.

## Task Completion

Before the PR is ready for review, confirm the task's acceptance criteria, documentation
alignment, scope control, applicable save compatibility, focused tests, and absence of unrelated
changes. Use the PR template to record actual behavior, verification, and any residual risk.

If existing work already appears to satisfy a task, verify it against the task before changing
status. Use a clearly labelled verification/closure PR; do not represent pre-existing work as a
new implementation change.

## Technical Debt

Classify a discovered debt item before scheduling it:

- **Blocker prerequisite:** a correctness, safety, or ownership issue that must be resolved before
  named downstream tasks proceed. Only this class may enter the active critical path.
- **Milestone debt:** meaningful maintainability or architecture work that belongs before a named
  milestone exit, but does not block the current task.
- **Deferred cleanup:** useful cleanup with no current correctness, scope, or delivery dependency.

Record the classification, evidence, and affected tasks in the backlog or review disposition. Do
not add deferred cleanup to the critical path.
