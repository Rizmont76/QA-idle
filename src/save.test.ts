import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY, createNewGameState, initialState, upgrades } from "./gameData";
import {
  CURRENT_SAVE_SCHEMA_VERSION,
  clearSave,
  loadSave,
  normalizeUpgradeOwnership,
  resetSave,
  saveGame,
  serializeGameForSave,
} from "./save";
import {
  acceptPromotion,
  getDerivedStats,
  getUiVisibilitySelectors,
  performManualTest,
  reportAllBugs,
} from "./gameLogic";
import { MVP_IDS } from "./types";
import type { GameState, Upgrade } from "./types";

describe("save storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  it("loads the initial state when no save exists", () => {
    expect(loadSave()).toEqual({ game: createNewGameState(Date.now()), events: [] });
  });

  it("creates schema v2 Assistant state for a new game", () => {
    expect(createNewGameState(Date.now()).assistant).toEqual({
      unlocked: false,
      level: 0,
      ownedSupportUpgradeIds: [],
      reachedMilestoneIds: [],
      productionObservedAfterUnlock: false,
      productionObservedAfterMilestone: false,
    });
    expect(createNewGameState(Date.now()).endpointCompleted).toBe(false);
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
      offlineProgress: {
        lastActiveAt: null,
        timestampStatus: "migration_required",
        pendingSummary: null,
        consumedSummary: null,
      },
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
        schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
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
        "assistant",
        "endpointCompleted",
        "lastPlayedAt",
        "offlineProgress",
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
      assistant: initialState.assistant,
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
      assistant: {
        unlocked: true,
        level: 8,
        ownedSupportUpgradeIds: ["support_immediate_production"],
        reachedMilestoneIds: ["milestone_assistant_first"],
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: true,
      },
      endpointCompleted: true,
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
      assistant: game.assistant,
      endpointCompleted: true,
      offlineProgress: {
        ...game.offlineProgress,
        lastActiveAt: Date.now(),
      },
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
      assistant: initialState.assistant,
    });
    expect(loadedVersionedSave.events).toEqual([
      {
        id: MVP_IDS.events.gameLoaded,
        payload: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
          loadedAt: Date.now(),
          migratedFromVersions: ["legacy_raw_game_state", "schema_v1"],
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

    expect(loadedLegacySave.game.offlineProgress).toEqual({
      lastActiveAt: null,
      timestampStatus: "migration_required",
      pendingSummary: null,
      consumedSummary: null,
    });

    saveGame(loadedLegacySave.game);

    expect(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}")).toMatchObject({
      meta: {
        schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
        migratedFromVersions: ["legacy_raw_game_state"],
      },
      game: {
        resources: {
          [MVP_IDS.resources.bugsFound]: 3,
          [MVP_IDS.resources.money]: 4,
        },
        offlineProgress: {
          lastActiveAt: Date.now(),
          timestampStatus: "valid",
          pendingSummary: null,
          consumedSummary: null,
        },
      },
    });
  });

  it("normalizes malformed Assistant state without granting progress", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: {
          schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
        },
        game: {
          assistant: {
            unlocked: "yes",
            level: 999,
            ownedSupportUpgradeIds: [
              "support_training_economics",
              "support_unknown",
              "support_immediate_production",
              "support_immediate_production",
            ],
            reachedMilestoneIds: [
              "milestone_assistant_capstone",
              "milestone_unknown",
              "milestone_assistant_first",
            ],
          },
        },
      }),
    );

    expect(loadSave().game.assistant).toEqual({
      unlocked: false,
      level: 25,
      ownedSupportUpgradeIds: [
        "support_immediate_production",
        "support_training_economics",
      ],
      reachedMilestoneIds: ["milestone_assistant_first", "milestone_assistant_capstone"],
      productionObservedAfterUnlock: false,
      productionObservedAfterMilestone: false,
    });
  });

  it("persists endpoint observation state without deriving completion on load", () => {
    const game: GameState = {
      ...initialState,
      careerStage: MVP_IDS.careerStages.middleQa,
      assistant: {
        ...initialState.assistant,
        unlocked: true,
        level: 8,
        reachedMilestoneIds: ["milestone_assistant_first"],
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: true,
      },
      endpointCompleted: true,
    };

    saveGame(game);

    expect(loadSave().game).toMatchObject({
      assistant: {
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: true,
      },
      endpointCompleted: true,
    });

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: { schemaVersion: CURRENT_SAVE_SCHEMA_VERSION },
        game: {
          careerStage: MVP_IDS.careerStages.middleQa,
          assistant: {
            unlocked: true,
            level: 8,
            reachedMilestoneIds: ["milestone_assistant_first"],
            productionObservedAfterUnlock: true,
          },
        },
      }),
    );

    expect(loadSave().game).toMatchObject({
      assistant: {
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: false,
      },
      endpointCompleted: false,
    });
  });

  it("rejects invalid and future offline timestamps without retaining summaries", () => {
    const futureTimestamp = Date.now() + 60_000;

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: { schemaVersion: CURRENT_SAVE_SCHEMA_VERSION },
        game: {
          offlineProgress: {
            lastActiveAt: futureTimestamp,
            timestampStatus: "valid",
            pendingSummary: {
              startedAt: Date.now() - 10_000,
              endedAt: Date.now(),
              elapsedSeconds: 10,
              eligibleSeconds: 10,
              bugsFoundGained: 8,
            },
          },
        },
      }),
    );

    expect(loadSave().game.offlineProgress).toEqual({
      lastActiveAt: null,
      timestampStatus: "invalid",
      pendingSummary: null,
      consumedSummary: null,
    });
  });

  it("persists pending and consumed offline summaries without applying rewards", () => {
    const pendingSummary = {
      startedAt: Date.now() - 30_000,
      endedAt: Date.now(),
      elapsedSeconds: 30,
      eligibleSeconds: 30,
      bugsFoundGained: 24,
    };
    const consumedSummary = {
      startedAt: Date.now() - 120_000,
      endedAt: Date.now() - 60_000,
      elapsedSeconds: 60,
      eligibleSeconds: 60,
      bugsFoundGained: 48,
    };

    saveGame({
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 5,
      },
      offlineProgress: {
        lastActiveAt: Date.now() - 30_000,
        timestampStatus: "valid",
        pendingSummary,
        consumedSummary,
      },
    });

    expect(loadSave().game).toMatchObject({
      resources: {
        [MVP_IDS.resources.bugsFound]: 5,
      },
      totalBugsFound: 0,
      offlineProgress: {
        lastActiveAt: Date.now(),
        timestampStatus: "valid",
        pendingSummary,
        consumedSummary,
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
      offlineProgress: {
        lastActiveAt: null,
        timestampStatus: "migration_required",
        pendingSummary: null,
        consumedSummary: null,
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

  it("round-trips MVP progress and restores upgrade-driven gameplay after reload", () => {
    const promotionReadyGame: GameState = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 4,
        [MVP_IDS.resources.money]: 85,
      },
      totalBugsFound: 100,
      totalMoneyEarned: 150,
      careerStage: MVP_IDS.careerStages.juniorQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [],
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
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
      },
    };

    saveGame(promotionReadyGame);

    const loadedReadyGame = loadSave().game;

    expect(loadedReadyGame).toMatchObject({
      resources: {
        [MVP_IDS.resources.bugsFound]: 4,
        [MVP_IDS.resources.money]: 85,
      },
      totalBugsFound: 100,
      totalMoneyEarned: 150,
      careerStage: MVP_IDS.careerStages.juniorQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [],
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
    });
    expect(getDerivedStats(loadedReadyGame)).toEqual({
      bugsPerClick: 3,
      moneyPerBug: 2,
    });
    expect(getUiVisibilitySelectors(loadedReadyGame).promoteAction).toEqual([
      MVP_IDS.uiSurfaces.promoteAction,
    ]);

    const manualResult = performManualTest(loadedReadyGame, Date.now());

    expect(manualResult.ok).toBe(true);
    if (!manualResult.ok) {
      throw new Error("Expected Manual Testing to succeed after loading upgrades.");
    }
    expect(manualResult.game.resources[MVP_IDS.resources.bugsFound]).toBe(7);
    expect(manualResult.game.totalBugsFound).toBe(103);

    const reportResult = reportAllBugs(manualResult.game, Date.now());

    expect(reportResult.ok).toBe(true);
    if (!reportResult.ok) {
      throw new Error("Expected Bug Reporting to use restored reporting modifiers.");
    }
    expect(reportResult.game.resources[MVP_IDS.resources.bugsFound]).toBe(0);
    expect(reportResult.game.resources[MVP_IDS.resources.money]).toBe(99);
    expect(reportResult.game.totalMoneyEarned).toBe(164);

    const promotionResult = acceptPromotion(loadedReadyGame, Date.now());

    expect(promotionResult.ok).toBe(true);
    if (!promotionResult.ok) {
      throw new Error("Expected restored Promotion Available state to be confirmable.");
    }

    saveGame(promotionResult.game);

    const loadedCompletedGame = loadSave().game;

    expect(loadedCompletedGame).toMatchObject({
      careerStage: MVP_IDS.careerStages.middleQa,
      promotion: {
        availablePromotionIds: [],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      uiSurfaces: {
        [MVP_IDS.uiSurfaces.promoteAction]: "hidden",
      },
      unlocks: {
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "hidden",
      },
    });
    expect(getUiVisibilitySelectors(loadedCompletedGame).promoteAction).toEqual([]);
    expect(loadedCompletedGame.resources).not.toHaveProperty("reputation");
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

  it("normalizes upgrade ownership from the registered upgrade definitions", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        game: {
          upgrades: {
            [MVP_IDS.upgrades.betterChecklist]: "1.8",
            [MVP_IDS.upgrades.coffee]: Number.POSITIVE_INFINITY,
            [MVP_IDS.upgrades.keyboardShortcuts]: -1,
            [MVP_IDS.upgrades.bugReportTemplate]: 99,
          },
        },
      }),
    );

    expect(loadSave().game.upgrades).toEqual({
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      [MVP_IDS.upgrades.coffee]: 0,
      [MVP_IDS.upgrades.keyboardShortcuts]: 0,
      [MVP_IDS.upgrades.bugReportTemplate]: 1,
    });
  });

  it("normalizes a newly registered upgrade key without per-ID save code", () => {
    const baseUpgrade = upgrades[0];

    if (!baseUpgrade) {
      throw new Error("Expected at least one MVP upgrade definition.");
    }

    const futureUpgrade: Upgrade = {
      ...baseUpgrade,
      id: "upgrade_future_refactor_tool",
      maxLevel: 3,
    };

    expect(
      normalizeUpgradeOwnership(
        {
          [MVP_IDS.upgrades.betterChecklist]: 1,
          upgrade_future_refactor_tool: 7,
          upgrade_unknown_unregistered: 1,
        },
        [...upgrades, futureUpgrade],
      ),
    ).toEqual({
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      upgrade_future_refactor_tool: 3,
    });
  });

  it("migrates legacy upgrade aliases while preferring stable IDs", () => {
    expect(
      normalizeUpgradeOwnership({
        checklist: 1,
        coffee: 1,
        [MVP_IDS.upgrades.coffee]: 0,
      }),
    ).toEqual({
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      [MVP_IDS.upgrades.coffee]: 0,
    });
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
