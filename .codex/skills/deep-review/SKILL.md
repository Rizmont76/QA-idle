---
name: deep-review
description: QA Idle deep review workflow for changes since the last completed deep review. Produces a project-specific findings report, proposes fixes, and waits for approval before editing. Tracks the reviewed commit in .codex/reviews/deep-review-state.json after a completed review.
---

# QA Idle Deep Review

Run a deep, project-specific review of QA Idle changes since the last completed deep review.
This skill is review-first: report findings and propose changes before editing unless the user
explicitly approves a follow-up implementation step.

## Default Behavior

- Do not edit files during the review pass.
- Do not commit.
- Use `qa-idle-context-router` before opening design docs.
- Treat `AGENTS.md` and numbered docs in `docs/` as the source of truth.
- Compare against the last completed deep review point stored in `.codex/reviews/deep-review-state.json`.
- If no previous review point exists, review from the user-provided base. If none is provided, explain that the state is uninitialized and propose a sensible base before continuing.

## Arguments

Parse flags or natural language.

- `--base <sha-or-ref>`: review from this commit/ref instead of the stored state.
- `--since-last`: default; review from `.codex/reviews/deep-review-state.json`.
- `--mark-reviewed`: after the user accepts the report, update the state to the reviewed `HEAD`.
- `--with-fixes`: after reporting findings, ask for approval to apply selected fixes.
- `--check`: run `pnpm run check` after approved fixes or as a verification-only pass.
- `review-only` / `--dry-run`: report only and do not run fixes or update state.

Always state the resolved settings before starting:

- base ref/SHA
- current `HEAD`
- whether uncommitted and untracked files are included
- whether fixes are allowed
- whether the review state may be updated

## Persistent State

State lives at `.codex/reviews/deep-review-state.json`.

Expected shape:

```json
{
  "schemaVersion": 1,
  "status": "not_started",
  "lastReviewedSha": null,
  "lastReviewedAt": null,
  "branch": null,
  "reviewedHeadSha": null,
  "reportPath": null
}
```

Only update this file after a review is complete and the user explicitly approves marking the
current point as reviewed. Do not silently move the checkpoint.

Reports should be saved under `.codex/reviews/deep-review-reports/` when the user wants review
history preserved in the repo.

## Scope

Review all relevant project changes since the resolved base:

```bash
git status --short
git log <base>..HEAD --oneline
git diff <base> --stat
git diff <base> --name-only
git ls-files --others --exclude-standard
```

Include:

- committed changes after base
- uncommitted tracked changes
- untracked files that are not ignored
- nearby source files and docs required to understand the changed behavior

Ignore generated/dependency/archive artifacts such as `dist/`, `node_modules/`, `__MACOSX/`,
`._*`, logs, caches, and duplicate imported project folders unless the user explicitly asks to
review those files.

## Required Review Lenses

### 1. QA Idle Design Consistency

Check changed behavior against the smallest relevant numbered docs chosen through
`qa-idle-context-router`.

Look for:

- undocumented mechanics, currencies, resources, stages, formulas, panels, upgrades, or unlocks
- economy/progression values that drift from MVP scope
- unlock, promotion, resource, or upgrade requirements copied instead of expressed as structured data or reusable predicates
- future systems that became active before documented unlock rules allow them

### 2. Gameplay Architecture

Check project architecture rules:

- authoritative gameplay behavior stays outside React components
- UI displays state and sends intents; game modules validate and calculate results
- definitions belong in `src/gameData.ts` when practical
- shared state shape belongs in `src/types.ts`
- logic is deterministic and testable with pure functions where practical

### 3. Save Compatibility

If state shape or persisted behavior changed, verify:

- initial value is defined
- load fallback or migration exists
- loaded numbers are sanitized
- invalid enum/string values cannot enter `GameState`
- tests cover compatibility and corrupted-save cases

### 4. Code Correctness

Review changed source and related callers/callees for:

- runtime bugs, stale state, wrong calculations, and edge cases
- type holes, unsafe assertions, or missed null/undefined handling
- duplicated requirement logic
- tests that no longer cover the important behavior

### 5. UI And Frontend Quality

For UI changes, check:

- the first screen remains the playable game
- styling follows the compact dashboard style in `src/styles.css`
- no explanatory feature text is added unless it is necessary in-game copy
- controls remain usable on desktop and mobile without overlapping text or layout jumps

### 6. Clean-Code Pass

Use the `simplify-code` checklist as a review lens only. Propose simplifications that preserve
behavior and stay inside the changed area.

## Output Format

Use this structure:

```md
## Deep Review

Base: <sha/ref>
HEAD: <sha>
Scope: <summary of changed/untracked files>
Docs loaded: <short list with reasons>

### Critical

- [file:line] Problem. Why it matters. Suggested fix.

### Should Fix

- [file:line] Problem. Why it matters. Suggested fix.

### Consider

- [file:line] Improvement or cleanup. Suggested fix.

### Positive Notes

- What is working well.

### Proposed Fix Plan

- Ordered list of recommended edits, grouped by risk.

### Verification Plan

- Focused tests/checks to run after approved edits.

### Review State

- Whether `.codex/reviews/deep-review-state.json` should be updated, and to which `HEAD`.
```

Findings must be concrete and include file/line references when possible.

## Updating The Review Checkpoint

After the user approves marking the review complete:

1. Save the report if requested.
2. Update `.codex/reviews/deep-review-state.json` with:
   - `status: "reviewed"`
   - `lastReviewedSha`: current `HEAD`
   - `lastReviewedAt`: current ISO timestamp
   - `branch`: current branch
   - `reviewedHeadSha`: current `HEAD`
   - `reportPath`: saved report path or `null`
3. Tell the user exactly which SHA is now the baseline for the next deep review.

## Boundaries

- Never move the checkpoint before the user sees the findings.
- Never apply fixes during the initial review pass.
- Never mark uncommitted working tree content as reviewed by SHA alone; if uncommitted changes are included, state that the checkpoint only records committed `HEAD`.
- Keep reports concise enough to act on, but do not hide serious findings.
