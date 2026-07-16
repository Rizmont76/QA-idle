import { describe, expect, it } from "vitest";
import {
  JUNIOR_QA_ASSISTANT_ID,
  assertValidAssistantDefinition,
  isAssistantLevelValid,
  isAssistantProductionEligible,
  juniorQaAssistantDefinition,
  validateAssistantDefinition,
} from "./assistant";

describe("Junior QA Assistant data contract", () => {
  it("validates the single stable Assistant definition and canonical ID", () => {
    expect(validateAssistantDefinition(juniorQaAssistantDefinition)).toEqual([]);
    expect(JUNIOR_QA_ASSISTANT_ID).toBe("assistant_junior_qa");
    expect(juniorQaAssistantDefinition.id).toBe(JUNIOR_QA_ASSISTANT_ID);
  });

  it("defines the candidate-owned inclusive level range from 0 through 25", () => {
    expect(juniorQaAssistantDefinition.level).toEqual({
      minimum: 0,
      maximum: 25,
    });
    expect(isAssistantLevelValid(0)).toBe(true);
    expect(isAssistantLevelValid(25)).toBe(true);
    expect(isAssistantLevelValid(-1)).toBe(false);
    expect(isAssistantLevelValid(26)).toBe(false);
  });

  it("permits level 0 production only after its Middle QA promotion unlock", () => {
    expect(isAssistantProductionEligible(0, false)).toBe(false);
    expect(isAssistantProductionEligible(0, true)).toBe(true);
  });

  it("models exactly one persistent producer without a Team or multiple-unit contract", () => {
    expect(juniorQaAssistantDefinition.ownership).toEqual({
      type: "single_persistent",
      maximumUnits: 1,
    });
  });

  it("rejects malformed and contradictory definitions loudly", () => {
    const malformedDefinition = {
      ...juniorQaAssistantDefinition,
      displayName: "",
      unlock: {
        completedPromotionId: "promotion_other",
      },
      ownership: {
        type: "multiple_units",
        maximumUnits: 2,
      },
      level: {
        minimum: 1,
        maximum: -1,
      },
      production: {
        resourceId: "money",
        eligibleAtLevelZero: false,
      },
    };

    expect(validateAssistantDefinition(malformedDefinition)).toEqual([
      "Assistant definition displayName must be a non-empty string.",
      "Assistant definition must unlock from the completed Junior to Middle promotion.",
      "Assistant definition ownership type must be single_persistent.",
      "Playable Idle MVP Assistant definition must allow exactly one unit.",
      "Assistant definition minimum level must be 0.",
      "Assistant definition maximum level must match the active candidate.",
      "Assistant definition minimum level cannot exceed maximum level.",
      "Assistant definition production resource must be Bugs Found.",
      "Assistant definition must allow production eligibility at level 0.",
    ]);
    expect(() => assertValidAssistantDefinition(malformedDefinition)).toThrow(
      "Invalid Assistant definition",
    );
  });
});
