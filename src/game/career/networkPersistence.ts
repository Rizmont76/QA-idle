import type { CareerState } from "../../types";
import { GENERATORS, NETWORK, NETWORK_PROTOCOLS, newNetwork } from "./networkData";
import { networkUnlocked } from "./networkEffects";
import { amount, record } from "./saveValues";

export function normalizeNetwork(s: CareerState, value: unknown): void {
  const n = newNetwork();
  s.pipeline.network = n;
  if (!networkUnlocked(s)) {
    return;
  }
  const data = record(value);
  n.runTotal = amount(data["runTotal"]);
  n.best = Math.max(n.runTotal, amount(data["best"]));
  const maximumReward = Math.floor(Math.sqrt(n.best / NETWORK.rebootAt));
  n.reboots = maximumReward > 0 ? Math.floor(amount(data["reboots"])) : 0;
  n.totalProtocols = Math.floor(
    amount(data["totalProtocols"], Math.min(NETWORK.limit, n.reboots * maximumReward)),
  );
  n.reboots = Math.min(n.reboots, n.totalProtocols);
  const upgrades = record(data["upgrades"]);
  let spentProtocols = 0;
  for (const protocol of NETWORK_PROTOCOLS) {
    const level = Math.floor(amount(upgrades[protocol.id], protocol.costs.length));
    for (let i = 0; i < level; i += 1) {
      const cost = protocol.costs[i] ?? 0;
      if (spentProtocols + cost > n.totalProtocols) {
        break;
      }
      spentProtocols += cost;
      n.upgrades[protocol.id] += 1;
    }
  }
  n.protocols = Math.floor(amount(data["protocols"], n.totalProtocols - spentProtocols));
  n.autoBuy = n.upgrades.autobuy > 0 && data["autoBuy"] === true;
  const units = Array.isArray(data["units"]) ? (data["units"] as unknown[]) : [];
  const purchased = Array.isArray(data["purchased"])
    ? (data["purchased"] as unknown[])
    : [];
  let spentComputations = 0;
  for (const generator of GENERATORS) {
    if (n.best < generator.unlock) {
      continue;
    }
    const count = Math.floor(amount(purchased[generator.tier], NETWORK.purchaseLimit));
    for (let i = 0; i < count; i += 1) {
      const price = Math.ceil(generator.price * NETWORK.growth ** i);
      if (spentComputations + price > n.runTotal) {
        break;
      }
      spentComputations += price;
      n.purchased[generator.tier] += 1;
    }
    n.units[generator.tier] = Math.max(
      n.units[generator.tier] + n.purchased[generator.tier],
      amount(units[generator.tier]),
    );
  }
  n.computations = amount(data["computations"], n.runTotal - spentComputations);
}
