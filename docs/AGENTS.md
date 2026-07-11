# QA Idle Documentation Rules

## Source Of Truth

- Keep `docs/00-Master_Project_Roadmap.md` through `docs/14-Promotion_System.md` as the canonical production design set.
- Use `docs/README.md` as the documentation index and task-context mapping. Do not duplicate full canonical rules into the index.
- Keep task backlogs, epic files, implementation reports, and `docs/progress.txt` subordinate to the numbered production docs.

## Editing Rules

- Read the canonical owner document and directly dependent docs listed in its status block before changing production requirements.
- Do not silently move or delete production requirements. If ownership changes, update references and explain the relocation.
- Preserve frozen document behavior unless the current task explicitly authorizes a documentation change.
- Keep `docs/ideas/`, if present, speculative until content is promoted into the numbered production docs.
- Keep `docs/progress.txt` brief and use it only for important handoff notes or local limitations.

## Epic And Backlog Rules

- Mark only the selected task complete when its acceptance criteria and required verification pass.
- Respect dependencies, recommended ordering, and roadmap guidance before selecting the next task.
- Do not treat an epic or backlog task as permission to implement undocumented gameplay behavior.
