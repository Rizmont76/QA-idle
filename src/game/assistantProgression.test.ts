import { describe, expect, it } from "vitest";
import {
  assistantMilestoneDefinitions,
  assistantSupportUpgradeDefinitions,
  validateAssistantProgressionDefinitions,
} from "./assistantProgression";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

function requireDefinition<T>(definition: T | undefined, label: string): T {
  if (definition === undefined) {
    throw new Error(`Missing ${label} test fixture.`);
  }

  return definition;
}

describe("Assistant Support Upgrade and milestone records", () => {
  it("defines exactly the three stable optional one-time Support Upgrade IDs", () => {
    expect(assistantSupportUpgradeDefinitions).toEqual([
      {
        id: "support_immediate_production",
        provisionalName: "Desk Setup Kit",
        ownership: "one_time",
        requiredCareerStage: "middle_qa",
        role: "immediate_production",
      },
      {
        id: "support_training_economics",
        provisionalName: "Mentoring Checklist",
        ownership: "one_time",
        requiredCareerStage: "middle_qa",
        role: "training_economics",
      },
      {
        id: "support_offline_handover",
        provisionalName: "Handover Notes",
        ownership: "one_time",
        requiredCareerStage: "middle_qa",
        role: "offline_handover",
      },
    ]);
  });

  it("defines the candidate milestone levels and roles", () => {
    expect(assistantMilestoneDefinitions).toEqual([
      {
        id: "milestone_assistant_first",
        level: activeRuntimeCandidateParameters.milestones[0].level,
        role: "first_producer",
      },
      {
        id: "milestone_assistant_capstone",
        level: activeRuntimeCandidateParameters.milestones[1].level,
        role: "capstone",
      },
    ]);
  });

  it("rejects duplicate, extra, and missing Support Upgrade IDs", () => {
    const immediateSupport = requireDefinition(
      assistantSupportUpgradeDefinitions[0],
      "immediate Support Upgrade",
    );
    const trainingSupport = requireDefinition(
      assistantSupportUpgradeDefinitions[1],
      "training Support Upgrade",
    );
    const result = validateAssistantProgressionDefinitions([
      immediateSupport,
      immediateSupport,
      {
        ...trainingSupport,
        id: "support_unapproved" as "support_immediate_production",
      },
    ]);

    expect(result).toEqual([
      "Duplicate Assistant Support Upgrade ID: support_immediate_production.",
      "Unsupported Assistant Support Upgrade ID: support_unapproved.",
      "Missing Assistant Support Upgrade ID: support_training_economics.",
      "Missing Assistant Support Upgrade ID: support_offline_handover.",
    ]);
  });

  it("rejects milestones that do not match active candidate levels", () => {
    const firstMilestone = requireDefinition(
      assistantMilestoneDefinitions[0],
      "first Assistant milestone",
    );
    const capstoneMilestone = requireDefinition(
      assistantMilestoneDefinitions[1],
      "capstone Assistant milestone",
    );

    expect(
      validateAssistantProgressionDefinitions(assistantSupportUpgradeDefinitions, [
        {
          ...firstMilestone,
          level: 7,
        },
        capstoneMilestone,
      ]),
    ).toEqual(["First Assistant milestone level must match the active candidate."]);
  });
});
