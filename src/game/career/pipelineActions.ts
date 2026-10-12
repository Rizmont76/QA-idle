import { architecturePolicyUnlocked, balanceArchitecture } from "./architectureEffects";
import type { CareerAction, CareerState } from "../../types";
import type { ActionResult } from "./engine";
import {
  allocatedCores,
  coreBudget,
  corePrice,
  PIPELINE,
  PIPELINE_TRIALS,
  policyUnlocked,
} from "./pipelineData";

export function pipelineAction(state: CareerState, action: CareerAction): ActionResult {
  const fail = (message: string): ActionResult => ({ state, ok: false, message });
  if (state.careers < 1) {
    return fail("Конвеєр відкриється після першого престижу.");
  }
  const p = state.pipeline;
  let next: typeof p;
  let message = "";
  switch (action.type) {
    case "pipelineAllocate": {
      if (
        !action.trial &&
        p.architecture.autoBalance &&
        architecturePolicyUnlocked(state, "autoBalance")
      ) {
        return fail("Вимкни авторозподіл у вкладці «Архітектура».");
      }
      const def = PIPELINE_TRIALS.find((t) => t.id === p.trial?.id);
      const source = action.trial ? p.trial : p;
      if (!source || (action.trial && (!def || (p.trial?.progress ?? 0) >= def.target))) {
        return fail("Випробування не активне.");
      }
      const budget = action.trial && def ? def.cores : coreBudget(p);
      const current = source.allocation[action.station];
      if (
        !Number.isInteger(action.station) ||
        current === undefined ||
        current + action.delta < 0 ||
        allocatedCores(source.allocation) + action.delta > budget
      ) {
        return fail("Спочатку звільни ядро в іншому вузлі.");
      }
      const allocation = [...source.allocation] as typeof source.allocation;
      allocation[action.station] = current + action.delta;
      next =
        action.trial && p.trial
          ? { ...p, trial: { ...p.trial, allocation } }
          : { ...p, allocation };
      break;
    }
    case "pipelineCore": {
      const cost = corePrice(p);
      if (p.coreLevel >= PIPELINE.maxCoreLevel || p.credits < cost) {
        return fail("Потрібно більше кредитів збірки.");
      }
      next = { ...p, credits: p.credits - cost, coreLevel: p.coreLevel + 1 };
      message = p.architecture.autoBalance
        ? "+1 ядро. Авторозподіл оновлено."
        : "+1 ядро. Розподіли його між вузлами.";
      break;
    }
    case "startTrial": {
      const def = PIPELINE_TRIALS.find((t) => t.id === action.id);
      if (
        !def ||
        p.total < PIPELINE.trialsAt ||
        p.trial ||
        p.completed.includes(def.id)
      ) {
        return fail("Випробування поки недоступне.");
      }
      next = {
        ...p,
        trial: {
          id: def.id,
          allocation: [...def.allocation],
          queues: [0, 0],
          progress: 0,
          elapsed: 0,
        },
      };
      break;
    }
    case "cancelTrial":
      next = { ...p, trial: null };
      message = "Випробування скасовано. Основний конвеєр працює далі.";
      break;
    case "claimTrial": {
      const def = PIPELINE_TRIALS.find((t) => t.id === p.trial?.id);
      if (
        !def ||
        !p.trial ||
        p.trial.progress < def.target ||
        p.completed.includes(def.id)
      ) {
        return fail("Спершу заверши випробування.");
      }
      next = { ...p, completed: [...p.completed, def.id], trial: null };
      message = "Прорив! " + def.reward + ".";
      break;
    }
    case "pipelinePolicy":
      if (!policyUnlocked(p, action.id)) {
        return fail("Спочатку відкрий цю автоматизацію.");
      }
      next = { ...p, automation: { ...p.automation, [action.id]: action.enabled } };
      break;
    default:
      return fail("Невідома дія конвеєра.");
  }
  return { state: balanceArchitecture({ ...state, pipeline: next }), ok: true, message };
}
