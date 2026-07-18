import { describe, expect, it } from "vitest";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";

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
