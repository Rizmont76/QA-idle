import { careerStages, upgrades } from "./gameData";
import type { CareerStage, DerivedStats, GameState, Upgrade } from "./types";

export function getUpgradeCost(upgrade: Upgrade, owned: number) {
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
  return upgrades.reduce(
    (stats, upgrade) => ({
      ...stats,
      bugsPerClick:
        stats.bugsPerClick + upgrade.bugsPerClick * game.upgrades[upgrade.id],
    }),
    { bugsPerClick: 1, moneyPerBug: 1 },
  );
}

export function getStageIndex(stage: CareerStage) {
  return careerStages.findIndex((careerStage) => careerStage.id === stage);
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
