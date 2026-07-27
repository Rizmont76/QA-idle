import { MVP_IDS } from "../types";
import type { AssistantSupportUpgradeId, GameState } from "../types";
import { calculateAssistantNextLevelCost } from "./assistantLevelCost";
import { calculateAssistantBugsPerSecond } from "./assistantProduction";
import { assistantSupportUpgradeDefinitions } from "./assistantProgression";
import { validateAssistantSupportPurchase } from "./assistantSupportUpgrades";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

export type AssistantSupportPreview =
  | {
      readonly kind: "production";
      readonly before: number;
      readonly after: number;
      readonly unit: "bugs_per_second";
    }
  | {
      readonly kind: "future_level_cost";
      readonly before: number | null;
      readonly after: number | null;
      readonly multiplier: number;
      readonly unit: "money";
    }
  | {
      readonly kind: "offline_efficiency";
      readonly before: number;
      readonly after: number;
      readonly unit: "ratio";
    };

export interface AssistantSupportCardView {
  readonly id: AssistantSupportUpgradeId;
  readonly name: string;
  readonly roleLabel: string;
  readonly price: number;
  readonly unlockLevel: number;
  readonly unlocked: boolean;
  readonly owned: boolean;
  readonly affordable: boolean | null;
  readonly canCommit: boolean;
  readonly reasonUnavailable: string | null;
  readonly preview: AssistantSupportPreview;
}

const roleLabels = {
  immediate_production: "Immediate Production Support",
  training_economics: "Long-Term Training Support",
  offline_handover: "Offline Handover Support",
} as const;

function withSupport(
  ownedSupportUpgradeIds: readonly AssistantSupportUpgradeId[],
  supportId: AssistantSupportUpgradeId,
) {
  return ownedSupportUpgradeIds.includes(supportId)
    ? ownedSupportUpgradeIds
    : [...ownedSupportUpgradeIds, supportId];
}

function getPreview(
  game: GameState,
  supportId: AssistantSupportUpgradeId,
): AssistantSupportPreview {
  const ownedWithSupport = withSupport(game.assistant.ownedSupportUpgradeIds, supportId);

  switch (supportId) {
    case "support_immediate_production":
      return {
        kind: "production",
        before: calculateAssistantBugsPerSecond({
          level: game.assistant.level,
          ownedSupportUpgradeIds: game.assistant.ownedSupportUpgradeIds,
          reachedMilestoneIds: game.assistant.reachedMilestoneIds,
        }),
        after: calculateAssistantBugsPerSecond({
          level: game.assistant.level,
          ownedSupportUpgradeIds: ownedWithSupport,
          reachedMilestoneIds: game.assistant.reachedMilestoneIds,
        }),
        unit: "bugs_per_second",
      };
    case "support_training_economics":
      return {
        kind: "future_level_cost",
        before: calculateAssistantNextLevelCost({
          currentLevel: game.assistant.level,
          ownedSupportUpgradeIds: game.assistant.ownedSupportUpgradeIds,
        }),
        after: calculateAssistantNextLevelCost({
          currentLevel: game.assistant.level,
          ownedSupportUpgradeIds: ownedWithSupport,
        }),
        multiplier:
          activeRuntimeCandidateParameters.assistant.cost.trainingSupportCostMultiplier,
        unit: "money",
      };
    case "support_offline_handover":
      return {
        kind: "offline_efficiency",
        before: activeRuntimeCandidateParameters.offlineProgress.baseEfficiency,
        after:
          activeRuntimeCandidateParameters.offlineProgress.efficiencyWithHandoverSupport,
        unit: "ratio",
      };
  }
}

export function getAssistantSupportCardViews(
  game: GameState,
): readonly AssistantSupportCardView[] {
  if (game.careerStage !== MVP_IDS.careerStages.middleQa || !game.assistant.unlocked) {
    return [];
  }

  return assistantSupportUpgradeDefinitions.map((definition) => {
    const unlocked = game.assistant.availableSupportUpgradeIds.includes(definition.id);
    const owned = game.assistant.ownedSupportUpgradeIds.includes(definition.id);
    const validation = validateAssistantSupportPurchase(game, definition.id);
    const canCommit = validation.ok;
    const affordable = unlocked && !owned ? canCommit : null;
    const reasonUnavailable = canCommit
      ? null
      : owned
        ? `${definition.provisionalName} is already owned.`
        : unlocked
          ? `Not affordable: requires ${String(
              definition.price,
            )} Money; ${String(game.resources[MVP_IDS.resources.money])} available.`
          : `Unlocks at Assistant level ${String(definition.unlockLevel)}.`;

    return {
      id: definition.id,
      name: definition.provisionalName,
      roleLabel: roleLabels[definition.role],
      price: definition.price,
      unlockLevel: definition.unlockLevel,
      unlocked,
      owned,
      affordable,
      canCommit,
      reasonUnavailable,
      preview: getPreview(game, definition.id),
    };
  });
}
