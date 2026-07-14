import { describe, expect, it } from "vitest";
import {
  createInitialResourceState,
  initialState,
  MVP_RESOURCE_MAX,
  promotionDefinitions,
  upgrades,
} from "./gameData";
import {
  acceptPromotion,
  addResource,
  calculateGameplayStat,
  calculateGameplayStats,
  convertResources,
  createActiveModifierRegistry,
  dispatchGameplayEvents,
  evaluatePromotionAvailability,
  evaluatePromotionAvailabilityTransition,
  evaluatePromotionRequirements,
  formatCurrency,
  formatNumber,
  getDerivedStats,
  getPurchasedUpgradeCount,
  getPermanentModifierInstanceId,
  getPromotionProgress,
  getPromotionStage,
  getUiVisibilitySelectors,
  getUiSurfaceState,
  getUnlockState,
  getUpgradeCost,
  getUpgradeModifierDefinitions,
  getVisibleUpgradeDefinitions,
  performManualTest,
  purchaseUpgrade,
  reportAllBugs,
  spendResource,
  validateUpgradePurchase,
  validateResourceTransaction,
} from "./gameLogic";
import { MVP_IDS } from "./types";
import type {
  GameState,
  ModifierDefinition,
  ResourceDefinition,
  ResourceId,
  Upgrade,
} from "./types";
import type { GameplayEventListener } from "./gameLogic";

