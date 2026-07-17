import {
  activeRuntimeCandidateParameters,
  type AssistantMilestoneId,
  type AssistantSupportUpgradeId,
} from "./runtimeCandidateParameters";

export type AssistantSupportUpgradeRole =
  "immediate_production" | "training_economics" | "offline_handover";
export type AssistantMilestoneRole = "first_producer" | "capstone";

export interface AssistantSupportUpgradeDefinition {
  readonly id: AssistantSupportUpgradeId;
  readonly provisionalName: string;
  readonly ownership: "one_time";
  readonly requiredCareerStage: "middle_qa";
  readonly role: AssistantSupportUpgradeRole;
}

export interface AssistantMilestoneDefinition {
  readonly id: AssistantMilestoneId;
  readonly level: number;
  readonly role: AssistantMilestoneRole;
}

export const assistantSupportUpgradeDefinitions: readonly AssistantSupportUpgradeDefinition[] =
  Object.freeze([
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

export const assistantMilestoneDefinitions: readonly AssistantMilestoneDefinition[] =
  Object.freeze([
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

const EXPECTED_SUPPORT_UPGRADE_IDS = new Set<AssistantSupportUpgradeId>([
  "support_immediate_production",
  "support_training_economics",
  "support_offline_handover",
]);
const EXPECTED_MILESTONE_IDS = new Set<AssistantMilestoneId>([
  "milestone_assistant_first",
  "milestone_assistant_capstone",
]);

function validateExactIdSet(
  definitions: readonly { readonly id: string }[],
  expectedIds: ReadonlySet<string>,
  label: string,
): string[] {
  const failures: string[] = [];
  const seenIds = new Set<string>();

  for (const definition of definitions) {
    if (seenIds.has(definition.id)) {
      failures.push(`Duplicate ${label} ID: ${definition.id}.`);
    }
    seenIds.add(definition.id);

    if (!expectedIds.has(definition.id)) {
      failures.push(`Unsupported ${label} ID: ${definition.id}.`);
    }
  }

  for (const expectedId of expectedIds) {
    if (!seenIds.has(expectedId)) {
      failures.push(`Missing ${label} ID: ${expectedId}.`);
    }
  }

  return failures;
}

export function validateAssistantProgressionDefinitions(
  supportUpgrades: readonly AssistantSupportUpgradeDefinition[] = assistantSupportUpgradeDefinitions,
  milestones: readonly AssistantMilestoneDefinition[] = assistantMilestoneDefinitions,
): string[] {
  const failures = [
    ...validateExactIdSet(
      supportUpgrades,
      EXPECTED_SUPPORT_UPGRADE_IDS,
      "Assistant Support Upgrade",
    ),
    ...validateExactIdSet(milestones, EXPECTED_MILESTONE_IDS, "Assistant milestone"),
  ];

  const milestoneLevels = new Map(
    milestones.map((milestone) => [milestone.id, milestone.level]),
  );
  if (
    milestoneLevels.get("milestone_assistant_first") !==
    activeRuntimeCandidateParameters.milestones[0].level
  ) {
    failures.push("First Assistant milestone level must match the active candidate.");
  }
  if (
    milestoneLevels.get("milestone_assistant_capstone") !==
    activeRuntimeCandidateParameters.milestones[1].level
  ) {
    failures.push("Capstone Assistant milestone level must match the active candidate.");
  }

  return failures;
}

export function assertValidAssistantProgressionDefinitions(): void {
  const failures = validateAssistantProgressionDefinitions();

  if (failures.length > 0) {
    throw new Error(`Invalid Assistant progression definitions: ${failures.join(" ")}`);
  }
}
