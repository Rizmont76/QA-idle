import "@testing-library/jest-dom/vitest";
import { fireEvent, screen } from "@testing-library/react";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState } from "./gameData";
import { acceptPromotion, evaluatePromotionAvailability } from "./gameLogic";
import { saveGame } from "./save";
import { MVP_IDS } from "./types";
import type { GameState } from "./types";

let mountedApp: Root | null = null;

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

function buildFundedAssistantGame(money = 1_000): GameState {
  const game = buildPromotionCompletedGame();

  return {
    ...game,
    resources: {
      ...game.resources,
      [MVP_IDS.resources.money]: money,
    },
  };
}

async function bootAppWithSave(game?: GameState) {
  document.body.innerHTML = '<div id="root"></div>';

  if (game) {
    saveGame(game);
  }

  const module = await import("./main");
  mountedApp = module.appRoot;
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
    mountedApp?.unmount();
    mountedApp = null;
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

  it("shows the Middle QA Assistant phase without claiming MVP completion", async () => {
    await bootAppWithSave(buildPromotionCompletedGame());

    expect(
      await screen.findByRole("heading", { name: "Middle QA Workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Junior QA Assistant" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Promotion completed").length).toBeGreaterThan(0);
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "MVP completion" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("0 / 0")).not.toBeInTheDocument();
    expect(screen.queryByText("Lifetime bugs found")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /promote to/i })).not.toBeInTheDocument();
    expectFutureSystemsToStayHidden();
  });

  it("purchases one Assistant level from the functional panel", async () => {
    await bootAppWithSave(buildFundedAssistantGame());

    const buyOne = await screen.findByRole("button", {
      name: /buy 1 assistant level for \$200, resulting level 1/i,
    });

    expect(buyOne).toHaveAttribute("aria-disabled", "false");
    fireEvent.click(buyOne);

    expect(await screen.findByText("Level 1 / 25")).toBeInTheDocument();
    expect(screen.getByText("$800")).toBeInTheDocument();
  });

  it("keeps unaffordable Assistant controls focusable and explained", async () => {
    await bootAppWithSave(buildPromotionCompletedGame());

    const buyOne = await screen.findByRole("button", {
      name: "Buy 1 Assistant level for $200, resulting level 1",
    });
    const buyMax = screen.getByRole("button", {
      name: "Buy Max Assistant levels unavailable",
    });

    expect(buyOne).toHaveAttribute("aria-disabled", "true");
    expect(buyOne).toHaveAccessibleDescription(/not affordable/i);
    expect(buyMax).toHaveAttribute("aria-disabled", "true");
    expect(buyMax).toHaveAccessibleDescription(/not affordable/i);

    buyOne.focus();
    expect(buyOne).toHaveFocus();
    fireEvent.click(buyOne);
    expect(screen.getByText("Level 0 / 25")).toBeInTheDocument();
  });

  it("suppresses both Assistant purchase actions at max level", async () => {
    const game = buildFundedAssistantGame(100_000);
    await bootAppWithSave({
      ...game,
      assistant: {
        ...game.assistant,
        level: 25,
        reachedMilestoneIds: [
          "milestone_assistant_first",
          "milestone_assistant_capstone",
        ],
      },
    });

    const buyOne = await screen.findByRole("button", {
      name: "Buy 1 Assistant level unavailable",
    });
    const buyMax = screen.getByRole("button", {
      name: "Buy Max Assistant levels unavailable",
    });

    expect(buyOne).toHaveTextContent("Max level");
    expect(buyOne).toHaveAttribute("aria-disabled", "true");
    expect(buyOne).toHaveAccessibleDescription(/at max level/i);
    expect(buyMax).toHaveTextContent("Max level");
    expect(buyMax).toHaveAttribute("aria-disabled", "true");
    expect(buyMax).toHaveAccessibleDescription(/at max level/i);
  });

  it("shows endpoint completion only from authoritative endpoint state", async () => {
    const game = buildFundedAssistantGame();
    await bootAppWithSave({
      ...game,
      assistant: {
        ...game.assistant,
        level: 8,
        reachedMilestoneIds: ["milestone_assistant_first"],
        productionObservedAfterUnlock: true,
        productionObservedAfterMilestone: true,
      },
      endpointCompleted: true,
    });

    expect(
      await screen.findByRole("region", { name: "MVP completion" }),
    ).toHaveTextContent("Playable Idle MVP reached");
    expect(
      screen.getByText(/Playable Idle MVP complete\. Future gameplay remains hidden\./i),
    ).toBeInTheDocument();
  });
});
