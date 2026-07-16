# Balance Tooling

## Artifact Protection

Historical Phase 6A and Phase 6B balance artifacts are immutable during Playable Idle MVP implementation work. Balance scripts must call `assertWritableBalanceArtifact` before writing JSON artifacts or Markdown reports under `artifacts/balance/` or `docs/reports/`.

The approved active candidate namespace remains writable:

- `artifacts/balance/phase-6b.2-stage-a-003-active-candidate-results.json`
- `docs/reports/phase-6b.2-stage-a-003-active-candidate-balance-validation-report.md`

All earlier Phase 6A/6B baseline, rejected-candidate, search-space, sensitivity and report outputs are protected so implementation commands fail before they can overwrite historical evidence.