describe("game logic", () => {
  it("dispatches action events to listeners in deterministic priority order", () => {
    const observedDeliveries: string[] = [];
    const listeners: GameplayEventListener[] = [
      {
        id: "listener.z",
        priority: 10,
        handle: (event) => observedDeliveries.push(`listener.z:${event.id}`),
      },
      {
        id: "listener.a",
        priority: 10,
        handle: (event) => observedDeliveries.push(`listener.a:${event.id}`),
      },
      {
        id: "listener.early",
        priority: -1,
        handle: (event) => observedDeliveries.push(`listener.early:${event.id}`),
      },
    ];
    const result = performManualTest(initialState, 10, listeners);

    expect(result.ok).toBe(true);
    expect(result.events.map((event) => event.id)).toEqual([
      MVP_IDS.events.manualTestPerformed,
      MVP_IDS.events.resourceChanged,
      MVP_IDS.events.bugsFound,
    ]);
    expect(observedDeliveries).toEqual([
      "listener.early:manualTest.performed",
      "listener.a:manualTest.performed",
      "listener.z:manualTest.performed",
      "listener.early:resource.changed",
      "listener.a:resource.changed",
      "listener.z:resource.changed",
      "listener.early:bugs.found",
      "listener.a:bugs.found",
      "listener.z:bugs.found",
    ]);
  });

  it("collects transient event delivery metadata without mutating event order", () => {
    const actionResult = performManualTest(initialState, 11);
    const listener: GameplayEventListener = {
      id: "listener.debug",
      handle: () => undefined,
    };

    if (!actionResult.ok) {
      throw new Error("Manual Testing should succeed.");
    }

    const dispatchResult = dispatchGameplayEvents(actionResult.events, [listener]);

    expect(dispatchResult.events).toEqual(actionResult.events);
    expect(dispatchResult.deliveries).toEqual([
      { eventId: MVP_IDS.events.manualTestPerformed, listenerId: "listener.debug" },
      { eventId: MVP_IDS.events.resourceChanged, listenerId: "listener.debug" },
      { eventId: MVP_IDS.events.bugsFound, listenerId: "listener.debug" },
    ]);
  });

  it("does not dispatch success events for failed gameplay actions", () => {
    const observedEvents: string[] = [];
    const listener: GameplayEventListener = {
      id: "listener.debug",
      handle: (event) => observedEvents.push(event.id),
    };
    const result = reportAllBugs(initialState, 12, [listener]);

    expect(result.ok).toBe(false);
    expect(result.events).toEqual([]);
    expect(observedEvents).toEqual([]);
  });

  it("queries initial MVP unlock and UI surface state separately", () => {
    expect(getUnlockState(initialState, MVP_IDS.unlocks.promotionJuniorToMiddle)).toBe(
      "hidden",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.manualTesting)).toBe(
      "active",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.bugReporting)).toBe(
      "active",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.resourcesBasic)).toBe(
      "active",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.upgradesBasic)).toBe(
      "active",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.promotionProgress)).toBe(
      "active",
    );
    expect(getUiSurfaceState(initialState, MVP_IDS.uiSurfaces.promoteAction)).toBe(
      "hidden",
    );
  });

  it("returns active MVP UI visibility selectors for a new game", () => {
    expect(getUiVisibilitySelectors(initialState)).toEqual({
      resourceCounters: [MVP_IDS.uiSurfaces.resourcesBasic],
      actionButtons: [MVP_IDS.uiSurfaces.manualTesting, MVP_IDS.uiSurfaces.bugReporting],
      upgradePanels: [MVP_IDS.uiSurfaces.upgradesBasic],
      promotionProgress: [MVP_IDS.uiSurfaces.promotionProgress],
      promoteAction: [],
    });
  });

  it("returns the promote action only when its unlock state allows it", () => {
    const game = evaluatePromotionAvailability({
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

    expect(getUiVisibilitySelectors(game).promoteAction).toEqual([
      MVP_IDS.uiSurfaces.promoteAction,
    ]);
  });

  it("does not return future surfaces from UI visibility selectors", () => {
    const visibleSurfaceIds = Object.values(
      getUiVisibilitySelectors(initialState),
    ).flat();

    expect(visibleSurfaceIds).not.toContain("ui_team");
    expect(visibleSurfaceIds).not.toContain("ui_automation");
    expect(visibleSurfaceIds).not.toContain("ui_reputation");
    expect(visibleSurfaceIds).not.toContain("ui_achievements");
    expect(visibleSurfaceIds).not.toContain("ui_statistics");
  });

  it("uses fixed one-time upgrade costs", () => {
    const checklist = upgrades.find(
      (upgrade) => upgrade.id === MVP_IDS.upgrades.betterChecklist,
    );

    if (!checklist) {
      throw new Error("Checklist upgrade is missing.");
    }

    expect(getUpgradeCost(checklist)).toBe(10);
  });

  it("keeps hidden future upgrade definitions out of visible and purchasable selectors", () => {
    const baseUpgrade = upgrades[0];

    if (!baseUpgrade) {
      throw new Error("Expected at least one MVP upgrade definition.");
    }

    const hiddenFutureUpgrade: Upgrade = {
      ...baseUpgrade,
      id: "upgrade_future_automation",
      name: "Future Automation",
      visibility: "hidden",
      sortOrder: 999,
    };
    const upgradeDefinitions = [...upgrades, hiddenFutureUpgrade];
    const fundedGame = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 1_000,
      },
      upgrades: {
        ...initialState.upgrades,
        [hiddenFutureUpgrade.id]: 0,
      },
    };

    expect(
      getVisibleUpgradeDefinitions(fundedGame, upgradeDefinitions).map(
        (upgrade) => upgrade.id,
      ),
    ).toEqual(upgrades.map((upgrade) => upgrade.id));

    const validation = validateUpgradePurchase(
      fundedGame,
      hiddenFutureUpgrade.id,
      upgradeDefinitions,
    );

    expect(validation.ok).toBe(false);
    if (validation.ok) {
      throw new Error("Hidden future upgrade validation should fail.");
    }
    expect(validation.failures.map((failure) => failure.code)).toEqual(["not_visible"]);
  });

  it("formats compact resource numbers", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1_500)).toBe("1.5K");
    expect(formatNumber(-2_000_000)).toBe("-2.0M");
    expect(formatNumber(Number.NaN)).toBe("0");
  });

  it("formats MVP currency display without changing numeric values", () => {
    const money = 1_500;

    expect(formatCurrency(money)).toBe("$1.5K");
    expect(money).toBe(1_500);
  });

  it("derives click stats from owned upgrades", () => {
    expect(
      getDerivedStats({
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
          [MVP_IDS.upgrades.bugReportTemplate]: 1,
          [MVP_IDS.upgrades.testCaseLibrary]: 1,
        },
      }),
    ).toEqual({
      bugsPerClick: 8,
      moneyPerBug: 2,
    });
  });

  it("calculates MVP gameplay stats from registered base values without upgrades", () => {
    const stats = calculateGameplayStats(initialState);

    expect(stats[MVP_IDS.gameplayStats.manualBugsPerAction].value).toBe(1);
    expect(stats[MVP_IDS.gameplayStats.moneyPerBugReported].value).toBe(1);
    expect(
      stats[MVP_IDS.gameplayStats.manualBugsPerAction].breakdown.appliedModifiers,
    ).toEqual([]);
  });

  it("applies active flat upgrade modifiers through one calculation path", () => {
    const stats = calculateGameplayStats({
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.coffee]: 1,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
        [MVP_IDS.upgrades.testCaseLibrary]: 1,
      },
    });
    const manualBugsPerAction = stats[MVP_IDS.gameplayStats.manualBugsPerAction];
    const moneyPerBugReported = stats[MVP_IDS.gameplayStats.moneyPerBugReported];

    expect(manualBugsPerAction.value).toBe(8);
    expect(moneyPerBugReported.value).toBe(2);
    expect(
      manualBugsPerAction.breakdown.appliedModifiers.map((modifier) => [
        modifier.sourceId,
        modifier.value,
        modifier.newValue,
      ]),
    ).toEqual([
      [MVP_IDS.upgrades.betterChecklist, 1, 2],
      [MVP_IDS.upgrades.coffee, 1, 3],
      [MVP_IDS.upgrades.keyboardShortcuts, 2, 5],
      [MVP_IDS.upgrades.testCaseLibrary, 3, 8],
    ]);
  });

  it("calculates a single stat from an explicit active modifier registry", () => {
    const { registry } = createActiveModifierRegistry({
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
      },
    });

    expect(
      calculateGameplayStat(MVP_IDS.gameplayStats.moneyPerBugReported, registry),
    ).toMatchObject({
      statId: MVP_IDS.gameplayStats.moneyPerBugReported,
      value: 2,
      breakdown: {
        baseValue: 1,
        finalValue: 2,
      },
    });
  });

  it("builds active modifier registry instances from purchased upgrades", () => {
    const modifierDefinitions = getUpgradeModifierDefinitions();
    const checklistModifier = modifierDefinitions.find(
      (modifier) => modifier.sourceId === MVP_IDS.upgrades.betterChecklist,
    );
    const templateModifier = modifierDefinitions.find(
      (modifier) => modifier.sourceId === MVP_IDS.upgrades.bugReportTemplate,
    );

    if (!checklistModifier || !templateModifier) {
      throw new Error("Expected MVP upgrade modifiers are missing.");
    }

    const result = createActiveModifierRegistry({
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.bugReportTemplate]: 1,
      },
    });

    expect(result.failures).toEqual([]);
    expect(result.registry).toEqual({
      [getPermanentModifierInstanceId(checklistModifier)]: {
        instanceId: getPermanentModifierInstanceId(checklistModifier),
        definitionId: checklistModifier.definitionId,
        enabled: true,
      },
      [getPermanentModifierInstanceId(templateModifier)]: {
        instanceId: getPermanentModifierInstanceId(templateModifier),
        definitionId: templateModifier.definitionId,
        enabled: true,
      },
    });
  });

  it("keeps the modifier registry empty when no upgrades are owned", () => {
    expect(createActiveModifierRegistry(initialState)).toEqual({
      registry: {},
      failures: [],
    });
  });

  it("ignores unsupported modifier definitions and reports failures", () => {
    const unsupportedModifier: ModifierDefinition = {
      definitionId: "upgrade.future_automation.manual_bugs_per_action.temporary",
      sourceType: "upgrade",
      sourceId: MVP_IDS.upgrades.betterChecklist,
      targetStatId: MVP_IDS.gameplayStats.manualBugsPerAction,
      modifierType: "multiplicative",
      value: 2,
      durationType: "temporary",
      stackingPolicy: "stack",
    };

    const result = createActiveModifierRegistry(
      {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      },
      [unsupportedModifier],
    );

    expect(result.registry).toEqual({});
    expect(result.failures.map((failure) => failure.code)).toEqual([
      "unsupported_modifier_type",
      "unsupported_modifier_duration",
      "unsupported_modifier_stacking",
    ]);
  });

  it("returns the next promotion stage when requirements are met", () => {
    expect(
      getPromotionStage({
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      })?.id,
    ).toBe(MVP_IDS.careerStages.middleQa);
  });

  it("does not promote before requirements are met", () => {
    expect(getPromotionStage(initialState)).toBeNull();
  });

  it("makes the promotion action available when requirements are met", () => {
    const result = evaluatePromotionAvailability({
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

    expect(result.promotion.availablePromotionIds).toEqual([
      MVP_IDS.promotions.juniorToMiddle,
    ]);
    expect(result.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe("available");
    expect(result.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("active");
  });

  it("emits promotion available once when availability first becomes true", () => {
    const result = evaluatePromotionAvailabilityTransition(
      {
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      },
      30,
    );

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.juniorQa);
    expect(result.game.promotion).toEqual({
      availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      completedPromotionIds: [],
    });
    expect(result.events).toEqual([
      {
        id: "promotion.available",
        payload: {
          promotionId: MVP_IDS.promotions.juniorToMiddle,
          fromCareerStageId: MVP_IDS.careerStages.juniorQa,
          toCareerStageId: MVP_IDS.careerStages.middleQa,
          simulationTime: 30,
        },
      },
      {
        id: "unlock.revealed",
        payload: {
          unlockId: MVP_IDS.unlocks.promotionJuniorToMiddle,
          targetSurfaceId: MVP_IDS.uiSurfaces.promoteAction,
          previousUnlockState: "hidden",
          currentUnlockState: "available",
          simulationTime: 30,
        },
      },
    ]);

    expect(evaluatePromotionAvailabilityTransition(result.game, 31).events).toEqual([]);
  });

  it("reveals the promote action through unlock state when promotion is available", () => {
    const result = evaluatePromotionAvailabilityTransition(
      {
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      },
      31,
    );

    expect(result.game.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe(
      "available",
    );
    expect(result.game.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("active");
    expect(result.events.map((event) => event.id)).toContain("unlock.revealed");
  });

  it("does not emit promotion available before all requirements pass", () => {
    const result = evaluatePromotionAvailabilityTransition(
      {
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
        },
      },
      32,
    );

    expect(result.game.promotion.availablePromotionIds).toEqual([]);
    expect(result.events).toEqual([]);
  });

  it("repairs stale promotion action state after promotion completion", () => {
    const result = evaluatePromotionAvailability({
      ...initialState,
      careerStage: MVP_IDS.careerStages.middleQa,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      unlocks: {
        ...initialState.unlocks,
        [MVP_IDS.unlocks.promotionJuniorToMiddle]: "available",
      },
      uiSurfaces: {
        ...initialState.uiSurfaces,
        [MVP_IDS.uiSurfaces.promoteAction]: "active",
      },
    });

    expect(result.promotion.availablePromotionIds).toEqual([]);
    expect(result.promotion.completedPromotionIds).toEqual([
      MVP_IDS.promotions.juniorToMiddle,
    ]);
    expect(result.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe("hidden");
    expect(result.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("hidden");
  });

  it("accepts promotion through one gameplay operation", () => {
    const result = acceptPromotion(
      {
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        promotion: {
          ...initialState.promotion,
          availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        },
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      },
      25,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Promotion should succeed.");
    }

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.middleQa);
    expect(result.game.lastPlayedAt).toBe(25);
    expect(result.game.promotion).toEqual({
      availablePromotionIds: [],
      completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
    });
    expect(result.game.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe("hidden");
    expect(result.game.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("hidden");
    expect(result.events).toEqual([
      {
        id: "promotion.completed",
        payload: {
          promotionId: MVP_IDS.promotions.juniorToMiddle,
          fromCareerStageId: MVP_IDS.careerStages.juniorQa,
          toCareerStageId: MVP_IDS.careerStages.middleQa,
          simulationTime: 25,
        },
      },
      {
        id: "career.stageChanged",
        payload: {
          promotionId: MVP_IDS.promotions.juniorToMiddle,
          previousCareerStageId: MVP_IDS.careerStages.juniorQa,
          currentCareerStageId: MVP_IDS.careerStages.middleQa,
          simulationTime: 25,
        },
      },
    ]);
  });

  it("does not reveal future systems after promotion completion", () => {
    const result = acceptPromotion(
      {
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        promotion: {
          ...initialState.promotion,
          availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        },
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
          [MVP_IDS.upgrades.keyboardShortcuts]: 1,
        },
      },
      26,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Promotion should succeed.");
    }

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.middleQa);
    expect(result.game.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("hidden");
    expect(result.game.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe("hidden");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_team");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_automation");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_reputation");
  });

  it("leaves state unchanged when accepting promotion before requirements are met", () => {
    const result = acceptPromotion(initialState, 27);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(initialState);
    expect(result.events).toEqual([]);
  });

  it("leaves state unchanged when accepting an already completed promotion", () => {
    const game = {
      ...initialState,
      totalBugsFound: 100,
      totalMoneyEarned: 150,
      promotion: {
        availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
        completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
        [MVP_IDS.upgrades.coffee]: 1 as const,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1 as const,
      },
    };
    const result = acceptPromotion(game, 28);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    expect(result.events).toEqual([]);
  });

  it("includes promotion availability event on the gameplay action that unlocks it", () => {
    const result = purchaseUpgrade(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.money]: 60,
        },
        totalBugsFound: 100,
        totalMoneyEarned: 150,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
        },
      },
      MVP_IDS.upgrades.keyboardShortcuts,
      33,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Upgrade purchase should succeed.");
    }

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.juniorQa);
    expect(result.game.promotion.availablePromotionIds).toEqual([
      MVP_IDS.promotions.juniorToMiddle,
    ]);
    expect(result.events.map((event) => event.id)).toEqual([
      "resource.changed",
      "upgrade.purchased",
      "promotion.available",
      "unlock.revealed",
    ]);
    expect(result.events[2]).toEqual({
      id: "promotion.available",
      payload: {
        promotionId: MVP_IDS.promotions.juniorToMiddle,
        fromCareerStageId: MVP_IDS.careerStages.juniorQa,
        toCareerStageId: MVP_IDS.careerStages.middleQa,
        simulationTime: 33,
      },
    });
    expect(result.events[3]).toEqual({
      id: "unlock.revealed",
      payload: {
        unlockId: MVP_IDS.unlocks.promotionJuniorToMiddle,
        targetSurfaceId: MVP_IDS.uiSurfaces.promoteAction,
        previousUnlockState: "hidden",
        currentUnlockState: "available",
        simulationTime: 33,
      },
    });
  });

  it("returns shared promotion progress rows", () => {
    expect(
      getPromotionProgress({
        ...initialState,
        totalBugsFound: 100,
        totalMoneyEarned: 25,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      }),
    ).toEqual([
      {
        id: "current_run_lifetime_bugs_found",
        label: "Lifetime bugs found",
        current: 100,
        required: 100,
        prefix: "",
        complete: true,
      },
      {
        id: "current_run_lifetime_money_earned",
        label: "Lifetime money earned",
        current: 25,
        required: 150,
        prefix: "$",
        complete: false,
      },
      {
        id: "purchased_mvp_upgrades",
        label: "Upgrades purchased",
        current: 1,
        required: 3,
        prefix: "",
        complete: false,
      },
    ]);
  });

  it("returns no promotion progress rows when the current stage has no active promotion", () => {
    expect(
      getPromotionProgress({
        ...initialState,
        careerStage: MVP_IDS.careerStages.middleQa,
      }),
    ).toEqual([]);
  });

  it("returns inspectable shared requirement evaluation rows", () => {
    const promotionDefinition = promotionDefinitions[0];

    if (!promotionDefinition) {
      throw new Error("Expected MVP promotion definition is missing.");
    }

    expect(
      evaluatePromotionRequirements(
        {
          ...initialState,
          totalBugsFound: 100,
          totalMoneyEarned: 25,
          upgrades: {
            ...initialState.upgrades,
            [MVP_IDS.upgrades.betterChecklist]: 1,
          },
        },
        promotionDefinition.requirements,
      ),
    ).toEqual({
      requirements: [
        {
          id: "requirement_lifetime_bugs_found_100",
          type: "lifetime_resource_at_least",
          source: "current_run_lifetime_bugs_found",
          currentValue: 100,
          requiredValue: 100,
          passed: true,
        },
        {
          id: "requirement_lifetime_money_earned_150",
          type: "lifetime_resource_at_least",
          source: "current_run_lifetime_money_earned",
          currentValue: 25,
          requiredValue: 150,
          passed: false,
        },
        {
          id: "requirement_purchased_upgrades_3",
          type: "purchased_upgrades_at_least",
          source: "purchased_mvp_upgrades",
          currentValue: 1,
          requiredValue: 3,
          passed: false,
        },
      ],
      allRequirementsPassed: false,
    });
  });

  it("uses lifetime money earned instead of current money balance", () => {
    const promotionDefinition = promotionDefinitions[0];

    if (!promotionDefinition) {
      throw new Error("Expected MVP promotion definition is missing.");
    }

    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 500,
      },
      totalBugsFound: 100,
      totalMoneyEarned: 25,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
        [MVP_IDS.upgrades.coffee]: 1 as const,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1 as const,
      },
    };
    const evaluation = evaluatePromotionRequirements(
      game,
      promotionDefinition.requirements,
    );

    expect(evaluation.requirements[1]).toMatchObject({
      source: "current_run_lifetime_money_earned",
      currentValue: 25,
      passed: false,
    });
    expect(evaluation.allRequirementsPassed).toBe(false);
    expect(getPromotionStage(game)).toBeNull();
  });

  it("counts only purchased MVP upgrades from registered active definitions", () => {
    const checklist = upgrades.find(
      (upgrade) => upgrade.id === MVP_IDS.upgrades.betterChecklist,
    );
    const coffee = upgrades.find((upgrade) => upgrade.id === MVP_IDS.upgrades.coffee);

    if (!checklist || !coffee) {
      throw new Error("Expected MVP upgrade definitions are missing.");
    }

    const futureUpgrade = {
      ...checklist,
      id: "future_upgrade",
      visibility: "active",
    } as unknown as Upgrade;
    const hiddenMvpUpgrade = {
      ...coffee,
      visibility: "hidden" as const,
    };
    const game = {
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
        [MVP_IDS.upgrades.coffee]: 1 as const,
        future_upgrade: 1,
      },
    } as unknown as typeof initialState;

    expect(getPurchasedUpgradeCount(initialState)).toBe(0);
    expect(getPurchasedUpgradeCount(game)).toBe(2);
    expect(
      getPurchasedUpgradeCount(game, [checklist, hiddenMvpUpgrade, futureUpgrade]),
    ).toBe(1);
  });

  it("caps the purchased MVP upgrade count at one per MVP upgrade", () => {
    const malformedGame = {
      ...initialState,
      upgrades: Object.fromEntries(
        upgrades.map((upgrade) => [upgrade.id, 2]),
      ) as unknown as typeof initialState.upgrades,
    };

    expect(getPurchasedUpgradeCount(malformedGame)).toBe(5);
  });
});

