import { careerStages, promotionDefinitions, upgrades } from "./gameData";
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
  const promotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );
  const nextStage = careerStages.find(
    (careerStage) => careerStage.id === promotionDefinition?.toCareerStageId,
  );

  if (!promotionDefinition || !nextStage) {
    return null;
  }

  const purchasedUpgrades = Object.values(game.upgrades).reduce(
    (sum, owned) => sum + owned,
    0,
  );
  const requirementsMet = promotionDefinition.requirements.every((requirement) => {
    if (requirement.type === "purchased_upgrades_at_least") {
      return purchasedUpgrades >= requirement.amount;
    }

    if (requirement.source === "current_run_lifetime_bugs_found") {
      return game.totalBugsFound >= requirement.amount;
    }

    return game.totalMoneyEarned >= requirement.amount;
  });

  if (!requirementsMet) {
    return null;
  }

  return nextStage;
}
