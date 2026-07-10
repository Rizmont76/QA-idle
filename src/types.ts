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
export type ResourceTransactionOperationType =
  "add" | "spend" | "convert" | "set" | "reset";
export type ResourceTransactionValidationFailureCode =
  | "missing_transaction_parameter"
  | "invalid_operation_type"
  | "operation_not_allowed"
  | "resource_not_found"
  | "resource_not_spendable"
  | "invalid_amount"
  | "invalid_balance"
  | "balance_below_minimum"
  | "balance_above_maximum";
export type GameplayStatCategory = "manual_testing" | "bug_reporting";
export type GameplayStatNumericType = "native_number";
export type UpgradeCategory = "production" | "conversion";
export type UpgradeType = "one_time";
export type UpgradeLifetime = "reset";
export type UpgradeVisibilityState = "active";
export type UpgradeEffectChannel = "modifier_grant";
export type ModifierType = "flat" | (string & {});
export type ModifierDurationType = "permanent" | (string & {});
export type ModifierStackingPolicy = "ignore" | (string & {});
export type ModifierSourceType = "upgrade" | (string & {});
export type ModifierDefinitionId = string;
export type ModifierInstanceId = string;
export type ModifierRegistrationFailureCode =
  | "unknown_modifier_target"
  | "unsupported_modifier_source"
  | "unsupported_modifier_type"
  | "unsupported_modifier_duration"
  | "unsupported_modifier_stacking";
export type PromotionRequirementType =
  "lifetime_resource_at_least" | "purchased_upgrades_at_least";
export type PromotionRequirementSource =
  | "current_run_lifetime_bugs_found"
  | "current_run_lifetime_money_earned"
  | "purchased_mvp_upgrades";
export type PromotionOutcomeType = "complete_promotion_and_set_stage";
export type PromotionRepeatPolicy = "once_per_save";
export type PromotionPersistencePolicy = "save_runtime_state_only";
export type UiSurfaceVisibilityState = "active" | "hidden";
export type UiSurfaceCategory =
  | "action_panel"
  | "resource_panel"
  | "upgrade_panel"
  | "progress_panel"
  | "player_action";
export type UnlockTargetType = "ui_surface";
export type UnlockInitialState = "hidden";
export type UnlockAvailableState = "available";
export type UnlockActivationMode = "automatic";
export type UnlockCategory = "gameplay_action";
export type UnlockLifetime = "once_per_save";
export type UnlockPersistencePolicy = "save_runtime_state_only";
export type UnlockRequirementType = "promotion_requirements_met";

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
  sourceSystemId: "manual_testing" | "bug_reporting";
  categoryId: UpgradeCategory;
  type: UpgradeType;
  name: string;
  description: string;
  flavor: string;
  maxLevel: 1;
  cost: {
    type: "fixed";
    resourceId: typeof MVP_IDS.resources.money;
    amount: number;
  };
  visibility: UpgradeVisibilityState;
  sortOrder: number;
  lifetime: UpgradeLifetime;
  effects: UpgradeEffect[];
}

export interface UpgradeEffect {
  channel: UpgradeEffectChannel;
  modifier: ModifierDefinition;
}

export interface ModifierDefinition {
  definitionId: ModifierDefinitionId;
  sourceType: ModifierSourceType;
  sourceId: string;
  targetStatId: GameplayStatId;
  modifierType: ModifierType;
  value: number;
  durationType: ModifierDurationType;
  stackingPolicy: ModifierStackingPolicy;
}

export interface ModifierInstance {
  instanceId: ModifierInstanceId;
  definitionId: ModifierDefinitionId;
  enabled: boolean;
}

export type ModifierRegistryState = Record<ModifierInstanceId, ModifierInstance>;

export interface ModifierRegistrationFailure {
  code: ModifierRegistrationFailureCode;
  definitionId: ModifierDefinitionId;
  message: string;
}

export interface DerivedStats {
  bugsPerClick: number;
  moneyPerBug: number;
}

export type ResourceState = Record<ResourceId, number>;

export interface ResourceTransactionChangeRequest {
  resourceId: ResourceId;
  delta: number;
}