describe("resource transaction validation", () => {
  it("accepts valid add, spend, and convert requests with projected changes", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 10,
      [MVP_IDS.resources.money]: 5,
    };

    expect(
      validateResourceTransaction(resources, {
        operationType: "add",
        changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: 3 }],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 10,
          newValue: 13,
          delta: 3,
        },
      ],
    });

    expect(
      validateResourceTransaction(resources, {
        operationType: "spend",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: -4 }],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 5,
          newValue: 1,
          delta: -4,
        },
      ],
    });

    expect(
      validateResourceTransaction(resources, {
        operationType: "convert",
        changes: [
          { resourceId: MVP_IDS.resources.bugsFound, delta: -2 },
          { resourceId: MVP_IDS.resources.money, delta: 2 },
        ],
      }),
    ).toEqual({
      ok: true,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 10,
          newValue: 8,
          delta: -2,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 5,
          newValue: 7,
          delta: 2,
        },
      ],
    });
  });

  it("rejects missing resources without mutating state", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "add",
      changes: [{ resourceId: "future_resource" as ResourceId, delta: 1 }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "resource_not_found",
      );
    }
    expect(initialState.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 0,
    });
  });

  it("rejects invalid operation shapes and numeric amounts", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "add",
      changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: Number.NaN }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain("invalid_amount");
    }

    const malformedConvert = validateResourceTransaction(initialState.resources, {
      operationType: "convert",
      changes: [{ resourceId: MVP_IDS.resources.bugsFound, delta: 1 }],
    });

    expect(malformedConvert.ok).toBe(false);
    if (!malformedConvert.ok) {
      expect(malformedConvert.failures.map((failure) => failure.code)).toContain(
        "operation_not_allowed",
      );
    }
  });

  it("rejects duplicate resource changes in one transaction", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 5,
    };
    const result = validateResourceTransaction(resources, {
      operationType: "convert",
      changes: [
        { resourceId: MVP_IDS.resources.bugsFound, delta: -2 },
        { resourceId: MVP_IDS.resources.bugsFound, delta: 1 },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "duplicate_resource_change",
      );
    }
    expect(resources[MVP_IDS.resources.bugsFound]).toBe(5);
  });

  it("rejects spends below the minimum balance", () => {
    const result = validateResourceTransaction(initialState.resources, {
      operationType: "spend",
      changes: [{ resourceId: MVP_IDS.resources.money, delta: -1 }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_below_minimum",
      );
    }
  });

  it("rejects additions above the MVP maximum balance", () => {
    const result = validateResourceTransaction(
      {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 1_000_000,
      },
      {
        operationType: "add",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: 1 }],
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_above_maximum",
      );
    }
  });

  it("rejects spending a registered non-spendable resource", () => {
    const nonSpendableDefinitions: ResourceDefinition[] = [
      {
        id: MVP_IDS.resources.money,
        displayName: "Money",
        description: "Test-only non-spendable resource definition.",
        category: "personal_economy",
        lifetimeCategory: "investment",
        producedBy: [],
        consumedBy: [],
        initialValue: 0,
        minimumValue: 0,
        maximumValue: 1_000_000,
        isSpendable: false,
        isPersistent: true,
        visibleByDefault: true,
        resetBehavior: "reset",
        format: {
          style: "integer",
          maximumFractionDigits: 0,
        },
      },
    ];
    const result = validateResourceTransaction(
      { ...initialState.resources, [MVP_IDS.resources.money]: 10 },
      {
        operationType: "spend",
        changes: [{ resourceId: MVP_IDS.resources.money, delta: -1 }],
      },
      nonSpendableDefinitions,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "resource_not_spendable",
      );
    }
  });
});

