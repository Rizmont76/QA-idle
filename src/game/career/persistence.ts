import type { CareerContract, CareerState } from "../../types";
import { SAVE_SCHEMA_VERSION } from "../../types";
import {
  BADGES,
  CAREER_RULES as R,
  CAREER_STAGES,
  CAREER_UPGRADES,
  CONTRACTS,
  CREW,
} from "./content";
import { advanceCareer, awardBadges, newCareer } from "./engine";
import type { TimeResult } from "./engine";
import { amount, ids, record } from "./saveValues";
import { normalizeStudio } from "./studioPersistence";
import { STUDIO_RULES as S } from "./expansionData";

const IMPORT_CHARACTER_LIMIT = 1_000_000;
const JSON_INDENT = 2;
function normalizeContract(value: unknown, stage: number): CareerContract | null {
  if (stage < R.contractStage) {
    return null;
  }
  const data = record(value);
  const def = CONTRACTS.find((c) => c.id === data["id"]);
  if (!def) {
    return null;
  }
  // Only accept one of the legitimate snapshots from a rank reached this run.
  const scales = CAREER_STAGES.slice(def.stage, stage + 1).map(
    (_, i) => R.contractScale ** i,
  );
  const scale = scales.find((n) => def.target * n === data["target"]);
  if (!scale) {
    return null;
  }
  const reward = amount(data["reward"]);
  const duration = amount(data["duration"]);
  if (
    reward < def.reward * scale ||
    reward > Math.floor(def.reward * scale * S.maximumContractRewardMultiplier) ||
    duration < Math.ceil(def.duration * S.minimumContractTimeMultiplier) ||
    duration > def.duration
  ) {
    return null;
  }
  const extraRanks = Math.round(Math.log10(scale));
  const maxInsights = Math.floor(
    (def.insights + Math.floor(extraRanks / S.contractInsightRanks)) *
      S.maximumInsightMultiplier,
  );
  return {
    id: def.id,
    title: def.title,
    target: def.target * scale,
    reward,
    duration,
    insights: Math.floor(amount(data["insights"], maxInsights)),
    progress: amount(data["progress"], def.target * scale),
    elapsed: amount(data["elapsed"], duration),
  };
}
export function normalizeCareer(value: unknown, now = Date.now()): CareerState {
  const data = record(value);
  const state = newCareer(now);
  const numericKeys = [
    "money",
    "bugs",
    "earned",
    "found",
    "lifetimeEarned",
    "lifetimeBugs",
    "manualTests",
    "careers",
    "contractsCompleted",
    "playedSeconds",
  ] as const;
  for (const key of numericKeys) {
    state[key] = amount(data[key]);
  }
  state.experience = Math.floor(amount(data["experience"], R.experienceLimit));
  state.careers = Math.floor(state.careers);
  state.stage = Math.floor(amount(data["stage"], CAREER_STAGES.length - 1));
  state.bestStage = Math.max(
    state.stage,
    Math.floor(amount(data["bestStage"], CAREER_STAGES.length - 1)),
  );
  const crew = record(data["crew"]);
  for (const def of CREW) {
    state.crew[def.id] =
      def.stage <= state.stage ? Math.floor(amount(crew[def.id], R.crewLimit)) : 0;
  }
  state.upgrades = ids(
    data["upgrades"],
    CAREER_UPGRADES.filter(
      (u) => u.stage <= state.stage || (u.id === "auto" && state.careers > 0),
    ).map((u) => u.id),
  );
  state.badges = ids(
    data["badges"],
    BADGES.map((b) => b.id),
  );
  state.lifetimeEarned = Math.max(state.lifetimeEarned, state.earned);
  state.lifetimeBugs = Math.max(state.lifetimeBugs, state.found);
  const lastTick = data["lastTick"];
  state.lastTick =
    typeof lastTick === "number" && Number.isFinite(lastTick) && lastTick > 0
      ? Math.min(lastTick, now)
      : now;
  state.contract = normalizeContract(data["contract"], state.stage);
  normalizeStudio(state, data);
  return awardBadges(state);
}

