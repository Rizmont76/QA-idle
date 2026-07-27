import { getMvpEndpointStatus } from "../../src/game/assistantEndpoint.ts";
import {
  ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
  ACTIVE_RUNTIME_PARAMETER_VERSION,
} from "../../src/game/runtimeCandidateParameters.ts";
import { JUNIOR_BASELINE_SNAPSHOT } from "./junior-baseline-snapshot.mjs";

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}

function projectOfflineSummary(summary) {
  if (summary === null) {
    return null;
  }

  return {
    started_at: summary.startedAt,
    ended_at: summary.endedAt,
    elapsed_seconds: summary.elapsedSeconds,
    eligible_seconds: summary.eligibleSeconds,
    online_bugs_per_second: summary.onlineBugsPerSecond,
    offline_efficiency: summary.offlineEfficiency,
    bugs_found_gained: summary.bugsFoundGained,
  };
}

export function createRuntimeSimulatorComparisonSnapshot(game) {
  const endpoint = getMvpEndpointStatus(game);

  return deepFreeze({
    candidate_id: ACTIVE_RUNTIME_PARAMETER_PROFILE_ID,
    parameter_version: ACTIVE_RUNTIME_PARAMETER_VERSION,
    junior_baseline_version: JUNIOR_BASELINE_SNAPSHOT.snapshotVersion,
    assistant_level: game.assistant.level,
    supports_owned: [...game.assistant.ownedSupportUpgradeIds].sort(),
    milestones_reached: [...game.assistant.reachedMilestoneIds].sort(),
    endpoint_conditions_satisfied: endpoint.endpointConditionsSatisfied,
    endpoint_completed: endpoint.endpointComplete,
    offline_summary: projectOfflineSummary(game.offlineProgress.pendingSummary),
  });
}

function formatValue(value) {
  return JSON.stringify(value);
}

function collectMismatches(actual, expected, path = "") {
  if (
    actual === null ||
    expected === null ||
    typeof actual !== "object" ||
    typeof expected !== "object"
  ) {
    return Object.is(actual, expected)
      ? []
      : [`${path}: expected ${formatValue(expected)}, received ${formatValue(actual)}`];
  }

  const keys = [...new Set([...Object.keys(actual), ...Object.keys(expected)])].sort();

  return keys.flatMap((key) =>
    collectMismatches(actual[key], expected[key], path ? `${path}.${key}` : key),
  );
}

export function compareRuntimeSnapshotToSimulatorFixture(game, fixtureSuite, fixture) {
  const actual = createRuntimeSimulatorComparisonSnapshot(game);
  const expected = {
    candidate_id: fixtureSuite.candidateId,
    parameter_version: fixtureSuite.parameterVersion,
    junior_baseline_version: fixtureSuite.juniorBaselineVersion,
    ...structuredClone(fixture.expected),
  };

  return {
    actual,
    expected: deepFreeze(expected),
    mismatches: Object.freeze(collectMismatches(actual, expected)),
  };
}

export function validateRuntimeSnapshotFixture(game, fixtureSuite, fixture) {
  const comparison = compareRuntimeSnapshotToSimulatorFixture(
    game,
    fixtureSuite,
    fixture,
  );

  if (comparison.mismatches.length > 0) {
    throw new Error(
      `Runtime/simulator snapshot mismatch for fixture "${fixture.id}" ` +
        `[candidate ${fixtureSuite.candidateId}; parameter version ${fixtureSuite.parameterVersion}]: ` +
        comparison.mismatches.join("; "),
    );
  }

  return comparison.actual;
}
