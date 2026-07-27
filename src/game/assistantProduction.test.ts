import { describe, expect, it } from "vitest";
import {
  calculateAssistantBugsPerSecond,
  calculateAssistantProductionStat,
  getAssistantProductionDebugBreakdown,
} from "./assistantProduction";
import { ACTIVE_RUNTIME_PARAMETER_VERSION } from "./runtimeCandidateParameters";

const noModifiers = {
  ownedSupportUpgradeIds: [],
  reachedMilestoneIds: [],
} as const;

describe("Assistant production calculator", () => {
  it("produces the candidate base rate at level 0", () => {
    expect(calculateAssistantBugsPerSecond({ level: 0, ...noModifiers })).toBe(0.8);
  });

  it("matches the candidate level 8 milestone formula", () => {
    expect(
      calculateAssistantBugsPerSecond({
        level: 8,
        ...noModifiers,
        reachedMilestoneIds: ["milestone_assistant_first"],
      }),
    ).toBe(3.12);
  });

  it("applies immediate Support before the milestone multiplier", () => {
    expect(
      calculateAssistantBugsPerSecond({
        level: 8,
        ownedSupportUpgradeIds: ["support_immediate_production"],
        reachedMilestoneIds: ["milestone_assistant_first"],
      }),
    ).toBe(3.406);
  });

  it("exposes the same canonical calculation breakdown used by production", () => {
    const input = {
      level: 8,
      ownedSupportUpgradeIds: ["support_immediate_production"],
      reachedMilestoneIds: ["milestone_assistant_first"],
    } as const;
    const result = calculateAssistantProductionStat(input);

    expect(result.value).toBe(calculateAssistantBugsPerSecond(input));
    expect(result.breakdown).toMatchObject({
      statId: "assistant_bugs_per_second",
      baseValue: 2.4,
      finalValue: 3.406,
    });
    expect(result.breakdown.appliedModifiers.map(({ sourceId }) => sourceId)).toEqual([
      "support_immediate_production",
      "milestone_assistant_first",
    ]);
  });

  it("exposes the complete debug-only production composition", () => {
    const input = {
      level: 8,
      ownedSupportUpgradeIds: ["support_immediate_production"],
      reachedMilestoneIds: ["milestone_assistant_first"],
    } as const;

    expect(getAssistantProductionDebugBreakdown(input)).toEqual({
      scope: "debug_only",
      parameterVersion: ACTIVE_RUNTIME_PARAMETER_VERSION,
      baseRate: 0.8,
      perLevelContribution: 1.6,
      immediateSupportContribution: 0.22,
      preMilestoneRate: 2.62,
      milestoneMultiplier: 1.3,
      finalOnlineRate: calculateAssistantBugsPerSecond(input),
    });
  });

  it("reports inactive optional contributions without mutating diagnostic input", () => {
    const input = Object.freeze({
      level: 0,
      ownedSupportUpgradeIds: Object.freeze([]),
      reachedMilestoneIds: Object.freeze([]),
    });
    const before = JSON.stringify(input);
    const breakdown = getAssistantProductionDebugBreakdown(input);

    expect(breakdown).toMatchObject({
      baseRate: 0.8,
      perLevelContribution: 0,
      immediateSupportContribution: 0,
      preMilestoneRate: 0.8,
      milestoneMultiplier: 1,
      finalOnlineRate: 0.8,
    });
    expect(Object.isFrozen(breakdown)).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
  });

  it.each([
    { level: 1, expected: 1 },
    { level: 7, expected: 2.2 },
    { level: 25, expected: 5.8 },
  ])("matches simulator parity at level $level", ({ level, expected }) => {
    expect(calculateAssistantBugsPerSecond({ level, ...noModifiers })).toBe(expected);
  });

  it("normalizes authoritative results to six decimal places", () => {
    expect(
      calculateAssistantBugsPerSecond({
        level: 3,
        ownedSupportUpgradeIds: ["support_immediate_production"],
        reachedMilestoneIds: ["milestone_assistant_first"],
      }),
    ).toBe(2.106);
  });

  it.each([-1, 1.5, 26, Number.NaN])("rejects invalid level %s", (level) => {
    expect(() => calculateAssistantBugsPerSecond({ level, ...noModifiers })).toThrow(
      "Assistant production level must be an integer from 0 to 25.",
    );
  });
});
