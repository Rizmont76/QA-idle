import type { CareerProject, CareerState, CrewId } from "../../types";
import { PROJECTS, RESEARCH, SPECIALISTS, STUDIO_RULES as S } from "./expansionData";
import type {
  ProjectDefinition,
  ResearchDefinition,
  ResearchEffect,
} from "./expansionData";

export function certificates(s: CareerState): number {
  return PROJECTS.filter((p) => (s.certificates[p.id] ?? 0) > 0).length;
}
export function researchBonus(s: CareerState, effect: ResearchEffect): number {
  return RESEARCH.filter((r) => r.effect === effect).reduce(
    (sum, r) => sum + (s.research[r.id] ?? 0) * r.value,
    0,
  );
}
export function researchCost(s: CareerState, r: ResearchDefinition): number {
  return Math.ceil(r.cost * S.researchGrowth ** (s.research[r.id] ?? 0));
}
export function researchUnlocked(s: CareerState, r: ResearchDefinition): boolean {
  return (
    s.bestStage >= S.unlockStage &&
    (!r.requires || (s.research[r.requires.id] ?? 0) >= r.requires.level)
  );
}
export function specialistSlots(s: CareerState): number {
  return S.baseSlots + researchBonus(s, "slots");
}
export function recruited(s: CareerState, id: string): boolean {
  const def = SPECIALISTS.find((p) => p.id === id);
  return !!def && (s.certificates[def.project] ?? 0) > 0;
}
export function activeSpecialists(s: CareerState) {
  return SPECIALISTS.filter(
    (p) =>
      s.specialists.slice(0, specialistSlots(s)).includes(p.id) && recruited(s, p.id),
  );
}
export function staffBonus(
  s: CareerState,
  effect: "manual" | "contractReward" | "offlineEfficiency" | "offlineHours",
): number {
  return activeSpecialists(s).reduce((sum, p) => sum + (p[effect] ?? 0), 0);
}
export function staffProduction(s: CareerState, id: CrewId): number {
  return (
    1 +
    activeSpecialists(s)
      .filter((p) => p.crew?.includes(id))
      .reduce((sum, p) => sum + (p.production ?? 0), 0)
  );
}
export function insightReward(s: CareerState, base: number): number {
  return Math.floor(base * (1 + researchBonus(s, "insight")));
}
export function projectRank(def: ProjectDefinition, tier: number): number {
  const lastRank = 8;
  return Math.min(lastRank, def.stage + tier);
}
export function projectUnlocked(s: CareerState, def: ProjectDefinition): boolean {
  const tier = s.certificates[def.id] ?? 0;
  const index = PROJECTS.findIndex((p) => p.id === def.id);
  const previous = PROJECTS[index - 1];
  return (
    tier < S.tiers &&
    s.stage >= projectRank(def, tier) &&
    (!previous || (s.certificates[previous.id] ?? 0) > 0)
  );
}
export function projectQuote(s: CareerState, def: ProjectDefinition): CareerProject {
  const tier = s.certificates[def.id] ?? 0;
  return {
    id: def.id,
    tier,
    phase: 0,
    progress: 0,
    elapsed: 0,
    workMultiplier: 1 - researchBonus(s, "projectWork"),
    reward: def.reward * S.projectCashGrowth ** tier,
    insights: insightReward(s, def.insights * (tier + 1)),
  };
}
export function projectPhase(project: CareerProject) {
  const phase = PROJECTS.find((p) => p.id === project.id)?.phases[project.phase];
  if (!phase) {
    return null;
  }
  return {
    ...phase,
    target: Math.ceil(
      phase.target * S.projectWorkGrowth ** project.tier * project.workMultiplier,
    ),
    seconds: Math.ceil(phase.seconds * (1 + project.tier * S.tierTimeBonus)),
  };
}
export function projectReady(s: CareerState): boolean {
  if (!s.project) {
    return false;
  }
  const phase = projectPhase(s.project);
  return (
    !!phase && s.project.progress >= phase.target && s.project.elapsed >= phase.seconds
  );
}
