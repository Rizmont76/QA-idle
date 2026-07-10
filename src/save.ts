import {
  MAX_OFFLINE_SECONDS,
  SAVE_KEY,
  achievements,
  initialState,
} from "./gameData";
import { getDerivedStats } from "./gameLogic";
import type { AchievementId, CareerStage, GameState } from "./types";

function normalizeAchievements(value: unknown): AchievementId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const achievementIds = achievements.map((achievement) => achievement.id);

  return value.filter((id): id is AchievementId =>
    achievementIds.includes(id as AchievementId),
  );
}

function normalizeCareerStage(
  value: unknown,
  parsed: Partial<GameState>,
): CareerStage {
  if (value === "middle" || value === "senior") {
    return value;
  }

  if (
    Number(parsed.reputation) > 0 ||
    Number(parsed.totalReputationEarned) > 0 ||
    Object.values(parsed.automationUpgrades || {}).some((owned) => owned > 0)
  ) {
    return "senior";
  }

  if (
    Number(parsed.totalMoneyEarned) >= 1_000 ||
    Number(parsed.totalBugsFound) >= 500 ||
    Number(parsed.upgrades?.juniorQa) > 0 ||
    Number(parsed.upgrades?.middleQa) > 0
  ) {
    return "middle";
  }

  return "junior";
}

export function loadSave(): { game: GameState; offlineBugs: number } {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return { game: initialState, offlineBugs: 0 };
    }

    const parsed = JSON.parse(rawSave) as Partial<GameState>;
    const savedUpgrades = {
      ...initialState.upgrades,
      ...(parsed.upgrades || {}),
    };
    const savedAutomationUpgrades = {
      ...initialState.automationUpgrades,
      ...(parsed.automationUpgrades || {}),
    };
    const baseGame: GameState = {
      ...initialState,
      bugs: Number(parsed.bugs) || 0,
      money: Number(parsed.money) || 0,
      reputation: Number(parsed.reputation) || 0,
      totalBugsFound: Number(parsed.totalBugsFound) || 0,
      totalMoneyEarned: Number(parsed.totalMoneyEarned) || 0,
      totalReputationEarned: Number(parsed.totalReputationEarned) || 0,
      lastPlayedAt: Number(parsed.lastPlayedAt) || Date.now(),
      careerStage: normalizeCareerStage(parsed.careerStage, parsed),
      upgrades: savedUpgrades,
      automationUpgrades: savedAutomationUpgrades,
      achievements: normalizeAchievements(parsed.achievements),
    };
    const elapsedSeconds = Math.min(
      Math.max(0, (Date.now() - baseGame.lastPlayedAt) / 1000),
      MAX_OFFLINE_SECONDS,
    );
    const offlineBugs = getDerivedStats(baseGame).bugsPerSecond * elapsedSeconds;

    return {
      game: {
        ...baseGame,
        bugs: baseGame.bugs + offlineBugs,
        totalBugsFound: baseGame.totalBugsFound + offlineBugs,
        lastPlayedAt: Date.now(),
      },
      offlineBugs,
    };
  } catch {
    return { game: initialState, offlineBugs: 0 };
  }
}

export function saveGame(game: GameState) {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      ...game,
      lastPlayedAt: Date.now(),
    }),
  );
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
