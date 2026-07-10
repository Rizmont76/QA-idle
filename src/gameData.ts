import type { CareerStageDefinition, GameState, Upgrade } from "./types";

export const SAVE_KEY = "qa-idle-save-v1";
export const BUG_VALUE = 1;
export const PROMOTION_TOAST_MS = 5200;

export const upgrades: Upgrade[] = [
  {
    id: "checklist",
    group: "manual",
    name: "Better Checklist",
    description: "+1 bug per click.",
    flavor: "Sharper test cases make every manual run more valuable.",
    baseCost: 12,
    costGrowth: 1.38,
    bugsPerClick: 1,
  },
  {
    id: "coffee",
    group: "manual",
    name: "Coffee",
    description: "+3 bugs per click.",
    flavor: "A focused tester catches edge cases before lunch.",
    baseCost: 70,
    costGrowth: 1.48,
    bugsPerClick: 3,
  },
];

export const initialState: GameState = {
  bugs: 0,
  money: 0,
  totalBugsFound: 0,
  totalMoneyEarned: 0,
  lastPlayedAt: Date.now(),
  careerStage: "junior",
  upgrades: {
    checklist: 0,
    coffee: 0,
  },
};

export const careerStages: CareerStageDefinition[] = [
  {
    id: "junior",
    label: "Junior QA",
    nextLabel: "Middle QA",
    description: "Manual testing, bug reports, and the first upgrades.",
    requirementText:
      "Find 100 lifetime bugs, earn $150 lifetime money, and buy 3 upgrades.",
    canPromote: (game) =>
      game.totalBugsFound >= 100 &&
      game.totalMoneyEarned >= 150 &&
      Object.values(game.upgrades).reduce((sum, owned) => sum + owned, 0) >= 3,
  },
  {
    id: "middle",
    label: "Middle QA",
    description: "Vertical slice complete. Future gameplay remains hidden.",
  },
];
