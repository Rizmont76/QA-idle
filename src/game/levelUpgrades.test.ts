import { describe, expect, it } from "vitest";
import { assistantLevelUpgrade, createNewGameState } from "../gameData";
import { MVP_IDS } from "../types";
import type { GameState, LevelUpgradeCostResolver } from "../types";
import {
  getFiniteLevelUpgradeLevel,
  getNextLevelUpgradeEligibility,
  planFiniteLevelUpgradePurchase,
} from "./levelUpgrades";

const steppedCostResolver: LevelUpgradeCostResolver = ({ nextLevel }) => ({
  resourceId: MVP_IDS.resources.money,
  amount: nextLevel * 10,
});

function buildAssistantGame(
  overrides: {
    unlocked?: boolean;
    level?: number;
    money?: number;
  } = {},
): GameState {
  const game = createNewGameState(1_000);

  return {
    ...game,
    resources: {
      ...game.resources,
      [MVP_IDS.resources.money]: overrides.money ?? 1_000,
    },
    assistant: {
      ...game.assistant,
      unlocked: overrides.unlocked ?? true,
      level: overrides.level ?? 0,
    },
  };
}

describe("finite level Upgrade System contract", () => {
  it("defines the capped Assistant investment without joining one-time ownership", () => {
    expect(assistantLevelUpgrade).toMatchObject({
      id: MVP_IDS.upgrades.assistantLevels,
      type: "level_based",
      sourceSystemId: "assistant",
      maxLevel: 25,
      ownership: {
        owner: "assistant_state",
        path: "assistant.level",
      },
      costRule: {
        type: "resolver",
        resolverId: "assistant_next_level_cost",
        resourceId: MVP_IDS.resources.money,
      },
      purchaseModes: ["buy_1", "buy_max"],
    });
    expect(assistantLevelUpgrade.milestoneLevels).toEqual([8, 25]);

    const game = buildAssistantGame({ level: 4 });
    expect(getFiniteLevelUpgradeLevel(game)).toBe(4);
    expect(game.upgrades).not.toHaveProperty(MVP_IDS.upgrades.assistantLevels);
  });

  it("queries next-level eligibility through an injected cost resolver", () => {
    expect(
      getNextLevelUpgradeEligibility(
        buildAssistantGame({ level: 2, money: 30 }),
        assistantLevelUpgrade,
        steppedCostResolver,
      ),
    ).toEqual({
      eligible: true,
      currentLevel: 2,
      nextLevel: 3,
      resolvedCost: {
        resourceId: MVP_IDS.resources.money,
        amount: 30,
      },
    });

    expect(
      getNextLevelUpgradeEligibility(
        buildAssistantGame({ level: 2, money: 29 }),
        assistantLevelUpgrade,
        steppedCostResolver,
      ),
    ).toMatchObject({
      eligible: false,
      code: "not_affordable",
      currentLevel: 2,
      nextLevel: 3,
    });
  });

  it("blocks locked, invalid, and max-level ownership states", () => {
    expect(
      getNextLevelUpgradeEligibility(
        buildAssistantGame({ unlocked: false }),
        assistantLevelUpgrade,
        steppedCostResolver,
      ),
    ).toMatchObject({ eligible: false, code: "not_unlocked" });

    expect(
      getNextLevelUpgradeEligibility(
        buildAssistantGame({ level: 25 }),
        assistantLevelUpgrade,
        steppedCostResolver,
      ),
    ).toMatchObject({
      eligible: false,
      code: "max_level_reached",
      nextLevel: null,
    });

    expect(
      getNextLevelUpgradeEligibility(
        buildAssistantGame({ level: 25.5 }),
        assistantLevelUpgrade,
        steppedCostResolver,
      ),
    ).toMatchObject({
      eligible: false,
      code: "invalid_level",
      nextLevel: null,
    });
  });

  it("exposes a Buy 1 plan without mutating the saved Assistant owner", () => {
    const game = buildAssistantGame({ level: 7, money: 1_000 });
    const plan = planFiniteLevelUpgradePurchase(
      game,
      assistantLevelUpgrade,
      "buy_1",
      steppedCostResolver,
    );

    expect(plan).toEqual({
      mode: "buy_1",
      currentLevel: 7,
      targetLevel: 8,
      levelsPurchased: 1,
      costs: [{ resourceId: MVP_IDS.resources.money, amount: 80 }],
      totalCost: { resourceId: MVP_IDS.resources.money, amount: 80 },
      crossedMilestoneLevels: [8],
    });
    expect(game.assistant.level).toBe(7);
    expect(game.resources[MVP_IDS.resources.money]).toBe(1_000);
  });

  it("exposes a contiguous Buy Max plan with ordered milestone crossings", () => {
    const plan = planFiniteLevelUpgradePurchase(
      buildAssistantGame({ level: 6, money: 270 }),
      assistantLevelUpgrade,
      "buy_max",
      steppedCostResolver,
    );

    expect(plan).toEqual({
      mode: "buy_max",
      currentLevel: 6,
      targetLevel: 9,
      levelsPurchased: 3,
      costs: [
        { resourceId: MVP_IDS.resources.money, amount: 70 },
        { resourceId: MVP_IDS.resources.money, amount: 80 },
        { resourceId: MVP_IDS.resources.money, amount: 90 },
      ],
      totalCost: { resourceId: MVP_IDS.resources.money, amount: 240 },
      crossedMilestoneLevels: [8],
    });
  });

  it("returns no purchase plan when the next level is unavailable", () => {
    expect(
      planFiniteLevelUpgradePurchase(
        buildAssistantGame({ level: 2, money: 29 }),
        assistantLevelUpgrade,
        "buy_1",
        steppedCostResolver,
      ),
    ).toBeNull();
    expect(
      planFiniteLevelUpgradePurchase(
        buildAssistantGame({ level: 25, money: 1_000 }),
        assistantLevelUpgrade,
        "buy_max",
        steppedCostResolver,
      ),
    ).toBeNull();
  });
});
