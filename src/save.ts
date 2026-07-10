import { SAVE_KEY, initialState } from "./gameData";
import type { GameState, UpgradeId } from "./types";

function safeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeUpgradeLevel(value: unknown) {
  const numberValue = Math.floor(safeNumber(value));

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeUpgrades(value: unknown): Record<UpgradeId, number> {
  const saved = value && typeof value === "object" ? value : {};

  return {
    checklist: normalizeUpgradeLevel(
      (saved as Partial<Record<UpgradeId, unknown>>).checklist,
    ),
    coffee: normalizeUpgradeLevel(
      (saved as Partial<Record<UpgradeId, unknown>>).coffee,
    ),
  };
}

function normalizeCareerStage(value: unknown): GameState["careerStage"] {
  return value === "middle" ? "middle" : "junior";
}

export function loadSave(): { game: GameState } {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return { game: initialState };
    }

    const parsed = JSON.parse(rawSave) as Partial<GameState>;

    return {
      game: {
        ...initialState,
        bugs: safeNumber(parsed.bugs),
        money: safeNumber(parsed.money),
        totalBugsFound: safeNumber(parsed.totalBugsFound),
        totalMoneyEarned: safeNumber(parsed.totalMoneyEarned),
        lastPlayedAt: Date.now(),
        careerStage: normalizeCareerStage(parsed.careerStage),
        upgrades: normalizeUpgrades(parsed.upgrades),
      },
    };
  } catch {
    return { game: initialState };
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
