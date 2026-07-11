import { describe, expect, it } from "vitest";
import {
  careerStages,
  createInitialPromotionState,
  createInitialResourceState,
  createInitialUiSurfaceState,
  createInitialUnlockState,
  createInitialUpgradeState,
  createNewGameState,
  gameplayStatDefinitions,
  initialState,
  MVP_RESOURCE_MAX,
  promotionDefinitions,
  resourceDefinitions,
  uiSurfaceDefinitions,
  unlockDefinitions,
  upgrades,
} from "./gameData";
import { MVP_IDS } from "./types";

describe("MVP resource registry", () => {
  it("defines exactly the MVP resources", () => {
    expect(resourceDefinitions.map((resource) => resource.id)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
  });

  it("builds initial resource state from the registry only", () => {
    expect(createInitialResourceState()).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 0,
    });
    expect(Object.keys(initialState.resources)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
    expect(initialState.resources).not.toHaveProperty("totalBugsFound");
    expect(initialState.resources).not.toHaveProperty("totalMoneyEarned");
  });

  it("defines Bugs Found as a spendable disposable resource", () => {
    const bugsFound = resourceDefinitions.find(
      (resource) => resource.id === MVP_IDS.resources.bugsFound,
    );

    expect(bugsFound).toMatchObject({
      displayName: "Bugs Found",
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
    });
  });

  it("defines Money as a spendable investment resource", () => {
    const money = resourceDefinitions.find(
      (resource) => resource.id === MVP_IDS.resources.money,
    );

    expect(money).toMatchObject({
      displayName: "Money",
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
    });
  });
});

describe("MVP new game state factory", () => {
  it("creates a fresh Junior QA state from MVP registries only", () => {
    const now = new Date("2026-07-10T12:00:00.000Z").getTime();

    expect(createInitialUpgradeState()).toEqual({
      [MVP_IDS.upgrades.betterChecklist]: 0,
      [MVP_IDS.upgrades.coffee]: 0,
      [MVP_IDS.upgrades.keyboardShortcuts]: 0,
      [MVP_IDS.upgrades.bugReportTemplate]: 0,
      [MVP_IDS.upgrades.testCaseLibrary]: 0,
    });
    expect(createInitialPromotionState()).toEqual({
      availablePromotionIds: [],
      completedPromotionIds: [],
    });
    expect(createInitialUiSurfaceState()).toEqual({
      [MVP_IDS.uiSurfaces.manualTesting]: "active",
      [MVP_IDS.uiSurfaces.bugReporting]: "active",
      [MVP_IDS.uiSurfaces.resourcesBasic]: "active",
      [MVP_IDS.uiSurfaces.upgradesBasic]: "active",
      [MVP_IDS.uiSurfaces.promotionProgress]: "active",
      [MVP_IDS.uiSurfaces.promoteAction]: "hidden",
    });
    expect(createInitialUnlockState()).toEqual({
      [MVP_IDS.unlocks.promotionJuniorToMiddle]: "hidden",
    });
    expect(createNewGameState(now)).toEqual({
      resources: createInitialResourceState(),
      totalBugsFound: 0,
      totalMoneyEarned: 0,
      lastPlayedAt: now,
      careerStage: MVP_IDS.careerStages.juniorQa,
      promotion: createInitialPromotionState(),
      uiSurfaces: createInitialUiSurfaceState(),
      unlocks: createInitialUnlockState(),
      upgrades: createInitialUpgradeState(),
    });
  });

  it("keeps the exported initial state equivalent to the factory shape", () => {
    expect(initialState).toEqual({
      ...createNewGameState(initialState.lastPlayedAt),
    });
  });
});

describe("MVP upgrade registry", () => {
  it("defines exactly the five one-time MVP upgrades in documented order", () => {
    expect(upgrades.map((upgrade) => upgrade.id)).toEqual([
      MVP_IDS.upgrades.betterChecklist,
      MVP_IDS.upgrades.coffee,
      MVP_IDS.upgrades.keyboardShortcuts,
      MVP_IDS.upgrades.bugReportTemplate,
      MVP_IDS.upgrades.testCaseLibrary,
    ]);
    expect(
      upgrades.map((upgrade) => ({
        type: upgrade.type,
        maxLevel: upgrade.maxLevel,
        visibility: upgrade.visibility,
      })),
    ).toEqual([
      { type: "one_time", maxLevel: 1, visibility: "active" },
      { type: "one_time", maxLevel: 1, visibility: "active" },
      { type: "one_time", maxLevel: 1, visibility: "active" },
      { type: "one_time", maxLevel: 1, visibility: "active" },
      { type: "one_time", maxLevel: 1, visibility: "active" },
    ]);
  });

  it("uses the documented fixed Money costs", () => {
    expect(
      upgrades.map((upgrade) => [
        upgrade.id,
        upgrade.cost.resourceId,
        upgrade.cost.amount,
      ]),
    ).toEqual([
      [MVP_IDS.upgrades.betterChecklist, MVP_IDS.resources.money, 10],
      [MVP_IDS.upgrades.coffee, MVP_IDS.resources.money, 25],
      [MVP_IDS.upgrades.keyboardShortcuts, MVP_IDS.resources.money, 60],
      [MVP_IDS.upgrades.bugReportTemplate, MVP_IDS.resources.money, 100],
      [MVP_IDS.upgrades.testCaseLibrary, MVP_IDS.resources.money, 250],
    ]);
  });

  it("defines upgrade effects as modifier grants against registered gameplay stats", () => {
    expect(
      upgrades.map((upgrade) => [
        upgrade.id,
        upgrade.effects[0]?.channel,
        upgrade.effects[0]?.modifier.targetStatId,
        upgrade.effects[0]?.modifier.value,
      ]),
    ).toEqual([
      [
        MVP_IDS.upgrades.betterChecklist,
        "modifier_grant",
        MVP_IDS.gameplayStats.manualBugsPerAction,
        1,
      ],
      [
        MVP_IDS.upgrades.coffee,
        "modifier_grant",
        MVP_IDS.gameplayStats.manualBugsPerAction,
        1,
      ],
      [
        MVP_IDS.upgrades.keyboardShortcuts,
        "modifier_grant",
        MVP_IDS.gameplayStats.manualBugsPerAction,
        2,
      ],
      [
        MVP_IDS.upgrades.bugReportTemplate,
        "modifier_grant",
        MVP_IDS.gameplayStats.moneyPerBugReported,
        1,
      ],
      [
        MVP_IDS.upgrades.testCaseLibrary,
        "modifier_grant",
        MVP_IDS.gameplayStats.manualBugsPerAction,
        3,
      ],
    ]);
  });
});

