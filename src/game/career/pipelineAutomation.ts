import { architecturePolicyUnlocked } from "./architectureEffects";
import { corePrice, PIPELINE } from "./pipelineData";
import type { CareerAction, CareerState, PipelinePolicy } from "../../types";
import { CAREER_UPGRADES, CREW } from "./content";
import { PROJECTS } from "./expansionData";
import { hireQuote, promotionReady } from "./selectors";
import { projectReady, projectUnlocked } from "./studioSelectors";
import { PIPELINE_POLICIES, policyUnlocked } from "./pipelineData";

export const automationActive = (s: CareerState) =>
  s.careers > 0 &&
  (autoCoresActive(s) ||
    PIPELINE_POLICIES.some(
      ({ id }) => s.pipeline.automation[id] && policyUnlocked(s.pipeline, id),
    ));
export function automationIntent(
  s: CareerState,
  id: PipelinePolicy,
): CareerAction | null {
  if (s.careers < 1 || !s.pipeline.automation[id] || !policyUnlocked(s.pipeline, id)) {
    return null;
  }
  switch (id) {
    case "promote":
      return promotionReady(s) ? { type: "promote" } : null;
    case "upgrades": {
      const def = CAREER_UPGRADES.filter(
        (u) => u.stage <= s.stage && !s.upgrades.includes(u.id),
      ).sort((a, b) => a.cost - b.cost)[0];
      return def && s.money >= def.cost ? { type: "upgrade", id: def.id } : null;
    }
    case "hire": {
      const candidates = CREW.map((c) => ({ id: c.id, quote: hireQuote(s, c.id, 1) }))
        .filter((c) => c.quote.count > 0)
        .sort((a, b) => a.quote.cost - b.quote.cost);
      const first = candidates[0];
      return first ? { type: "hire", id: first.id, mode: 1 } : null;
    }
    case "projects": {
      if (s.project) {
        return projectReady(s) ? { type: "submitProject" } : null;
      }
      const def = PROJECTS.find(
        (p) => !(s.certificates[p.id] ?? 0) && projectUnlocked(s, p),
      );
      return def ? { type: "startProject", id: def.id } : null;
    }
  }
}

const autoCoresActive = (s: CareerState) =>
  s.pipeline.architecture.autoCores && architecturePolicyUnlocked(s, "autoCores");
export function autoCoreIntent(s: CareerState): CareerAction | null {
  return autoCoresActive(s) &&
    s.pipeline.coreLevel < PIPELINE.maxCoreLevel &&
    s.pipeline.credits >= corePrice(s.pipeline)
    ? { type: "pipelineCore" }
    : null;
}
