import type { BlueprintId, CareerAction, CareerState } from "../../types";
import type { ActionResult } from "./engine";
import { BLUEPRINTS, RACK } from "./architectureData";
import {
  architectureEffects,
  architecturePolicyUnlocked,
  architectureUnlocked,
  balanceArchitecture,
  moduleUnlocked,
  powerBudget,
  powerUsed,
  sustainableRate,
} from "./architectureEffects";

export function blueprintProgress(s: CareerState, id: BlueprintId): number {
  if (!architectureUnlocked(s)) {
    return 0;
  }
  const e = architectureEffects(s);
  switch (id) {
    case "cycle":
      return e.workerTypes;
    case "bus":
      return e.busNeighbors;
    case "flow":
      return sustainableRate(s);
    case "studio":
      return Math.min(e.archiveNeighbors, e.managerNeighbors);
  }
}
export function blueprintReady(s: CareerState, id: BlueprintId): boolean {
  const def = BLUEPRINTS.find((b) => b.id === id);
  return (
    architectureUnlocked(s) &&
    !!def &&
    !s.pipeline.architecture.blueprints.includes(id) &&
    (!def.requires || s.pipeline.architecture.blueprints.includes(def.requires)) &&
    blueprintProgress(s, id) >= def.target
  );
}
export function architectureAction(s: CareerState, action: CareerAction): ActionResult {
  const fail = (message: string): ActionResult => ({ state: s, ok: false, message });
  if (!architectureUnlocked(s)) {
    return fail("Забери нагороди всіх трьох випробувань.");
  }
  const a = s.pipeline.architecture;
  let next: typeof a;
  let credits = s.pipeline.credits;
  let message = "";
  switch (action.type) {
    case "rackModule": {
      if (
        !Number.isInteger(action.slot) ||
        action.slot < 0 ||
        action.slot >= RACK.slots ||
        (action.id !== null && !moduleUnlocked(s, action.id))
      ) {
        return fail("Цей модуль ще не відкрито.");
      }
      const layout = [...a.layout];
      layout[action.slot] = action.id;
      if (powerUsed(layout) > powerBudget(s)) {
        return fail("Бракує живлення. Звільни місце або розшир шафу.");
      }
      next = { ...a, layout };
      break;
    }
    case "rackPower": {
      const cost = RACK.powerCosts[a.powerLevel];
      if (cost === undefined || credits < cost) {
        return fail("Потрібно більше кредитів збірки.");
      }
      credits -= cost;
      next = { ...a, powerLevel: a.powerLevel + 1 };
      message = "+1 живлення шафи назавжди.";
      break;
    }
    case "claimBlueprint": {
      const def = BLUEPRINTS.find((b) => b.id === action.id);
      if (!def || !blueprintReady(s, def.id)) {
        return fail("Спочатку виконай умову креслення.");
      }
      next = { ...a, blueprints: [...a.blueprints, def.id] };
      message = "Відкриття! " + def.reward + ".";
      break;
    }
    case "architecturePolicy":
      if (!architecturePolicyUnlocked(s, action.id)) {
        return fail("Спочатку відкрий цю автоматизацію.");
      }
      next = { ...a, [action.id]: action.enabled };
      break;
    default:
      return fail("Невідома дія архітектури.");
  }
  return {
    state: balanceArchitecture({
      ...s,
      pipeline: { ...s.pipeline, credits, architecture: next },
    }),
    ok: true,
    message,
  };
}
