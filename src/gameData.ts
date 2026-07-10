import type { CareerStageDefinition, GameState, Upgrade } from "./types";

export const SAVE_KEY = "qa-idle-save-v1";
export const BUG_VALUE = 1;
export const PROMOTION_TOAST_MS = 5200;
export const PROMOTION_REQUIRED_BUGS = 100;
export const PROMOTION_REQUIRED_MONEY = 150;
export const PROMOTION_REQUIRED_UPGRADES = 3;

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
    requirementText: `Find ${String(PROMOTION_REQUIRED_BUGS)} lifetime bugs, earn $${String(PROMOTION_REQUIRED_MONEY)} lifetime money, and buy ${String(PROMOTION_REQUIRED_UPGRADES)} upgrades.`,
    canPromote: (game) =>
      game.totalBugsFound >= PROMOTION_REQUIRED_BUGS &&
      game.totalMoneyEarned >= PROMOTION_REQUIRED_MONEY &&
      Object.values(game.upgrades).reduce((sum, owned) => sum + owned, 0) >=
        PROMOTION_REQUIRED_UPGRADES,
  },
  {
    id: "middle",
    label: "Middle QA",
    description: "Vertical slice complete. Future gameplay remains hidden.",
  },
];
