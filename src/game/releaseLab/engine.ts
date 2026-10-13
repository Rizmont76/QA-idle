import type { ReleaseLabAction, ReleaseLabState } from "../../types";
import {
  autoUnlocked,
  efficiencyPrice,
  LAB,
  LAB_PRODUCERS,
  labPrice,
  labProducerUnlocked,
  outputPower,
  releaseGain,
  efficiencyPower,
  labBatchQuote,
} from "./data";

const HALF = 0.5;
const QUADRATIC = 2;
const CUBIC = 3;
const CUBIC_INTEGRAL_DIVISOR = 6;
const SIXTH = 1 / CUBIC_INTEGRAL_DIVISOR;
const bounded = (n: number, maximum: number = LAB.limit) =>
  Number.isFinite(n) ? Math.max(0, Math.min(maximum, n)) : 0;
export function newReleaseLab(now = Date.now()): ReleaseLabState {
  return {
    version: 1,
    reports: 0,
    buildWork: 0,
    totalWork: 0,
    patterns: 0,
    builds: 0,
    testers: 0,
    scripts: 0,
    cases: 0,
    ci: 0,
    bought: { testers: 0, scripts: 0, ci: 0 },
    efficiency: 0,
    autoBuy: false,
    lastTick: now,
  };
}
function earned(s: ReleaseLabState, work: number): ReleaseLabState {
  return {
    ...s,
    reports: bounded(s.reports + work),
    buildWork: bounded(s.buildWork + work),
    totalWork: bounded(s.totalWork + work),
  };
}

// Solve a monotonic quadratic with a stable root even for a very small remaining stock.
function caseCapTime(stock: number, linear: number, acceleration: number): number {
  const missing = LAB.limit - stock;
  if (acceleration > 0) {
    return (
      (QUADRATIC * missing) /
      (linear + Math.sqrt(linear ** QUADRATIC + QUADRATIC * acceleration * missing))
    );
  }
  return linear > 0 ? missing / linear : Infinity;
}
export function labWork(s: ReleaseLabState, seconds: number): ReleaseLabState {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return s;
  }
  const power = outputPower(s);
  const efficiency = efficiencyPower(s);
  const casesUnlocked = labProducerUnlocked(s, "scripts");
  const ciUnlocked = labProducerUnlocked(s, "ci");
  let scripts = casesUnlocked ? s.scripts : 0;
  let cases = casesUnlocked ? s.cases : 0;
  let remaining = seconds;
  let work = 0;
  while (remaining > 0) {
    const scriptGrowth =
      ciUnlocked && scripts < LAB.limit ? s.ci * LAB.ciRate * efficiency : 0;
    const caseFactor = casesUnlocked && cases < LAB.limit ? LAB.caseRate * efficiency : 0;
    const linear = scripts * caseFactor;
    const acceleration = scriptGrowth * caseFactor;
    const scriptBoundary =
      scriptGrowth > 0 ? (LAB.limit - scripts) / scriptGrowth : Infinity;
    const caseBoundary =
      cases < LAB.limit ? caseCapTime(cases, linear, acceleration) : Infinity;
    const step = Math.min(remaining, scriptBoundary, caseBoundary);
    work +=
      power *
      (s.testers * step +
        LAB.caseOutput *
          (cases * step +
            HALF * linear * step ** QUADRATIC +
            SIXTH * acceleration * step ** CUBIC));
    scripts = bounded(scripts + scriptGrowth * step);
    cases = bounded(cases + linear * step + HALF * acceleration * step ** QUADRATIC);
    if (scriptBoundary === step) {
      scripts = LAB.limit;
    }
    if (caseBoundary === step) {
      cases = LAB.limit;
    }
    remaining = Math.max(0, remaining - step);
  }
  return earned({ ...s, scripts, cases }, work);
}
function purchase(s: ReleaseLabState, action: ReleaseLabAction): ReleaseLabState | null {
  if (action.type === "buyMax") {
    const quote = labBatchQuote(s, action.id);
    if (quote.count === 0) {
      return null;
    }
    return {
      ...s,
      reports: Math.max(0, s.reports - quote.cost),
      [action.id]: bounded(s[action.id] + quote.count),
      bought: { ...s.bought, [action.id]: s.bought[action.id] + quote.count },
    };
  }
  if (action.type === "buy") {
    const cost = labPrice(s, action.id);
    if (
      !labProducerUnlocked(s, action.id) ||
      s.bought[action.id] >= LAB.purchases ||
      s.reports < cost
    ) {
      return null;
    }
    return {
      ...s,
      reports: Math.max(0, s.reports - cost),
      [action.id]: bounded(s[action.id] + 1),
      bought: { ...s.bought, [action.id]: s.bought[action.id] + 1 },
    };
  }
  if (action.type === "efficiency") {
    const cost = efficiencyPrice(s);
    return s.efficiency < LAB.efficiencyLevels && s.reports >= cost
      ? { ...s, reports: s.reports - cost, efficiency: s.efficiency + 1 }
      : null;
  }
  return null;
}
export function advanceReleaseLab(s: ReleaseLabState, now: number): ReleaseLabState {
  if (!Number.isFinite(now) || now <= s.lastTick) {
    return s;
  }
  const end =
    s.lastTick + Math.min(now - s.lastTick, LAB.offlineSeconds * LAB.milliseconds);
  let next = s;
  while (next.lastTick < end) {
    const buying = next.autoBuy && autoUnlocked(next);
    const boundary = (Math.floor(next.lastTick / LAB.autoMs) + 1) * LAB.autoMs;
    const until = buying ? Math.min(end, boundary) : end;
    next = {
      ...labWork(next, (until - next.lastTick) / LAB.milliseconds),
      lastTick: until,
    };
    if (buying && until === boundary) {
      const cheapest = LAB_PRODUCERS.filter(
        (p) =>
          labProducerUnlocked(next, p.id) &&
          next.bought[p.id] < LAB.purchases &&
          next.reports >= labPrice(next, p.id),
      ).sort((a, b) => labPrice(next, a.id) - labPrice(next, b.id))[0];
      if (cheapest) {
        next = purchase(next, { type: "buy", id: cheapest.id }) ?? next;
      }
    }
  }
  return { ...next, lastTick: now };
}
export function releaseLabAction(
  s: ReleaseLabState,
  action: ReleaseLabAction,
  now = Date.now(),
) {
  const state = advanceReleaseLab(s, now);
  let next: ReleaseLabState | null = null;
  switch (action.type) {
    case "test":
      next = earned(state, LAB.click * outputPower(state));
      break;
    case "buy":
    case "buyMax":
    case "efficiency":
      next = purchase(state, action);
      break;
    case "auto":
      if (autoUnlocked(state)) {
        next = { ...state, autoBuy: action.enabled };
      }
      break;
    case "ship": {
      const gain = releaseGain(state);
      if (gain < 1) {
        break;
      }
      const patterns = state.patterns + gain;
      const initial = newReleaseLab(now);
      next = {
        ...initial,
        patterns,
        builds: state.builds + 1,
        reports: LAB.resetReports,
        testers: 1,
        scripts: labProducerUnlocked({ ...initial, patterns }, "scripts") ? 1 : 0,
        ci: labProducerUnlocked({ ...initial, patterns }, "ci") ? 1 : 0,
        autoBuy: state.autoBuy,
        totalWork: state.totalWork,
      };
      break;
    }
  }
  return { state: next ?? state, ok: next !== null };
}
