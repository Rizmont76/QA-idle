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
  GameLoadedEventDescriptor,
  GameSavedEventDescriptor,
  GameState,
  MvpSaveGameData,
  PromotionId,
  ResourceId,
  ResourceState,
  SaveData,
  SaveMetadata,
  Upgrade,
  UpgradeId,
  UpgradeOwnershipLevel,
  UpgradeOwnershipState,
} from "./types";

export const CURRENT_SAVE_SCHEMA_VERSION = 1 as const;

export interface LoadSaveResult {
  game: GameState;
  events: readonly GameLoadedEventDescriptor[];
}

export interface SaveGameResult {
  saveData: SaveData;
  events: readonly GameSavedEventDescriptor[];
}

interface LegacySaveFields {
  bugs?: unknown;
  money?: unknown;
}

const LEGACY_UPGRADE_ALIASES: Partial<Record<string, UpgradeId>> = {
  checklist: MVP_IDS.upgrades.betterChecklist,
  coffee: MVP_IDS.upgrades.coffee,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function safeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function safeTimestamp(value: unknown, fallback: number) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function normalizeUpgradeLevel(
  value: unknown,
  maximumLevel: number,
): UpgradeOwnershipLevel {
  const numberValue = Math.floor(safeNumber(value));
  const normalizedMaximumLevel =
    Number.isFinite(maximumLevel) && maximumLevel > 0 ? Math.floor(maximumLevel) : 0;
  const normalizedLevel = Number.isFinite(numberValue)
    ? Math.min(numberValue, normalizedMaximumLevel)
    : 0;

  return normalizedLevel >= 1 ? normalizedLevel : 0;
}

export function normalizeUpgradeOwnership(
  value: unknown,
  upgradeDefinitions: readonly Upgrade[] = upgrades,
): UpgradeOwnershipState {
  const saved = isRecord(value) ? value : {};
  const savedUpgrades = saved as Partial<Record<string, unknown>>;
  const savedByStableId = { ...savedUpgrades };

  for (const [legacyId, upgradeId] of Object.entries(LEGACY_UPGRADE_ALIASES)) {
    if (upgradeId && savedByStableId[upgradeId] === undefined) {
      savedByStableId[upgradeId] = savedUpgrades[legacyId];
    }
  }

  return upgradeDefinitions.reduce<UpgradeOwnershipState>(
    (normalizedUpgrades, upgrade) => ({
      ...normalizedUpgrades,
      [upgrade.id]: normalizeUpgradeLevel(savedByStableId[upgrade.id], upgrade.maxLevel),
    }),
    {} as UpgradeOwnershipState,
  );
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

function normalizeGameState(value: unknown, now = Date.now()): GameState {
  const parsed = (isRecord(value) ? value : {}) as Partial<GameState> & LegacySaveFields;

  return {
    ...createNewGameState(),
    resources: normalizeResources(parsed.resources, parsed),
    totalBugsFound: safeNumber(parsed.totalBugsFound),
    totalMoneyEarned: safeNumber(parsed.totalMoneyEarned),
    lastPlayedAt: safeTimestamp(parsed.lastPlayedAt, now),
    careerStage: normalizeCareerStage(parsed.careerStage),
    promotion: normalizePromotionState(parsed.promotion),
    uiSurfaces: normalizeUiSurfaces(parsed.uiSurfaces),
    unlocks: normalizeUnlocks(parsed.unlocks),
    upgrades: normalizeUpgradeOwnership(parsed.upgrades),
  };
}

function hasSupportedSchemaVersion(parsed: Record<string, unknown>) {
  if (!isRecord(parsed["meta"])) {
    return true;
  }

  return parsed["meta"]["schemaVersion"] === CURRENT_SAVE_SCHEMA_VERSION;
}

function getSavedGamePayload(parsed: unknown) {
  if (!isRecord(parsed)) {
    return null;
  }

  if (!hasSupportedSchemaVersion(parsed)) {
    return null;
  }

  if (isRecord(parsed["game"])) {
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

function buildGameLoadedEvent(
  loadedAt: number,
  migratedFromVersions: readonly string[],
): GameLoadedEventDescriptor {
  return {
    id: MVP_IDS.events.gameLoaded,
    payload: {
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      loadedAt,
      migratedFromVersions,
    },
  };
}

function buildGameSavedEvent(saveData: SaveData): GameSavedEventDescriptor {
  return {
    id: MVP_IDS.events.gameSaved,
    payload: {
      schemaVersion: saveData.meta.schemaVersion,
      savedAt: saveData.meta.lastSavedAt,
      lastActiveAt: saveData.meta.lastActiveAt,
    },
  };
}

function getMigratedFromVersions(parsed: unknown) {
  if (!isRecord(parsed) || !isRecord(parsed["meta"])) {
    return ["legacy_raw_game_state"];
  }

  const meta = parsed["meta"];

  return Array.isArray(meta["migratedFromVersions"])
    ? meta["migratedFromVersions"].filter(
        (version): version is string => typeof version === "string",
      )
    : [];
}

export function loadSave(): LoadSaveResult {
  try {
    const now = Date.now();
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return { game: createNewGameState(now), events: [] };
    }

    const parsed = JSON.parse(rawSave) as unknown;
    const savedGamePayload = getSavedGamePayload(parsed);

    if (!savedGamePayload) {
      return { game: createNewGameState(now), events: [] };
    }

    return {
      game: normalizeGameState(savedGamePayload, now),
      events: [buildGameLoadedEvent(now, getMigratedFromVersions(parsed))],
    };
  } catch {
    return { game: createNewGameState(), events: [] };
  }
}

export function serializeGameForSave(game: GameState, now = Date.now()): SaveData {
  return {
    meta: readExistingSaveMetadata(now),
    game: toMvpSaveGameData(game, now),
  };
}

export function saveGame(game: GameState): SaveGameResult {
  const now = Date.now();
  const saveData = serializeGameForSave(game, now);

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

  return {
    saveData,
    events: [buildGameSavedEvent(saveData)],
  };
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function resetSave(now = Date.now()): { game: GameState } {
  clearSave();

  return { game: createNewGameState(now) };
}
