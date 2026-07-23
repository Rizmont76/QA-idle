import { createHash } from "node:crypto";
import { Fixed } from "./fixed-point.mjs";
import { JUNIOR_BASELINE_SNAPSHOT } from "./junior-baseline-snapshot.mjs";
import {
  getParameterProfile,
  PARAMETER_VERSION,
  PARAMS,
  SUPPORT_DEFINITIONS,
  SUPPORTS,
} from "./parameters.mjs";

const SIMULATOR_VERSION = "phase-6a.2-simulator-v3";
const OFFLINE_RATIO_TOLERANCE = 0.000001;
const SECOND = 1;
const MAX_SCENARIO_SECONDS = 20000;
let activeParams = PARAMS;
let activeParameterVersion = PARAMETER_VERSION;
let activeProfileId = "historical-doc15-provisional-2026-07-14";
const SCALE = activeParams.PARAM_NUMERIC_SCALE_DECIMAL_PLACES;

export function getBaselineParams() {
  return structuredClone(PARAMS);
}

function withActiveParams(params, parameterVersion, profileId, run) {
  const previousParams = activeParams;
  const previousVersion = activeParameterVersion;
  const previousProfileId = activeProfileId;
  activeParams = Object.freeze({ ...PARAMS, ...params });
  activeParameterVersion = parameterVersion;
  activeProfileId = profileId;
  try {
    return run();
  } finally {
    activeParams = previousParams;
    activeParameterVersion = previousVersion;
    activeProfileId = previousProfileId;
  }
}

function activeSupportDefinitions() {
  return SUPPORT_DEFINITIONS.map((support) => {
    if (support.id === SUPPORTS.training) {
      return {
        ...support,
        unlockLevel: activeParams.PARAM_SUPPORT_TRAINING_UNLOCK_LEVEL,
      };
    }
    if (support.id === SUPPORTS.offline) {
      return {
        ...support,
        unlockLevel: activeParams.PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL,
      };
    }
    return support;
  });
}

function f(value) {
  return Fixed.from(value, SCALE);
}