export interface ResourceTransactionValidationRequest {
  operationType: ResourceTransactionOperationType;
  changes: readonly ResourceTransactionChangeRequest[];
}

export interface ResourceTransactionProjectedChange {
  resourceId: ResourceId;
  previousValue: number;
  newValue: number;
  delta: number;
}

export interface ResourceTransactionValidationFailure {
  code: ResourceTransactionValidationFailureCode;
  resourceId?: ResourceId;
  message: string;
}

export type ResourceTransactionValidationResult =
  | {
      ok: true;
      changes: readonly ResourceTransactionProjectedChange[];
    }
  | {
      ok: false;
      failures: readonly ResourceTransactionValidationFailure[];
    };

export interface ResourceOperationRequest {
  resourceId: ResourceId;
  amount: number;
  sourceSystem: string;
  reason: string;
  simulationTime?: number;
  transactionId?: string;
}

export interface ResourceConversionRequest {
  fromResourceId: ResourceId;
  fromAmount: number;
  toResourceId: ResourceId;
  toAmount: number;
  sourceSystem: string;
  reason: string;
  simulationTime?: number;
  transactionId?: string;
}

export interface ResourceTransactionMetadata {
  transactionId: string;
  operationType: Extract<ResourceTransactionOperationType, "add" | "spend" | "convert">;
  sourceSystem: string;
  reason: string;
  simulationTime: number;
  changes: readonly ResourceTransactionProjectedChange[];
}

export interface ResourceChangedEventDescriptor {
  id: "resource.changed";
  payload: ResourceTransactionMetadata;
}

export type ResourceOperationResult =
  | {
      ok: true;
      resources: ResourceState;
      transaction: ResourceTransactionMetadata;
      events: readonly ResourceChangedEventDescriptor[];
    }
  | {
      ok: false;
      resources: ResourceState;
      failures: readonly ResourceTransactionValidationFailure[];
      events: readonly [];
    };

export interface GameState {
  resources: ResourceState;
  totalBugsFound: number;
  totalMoneyEarned: number;
  lastPlayedAt: number;
  careerStage: CareerStage;
  upgrades: Record<UpgradeId, number>;
}

export interface CareerStageDefinition {
  id: CareerStage;
  label: string;
  sortOrder: number;
  isStartingStage: boolean;
  nextLabel?: string;
  description: string;
  requirementText?: string;
  unlocksGameplay: readonly string[];
}

export interface PromotionDefinition {
  id: PromotionId;
  fromCareerStageId: CareerStage;
  toCareerStageId: CareerStage;
  displayName: string;
  requirements: readonly PromotionRequirementDefinition[];
  outcome: PromotionOutcomeDefinition;
  repeatPolicy: PromotionRepeatPolicy;
  persistencePolicy: PromotionPersistencePolicy;
}

export type PromotionRequirementDefinition =
  | {
      id: string;
      type: "lifetime_resource_at_least";
      source: Exclude<PromotionRequirementSource, "purchased_mvp_upgrades">;
      resourceId: ResourceId;
      amount: number;
    }
  | {
      id: string;
      type: "purchased_upgrades_at_least";
      source: "purchased_mvp_upgrades";
      amount: number;
    };

export interface PromotionOutcomeDefinition {
  type: PromotionOutcomeType;
  completedPromotionId: PromotionId;
  setCurrentStageId: CareerStage;
  unlocksGameplay: readonly string[];
}

export interface UiSurfaceDefinition {
  id: UiSurfaceId;
  displayName: string;
  category: UiSurfaceCategory;
  initialVisibility: UiSurfaceVisibilityState;
  visibleFromNewGame: boolean;
  controlledByUnlockId: UnlockId | null;
  sortOrder: number;
}

export interface UnlockDefinition {
  id: UnlockId;
  ownerSystem: "unlock";
  category: UnlockCategory;
  targetType: UnlockTargetType;
  targetId: UiSurfaceId;
  initialState: UnlockInitialState;
  availableState: UnlockAvailableState;
  activationMode: UnlockActivationMode;
  lifetime: UnlockLifetime;
  persistencePolicy: UnlockPersistencePolicy;
  availabilityRequirement: {
    type: UnlockRequirementType;
    promotionId: PromotionId;
  };
}
