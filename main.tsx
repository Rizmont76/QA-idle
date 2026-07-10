import type {
  Achievement,
  AutomationUpgrade,
  CareerStageDefinition,
  GameState,
  Upgrade,
} from "./types";

export const SAVE_KEY = "qa-idle-save-v1";
export const BUG_VALUE = 1;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
export const OFFLINE_TOAST_MS = 6500;
export const ACHIEVEMENT_TOAST_MS = 4200;
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
    bugsPerSecond: 0,
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
    bugsPerSecond: 0,
  },
  {
    id: "juniorQa",
    group: "team",
    name: "Junior QA",
    description: "+0.35 bugs per second.",
    flavor: "Keeps smoke tests moving while you plan the next release.",
    baseCost: 180,
    costGrowth: 1.52,
    bugsPerClick: 0,
    bugsPerSecond: 0.35,
  },
  {
    id: "middleQa",
    group: "team",
    name: "Middle QA",
    description: "+1.6 bugs per second.",
    flavor: "Builds repeatable checks and catches regressions steadily.",
    baseCost: 900,
    costGrowth: 1.58,
    bugsPerClick: 0,
    bugsPerSecond: 1.6,
  },
];

export const automationUpgrades: AutomationUpgrade[] = [
  {
    id: "automationScripts",
    name: "Automation Scripts",
    description: "+1.2 bugs per second.",
    flavor: "Routine checks keep running after the manual pass is done.",
    baseCost: 6,
    costGrowth: 1.65,
    bugsPerClick: 0,
    bugsPerSecond: 1.2,
    reportMultiplier: 0,
  },
  {
    id: "testStrategy",
    name: "Test Strategy",
    description: "+8 bugs per click and +0.8 bugs per second.",
    flavor: "Better coverage turns scattered testing into a useful system.",
    baseCost: 18,
    costGrowth: 1.75,
    bugsPerClick: 8,
    bugsPerSecond: 0.8,
    reportMultiplier: 0,
  },
  {
    id: "bugBounty",
    name: "Bug Bounty Program",
    description: "+15% money and reputation from reports.",
    flavor: "External testers make every confirmed issue more valuable.",
    baseCost: 45,
    costGrowth: 1.9,
    bugsPerClick: 0,
    bugsPerSecond: 0,
    reportMultiplier: 0.15,
  },
];

export const initialState: GameState = {
  bugs: 0,
  money: 0,
  reputation: 0,
  totalBugsFound: 0,
  totalMoneyEarned: 0,
  totalReputationEarned: 0,
  lastPlayedAt: Date.now(),
  careerStage: "junior",
  upgrades: {
    checklist: 0,
    coffee: 0,
    juniorQa: 0,
    middleQa: 0,
  },
  automationUpgrades: {
    automationScripts: 0,
    testStrategy: 0,
    bugBounty: 0,
  },
  achievements: [],
};

export const careerStages: CareerStageDefinition[] = [
  {
    id: "junior",
    label: "Junior QA",
    nextLabel: "Middle QA",
    description: "Manual testing, bug reports, and the first upgrades.",
    requirementText: "Earn $1K total money or find 500 total bugs.",
    canPromote: (game) =>
      game.totalMoneyEarned >= 1_000 || game.totalBugsFound >= 500,
  },
  {
    id: "middle",
    label: "Middle QA",
    nextLabel: "Senior QA",
    description: "Hire a small team and build real passive testing output.",
    requirementText: "Hire 5 QA, earn $10K total money, or find 5K bugs.",
    canPromote: (game) =>
      game.upgrades.juniorQa + game.upgrades.middleQa >= 5 ||
      game.totalMoneyEarned >= 10_000 ||
      game.totalBugsFound >= 5_000,
  },
  {
    id: "senior",
    label: "Senior QA",
    description: "Reputation and automation become the second economy.",
  },
];

export const achievements: Achievement[] = [
  {
    id: "firstBug",
    name: "First Bug",
    description: "Find your first bug.",
    isUnlocked: (game) => game.totalBugsFound >= 1,
  },
  {
    id: "firstReport",
    name: "Filed Report",
    description: "Earn money from reported bugs.",
    isUnlocked: (game) => game.totalMoneyEarned >= 1,
  },
  {
    id: "hundredBugs",
    name: "Regression Hunter",
    description: "Find 100 total bugs.",
    isUnlocked: (game) => game.totalBugsFound >= 100,
  },
  {
    id: "firstHire",
    name: "First Hire",
    description: "Hire a QA teammate.",
    isUnlocked: (game) => game.upgrades.juniorQa + game.upgrades.middleQa >= 1,
  },
  {
    id: "tenReputation",
    name: "Trusted Tester",
    description: "Earn 10 total reputation.",
    isUnlocked: (game) => game.totalReputationEarned >= 10,
  },
  {
    id: "automationStarted",
    name: "Automation Started",
    description: "Buy any automation upgrade.",
    isUnlocked: (game) =>
      Object.values(game.automationUpgrades).some((owned) => owned > 0),
  },
  {
    id: "thousandMoney",
    name: "Budget Approved",
    description: "Earn $1K total money.",
    isUnlocked: (game) => game.totalMoneyEarned >= 1_000,
  },
  {
    id: "tenBps",
    name: "Always Testing",
    description: "Reach 10 bugs per second.",
    isUnlocked: (_game, stats) => stats.bugsPerSecond >= 10,
  },
];