describe("resource operations", () => {
  it("initializes MVP resource balances from registry defaults", () => {
    const resources = createInitialResourceState();

    expect(resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 0,
    });
    expect(Object.keys(resources)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
  });

  it("adds resources after validation and returns transaction metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 2,
    };
    const result = addResource(resources, {
      resourceId: MVP_IDS.resources.bugsFound,
      amount: 3,
      sourceSystem: "manual_testing",
      reason: "Manual Testing action",
      simulationTime: 12,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Add operation should succeed.");
    }

    expect(resources[MVP_IDS.resources.bugsFound]).toBe(2);
    expect(result.resources).toEqual({
      ...resources,
      [MVP_IDS.resources.bugsFound]: 5,
    });
    expect(result.transaction).toMatchObject({
      transactionId: "resource:add:manual_testing:Manual Testing action:12:bugs_found:3",
      operationType: "add",
      sourceSystem: "manual_testing",
      reason: "Manual Testing action",
      simulationTime: 12,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 2,
          newValue: 5,
          delta: 3,
        },
      ],
    });
    expect(result.events).toEqual([
      {
        id: "resource.changed",
        payload: result.transaction,
      },
    ]);
  });

  it("spends resources after validation and returns transaction metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: 10,
    };
    const result = spendResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 4,
      sourceSystem: "upgrades",
      reason: "Buy Better Checklist",
      simulationTime: 20,
      transactionId: "test-transaction-id",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Spend operation should succeed.");
    }

    expect(resources[MVP_IDS.resources.money]).toBe(10);
    expect(result.resources).toEqual({
      ...resources,
      [MVP_IDS.resources.money]: 6,
    });
    expect(result.transaction).toEqual({
      transactionId: "test-transaction-id",
      operationType: "spend",
      sourceSystem: "upgrades",
      reason: "Buy Better Checklist",
      simulationTime: 20,
      changes: [
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 10,
          newValue: 6,
          delta: -4,
        },
      ],
    });
    expect(result.events).toEqual([
      {
        id: "resource.changed",
        payload: result.transaction,
      },
    ]);
  });

  it("allows spending exactly down to the resource minimum", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: 4,
    };
    const result = spendResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 4,
      sourceSystem: "upgrades",
      reason: "Spend exact balance",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Exact-balance spend should succeed.");
    }

    expect(result.resources[MVP_IDS.resources.money]).toBe(0);
    expect(result.transaction.changes).toEqual([
      {
        resourceId: MVP_IDS.resources.money,
        previousValue: 4,
        newValue: 0,
        delta: -4,
      },
    ]);
  });

  it("leaves resources unchanged and emits no events when an operation fails", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: 1,
    };
    const result = spendResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 2,
      sourceSystem: "upgrades",
      reason: "Insufficient funds",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Spend operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.resources[MVP_IDS.resources.money]).toBe(1);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "balance_below_minimum",
    );
    expect(result.events).toEqual([]);
  });

  it("rejects add operations above the MVP maximum without mutating resources", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.money]: MVP_RESOURCE_MAX,
    };
    const result = addResource(resources, {
      resourceId: MVP_IDS.resources.money,
      amount: 1,
      sourceSystem: "bug_reporting",
      reason: "Overflow Money",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Overflow add operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.resources[MVP_IDS.resources.money]).toBe(MVP_RESOURCE_MAX);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "balance_above_maximum",
    );
    expect(result.events).toEqual([]);
  });

  it("converts one resource into another atomically with deterministic metadata", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 7,
      [MVP_IDS.resources.money]: 3,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 4,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 8,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
      simulationTime: 70,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Convert operation should succeed.");
    }

    expect(resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 7,
      [MVP_IDS.resources.money]: 3,
    });
    expect(result.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 3,
      [MVP_IDS.resources.money]: 11,
    });
    expect(result.transaction).toEqual({
      transactionId:
        "resource:convert:bug_reporting:Report Bugs Found:70:bugs_found:-4,money:8",
      operationType: "convert",
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
      simulationTime: 70,
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 7,
          newValue: 3,
          delta: -4,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 3,
          newValue: 11,
          delta: 8,
        },
      ],
    });
    expect(result.events).toEqual([
      { id: "resource.changed", payload: result.transaction },
    ]);
  });

  it("leaves both resources unchanged when a conversion would partially fail", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 5,
      [MVP_IDS.resources.money]: 1_000_000,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 5,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 1,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Convert operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 5,
      [MVP_IDS.resources.money]: 1_000_000,
    });
    expect(result.failures.map((failure) => failure.code)).toContain(
      "balance_above_maximum",
    );
    expect(result.events).toEqual([]);
  });

  it("rejects zero-amount conversions without mutating resources", () => {
    const resources = {
      ...initialState.resources,
      [MVP_IDS.resources.bugsFound]: 5,
    };
    const result = convertResources(resources, {
      fromResourceId: MVP_IDS.resources.bugsFound,
      fromAmount: 0,
      toResourceId: MVP_IDS.resources.money,
      toAmount: 0,
      sourceSystem: "bug_reporting",
      reason: "Report Bugs Found",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Convert operation should fail.");
    }

    expect(result.resources).toBe(resources);
    expect(result.failures.map((failure) => failure.code)).toContain("invalid_amount");
    expect(result.events).toEqual([]);
  });
});

