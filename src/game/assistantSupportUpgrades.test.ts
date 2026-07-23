import { describe, expect, it } from "vitest";
import { initialState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import { purchaseAssistantSupportUpgrade } from "./commands";
import { createAssistantModifierRegistry } from "./assistantModifiers";
import {
  assistantSupportUpgradeDefinitions,
  assistantSupportUpgradeIds,
} from "./assistantProgression";
import {
  getAssistantSupportUpgradeDefinition,
  validateAssistantSupportPurchase,
} from "./assistantSupportUpgrades";

function buildMiddleQaGame(money = 500, assistantLevel = 25): GameState {
  const game = initialState;
  return {
    ...game,
    careerStage: MVP_IDS.careerStages.middleQa,
    resources: {
      ...game.resources,
      [MVP_IDS.resources.money]: money,
    },
    assistant: {
      ...game.assistant,
      unlocked: true,
      level: assistantLevel,
    },
  };
}

describe("Assistant Support Upgrade framework", () => {
  it("exposes exactly one canonical registry of three optional one-time IDs", () => {
    expect(assistantSupportUpgradeIds).toEqual([
      "support_immediate_production",
      "support_training_economics",
      "support_offline_handover",
    ]);
    expect(new Set(assistantSupportUpgradeIds).size).toBe(3);
    expect(
      assistantSupportUpgradeDefinitions.map(
        ({ ownership, optional, requiredCareerStage }) => ({
          ownership,
          optional,
          requiredCareerStage,
        }),
      ),
    ).toEqual([
      { ownership: "one_time", optional: true, requiredCareerStage: "middle_qa" },
      { ownership: "one_time", optional: true, requiredCareerStage: "middle_qa" },
      { ownership: "one_time", optional: true, requiredCareerStage: "middle_qa" },
    ]);
    expect(getAssistantSupportUpgradeDefinition("support_unapproved")).toBeUndefined();
  });

  it.each(assistantSupportUpgradeDefinitions)(
    "purchases $id once through shared Money and activates its registered modifier",
    (definition) => {
      const game = buildMiddleQaGame(definition.price);
      const result = purchaseAssistantSupportUpgrade(game, definition.id, 100);

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(`${definition.id} purchase should succeed.`);
      }

      expect(result.game.resources[MVP_IDS.resources.money]).toBe(0);
      expect(result.game.assistant.ownedSupportUpgradeIds).toEqual([definition.id]);
      expect(result.events.map(({ id }) => id)).toEqual([
        MVP_IDS.events.resourceChanged,
        MVP_IDS.events.upgradePurchased,
      ]);
      expect(result.events[1]).toMatchObject({
        payload: {
          upgradeId: definition.id,
          previousLevel: 0,
          newLevel: 1,
          modifierDefinitionIds: [definition.modifierDefinitionId],
        },
      });

      const { registry, failures } = createAssistantModifierRegistry(
        result.game.assistant,
      );
      expect(failures).toEqual([]);
      expect(Object.values(registry).map(({ definitionId }) => definitionId)).toEqual([
        definition.modifierDefinitionId,
      ]);
    },
  );

  it("blocks a duplicate purchase without spending Money or duplicating ownership", () => {
    const game = buildMiddleQaGame();
    const first = purchaseAssistantSupportUpgrade(
      game,
      "support_immediate_production",
      100,
    );
    expect(first.ok).toBe(true);
    if (!first.ok) {
      throw new Error("Initial Support purchase should succeed.");
    }

    const duplicate = purchaseAssistantSupportUpgrade(
      first.game,
      "support_immediate_production",
      101,
    );
    expect(duplicate.ok).toBe(false);
    expect(duplicate.game).toBe(first.game);
    expect(duplicate.events).toEqual([]);
    expect(duplicate.game.resources[MVP_IDS.resources.money]).toBe(
      first.game.resources[MVP_IDS.resources.money],
    );
    expect(duplicate.game.assistant.ownedSupportUpgradeIds).toEqual([
      "support_immediate_production",
    ]);
  });

  it("validates stage, unlock level, definition, and affordability before mutation", () => {
    const junior = validateAssistantSupportPurchase(
      initialState,
      "support_immediate_production",
    );
    const locked = validateAssistantSupportPurchase(
      buildMiddleQaGame(500, 0),
      "support_training_economics",
    );
    const unknown = validateAssistantSupportPurchase(
      buildMiddleQaGame(),
      "support_unapproved",
    );
    const unaffordable = validateAssistantSupportPurchase(
      buildMiddleQaGame(0),
      "support_immediate_production",
    );

    expect(junior.ok || junior.failures[0]?.code).toBe("not_unlocked");
    expect(locked.ok || locked.failures[0]?.code).toBe("not_unlocked");
    expect(unknown.ok || unknown.failures[0]?.code).toBe("definition_not_found");
    expect(unaffordable.ok || unaffordable.failures[0]?.code).toBe("not_affordable");
  });
});
