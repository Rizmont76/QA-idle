import {
  SAVE_KEY,
  createInitialPromotionState,
  createInitialResourceState,
  createInitialUiSurfaceState,
  createInitialUnlockState,
  createNewGameState,
  resourceDefinitions,
  uiSurfaceDefinitions,
  unlockDefinitions,
  upgrades,
} from "./gameData";
import { MVP_IDS } from "./types";
import type {
  GameState,
  MvpSaveGameData,
  PromotionId,
  ResourceId,
  ResourceState,
  SaveData,
  SaveMetadata,
  UpgradeId,
  UpgradeOwnershipLevel,
  UpgradeOwnershipState,
} from "./types";

export const CURRENT_SAVE_SCHEMA_VERSION = 1 as const;

interface LegacySaveFields {
  bugs?: unknown;
  money?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function safeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeUpgradeLevel(
  value: unknown,
  upgradeId: UpgradeId,
): UpgradeOwnershipLevel {
  const numberValue = Math.floor(safeNumber(value));
  const upgradeDefinition = upgrades.find((upgrade) => upgrade.id === upgradeId);
  const maximumLevel = upgradeDefinition?.maxLevel ?? 0;
  const normalizedLevel = Number.isFinite(numberValue)
    ? Math.min(numberValue, maximumLevel)
    : 0;

  return normalizedLevel >= 1 ? 1 : 0;
}

function normalizeUpgrades(value: unknown): UpgradeOwnershipState {
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

function normalizePromotionIds(value: unknown): PromotionId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (promotionId): promotionId is PromotionId =>
      promotionId === MVP_IDS.promotions.juniorToMiddle,
  );
}

function normalizePromotionState(value: unknown): GameState["promotion"] {
  const saved = isRecord(value) ? value : {};
  const defaults = createInitialPromotionState();

  return {
    ...defaults,
    availablePromotionIds: normalizePromotionIds(saved["availablePromotionIds"]),
    completedPromotionIds: normalizePromotionIds(saved["completedPromotionIds"]),
  };
}

function normalizeUiSurfaces(value: unknown): GameState["uiSurfaces"] {
  const saved = isRecord(value) ? value : {};
  const uiSurfaces = createInitialUiSurfaceState();

  for (const surface of uiSurfaceDefinitions) {
    const savedState = saved[surface.id];

    uiSurfaces[surface.id] =
      savedState === "active" || savedState === "hidden"
        ? savedState
        : surface.initialVisibility;
  }

  return uiSurfaces;
}

function normalizeUnlocks(value: unknown): GameState["unlocks"] {
  const saved = isRecord(value) ? value : {};
  const unlocks = createInitialUnlockState();

  for (const unlock of unlockDefinitions) {
    const savedState = saved[unlock.id];

    unlocks[unlock.id] =
      savedState === unlock.availableState || savedState === unlock.initialState
        ? savedState
        : unlock.initialState;
  }

  return unlocks;
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

function normalizeGameState(value: unknown): GameState {
  const parsed = (isRecord(value) ? value : {}) as Partial<GameState> & LegacySaveFields;

  return {
    ...createNewGameState(),
    resources: normalizeResources(parsed.resources, parsed),
    totalBugsFound: safeNumber(parsed.totalBugsFound),
    totalMoneyEarned: safeNumber(parsed.totalMoneyEarned),
    lastPlayedAt: Date.now(),
    careerStage: normalizeCareerStage(parsed.careerStage),
    promotion: normalizePromotionState(parsed.promotion),
    uiSurfaces: normalizeUiSurfaces(parsed.uiSurfaces),
    unlocks: normalizeUnlocks(parsed.unlocks),
    upgrades: normalizeUpgrades(parsed.upgrades),
  };
}

function getSavedGamePayload(parsed: unknown) {
  if (isRecord(parsed) && isRecord(parsed["game"])) {
    return parsed["game"];
  }

  return parsed;
}

function toMvpSaveGameData(game: GameState, lastPlayedAt: number): MvpSaveGameData {
  return {
    resources: game.resources,
    totalBugsFound: game.totalBugsFound,
    totalMoneyEarned: game.totalMoneyEarned,
    lastPlayedAt,
    careerStage: game.careerStage,
    promotion: game.promotion,
    uiSurfaces: game.uiSurfaces,
    unlocks: game.unlocks,
    upgrades: game.upgrades,
  };
}

function readExistingSaveMetadata(now: number): SaveData["meta"] {
  const fallback: SaveMetadata = {
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    createdAt: now,
    lastSavedAt: now,
    lastActiveAt: now,
    migratedFromVersions: ["legacy_raw_game_state"],
  };

  try {
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return {
        ...fallback,
        migratedFromVersions: [],
      };
    }

    const parsed = JSON.parse(rawSave) as unknown;

    if (!isRecord(parsed) || !isRecord(parsed["meta"])) {
      return fallback;
    }

    const meta = parsed["meta"];
    const createdAt = safeNumber(meta["createdAt"]);
    const migratedFromVersions = Array.isArray(meta["migratedFromVersions"])
      ? meta["migratedFromVersions"].filter(
          (version): version is string => typeof version === "string",
        )
      : [];

    return {
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      createdAt: createdAt || now,
      lastSavedAt: now,
      lastActiveAt: now,
      migratedFromVersions,
    };
  } catch {
    return fallback;
  }
}

export function loadSave(): { game: GameState } {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return { game: createNewGameState() };
    }

    const parsed = JSON.parse(rawSave) as unknown;

    return {
      game: normalizeGameState(getSavedGamePayload(parsed)),
    };
  } catch {
    return { game: createNewGameState() };
  }
}

export function saveGame(game: GameState) {
  const now = Date.now();
  const meta = readExistingSaveMetadata(now);
  const saveData: SaveData = {
    meta,
    game: toMvpSaveGameData(game, now),
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
