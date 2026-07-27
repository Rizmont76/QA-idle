import { describe, expect, it } from "vitest";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";
import { calculateAssistantOfflineProduction } from "./assistantOfflineProduction";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

const unlockedLevelZero = {
  assistantUnlocked: true,
  level: 0,
  elapsedOfflineSeconds: 100,
  ownedSupportUpgradeIds: [],
  reachedMilestoneIds: [],
} as const;

describe("Assistant offline production calculator", () => {
  it("reuses the online Assistant rate with base offline efficiency", () => {
    const result = calculateAssistantOfflineProduction(unlockedLevelZero);

    expect(result).toEqual({
      elapsedOfflineSeconds: 100,
      eligibleOfflineSeconds: 100,
      onlineBugsPerSecond: calculateAssistantBugsPerSecond(unlockedLevelZero),
      offlineEfficiency: 0.35,
      bugsFoundGained: 28,
    });
  });

  it("caps eligible time without capping Bugs Found storage", () => {
    const result = calculateAssistantOfflineProduction({
      ...unlockedLevelZero,
      elapsedOfflineSeconds: 10_000,
    });

    expect(result.eligibleOfflineSeconds).toBe(
      activeRuntimeCandidateParameters.offlineProgress.timeCapSeconds,
    );
    expect(result.bugsFoundGained).toBe(2_016);
  });

  it("uses Handover Support only for the offline efficiency stat", () => {
    const withoutSupport = calculateAssistantOfflineProduction(unlockedLevelZero);
    const withSupport = calculateAssistantOfflineProduction({
      ...unlockedLevelZero,
      ownedSupportUpgradeIds: ["support_offline_handover"],
    });

    expect(withSupport.onlineBugsPerSecond).toBe(withoutSupport.onlineBugsPerSecond);
    expect(withSupport.offlineEfficiency).toBe(0.62);
    expect(withSupport.bugsFoundGained).toBe(49.6);
  });

  it("includes online production Supports and milestones through the shared calculator", () => {
    const input = {
      assistantUnlocked: true,
      level: 8,
      elapsedOfflineSeconds: 60,
      ownedSupportUpgradeIds: [
        "support_immediate_production",
        "support_offline_handover",
      ],
      reachedMilestoneIds: ["milestone_assistant_first"],
    } as const;
    const result = calculateAssistantOfflineProduction(input);

    expect(result.onlineBugsPerSecond).toBe(calculateAssistantBugsPerSecond(input));
    expect(result).toMatchObject({
      eligibleOfflineSeconds: 60,
      offlineEfficiency: 0.62,
      bugsFoundGained: 126.7032,
    });
  });

  it("produces no offline gain before Assistant unlock", () => {
    expect(
      calculateAssistantOfflineProduction({
        ...unlockedLevelZero,
        assistantUnlocked: false,
        elapsedOfflineSeconds: 7_200,
      }),
    ).toEqual({
      elapsedOfflineSeconds: 7_200,
      eligibleOfflineSeconds: 0,
      onlineBugsPerSecond: 0,
      offlineEfficiency: 0,
      bugsFoundGained: 0,
    });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid elapsed offline seconds %s",
    (elapsedOfflineSeconds) => {
      expect(() =>
        calculateAssistantOfflineProduction({
          ...unlockedLevelZero,
          elapsedOfflineSeconds,
        }),
      ).toThrow("Elapsed offline seconds must be a finite non-negative number.");
    },
  );
});