describe("MVP gameplay stat registry", () => {
  it("defines exactly the MVP modifiable gameplay stats", () => {
    expect(gameplayStatDefinitions.map((stat) => stat.id)).toEqual([
      MVP_IDS.gameplayStats.manualBugsPerAction,
      MVP_IDS.gameplayStats.moneyPerBugReported,
    ]);
  });

  it("defines Manual Bugs Per Action with the MVP base value", () => {
    const manualBugsPerAction = gameplayStatDefinitions.find(
      (stat) => stat.id === MVP_IDS.gameplayStats.manualBugsPerAction,
    );

    expect(manualBugsPerAction).toMatchObject({
      displayName: "Manual Bugs Per Action",
      baseValue: 1,
      category: "manual_testing",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: true,
    });
  });

  it("defines Money Per Bug Reported with the MVP base value", () => {
    const moneyPerBugReported = gameplayStatDefinitions.find(
      (stat) => stat.id === MVP_IDS.gameplayStats.moneyPerBugReported,
    );

    expect(moneyPerBugReported).toMatchObject({
      displayName: "Money Per Bug Reported",
      baseValue: 1,
      category: "bug_reporting",
      numericType: "native_number",
      allowNegative: false,
      minimumValue: 0,
      visible: true,
    });
  });

  it("keeps resource IDs out of the gameplay stat registry", () => {
    const statIds = new Set<string>(gameplayStatDefinitions.map((stat) => stat.id));

    expect(statIds.has(MVP_IDS.resources.bugsFound)).toBe(false);
    expect(statIds.has(MVP_IDS.resources.money)).toBe(false);
  });
});

describe("MVP career and promotion registries", () => {
  it("defines Junior QA as the starting stage and Middle QA as the inert target stage", () => {
    expect(careerStages).toEqual([
      {
        id: MVP_IDS.careerStages.juniorQa,
        label: "Junior QA",
        sortOrder: 10,
        isStartingStage: true,
        nextLabel: "Middle QA",
        description: "Manual testing, bug reports, and the first upgrades.",
        requirementText:
          "Find 100 lifetime bugs, earn $150 lifetime money, and buy 3 upgrades.",
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
    ]);
  });

  it("defines the single documented Junior to Middle promotion", () => {
    expect(promotionDefinitions).toEqual([
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
            amount: 100,
          },
          {
            id: "requirement_lifetime_money_earned_150",
            type: "lifetime_resource_at_least",
            source: "current_run_lifetime_money_earned",
            resourceId: MVP_IDS.resources.money,
            amount: 150,
          },
          {
            id: "requirement_purchased_upgrades_3",
            type: "purchased_upgrades_at_least",
            source: "purchased_mvp_upgrades",
            amount: 3,
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
    ]);
  });
});

describe("MVP unlock and UI surface metadata", () => {
  it("defines exactly the documented MVP UI surfaces", () => {
    expect(uiSurfaceDefinitions).toEqual([
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
    ]);
  });

  it("defines the promote action unlock separately from its UI surface target", () => {
    expect(unlockDefinitions).toEqual([
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
    ]);
    expect(unlockDefinitions[0]?.id).not.toBe(unlockDefinitions[0]?.targetId);
  });

  it("does not expose future system UI surfaces", () => {
    const surfaceIds = uiSurfaceDefinitions.map((surface) => surface.id);

    expect(surfaceIds).not.toContain("ui_team");
    expect(surfaceIds).not.toContain("ui_automation");
    expect(surfaceIds).not.toContain("ui_reputation");
    expect(surfaceIds).not.toContain("ui_achievements");
    expect(surfaceIds).not.toContain("ui_statistics");
  });
});

describe("MVP event contract IDs", () => {
  it("defines exactly the documented technical MVP events", () => {
    expect(Object.values(MVP_IDS.events)).toEqual([
      "manualTest.performed",
      "bugs.found",
      "bugReport.submitted",
      "money.earned",
      "resource.changed",
      "upgrade.purchased",
      "promotion.available",
      "promotion.completed",
      "career.stageChanged",
      "unlock.revealed",
      "game.saved",
      "game.loaded",
    ]);
  });
});