describe("gameplay action operations", () => {
  it("performs manual testing through a resource transaction", () => {
    const result = performManualTest(
      {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      },
      30,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Manual testing should succeed.");
    }

    expect(result.game.resources[MVP_IDS.resources.bugsFound]).toBe(2);
    expect(result.game.totalBugsFound).toBe(2);
    expect(result.game.resources[MVP_IDS.resources.money]).toBe(0);
    expect(result.events.map((event) => event.id)).toEqual([
      "manualTest.performed",
      "resource.changed",
      "bugs.found",
    ]);
    expect(result.events[0]).toEqual({
      id: "manualTest.performed",
      payload: {
        actionId: MVP_IDS.actions.manualTest,
        bugsFound: 2,
        simulationTime: 30,
      },
    });
    expect(result.events[1]?.payload).toMatchObject({
      operationType: "add",
      sourceSystem: "manual_testing",
    });
    expect(result.events[2]).toEqual({
      id: "bugs.found",
      payload: {
        resourceId: MVP_IDS.resources.bugsFound,
        amount: 2,
        totalBugsFound: 2,
        simulationTime: 30,
      },
    });
  });

  it("rejects manual testing when the resource cap would be exceeded", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 1_000_000,
      },
    };
    const result = performManualTest(game);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "balance_above_maximum",
      );
    }
  });

  it("reports all bugs through one atomic convert transaction", () => {
    const result = reportAllBugs(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.bugsFound]: 5,
        },
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.bugReportTemplate]: 1,
        },
      },
      40,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Bug reporting should succeed.");
    }

    expect(result.game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 10,
    });
    expect(result.game.totalMoneyEarned).toBe(10);
    expect(result.events.map((event) => event.id)).toEqual([
      "bugReport.submitted",
      "resource.changed",
      "money.earned",
    ]);
    expect(result.events[0]).toEqual({
      id: "bugReport.submitted",
      payload: {
        actionId: MVP_IDS.actions.reportBugs,
        reportedBugs: 5,
        earnedMoney: 10,
        simulationTime: 40,
      },
    });
    expect(result.events[1]?.payload).toMatchObject({
      operationType: "convert",
      sourceSystem: "bug_reporting",
      changes: [
        {
          resourceId: MVP_IDS.resources.bugsFound,
          previousValue: 5,
          newValue: 0,
          delta: -5,
        },
        {
          resourceId: MVP_IDS.resources.money,
          previousValue: 0,
          newValue: 10,
          delta: 10,
        },
      ],
    });
    expect(result.events[2]).toEqual({
      id: "money.earned",
      payload: {
        resourceId: MVP_IDS.resources.money,
        amount: 10,
        totalMoneyEarned: 10,
        simulationTime: 40,
      },
    });
  });

  it("leaves state unchanged when reporting with zero bugs", () => {
    const result = reportAllBugs(initialState, 45);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(initialState);
    expect(result.events).toEqual([]);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "operation_not_allowed",
      );
    }
  });

  it("reports the full current bug balance without producing future resources", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.bugsFound]: 2.5,
      },
    };
    const result = reportAllBugs(game, 46);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Bug reporting should succeed.");
    }

    expect(result.game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 2.5,
    });
    expect(Object.keys(result.game.resources)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
    expect(result.game.totalMoneyEarned).toBe(2.5);
  });

  it("purchases upgrades through a resource spend transaction", () => {
    const result = purchaseUpgrade(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.money]: 10,
        },
      },
      MVP_IDS.upgrades.betterChecklist,
      50,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Upgrade purchase should succeed.");
    }

    expect(result.game.resources[MVP_IDS.resources.money]).toBe(0);
    expect(result.game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(1);
    expect(result.events[0]?.payload).toMatchObject({
      operationType: "spend",
      sourceSystem: "upgrade_system",
    });
    expect(result.events[1]).toEqual({
      id: "upgrade.purchased",
      payload: {
        upgradeId: MVP_IDS.upgrades.betterChecklist,
        previousLevel: 0,
        newLevel: 1,
        cost: {
          resourceId: MVP_IDS.resources.money,
          amount: 10,
        },
        modifierDefinitionIds: [
          "upgrade.upgrade_better_checklist.manual_bugs_per_action.flat",
        ],
        simulationTime: 50,
      },
    });
  });

  it("purchases all MVP upgrades and activates their modifier effects", () => {
    let game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 445,
      },
    };

    for (const upgrade of upgrades) {
      const previousMoney = game.resources[MVP_IDS.resources.money];
      const result = purchaseUpgrade(game, upgrade.id, 55);

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(`${upgrade.id} purchase should succeed.`);
      }

      expect(result.game.resources[MVP_IDS.resources.money]).toBe(
        previousMoney - upgrade.cost.amount,
      );
      expect(result.game.upgrades[upgrade.id]).toBe(1);
      expect(result.events.map((event) => event.id)).toEqual([
        "resource.changed",
        "upgrade.purchased",
      ]);

      game = result.game;
    }

    expect(game.resources[MVP_IDS.resources.money]).toBe(0);
    expect(getDerivedStats(game)).toEqual({
      bugsPerClick: 8,
      moneyPerBug: 2,
    });
  });

  it("rolls back the full upgrade purchase when ownership validation fails", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 10,
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
      },
    };
    const result = purchaseUpgrade(game, MVP_IDS.upgrades.betterChecklist, 65);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    expect(result.events).toEqual([]);
    expect(game.resources[MVP_IDS.resources.money]).toBe(10);
    expect(game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(1);
  });

  it("validates unknown upgrade purchase attempts with a structured error", () => {
    const result = validateUpgradePurchase(initialState, "upgrade_missing");

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Upgrade validation should fail.");
    }

    expect(result.failures).toEqual([
      {
        code: "definition_not_found",
        upgradeId: "upgrade_missing",
        message: "Unknown upgrade: upgrade_missing.",
      },
    ]);
  });

  it("validates one-time ownership before purchase", () => {
    const result = validateUpgradePurchase(
      {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
        },
      },
      MVP_IDS.upgrades.betterChecklist,
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Upgrade validation should fail.");
    }

    expect(result.failures.map((failure) => failure.code)).toEqual(["already_owned"]);
  });

  it("validates money affordability through the Resource System", () => {
    const result = validateUpgradePurchase(
      initialState,
      MVP_IDS.upgrades.betterChecklist,
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Upgrade validation should fail.");
    }

    expect(result.failures.map((failure) => failure.code)).toEqual(["not_affordable"]);
  });

  it("returns resolved cost and effects for a valid upgrade purchase", () => {
    const result = validateUpgradePurchase(
      {
        ...initialState,
        resources: {
          ...initialState.resources,
          [MVP_IDS.resources.money]: 10,
        },
      },
      MVP_IDS.upgrades.betterChecklist,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Upgrade validation should succeed.");
    }

    expect(result.resolvedCost).toEqual({
      resourceId: MVP_IDS.resources.money,
      amount: 10,
    });
    expect(result.effects).toEqual(result.upgrade.effects);
  });

  it("leaves state unchanged when an upgrade purchase fails", () => {
    const result = purchaseUpgrade(initialState, MVP_IDS.upgrades.betterChecklist, 60);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(initialState);
    expect(result.events).toEqual([]);
  });
});

