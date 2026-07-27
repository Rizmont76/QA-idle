import { describe, expect, it } from "vitest";
import { initialState } from "../gameData";
import { MVP_IDS, type GameState } from "../types";
import {
  advanceOnlineAssistantProduction,
  purchaseAssistantLevel,
  purchaseAssistantSupportUpgrade,
} from "./commands";
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

  it("spends 120 Money once and adds only 0.22 Bugs per second at level 0", () => {
    const game = buildMiddleQaGame(200, 0);
    const purchase = purchaseAssistantSupportUpgrade(
      game,
      "support_immediate_production",
      100,
    );

    expect(purchase.ok).toBe(true);
    if (!purchase.ok) {
      throw new Error("Immediate Production Support purchase should succeed.");
    }

    expect(purchase.game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 80,
    });
    expect(purchase.events[0]).toMatchObject({
      id: MVP_IDS.events.resourceChanged,
      payload: {
        changes: [
          {
            resourceId: MVP_IDS.resources.money,
            delta: -120,
          },
        ],
      },
    });

    const production = advanceOnlineAssistantProduction(purchase.game, 1, 101);

    expect(production.ok).toBe(true);
    if (!production.ok) {
      throw new Error("Immediate Production Support production should succeed.");
    }

    expect(production.game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 1.02,
      [MVP_IDS.resources.money]: 80,
    });
    expect(production.game.totalMoneyEarned).toBe(purchase.game.totalMoneyEarned);
    expect(production.events[0]).toMatchObject({
      id: MVP_IDS.events.resourceChanged,
      payload: {
        changes: [
          {
            resourceId: MVP_IDS.resources.bugsFound,
            delta: 1.02,
          },
        ],
      },
    });
  });

  it("unlocks Training at level 2, spends 160, and discounts only future levels", () => {
    const startingMoney = 1_000;
    const game = buildMiddleQaGame(startingMoney, 0);

    const lockedPurchase = purchaseAssistantSupportUpgrade(
      game,
      "support_training_economics",
      100,
    );
    expect(lockedPurchase.ok).toBe(false);
    expect(lockedPurchase.game).toBe(game);

    const firstLevel = purchaseAssistantLevel(game, 101);
    expect(firstLevel.ok).toBe(true);
    if (!firstLevel.ok) {
      throw new Error("First Assistant level purchase should succeed.");
    }

    const secondLevel = purchaseAssistantLevel(firstLevel.game, 102);
    expect(secondLevel.ok).toBe(true);
    if (!secondLevel.ok) {
      throw new Error("Second Assistant level purchase should succeed.");
    }
    expect(secondLevel.game.resources[MVP_IDS.resources.money]).toBe(
      startingMoney - 200 - 238,
    );

    const training = purchaseAssistantSupportUpgrade(
      secondLevel.game,
      "support_training_economics",
      103,
    );
    expect(training.ok).toBe(true);
    if (!training.ok) {
      throw new Error("Training Support purchase should succeed at level 2.");
    }
    expect(training.game.resources[MVP_IDS.resources.money]).toBe(
      startingMoney - 200 - 238 - 160,
    );
    expect(training.events[0]).toMatchObject({
      id: MVP_IDS.events.resourceChanged,
      payload: {
        changes: [
          {
            resourceId: MVP_IDS.resources.money,
            delta: -160,
          },
        ],
      },
    });

    const discountedLevel = purchaseAssistantLevel(training.game, 104);
    expect(discountedLevel.ok).toBe(true);
    if (!discountedLevel.ok) {
      throw new Error("Discounted Assistant level purchase should succeed.");
    }
    expect(discountedLevel.game.assistant.level).toBe(3);
    expect(discountedLevel.game.resources[MVP_IDS.resources.money]).toBe(
      startingMoney - 200 - 238 - 160 - 213,
    );
    expect(discountedLevel.events[1]).toMatchObject({
      id: MVP_IDS.events.assistantLevelPurchased,
      payload: {
        previousLevel: 2,
        newLevel: 3,
        cost: {
          resourceId: MVP_IDS.resources.money,
          amount: 213,
        },
      },
    });
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
