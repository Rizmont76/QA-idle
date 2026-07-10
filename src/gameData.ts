import { MVP_IDS } from "./types";
import type {
  CareerStageDefinition,
  GameState,
  GameplayStatDefinition,
  PromotionDefinition,
  ResourceDefinition,
  UiSurfaceDefinition,
  UnlockDefinition,
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
    sourceSystemId: "manual_testing",
    categoryId: "production",
    type: "one_time",
    name: "Better Checklist",
    description: "+1 Bug Found per Manual Testing action.",
    flavor: "Sharper test cases make every manual run more valuable.",
    maxLevel: 1,
    cost: {
      type: "fixed",
      resourceId: MVP_IDS.resources.money,
      amount: 10,
    },
    visibility: "active",
    sortOrder: 10,
    lifetime: "reset",
    effects: [
      {
        channel: "modifier_grant",
        modifier: {
          definitionId: "upgrade.upgrade_better_checklist.manual_bugs_per_action.flat",
          sourceType: "upgrade",
          sourceId: MVP_IDS.upgrades.betterChecklist,
          targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
          modifierType: "flat",
          value: 1,
          durationType: "permanent",
          stackingPolicy: "ignore",
        },
      },
    ],
  },
  {
    id: MVP_IDS.upgrades.coffee,
    group: MVP_IDS.uiSurfaces.manualTesting,
    sourceSystemId: "manual_testing",
    categoryId: "production",
    type: "one_time",
    name: "Coffee",
    description: "+1 Bug Found per Manual Testing action.",
    flavor: "A focused tester catches edge cases before lunch.",
    maxLevel: 1,
    cost: {
      type: "fixed",
      resourceId: MVP_IDS.resources.money,
      amount: 25,
    },
    visibility: "active",
    sortOrder: 20,
    lifetime: "reset",
    effects: [
      {
        channel: "modifier_grant",
        modifier: {
          definitionId: "upgrade.upgrade_coffee.manual_bugs_per_action.flat",
          sourceType: "upgrade",
          sourceId: MVP_IDS.upgrades.coffee,
          targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
          modifierType: "flat",
          value: 1,
          durationType: "permanent",
          stackingPolicy: "ignore",
        },
      },
    ],
  },
  {
    id: MVP_IDS.upgrades.keyboardShortcuts,
    group: MVP_IDS.uiSurfaces.manualTesting,
    sourceSystemId: "manual_testing",
    categoryId: "production",
    type: "one_time",
    name: "Keyboard Shortcuts",
    description: "+2 Bugs Found per Manual Testing action.",
    flavor: "Less clicking around means more time finding real issues.",
    maxLevel: 1,
    cost: {
      type: "fixed",
      resourceId: MVP_IDS.resources.money,
      amount: 60,
    },
    visibility: "active",
    sortOrder: 30,
    lifetime: "reset",
    effects: [
      {
        channel: "modifier_grant",
        modifier: {
          definitionId: "upgrade.upgrade_keyboard_shortcuts.manual_bugs_per_action.flat",
          sourceType: "upgrade",
          sourceId: MVP_IDS.upgrades.keyboardShortcuts,
          targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
          modifierType: "flat",
          value: 2,
          durationType: "permanent",
          stackingPolicy: "ignore",
        },
      },
    ],
  },
  {
    id: MVP_IDS.upgrades.bugReportTemplate,
    group: MVP_IDS.uiSurfaces.manualTesting,
    sourceSystemId: "bug_reporting",
    categoryId: "conversion",
    type: "one_time",
    name: "Bug Report Template",
    description: "+1 Money per Bug reported.",
    flavor: "Cleaner reports turn findings into value faster.",
    maxLevel: 1,
    cost: {
      type: "fixed",
      resourceId: MVP_IDS.resources.money,
      amount: 100,
    },
    visibility: "active",
    sortOrder: 40,
    lifetime: "reset",
    effects: [
      {
        channel: "modifier_grant",
        modifier: {
          definitionId: "upgrade.upgrade_bug_report_template.money_per_bug_reported.flat",
          sourceType: "upgrade",
          sourceId: MVP_IDS.upgrades.bugReportTemplate,
          targetStatId: MVP_IDS.gameplayStats.moneyPerBugReported,
          modifierType: "flat",
          value: 1,
          durationType: "permanent",
          stackingPolicy: "ignore",
        },
      },
    ],
  },
  {
    id: MVP_IDS.upgrades.testCaseLibrary,
    group: MVP_IDS.uiSurfaces.manualTesting,
    sourceSystemId: "manual_testing",
    categoryId: "production",
    type: "one_time",
    name: "Test Case Library",
    description: "+3 Bugs Found per Manual Testing action.",
    flavor: "Reusable coverage catches the bugs you used to rediscover by hand.",
    maxLevel: 1,
    cost: {
      type: "fixed",
      resourceId: MVP_IDS.resources.money,
      amount: 250,
    },
    visibility: "active",
    sortOrder: 50,
    lifetime: "reset",
    effects: [
      {
        channel: "modifier_grant",
        modifier: {
          definitionId: "upgrade.upgrade_test_case_library.manual_bugs_per_action.flat",
          sourceType: "upgrade",
          sourceId: MVP_IDS.upgrades.testCaseLibrary,
          targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
          modifierType: "flat",
          value: 3,
          durationType: "permanent",
          stackingPolicy: "ignore",
        },
      },
    ],
  },
];

