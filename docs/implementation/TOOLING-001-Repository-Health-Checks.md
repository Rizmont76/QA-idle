# TOOLING-001 - Repository Health Checks

Status: Complete

## Audit Summary

The audit separated deterministic repository rules from subjective review concerns.

Selected for automation:

- existing typecheck, lint, formatting, and unit tests through `npm run check`;
- forbidden tracked or unignored generated, dependency, cache, log, archive metadata, and duplicate imported project paths;
- local Markdown link validation for `README.md` and `docs/**/*.md`;
- duplicate stable ID validation in `src/types.ts`;
- duplicate registry ID validation in `src/gameData.ts`;
- basic registry reference validation for resources, gameplay stats, promotions, unlocks, UI surfaces, and modifier definition IDs;
- warning-only source file size reporting.

Left for review:

- subjective architecture quality;
- complexity scoring;
- balance quality;
- whether a large file needs refactoring when it has cohesive ownership.

Deferred until matching systems exist:

- save schema validation beyond current typecheck and tests;
- circular dependency detection;
- forbidden activation checks for future MVP systems;
- stale documentation path validation outside local Markdown links.

## Implemented Checks

`scripts/repository-health.mjs` runs deterministic checks with actionable messages. It uses the TypeScript parser for source registries instead of ad hoc line matching.

The check fails on:

- forbidden repository paths that are tracked or unignored;
- broken local Markdown links;
- duplicate stable IDs;
- duplicate content registry IDs;
- missing registry references.

The check warns on:

- source files over 500 lines.

## Local Validation Command

Run:

```text
npm run check
```

For the health check alone, run:

```text
npm run health
```

## CI Integration

CI already runs `pnpm run check` and `pnpm run build` in `.github/workflows/ci.yml`. Because `npm run check` now includes `npm run health`, CI and local validation use equivalent project checks through the existing script name.

## Resolving Failures

- Remove generated output, dependency folders, caches, logs, archive metadata, or duplicate imported project folders from tracked/unignored files.
- Fix or remove broken local Markdown links.
- Rename duplicate stable IDs only before release or with an explicit migration plan.
- Fix duplicate registry IDs or missing registry references in the owning content data.
