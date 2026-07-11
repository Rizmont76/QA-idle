import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY, createNewGameState, initialState } from "./gameData";
import { clearSave, loadSave, saveGame } from "./save";
import { MVP_IDS } from "./types";

describe("save storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  it("loads the initial state when no save exists", () => {
    expect(loadSave()).toEqual({ game: createNewGameState(Date.now()) });
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
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 5,
        [MVP_IDS.resources.money]: 12,
      },
    };

    saveGame(game);

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

    clearSave();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it("loads versioned saves and migrates legacy raw saves on write", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        meta: {
          schemaVersion: 1,
          createdAt: new Date("2026-07-09T12:00:00.000Z").getTime(),
          lastSavedAt: new Date("2026-07-09T12:30:00.000Z").getTime(),
          lastActiveAt: new Date("2026-07-09T12:30:00.000Z").getTime(),
          migratedFromVersions: ["legacy_raw_game_state"],
        },
        game: {
          resources: {
            [MVP_IDS.resources.bugsFound]: 8,
            [MVP_IDS.resources.money]: 14,
          },
          totalBugsFound: 8,
          totalMoneyEarned: 14,
          careerStage: MVP_IDS.careerStages.juniorQa,
          upgrades: {
            [MVP_IDS.upgrades.betterChecklist]: 1,
          },
        },
      }),
    );

    expect(loadSave().game).toMatchObject({
      resources: {
        [MVP_IDS.resources.bugsFound]: 8,
        [MVP_IDS.resources.money]: 14,
      },
      totalBugsFound: 8,
      totalMoneyEarned: 14,
      upgrades: {
        [MVP_IDS.upgrades.betterChecklist]: 1,
      },
    });

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        resources: {
          [MVP_IDS.resources.bugsFound]: 3,
          [MVP_IDS.resources.money]: 4,
        },
      }),
    );

    saveGame(loadSave().game);

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
});
