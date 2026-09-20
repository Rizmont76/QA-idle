import type { CareerAction, CareerState } from "../../types";
import { BADGES, CAREER_RULES as R, CAREER_STAGES, CAREER_UPGRADES } from "./content";
import {
  bounded,
  contractReady,
  hasAutoReport,
  hireQuote,
  manualPower,
  offlineCap,
  prestigeReward,
  production,
  promotionReady,
  reportValue,
  contractQuote,
  offlineEfficiency,
} from "./selectors";
import { projectPhase } from "./studioSelectors";
import { studioAction } from "./studioActions";
import { dispatchPayment, dispatchQuote, officeAction } from "./office";

export function newCareer(now = Date.now()): CareerState {
  return {
    schemaVersion: R.version,
    money: 0,
    bugs: 0,
    earned: 0,
    found: 0,
    lifetimeEarned: 0,
    lifetimeBugs: 0,
    manualTests: 0,
    stage: 0,
    bestStage: 0,
    crew: { assistant: 0, squad: 0, runner: 0, lab: 0, cloud: 0, ai: 0, orbital: 0 },
    upgrades: [],
    badges: [],
    experience: 0,
    careers: 0,
    contractsCompleted: 0,
    contract: null,
    project: null,
    insights: 0,
    lifetimeInsights: 0,
    research: {},
    certificates: {},
    specialists: [],
    office: { licensed: false, contractId: null, completed: 0, earned: 0, insights: 0 },
    lastTick: now,
    playedSeconds: 0,
  };
}
export function awardBadges(s: CareerState): CareerState {
  const unlocked = BADGES.filter((b) => !s.badges.includes(b.id) && b.earned(s));
  return unlocked.length
    ? { ...s, badges: [...s.badges, ...unlocked.map((b) => b.id)] }
    : s;
}
function findBugs(s: CareerState, amount: number): CareerState {
  const phase = s.project ? projectPhase(s.project) : null;
  return {
    ...s,
    bugs: bounded(s.bugs + amount),
    found: bounded(s.found + amount),
    lifetimeBugs: bounded(s.lifetimeBugs + amount),
    project:
      s.project && phase
        ? { ...s.project, progress: Math.min(phase.target, s.project.progress + amount) }
        : null,
    contract: s.contract
      ? {
          ...s.contract,
          progress: Math.min(s.contract.target, s.contract.progress + amount),
        }
      : null,
  };
}
function earn(s: CareerState, amount: number): CareerState {
  return {
    ...s,
    money: bounded(s.money + amount),
    earned: bounded(s.earned + amount),
    lifetimeEarned: bounded(s.lifetimeEarned + amount),
  };
}
function report(s: CareerState): CareerState {
  return { ...earn(s, bounded(s.bugs * reportValue(s))), bugs: 0 };
}
export interface TimeResult {
  state: CareerState;
  seconds: number;
  bugs: number;
  money: number;
  capped: boolean;
  autoContracts?: number;
  autoInsights?: number;
}
export function advanceCareer(s: CareerState, now: number, offline = false): TimeResult {
  const elapsed = (now - s.lastTick) / R.milliseconds;
  if (!Number.isFinite(elapsed) || elapsed <= 0) {
    return { state: s, seconds: 0, bugs: 0, money: 0, capped: false };
  }
  const seconds = Math.min(elapsed, offlineCap(s));
  let next = s;
  let remaining = seconds;
  let totalBugs = 0;
  while (remaining > 0) {
    const quote = dispatchQuote(next);
    if (!quote || (next.contract && next.contract.id !== quote.id)) {
      const result = advanceSlice(next, remaining, offline);
      next = result.state;
      totalBugs += result.bugs;
      break;
    }
    const contract = next.contract ?? quote;
    next = { ...next, contract };
    const rate = production(next) * (offline ? offlineEfficiency(next) : 1);
    const missing = Math.max(0, contract.target - contract.progress);
    const workTime = missing === 0 ? 0 : rate > 0 ? missing / rate : Infinity;
    const untilReady = Math.max(0, contract.duration - contract.elapsed, workTime);
    const step = Math.min(remaining, untilReady);
    const result = advanceSlice(next, step, offline);
    next = result.state;
    totalBugs += result.bugs;
    remaining = Math.max(0, remaining - step);
    if (untilReady > step) {
      break;
    }
    // The analytically computed boundary satisfies both goals. Avoid tiny
    // floating-point residuals causing a zero-length completion loop.
    next = awardBadges(dispatchPayment(next));
  }
  return {
    state: { ...next, lastTick: now },
    seconds,
    bugs: bounded(totalBugs),
    money: next.money - s.money,
    capped: elapsed > seconds,
    autoContracts: next.office.completed - s.office.completed,
    autoInsights: next.office.insights - s.office.insights,
  };
}
function advanceSlice(s: CareerState, seconds: number, offline: boolean): TimeResult {
  const efficiency = offline ? offlineEfficiency(s) : 1;
  const bugs = bounded(production(s) * seconds * efficiency);
  let next = findBugs(s, bugs);
  const phase = next.project ? projectPhase(next.project) : null;
  next = {
    ...next,
    lastTick: s.lastTick + seconds * R.milliseconds,
    playedSeconds: bounded(s.playedSeconds + (offline ? 0 : seconds)),
    project:
      next.project && phase
        ? {
            ...next.project,
            elapsed: Math.min(phase.seconds, next.project.elapsed + seconds),
          }
        : null,
    contract: next.contract
      ? {
          ...next.contract,
          elapsed: Math.min(next.contract.duration, next.contract.elapsed + seconds),
        }
      : null,
  };
  if (hasAutoReport(next)) {
    next = report(next);
  }
  return {
    state: awardBadges(next),
    seconds,
    bugs,
    money: next.money - s.money,
    capped: false,
  };
}
export interface ActionResult {
  state: CareerState;
  ok: boolean;
  message: string;
}
export function act(
  s: CareerState,
  action: CareerAction,
  now = Date.now(),
): ActionResult {
  let state = advanceCareer(s, now, now - s.lastTick > R.sleepThresholdMs).state;
  const failure = (message: string): ActionResult => ({ state, ok: false, message });
  let message = "";
  switch (action.type) {
    case "test": {
      state = {
        ...findBugs(state, manualPower(state)),
        manualTests: bounded(state.manualTests + 1),
      };
      break;
    }
    case "report": {
      if (state.bugs <= 0) {
        return failure("Спочатку знайди хоча б один баг.");
      }
      state = report(state);
      message = "Звіт прийнято. Гроші вже на рахунку.";
      break;
    }
    case "hire": {
      const quote = hireQuote(state, action.id, action.mode);
      if (!quote.count) {
        return failure("Недостатньо грошей або команда ще недоступна.");
      }
      state = {
        ...state,
        money: state.money - quote.cost,
        crew: { ...state.crew, [action.id]: state.crew[action.id] + quote.count },
      };
      message = "Команда стала сильнішою.";
      break;
    }
    case "upgrade": {
      const upgrade = CAREER_UPGRADES.find((u) => u.id === action.id);
      if (
        !upgrade ||
        upgrade.stage > state.stage ||
        state.upgrades.includes(upgrade.id) ||
        state.money < upgrade.cost
      ) {
        return failure("Це покращення поки недоступне.");
      }
      state = {
        ...state,
        money: state.money - upgrade.cost,
        upgrades: [...state.upgrades, upgrade.id],
      };
      message = `${upgrade.title} — готово!`;
      break;
    }
    case "promote": {
      if (!promotionReady(state)) {
        return failure("Ще не всі умови підвищення виконані.");
      }
      state = {
        ...state,
        stage: state.stage + 1,
        bestStage: Math.max(state.bestStage, state.stage + 1),
      };
      message = `Вітаємо! Тепер ти ${CAREER_STAGES[state.stage]?.title ?? "Director"}.`;
      break;
    }
    case "contract": {
      const contract = contractQuote(state, action.id);
      if (!contract || state.contract) {
        return failure("Контракт поки недоступний.");
      }
      state = {
        ...state,
        contract,
      };
      message = "Контракт розпочато. Кожен новий баг наближає винагороду.";
      break;
    }
    case "claim": {
      if (!state.contract || !contractReady(state)) {
        return failure("Контракт ще не завершено.");
      }
      state = {
        ...earn(state, state.contract.reward),
        insights: bounded(state.insights + state.contract.insights),
        lifetimeInsights: bounded(state.lifetimeInsights + state.contract.insights),
        contract: null,
        contractsCompleted: bounded(state.contractsCompleted + 1),
      };
      message = "Контракт закрито. Клієнт задоволений!";
      break;
    }
    case "cancelContract": {
      state = { ...state, contract: null, office: { ...state.office, contractId: null } };
      message = "Контракт скасовано.";
      break;
    }
    case "prestige": {
      const reward = prestigeReward(state);
      if (reward <= 0) {
        return failure("Нову кар’єру можна почати після досягнення Director.");
      }
      state = {
        ...newCareer(now),
        money: R.repeatCapital,
        upgrades: ["auto"],
        experience: bounded(state.experience + reward, R.experienceLimit),
        careers: bounded(state.careers + 1),
        badges: state.badges,
        lifetimeEarned: state.lifetimeEarned,
        lifetimeBugs: state.lifetimeBugs,
        manualTests: state.manualTests,
        bestStage: state.bestStage,
        contractsCompleted: state.contractsCompleted,
        playedSeconds: state.playedSeconds,
        insights: state.insights,
        lifetimeInsights: state.lifetimeInsights,
        research: state.research,
        certificates: state.certificates,
        specialists: state.specialists,
        office: { ...state.office, contractId: null },
      };
      message = `Нова кар’єра! +${String(reward)} досвіду. Автозвіти вже працюють.`;
      break;
    }
    case "buyDispatcher":
    case "dispatch": {
      const result = officeAction(state, action);
      return { ...result, state: awardBadges(result.state) };
    }
    default: {
      const result = studioAction(state, action);
      return { ...result, state: awardBadges(result.state) };
    }
  }
  return { state: awardBadges(state), ok: true, message };
}
