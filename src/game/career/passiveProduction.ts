import type { CareerState } from "../../types";
import { pipelineStep, simulatePipeline, stationCapacity } from "./pipelineFlow";
import { pipelineRates } from "./architectureEffects";
import { scriptPower } from "./productionEffects";
import { bounded, crewProduction, offlineEfficiency, production } from "./selectors";
import { CAREER_RULES } from "./content";

export function passiveProduction(s: CareerState, seconds: number) {
  const pipeline = pipelineStep(s, seconds);
  const rate = production(s);
  const power = scriptPower(s);
  let bugs = rate * seconds + power * pipeline.releaseArea;
  const room = CAREER_RULES.limit - rate;
  if (room <= 0) {
    bugs = CAREER_RULES.limit * seconds;
  } else if (power > 0 && (pipeline.state.total - s.pipeline.total) * power > room) {
    const capped = simulatePipeline(
      stationCapacity(s.pipeline.allocation, pipelineRates(s)),
      s.pipeline.queues,
      seconds,
      room / power,
    );
    bugs =
      rate * capped.elapsed +
      power * capped.releaseArea +
      CAREER_RULES.limit * (seconds - capped.elapsed);
  }
  return {
    pipeline: pipeline.state,
    bugs: bounded(bugs, CAREER_RULES.moneyLimit),
    scriptBugs: Math.max(0, bugs - crewProduction(s) * seconds),
  };
}

const SEARCH_PASSES = 40;
const BISECTION_DIVISOR = 2;
export function secondsToBugs(
  s: CareerState,
  missing: number,
  maximum: number,
  offline: boolean,
): number {
  if (missing <= 0) {
    return 0;
  }
  const efficiency = offline ? offlineEfficiency(s) : 1;
  if (passiveProduction(s, maximum * efficiency).bugs < missing) {
    return Infinity;
  }
  let low = 0;
  let high = maximum;
  for (let pass = 0; pass < SEARCH_PASSES; pass++) {
    const mid = (low + high) / BISECTION_DIVISOR;
    if (passiveProduction(s, mid * efficiency).bugs < missing) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return high;
}
