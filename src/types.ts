export const MVP_IDS = {
  careerStages: {
    juniorQa: "junior_qa",
    middleQa: "middle_qa",
  },
  promotions: {
    juniorToMiddle: "promotion_junior_to_middle",
  },
  unlocks: {
    promotionJuniorToMiddle: "unlock_promotion_junior_to_middle",
  },
  uiSurfaces: {
    manualTesting: "ui_manual_testing",
    bugReporting: "ui_bug_reporting",
    resourcesBasic: "ui_resources_basic",
    upgradesBasic: "ui_upgrades_basic",
    promotionProgress: "ui_promotion_progress",
    promoteAction: "ui_promote_action",
  },
  resources: {
    bugsFound: "bugs_found",
    money: "money",
  },
  gameplayStats: {
    manualBugsPerAction: "manual_bugs_per_action",
    moneyPerBugReported: "money_per_bug_reported",
  },
  actions: {
    manualTest: "action_manual_test",
    reportBugs: "action_report_bugs",
    acceptPromotion: "action_accept_promotion",
  },
  upgrades: {
    betterChecklist: "upgrade_better_checklist",
    coffee: "upgrade_coffee",
    keyboardShortcuts: "upgrade_keyboard_shortcuts",
    bugReportTemplate: "upgrade_bug_report_template",
    testCaseLibrary: "upgrade_test_case_library",
  },
} as const;

export type CareerStage =
  (typeof MVP_IDS.careerStages)[keyof typeof MVP_IDS.careerStages];
export type PromotionId = (typeof MVP_IDS.promotions)[keyof typeof MVP_IDS.promotions];
export type UnlockId = (typeof MVP_IDS.unlocks)[keyof typeof MVP_IDS.unlocks];
export type UiSurfaceId = (typeof MVP_IDS.uiSurfaces)[keyof typeof MVP_IDS.uiSurfaces];
export type ResourceId = (typeof MVP_IDS.resources)[keyof typeof MVP_IDS.resources];
export type GameplayStatId =
  (typeof MVP_IDS.gameplayStats)[keyof typeof MVP_IDS.gameplayStats];
export type ActionId = (typeof MVP_IDS.actions)[keyof typeof MVP_IDS.actions];
export type UpgradeId = (typeof MVP_IDS.upgrades)[keyof typeof MVP_IDS.upgrades];
export type TabId = typeof MVP_IDS.uiSurfaces.manualTesting;

export type ResourceLifetimeCategory = "disposable" | "investment";
export type ResourceResetBehavior = "reset";
export type ResourceFormatStyle = "integer";
export type GameplayStatCategory = "manual_testing" | "bug_reporting";
export type GameplayStatNumericType = "native_number";

export interface ResourceDefinition {
  id: ResourceId;
  displayName: string;
  description: string;
  category: string;
  lifetimeCategory: ResourceLifetimeCategory;
  producedBy: readonly string[];
  consumedBy: readonly string[];
  initialValue: number;
  minimumValue: number;
  maximumValue: number;
  isSpendable: boolean;
  isPersistent: boolean;
  visibleByDefault: boolean;
  resetBehavior: ResourceResetBehavior;
  format: {
    style: ResourceFormatStyle;
    maximumFractionDigits: number;
  };
}

export interface GameplayStatDefinition {
  id: GameplayStatId;
  displayName: string;
  description: string;
  baseValue: number;
  category: GameplayStatCategory;
  numericType: GameplayStatNumericType;
  allowNegative: boolean;
  minimumValue: number;
  visible: boolean;
}

export interface Upgrade {
  id: UpgradeId;
  group: TabId;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  costGrowth: number;
  bugsPerClick: number;
}

export interface DerivedStats {
  bugsPerClick: number;
  moneyPerBug: number;
}

export interface GameState {
  bugs: number;
  money: number;
  totalBugsFound: number;
  totalMoneyEarned: number;
  lastPlayedAt: number;
  careerStage: CareerStage;
  upgrades: Record<UpgradeId, number>;
}

export interface CareerStageDefinition {
  id: CareerStage;
  label: string;
  nextLabel?: string;
  description: string;
  requirementText?: string;
  canPromote?: (game: GameState) => boolean;
}
