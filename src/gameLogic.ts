import { careerStages, upgrades } from "./gameData";
import type { CareerStage, DerivedStats, GameState, Upgrade } from "./types";
import { MVP_IDS } from "./types";

const COMPACT_NUMBER_INTEGER_THRESHOLD = 100;

export function getUpgradeCost(upgrade: Upgrade) {
  return upgrade.cost.amount;
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
      maximumFractionDigits: absoluteValue >= COMPACT_NUMBER_INTEGER_THRESHOLD ? 0 : 1,
    }).format(absoluteValue)}`;
  }

  return `${sign}${(absoluteValue / suffix.value).toFixed(1)}${suffix.suffix}`;
}

export function getDerivedStats(game: GameState): DerivedStats {
  return upgrades.reduce(
    (stats, upgrade) => {
      if (game.upgrades[upgrade.id] < 1) {
        return stats;
      }

      return upgrade.effects.reduce((nextStats, effect) => {
        if (effect.modifier.targetStatId === MVP_IDS.gameplayStats.manualBugsPerAction) {
          return {
            ...nextStats,
            bugsPerClick: nextStats.bugsPerClick + effect.modifier.value,
          };
        }

        return {
          ...nextStats,
          moneyPerBug: nextStats.moneyPerBug + effect.modifier.value,
        };
      }, stats);
    },
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
