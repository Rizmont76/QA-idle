export type UpgradeId = "checklist" | "coffee" | "juniorQa" | "middleQa";
export type AutomationUpgradeId =
  | "automationScripts"
  | "testStrategy"
  | "bugBounty";
export type AchievementId =
  | "firstBug"
  | "firstReport"
  | "hundredBugs"
  | "firstHire"
  | "tenReputation"
  | "automationStarted"
  | "thousandMoney"
  | "tenBps";
export type TabId = "manual" | "team" | "automation";
export type CareerStage = "junior" | "middle" | "senior";

export type Upgrade = {
  id: UpgradeId;
  group: Exclude<TabId, "automation">;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  costGrowth: number;
  bugsPerClick: number;
  bugsPerSecond: number;
};

export type AutomationUpgrade = {
  id: AutomationUpgradeId;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  costGrowth: number;
  bugsPerClick: number;
  bugsPerSecond: number;
  reportMultiplier: number;
};

export type DerivedStats = {
  bugsPerClick: number;
  bugsPerSecond: number;
  reportMultiplier: number;
};

export type GameState = {
  bugs: number;
  money: number;
  reputation: number;
  totalBugsFound: number;
  totalMoneyEarned: number;
  totalReputationEarned: number;
  lastPlayedAt: number;
  careerStage: CareerStage;
  upgrades: Record<UpgradeId, number>;
  automationUpgrades: Record<AutomationUpgradeId, number>;
  achievements: AchievementId[];
};

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  isUnlocked: (game: GameState, stats: DerivedStats) => boolean;
};

export type ProgressTarget = {
  name: string;
  resource: "money" | "reputation";
  current: number;
  cost: number;
};

export type CareerStageDefinition = {
  id: CareerStage;
  label: string;
  nextLabel?: string;
  description: string;
  requirementText?: string;
  canPromote?: (game: GameState) => boolean;
};
