import { describe, expect, it } from "vitest";
import { assistantLevelUpgrade, createNewGameState } from "../gameData";
import { MVP_IDS } from "../types";
import {
  calculateAssistantNextLevelCost,
  resolveAssistantNextLevelCost,
} from "./assistantLevelCost";
import { activeRuntimeCandidateParameters } from "./runtimeCandidateParameters";

const TRAINING_SUPPORT_ID = "support_training_economics" as const;

describe("Assistant next-level cost", () => {
  it.each([
    [0, 200],
    [1, 238],
    [2, 280],
    [7, 570],
    [24, 4_882],
  ])("matches the active candidate fixture from level %i", (currentLevel, cost) => {
    expect(
      calculateAssistantNextLevelCost({
        currentLevel,
        ownedSupportUpgradeIds: [],
      }),
    ).toBe(cost);
  });

  it("applies Training only to costs calculated after ownership", () => {
    const beforeOwnership = calculateAssistantNextLevelCost({
      currentLevel: 2,
      ownedSupportUpgradeIds: [],
    });
    const afterOwnership = calculateAssistantNextLevelCost({
      currentLevel: 2,
      ownedSupportUpgradeIds: [TRAINING_SUPPORT_ID],
    });

    expect(beforeOwnership).toBe(280);
    expect(afterOwnership).toBe(213);
    expect(beforeOwnership).toBe(280);
  });

  it("returns no next-level cost at or beyond the finite cap", () => {
    const maxLevel = activeRuntimeCandidateParameters.assistant.maxLevel;

    expect(
      calculateAssistantNextLevelCost({
        currentLevel: maxLevel,
        ownedSupportUpgradeIds: [],
      }),
    ).toBeNull();
    expect(
      calculateAssistantNextLevelCost({
        currentLevel: maxLevel + 1,
        ownedSupportUpgradeIds: [],
      }),
    ).toBeNull();
  });

  it("rejects invalid current levels instead of calculating ambiguous costs", () => {
    expect(() =>
      calculateAssistantNextLevelCost({
        currentLevel: 1.5,
        ownedSupportUpgradeIds: [],
      }),
    ).toThrow("Assistant level must be a non-negative integer.");
  });

  it("adapts the calculation to the level-upgrade cost resolver contract", () => {
    const game = createNewGameState();
    game.assistant.unlocked = true;
    game.assistant.level = 2;
    game.assistant.ownedSupportUpgradeIds = [TRAINING_SUPPORT_ID];

    expect(
      resolveAssistantNextLevelCost({
        definition: assistantLevelUpgrade,
        currentLevel: 2,
        nextLevel: 3,
        game,
      }),
    ).toEqual({
      resourceId: MVP_IDS.resources.money,
      amount: 213,
    });
  });
});