const LEGACY_UPGRADES: Record<string, string> = {
  upgrade_better_checklist: "checklist",
  checklist: "checklist",
  upgrade_coffee: "coffee",
  coffee: "coffee",
  upgrade_keyboard_shortcuts: "shortcuts",
  upgrade_bug_report_template: "templates",
  upgrade_test_case_library: "plan",
};
export function migrateLegacy(value: unknown, now = Date.now()): CareerState {
  const wrapper = record(value);
  const data = "game" in wrapper ? record(wrapper["game"]) : wrapper;
  const meta = record(wrapper["meta"]);
  const supportedVersions: readonly number[] = [
    SAVE_SCHEMA_VERSION.v1,
    SAVE_SCHEMA_VERSION.v2,
  ];
  if (
    (meta["schemaVersion"] !== undefined &&
      !supportedVersions.includes(Number(meta["schemaVersion"]))) ||
    !("resources" in data || "money" in data || "bugs" in data)
  ) {
    throw new Error("Невідомий формат старого збереження.");
  }
  let state = newCareer(now);
  const resources = record(data["resources"]);
  state.money = amount(resources["money"] ?? data["money"]);
  state.bugs = amount(resources["bugs_found"] ?? data["bugs"]);
  state.earned = Math.max(state.money, amount(data["totalMoneyEarned"]));
  state.found = Math.max(state.bugs, amount(data["totalBugsFound"]));
  state.lifetimeEarned = state.earned;
  state.lifetimeBugs = state.found;
  state.stage = ["middle_qa", "middle"].includes(String(data["careerStage"])) ? 1 : 0;
  state.bestStage = state.stage;
  const owned = record(data["upgrades"]);
  state.upgrades = [
    ...new Set(
      Object.entries(LEGACY_UPGRADES)
        .filter(([key]) => amount(owned[key]) > 0 || owned[key] === true)
        .map(([, id]) => id),
    ),
  ];
  const assistant = record(data["assistant"]);
  if (state.stage > 0 && assistant["unlocked"] === true) {
    state.crew.assistant = Math.min(
      R.crewLimit,
      Math.floor(amount(assistant["level"])) + 1,
    );
  }
  const supports = ids(assistant["ownedSupportUpgradeIds"], [
    "support_immediate_production",
    "support_training_economics",
    "support_offline_handover",
  ]);
  if (supports.includes("support_immediate_production")) {
    state.upgrades.push("plan");
  }
  if (supports.includes("support_training_economics")) {
    state.upgrades.push("mentoring");
  }
  if (supports.includes("support_offline_handover")) {
    state.upgrades.push("handover");
  }
  // Keyboard shortcuts used to unlock in Junior. Preserve their value as coffee
  // plus test plan until the new Senior upgrade becomes available.
  if (state.upgrades.includes("shortcuts")) {
    state.upgrades = [
      ...state.upgrades.filter((id) => id !== "shortcuts"),
      "coffee",
      "plan",
    ];
  }
  state.upgrades = [...new Set(state.upgrades)];
  state = normalizeCareer(state, now);
  return state;
}

export function importCareer(text: string, now = Date.now()): CareerState {
  if (text.length > IMPORT_CHARACTER_LIMIT) {
    throw new Error("Файл збереження завеликий.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Це не коректний JSON-файл збереження.");
  }
  const data = record(parsed);
  if (
    (data["schemaVersion"] === R.version ||
      data["schemaVersion"] === R.previousVersion) &&
    typeof data["money"] === "number" &&
    typeof data["crew"] === "object" &&
    data["crew"] !== null &&
    !Array.isArray(data["crew"])
  ) {
    if (data["schemaVersion"] === R.previousVersion) {
      const crew = record(data["crew"]);
      return normalizeCareer(
        {
          ...data,
          stage: Math.min(R.prestigeStage, amount(data["stage"])),
          bestStage: Math.min(R.prestigeStage, amount(data["bestStage"])),
          crew: {
            assistant: crew["assistant"],
            squad: crew["squad"],
            runner: crew["runner"],
            lab: crew["lab"],
          },
          insights: 0,
          lifetimeInsights: 0,
          research: {},
          certificates: {},
          specialists: [],
          project: null,
        },
        now,
      );
    }
    return normalizeCareer(data, now);
  }
  if (data["schemaVersion"] !== undefined) {
    throw new Error("Ця версія збереження не підтримується.");
  }
  return migrateLegacy(parsed, now);
}
export function exportCareer(state: CareerState): string {
  return JSON.stringify(state, null, JSON_INDENT);
}
export interface CareerLoad {
  state: CareerState;
  summary: TimeResult | null;
  warning: string;
  blocked: boolean;
}
export function loadCareer(
  storage: Pick<Storage, "getItem" | "setItem">,
  now = Date.now(),
): CareerLoad {
  let current: string | null;
  let legacy: string | null;
  let previous: string | null;
  try {
    current = storage.getItem(R.saveKey);
    previous = current === null ? storage.getItem(R.previousKey) : null;
    legacy = current === null && previous === null ? storage.getItem(R.legacyKey) : null;
  } catch {
    return {
      state: newCareer(now),
      summary: null,
      warning: "Браузер заборонив збереження. Експортуй прогрес у налаштуваннях.",
      blocked: false,
    };
  }
  let state: CareerState;
  let summary: TimeResult | null = null;
  try {
    state =
      current !== null
        ? importCareer(current, now)
        : previous !== null
          ? importCareer(previous, now)
          : legacy !== null
            ? importCareer(legacy, now)
            : newCareer(now);
    if (current !== null || previous !== null) {
      summary = advanceCareer(state, now, true);
      state = summary.state;
    }
  } catch {
    return {
      state: newCareer(now),
      summary: null,
      warning:
        "Збереження пошкоджене або з новішої версії. Оригінал залишено; автозбереження призупинене. Експортуй його в налаштуваннях перед імпортом чи новою грою.",
      blocked: true,
    };
  }
  try {
    storage.setItem(R.saveKey, exportCareer(state));
  } catch {
    return {
      state,
      summary,
      warning: "Не вдалося зберегти прогрес. Зроби резервну копію в налаштуваннях.",
      blocked: false,
    };
  }
  return {
    state,
    summary,
    warning:
      legacy !== null || previous !== null
        ? "Попередній прогрес перенесено. Старе збереження залишилося як резервна копія."
        : "",
    blocked: false,
  };
}