describe("core gameplay loop MVP integration", () => {
  it("completes the manual test, report, upgrade, and improved production loop without UI", () => {
    let game = initialState;

    for (let actionIndex = 0; actionIndex < 10; actionIndex += 1) {
      const result = performManualTest(game, actionIndex);

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("Manual Testing should succeed in the base loop.");
      }

      game = result.game;
    }

    expect(game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 10,
      [MVP_IDS.resources.money]: 0,
    });
    expect(game.totalBugsFound).toBe(10);

    const firstReport = reportAllBugs(game, 10);

    expect(firstReport.ok).toBe(true);
    if (!firstReport.ok) {
      throw new Error("Bug Reporting should convert accumulated Bugs Found.");
    }

    game = firstReport.game;
    expect(game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 10,
    });
    expect(game.totalMoneyEarned).toBe(10);

    const checklistPurchase = purchaseUpgrade(game, MVP_IDS.upgrades.betterChecklist, 11);

    expect(checklistPurchase.ok).toBe(true);
    if (!checklistPurchase.ok) {
      throw new Error("Better Checklist should be purchasable with earned Money.");
    }

    game = checklistPurchase.game;
    expect(game.resources[MVP_IDS.resources.money]).toBe(0);
    expect(game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(1);
    expect(getDerivedStats(game)).toEqual({
      bugsPerClick: 2,
      moneyPerBug: 1,
    });

    for (let actionIndex = 12; actionIndex < 62; actionIndex += 1) {
      const result = performManualTest(game, actionIndex);

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("Upgraded Manual Testing should keep producing Bugs Found.");
      }

      game = result.game;
    }

    expect(game.resources[MVP_IDS.resources.bugsFound]).toBe(100);
    expect(game.totalBugsFound).toBe(110);

    const secondReport = reportAllBugs(game, 62);

    expect(secondReport.ok).toBe(true);
    if (!secondReport.ok) {
      throw new Error("Bug Reporting should report the full upgraded bug balance.");
    }

    game = secondReport.game;
    expect(game.resources[MVP_IDS.resources.money]).toBe(100);
    expect(game.totalMoneyEarned).toBe(110);

    const templatePurchase = purchaseUpgrade(
      game,
      MVP_IDS.upgrades.bugReportTemplate,
      63,
    );

    expect(templatePurchase.ok).toBe(true);
    if (!templatePurchase.ok) {
      throw new Error("Bug Report Template should be purchasable with loop earnings.");
    }

    game = templatePurchase.game;
    expect(getDerivedStats(game)).toEqual({
      bugsPerClick: 2,
      moneyPerBug: 2,
    });

    const upgradedManualTest = performManualTest(game, 64);

    expect(upgradedManualTest.ok).toBe(true);
    if (!upgradedManualTest.ok) {
      throw new Error("Manual Testing should use the purchased checklist modifier.");
    }

    game = upgradedManualTest.game;
    expect(game.resources[MVP_IDS.resources.bugsFound]).toBe(2);
    expect(game.totalBugsFound).toBe(112);

    const upgradedReport = reportAllBugs(game, 65);

    expect(upgradedReport.ok).toBe(true);
    if (!upgradedReport.ok) {
      throw new Error("Bug Reporting should use the purchased template modifier.");
    }

    game = upgradedReport.game;
    expect(game.resources).toEqual({
      [MVP_IDS.resources.bugsFound]: 0,
      [MVP_IDS.resources.money]: 4,
    });
    expect(game.totalMoneyEarned).toBe(114);
    expect(Object.keys(game.resources)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
    expect(game.resources).not.toHaveProperty("reputation");
    expect(game.resources).not.toHaveProperty("automation_coverage");
    expect(game.resources).not.toHaveProperty("team_output");
  });

  it("fails an empty bug report inside the core loop without mutating state", () => {
    const result = reportAllBugs(initialState, 70);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(initialState);
    expect(result.events).toEqual([]);
    if (!result.ok) {
      expect(result.failures.map((failure) => failure.code)).toContain(
        "operation_not_allowed",
      );
    }
  });
});

