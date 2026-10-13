import type { CareerAction, CareerState } from "../../types";
import { chapterCrew, chapterRows } from "./chapters";
import { contractReady, hireQuote } from "./selectors";
import { PRODUCTS } from "./productData";
import { productUnlocked } from "./products";
import { RESEARCH, SPECIALISTS } from "./expansionData";
import { recruited, researchCost, researchUnlocked } from "./studioSelectors";
import { CAREER_RULES } from "./content";

const insightContract = (s: CareerState): CareerAction | null => {
  if (s.stage < CAREER_RULES.contractStage) {
    return null;
  }
  if (contractReady(s)) {
    return { type: "claim" };
  }
  return !s.contract ? { type: "contract", id: "smoke" } : null;
};

export function chapterTool(s: CareerState) {
  if (
    s.pipeline.model === 1 &&
    !chapterRows(s).some((r) => r.goal.kind === "products" && !r.done)
  ) {
    return undefined;
  }
  return PRODUCTS.filter(
    (p) => !(s.products.releases[p.id] ?? 0) && productUnlocked(s, p),
  ).sort((a, b) => a.insights - b.insights || a.cost - b.cost)[0];
}
export const chapterInsightReserve = (s: CareerState) => chapterTool(s)?.insights ?? 0;

// Suggestions are ordinary validated actions. Manual play and opt-in automation
// share this policy without bypassing rank, ownership, budget or project gates.
export function chapterIntent(s: CareerState): CareerAction | null {
  const crew = chapterCrew(s);
  if (crew && hireQuote(s, crew.id, 1).count) {
    return { type: "hire", id: crew.id, mode: 1 };
  }
  for (const row of chapterRows(s).filter((r) => !r.done)) {
    switch (row.goal.kind) {
      case "upgrade":
        break; // Existing cash-upgrade policy owns this.
      case "products": {
        const def = PRODUCTS.find(
          (p) =>
            !(s.products.releases[p.id] ?? 0) &&
            productUnlocked(s, p) &&
            s.money >= p.cost &&
            s.insights >= p.insights,
        );
        if (def) {
          return { type: "launchProduct", id: def.id };
        }
        const needsInsights = PRODUCTS.some(
          (p) =>
            !(s.products.releases[p.id] ?? 0) &&
            productUnlocked(s, p) &&
            s.insights < p.insights,
        );
        if (needsInsights) {
          return insightContract(s);
        }
        break;
      }
      case "research": {
        const def = RESEARCH.filter(
          (r) =>
            researchUnlocked(s, r) &&
            (s.research[r.id] ?? 0) < r.max &&
            s.insights >= researchCost(s, r),
        ).sort((a, b) => researchCost(s, a) - researchCost(s, b))[0];
        if (def) {
          return { type: "research", id: def.id };
        }
        return insightContract(s);
        break;
      }
      case "staff": {
        const def = SPECIALISTS.find((p) => recruited(s, p.id));
        if (def && s.specialists.length === 0) {
          return { type: "assignSpecialist", id: def.id };
        }
        break;
      }
      case "contracts":
        if (contractReady(s)) {
          return { type: "claim" };
        }
        if (!s.contract) {
          return { type: "contract", id: "smoke" };
        }
        break;
    }
  }
  if (s.pipeline.model === 1) {
    return null;
  }
  const tool = chapterTool(s);
  if (tool && s.money >= tool.cost) {
    return s.insights >= tool.insights
      ? { type: "launchProduct", id: tool.id }
      : insightContract(s);
  }
  const research = RESEARCH.filter(
    (r) =>
      researchUnlocked(s, r) &&
      (s.research[r.id] ?? 0) < r.max &&
      s.insights - chapterInsightReserve(s) >= researchCost(s, r),
  ).sort((a, b) => researchCost(s, a) - researchCost(s, b))[0];
  if (research) {
    return { type: "research", id: research.id };
  }
  return null;
}
