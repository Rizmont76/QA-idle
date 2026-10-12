import type { CareerAction, CareerState, NetworkUnits } from "../../types";
import type { ActionResult } from "./engine";
import { GENERATORS, NETWORK, newNetwork } from "./networkData";
import {
  generatorPrice,
  generatorUnlocked,
  networkAutomationActive,
  networkUnlocked,
  protocolPrice,
  rebootReward,
} from "./networkEffects";
import { balanceArchitecture } from "./architectureEffects";

export function networkAction(s: CareerState, action: CareerAction): ActionResult {
  const fail = (message: string): ActionResult => ({ state: s, ok: false, message });
  if (!networkUnlocked(s)) {
    return fail("Спочатку забери нагороди всіх чотирьох креслень.");
  }
  const n = s.pipeline.network;
  let next: typeof n;
  let message = "";
  switch (action.type) {
    case "networkBuy": {
      const price = generatorPrice(s, action.tier);
      if (
        !generatorUnlocked(s, action.tier) ||
        n.purchased[action.tier] >= NETWORK.purchaseLimit ||
        n.computations < price
      ) {
        return fail("Потрібно більше обчислень або відкриття цієї ланки.");
      }
      const units = [...n.units] as NetworkUnits;
      const purchased = [...n.purchased] as NetworkUnits;
      units[action.tier] = Math.min(NETWORK.limit, units[action.tier] + 1);
      purchased[action.tier] += 1;
      next = { ...n, units, purchased, computations: n.computations - price };
      break;
    }
    case "networkReboot": {
      const reward = rebootReward(s);
      if (reward < 1) {
        return fail("Перезапуск відкриється після 2000 обчислень за запуск.");
      }
      next = {
        ...newNetwork(),
        best: n.best,
        reboots: Math.min(NETWORK.limit, n.reboots + 1),
        protocols: Math.min(NETWORK.limit, n.protocols + reward),
        totalProtocols: Math.min(NETWORK.limit, n.totalProtocols + reward),
        upgrades: { ...n.upgrades },
        autoBuy: n.autoBuy,
      };
      message = `+${String(reward)} ⌬. Обери постійний розвиток мережі.`;
      break;
    }
    case "networkProtocol": {
      const price = protocolPrice(s, action.id);
      if (price === undefined || n.protocols < price) {
        return fail("Потрібно більше протоколів.");
      }
      next = {
        ...n,
        protocols: n.protocols - price,
        upgrades: { ...n.upgrades, [action.id]: n.upgrades[action.id] + 1 },
      };
      message = "Постійний протокол активовано.";
      break;
    }
    case "networkAuto":
      if (n.upgrades.autobuy < 1) {
        return fail("Спочатку відкрий протокол «Саморозвиток».");
      }
      next = { ...n, autoBuy: action.enabled };
      break;
    default:
      return fail("Невідома дія мережі.");
  }
  return {
    state: balanceArchitecture({ ...s, pipeline: { ...s.pipeline, network: next } }),
    ok: true,
    message,
  };
}
export function networkAutomationIntent(s: CareerState): CareerAction | null {
  if (!networkAutomationActive(s)) {
    return null;
  }
  const generator = [...GENERATORS]
    .reverse()
    .find(
      (g) =>
        generatorUnlocked(s, g.tier) &&
        s.pipeline.network.purchased[g.tier] < NETWORK.purchaseLimit &&
        s.pipeline.network.computations >= generatorPrice(s, g.tier),
    );
  return generator ? { type: "networkBuy", tier: generator.tier } : null;
}
