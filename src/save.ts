import {
  SAVE_KEY,
  createInitialResourceState,
  initialState,
  resourceDefinitions,
  upgrades,
} from "./gameData";
import { MVP_IDS } from "./types";
import type { GameState, ResourceId, ResourceState, UpgradeId } from "./types";

interface LegacySaveFields {
  bugs?: unknown;
  money?: unknown;
}

function safeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeUpgradeLevel(value: unknown, upgradeId: UpgradeId) {
  const numberValue = Math.floor(safeNumber(value));
  const upgradeDefinition = upgrades.find((upgrade) => upgrade.id === upgradeId);
  const maximumLevel = upgradeDefinition?.maxLevel ?? 0;

  return Number.isFinite(numberValue) ? Math.min(numberValue, maximumLevel) : 0;
}

function normalizeUpgrades(value: unknown): Record<UpgradeId, number> {
  const saved = value && typeof value === "object" ? value : {};
  const savedUpgrades = saved as Partial<
    Record<UpgradeId | "checklist" | "coffee", unknown>
  >;

  return {
    [MVP_IDS.upgrades.betterChecklist]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.betterChecklist] ?? savedUpgrades.checklist,
      MVP_IDS.upgrades.betterChecklist,
    ),
    [MVP_IDS.upgrades.coffee]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.coffee] ?? savedUpgrades.coffee,
      MVP_IDS.upgrades.coffee,
    ),
    [MVP_IDS.upgrades.keyboardShortcuts]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.keyboardShortcuts],
      MVP_IDS.upgrades.keyboardShortcuts,
    ),
    [MVP_IDS.upgrades.bugReportTemplate]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.bugReportTemplate],
      MVP_IDS.upgrades.bugReportTemplate,
    ),
    [MVP_IDS.upgrades.testCaseLibrary]: normalizeUpgradeLevel(
      savedUpgrades[MVP_IDS.upgrades.testCaseLibrary],
      MVP_IDS.upgrades.testCaseLibrary,
    ),
  };
}

function normalizeResourceValue(value: unknown, resourceId: ResourceId) {
  const resourceDefinition = resourceDefinitions.find(
    (resource) => resource.id === resourceId,
  );
  const numberValue = safeNumber(value);

  if (!resourceDefinition) {
    return numberValue;
  }

  return Math.min(
    Math.max(numberValue, resourceDefinition.minimumValue),
    resourceDefinition.maximumValue,
  );
}

function normalizeResources(
  value: unknown,
  legacySave: Partial<GameState> & LegacySaveFields,
): ResourceState {
  const saved = value && typeof value === "object" ? value : {};
  const savedResources = saved as Partial<Record<ResourceId, unknown>>;

  return {
    ...createInitialResourceState(),
    [MVP_IDS.resources.bugsFound]: normalizeResourceValue(
      savedResources[MVP_IDS.resources.bugsFound] ?? legacySave.bugs,
      MVP_IDS.resources.bugsFound,
    ),
    [MVP_IDS.resources.money]: normalizeResourceValue(
      savedResources[MVP_IDS.resources.money] ?? legacySave.money,
      MVP_IDS.resources.money,
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

    const parsed = JSON.parse(rawSave) as Partial<GameState> & LegacySaveFields;

    return {
      game: {
        ...initialState,
        resources: normalizeResources(parsed.resources, parsed),
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
