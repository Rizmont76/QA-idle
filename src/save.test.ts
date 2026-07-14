import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY, createNewGameState, initialState } from "./gameData";
import {
  CURRENT_SAVE_SCHEMA_VERSION,
  clearSave,
  loadSave,
  resetSave,
  saveGame,
  serializeGameForSave,
} from "./save";
import { MVP_IDS } from "./types";
import type { GameState } from "./types";

describe("save storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  it("loads the initial state when no save exists", () => {
    expect(loadSave()).toEqual({ game: createNewGameState(Date.now()), events: [] });
  });

  it("normalizes invalid saved values", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        bugs: -10,
        money: "42",
        totalBugsFound: "not-a-number",
        totalMoneyEarned: 250,
        careerStage: "principal",
        upgrades: {
          checklist: 1.8,
          coffee: -3,
        },
      }),
    );

    expect(loadSave().game).toEqual({
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 0,
        [MVP_IDS.resources.money]: 42,
      },
      totalBugsFound: 0,
      totalMoneyEarned: 250,
      lastPlayedAt: Date.now(),
      careerStage: MVP_IDS.careerStages.juniorQa,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.coffee]: 0,
      },
      promotion: initialState.promotion,
      uiSurfaces: initialState.uiSurfaces,
      unlocks: initialState.unlocks,
    });
  });

  it("saves and clears the current game state", () => {
    const game: GameState = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 5,
        [MVP_IDS.resources.money]: 12,
      },
    };

    const result = saveGame(game);

    expect(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}")).toMatchObject({
      meta: {
        schemaVersion: 1,
        createdAt: Date.now(),
        lastSavedAt: Date.now(),
        lastActiveAt: Date.now(),
        migratedFromVersions: [],
      },
      game: {
        resources: {
          [MVP_IDS.resources.bugsFound]: 5,
          [MVP_IDS.resources.money]: 12,
        },
        lastPlayedAt: Date.now(),
      },
    });
    expect(result.events).toEqual([
      {
        id: MVP_IDS.events.gameSaved,
        payload: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          savedAt: Date.now(),
          lastActiveAt: Date.now(),
        },
      },
    ]);

    clearSave();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it("persists the explicit MVP save schema without future systems", () => {
    saveGame({
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 7,
        [MVP_IDS.resources.money]: 11,
      },
      totalBugsFound: 23,
      totalMoneyEarned: 19,
      careerStage: MVP_IDS.careerStages.juniorQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [],
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
    });

    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}") as {
      meta: Record<string, unknown>;
      game: Record<string, unknown>;
    };

    expect(saved.meta).toEqual({
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      createdAt: Date.now(),
      lastSavedAt: Date.now(),
      lastActiveAt: Date.now(),
      migratedFromVersions: [],
    });
    expect(Object.keys(saved.game).sort()).toEqual(
      [
        "careerStage",
        "lastPlayedAt",
        "promotion",
        "resources",
        "totalBugsFound",
        "totalMoneyEarned",
        "uiSurfaces",
        "unlocks",
        "upgrades",
      ].sort(),
    );
    expect(saved.game).toMatchObject({
      resources: {
        [MVP_IDS.resources.bugsFound]: 7,
        [MVP_IDS.resources.money]: 11,
      },
      totalBugsFound: 23,
      totalMoneyEarned: 19,
      careerStage: MVP_IDS.careerStages.juniorQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [],
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
    });
  });

  it("serializes only authoritative MVP gameplay state for persistence", () => {
    const game: GameState = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 13,
        [MVP_IDS.resources.money]: 21,
      },
      totalBugsFound: 144,
      totalMoneyEarned: 233,
      careerStage: MVP_IDS.careerStages.middleQa,
      promotion: {
        availablePromotionIds: [],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
      },
    };

    const saved = serializeGameForSave(game);

    expect(saved.game).toEqual({
      resources: game.resources,
      totalBugsFound: game.totalBugsFound,
      totalMoneyEarned: game.totalMoneyEarned,
      lastPlayedAt: Date.now(),
      careerStage: game.careerStage,
      promotion: game.promotion,
      uiSurfaces: game.uiSurfaces,
      unlocks: game.unlocks,
      upgrades: game.upgrades,
    });
    expect(saved.game).not.toHaveProperty("modifiers");
    expect(saved.game).not.toHaveProperty("team");
    expect(saved.game).not.toHaveProperty("automation");
    expect(saved.game).not.toHaveProperty("reputation");
  });

  it("returns the exact payload written to storage", () => {
    const result = saveGame({
      ...initialState,
      totalBugsFound: 34,
      totalMoneyEarned: 55,
    });

    expect(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}")).toEqual(result.saveData);
  });

  it("loads versioned saves and migrates legacy raw saves on write", () => {
    const savedLastPlayedAt = new Date("2026-07-09T12:30:00.000Z").getTime();

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: {
          schemaVersion: 1,
          createdAt: new Date("2026-07-09T12:00:00.000Z").getTime(),
          lastSavedAt: savedLastPlayedAt,
          lastActiveAt: savedLastPlayedAt,
          migratedFromVersions: ["legacy_raw_game_state"],
        },
        game: {
          resources: {
            [MVP_IDS.resources.bugsFound]: 8,
            [MVP_IDS.resources.money]: 14,
          },
          totalBugsFound: 8,
          totalMoneyEarned: 14,
          lastPlayedAt: savedLastPlayedAt,
          careerStage: MVP_IDS.careerStages.juniorQa,
          upgrades: {
            [MVP_IDS.upgrades.betterChecklist]: 1,
          },
        },
      }),
    );

    const loadedVersionedSave = loadSave();

    expect(loadedVersionedSave.game).toMatchObject({
      resources: {
        [MVP_IDS.resources.bugsFound]: 8,
        [MVP_IDS.resources.money]: 14,
      },
      totalBugsFound: 8,
      totalMoneyEarned: 14,
      lastPlayedAt: savedLastPlayedAt,
      upgrades: {
        [MVP_IDS.upgrades.betterChecklist]: 1,
      },
    });
    expect(loadedVersionedSave.events).toEqual([
      {
        id: MVP_IDS.events.gameLoaded,
        payload: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          loadedAt: Date.now(),
          migratedFromVersions: ["legacy_raw_game_state"],
        },
      },
    ]);

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        resources: {
          [MVP_IDS.resources.bugsFound]: 3,
          [MVP_IDS.resources.money]: 4,
        },
      }),
    );

    const loadedLegacySave = loadSave();

    expect(loadedLegacySave.events).toEqual([
      {
        id: MVP_IDS.events.gameLoaded,
        payload: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          loadedAt: Date.now(),
          migratedFromVersions: ["legacy_raw_game_state"],
        },
      },
    ]);

    saveGame(loadedLegacySave.game);

    expect(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}")).toMatchObject({
      meta: {
        schemaVersion: 1,
        migratedFromVersions: ["legacy_raw_game_state"],
      },
      game: {
        resources: {
          [MVP_IDS.resources.bugsFound]: 3,
          [MVP_IDS.resources.money]: 4,
        },
      },
    });
  });

  it("restores a valid MVP save without awarding offline progress", () => {
    const savedLastPlayedAt = new Date("2026-07-01T12:00:00.000Z").getTime();

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          createdAt: savedLastPlayedAt,
          lastSavedAt: savedLastPlayedAt,
          lastActiveAt: savedLastPlayedAt,
          migratedFromVersions: [],
        },
        game: {
          resources: {
            [MVP_IDS.resources.bugsFound]: 17,
            [MVP_IDS.resources.money]: 29,
          },
          totalBugsFound: 101,
          totalMoneyEarned: 151,
          lastPlayedAt: savedLastPlayedAt,
          careerStage: MVP_IDS.careerStages.middleQa,
          promotion: {
            availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
            completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
          },
          uiSurfaces: {
            ...initialState.uiSurfaces,
            [MVP_IDS.uiSurfaces.promoteAction]: "active",
          },
          unlocks: {
            [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
          },
          upgrades: {
            ...initialState.upgrades,
            [MVP_IDS.upgrades.betterChecklist]: 1,
            [MVP_IDS.upgrades.coffee]: 1,
            [MVP_IDS.upgrades.keyboardShortcuts]: 1,
          },
        },
      }),
    );

    const loadedSave = loadSave();

    expect(loadedSave.game).toEqual({
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 17,
        [MVP_IDS.resources.money]: 29,
      },
      totalBugsFound: 101,
      totalMoneyEarned: 151,
      lastPlayedAt: savedLastPlayedAt,
      careerStage: MVP_IDS.careerStages.middleQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      uiSurfaces: {
        ...initialState.uiSurfaces,
        [MVP_IDS.uiSurfaces.promoteAction]: "active",
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.coffee]: 1,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1,
      },
    });
    expect(loadedSave.events).toEqual([
      {
        id: MVP_IDS.events.gameLoaded,
        payload: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          loadedAt: Date.now(),
          migratedFromVersions: [],
        },
      },
    ]);
  });

  it("falls back safely when a versioned save has an unsupported schema", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: {
          schemaVersion: 999,
        },
        game: {
          resources: {
            [MVP_IDS.resources.bugsFound]: 999,
            [MVP_IDS.resources.money]: 999,
          },
        },
      }),
    );

    expect(loadSave()).toEqual({ game: createNewGameState(Date.now()), events: [] });
  });

  it("restores MVP upgrade ownership by stable ID and ignores unknown saved upgrades", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        game: {
          upgrades: {
            [MVP_IDS.upgrades.betterChecklist]: 1,
            [MVP_IDS.upgrades.coffee]: 99,
            upgrade_future_automation: 1,
          },
        },
      }),
    );

    expect(loadSave().game.upgrades).toEqual({
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      [MVP_IDS.upgrades.coffee]: 1,
    });
    expect(loadSave().game.upgrades).not.toHaveProperty("upgrade_future_automation");
  });

  it("restores promotion availability and completion runtime state separately", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        game: {
          promotion: {
            availablePromotionIds: [
              MVP_IDS.promotions.juniorToMiddle,
              "promotion_future_senior",
            ],
            completedPromotionIds: [
              MVP_IDS.promotions.juniorToMiddle,
              "promotion_future_senior",
            ],
          },
        },
      }),
    );

    expect(loadSave().game.promotion).toEqual({
      availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
    });
  });

  it("persists promotion runtime state without definition data", () => {
    const game = {
      ...initialState,
      promotion: {
        availablePromotionIds: [],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
    };

    saveGame(game);

    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}") as {
      game: { promotion: Record<string, unknown> };
    };

    expect(saved).toMatchObject({
      game: {
        promotion: {
          availablePromotionIds: [],
          completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        },
      },
    });
    expect(saved.game.promotion).not.toHaveProperty("requirements");
  });

  it("resets persisted progress to a fresh MVP new game state", () => {
    saveGame({
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 64,
        [MVP_IDS.resources.money]: 128,
      },
      totalBugsFound: 100,
      totalMoneyEarned: 150,
      careerStage: MVP_IDS.careerStages.middleQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      uiSurfaces: {
        ...initialState.uiSurfaces,
        [MVP_IDS.uiSurfaces.promoteAction]: "active",
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.coffee]: 1,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1,
      },
    });

    const reset = resetSave();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(reset).toEqual({ game: createNewGameState(Date.now()) });
    expect(reset.game.careerStage).toBe(MVP_IDS.careerStages.juniorQa);
    expect(reset.game.resources).toEqual(initialState.resources);
    expect(reset.game.upgrades).toEqual(initialState.upgrades);
    expect(reset.game.promotion).toEqual(initialState.promotion);
    expect(reset.game.unlocks).toEqual(initialState.unlocks);
  });
});
