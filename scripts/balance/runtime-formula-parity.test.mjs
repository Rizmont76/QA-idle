import { describe, expect, it } from "vitest";
import { calculateAssistantBugsPerSecond } from "../../src/game/assistantProduction.ts";
import {
  ACTIVE_CANDIDATE_PARAMETER_VERSION,
  ACTIVE_CANDIDATE_PROFILE_ID,
  SUPPORTS,
} from "./parameters.mjs";
import { assistantRateForProfile } from "./simulator.mjs";

const FIRST_MILESTONE_ID = "milestone_assistant_first";
const APPROVED_PRECISION = 0.000001;

const parityFixtures = [
  {
    id: "level-0-no-support",
    level: 0,
    supportIds: [],
    milestoneIds: [],
  },
  {
    id: "level-3-with-support",
    level: 3,
    supportIds: [SUPPORTS.immediate],
    milestoneIds: [],
  },
  {
    id: "level-5-no-support",
    level: 5,
    supportIds: [],
    milestoneIds: [],
  },
  {
    id: "level-8-no-support-milestone",
    level: 8,
    supportIds: [],
    milestoneIds: [FIRST_MILESTONE_ID],
  },
  {
    id: "level-8-with-support-milestone",
    level: 8,
    supportIds: [SUPPORTS.immediate],
    milestoneIds: [FIRST_MILESTONE_ID],
  },
].map((fixture) => ({
  ...fixture,
  profileId: ACTIVE_CANDIDATE_PROFILE_ID,
  parameterVersion: ACTIVE_CANDIDATE_PARAMETER_VERSION,
}));

function assertParity(fixture, runtimeValue, simulatorValue) {
  const difference = Math.abs(runtimeValue - simulatorValue);
  if (difference > APPROVED_PRECISION) {
    throw new Error(
      `Assistant production parity mismatch for ${fixture.id} ` +
        `[profile ${fixture.profileId}; parameter version ${fixture.parameterVersion}]: ` +
        `runtime=${runtimeValue}, simulator=${simulatorValue}, difference=${difference}, ` +
        `approved precision=${APPROVED_PRECISION}.`,
    );
  }
}

describe("active candidate simulator/runtime formula parity", () => {
  it("records active profile metadata on every fixture", () => {
    expect(parityFixtures).not.toHaveLength(0);
    for (const fixture of parityFixtures) {
      expect(fixture.profileId).toBe(ACTIVE_CANDIDATE_PROFILE_ID);
      expect(fixture.parameterVersion).toBe(ACTIVE_CANDIDATE_PARAMETER_VERSION);
    }
  });

  it.each(parityFixtures)("matches $id [$parameterVersion]", (fixture) => {
    const runtimeValue = calculateAssistantBugsPerSecond({
      level: fixture.level,
      ownedSupportUpgradeIds: fixture.supportIds,
      reachedMilestoneIds: fixture.milestoneIds,
    });
    const simulatorValue = assistantRateForProfile(
      {
        assistantUnlocked: true,
        assistantLevel: fixture.level,
        assistantSupportsOwned: new Set(fixture.supportIds),
        assistantMilestonesReached: new Set(fixture.milestoneIds),
      },
      fixture.profileId,
    ).toNumber();

    assertParity(fixture, runtimeValue, simulatorValue);
  });
});