describe("modifier and upgrade MVP coverage", () => {
  const upgradeEffectExpectations = [
    {
      upgradeId: MVP_IDS.upgrades.betterChecklist,
      statId: MVP_IDS.gameplayStats.manualBugsPerAction,
      expectedValue: 2,
      expectedModifierValue: 1,
    },
    {
      upgradeId: MVP_IDS.upgrades.coffee,
      statId: MVP_IDS.gameplayStats.manualBugsPerAction,
      expectedValue: 2,
      expectedModifierValue: 1,
    },
    {
      upgradeId: MVP_IDS.upgrades.keyboardShortcuts,
      statId: MVP_IDS.gameplayStats.manualBugsPerAction,
      expectedValue: 3,
      expectedModifierValue: 2,
    },
    {
      upgradeId: MVP_IDS.upgrades.bugReportTemplate,
      statId: MVP_IDS.gameplayStats.moneyPerBugReported,
      expectedValue: 2,
      expectedModifierValue: 1,
    },
    {
      upgradeId: MVP_IDS.upgrades.testCaseLibrary,
      statId: MVP_IDS.gameplayStats.manualBugsPerAction,
      expectedValue: 4,
      expectedModifierValue: 3,
    },
  ] as const;

  it.each(upgradeEffectExpectations)(
    "applies $upgradeId only through its registered modifier",
    ({ upgradeId, statId, expectedValue, expectedModifierValue }) => {
      const game = {
        ...initialState,
        upgrades: {
          ...initialState.upgrades,
          [upgradeId]: 1,
        },
      };
      const { registry, failures } = createActiveModifierRegistry(game);
      const result = calculateGameplayStat(statId, registry);

      expect(failures).toEqual([]);
      expect(result.value).toBe(expectedValue);
      expect(result.breakdown.appliedModifiers).toHaveLength(1);
      expect(result.breakdown.appliedModifiers[0]).toMatchObject({
        sourceType: "upgrade",
        sourceId: upgradeId,
        modifierType: "flat",
        value: expectedModifierValue,
        previousValue: 1,
        newValue: expectedValue,
      });
    },
  );

  it("calculates final additive MVP stat values after every upgrade is owned", () => {
    const game = {
      ...initialState,
      upgrades: Object.fromEntries(
        upgrades.map((upgrade) => [upgrade.id, 1]),
      ) as typeof initialState.upgrades,
    };
    const stats = calculateGameplayStats(game);

    expect(stats[MVP_IDS.gameplayStats.manualBugsPerAction].value).toBe(8);
    expect(stats[MVP_IDS.gameplayStats.moneyPerBugReported].value).toBe(2);
  });

  it("does not spend Money or activate modifiers when Money is insufficient", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 9,
      },
    };
    const result = purchaseUpgrade(game, MVP_IDS.upgrades.betterChecklist, 80);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    expect(result.events).toEqual([]);
    expect(game.resources[MVP_IDS.resources.money]).toBe(9);
    expect(game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(0);
    expect(createActiveModifierRegistry(game).registry).toEqual({});
  });

  it("does not spend Money or duplicate modifiers when a one-time upgrade is already owned", () => {
    const game = {
      ...initialState,
      resources: {
        ...initialState.resources,
        [MVP_IDS.resources.money]: 25,
      },
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
      },
    };
    const result = purchaseUpgrade(game, MVP_IDS.upgrades.betterChecklist, 81);

    expect(result.ok).toBe(false);
    expect(result.game).toBe(game);
    expect(result.events).toEqual([]);
    expect(game.resources[MVP_IDS.resources.money]).toBe(25);
    expect(game.upgrades[MVP_IDS.upgrades.betterChecklist]).toBe(1);
    expect(Object.values(createActiveModifierRegistry(game).registry)).toHaveLength(1);
  });

  it("counts purchased MVP upgrades for promotion contribution", () => {
    const game = {
      ...initialState,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1 as const,
        [MVP_IDS.upgrades.coffee]: 1 as const,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1 as const,
      },
    };

    expect(getPurchasedUpgradeCount(game)).toBe(3);
  });
});

