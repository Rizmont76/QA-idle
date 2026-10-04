import type { CareerState, PipelineAllocation, PipelineTrialId } from "../../types";
import { amount, ids, record } from "./saveValues";
import {
  allocatedCores,
  coreBudget,
  newPipeline,
  PIPELINE,
  PIPELINE_POLICIES,
  PIPELINE_TRIALS,
  policyUnlocked,
} from "./pipelineData";

function allocation(
  value: unknown,
  budget: number,
  fallback: PipelineAllocation,
): PipelineAllocation {
  if (
    !Array.isArray(value) ||
    value.length !== fallback.length ||
    value.some(
      (n: unknown) =>
        typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > budget,
    )
  ) {
    return [...fallback];
  }
  const result: PipelineAllocation = [
    Number(value[0]),
    Number(value[1]),
    Number(value[2]),
  ];
  return allocatedCores(result) <= budget ? result : [...fallback];
}
function queues(value: unknown): [number, number] {
  return Array.isArray(value)
    ? [amount(value[0], PIPELINE.buffer), amount(value[1], PIPELINE.buffer)]
    : [0, 0];
}
export function normalizePipeline(s: CareerState, value: unknown): void {
  const p = newPipeline();
  s.pipeline = p;
  if (s.careers < 1) {
    return;
  }
  const data = record(value);
  p.total = amount(data["total"]);
  p.credits = amount(data["credits"], p.total);
  p.coreLevel = Math.floor(amount(data["coreLevel"], PIPELINE.maxCoreLevel));
  let spent = 0;
  for (let level = 0; level < p.coreLevel; level += 1) {
    spent += Math.ceil(PIPELINE.coreCost * PIPELINE.coreGrowth ** level);
    if (spent > p.total) {
      p.coreLevel = level;
      break;
    }
  }
  p.completed =
    p.total >= PIPELINE.trialsAt
      ? (ids(
          data["completed"],
          PIPELINE_TRIALS.map((t) => t.id),
        ) as PipelineTrialId[])
      : [];
  p.allocation = allocation(data["allocation"], coreBudget(p), p.allocation);
  p.queues = queues(data["queues"]);
  const trial = record(data["trial"]);
  const def = PIPELINE_TRIALS.find((t) => t.id === trial["id"]);
  if (p.total >= PIPELINE.trialsAt && def && !p.completed.includes(def.id)) {
    p.trial = {
      id: def.id,
      allocation: allocation(trial["allocation"], def.cores, def.allocation),
      queues: queues(trial["queues"]),
      progress: amount(trial["progress"], def.target),
      elapsed: amount(trial["elapsed"]),
    };
  }
  const policies = record(data["automation"]);
  for (const policy of PIPELINE_POLICIES) {
    p.automation[policy.id] =
      policyUnlocked(p, policy.id) && policies[policy.id] === true;
  }
}
