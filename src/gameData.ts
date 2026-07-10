import { MVP_IDS } from "./types";
import type {
  CareerStageDefinition,
  GameState,
  GameplayStatDefinition,
  ResourceDefinition,
  Upgrade,
} from "./types";

export const SAVE_KEY = "qa-idle-save-v1";
export const BUG_VALUE = 1;
export const PROMOTION_TOAST_MS = 5200;
export const PROMOTION_REQUIRED_BUGS = 100;
export const PROMOTION_REQUIRED_MONEY = 150;
export const PROMOTION_REQUIRED_UPGRADES = 3;
export const MVP_RESOURCE_MAX = 1_000_000;

export const resourceDefinitions: ResourceDefinition[] = [
  {
    id: MVP_IDS.resources.bugsFound,
    displayName: "Bugs Found",
    description: "Discovered bugs waiting to be reported.",
    category: "manual_qa",
    lifetimeCategory: "disposable",
    producedBy: ["Manual Testing"],
    consumedBy: ["Bug Reporting"],
    initialValue: 0,
    minimumValue: 0,
    maximumValue: MVP_RESOURCE_MAX,
    isSpendable: true,
    isPersistent: true,
    visibleByDefault: true,
    resetBehavior: "reset",
    format: {
      style: "integer",
      maximumFractionDigits: 0,
    },
  },
  {
    id: MVP_IDS.resources.money,
    displayName: "Money",
    description: "Primary investment resource earned through reporting.",
    category: "personal_economy",
    lifetimeCategory: "investment",
    producedBy: ["Bug Reporting"],
    consumedBy: ["Upgrades"],
    initialValue: 0,
    minimumValue: 0,
    maximumValue: MVP_RESOURCE_MAX,
    isSpendable: true,
    isPersistent: true,
    visibleByDefault: true,
    resetBehavior: "reset",
    format: {
      style: "integer",
      maximumFractionDigits: 0,
    },
  },
];

export const gameplayStatDefinitions: GameplayStatDefinition[] = [
  {
    id: MVP_IDS.gameplayStats.manualBugsPerAction,
    displayName: "Manual Bugs Per Action",
    description: "Bugs Found produced by each Manual Testing action before storage.",
    baseValue: 1,
    category: "manual_testing",
    numericType: "native_number",
    allowNegative: false,
    minimumValue: 0,
    visible: true,
  },
  {
    id: MVP_IDS.gameplayStats.moneyPerBugReported,
    displayName: "Money Per Bug Reported",
    description: "Money earned for each Bug reported through Bug Reporting.",
    baseValue: 1,
    category: "bug_reporting",
    numericType: "native_number",
    allowNegative: false,
    minimumValue: 0,
    visible: true,
  },
];

export const upgrades: Upgrade[] = [
  {
    id: MVP_IDS.upgrades.betterChecklist,
    group: MVP_IDS.uiSurfaces.manualTesting,
    name: "Better Checklist",
    description: "+1 bug per click.",
    flavor: "Sharper test cases make every manual run more valuable.",
    baseCost: 12,
    costGrowth: 1.38,
    bugsPerClick: 1,
  },
  {
    id: MVP_IDS.upgrades.coffee,
    group: MVP_IDS.uiSurfaces.manualTesting,
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
  careerStage: MVP_IDS.careerStages.juniorQa,
  upgrades: {
    [MVP_IDS.upgrades.betterChecklist]: 0,
    [MVP_IDS.upgrades.coffee]: 0,
    [MVP_IDS.upgrades.keyboardShortcuts]: 0,
    [MVP_IDS.upgrades.bugReportTemplate]: 0,
    [MVP_IDS.upgrades.testCaseLibrary]: 0,
  },
};

export const careerStages: CareerStageDefinition[] = [
  {
    id: MVP_IDS.careerStages.juniorQa,
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
    id: MVP_IDS.careerStages.middleQa,
    label: "Middle QA",
    description: "Vertical slice complete. Future gameplay remains hidden.",
  },
];
