import { describe, expect, it } from "vitest";
import runtimeSnapshotFixtures from "../../data/balance/runtime-snapshot-fixtures.json" with { type: "json" };
import { createNewGameState } from "../../src/gameData.ts";
import { MVP_IDS } from "../../src/types.ts";
import {
  compareRuntimeSnapshotToSimulatorFixture,
  createRuntimeSimulatorComparisonSnapshot,
  validateRuntimeSnapshotFixture,
} from "./runtime-snapshot-fixtures.mjs";

function buildFixtureGame(fixtureId) {
  const game = createNewGameState(1000);
  const promotedGame = {
    ...game,
    careerStage: MVP_IDS.careerStages.middleQa,
    promotion: {
      ...game.promotion,
      completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
    },
  };

  if (fixtureId === "assistant-level-5-offline-return") {
    return {
      ...promotedGame,
      assistant: {
        ...game.assistant,
        unlocked: true,
        level: 5,
        ownedSupportUpgradeIds: ["support_offline_handover"],
        productionObservedAfterUnlock: true,
      },
      offlineProgress: {
        ...game.offlineProgress,
        pendingSummary: {
          startedAt: 1000,
          endedAt: 8200,
          elapsedSeconds: 7200,
          eligibleSeconds: 7200,
          onlineBugsPerSecond: 1.8,
          offlineEfficiency: 0.62,
          bugsFoundGained: 8035.2,
        },
      },
    };
  }

  if (fixtureId === "assistant-level-8-endpoint-complete") {
    return {
      ...promotedGame,
      assistant: {
        ...game.assistant,
        unlocked: true,
        level: 8,
        reachedMilestoneIds: ["milestone_assistant_first"],
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: true,
      },
      endpointCompleted: true,
    };
  }

  throw new Error(`Missing runtime state builder for fixture "${fixtureId}".`);
}

function fixture(id) {
  const found = runtimeSnapshotFixtures.fixtures.find((item) => item.id === id);

  if (!found) {
    throw new Error(`Missing simulator fixture "${id}".`);
  }

  return found;
}

describe("simulator/runtime comparison fixtures", () => {
  it("generates a versioned runtime snapshot without mutating gameplay state", () => {
    const game = buildFixtureGame("assistant-level-5-offline-return");
    const originalGame = structuredClone(game);
    const snapshot = createRuntimeSimulatorComparisonSnapshot(game);

    expect(snapshot).toMatchObject({
      candidate_id: runtimeSnapshotFixtures.candidateId,
      parameter_version: runtimeSnapshotFixtures.parameterVersion,
      junior_baseline_version: runtimeSnapshotFixtures.juniorBaselineVersion,
      assistant_level: 5,
      supports_owned: ["support_offline_handover"],
      milestones_reached: [],
      endpoint_completed: false,
      offline_summary: runtimeSnapshotFixtures.fixtures[0].expected.offline_summary,
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.offline_summary)).toBe(true);
    expect(game).toEqual(originalGame);
  });

  it.each(runtimeSnapshotFixtures.fixtures)(
    "validates runtime state against simulator fixture $id",
    (simulatorFixture) => {
      expect(
        validateRuntimeSnapshotFixture(
          buildFixtureGame(simulatorFixture.id),
          runtimeSnapshotFixtures,
          simulatorFixture,
        ),
      ).toMatchObject(simulatorFixture.expected);
    },
  );

  it("reports candidate ID, parameter version, and mismatched fields", () => {
    const simulatorFixture = fixture("assistant-level-8-endpoint-complete");
    const mismatchedGame = {
      ...buildFixtureGame(simulatorFixture.id),
      assistant: {
        ...buildFixtureGame(simulatorFixture.id).assistant,
        level: 7,
      },
    };
    const comparison = compareRuntimeSnapshotToSimulatorFixture(
      mismatchedGame,
      runtimeSnapshotFixtures,
      simulatorFixture,
    );

    expect(comparison.mismatches).toEqual(
      expect.arrayContaining([
        "assistant_level: expected 8, received 7",
        "endpoint_conditions_satisfied: expected true, received false",
        "endpoint_completed: expected true, received false",
      ]),
    );
    expect(() =>
      validateRuntimeSnapshotFixture(
        mismatchedGame,
        runtimeSnapshotFixtures,
        simulatorFixture,
      ),
    ).toThrow(
      `candidate ${runtimeSnapshotFixtures.candidateId}; parameter version ${runtimeSnapshotFixtures.parameterVersion}`,
    );
  });
});
