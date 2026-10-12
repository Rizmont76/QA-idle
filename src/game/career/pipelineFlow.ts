import { pipelineRates } from "./architectureEffects";
import type { CareerState, PipelineAllocation } from "../../types";
import { PIPELINE, PIPELINE_TRIALS } from "./pipelineData";
import { bounded } from "./selectors";
import { CAREER_RULES } from "./content";
import { pipelineUnlocked } from "./pipelineUnlocks";

const EPSILON = 1e-8;
const PROPAGATION_PASSES = 3;
const TRIANGLE_AREA_DIVISOR = 2;
export function flowRates(
  capacity: PipelineAllocation,
  queues: [number, number],
): PipelineAllocation {
  let [build, verify, deploy] = capacity;
  // Propagate starvation forward and backpressure backward to a fixed point.
  for (let pass = 0; pass < PROPAGATION_PASSES; pass += 1) {
    if (queues[0] <= EPSILON) {
      verify = Math.min(verify, build);
    }
    if (queues[1] <= EPSILON) {
      deploy = Math.min(deploy, verify);
    }
    if (queues[1] >= PIPELINE.buffer - EPSILON) {
      verify = Math.min(verify, deploy);
    }
    if (queues[0] >= PIPELINE.buffer - EPSILON) {
      build = Math.min(build, verify);
    }
  }
  return [build, verify, deploy];
}
export function stationCapacity(
  allocation: PipelineAllocation,
  rates: PipelineAllocation,
): PipelineAllocation {
  return [allocation[0] * rates[0], allocation[1] * rates[1], allocation[2] * rates[2]];
}
export function simulatePipeline(
  capacity: PipelineAllocation,
  initial: [number, number],
  seconds: number,
  target = Infinity,
): { queues: [number, number]; released: number; elapsed: number; releaseArea: number } {
  const queues: [number, number] = [...initial];
  let remaining = seconds;
  let released = 0;
  let elapsed = 0;
  let releaseArea = 0;
  while (remaining > EPSILON && released < target) {
    const [build, verify, deploy] = flowRates(capacity, queues);
    const change = [build - verify, verify - deploy];
    let step = Math.min(remaining, deploy > 0 ? (target - released) / deploy : Infinity);
    for (let i = 0; i < queues.length; i += 1) {
      const velocity = change[i] ?? 0;
      const queue = queues[i] ?? 0;
      if (velocity > 0) {
        step = Math.min(step, (PIPELINE.buffer - queue) / velocity);
      }
      if (velocity < 0) {
        step = Math.min(step, -queue / velocity);
      }
    }
    for (let i = 0; i < queues.length; i += 1) {
      const value = (queues[i] ?? 0) + (change[i] ?? 0) * step;
      queues[i] =
        value < EPSILON ? 0 : value > PIPELINE.buffer - EPSILON ? PIPELINE.buffer : value;
    }
    releaseArea += released * step + (deploy * step * step) / TRIANGLE_AREA_DIVISOR;
    released = Math.min(target, released + deploy * step);
    elapsed += step;
    remaining -= step;
    if (target - released < EPSILON) {
      released = target;
    }
  }
  return {
    queues,
    released,
    elapsed: released < target ? seconds : elapsed,
    releaseArea,
  };
}
export function pipelineStep(
  s: CareerState,
  seconds: number,
): { state: CareerState["pipeline"]; releaseArea: number } {
  const p = s.pipeline;
  if (!pipelineUnlocked(s)) {
    return { state: p, releaseArea: 0 };
  }
  const main = simulatePipeline(
    stationCapacity(p.allocation, pipelineRates(s)),
    p.queues,
    seconds,
    Math.max(0, CAREER_RULES.limit - p.total),
  );
  let trial = p.trial;
  const def = PIPELINE_TRIALS.find((t) => t.id === trial?.id);
  if (trial && def && trial.progress < def.target) {
    const result = simulatePipeline(
      stationCapacity(trial.allocation, def.rates),
      trial.queues,
      seconds,
      def.target - trial.progress,
    );
    trial = {
      ...trial,
      queues: result.queues,
      progress: Math.min(def.target, trial.progress + result.released),
      elapsed: bounded(trial.elapsed + result.elapsed),
    };
  }
  return {
    state: {
      ...p,
      credits: bounded(p.credits + main.released),
      total: bounded(p.total + main.released),
      queues: main.queues,
      trial,
    },
    releaseArea: main.releaseArea + main.released * (seconds - main.elapsed),
  };
}
export const advancePipeline = (s: CareerState, seconds: number) =>
  pipelineStep(s, seconds).state;