export const careerStages: CareerStageDefinition[] = [
  {
    id: MVP_IDS.careerStages.juniorQa,
    label: "Junior QA",
    sortOrder: 10,
    isStartingStage: true,
    nextLabel: "Middle QA",
    description: "Manual testing, bug reports, and the first upgrades.",
    requirementText: `Find ${String(PROMOTION_REQUIRED_BUGS)} lifetime bugs, earn $${String(PROMOTION_REQUIRED_MONEY)} lifetime money, and buy ${String(PROMOTION_REQUIRED_UPGRADES)} upgrades.`,
    unlocksGameplay: [
      "manual_testing",
      "bug_reporting",
      "basic_resources",
      "basic_upgrades",
      "promotion_progress",
    ],
  },
  {
    id: MVP_IDS.careerStages.middleQa,
    label: "Middle QA",
    sortOrder: 20,
    isStartingStage: false,
    description: "Vertical slice complete. Future gameplay remains hidden.",
    unlocksGameplay: [],
  },
];

export const promotionDefinitions: PromotionDefinition[] = [
  {
    id: MVP_IDS.promotions.juniorToMiddle,
    fromCareerStageId: MVP_IDS.careerStages.juniorQa,
    toCareerStageId: MVP_IDS.careerStages.middleQa,
    displayName: "Middle QA Promotion",
    requirements: [
      {
        id: "requirement_lifetime_bugs_found_100",
        type: "lifetime_resource_at_least",
        source: "current_run_lifetime_bugs_found",
        resourceId: MVP_IDS.resources.bugsFound,
        amount: PROMOTION_REQUIRED_BUGS,
      },
      {
        id: "requirement_lifetime_money_earned_150",
        type: "lifetime_resource_at_least",
        source: "current_run_lifetime_money_earned",
        resourceId: MVP_IDS.resources.money,
        amount: PROMOTION_REQUIRED_MONEY,
      },
      {
        id: "requirement_purchased_upgrades_3",
        type: "purchased_upgrades_at_least",
        source: "purchased_mvp_upgrades",
        amount: PROMOTION_REQUIRED_UPGRADES,
      },
    ],
    outcome: {
      type: "complete_promotion_and_set_stage",
      completedPromotionId: MVP_IDS.promotions.juniorToMiddle,
      setCurrentStageId: MVP_IDS.careerStages.middleQa,
      unlocksGameplay: [],
    },
    repeatPolicy: "once_per_save",
    persistencePolicy: "save_runtime_state_only",
  },
];

