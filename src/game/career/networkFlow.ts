import type { CareerState, NetworkState, NetworkUnits } from "../../types";
import { GENERATORS, NETWORK } from "./networkData";
import { networkMultiplier, networkUnlocked } from "./networkEffects";

const cap = (value: number) => Math.min(NETWORK.limit, Math.max(0, value));
// Integrate each source's contribution down the chain, including computations at -1.
// Generated units work immediately, so a fourth-degree integral is needed for output.
function chainValue(
  units: NetworkUnits,
  rates: number[],
  seconds: number,
  target: number,
) {
  let value = 0;
  for (let source = Math.max(0, target); source < units.length; source += 1) {
    let contribution = units[source] ?? 0;
    for (let level = source; level > target; level -= 1) {
      contribution *= ((rates[level] ?? 0) * seconds) / (source - level + 1);
    }
    value += contribution;
  }
  return cap(value);
}
export function advanceNetwork(s: CareerState, seconds: number): NetworkState {
  const n = s.pipeline.network;
  if (!networkUnlocked(s) || seconds <= 0) {
    return n;
  }
  const rates = GENERATORS.map((g) => g.rate * networkMultiplier(s));
  const generated = chainValue(n.units, rates, seconds, -1);
  const units = n.units.map((_, tier) =>
    chainValue(n.units, rates, seconds, tier),
  ) as NetworkUnits;
  const runTotal = cap(n.runTotal + generated);
  return {
    ...n,
    units,
    computations: cap(n.computations + generated),
    runTotal,
    best: Math.max(n.best, runTotal),
  };
}
