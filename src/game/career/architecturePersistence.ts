import type { CareerState } from "../../types";
import {
  ARCHITECTURE_POLICIES,
  BLUEPRINTS,
  newArchitecture,
  RACK,
  RACK_MODULES,
} from "./architectureData";
import {
  architecturePolicyUnlocked,
  architectureUnlocked,
  balanceArchitecture,
  moduleUnlocked,
  powerBudget,
} from "./architectureEffects";
import { amount, ids, record } from "./saveValues";

export function normalizeArchitecture(s: CareerState, value: unknown): void {
  const a = newArchitecture();
  s.pipeline.architecture = a;
  if (!architectureUnlocked(s)) {
    return;
  }
  const data = record(value);
  const claims = ids(
    data["blueprints"],
    BLUEPRINTS.map((b) => b.id),
  );
  for (const def of BLUEPRINTS) {
    if (
      claims.includes(def.id) &&
      (!def.requires || a.blueprints.includes(def.requires))
    ) {
      a.blueprints.push(def.id);
    }
  }
  const level = Math.floor(amount(data["powerLevel"], RACK.powerCosts.length));
  let cost = 0;
  for (let i = 0; i < level; i += 1) {
    cost += RACK.powerCosts[i] ?? 0;
    if (cost <= s.pipeline.total) {
      a.powerLevel += 1;
    }
  }
  const layout = data["layout"];
  let power = 0;
  if (Array.isArray(layout)) {
    for (let i = 0; i < RACK.slots; i += 1) {
      const def = RACK_MODULES.find((m) => m.id === (layout[i] as unknown));
      if (def && moduleUnlocked(s, def.id) && power + def.power <= powerBudget(s)) {
        a.layout[i] = def.id;
        power += def.power;
      }
    }
  }
  for (const policy of ARCHITECTURE_POLICIES) {
    a[policy.id] = data[policy.id] === true && architecturePolicyUnlocked(s, policy.id);
  }
  s.pipeline = balanceArchitecture(s).pipeline;
}
