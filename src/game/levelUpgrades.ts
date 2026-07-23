import type {
  FiniteLevelUpgradeDefinition,
  GameState,
  LevelUpgradeCostResolver,
  LevelUpgradeNextLevelEligibility,
  LevelUpgradePurchaseMode,
  LevelUpgradePurchasePlan,
  UpgradeResolvedCost,
} from "../types";

function isValidOwnedLevel(level: number, maxLevel: number) {
  return Number.isInteger(level) && level >= 0 && level <= maxLevel;
}

function isValidResolvedCost(cost: UpgradeResolvedCost) {
  return Number.isFinite(cost.amount) && cost.amount > 0;
}

export function getFiniteLevelUpgradeLevel(game: GameState) {
  return game.assistant.level;
}

export function getNextLevelUpgradeEligibility(
  game: GameState,
  definition: FiniteLevelUpgradeDefinition,
  resolveCost: LevelUpgradeCostResolver,
): LevelUpgradeNextLevelEligibility {
  const currentLevel = getFiniteLevelUpgradeLevel(game);

  if (!isValidOwnedLevel(currentLevel, definition.maxLevel)) {
    return {
      eligible: false,
      currentLevel,
      nextLevel: null,
      code: "invalid_level",
      message: `${definition.name} has an invalid persisted level.`,
    };
  }

  if (!game.assistant.unlocked) {
    return {
      eligible: false,
      currentLevel,
      nextLevel: currentLevel + 1,
      code: "not_unlocked",
      message: `${definition.name} is not unlocked.`,
    };
  }

  if (currentLevel >= definition.maxLevel) {
    return {
      eligible: false,
      currentLevel,
      nextLevel: null,
      code: "max_level_reached",
      message: `${definition.name} is at max level.`,
    };
  }

  const nextLevel = currentLevel + 1;
  const resolvedCost = resolveCost({ definition, currentLevel, nextLevel, game });

  if (resolvedCost === null) {
    return {
      eligible: false,
      currentLevel,
      nextLevel,
      code: "cost_unavailable",
      message: `${definition.name} next-level cost is unavailable.`,
    };
  }

  if (!isValidResolvedCost(resolvedCost)) {
    return {
      eligible: false,
      currentLevel,
      nextLevel,
      code: "cost_invalid",
      message: `${definition.name} next-level cost is invalid.`,
      resolvedCost,
    };
  }

  const balance = game.resources[resolvedCost.resourceId];

  if (!Number.isFinite(balance) || balance < resolvedCost.amount) {
    return {
      eligible: false,
      currentLevel,
      nextLevel,
      code: "not_affordable",
      message: `${definition.name} next level is not affordable.`,
      resolvedCost,
    };
  }

  return {
    eligible: true,
    currentLevel,
    nextLevel,
    resolvedCost,
  };
}

export function planFiniteLevelUpgradePurchase(
  game: GameState,
  definition: FiniteLevelUpgradeDefinition,
  mode: LevelUpgradePurchaseMode,
  resolveCost: LevelUpgradeCostResolver,
): LevelUpgradePurchasePlan | null {
  if (!definition.purchaseModes.includes(mode)) {
    return null;
  }

  const currentLevel = getFiniteLevelUpgradeLevel(game);
  let simulatedGame = game;
  let remainingMoney = game.resources[definition.costRule.resourceId];
  const costs: UpgradeResolvedCost[] = [];
  const maximumLevels = mode === "buy_1" ? 1 : definition.maxLevel - currentLevel;

  for (let index = 0; index < maximumLevels; index += 1) {
    const eligibility = getNextLevelUpgradeEligibility(
      {
        ...simulatedGame,
        resources: {
          ...simulatedGame.resources,
          [definition.costRule.resourceId]: remainingMoney,
        },
      },
      definition,
      resolveCost,
    );

    if (!eligibility.eligible) {
      break;
    }

    costs.push(eligibility.resolvedCost);
    remainingMoney -= eligibility.resolvedCost.amount;
    simulatedGame = {
      ...simulatedGame,
      assistant: {
        ...simulatedGame.assistant,
        level: eligibility.nextLevel,
      },
    };
  }

  if (costs.length === 0) {
    return null;
  }

  const targetLevel = currentLevel + costs.length;
  const crossedMilestoneLevels = definition.milestoneLevels
    .filter((level) => level > currentLevel && level <= targetLevel)
    .sort((left, right) => left - right);

  return {
    mode,
    currentLevel,
    targetLevel,
    levelsPurchased: costs.length,
    costs,
    totalCost: {
      resourceId: definition.costRule.resourceId,
      amount: costs.reduce((total, cost) => total + cost.amount, 0),
    },
    crossedMilestoneLevels,
  };
}
