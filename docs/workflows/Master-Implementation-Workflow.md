# QA Idle — Master Implementation Workflow

You are working on the **QA Idle** repository.

Your goal is to complete **exactly one** backlog task while following the repository architecture, documentation hierarchy, AI workflow, and validation process.

---

# Stage 1 — Repository Bootstrap

Before doing anything:

1. Read the root `AGENTS.md`.
2. Read every applicable scoped `AGENTS.md` for directories you will work in.
3. Use the repository skill:

`qa-idle-context-router`

If the skill is unavailable, manually follow its instructions.

---

# Stage 2 — Task Selection

Read:

* `docs/QA-Idle-MVP-Implementation-Backlog.md`

Find the **highest-priority unfinished MVP task** while respecting:

* roadmap order;
* dependency order;
* blocked tasks;
* MVP scope.

Select **exactly one** task.

Start your response with:

```
Working on: QA-MVP-XXX — Task Title
```

If every MVP backlog task is complete and final acceptance passes, output only:

```
<promise>COMPLETE</promise>
```

---

# Stage 3 — Context Selection

Do NOT load the entire documentation set.

Use:

`docs/README.md`

Determine:

* Required Context
* Optional Context
* Excluded Context

Load only the Required Context first.

Load Optional Context only if:

* required documentation references it;
* implementation genuinely requires it.

If additional documentation becomes necessary, explain why before loading it.

Do not load implementation reports unless the selected task explicitly depends on them.

---

# Stage 4 — Source Of Truth

Always follow this hierarchy:

1. AGENTS.md
2. Scoped AGENTS.md
3. docs/README.md
4. Canonical Production Documentation
5. docs/07-Technical_Rules.md
6. Backlog / Epic documents
7. Source code
8. Historical implementation reports

If code conflicts with canonical documentation:

* stop;
* report the conflict;
* do not silently change gameplay behavior.

Never invent:

* mechanics;
* formulas;
* IDs;
* resources;
* unlocks;
* promotions;
* save fields;
* UI behavior.

Escalate instead.

---

# Stage 5 — Implementation

Implement only the selected backlog task.

Keep changes tightly scoped.

Do NOT:

* complete adjacent backlog items;
* perform unrelated cleanup;
* activate future systems;
* rebalance gameplay unless the task explicitly requires it;
* perform speculative refactoring.

Respect:

* architecture ownership;
* module boundaries;
* save compatibility;
* stable IDs;
* deterministic gameplay simulation.

Gameplay behavior must remain outside React components.

---

# Stage 6 — Validation

Run:

```
pnpm run check
```

If runtime or build behavior changed, also run the smallest appropriate verification, for example:

```
pnpm run build
```

or another minimal smoke test appropriate for the task.

---

# Stage 7 — Task Completion Verification

Before considering the task complete, perform a complete Task Completion Verification using the repository workflow.

Verify:

* every Acceptance Criterion;
* functional correctness;
* architecture ownership;
* documentation consistency;
* save compatibility;
* test coverage;
* context locality;
* absence of unrelated changes;
* no newly introduced technical debt;
* AGENTS instructions remain valid;
* context mapping remains valid.

If verification fails:

Do NOT update backlog state.

Fix the problems first.

---

# Stage 8 — Repository Updates

If verification succeeds:

Update:

* `docs/QA-Idle-MVP-Implementation-Backlog.md`

Mark only the completed task.

If necessary:

Update:

`docs/progress.txt`

Keep the note short.

Only include:

* blocking limitation;
* important follow-up;
* implementation warning.

Do not write implementation summaries there.

---

# Stage 9 — Commit

Create exactly one Git commit.

Commit message:

```
Complete QA-MVP-XXX: Short task title
```

Push directly to:

```
main
```

Do not include:

* generated output;
* dependency folders;
* caches;
* logs;
* duplicate imported repositories;
* unrelated changes.

---

# Stage 10 — Final Response

Return:

## Completed Task

Task ID and title.

## Summary

Short implementation summary.

## Changed Files

List of modified files.

## Validation

Commands executed.

Results.

## Completion Verification

State whether every Acceptance Criterion passed.

## Handoff

Only if required.

Otherwise write:

```
No handoff required.
```

## Next Backlog Item

State which backlog item is now expected to become the next implementation task.

Do not start implementing it.
