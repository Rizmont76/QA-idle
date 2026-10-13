import type { CareerState, NetworkProtocol, NetworkTier } from "../../types";
import { BLUEPRINTS } from "./architectureData";
import { PIPELINE_TRIALS } from "./pipelineData";
import { GENERATORS, NETWORK, NETWORK_PROTOCOLS } from "./networkData";

export const networkUnlocked = (s: CareerState) =>
  s.careers > 0 &&
  PIPELINE_TRIALS.every((t) => s.pipeline.completed.includes(t.id)) &&
  BLUEPRINTS.every((b) => s.pipeline.architecture.blueprints.includes(b.id));
export const generatorUnlocked = (s: CareerState, tier: NetworkTier) =>
  networkUnlocked(s) &&
  GENERATORS.some((g) => g.tier === tier && s.pipeline.network.best >= g.unlock);
export const networkConnectionUnlocked = (s: CareerState) =>
  networkUnlocked(s) && s.pipeline.network.upgrades.bridge > 0;
export const networkConnected = (s: CareerState) =>
  networkConnectionUnlocked(s) && s.pipeline.network.linked;
export const generatorPrice = (s: CareerState, tier: NetworkTier) =>
  Math.ceil(
    (GENERATORS.find((g) => g.tier === tier)?.price ?? Infinity) *
      NETWORK.growth ** s.pipeline.network.purchased[tier],
  );
export const networkMultiplier = (s: CareerState) =>
  networkUnlocked(s)
    ? 1 +
      s.pipeline.network.reboots * NETWORK.rebootBonus +
      s.pipeline.network.upgrades.cascade *
        (NETWORK_PROTOCOLS.find((p) => p.id === "cascade")?.bonus ?? 0)
    : 1;
export const networkBridge = (s: CareerState) =>
  networkUnlocked(s)
    ? 1 +
      s.pipeline.network.upgrades.bridge *
        (NETWORK_PROTOCOLS.find((p) => p.id === "bridge")?.bonus ?? 0)
    : 1;
export const rebootReward = (s: CareerState) =>
  networkUnlocked(s)
    ? Math.floor(Math.sqrt(s.pipeline.network.runTotal / NETWORK.rebootAt))
    : 0;
export const protocolPrice = (s: CareerState, id: NetworkProtocol) =>
  NETWORK_PROTOCOLS.find((p) => p.id === id)?.costs[s.pipeline.network.upgrades[id]];
export const networkAutomationActive = (s: CareerState) =>
  networkUnlocked(s) &&
  s.pipeline.network.upgrades.autobuy > 0 &&
  s.pipeline.network.autoBuy;
export const computationRate = (s: CareerState) =>
  networkUnlocked(s)
    ? s.pipeline.network.units[0] * (GENERATORS[0]?.rate ?? 0) * networkMultiplier(s)
    : 0;
export const agentGenerationRate = (s: CareerState) =>
  networkUnlocked(s) && s.pipeline.network.units[0] < NETWORK.limit
    ? s.pipeline.network.units[1] * (GENERATORS[1]?.rate ?? 0) * networkMultiplier(s)
    : 0;
export function networkDiscovery(s: CareerState) {
  const n = s.pipeline.network;
  if (networkConnectionUnlocked(s) && !networkConnected(s)) {
    return {
      title: "Агенти → реальне тестування студії",
      detail:
        "Підключи мережу: генератори нарощуватимуть виробництво багів, а не лише обчислень.",
      value: 1,
      target: 1,
      action: "Підключити агентів",
    };
  }
  const next = GENERATORS.find((g) => n.best < g.unlock);
  if (next) {
    return {
      title: `${String(next.unlock)} обчислень → ${next.title}`,
      detail:
        next.title +
        " створюють " +
        next.produces +
        ". Вищі ланки розганяють усю мережу.",
      value: n.best,
      target: next.unlock,
      action: "Розвивати мережу",
    };
  }
  if (n.reboots === 0) {
    return {
      title: "Перезапуск мережі → постійні протоколи",
      detail:
        "Обери момент перезапуску: більше обчислень дає більше протоколів. Кар’єра й архітектура працюють далі.",
      value: n.runTotal,
      target: NETWORK.rebootAt,
      action: "Обрати перший протокол",
    };
  }
  const protocol = NETWORK_PROTOCOLS.find((p) => n.upgrades[p.id] < p.costs.length);
  if (protocol) {
    return {
      title: "Протоколи → нові можливості мережі",
      detail:
        "Каскад розганяє генератори, платформа посилює попередні системи, саморозвиток автоматизує покупки. Обирай напрям.",
      value: n.protocols,
      target: protocolPrice(s, protocol.id) ?? 1,
      action: "Обрати розвиток",
    };
  }
  return {
    title: "Повна мережа під твоїм керуванням",
    detail:
      "Усі протоколи розвинені. Прискорюй повторні запуски та заверши золоті сертифікації кампанії.",
    value: NETWORK_PROTOCOLS.length,
    target: NETWORK_PROTOCOLS.length,
    action: "Керувати мережею",
  };
}
