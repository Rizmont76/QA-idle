import { automationUpgrades, careerStages, upgrades } from "./gameData";
import type {
  AutomationUpgrade,
  CareerStage,
  DerivedStats,
  GameState,
  ProgressTarget,
  Upgrade,
} from "./types";

export function getUpgradeCost(
  upgrade: Upgrade | AutomationUpgrade,
  owned: number,
) {
  return Math.ceil(upgrade.baseCost * upgrade.costGrowth ** owned);
}

export function formatNumber(value: number) {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const suffixes = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ];
  const suffix = suffixes.find((item) => absoluteValue >= item.value);

  if (!suffix) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: absoluteValue >= 100 ? 0 : 1,
    }).format(absoluteValue)}`;
  }

  return `${sign}${(absoluteValue / suffix.value).toFixed(1)}${suffix.suffix}`;
}

export function getDerivedStats(game: GameState): DerivedStats {
  const baseStats = upgrades.reduce(
    (stats, upgrade) => ({
      ...stats,
      bugsPerClick:
        stats.bugsPerClick + upgrade.bugsPerClick * game.upgrades[upgrade.id],
      bugsPerSecond:
        stats.bugsPerSecond +
        upgrade.bugsPerSecond * game.upgrades[upgrade.id],
    }),
    { bugsPerClick: 1, bugsPerSecond: 0, reportMultiplier: 1 },
  );

  return automationUpgrades.reduce(
    (stats, upgrade) => ({
      bugsPerClick:
        stats.bugsPerClick +
        upgrade.bugsPerClick * game.automationUpgrades[upgrade.id],
      bugsPerSecond:
        stats.bugsPerSecond +
        upgrade.bugsPerSecond * game.automationUpgrades[upgrade.id],
      reportMultiplier:
        stats.reportMultiplier +
        upgrade.reportMultiplier * game.automationUpgrades[upgrade.id],
    }),
    baseStats,
  );
}

export function getProgressTarget(game: GameState): ProgressTarget {
  const moneyTargets = upgrades.map((upgrade) => {
    const cost = getUpgradeCost(upgrade, game.upgrades[upgrade.id]);

    return {
      name: upgrade.name,
      resource: "money" as const,
      current: game.money,
      cost,
      ratio: game.money / cost,
    };
  });
  const reputationTargets = automationUpgrades.map((upgrade) => {
    const cost = getUpgradeCost(upgrade, game.automationUpgrades[upgrade.id]);

    return {
      name: upgrade.name,
      resource: "reputation" as const,
      current: game.reputation,
      cost,
      ratio: game.reputation / cost,
    };
  });

  return [...moneyTargets, ...reputationTargets]
    .filter((target) => target.ratio < 1)
    .sort((first, second) => second.ratio - first.ratio)[0] || {
    name: "Next expansion",
    resource: "money",
    current: game.money,
    cost: game.money + 1,
  };
}

export function getStageIndex(stage: CareerStage) {
  return careerStages.findIndex((careerStage) => careerStage.id === stage);
}

export function hasStage(game: GameState, stage: CareerStage) {
  return getStageIndex(game.careerStage) >= getStageIndex(stage);
}

export function getPromotionStage(game: GameState) {
  const currentIndex = getStageIndex(game.careerStage);
  const currentStage = careerStages[currentIndex];
  const nextStage = careerStages[currentIndex + 1];

  if (!currentStage?.canPromote?.(game) || !nextStage) {
    return null;
  }

  return nextStage;
}
