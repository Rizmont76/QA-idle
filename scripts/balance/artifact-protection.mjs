import { relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPOSITORY_ROOT = resolve(process.cwd());

export const ACTIVE_BALANCE_ARTIFACT_PATHS = Object.freeze([
  "artifacts/balance/phase-6b.2-stage-a-003-active-candidate-results.json",
  "docs/reports/phase-6b.2-stage-a-003-active-candidate-balance-validation-report.md",
]);

export const PROTECTED_HISTORICAL_BALANCE_ARTIFACT_PATHS = Object.freeze([
  "artifacts/balance/phase-6a-baseline-results.json",
  "artifacts/balance/phase-6a.1-corrected-baseline-results.json",
  "artifacts/balance/phase-6a.2-final-corrected-baseline-results.json",
  "artifacts/balance/phase-6b-candidate-results.json",
  "artifacts/balance/phase-6b-recommended-parameters.json",
  "artifacts/balance/phase-6b-search-space.json",
  "artifacts/balance/phase-6b-sensitivity-results.json",
  "artifacts/balance/phase-6b.1-robust-candidate-results.json",
  "artifacts/balance/phase-6b.1-robust-search-space.json",
  "artifacts/balance/phase-6b.1-robust-sensitivity-results.json",
  "artifacts/balance/phase-6b.2-expanded-candidate-results.json",
  "artifacts/balance/phase-6b.2-expanded-search-space.json",
  "artifacts/balance/phase-6b.2-expanded-sensitivity-results.json",
  "artifacts/balance/phase-6b.2-feasibility-analysis.json",
  "docs/reports/phase-6a-balance-acceptance-report.md",
  "docs/reports/phase-6a.1-corrected-balance-acceptance-report.md",
  "docs/reports/phase-6a.2-final-corrected-balance-acceptance-report.md",
  "docs/reports/phase-6b-balance-tuning-report.md",
  "docs/reports/phase-6b.1-passive-economy-report.md",
  "docs/reports/phase-6b.2-expanded-passive-economy-report.md",
]);

const PROTECTED_PATH_SET = new Set(PROTECTED_HISTORICAL_BALANCE_ARTIFACT_PATHS);

function toFileUrl(pathOrUrl) {
  if (pathOrUrl instanceof URL) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith("file:")) {
    return new URL(pathOrUrl);
  }

  if (/^[A-Za-z]:[\\/]/.test(pathOrUrl)) {
    return pathToFileURL(pathOrUrl);
  }

  return new URL(pathOrUrl, import.meta.url);
}

export function balanceArtifactRepositoryPath(pathOrUrl) {
  const absolutePath = fileURLToPath(toFileUrl(pathOrUrl));
  return relative(REPOSITORY_ROOT, absolutePath).split(sep).join("/");
}

export function isProtectedHistoricalBalanceArtifact(pathOrUrl) {
  return PROTECTED_PATH_SET.has(balanceArtifactRepositoryPath(pathOrUrl));
}

export function assertWritableBalanceArtifact(pathOrUrl) {
  const repositoryPath = balanceArtifactRepositoryPath(pathOrUrl);

  if (!PROTECTED_PATH_SET.has(repositoryPath)) {
    return;
  }

  throw new Error(
    `Refusing to overwrite protected historical balance artifact: ${repositoryPath}. ` +
      "Write active candidate output to the approved phase-6b.2-stage-a-003 artifact paths instead.",
  );
}
