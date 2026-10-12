import type { CareerState } from "../../types";
import { CAREER_RULES } from "./content";
import { PROJECTS, RESEARCH, SPECIALISTS, STUDIO_RULES } from "./expansionData";
import type { ProjectDefinition } from "./expansionData";
import { PRODUCTS } from "./productData";
import type { ProductDefinition } from "./productData";
import { architectureUnlocked } from "./architectureEffects";
import { networkUnlocked } from "./networkEffects";
import { recruited } from "./studioSelectors";
import { pipelineUnlocked } from "./pipelineUnlocks";

export type CareerView =
  | "workspace"
  | "office"
  | "projects"
  | "products"
  | "pipeline"
  | "studio"
  | "resources"
  | "career"
  | "achievements"
  | "settings";
export type PipelineView = "pipeline" | "architecture" | "network";

export function productDiscovered(s: CareerState, def: ProductDefinition): boolean {
  return (
    (s.products.releases[def.id] ?? 0) > 0 ||
    (s.bestStage >= def.stage && (s.certificates[def.project] ?? 0) > 0)
  );
}
export function projectDiscovered(s: CareerState, def: ProjectDefinition): boolean {
  const previous = PROJECTS[PROJECTS.indexOf(def) - 1];
  return (
    (s.certificates[def.id] ?? 0) > 0 ||
    s.project?.id === def.id ||
    (s.bestStage >= def.stage && (!previous || (s.certificates[previous.id] ?? 0) > 0))
  );
}
export const prestigeDiscovered = (s: CareerState) =>
  s.bestStage >= CAREER_RULES.prestigeStage || s.careers > 0;
export function viewUnlocked(s: CareerState, view: CareerView): boolean {
  switch (view) {
    case "workspace":
    case "settings":
      return true;
    case "office":
    case "projects":
    case "career":
      return s.bestStage >= STUDIO_RULES.unlockStage;
    case "studio":
      return (
        s.bestStage >= STUDIO_RULES.unlockStage &&
        (s.lifetimeInsights > 0 ||
          s.insights > 0 ||
          RESEARCH.some((r) => (s.research[r.id] ?? 0) > 0) ||
          SPECIALISTS.some((p) => recruited(s, p.id)))
      );
    case "products":
      return PRODUCTS.some((p) => productDiscovered(s, p));
    case "pipeline":
      return pipelineUnlocked(s);
    case "resources":
      return viewUnlocked(s, "studio") || s.careers > 0;
    case "achievements":
      return s.badges.length > 0;
  }
}
export function pipelineView(s: CareerState, requested: PipelineView): PipelineView {
  if (requested === "network" && networkUnlocked(s)) {
    return requested;
  }
  if (requested === "architecture" && architectureUnlocked(s)) {
    return requested;
  }
  return "pipeline";
}
