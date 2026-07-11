# QA Idle Skill Rules

## Skill Ownership

- Repo-local skills in this directory should point agents to existing canonical docs instead of copying broad project rules.
- Keep the `qa-idle-context-router` skill aligned with `docs/README.md` task-context mapping.
- Keep review skills read-only by default unless their `SKILL.md` explicitly allows approved fixes.

## Review Workflows

- Deep review state lives in `.codex/reviews/deep-review-state.json`; update it only when the review workflow and user approval require it.
- Architecture and deep review outputs should cite concrete files and line numbers where possible.
- Use deterministic validation commands from `package.json` or task instructions instead of embedding ad hoc checklists in prompts.

## Automation Candidates

- Prefer moving mechanical checks into scripts or package commands when they are deterministic.
- Leave subjective architecture judgment in review skills and implementation guidance.
