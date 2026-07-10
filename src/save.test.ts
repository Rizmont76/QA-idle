import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY, initialState } from "./gameData";
import { clearSave, loadSave, saveGame } from "./save";
import { MVP_IDS } from "./types";

describe("save storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  it("loads the initial state when no save exists", () => {
    expect(loadSave()).toEqual({ game: initialState });
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
      resources: {
        [MVP_IDS.resources.bugsFound]: 5,
        [MVP_IDS.resources.money]: 12,
      },
      lastPlayedAt: Date.now(),
    });

    clearSave();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});
