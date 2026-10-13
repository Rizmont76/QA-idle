import type { CareerState, NetworkState, NetworkUnits } from "../../types";
import { GENERATORS, NETWORK } from "./networkData";
import { networkMultiplier, networkUnlocked } from "./networkEffects";

const cap = (value: number) => Math.min(NETWORK.limit, Math.max(0, value));
const ROOT_PASSES = 48;
const BISECTION_DIVISOR = 2;

// Each source's contribution is a polynomial down the chain. Target -1 is
// physical Agent work, even when the spendable computation balance is full.
function chainTerms(units: NetworkUnits, rates: number[], target: number) {
  return units.slice(Math.max(0, target)).map((unit, offset) => {
    const source = Math.max(0, target) + offset;
    let coefficient = unit;
    for (let level = source; level > target; level--) {
      coefficient *= (rates[level] ?? 0) / (source - level + 1);
    }
    return { coefficient, degree: source - target };
  });
}
const valueAt = (terms: ReturnType<typeof chainTerms>, seconds: number) =>
  terms.reduce((sum, term) => sum + term.coefficient * seconds ** term.degree, 0);

function capTime(terms: ReturnType<typeof chainTerms>, maximum: number) {
  const missing = NETWORK.limit - valueAt(terms, 0);
  // A single positive term bounds the root from above; use that bracket to
  // remain precise even with huge multipliers and tiny saturation times.
  let high = Math.min(
    maximum,
    ...terms
      .filter((t) => t.degree > 0 && t.coefficient > 0)
      .map((t) => (missing / t.coefficient) ** (1 / t.degree)),
  );
  let low = 0;
  for (let pass = 0; pass < ROOT_PASSES; pass++) {
    const mid = (low + high) / BISECTION_DIVISOR;
    if (valueAt(terms, mid) < NETWORK.limit) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return high;
}

export function networkStep(
  s: CareerState,
  seconds: number,
): { state: NetworkState; generated: number } {
  const n = s.pipeline.network;
  if (!networkUnlocked(s) || !Number.isFinite(seconds) || seconds <= 0) {
    return { state: n, generated: 0 };
  }
  let units = n.units.map(cap) as NetworkUnits;
  let remaining = seconds;
  let generated = 0;
  const baseRates = GENERATORS.map((g) => g.rate * networkMultiplier(s));
  while (remaining > 0) {
    // A saturated tier stops receiving new units but keeps producing below it.
    const rates = baseRates.map((rate, source) =>
      source > 0 && (units[source - 1] ?? 0) >= NETWORK.limit ? 0 : rate,
    );
    const polynomials = units.map((_, tier) => chainTerms(units, rates, tier));
    let step = remaining;
    let saturated = -1;
    for (let tier = 0; tier < units.length; tier++) {
      const terms = polynomials[tier];
      if (
        !terms ||
        (units[tier] ?? 0) >= NETWORK.limit ||
        valueAt(terms, remaining) < NETWORK.limit
      ) {
        continue;
      }
      const boundary = capTime(terms, remaining);
      if (boundary <= step) {
        step = boundary;
        saturated = tier;
      }
    }
    generated += valueAt(chainTerms(units, rates, -1), step);
    units = polynomials.map((terms) => cap(valueAt(terms, step))) as NetworkUnits;
    if (saturated >= 0) {
      units[saturated] = NETWORK.limit;
    }
    remaining = Math.max(0, remaining - step);
  }
  const runTotal = cap(n.runTotal + generated);
  return {
    state: {
      ...n,
      units,
      computations: cap(n.computations + generated),
      runTotal,
      best: Math.max(n.best, runTotal),
    },
    generated,
  };
}
export const advanceNetwork = (s: CareerState, seconds: number) =>
  networkStep(s, seconds).state;
