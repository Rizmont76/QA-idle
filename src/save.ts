import { SAVE_KEY, initialState } from "./gameData";
import { MVP_IDS } from "./types";
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
  const savedUpgrades = saved as Partial<
    Record<UpgradeId | "checklist" | "coffee", unknown>
  >;

  return {
    [MVP_IDS.upgrades.betterChecklist]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.betterChecklist] ?? savedUpgrades.checklist,
    ),
    [MVP_IDS.upgrades.coffee]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.coffee] ?? savedUpgrades.coffee,
    ),
    [MVP_IDS.upgrades.keyboardShortcuts]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.keyboardShortcuts],
    ),
    [MVP_IDS.upgrades.bugReportTemplate]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.bugReportTemplate],
    ),
    [MVP_IDS.upgrades.testCaseLibrary]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.testCaseLibrary],
    ),
  };
}

function normalizeCareerStage(value: unknown): GameState["careerStage"] {
  return value === MVP_IDS.careerStages.middleQa || value === "middle"
    ? MVP_IDS.careerStages.middleQa
    : MVP_IDS.careerStages.juniorQa;
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
