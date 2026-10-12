import type { CareerState } from "../../types";
import { pipelineStep, simulatePipeline, stationCapacity } from "./pipelineFlow";
import { pipelineRates } from "./architectureEffects";
import { agentPower, scriptPower } from "./productionEffects";
import {
  baseProduction,
  bounded,
  crewProduction,
  offlineEfficiency,
  production,
} from "./selectors";
import { CAREER_RULES } from "./content";
import { networkStep } from "./networkFlow";

function mainProductionWork(s: CareerState, seconds: number) {
  const pipeline = pipelineStep(s, seconds);
  const rate = baseProduction(s);
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

const RATE_ROOT_PASSES = 48;
const RATE_BISECTION_DIVISOR = 2;
export function passiveProduction(s: CareerState, seconds: number) {
  const main = mainProductionWork(s, seconds);
  const network = networkStep(s, seconds);
  const power = agentPower(s);
  let bugs = main.bugs + network.generated * power;
  const at = (time: number) =>
    production({
      ...s,
      pipeline: { ...pipelineStep(s, time).state, network: networkStep(s, time).state },
    });
  if (power > 0 && production(s) >= CAREER_RULES.limit) {
    bugs = CAREER_RULES.limit * seconds;
  } else if (power > 0 && at(seconds) >= CAREER_RULES.limit && seconds > 0) {
    let high = seconds;
    let low = 0;
    // First find a relative bracket. A uniform time bracket loses tiny cap
    // boundaries when a high generator creates Agents extremely quickly.
    while (high > 0) {
      const half = high / RATE_BISECTION_DIVISOR;
      if (at(half) < CAREER_RULES.limit) {
        low = half;
        break;
      }
      high = half;
    }
    for (let pass = 0; pass < RATE_ROOT_PASSES; pass++) {
      const mid = (low + high) / RATE_BISECTION_DIVISOR;
      if (at(mid) < CAREER_RULES.limit) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const prefix =
      mainProductionWork(s, high).bugs + networkStep(s, high).generated * power;
    bugs =
      Math.min(prefix, CAREER_RULES.limit * high) + CAREER_RULES.limit * (seconds - high);
  }
  bugs = bounded(Math.min(bugs, CAREER_RULES.limit * seconds), CAREER_RULES.moneyLimit);
  return {
    ...main,
    network: network.state,
    bugs,
    agentBugs: Math.max(0, bugs - main.bugs),
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
