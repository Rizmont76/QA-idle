---
name: simplify-code
description: QA Idle clean-code review and approved simplification workflow for recent changes. Use as a read-only checklist during deep review, or to apply behavior-preserving refactors after user approval.
user-invocable: true
---

# QA Idle Code Simplification

Use this skill to identify or apply behavior-preserving simplifications in QA Idle changes.
During `deep-review`, use it as a read-only checklist. Apply edits only when the user explicitly
asks for simplification or approves a proposed fix plan.

## Scope

Review recent changed files plus directly related code:

```bash
git diff <base> --name-only
git ls-files --others --exclude-standard
```

Stay inside the changed feature area. Do not refactor unrelated modules.

## QA Idle Boundaries

- Do not change gameplay behavior, economy tuning, progression, unlocks, promotions, resources,
  modifiers, or save shape as part of simplification unless the docs and user request explicitly
  authorize that change.
- Keep authoritative gameplay logic outside React components.
- Preserve public APIs, component props, and persisted state shape unless the user approved a
  broader change.
- Preserve all test expectations unless a documented behavior change requires updating them.

## Clean-Code Checklist

### Control Flow

- Prefer early returns over nested conditionals.
- Extract complex conditions into named booleans or helpers.
- Flatten branches when it improves readability without hiding game rules.

### Structure

- Keep functions and components focused on one responsibility.
- Co-locate related logic.
- Extract reusable predicates or helpers when requirements are duplicated.
- Prefer typed data definitions in `src/gameData.ts` over scattered literals.

### Expressions

- Use direct boolean expressions instead of verbose comparisons.
- Use optional chaining and nullish coalescing where they improve clarity.
- Remove redundant variables, assertions, and no-op branches.

### Dead Weight

- Remove unused imports, variables, parameters, and unreachable code.
- Remove stale comments that no longer describe the code.

### Readability

- Prefer descriptive names over comments that explain unclear names.
- Keep dense gameplay formulas named and test-covered.
- Keep React components readable by moving calculation and validation into game modules.

## Output Format For Review-Only Use

```md
### Clean-Code Findings

- [file:line] Issue. Behavior-preserving suggested fix.
```

## Output Format After Approved Edits

```md
### Simplification Summary

- Changed <file>: <what was simplified>

### Verification

- <checks/tests run>
```