describe("promotion and unlock MVP coverage", () => {
  function buildPromotionReadyGame(
    overrides: Partial<
      Pick<GameState, "totalBugsFound" | "totalMoneyEarned" | "upgrades">
    > = {},
  ): GameState {
    return {
      ...initialState,
      totalBugsFound: 100,
      totalMoneyEarned: 150,
      upgrades: {
        ...initialState.upgrades,
        [MVP_IDS.upgrades.betterChecklist]: 1,
        [MVP_IDS.upgrades.coffee]: 1,
        [MVP_IDS.upgrades.keyboardShortcuts]: 1,
      },
      ...overrides,
    };
  }

  const incompleteRequirementCases = [
    {
      name: "lifetime Bugs Found is below the requirement",
      game: buildPromotionReadyGame({ totalBugsFound: 99 }),
      failedRequirementId: "requirement_lifetime_bugs_found_100",
    },
    {
      name: "lifetime Money Earned is below the requirement",
      game: buildPromotionReadyGame({ totalMoneyEarned: 149 }),
      failedRequirementId: "requirement_lifetime_money_earned_150",
    },
    {
      name: "fewer than three MVP upgrades are purchased",
      game: buildPromotionReadyGame({
        upgrades: {
          ...initialState.upgrades,
          [MVP_IDS.upgrades.betterChecklist]: 1,
          [MVP_IDS.upgrades.coffee]: 1,
        },
      }),
      failedRequirementId: "requirement_purchased_upgrades_3",
    },
  ];

  it("keeps promotion unavailable on a new game", () => {
    const game = evaluatePromotionAvailability(initialState);

    expect(game.promotion).toEqual({
      availablePromotionIds: [],
      completedPromotionIds: [],
    });
    expect(getUnlockState(game, MVP_IDS.unlocks.promotionJuniorToMiddle)).toBe("hidden");
    expect(getUiVisibilitySelectors(game).promoteAction).toEqual([]);
  });

  it.each(incompleteRequirementCases)(
    "requires all promotion conditions when $name",
    ({ game, failedRequirementId }) => {
      const promotionDefinition = promotionDefinitions[0];

      if (!promotionDefinition) {
        throw new Error("Expected MVP promotion definition is missing.");
      }

      const evaluatedGame = evaluatePromotionAvailability(game);
      const requirementEvaluation = evaluatePromotionRequirements(
        game,
        promotionDefinition.requirements,
      );

      expect(requirementEvaluation.allRequirementsPassed).toBe(false);
      expect(
        requirementEvaluation.requirements.find(
          (requirement) => requirement.id === failedRequirementId,
        )?.passed,
      ).toBe(false);
      expect(evaluatedGame.promotion.availablePromotionIds).toEqual([]);
      expect(getUnlockState(evaluatedGame, MVP_IDS.unlocks.promotionJuniorToMiddle)).toBe(
        "hidden",
      );
      expect(getUiVisibilitySelectors(evaluatedGame).promoteAction).toEqual([]);
    },
  );

  it("reveals Promote only after every promotion requirement passes", () => {
    const game = evaluatePromotionAvailability(buildPromotionReadyGame());

    expect(game.promotion).toEqual({
      availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      completedPromotionIds: [],
    });
    expect(getUnlockState(game, MVP_IDS.unlocks.promotionJuniorToMiddle)).toBe(
      "available",
    );
    expect(getUiVisibilitySelectors(game).promoteAction).toEqual([
      MVP_IDS.uiSurfaces.promoteAction,
    ]);
  });

  it("keeps promotion availability distinct from completed promotion state", () => {
    const availableGame = evaluatePromotionAvailability(buildPromotionReadyGame());
    const result = acceptPromotion(availableGame, 90);

    expect(availableGame.careerStage).toBe(MVP_IDS.careerStages.juniorQa);
    expect(availableGame.promotion).toEqual({
      availablePromotionIds: [MVP_IDS.promotions.juniorToMiddle],
      completedPromotionIds: [],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Promotion should succeed.");
    }

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.middleQa);
    expect(result.game.promotion).toEqual({
      availablePromotionIds: [],
      completedPromotionIds: [MVP_IDS.promotions.juniorToMiddle],
    });
    expect(result.game.unlocks[MVP_IDS.unlocks.promotionJuniorToMiddle]).toBe("hidden");
    expect(result.game.uiSurfaces[MVP_IDS.uiSurfaces.promoteAction]).toBe("hidden");
  });

  it("does not unlock future systems after confirmed promotion", () => {
    const result = acceptPromotion(
      evaluatePromotionAvailability(buildPromotionReadyGame()),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Promotion should succeed.");
    }

    expect(result.game.careerStage).toBe(MVP_IDS.careerStages.middleQa);
    expect(Object.keys(result.game.resources)).toEqual([
      MVP_IDS.resources.bugsFound,
      MVP_IDS.resources.money,
    ]);
    expect(Object.keys(result.game.uiSurfaces)).toEqual([
      MVP_IDS.uiSurfaces.manualTesting,
      MVP_IDS.uiSurfaces.bugReporting,
      MVP_IDS.uiSurfaces.resourcesBasic,
      MVP_IDS.uiSurfaces.upgradesBasic,
      MVP_IDS.uiSurfaces.promotionProgress,
      MVP_IDS.uiSurfaces.promoteAction,
    ]);
    expect(Object.keys(result.game.unlocks)).toEqual([
      MVP_IDS.unlocks.promotionJuniorToMiddle,
    ]);
    expect(result.game.resources).not.toHaveProperty("reputation");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_team");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_automation");
    expect(result.game.uiSurfaces).not.toHaveProperty("ui_reputation");
  });
});
