import type {
  ArchitecturePolicy,
  CareerState,
  PipelineAllocation,
  RackModuleId,
} from "../../types";
import { ARCHITECTURE_POLICIES, RACK, RACK_MODULES } from "./architectureData";
import { coreBudget, PIPELINE, PIPELINE_TRIALS } from "./pipelineData";

export const architectureUnlocked = (s: CareerState) =>
  s.careers > 0 && PIPELINE_TRIALS.every((t) => s.pipeline.completed.includes(t.id));
export const moduleDefinition = (id: RackModuleId | null) =>
  RACK_MODULES.find((m) => m.id === id);
export const moduleUnlocked = (s: CareerState, id: RackModuleId) => {
  const def = moduleDefinition(id);
  return (
    architectureUnlocked(s) &&
    !!def &&
    (!def.requires || s.pipeline.architecture.blueprints.includes(def.requires))
  );
};
export const architecturePolicyUnlocked = (s: CareerState, id: ArchitecturePolicy) =>
  architectureUnlocked(s) &&
  ARCHITECTURE_POLICIES.some(
    (p) => p.id === id && s.pipeline.architecture.blueprints.includes(p.requires),
  );
export const powerBudget = (s: CareerState) =>
  RACK.basePower +
  s.pipeline.architecture.powerLevel +
  (s.pipeline.architecture.blueprints.includes("bus") ? 1 : 0);
export const powerUsed = (layout: (RackModuleId | null)[]) =>
  layout.reduce((sum, id) => sum + (moduleDefinition(id)?.power ?? 0), 0);
export function neighbors(slot: number): number[] {
  const row = Math.floor(slot / RACK.columns);
  const column = slot % RACK.columns;
  return Array.from({ length: RACK.slots }, (_, i) => i).filter(
    (i) =>
      Math.abs(Math.floor(i / RACK.columns) - row) +
        Math.abs((i % RACK.columns) - column) ===
      1,
  );
}
export function architectureEffects(s: CareerState) {
  const result = {
    rates: [...PIPELINE.rates] as PipelineAllocation,
    crew: 1,
    projects: 1,
    workerTypes: 0,
    busNeighbors: 0,
    archiveNeighbors: 0,
    managerNeighbors: 0,
  };
  if (!architectureUnlocked(s)) {
    return result;
  }
  const layout = s.pipeline.architecture.layout;
  const workerTypes = new Set<RackModuleId>();
  for (const [slot, id] of layout.entries()) {
    const def = moduleDefinition(id);
    if (!def || !moduleUnlocked(s, def.id)) {
      continue;
    }
    const adjacent = neighbors(slot).map((i) => layout[i] ?? null);
    const workers = adjacent.filter(
      (id) => moduleDefinition(id)?.station !== undefined,
    ).length;
    if (def.station !== undefined) {
      workerTypes.add(def.id);
      result.rates[def.station] +=
        (def.rate ?? 0) *
        (1 +
          adjacent.filter((id) => id === "bus" && moduleUnlocked(s, id)).length *
            RACK.busBoost);
    } else if (id === "bus") {
      result.busNeighbors = Math.max(result.busNeighbors, workers);
    } else if (id === "archive") {
      result.archiveNeighbors = Math.max(result.archiveNeighbors, workers);
      result.projects += workers * RACK.archiveBoost;
    } else if (id === "manager") {
      result.managerNeighbors = Math.max(result.managerNeighbors, workers);
      result.crew += workers * RACK.managerBoost;
    }
  }
  result.workerTypes = workerTypes.size;
  return result;
}
export const pipelineRates = (s: CareerState) => architectureEffects(s).rates;
export const sustainableRate = (s: CareerState) =>
  Math.min(...pipelineRates(s).map((rate, i) => rate * (s.pipeline.allocation[i] ?? 0)));

export function balanceArchitecture(s: CareerState): CareerState {
  if (
    !s.pipeline.architecture.autoBalance ||
    !architecturePolicyUnlocked(s, "autoBalance")
  ) {
    return s;
  }
  const budget = coreBudget(s.pipeline);
  const rates = pipelineRates(s);
  let best: PipelineAllocation = s.pipeline.allocation;
  let bestRate = -1;
  let bestDistance = Infinity;
  for (let build = 0; build <= budget; build += 1) {
    for (let verify = 0; verify <= budget - build; verify += 1) {
      const allocation: PipelineAllocation = [build, verify, budget - build - verify];
      const rate = Math.min(...allocation.map((count, i) => count * (rates[i] ?? 0)));
      const distance = allocation.reduce(
        (sum, count, i) => sum + Math.abs(count - (s.pipeline.allocation[i] ?? 0)),
        0,
      );
      if (rate > bestRate || (rate === bestRate && distance < bestDistance)) {
        best = allocation;
        bestRate = rate;
        bestDistance = distance;
      }
    }
  }
  return { ...s, pipeline: { ...s.pipeline, allocation: best } };
}
