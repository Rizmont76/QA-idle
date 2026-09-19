import type { CareerProject, CareerState } from "../../types";
import { PROJECTS, RESEARCH, SPECIALISTS, STUDIO_RULES as S } from "./expansionData";
import { amount, ids, record } from "./saveValues";
import type { RecordValue } from "./saveValues";
import {
  projectPhase,
  projectRank,
  projectUnlocked,
  recruited,
  researchUnlocked,
  specialistSlots,
} from "./studioSelectors";

function normalizeProject(value: unknown, s: CareerState): CareerProject | null {
  const data = record(value);
  const def = PROJECTS.find((p) => p.id === data["id"]);
  if (!def || !projectUnlocked(s, def)) {
    return null;
  }
  const tier = s.certificates[def.id] ?? 0;
  const phaseIndex = data["phase"];
  const workMultiplier = data["workMultiplier"];
  if (
    data["tier"] !== tier ||
    typeof phaseIndex !== "number" ||
    !Number.isInteger(phaseIndex) ||
    phaseIndex < 0 ||
    phaseIndex >= S.phases ||
    typeof workMultiplier !== "number" ||
    !Number.isFinite(workMultiplier) ||
    workMultiplier < S.minimumWorkMultiplier ||
    workMultiplier > 1
  ) {
    return null;
  }
  const reward = def.reward * S.projectCashGrowth ** tier;
  if (data["reward"] !== reward) {
    return null;
  }
  const maxInsights = Math.floor(def.insights * (tier + 1) * S.maximumInsightMultiplier);
  const insights = Math.floor(amount(data["insights"], maxInsights));
  const project = {
    id: def.id,
    tier,
    phase: phaseIndex,
    workMultiplier,
    reward,
    insights,
    progress: 0,
    elapsed: 0,
  };
  const phase = projectPhase(project);
  if (!phase) {
    return null;
  }
  project.progress = amount(data["progress"], phase.target);
  project.elapsed = amount(data["elapsed"], phase.seconds);
  return project;
}

// Called only on a fresh normalized state; never mutates the live game.
export function normalizeStudio(state: CareerState, data: RecordValue): void {
  state.insights = Math.floor(amount(data["insights"]));
  state.lifetimeInsights = Math.max(
    state.insights,
    Math.floor(amount(data["lifetimeInsights"])),
  );
  const certs = record(data["certificates"]);
  let previousCompleted = true;
  for (const def of PROJECTS) {
    let count: number = previousCompleted
      ? Math.floor(amount(certs[def.id], S.tiers))
      : 0;
    while (count > 0 && projectRank(def, count - 1) > state.bestStage) {
      count--;
    }
    if (count > 0) {
      state.certificates[def.id] = count;
    }
    previousCompleted = count > 0;
  }
  const research = record(data["research"]);
  // Definitions are topologically ordered; dependencies must survive normalization.
  for (const def of RESEARCH) {
    const level = researchUnlocked(state, def)
      ? Math.floor(amount(research[def.id], def.max))
      : 0;
    if (level > 0) {
      state.research[def.id] = level;
    }
  }
  state.specialists = ids(
    data["specialists"],
    SPECIALISTS.filter((p) => recruited(state, p.id)).map((p) => p.id),
  ).slice(0, specialistSlots(state));
  state.project = normalizeProject(data["project"], state);
}