export const uiSurfaceDefinitions: UiSurfaceDefinition[] = [
  {
    id: MVP_IDS.uiSurfaces.manualTesting,
    displayName: "Manual Testing",
    category: "action_panel",
    initialVisibility: "active",
    visibleFromNewGame: true,
    controlledByUnlockId: null,
    sortOrder: 10,
  },
  {
    id: MVP_IDS.uiSurfaces.bugReporting,
    displayName: "Bug Reporting",
    category: "action_panel",
    initialVisibility: "active",
    visibleFromNewGame: true,
    controlledByUnlockId: null,
    sortOrder: 20,
  },
  {
    id: MVP_IDS.uiSurfaces.resourcesBasic,
    displayName: "Basic Resources",
    category: "resource_panel",
    initialVisibility: "active",
    visibleFromNewGame: true,
    controlledByUnlockId: null,
    sortOrder: 30,
  },
  {
    id: MVP_IDS.uiSurfaces.upgradesBasic,
    displayName: "Basic Upgrades",
    category: "upgrade_panel",
    initialVisibility: "active",
    visibleFromNewGame: true,
    controlledByUnlockId: null,
    sortOrder: 40,
  },
  {
    id: MVP_IDS.uiSurfaces.promotionProgress,
    displayName: "Promotion Progress",
    category: "progress_panel",
    initialVisibility: "active",
    visibleFromNewGame: true,
    controlledByUnlockId: null,
    sortOrder: 50,
  },
  {
    id: MVP_IDS.uiSurfaces.promoteAction,
    displayName: "Promote",
    category: "player_action",
    initialVisibility: "hidden",
    visibleFromNewGame: false,
    controlledByUnlockId: MVP_IDS.unlocks.promotionJuniorToMiddle,
    sortOrder: 60,
  },
];

export const unlockDefinitions: UnlockDefinition[] = [
  {
    id: MVP_IDS.unlocks.promotionJuniorToMiddle,
    ownerSystem: "unlock",
    category: "gameplay_action",
    targetType: "ui_surface",
    targetId: MVP_IDS.uiSurfaces.promoteAction,
    initialState: "hidden",
    availableState: "available",
    activationMode: "automatic",
    lifetime: "once_per_save",
    persistencePolicy: "save_runtime_state_only",
    availabilityRequirement: {
      type: "promotion_requirements_met",
      promotionId: MVP_IDS.promotions.juniorToMiddle,
    },
  },
];

export function createInitialResourceState(): GameState["resources"] {
  return resourceDefinitions.reduce(
    (resources, resource) => ({
      ...resources,
      [resource.id]: resource.initialValue,
    }),
    {} as GameState["resources"],
  );
}

export function createInitialUpgradeState(): GameState["upgrades"] {
  return upgrades.reduce(
    (ownedUpgrades, upgrade) => ({
      ...ownedUpgrades,
      [upgrade.id]: 0,
    }),
    {} as GameState["upgrades"],
  );
}

export function createInitialUiSurfaceState(): GameState["uiSurfaces"] {
  return uiSurfaceDefinitions.reduce(
    (uiSurfaces, surface) => ({
      ...uiSurfaces,
      [surface.id]: surface.initialVisibility,
    }),
    {} as GameState["uiSurfaces"],
  );
}

export function createInitialUnlockState(): GameState["unlocks"] {
  return unlockDefinitions.reduce(
    (unlocks, unlock) => ({
      ...unlocks,
      [unlock.id]: unlock.initialState,
    }),
    {} as GameState["unlocks"],
  );
}

export function createInitialPromotionState(): GameState["promotion"] {
  return {
    availablePromotionIds: [],
    completedPromotionIds: [],
  };
}

export function createNewGameState(now = Date.now()): GameState {
  return {
    resources: createInitialResourceState(),
    totalBugsFound: 0,
    totalMoneyEarned: 0,
    lastPlayedAt: now,
    careerStage: MVP_IDS.careerStages.juniorQa,
    promotion: createInitialPromotionState(),
    uiSurfaces: createInitialUiSurfaceState(),
    unlocks: createInitialUnlockState(),
    upgrades: createInitialUpgradeState(),
  };
}

export const initialState: GameState = createNewGameState();
