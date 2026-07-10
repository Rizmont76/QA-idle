import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY, initialState } from "./gameData";
import { clearSave, loadSave, saveGame } from "./save";

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
      bugs: 0,
      money: 42,
      totalBugsFound: 0,
      totalMoneyEarned: 250,
      lastPlayedAt: Date.now(),
      careerStage: "junior",
      upgrades: {
        checklist: 1,
        coffee: 0,
      },
    });
  });

  it("saves and clears the current game state", () => {
    const game = {
      ...initialState,
      bugs: 5,
      money: 12,
    };

    saveGame(game);

    expect(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}")).toMatchObject({
      bugs: 5,
      money: 12,
      lastPlayedAt: Date.now(),
    });

    clearSave();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});
