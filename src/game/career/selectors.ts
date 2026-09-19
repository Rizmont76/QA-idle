import type { CareerContract, CareerState, CrewId, PurchaseMode } from "../../types";
import {
  CAREER_RULES as R,
  CAREER_STAGES,
  CAREER_UPGRADES,
  CREW,
  CREW_MILESTONES,
  MILESTONE_MULTIPLIER,
  CONTRACTS,
} from "./content";
import type { CareerUpgrade } from "./content";
import {
  certificates,
  insightReward,
  researchBonus,
  staffBonus,
  staffProduction,
} from "./studioSelectors";
import { STUDIO_RULES as S } from "./expansionData";

export function bounded(value: number, max: number = R.limit): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
}
export function crewCount(s: CareerState): number {
  return Object.values(s.crew).reduce((a, b) => a + b, 0);
}
export function permanentMultiplier(s: CareerState): number {
  return 1 + s.experience * R.experienceBonus + s.badges.length * R.badgeBonus;
}
function multiplier(s: CareerState, effect: CareerUpgrade["effect"]): number {
  return CAREER_UPGRADES.filter(
    (u) => u.effect === effect && s.upgrades.includes(u.id),
  ).reduce((n, u) => n * u.value, 1);
}
export function crewRate(s: CareerState, id: CrewId): number {
  const def = CREW.find((c) => c.id === id);
  if (!def || def.stage > s.stage) {
    return 0;
  }
  const milestones = CREW_MILESTONES.filter((n) => s.crew[id] >= n).length;
  return bounded(
    def.rate *
      s.crew[id] *
      MILESTONE_MULTIPLIER ** milestones *
      multiplier(s, "production") *
      permanentMultiplier(s) *
      (1 + researchBonus(s, "production")) *
      staffProduction(s, id),
  );
}
export function production(s: CareerState): number {
  return bounded(CREW.reduce((n, c) => n + crewRate(s, c.id), 0));
}
export function manualPower(s: CareerState): number {
  const flat = CAREER_UPGRADES.filter(
    (u) => u.effect === "clickFlat" && s.upgrades.includes(u.id),
  ).reduce((n, u) => n + u.value, 1);
  return bounded(
    flat *
      multiplier(s, "click") *
      permanentMultiplier(s) *
      (1 + researchBonus(s, "manual") + staffBonus(s, "manual")) +
      production(s) * R.clickRateShare,
  );
}
export function reportValue(s: CareerState): number {
  return (
    (CAREER_STAGES[s.stage]?.value ?? 1) *
    multiplier(s, "report") *
    (1 + researchBonus(s, "report"))
  );
}
export function hasAutoReport(s: CareerState): boolean {
  return s.upgrades.includes("auto");
}
export function offlineCap(s: CareerState): number {
  return (
    (s.upgrades.includes("handover") ? R.extendedOfflineSeconds : R.offlineSeconds) +
    (researchBonus(s, "offlineHours") + staffBonus(s, "offlineHours")) * S.hour
  );
}
export function offlineEfficiency(s: CareerState): number {
  return Math.min(
    1,
    (s.upgrades.includes("handover") ? 1 : R.offlineEfficiency) +
      researchBonus(s, "offlineEfficiency") +
      staffBonus(s, "offlineEfficiency"),
  );
}
function unitPrice(s: CareerState, base: number, owned: number): number {
  return Math.ceil(base * R.costGrowth ** owned * (1 - researchBonus(s, "discount")));
}
export function nextCrewCost(s: CareerState, id: CrewId): number {
  const def = CREW.find((c) => c.id === id);
  return def ? unitPrice(s, def.cost, s.crew[id]) : R.limit;
}
export function hireQuote(
  s: CareerState,
  id: CrewId,
  mode: PurchaseMode,
): { count: number; cost: number } {
  const def = CREW.find((c) => c.id === id);
  if (!def || def.stage > s.stage) {
    return { count: 0, cost: 0 };
  }
  const max = Math.min(R.crewLimit - s.crew[id], mode === "max" ? R.crewLimit : mode);
  let count = 0;
  let cost = 0;
  while (count < max) {
    const next = unitPrice(s, def.cost, s.crew[id] + count);
    if (cost + next > s.money) {
      break;
    }
    cost += next;
    count++;
  }
  return { count, cost };
}
export function promotionReady(s: CareerState): boolean {
  const next = CAREER_STAGES[s.stage + 1];
  return (
    !!next &&
    s.earned >= next.earned &&
    crewCount(s) >= next.crew &&
    certificates(s) >= (next.projects ?? 0)
  );
}
export function prestigeReward(s: CareerState): number {
  return s.stage >= R.prestigeStage
    ? Math.min(
        R.experienceLimit - s.experience,
        Math.floor(R.prestigeBase * Math.sqrt(s.earned / R.prestigeThreshold)),
      )
    : 0;
}
export function contractQuote(s: CareerState, id: string): CareerContract | null {
  const def = CONTRACTS.find((c) => c.id === id);
  if (!def || s.stage < def.stage) {
    return null;
  }
  const scale = R.contractScale ** (s.stage - def.stage);
  return {
    id: def.id,
    title: def.title,
    target: bounded(def.target * scale),
    reward: bounded(
      Math.floor(
        def.reward *
          scale *
          (1 + researchBonus(s, "contractReward") + staffBonus(s, "contractReward")),
      ),
    ),
    duration: Math.ceil(def.duration * (1 - researchBonus(s, "contractTime"))),
    insights: insightReward(
      s,
      def.insights + Math.floor((s.stage - def.stage) / S.contractInsightRanks),
    ),
    progress: 0,
    elapsed: 0,
  };
}
export function contractReady(s: CareerState): boolean {
  return (
    !!s.contract &&
    s.contract.progress >= s.contract.target &&
    s.contract.elapsed >= s.contract.duration
  );
}