function hashObject(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function strategicDecisionSignatureForTest({
  viableCategories,
  affordableCategories = [],
  nearAffordableCategories = [],
  strategicOrdering,
  supportsOwned = [],
  milestonesReached = [],
}) {
  return hashObject({
    viable: [...viableCategories].sort(),
    affordable: [...affordableCategories].sort(),
    nearAffordable: [...nearAffordableCategories].sort(),
    strategicOrdering: [...strategicOrdering],
    supportsOwned: [...supportsOwned].sort(),
    milestonesReached: [...milestonesReached].sort(),
  });
}

export function emitStrategicDecisionForTest(seenSignatures, signature) {
  if (seenSignatures.has(signature)) {
    return false;
  }
  seenSignatures.add(signature);
  return true;
}

export function getJuniorBaselineSnapshotHash(snapshot = JUNIOR_BASELINE_SNAPSHOT) {
  return hashObject(snapshot);
}

export function validateJuniorBaselineSnapshot(snapshot = JUNIOR_BASELINE_SNAPSHOT) {
  const missing = [];

  for (const field of [
    "snapshotVersion",
    "sourceCommit",
    "manualBaseBugsPerTest",
    "reportMoneyPerBug",
    "basicUpgrades",
    "reportingConversion",
    "promotion",
    "unlockRequirements",
    "numericAssumptions",
    "sourceFilePaths",
  ]) {
    if (snapshot[field] === undefined || snapshot[field] === null) {
      missing.push(field);
    }
  }

  if (!Array.isArray(snapshot.basicUpgrades) || snapshot.basicUpgrades.length === 0) {
    missing.push("basicUpgrades[]");
  }

  if (
    !Array.isArray(snapshot.promotion?.requirements) ||
    snapshot.promotion.requirements.length === 0
  ) {
    missing.push("promotion.requirements[]");
  }

  if (missing.length > 0) {
    throw new Error(
      `Junior baseline snapshot is missing required fields: ${missing.join(", ")}`,
    );
  }

  return true;
}

function cloneSet(set) {
  return new Set([...set]);
}

function cloneState(state) {
  return {
    ...state,
    bugsFound: f(state.bugsFound),
    money: f(state.money),
    manualUpgradesOwned: new Set([...state.manualUpgradesOwned]),
    assistantSupportsOwned: new Set([...state.assistantSupportsOwned]),
    assistantMilestonesReached: new Set([...state.assistantMilestonesReached]),
    eventLog: state.eventLog.map((event) => ({ ...event })),
    supportPurchaseAnalysis: state.supportPurchaseAnalysis.map((event) => ({
      ...event,
    })),
    unlockEvents: state.unlockEvents.map((event) => ({ ...event })),
    milestoneEvents: state.milestoneEvents.map((event) => ({ ...event })),
    endpointEvents: state.endpointEvents.map((event) => ({ ...event })),
    offlineSessions: state.offlineSessions.map((session) => ({ ...session })),
    meaningfulDecisionEvents: state.meaningfulDecisionEvents.map((event) => ({
      ...event,
    })),
    meaningfulDecisionSignaturesSeen: new Set([
      ...state.meaningfulDecisionSignaturesSeen,
    ]),
    purchaseActionEvents: state.purchaseActionEvents.map((event) => ({ ...event })),
    lastProgressAt: { ...state.lastProgressAt },
  };
}

function createInitialState({ scenarioId, startSnapshotId = "new_run" }) {
  return {
    juniorBaselineVersion: JUNIOR_BASELINE_SNAPSHOT.snapshotVersion,
    juniorBaselineSourceCommit: JUNIOR_BASELINE_SNAPSHOT.sourceCommit,
    juniorBaselineSnapshotHash: getJuniorBaselineSnapshotHash(),
    scenarioStartSnapshotId: startSnapshotId,
    scenarioId,
    simulationTimeSeconds: 0,
    phaseId: "phase_junior_manual",
    careerStage: "junior_qa",
    bugsFound: f(0),
    money: f(0),
    totalBugsFound: f(0),
    totalMoneyEarned: f(0),
    numericScaleDecimalPlaces: SCALE,
    manualUpgradesOwned: new Set(),
    promotionCompleted: false,
    assistantUnlocked: false,
    assistantProductionObserved: false,
    assistantPostMilestoneProductionObserved: false,
    assistantLevel: 0,
    assistantMaxLevel: activeParams.PARAM_ASSISTANT_MAX_LEVEL,
    assistantSupportsOwned: new Set(),
    assistantMilestonesReached: new Set(),
    endpointCompleted: false,
    capstoneReached: false,
    purchaseActionCount: 0,
    meaningfulPurchaseDecisionCount: 0,
    meaningfulDecisionSignatureLast: "",
    meaningfulDecisionSignaturesSeen: new Set(),
    materialStateChangeSinceLastDecision: true,
    unlockEvents: [],
    milestoneEvents: [],
    endpointEvents: [],
    offlineSessions: [],
    eventLog: [],
    meaningfulDecisionEvents: [],
    purchaseActionEvents: [],
    manualActionCount: 0,
    reportActionCount: 0,
    onlineGameplaySeconds: 0,
    preOfflineOnlineSeconds: 0,
    postReturnOnlineSeconds: 0,
    wallClockOfflineElapsedSeconds: 0,
    maxBugsFound: f(0),
    maxMoney: f(0),
    maxAssistantRate: f(0),
    maxLevelCost: f(0),
    moneyFromOfflineReportsAfterReturn: f(0),
    supportPurchaseAnalysis: [],
    lastProgressAt: {
      purchase: 0,
      unlock: 0,
      milestone: 0,
      endpoint: 0,
      decision: 0,
    },
  };
}

function recordEvent(state, category, payload = {}) {
  const event = {
    category,
    timeSeconds: state.simulationTimeSeconds,
    onlineSeconds: state.onlineGameplaySeconds,
    ...payload,
  };
  state.eventLog.push(event);

  if (category === "unlock_event") {
    state.unlockEvents.push(event);
    state.lastProgressAt.unlock = state.simulationTimeSeconds;
  }

  if (category === "milestone_event") {
    state.milestoneEvents.push(event);
    state.lastProgressAt.milestone = state.simulationTimeSeconds;
  }

  if (category === "endpoint_event") {
    state.endpointEvents.push(event);
    state.lastProgressAt.endpoint = state.simulationTimeSeconds;
  }

  return event;
}

function markMaterialChange(state) {
  state.materialStateChangeSinceLastDecision = true;
}

function updateMaxima(state) {
  if (state.bugsFound.gt(state.maxBugsFound)) {
    state.maxBugsFound = state.bugsFound;
  }
  if (state.money.gt(state.maxMoney)) {
    state.maxMoney = state.money;
  }
  const rate = assistantRate(state);
  if (rate.gt(state.maxAssistantRate)) {
    state.maxAssistantRate = rate;
  }
  const cost = assistantNextLevelCost(state);
  if (cost.gt(state.maxLevelCost)) {
    state.maxLevelCost = cost;
  }
}

function manualBugsPerAction(state) {
  const additive = [...state.manualUpgradesOwned].reduce((sum, upgradeId) => {
    const upgrade = JUNIOR_BASELINE_SNAPSHOT.basicUpgrades.find(
      (item) => item.id === upgradeId,
    );
    if (upgrade?.targetStatId === "manual_bugs_per_action") {
      return sum + upgrade.effectValue;
    }
    return sum;
  }, 0);

  return f(JUNIOR_BASELINE_SNAPSHOT.manualBaseBugsPerTest + additive);
}

function moneyPerBug(state) {
  const additive = [...state.manualUpgradesOwned].reduce((sum, upgradeId) => {
    const upgrade = JUNIOR_BASELINE_SNAPSHOT.basicUpgrades.find(
      (item) => item.id === upgradeId,
    );
    if (upgrade?.targetStatId === "money_per_bug_reported") {
      return sum + upgrade.effectValue;
    }
    return sum;
  }, 0);

  return f(JUNIOR_BASELINE_SNAPSHOT.reportMoneyPerBug + additive);
}

function performManualAction(state) {
  const gained = manualBugsPerAction(state);
  state.bugsFound = state.bugsFound.add(gained);
  state.totalBugsFound = state.totalBugsFound.add(gained);
  state.manualActionCount += 1;
  recordEvent(state, "manual_action", { bugsFound: gained.toString() });
  updateMaxima(state);
}

function reportAll(state, { offlineReturnReport = false } = {}) {
  if (state.bugsFound.lte(0)) {
    return false;
  }

  const reportedBugs = state.bugsFound;
  const earnedMoney = reportedBugs.mul(moneyPerBug(state));
  state.bugsFound = f(0);
  state.money = state.money.add(earnedMoney);
  state.totalMoneyEarned = state.totalMoneyEarned.add(earnedMoney);
  state.reportActionCount += 1;
  if (offlineReturnReport) {
    state.moneyFromOfflineReportsAfterReturn =
      state.moneyFromOfflineReportsAfterReturn.add(earnedMoney);
  }
  recordEvent(state, "report_action", {
    reportedBugs: reportedBugs.toString(),
    earnedMoney: earnedMoney.toString(),
  });
  updateMaxima(state);
  return true;
}

function buyBasicUpgrade(state, upgradeId) {
  const upgrade = JUNIOR_BASELINE_SNAPSHOT.basicUpgrades.find(
    (item) => item.id === upgradeId,
  );
  if (
    !upgrade ||
    state.manualUpgradesOwned.has(upgradeId) ||
    state.money.lt(upgrade.cost)
  ) {
    return false;
  }

  state.money = state.money.sub(f(upgrade.cost));
  state.manualUpgradesOwned.add(upgradeId);
  state.purchaseActionCount += 1;
  state.purchaseActionEvents.push(
    recordEvent(state, "purchase_action", {
      action: "buy_basic_upgrade",
      upgradeId,
      cost: String(upgrade.cost),
    }),
  );
  state.lastProgressAt.purchase = state.simulationTimeSeconds;
  markMaterialChange(state);
  updateMaxima(state);
  return true;
}

function promotionRequirementsMet(state) {
  return JUNIOR_BASELINE_SNAPSHOT.promotion.requirements.every((requirement) => {
    if (requirement.source === "current_run_lifetime_bugs_found") {
      return state.totalBugsFound.gte(requirement.amount);
    }
    if (requirement.source === "current_run_lifetime_money_earned") {
      return state.totalMoneyEarned.gte(requirement.amount);
    }
    return state.manualUpgradesOwned.size >= requirement.amount;
  });
}

function buyPromotion(state) {
  if (!promotionRequirementsMet(state)) {
    return false;
  }

  state.promotionCompleted = true;
  state.assistantUnlocked = true;
  state.careerStage = "middle_qa";
  state.phaseId = "phase_middle_assistant_intro";
  recordEvent(state, "purchase_action", { action: "buy_promotion", cost: "0" });
  state.purchaseActionCount += 1;
  recordEvent(state, "unlock_event", { unlockId: "junior_qa_assistant" });
  markMaterialChange(state);
  updateMaxima(state);
  return true;
}

function assistantNextLevelCostFor(level, supportsOwned) {
  if (level >= activeParams.PARAM_ASSISTANT_MAX_LEVEL) {
    return f(activeParams.PARAM_SAFE_MAX_COST_VALUE);
  }

  const nextLevel = level + 1;
  const base =
    activeParams.PARAM_ASSISTANT_LEVEL_BASE_COST *
      activeParams.PARAM_ASSISTANT_LEVEL_COST_GROWTH ** (nextLevel - 1) +
    activeParams.PARAM_ASSISTANT_LEVEL_LINEAR_COST * (nextLevel - 1);
  const discount = supportsOwned.has(SUPPORTS.training)
    ? activeParams.PARAM_SUPPORT_TRAINING_COST_MULTIPLIER
    : 1;

  return Fixed.currency(base * discount, SCALE);
}

export function assistantNextLevelCost(state) {
  return assistantNextLevelCostFor(state.assistantLevel, state.assistantSupportsOwned);
}

export function assistantRate(state) {
  if (!state.assistantUnlocked) {
    return f(0);
  }

  const levelAdditive =
    activeParams.PARAM_ASSISTANT_BASE_BUGS_PER_SECOND +
    state.assistantLevel * activeParams.PARAM_ASSISTANT_BUGS_PER_SECOND_PER_LEVEL;
  const supportAdditive = state.assistantSupportsOwned.has(SUPPORTS.immediate)
    ? activeParams.PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND
    : 0;
  const milestoneMultiplier = state.assistantMilestonesReached.has(
    "milestone_assistant_first",
  )
    ? activeParams.PARAM_FIRST_MILESTONE_PRODUCTION_MULTIPLIER
    : 1;

  return f(levelAdditive + supportAdditive).mul(f(milestoneMultiplier));
}

export function assistantRateForProfile(state, profileId) {
  const profile = getParameterProfile(profileId);
  return withActiveParams(profile.params, profile.version, profile.id, () =>
    assistantRate(state),
  );
}

function crossedMilestones(previousLevel, newLevel) {
  const milestones = [];
  if (
    previousLevel < activeParams.PARAM_FIRST_MILESTONE_LEVEL &&
    newLevel >= activeParams.PARAM_FIRST_MILESTONE_LEVEL
  ) {
    milestones.push({
      id: "milestone_assistant_first",
      level: activeParams.PARAM_FIRST_MILESTONE_LEVEL,
    });
  }
  if (
    previousLevel < activeParams.PARAM_CAPSTONE_MILESTONE_LEVEL &&
    newLevel >= activeParams.PARAM_CAPSTONE_MILESTONE_LEVEL
  ) {
    milestones.push({
      id: "milestone_assistant_capstone",
      level: activeParams.PARAM_CAPSTONE_MILESTONE_LEVEL,
    });
  }
  return milestones;
}

function applyMilestones(state, previousLevel, newLevel) {
  for (const milestone of crossedMilestones(previousLevel, newLevel)) {
    state.assistantMilestonesReached.add(milestone.id);
    if (milestone.id === "milestone_assistant_capstone") {
      state.capstoneReached = true;
    }
    recordEvent(state, "milestone_event", milestone);
    markMaterialChange(state);
  }
}

function buyAssistantLevelOne(state) {
  if (
    !state.assistantUnlocked ||
    state.assistantLevel >= activeParams.PARAM_ASSISTANT_MAX_LEVEL
  ) {
    return false;
  }

  const cost = assistantNextLevelCost(state);
  if (state.money.lt(cost)) {
    return false;
  }

  const previousLevel = state.assistantLevel;
  state.money = state.money.sub(cost);
  state.assistantLevel += 1;
  state.purchaseActionCount += 1;
  state.purchaseActionEvents.push(
    recordEvent(state, "purchase_action", {
      action: "buy_assistant_level_1",
      levelsPurchased: 1,
      previousLevel,
      newLevel: state.assistantLevel,
      cost: cost.toString(),
    }),
  );
  state.lastProgressAt.purchase = state.simulationTimeSeconds;
  applyMilestones(state, previousLevel, state.assistantLevel);
  markMaterialChange(state);
  updateMaxima(state);
  return true;
}

function buyAssistantLevelMax(state) {
  if (!state.assistantUnlocked) {
    return 0;
  }

  let simulatedLevel = state.assistantLevel;
  let simulatedMoney = state.money;
  let levelsToBuy = 0;
  let totalCost = f(0);

  while (simulatedLevel < activeParams.PARAM_ASSISTANT_MAX_LEVEL) {
    const cost = assistantNextLevelCostFor(simulatedLevel, state.assistantSupportsOwned);
    if (simulatedMoney.lt(cost)) {
      break;
    }
    simulatedMoney = simulatedMoney.sub(cost);
    totalCost = totalCost.add(cost);
    simulatedLevel += 1;
    levelsToBuy += 1;
  }

  if (levelsToBuy === 0) {
    return 0;
  }

  const previousLevel = state.assistantLevel;
  state.money = simulatedMoney;
  state.assistantLevel = simulatedLevel;
  state.purchaseActionCount += 1;
  state.purchaseActionEvents.push(
    recordEvent(state, "purchase_action", {
      action: "buy_assistant_level_max",
      levelsPurchased: levelsToBuy,
      previousLevel,
      newLevel: state.assistantLevel,
      cost: totalCost.toString(),
    }),
  );
  state.lastProgressAt.purchase = state.simulationTimeSeconds;
  applyMilestones(state, previousLevel, state.assistantLevel);
  markMaterialChange(state);
  updateMaxima(state);
  return levelsToBuy;
}

function supportPrice(supportId) {
  const support = activeSupportDefinitions().find(
    (definition) => definition.id === supportId,
  );
  return support
    ? f(activeParams[support.priceParam])
    : f(activeParams.PARAM_SAFE_MAX_COST_VALUE);
}

function unlockedSupportIds(state) {
  if (!state.assistantUnlocked) {
    return [];
  }

  return activeSupportDefinitions()
    .filter((support) => state.assistantLevel >= support.unlockLevel)
    .map((support) => support.id);
}

function buySupport(state, supportId) {
  if (
    !unlockedSupportIds(state).includes(supportId) ||
    state.assistantSupportsOwned.has(supportId)
  ) {
    return false;
  }

  const cost = supportPrice(supportId);
  if (state.money.lt(cost)) {
    return false;
  }

  const beforeEndpointEstimate = estimateEndpointSeconds(state, state.scenarioPolicy);
  const payback = supportPaybackSeconds(state, supportId);
  const opportunityCost = assistantNextLevelCost(state).gt(0)
    ? cost.div(assistantNextLevelCost(state)).toString()
    : "0";
  state.money = state.money.sub(cost);
  state.assistantSupportsOwned.add(supportId);
  const afterEndpointEstimate = estimateEndpointSeconds(state, state.scenarioPolicy);
  state.supportPurchaseAnalysis.push({
    supportId,
    timeSeconds: state.simulationTimeSeconds,
    cost: cost.toString(),
    paybackSeconds: Number.isFinite(payback) ? Number(payback.toFixed(3)) : "Infinity",
    opportunityCostAssistantLevels: opportunityCost,
    endpointUtilitySeconds:
      beforeEndpointEstimate === null || afterEndpointEstimate === null
        ? null
        : Number((beforeEndpointEstimate - afterEndpointEstimate).toFixed(3)),
    justifiedByScenarioObjective:
      state.scenarioId.includes("offline") && supportId === SUPPORTS.offline,
  });
  state.purchaseActionCount += 1;
  state.purchaseActionEvents.push(
    recordEvent(state, "purchase_action", {
      action: "buy_support_upgrade",
      supportId,
      cost: cost.toString(),
    }),
  );
  state.lastProgressAt.purchase = state.simulationTimeSeconds;
  markMaterialChange(state);
  updateMaxima(state);
  return true;
}

function advanceOnline(state, seconds) {
  for (let elapsed = 0; elapsed < seconds; elapsed += SECOND) {
    const rate = assistantRate(state);
    state.simulationTimeSeconds += SECOND;
    state.onlineGameplaySeconds += SECOND;
    if (rate.gt(0)) {
      state.bugsFound = state.bugsFound.add(rate);
      if (!state.assistantProductionObserved) {
        state.assistantProductionObserved = true;
        state.phaseId = "phase_middle_growth";
      }
      if (
        state.assistantMilestonesReached.has("milestone_assistant_first") &&
        !state.assistantPostMilestoneProductionObserved
      ) {
        state.assistantPostMilestoneProductionObserved = true;
      }
    }
    updateMaxima(state);
  }
}

function advanceOffline(state, elapsedOfflineSeconds) {
  const eligibleSeconds = Math.min(
    elapsedOfflineSeconds,
    activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS,
  );
  const beforeBugs = state.bugsFound;
  const beforeMoney = state.money;
  const efficiency = state.assistantSupportsOwned.has(SUPPORTS.offline)
    ? activeParams.PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT
    : activeParams.PARAM_OFFLINE_EFFICIENCY_BASE;
  const gained = assistantRate(state).mul(f(eligibleSeconds)).mul(f(efficiency));

  state.simulationTimeSeconds += elapsedOfflineSeconds;
  state.wallClockOfflineElapsedSeconds += elapsedOfflineSeconds;
  if (state.assistantUnlocked) {
    state.bugsFound = state.bugsFound.add(gained);
  }

  const session = {
    elapsedSeconds: elapsedOfflineSeconds,
    eligibleSeconds,
    bugsFoundBefore: beforeBugs.toString(),
    bugsFoundGained: state.assistantUnlocked ? gained.toString() : "0",
    bugsFoundAfter: state.bugsFound.toString(),
    moneyBefore: beforeMoney.toString(),
    moneyAfter: state.money.toString(),
  };
  state.offlineSessions.push(session);
  recordEvent(state, "offline_return", session);
  updateMaxima(state);
}

function checkEndpoint(state) {
  if (
    !state.endpointCompleted &&
    state.promotionCompleted &&
    state.assistantUnlocked &&
    state.assistantProductionObserved &&
    state.assistantLevel >= activeParams.PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET &&
    state.assistantMilestonesReached.has("milestone_assistant_first") &&
    state.assistantPostMilestoneProductionObserved
  ) {
    state.endpointCompleted = true;
    state.phaseId = "phase_post_endpoint_sanity";
    recordEvent(state, "endpoint_event", {
      endpoint: "playable_idle_mvp",
      assistantLevel: state.assistantLevel,
    });
    markMaterialChange(state);
  }
}

function availablePurchaseOptions(state) {
  const options = [];
  if (
    state.assistantUnlocked &&
    state.assistantLevel < activeParams.PARAM_ASSISTANT_MAX_LEVEL
  ) {
    options.push({
      category: "assistant_level",
      cost: assistantNextLevelCost(state),
    });
  }
  for (const supportId of unlockedSupportIds(state)) {
    if (!state.assistantSupportsOwned.has(supportId)) {
      options.push({
        category: supportId,
        cost: supportPrice(supportId),
      });
    }
  }
  return options;
}

export function moneyAcquisitionRatePerSecond(state, policy) {
  const manualInterval =
    policy?.manualInterval ??
    activeParams.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS;
  const manualBugsPerSecond =
    manualInterval > 0 ? manualBugsPerAction(state).toNumber() / manualInterval : 0;
  const passiveBugsPerSecond = assistantRate(state).toNumber();

  return (passiveBugsPerSecond + manualBugsPerSecond) * moneyPerBug(state).toNumber();
}

function optionStrategicRank(state, option) {
  if (option.category === "assistant_level") {
    return 1;
  }
  if (option.category === SUPPORTS.immediate) {
    return 2;
  }
  if (option.category === SUPPORTS.training) {
    return state.assistantLevel <= 12 ? 3 : 5;
  }
  if (option.category === SUPPORTS.offline) {
    return state.scenarioId.includes("offline") ? 0 : 6;
  }
  return 9;
}

function evaluateMeaningfulDecision(state, policy = state.scenarioPolicy) {
  if (!state.materialStateChangeSinceLastDecision) {
    return;
  }

  const options = availablePurchaseOptions(state);
  if (options.length < 2) {
    return;
  }

  const moneyRate = moneyAcquisitionRatePerSecond(state, policy);
  const viable = options.filter((option) => {
    if (state.money.gte(option.cost)) {
      return true;
    }
    const needed = option.cost.sub(state.money).toNumber();
    return (
      moneyRate > 0 &&
      needed / moneyRate <= activeParams.PARAM_DECISION_NEAR_AFFORD_SECONDS
    );
  });

  const affordableCategories = viable
    .filter((option) => state.money.gte(option.cost))
    .map((option) => option.category)
    .sort();
  const nearAffordableCategories = viable
    .filter((option) => state.money.lt(option.cost))
    .map((option) => option.category)
    .sort();
  const viableCategories = new Set(viable.map((option) => option.category));
  if (viableCategories.size < 2) {
    return;
  }

  const orderedCategories = viable
    .map((option) => ({
      category: option.category,
      rank: optionStrategicRank(state, option),
      cost: option.cost.toNumber(),
    }))
    .sort((left, right) => left.rank - right.rank || left.cost - right.cost)
    .map((option) => option.category);
  const signature = strategicDecisionSignatureForTest({
    viableCategories: [...viableCategories],
    affordableCategories,
    nearAffordableCategories,
    strategicOrdering: orderedCategories,
    supportsOwned: [...state.assistantSupportsOwned].sort(),
    milestonesReached: [...state.assistantMilestonesReached].sort(),
  });

  if (state.meaningfulDecisionSignaturesSeen.has(signature)) {
    return;
  }

  state.meaningfulDecisionSignatureLast = signature;
  state.meaningfulDecisionSignaturesSeen.add(signature);
  state.meaningfulPurchaseDecisionCount += 1;
  state.materialStateChangeSinceLastDecision = false;
  const event = recordEvent(state, "meaningful_purchase_decision", {
    visibleViablePurchaseCategories: [...viableCategories].sort(),
    affordablePurchaseCategories: affordableCategories,
    nearAffordablePurchaseCategories: nearAffordableCategories,
    moneyRatePerSecond: Number(moneyRate.toFixed(6)),
    signature,
  });
  state.meaningfulDecisionEvents.push(event);
  state.lastProgressAt.decision = state.simulationTimeSeconds;
}

function runJuniorBaseline({
  manualInterval = activeParams.PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS,
  reportInterval = activeParams.PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS,
} = {}) {
  validateJuniorBaselineSnapshot();
  const state = createInitialState({ scenarioId: "scenario_junior_baseline" });
  state.scenarioPolicy = {
    manualInterval,
    reportInterval,
    cadenceProfile: "junior_baseline",
  };
  let nextManual = 0;
  let nextReport = reportInterval;

  while (
    !state.promotionCompleted &&
    state.simulationTimeSeconds < MAX_SCENARIO_SECONDS
  ) {
    state.simulationTimeSeconds += SECOND;
    state.onlineGameplaySeconds += SECOND;
    if (state.simulationTimeSeconds >= nextManual) {
      performManualAction(state);
      nextManual += manualInterval;
    }
    if (state.simulationTimeSeconds >= nextReport) {
      reportAll(state);
      nextReport += reportInterval;
    }
    for (const upgrade of JUNIOR_BASELINE_SNAPSHOT.basicUpgrades) {
      if (buyBasicUpgrade(state, upgrade.id)) {
        break;
      }
    }
    if (promotionRequirementsMet(state)) {
      buyPromotion(state);
    }
  }

  if (!state.promotionCompleted) {
    throw new Error(
      "Junior baseline failed to reach promotion within safe simulation time",
    );
  }

  return state;
}

function supportPaybackSeconds(state, supportId) {
  const price = supportPrice(supportId).toNumber();
  if (supportId === SUPPORTS.immediate) {
    return price / activeParams.PARAM_SUPPORT_IMMEDIATE_ADD_BUGS_PER_SECOND;
  }
  if (supportId === SUPPORTS.training) {
    const nextCosts = [0, 1, 2, 3, 4].map(
      (offset) =>
        assistantNextLevelCostFor(state.assistantLevel + offset, new Set()).toNumber() -
        assistantNextLevelCostFor(
          state.assistantLevel + offset,
          new Set([SUPPORTS.training]),
        ).toNumber(),
    );
    const savings = nextCosts.reduce((sum, value) => sum + Math.max(value, 0), 0);
    return savings > 0 ? (price / savings) * 180 : Number.POSITIVE_INFINITY;
  }
  return 1800;
}

function estimateSupportEndpointUtilitySeconds(state, supportId) {
  const beforeEndpointEstimate = estimateEndpointSeconds(state, state.scenarioPolicy);
  if (beforeEndpointEstimate === null) {
    return null;
  }
  const cost = supportPrice(supportId);
  if (state.money.lt(cost)) {
    return null;
  }
  const projected = cloneState(state);
  projected.money = projected.money.sub(cost);
  projected.assistantSupportsOwned.add(supportId);
  const afterEndpointEstimate = estimateEndpointSeconds(
    projected,
    projected.scenarioPolicy,
  );
  if (afterEndpointEstimate === null) {
    return null;
  }
  return Number((beforeEndpointEstimate - afterEndpointEstimate).toFixed(3));
}

function estimateEndpointSeconds(state, policy = state.scenarioPolicy) {
  if (!state.assistantUnlocked) {
    return null;
  }
  if (state.assistantLevel >= activeParams.PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET) {
    return 0;
  }

  let level = state.assistantLevel;
  let money = state.money;
  let seconds = 0;
  const supportsOwned = cloneSet(state.assistantSupportsOwned);
  const moneyRate = moneyAcquisitionRatePerSecond(state, policy);

  if (moneyRate <= 0) {
    return null;
  }

  while (level < activeParams.PARAM_ENDPOINT_ASSISTANT_LEVEL_TARGET) {
    const cost = assistantNextLevelCostFor(level, supportsOwned);
    if (money.lt(cost)) {
      const waitSeconds = (cost.toNumber() - money.toNumber()) / moneyRate;
      seconds += Math.max(0, waitSeconds);
      money = cost;
    }
    money = money.sub(cost);
    level += 1;
  }

  return seconds;
}

function choosePurchase(state, strategyId) {
  evaluateMeaningfulDecision(state, state.scenarioPolicy);

  if (strategyId === "buy_max_heavy") {
    const preview = previewBuyMaxLevels(state);
    if (preview >= 2) {
      return buyAssistantLevelMax(state);
    }
  }

  if (strategyId === "support_first") {
    for (const support of unlockedSupportIds(state)) {
      if (buySupport(state, support)) {
        return true;
      }
    }
    return buyAssistantLevelOne(state);
  }

  if (strategyId === "mixed") {
    const candidates = unlockedSupportIds(state).filter(
      (supportId) => !state.assistantSupportsOwned.has(supportId),
    );
    for (const supportId of candidates) {
      const payback = supportPaybackSeconds(state, supportId);
      const isStrategic =
        supportId === SUPPORTS.immediate ||
        (supportId === SUPPORTS.training && state.assistantLevel >= 3) ||
        (supportId === SUPPORTS.offline && state.scenarioId.includes("offline"));
      const endpointUtility = estimateSupportEndpointUtilitySeconds(state, supportId);
      const hasRationalEndpointUtility = endpointUtility !== null && endpointUtility >= 0;
      const hasScenarioObjective =
        supportId === SUPPORTS.offline && state.scenarioId.includes("offline");
      if (
        isStrategic &&
        payback <= 1200 &&
        (hasRationalEndpointUtility || hasScenarioObjective) &&
        buySupport(state, supportId)
      ) {
        return true;
      }
    }
    return buyAssistantLevelOne(state);
  }

  return buyAssistantLevelOne(state);
}

function previewBuyMaxLevels(state) {
  let simulatedLevel = state.assistantLevel;
  let simulatedMoney = state.money;
  let levelsToBuy = 0;

  while (simulatedLevel < activeParams.PARAM_ASSISTANT_MAX_LEVEL) {
    const cost = assistantNextLevelCostFor(simulatedLevel, state.assistantSupportsOwned);
    if (simulatedMoney.lt(cost)) {
      break;
    }
    simulatedMoney = simulatedMoney.sub(cost);
    simulatedLevel += 1;
    levelsToBuy += 1;
  }
  return levelsToBuy;
}

function runMiddleScenario({
  scenarioId,
  strategyId,
  postPromotionState,
  manualInterval = activeParams.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS,
  reportInterval = activeParams.PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS,
  cadenceProfile = "middle_baseline",
  useBuyMax = false,
  offlineMode = "none",
  stopAtCapstone = false,
}) {
  const state = cloneState(postPromotionState);
  state.scenarioId = scenarioId;
  state.scenarioStartSnapshotId =
    "post-promotion-" + postPromotionState.juniorBaselineSnapshotHash.slice(0, 12);
  state.eventLog = [];
  state.unlockEvents = [];
  state.milestoneEvents = [];
  state.endpointEvents = [];
  state.offlineSessions = [];
  state.meaningfulDecisionEvents = [];
  state.purchaseActionEvents = [];
  state.purchaseActionCount = 0;
  state.onlineGameplaySeconds = 0;
  state.preOfflineOnlineSeconds = 0;
  state.postReturnOnlineSeconds = 0;
  state.wallClockOfflineElapsedSeconds = 0;
  state.supportPurchaseAnalysis = [];
  state.meaningfulPurchaseDecisionCount = 0;
  state.meaningfulDecisionSignatureLast = "";
  state.meaningfulDecisionSignaturesSeen = new Set();
  state.materialStateChangeSinceLastDecision = true;
  state.lastProgressAt = {
    purchase: state.simulationTimeSeconds,
    unlock: state.simulationTimeSeconds,
    milestone: state.simulationTimeSeconds,
    endpoint: state.simulationTimeSeconds,
    decision: state.simulationTimeSeconds,
  };
  state.assistantProductionObserved = false;
  state.assistantPostMilestoneProductionObserved = false;
  state.endpointCompleted = false;
  state.capstoneReached = false;
  state.scenarioPolicy = {
    manualInterval,
    reportInterval,
    cadenceProfile,
  };
  let nextManual = state.simulationTimeSeconds + manualInterval;
  let nextReport = state.simulationTimeSeconds + reportInterval;

  if (offlineMode === "unsupported") {
    state.preOfflineOnlineSeconds = state.onlineGameplaySeconds;
    advanceOffline(state, activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS + 1800);
    reportAll(state, { offlineReturnReport: true });
  }

  while (
    state.simulationTimeSeconds - postPromotionState.simulationTimeSeconds <
      MAX_SCENARIO_SECONDS &&
    (!state.endpointCompleted || stopAtCapstone)
  ) {
    advanceOnline(state, SECOND);
    if (state.simulationTimeSeconds >= nextManual) {
      performManualAction(state);
      nextManual += manualInterval;
    }
    if (state.simulationTimeSeconds >= nextReport) {
      reportAll(state);
      nextReport += reportInterval;
    }

    if (useBuyMax) {
      if (previewBuyMaxLevels(state) > 0) {
        buyAssistantLevelMax(state);
      }
    } else {
      choosePurchase(state, strategyId);
    }
    checkEndpoint(state);

    if (
      offlineMode === "supported" &&
      state.wallClockOfflineElapsedSeconds === 0 &&
      state.assistantLevel >= activeParams.PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL &&
      state.assistantSupportsOwned.has(SUPPORTS.offline)
    ) {
      state.preOfflineOnlineSeconds = state.onlineGameplaySeconds;
      advanceOffline(state, activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS + 1800);
      reportAll(state, { offlineReturnReport: true });
      nextManual = state.simulationTimeSeconds + manualInterval;
      nextReport = state.simulationTimeSeconds + reportInterval;
    }

    if (stopAtCapstone && state.capstoneReached) {
      break;
    }
  }

  state.postReturnOnlineSeconds = Math.max(
    0,
    state.onlineGameplaySeconds - state.preOfflineOnlineSeconds,
  );

  return state;
}

function runControlledBuyMaxMilestoneScenario(postPromotionState) {
  const state = cloneState(postPromotionState);
  state.scenarioId = "scenario_buy_max_milestone_crossing";
  state.scenarioStartSnapshotId =
    "controlled-buy-max-" + postPromotionState.juniorBaselineSnapshotHash.slice(0, 12);
  state.eventLog = [];
  state.unlockEvents = [];
  state.milestoneEvents = [];
  state.endpointEvents = [];
  state.offlineSessions = [];
  state.meaningfulDecisionEvents = [];
  state.purchaseActionEvents = [];
  state.supportPurchaseAnalysis = [];
  state.purchaseActionCount = 0;
  state.meaningfulPurchaseDecisionCount = 0;
  state.meaningfulDecisionSignatureLast = "";
  state.meaningfulDecisionSignaturesSeen = new Set();
  state.onlineGameplaySeconds = 0;
  state.preOfflineOnlineSeconds = 0;
  state.postReturnOnlineSeconds = 0;
  state.wallClockOfflineElapsedSeconds = 0;
  state.materialStateChangeSinceLastDecision = true;
  state.lastProgressAt = {
    purchase: state.simulationTimeSeconds,
    unlock: state.simulationTimeSeconds,
    milestone: state.simulationTimeSeconds,
    endpoint: state.simulationTimeSeconds,
    decision: state.simulationTimeSeconds,
  };
  state.assistantLevel = activeParams.PARAM_FIRST_MILESTONE_LEVEL - 2;
  state.assistantMilestonesReached = new Set();
  state.assistantProductionObserved = true;
  state.assistantPostMilestoneProductionObserved = false;
  state.endpointCompleted = false;
  state.capstoneReached = false;
  state.scenarioPolicy = {
    manualInterval: activeParams.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS,
    reportInterval: activeParams.PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS,
    cadenceProfile: "controlled_buy_max",
  };

  const controlledMoney = assistantNextLevelCostFor(
    state.assistantLevel,
    state.assistantSupportsOwned,
  )
    .add(
      assistantNextLevelCostFor(state.assistantLevel + 1, state.assistantSupportsOwned),
    )
    .add(f(1));
  state.money = controlledMoney;
  buyAssistantLevelMax(state);
  advanceOnline(state, SECOND);
  checkEndpoint(state);
  state.postReturnOnlineSeconds = state.onlineGameplaySeconds;

  return state;
}

function createControlledOfflineReferenceState(postPromotionState) {
  const state = cloneState(postPromotionState);
  state.scenarioId = "controlled_offline_handover_reference";
  state.scenarioStartSnapshotId =
    "controlled-offline-" + postPromotionState.juniorBaselineSnapshotHash.slice(0, 12);
  state.eventLog = [];
  state.unlockEvents = [];
  state.milestoneEvents = [];
  state.endpointEvents = [];
  state.offlineSessions = [];
  state.meaningfulDecisionEvents = [];
  state.purchaseActionEvents = [];
  state.supportPurchaseAnalysis = [];
  state.meaningfulDecisionSignaturesSeen = new Set();
  state.purchaseActionCount = 0;
  state.meaningfulPurchaseDecisionCount = 0;
  state.meaningfulDecisionSignatureLast = "";
  state.onlineGameplaySeconds = 0;
  state.preOfflineOnlineSeconds = 0;
  state.postReturnOnlineSeconds = 0;
  state.wallClockOfflineElapsedSeconds = 0;
  state.materialStateChangeSinceLastDecision = true;
  state.lastProgressAt = {
    purchase: state.simulationTimeSeconds,
    unlock: state.simulationTimeSeconds,
    milestone: state.simulationTimeSeconds,
    endpoint: state.simulationTimeSeconds,
    decision: state.simulationTimeSeconds,
  };
  state.assistantLevel = activeParams.PARAM_SUPPORT_OFFLINE_UNLOCK_LEVEL;
  state.assistantSupportsOwned = new Set([SUPPORTS.immediate, SUPPORTS.training]);
  state.assistantMilestonesReached = new Set();
  state.assistantProductionObserved = true;
  state.assistantPostMilestoneProductionObserved = false;
  state.endpointCompleted = false;
  state.capstoneReached = false;
  state.money = supportPrice(SUPPORTS.offline).add(f(100));
  state.bugsFound = f(0);
  state.totalBugsFound = f(1000);
  state.totalMoneyEarned = f(1000);
  state.scenarioPolicy = {
    manualInterval: activeParams.PARAM_BASELINE_MIDDLE_MANUAL_ACTION_INTERVAL_SECONDS,
    reportInterval: activeParams.PARAM_BASELINE_MIDDLE_REPORT_INTERVAL_SECONDS,
    cadenceProfile: "controlled_offline_handover",
  };

  return state;
}

function runControlledOfflineSupportComparison(postPromotionState) {
  const reference = createControlledOfflineReferenceState(postPromotionState);
  const baseOnlineRate = assistantRate(reference);
  const withoutHandover = cloneState(reference);
  withoutHandover.scenarioId = "controlled_offline_without_handover";
  advanceOffline(withoutHandover, activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS);

  const withHandover = cloneState(reference);
  withHandover.scenarioId = "controlled_offline_with_handover";
  const purchaseSucceeded = buySupport(withHandover, SUPPORTS.offline);
  advanceOffline(withHandover, activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS);

  const withoutGain = Number(withoutHandover.offlineSessions[0]?.bugsFoundGained ?? 0);
  const withGain = Number(withHandover.offlineSessions[0]?.bugsFoundGained ?? 0);
  const normalizedImprovementRatio = withoutGain === 0 ? null : withGain / withoutGain;
  const expectedRatio =
    activeParams.PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT /
    activeParams.PARAM_OFFLINE_EFFICIENCY_BASE;
  const ratioDelta =
    normalizedImprovementRatio === null
      ? Number.POSITIVE_INFINITY
      : Math.abs(normalizedImprovementRatio - expectedRatio);

  return {
    comparison_id: "controlled_offline_handover_isolated",
    reference_assistant_level: reference.assistantLevel,
    reference_money: reference.money.toString(),
    reference_bugs_found: reference.bugsFound.toString(),
    reference_total_bugs_found: reference.totalBugsFound.toString(),
    reference_total_money_earned: reference.totalMoneyEarned.toString(),
    reference_supports_before_fork: [...reference.assistantSupportsOwned].sort(),
    base_online_production_rate: baseOnlineRate.toString(),
    purchase_succeeded: purchaseSucceeded,
    without_handover: {
      offline_efficiency: activeParams.PARAM_OFFLINE_EFFICIENCY_BASE,
      eligible_seconds: withoutHandover.offlineSessions[0]?.eligibleSeconds ?? 0,
      bugs_found_gained: withoutGain,
      assistant_level: withoutHandover.assistantLevel,
      supports_owned: [...withoutHandover.assistantSupportsOwned].sort(),
    },
    with_handover: {
      offline_efficiency: activeParams.PARAM_OFFLINE_EFFICIENCY_WITH_SUPPORT,
      eligible_seconds: withHandover.offlineSessions[0]?.eligibleSeconds ?? 0,
      bugs_found_gained: withGain,
      assistant_level: withHandover.assistantLevel,
      supports_owned: [...withHandover.assistantSupportsOwned].sort(),
    },
    normalized_improvement_ratio: normalizedImprovementRatio,
    expected_ratio_from_efficiency_values: expectedRatio,
    tolerance: OFFLINE_RATIO_TOLERANCE,
    pass:
      purchaseSucceeded &&
      reference.assistantLevel === withoutHandover.assistantLevel &&
      withoutHandover.assistantLevel === withHandover.assistantLevel &&
      ratioDelta <= OFFLINE_RATIO_TOLERANCE,
  };
}

function stallWindows(state, juniorPhaseSeconds = 0) {
  const endpointOnlineSeconds =
    state.endpointEvents[0]?.onlineSeconds ?? state.onlineGameplaySeconds;
  const progressEvents = state.eventLog.filter(
    (event) =>
      [
        "purchase_action",
        "unlock_event",
        "milestone_event",
        "endpoint_event",
        "meaningful_purchase_decision",
      ].includes(event.category) &&
      (event.onlineSeconds ?? event.timeSeconds) <= endpointOnlineSeconds,
  );
  let last = 0;
  let max = 0;
  for (const event of progressEvents) {
    const eventOnlineSeconds = event.onlineSeconds ?? event.timeSeconds;
    max = Math.max(max, eventOnlineSeconds - last);
    last = eventOnlineSeconds;
  }
  max = Math.max(max, endpointOnlineSeconds - last);
  const postEndpointProgressEvents = state.eventLog.filter((event) => {
    const eventOnlineSeconds = event.onlineSeconds ?? event.timeSeconds;

    return (
      eventOnlineSeconds > endpointOnlineSeconds &&
      [
        "purchase_action",
        "unlock_event",
        "milestone_event",
        "meaningful_purchase_decision",
      ].includes(event.category)
    );
  });
  let capstoneLast = endpointOnlineSeconds;
  let capstoneMax = 0;
  for (const event of postEndpointProgressEvents) {
    const eventOnlineSeconds = event.onlineSeconds ?? event.timeSeconds;
    capstoneMax = Math.max(capstoneMax, eventOnlineSeconds - capstoneLast);
    capstoneLast = eventOnlineSeconds;
  }
  capstoneMax = Math.max(capstoneMax, state.onlineGameplaySeconds - capstoneLast);

  return {
    maxSeconds: max,
    endpointMaxSeconds: max,
    capstonePostEndpointMaxSeconds: state.capstoneReached ? capstoneMax : 0,
    phaseSeconds:
      state.scenarioId === "scenario_junior_baseline"
        ? juniorPhaseSeconds
        : state.onlineGameplaySeconds,
  };
}

function summarizeScenario(state, strategyId, juniorPhaseSeconds = 0) {
  const middlePhaseSeconds = state.promotionCompleted
    ? state.scenarioId === "scenario_junior_baseline"
      ? 0
      : state.onlineGameplaySeconds
    : 0;
  const endpointEvent = state.endpointEvents[0];
  const capstoneEvent = state.milestoneEvents.find(
    (event) => event.id === "milestone_assistant_capstone",
  );
  return {
    scenario_id: state.scenarioId,
    strategy_id: strategyId,
    parameter_version: activeParameterVersion,
    junior_baseline_version: state.juniorBaselineVersion,
    junior_baseline_source_commit: state.juniorBaselineSourceCommit,
    junior_baseline_snapshot_hash: state.juniorBaselineSnapshotHash,
    scenario_start_snapshot_id: state.scenarioStartSnapshotId,
    endpoint_completed: state.endpointCompleted,
    endpoint_time_seconds: endpointEvent ? endpointEvent.timeSeconds : null,
    junior_phase_seconds: juniorPhaseSeconds,
    middle_phase_seconds: middlePhaseSeconds,
    total_online_gameplay_seconds:
      state.scenarioId === "scenario_junior_baseline"
        ? state.onlineGameplaySeconds
        : juniorPhaseSeconds + state.onlineGameplaySeconds,
    total_wall_clock_elapsed_seconds: state.simulationTimeSeconds,
    pre_offline_online_seconds: state.preOfflineOnlineSeconds,
    wall_clock_offline_elapsed_seconds: state.wallClockOfflineElapsedSeconds,
    post_return_online_seconds: state.postReturnOnlineSeconds,
    capstone_reached: state.capstoneReached,
    capstone_time_seconds: capstoneEvent ? capstoneEvent.timeSeconds : null,
    purchase_action_count: state.purchaseActionCount,
    meaningful_purchase_decision_count: state.meaningfulPurchaseDecisionCount,
    meaningful_purchase_decision_events: state.meaningfulDecisionEvents,
    purchase_action_events: state.purchaseActionEvents,
    manual_action_count: state.manualActionCount,
    report_action_count: state.reportActionCount,
    assistant_final_level: state.assistantLevel,
    supports_owned: [...state.assistantSupportsOwned].sort(),
    milestones_reached: [...state.assistantMilestonesReached].sort(),
    offline_sessions_count: state.offlineSessions.length,
    offline_elapsed_seconds_total: state.offlineSessions.reduce(
      (sum, session) => sum + session.elapsedSeconds,
      0,
    ),
    offline_eligible_seconds_total: state.offlineSessions.reduce(
      (sum, session) => sum + session.eligibleSeconds,
      0,
    ),
    offline_bugs_found_total: state.offlineSessions.reduce(
      (sum, session) => sum + Number(session.bugsFoundGained),
      0,
    ),
    money_from_offline_reports_after_return:
      state.moneyFromOfflineReportsAfterReturn.toString(),
    max_bugs_found: state.maxBugsFound.toString(),
    max_money: state.maxMoney.toString(),
    final_bugs_found_exact: state.bugsFound.toString(),
    final_money_exact: state.money.toString(),
    numeric_scale_decimal_places: state.numericScaleDecimalPlaces,
    max_assistant_rate: state.maxAssistantRate.toString(),
    max_level_cost: state.maxLevelCost.toString(),
    support_purchase_analysis: state.supportPurchaseAnalysis,
    stall_windows: stallWindows(state, juniorPhaseSeconds),
    gate_results: [],
    event_log_digest: hashObject(state.eventLog),
    event_log: state.eventLog,
  };
}

function gate(
  gateId,
  scenario,
  target,
  actual,
  pass,
  severity,
  permittedParameterGroup,
  diagnostic,
) {
  return {
    gate_id: gateId,
    scenario,
    target,
    actual,
    pass,
    severity,
    permitted_parameter_group: permittedParameterGroup,
    diagnostic,
  };
}

function evaluateGates(scenarios, controlledOfflineComparison) {
  const byId = new Map(scenarios.map((scenario) => [scenario.scenario_id, scenario]));
  const junior = byId.get("scenario_junior_baseline");
  const mixed = byId.get("scenario_mixed");
  const active = byId.get("scenario_active_click_middle");
  const lowClick = byId.get("scenario_low_click_middle");
  const offlineUnsupported = byId.get("scenario_offline_return_without_support");
  const offlineSupported = byId.get("scenario_offline_return_with_support");
  const noSupport = byId.get("scenario_no_support_completion");
  const buyMax = byId.get("scenario_buy_max_milestone_crossing");
  const capstone = byId.get("scenario_capstone_reachability_sanity");
  const supportFirst = byId.get("scenario_support_first");
  const levelFirst = byId.get("scenario_level_first");
  const skipSupports = byId.get("scenario_skip_supports");
  const ordinaryEndpointScenarios = [
    levelFirst,
    supportFirst,
    mixed,
    skipSupports,
    lowClick,
    active,
    noSupport,
  ];
  const results = [];

  results.push(
    gate(
      "gate_junior_baseline_inputs",
      "scenario_junior_baseline",
      "complete versioned Junior snapshot",
      JUNIOR_BASELINE_SNAPSHOT.snapshotVersion,
      validateJuniorBaselineSnapshot(),
      "Blocker",
      "group_junior_baseline_inputs",
      "Snapshot records source commit, Basic Upgrades, reporting, promotion, unlocks and numeric assumptions.",
    ),
  );
  results.push(
    gate(
      "gate_junior_duration",
      "scenario_junior_baseline",
      "480-720 seconds",
      junior.junior_phase_seconds,
      junior.junior_phase_seconds >= activeParams.PARAM_JUNIOR_DURATION_MIN_SECONDS &&
        junior.junior_phase_seconds <= activeParams.PARAM_JUNIOR_DURATION_MAX_SECONDS,
      "Major",
      "group_manual",
      "Junior baseline uses explicit simulator cadence parameters against current slice data.",
    ),
  );
  results.push(
    gate(
      "gate_junior_baseline_cadence_validity",
      "scenario_junior_baseline",
      "explicit positive Junior baseline manual/report cadence",
      `manual ${activeParams.PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS}s, report ${activeParams.PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS}s`,
      activeParams.PARAM_JUNIOR_BASELINE_MANUAL_ACTION_INTERVAL_SECONDS > 0 &&
        activeParams.PARAM_JUNIOR_BASELINE_REPORT_INTERVAL_SECONDS > 0,
      "Blocker",
      "group_manual_cadence",
      "Junior baseline cadence is parameterized rather than hard-coded.",
    ),
  );
  results.push(
    gate(
      "gate_middle_duration",
      "scenario_mixed",
      "900-1500 seconds after promotion",
      mixed.middle_phase_seconds,
      mixed.middle_phase_seconds >= activeParams.PARAM_MIDDLE_DURATION_MIN_SECONDS &&
        mixed.middle_phase_seconds <= activeParams.PARAM_MIDDLE_DURATION_MAX_SECONDS,
      "Blocker",
      "group_assistant_cost",
      "Mixed strategy Middle endpoint time from shared post-promotion snapshot.",
    ),
  );
  results.push(
    gate(
      "gate_total_duration",
      "scenario_junior_baseline + scenario_mixed",
      "1500-2400 seconds",
      junior.junior_phase_seconds + mixed.middle_phase_seconds,
      junior.junior_phase_seconds + mixed.middle_phase_seconds >=
        activeParams.PARAM_TOTAL_DURATION_MIN_SECONDS &&
        junior.junior_phase_seconds + mixed.middle_phase_seconds <=
          activeParams.PARAM_TOTAL_DURATION_MAX_SECONDS,
      "Blocker",
      "group_cost",
      "Combined accepted Junior baseline and mixed Middle endpoint time.",
    ),
  );
  results.push(
    gate(
      "gate_purchase_actions",
      "scenario_mixed",
      "10-16 purchase actions",
      mixed.purchase_action_count + junior.purchase_action_count,
      mixed.purchase_action_count + junior.purchase_action_count >=
        activeParams.PARAM_PURCHASE_ACTIONS_MIN &&
        mixed.purchase_action_count + junior.purchase_action_count <=
          activeParams.PARAM_PURCHASE_ACTIONS_MAX,
      "Major",
      "group_cost",
      "Counts Junior upgrades/promotion plus Middle purchases.",
    ),
  );
  results.push(
    gate(
      "gate_meaningful_decisions",
      "scenario_mixed",
      "3-5 decisions, deduped",
      mixed.meaningful_purchase_decision_count,
      mixed.meaningful_purchase_decision_count >=
        activeParams.PARAM_MEANINGFUL_DECISIONS_MIN &&
        mixed.meaningful_purchase_decision_count <=
          activeParams.PARAM_MEANINGFUL_DECISIONS_MAX,
      "Major",
      "group_decisions",
      "Meaningful decisions are signature-deduped after material state changes.",
    ),
  );
  results.push(
    gate(
      "gate_low_click_middle_completion",
      "scenario_low_click_middle",
      "<= 1500 seconds after promotion",
      lowClick.middle_phase_seconds,
      lowClick.endpoint_completed &&
        lowClick.middle_phase_seconds <= activeParams.PARAM_LOW_CLICK_MIDDLE_MAX_SECONDS,
      "Blocker",
      "group_passive_baseline",
      "Low-click scenario must complete from the common post-promotion snapshot.",
    ),
  );
  const ratio = active.middle_phase_seconds / mixed.middle_phase_seconds;
  results.push(
    gate(
      "gate_active_not_trivial",
      "scenario_active_click_middle",
      "active/mixed ratio 0.70-0.90",
      Number(ratio.toFixed(3)),
      ratio >= 0.7 && ratio <= 0.9,
      "Major",
      "group_manual_cadence",
      "Active play should accelerate without trivializing the endpoint.",
    ),
  );
  const offlineMoneyChanged = [offlineUnsupported, offlineSupported].some((scenario) =>
    scenario.event_log.some(
      (event) =>
        event.category === "offline_return" && event.moneyBefore !== event.moneyAfter,
    ),
  );
  results.push(
    gate(
      "gate_offline_bugs_only",
      "offline scenarios",
      "offline produces Bugs Found only",
      offlineMoneyChanged
        ? "money changed during offline"
        : "money unchanged during offline",
      !offlineMoneyChanged,
      "Blocker",
      "group_offline",
      "Offline session records no Money gain until explicit Report.",
    ),
  );
  results.push(
    gate(
      "gate_offline_cap",
      "offline scenarios",
      `<= ${activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS} eligible seconds`,
      Math.max(
        offlineUnsupported.offline_eligible_seconds_total,
        offlineSupported.offline_eligible_seconds_total,
      ),
      Math.max(
        offlineUnsupported.offline_eligible_seconds_total,
        offlineSupported.offline_eligible_seconds_total,
      ) <= activeParams.PARAM_OFFLINE_TIME_CAP_SECONDS,
      "Blocker",
      "group_offline",
      "Offline elapsed time is capped before production is calculated.",
    ),
  );
  results.push(
    gate(
      "gate_decimal_preservation",
      "all",
      "fixed-point decimals preserved through Report",
      `${SCALE} decimal places`,
      scenarios.every((scenario) => scenario.numeric_scale_decimal_places === SCALE),
      "Blocker",
      "group_precision",
      "Authoritative state stores fixed-point values; Report sets Bugs Found exactly to zero.",
    ),
  );
  const buyMaxHasMilestone = buyMax.milestones_reached.includes(
    "milestone_assistant_first",
  );
  const buyMaxPurchase = buyMax.purchase_action_events.find(
    (event) => event.action === "buy_assistant_level_max",
  );
  const buyMaxGenuine =
    buyMax.purchase_action_count === 1 &&
    buyMaxPurchase?.levelsPurchased >= 2 &&
    buyMaxPurchase.previousLevel < activeParams.PARAM_FIRST_MILESTONE_LEVEL &&
    buyMaxPurchase.newLevel >= activeParams.PARAM_FIRST_MILESTONE_LEVEL &&
    buyMax.endpoint_completed &&
    buyMaxHasMilestone;
  results.push(
    gate(
      "gate_buy_max_milestones",
      "scenario_buy_max_milestone_crossing",
      "one Buy Max action buys >=2 levels, crosses milestone, emits feedback",
      buyMaxPurchase
        ? `actions ${buyMax.purchase_action_count}, levels ${buyMaxPurchase.levelsPurchased}, ${buyMaxPurchase.previousLevel}->${buyMaxPurchase.newLevel}, milestones ${buyMax.milestones_reached.join(", ")}`
        : "no Buy Max purchase",
      buyMaxGenuine,
      "Blocker",
      "group_buy_max_rules",
      "Controlled state starts below the milestone with enough earned Money for one multi-level Buy Max transaction.",
    ),
  );
  results.push(
    gate(
      "gate_no_support_completion",
      "scenario_no_support_completion",
      "<= 2700 seconds after promotion",
      noSupport.middle_phase_seconds,
      noSupport.endpoint_completed && noSupport.middle_phase_seconds <= 2700,
      "Blocker",
      "group_assistant_baseline",
      "Endpoint must be reachable with no supports.",
    ),
  );
  results.push(
    gate(
      "gate_support_not_required",
      "scenario_no_support_completion",
      "no support required",
      noSupport.supports_owned.join(", ") || "none",
      noSupport.endpoint_completed && noSupport.supports_owned.length === 0,
      "Blocker",
      "group_endpoint",
      "Endpoint conditions do not require Support Upgrade ownership.",
    ),
  );
  const strategyScenarios = [levelFirst, supportFirst, mixed, skipSupports];
  const strategyTimes = strategyScenarios.map(
    (scenario) => scenario.middle_phase_seconds,
  );
  const best = Math.min(...strategyTimes);
  const dominantScenario = strategyScenarios.find(
    (candidate) =>
      candidate.middle_phase_seconds === best &&
      strategyScenarios
        .filter((scenario) => scenario !== candidate)
        .every(
          (scenario) =>
            (scenario.middle_phase_seconds - best) / scenario.middle_phase_seconds >
            activeParams.PARAM_DOMINANT_STRATEGY_MAX_ADVANTAGE_RATIO,
        ),
  );
  results.push(
    gate(
      "gate_universal_strategy_dominance",
      "strategy comparison",
      "no strategy beats every alternative by >20%",
      dominantScenario
        ? `${dominantScenario.scenario_id} dominant`
        : "no universal dominance",
      !dominantScenario,
      "Major",
      "group_strategy",
      "Compares level-first, support-first, mixed and skip-supports endpoint times.",
    ),
  );
  results.push(
    gate(
      "gate_support_not_universally_dominant",
      "strategy comparison",
      "support-first is not universally dominant",
      dominantScenario?.scenario_id ?? "no universal dominance",
      dominantScenario?.scenario_id !== "scenario_support_first",
      "Major",
      "group_support_effects",
      "Support-first is checked separately for the document 15 support dominance concern.",
    ),
  );
  const safe = scenarios.every(
    (scenario) =>
      Number(scenario.max_bugs_found) <= activeParams.PARAM_SAFE_MAX_RESOURCE_VALUE &&
      Number(scenario.max_money) <= activeParams.PARAM_SAFE_MAX_RESOURCE_VALUE &&
      Number(scenario.max_assistant_rate) <= activeParams.PARAM_SAFE_MAX_RATE_VALUE &&
      Number(scenario.max_level_cost) <= activeParams.PARAM_SAFE_MAX_COST_VALUE,
  );
  results.push(
    gate(
      "gate_safe_bounds",
      "all",
      "resources/rates/costs below safe max",
      safe ? "within safe bounds" : "safe bound exceeded",
      safe,
      "Blocker",
      "group_formatting",
      "Checks maximum scenario resources, rates and costs.",
    ),
  );
  results.push(
    gate(
      "gate_capstone_sanity",
      "scenario_capstone_reachability_sanity",
      "capstone reachable in dedicated capstone scenario",
      capstone.capstone_reached
        ? `reached at ${capstone.capstone_time_seconds}s`
        : "not reached",
      capstone.capstone_reached,
      "Minor",
      "group_capstone",
      "Dedicated capstone scenario continues past endpoint to the level cap.",
    ),
  );
  results.push(
    gate(
      "gate_capstone_excluded_from_endpoint_scenarios",
      "ordinary endpoint scenarios",
      "capstone not reached before ordinary endpoints",
      ordinaryEndpointScenarios
        .filter((scenario) => scenario.capstone_reached)
        .map((scenario) => scenario.scenario_id)
        .join(", ") || "none",
      ordinaryEndpointScenarios.every((scenario) => !scenario.capstone_reached),
      "Blocker",
      "group_capstone",
      "Ordinary endpoint scenarios must not hit the capstone before completion.",
    ),
  );
  const scenarioCompletionFailures = scenarios.filter(
    (scenario) =>
      scenario.scenario_id !== "scenario_capstone_reachability_sanity" &&
      scenario.scenario_id !== "scenario_junior_baseline" &&
      !scenario.endpoint_completed,
  );
  results.push(
    gate(
      "gate_scenario_completion",
      "all required endpoint scenarios",
      "all non-capstone Middle scenarios complete endpoint",
      scenarioCompletionFailures.map((scenario) => scenario.scenario_id).join(", ") ||
        "all completed",
      scenarioCompletionFailures.length === 0,
      "Blocker",
      "group_scenarios",
      "Every required Middle endpoint scenario must complete.",
    ),
  );
  const stallGateScenarios = scenarios.filter(
    (scenario) => scenario.scenario_id !== "scenario_full_run_low_engagement_info",
  );
  const maxStall = Math.max(
    ...stallGateScenarios.map((scenario) => scenario.stall_windows.maxSeconds),
  );
  results.push(
    gate(
      "gate_maximum_stall_window",
      "all",
      `<= ${activeParams.PARAM_MAX_STALL_SECONDS}s`,
      maxStall,
      maxStall <= activeParams.PARAM_MAX_STALL_SECONDS,
      "Major",
      "group_stall",
      "Checks the maximum recorded stall window across all scenarios.",
    ),
  );
  results.push(
    gate(
      "gate_phase_specific_stalls",
      "Junior and Middle phases",
      `each scenario stall <= ${activeParams.PARAM_MAX_STALL_SECONDS}s`,
      stallGateScenarios
        .map((scenario) => `${scenario.scenario_id}:${scenario.stall_windows.maxSeconds}`)
        .join("; "),
      stallGateScenarios.every(
        (scenario) =>
          scenario.stall_windows.maxSeconds <= activeParams.PARAM_MAX_STALL_SECONDS,
      ),
      "Major",
      "group_stall",
      "Stall windows are reported per scenario so Junior and Middle pacing can be tuned separately.",
    ),
  );
  results.push(
    gate(
      "gate_endpoint_not_earlier_than_min_duration",
      "scenario_junior_baseline + scenario_mixed",
      `>= ${activeParams.PARAM_TOTAL_DURATION_MIN_SECONDS}s total online gameplay`,
      junior.junior_phase_seconds + mixed.middle_phase_seconds,
      junior.junior_phase_seconds + mixed.middle_phase_seconds >=
        activeParams.PARAM_TOTAL_DURATION_MIN_SECONDS,
      "Blocker",
      "group_cost",
      "Runaway detection for endpoint before the minimum total duration.",
    ),
  );
  const unsafeBuyMaxEvents = scenarios.flatMap((scenario) =>
    scenario.purchase_action_events
      .filter(
        (event) =>
          event.action === "buy_assistant_level_max" &&
          event.levelsPurchased > activeParams.PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION,
      )
      .map((event) => `${scenario.scenario_id}:${event.levelsPurchased}`),
  );
  results.push(
    gate(
      "gate_buy_max_safe_level_limit",
      "all",
      `<= ${activeParams.PARAM_BUY_MAX_SAFE_LEVELS_PER_ACTION} levels per Buy Max before endpoint`,
      unsafeBuyMaxEvents.join(", ") || "within limit",
      unsafeBuyMaxEvents.length === 0,
      "Blocker",
      "group_buy_max_rules",
      "Runaway detection for Buy Max collapsing too many levels into one transaction.",
    ),
  );
  const immediatePurchased = [supportFirst, mixed, lowClick, active].some((scenario) =>
    scenario.supports_owned.includes(SUPPORTS.immediate),
  );
  const trainingPurchased = [supportFirst, active, capstone].some((scenario) =>
    scenario.supports_owned.includes(SUPPORTS.training),
  );
  const offlineImproves = controlledOfflineComparison.pass;
  const mixedNegativeSupport = mixed.support_purchase_analysis.filter(
    (purchase) =>
      purchase.endpointUtilitySeconds !== null &&
      purchase.endpointUtilitySeconds < 0 &&
      !purchase.justifiedByScenarioObjective,
  );
  results.push(
    gate(
      "gate_support_immediate_viability",
      "support scenarios",
      "Immediate Support has at least one rational online purchase window",
      immediatePurchased ? "purchased online" : "not purchased",
      immediatePurchased,
      "Major",
      "group_support_prices",
      "Immediate Support viability is proven by at least one deterministic online policy buying it.",
    ),
  );
  results.push(
    gate(
      "gate_support_training_viability",
      "support scenarios",
      "Training Support has payback horizon and is not mandatory",
      trainingPurchased && noSupport.supports_owned.length === 0
        ? "payback recorded and no-support endpoint completed"
        : "missing training viability or mandatory signal",
      trainingPurchased &&
        noSupport.endpoint_completed &&
        noSupport.supports_owned.length === 0,
      "Major",
      "group_support_effects",
      "Training Support purchases record remaining-level payback and no-support completion proves it is not mandatory.",
    ),
  );
  results.push(
    gate(
      "gate_support_offline_viability",
      "controlled offline handover comparison",
      "isolated Handover ratio matches offline efficiency ratio",
      `${controlledOfflineComparison.without_handover.bugs_found_gained} -> ${controlledOfflineComparison.with_handover.bugs_found_gained}; ratio ${controlledOfflineComparison.normalized_improvement_ratio}`,
      offlineImproves,
      "Major",
      "group_offline",
      "Controlled fork keeps Assistant level, resources, lifetime state and other Support ownership identical before Handover purchase.",
    ),
  );
  results.push(
    gate(
      "gate_mixed_support_utility",
      "scenario_mixed",
      "mixed does not buy unsupported negative-utility Support Upgrades",
      mixedNegativeSupport.length === 0
        ? "no negative utility support purchases"
        : mixedNegativeSupport.map((purchase) => purchase.supportId).join(", "),
      mixedNegativeSupport.length === 0,
      "Major",
      "group_support_effects",
      "Mixed policy support purchases must have non-negative endpoint utility unless scenario objectives justify them.",
    ),
  );
  results.push(
    gate(
      "gate_capstone_stall_informational",
      "scenario_capstone_reachability_sanity",
      "capstone post-endpoint stall reported separately",
      capstone.stall_windows.capstonePostEndpointMaxSeconds,
      true,
      "Minor",
      "group_capstone",
      "Post-endpoint capstone wait is informational and does not fail MVP endpoint stall gates.",
    ),
  );

  return results;
}

function runCompleteSimulationSuiteInternal() {
  const juniorState = runJuniorBaseline();
  const juniorPhaseSeconds = juniorState.simulationTimeSeconds;
  const postPromotion = cloneState(juniorState);
  const scenarioStates = [
    juniorState,
    runMiddleScenario({
      scenarioId: "scenario_level_first",
      strategyId: "level_first",
      postPromotionState: postPromotion,
    }),
    runMiddleScenario({
      scenarioId: "scenario_support_first",
      strategyId: "support_first",
      postPromotionState: postPromotion,
    }),
    runMiddleScenario({
      scenarioId: "scenario_mixed",
      strategyId: "mixed",
      postPromotionState: postPromotion,
    }),
    runMiddleScenario({
      scenarioId: "scenario_skip_supports",
      strategyId: "skip_supports",
      postPromotionState: postPromotion,
    }),
    runMiddleScenario({
      scenarioId: "scenario_low_click_middle",
      strategyId: "mixed",
      postPromotionState: postPromotion,
      manualInterval: activeParams.PARAM_LOW_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
      reportInterval: activeParams.PARAM_LOW_CLICK_REPORT_INTERVAL_SECONDS,
      cadenceProfile: "middle_low_click",
    }),
    runMiddleScenario({
      scenarioId: "scenario_active_click_middle",
      strategyId: "mixed",
      postPromotionState: postPromotion,
      manualInterval: activeParams.PARAM_ACTIVE_CLICK_MANUAL_ACTION_INTERVAL_SECONDS,
      reportInterval: activeParams.PARAM_ACTIVE_CLICK_REPORT_INTERVAL_SECONDS,
      cadenceProfile: "middle_active_click",
    }),
    runMiddleScenario({
      scenarioId: "scenario_offline_return_without_support",
      strategyId: "mixed",
      postPromotionState: postPromotion,
      offlineMode: "unsupported",
      cadenceProfile: "middle_offline_unsupported",
    }),
    runMiddleScenario({
      scenarioId: "scenario_offline_return_with_support",
      strategyId: "support_first",
      postPromotionState: postPromotion,
      offlineMode: "supported",
      cadenceProfile: "middle_offline_supported",
    }),
    runMiddleScenario({
      scenarioId: "scenario_no_support_completion",
      strategyId: "skip_supports",
      postPromotionState: postPromotion,
    }),
    runControlledBuyMaxMilestoneScenario(postPromotion),
    runMiddleScenario({
      scenarioId: "scenario_endpoint_completion",
      strategyId: "mixed",
      postPromotionState: postPromotion,
    }),
    runMiddleScenario({
      scenarioId: "scenario_capstone_reachability_sanity",
      strategyId: "mixed",
      postPromotionState: postPromotion,
      stopAtCapstone: true,
    }),
    runMiddleScenario({
      scenarioId: "scenario_full_run_low_engagement_info",
      strategyId: "mixed",
      postPromotionState: postPromotion,
      manualInterval: 45,
      reportInterval: 180,
      cadenceProfile: "middle_low_engagement_info",
    }),
  ];
  const scenarios = scenarioStates.map((state) =>
    summarizeScenario(
      state,
      state.scenarioId === "scenario_junior_baseline"
        ? "junior_baseline"
        : inferStrategy(state.scenarioId),
      state.scenarioId === "scenario_junior_baseline"
        ? state.simulationTimeSeconds
        : juniorPhaseSeconds,
    ),
  );
  const controlledOfflineComparison =
    runControlledOfflineSupportComparison(postPromotion);
  const gates = evaluateGates(scenarios, controlledOfflineComparison);

  for (const scenario of scenarios) {
    scenario.gate_results = gates.filter(
      (gateResult) =>
        gateResult.scenario === scenario.scenario_id ||
        gateResult.scenario === "all" ||
        (gateResult.scenario === "strategy comparison" &&
          ["scenario_level_first", "scenario_support_first", "scenario_mixed"].includes(
            scenario.scenario_id,
          )),
    );
  }

  return {
    parameter_version: activeParameterVersion,
    parameter_profile_id: activeProfileId,
    simulator_version: SIMULATOR_VERSION,
    run_date: new Date().toISOString(),
    document_status_at_run: "DRAFT - Simulation Validation Required",
    junior_baseline_snapshot: JUNIOR_BASELINE_SNAPSHOT,
    junior_baseline_snapshot_hash: getJuniorBaselineSnapshotHash(),
    controlled_offline_support_comparison: controlledOfflineComparison,
    scenarios,
    gates,
  };
}

export function runCompleteSimulationSuite({
  params = PARAMS,
  parameterVersion = PARAMETER_VERSION,
  profileId = "historical-doc15-provisional-2026-07-14",
} = {}) {
  return withActiveParams(params, parameterVersion, profileId, () =>
    runCompleteSimulationSuiteInternal(),
  );
}

export function runCompleteSimulationSuiteForProfile(profileId) {
  const profile = getParameterProfile(profileId);

  return runCompleteSimulationSuite({
    params: profile.params,
    parameterVersion: profile.version,
    profileId: profile.id,
  });
}

function inferStrategy(scenarioId) {
  if (scenarioId.includes("support_first")) {
    return "support_first";
  }
  if (scenarioId.includes("level_first")) {
    return "level_first";
  }
  if (scenarioId.includes("skip") || scenarioId.includes("no_support")) {
    return "skip_supports";
  }
  if (scenarioId.includes("buy_max")) {
    return "buy_max_heavy";
  }
  return "mixed";
}
