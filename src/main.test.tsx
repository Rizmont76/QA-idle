import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState } from "./gameData";
import { acceptPromotion, evaluatePromotionAvailability } from "./gameLogic";
import { saveGame } from "./save";
import { MVP_IDS } from "./types";
import type { GameState } from "./types";

const hiddenFutureSystemLabels = [
  "Team",
  "Automation",
  "Reputation",
  "Contracts",
  "Office",
  "Company",
  "Prestige",
  "Achievements",
  "Statistics",
] as const;

function buildPromotionReadyGame(): GameState {
  return evaluatePromotionAvailability({
    ...initialState,
    totalBugsFound: 100,
    totalMoneyEarned: 150,
    upgrades: {
      ...initialState.upgrades,
      [MVP_IDS.upgrades.betterChecklist]: 1,
      [MVP_IDS.upgrades.coffee]: 1,
      [MVP_IDS.upgrades.keyboardShortcuts]: 1,
    },
  });
}

function buildPromotionCompletedGame(): GameState {
  const result = acceptPromotion(buildPromotionReadyGame());

  if (!result.ok) {
    throw new Error("Expected promotion-ready smoke-test state to promote.");
  }

  return result.game;
}

async function bootAppWithSave(game?: GameState) {
  document.body.innerHTML = '<div id="root"></div>';

  if (game) {
    saveGame(game);
  }

  await import("./main");
}

function expectFutureSystemsToStayHidden() {
  for (const label of hiddenFutureSystemLabels) {
    expect(screen.queryByText(label, { exact: false })).not.toBeInTheDocument();
  }
}

describe("MVP UI smoke tests", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("displays the new-game MVP surfaces without future systems", async () => {
    await bootAppWithSave();

    expect(
      await screen.findByRole("heading", { name: "Junior QA Workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find bug/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /report bugs/i })).toBeInTheDocument();
    expect(screen.getByText("Bugs Found")).toBeInTheDocument();
    expect(screen.getByText("Money")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Basic Upgrades" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Promotion Progress" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /promote to/i })).not.toBeInTheDocument();
    expectFutureSystemsToStayHidden();
  });

  it("reveals the Promote action only after promotion requirements are satisfied", async () => {
    await bootAppWithSave(buildPromotionReadyGame());

    expect(
      await screen.findByRole("button", { name: "Promote to Middle QA" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Promotion available")).toBeInTheDocument();
    expectFutureSystemsToStayHidden();
  });

  it("shows the Middle QA completion state without exposing future panels", async () => {
    await bootAppWithSave(buildPromotionCompletedGame());

    expect(
      await screen.findByRole("heading", { name: "Middle QA Reached" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Middle QA reached")).toBeInTheDocument();
    expect(screen.getAllByText("Promotion completed").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /promote to/i })).not.toBeInTheDocument();
    expectFutureSystemsToStayHidden();
  });
});
