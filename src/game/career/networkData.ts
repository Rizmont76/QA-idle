/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored generator balance, documented in 23-Network_Generators and 27-Connected_Late_Frontiers. */
import type { NetworkProtocol, NetworkState, NetworkTier } from "../../types";

export const NETWORK = {
  growth: 1.6,
  purchaseLimit: 40,
  rebootAt: 2000,
  rebootBonus: 0.25,
  limit: 1e15,
  agentBugs: 100,
};
export const GENERATORS: readonly {
  tier: NetworkTier;
  title: string;
  icon: string;
  produces: string;
  rate: number;
  price: number;
  unlock: number;
}[] = [
  {
    tier: 0,
    title: "Агенти",
    icon: "◉",
    produces: "обчислень",
    rate: 1,
    price: 10,
    unlock: 0,
  },
  {
    tier: 1,
    title: "Планувальники",
    icon: "⌘",
    produces: "агентів",
    rate: 0.04,
    price: 80,
    unlock: 80,
  },
  {
    tier: 2,
    title: "Кластери",
    icon: "⬡",
    produces: "планувальників",
    rate: 0.015,
    price: 1200,
    unlock: 800,
  },
  {
    tier: 3,
    title: "Регіони",
    icon: "◎",
    produces: "кластерів",
    rate: 0.005,
    price: 20000,
    unlock: 8000,
  },
];
export const NETWORK_PROTOCOLS: readonly {
  id: NetworkProtocol;
  title: string;
  icon: string;
  costs: readonly number[];
  description: string;
  bonus: number;
}[] = [
  {
    id: "cascade",
    title: "Каскад",
    icon: "↳",
    costs: [1, 2, 4],
    bonus: 0.5,
    description:
      "+50% до швидкості всіх генераторів за рівень. Вищі ланки швидше створюють нижчі.",
  },
  {
    id: "bridge",
    title: "Єдина платформа",
    icon: "╋",
    costs: [1, 2, 4],
    bonus: 0.25,
    description:
      "+25% до конвеєра, виробництва й роботи проєктів за рівень. Перший рівень дозволяє підключити агентів до тестування студії.",
  },
  {
    id: "autobuy",
    title: "Саморозвиток",
    icon: "↻",
    costs: [1],
    bonus: 0,
    description:
      "Відкриває автопокупку генераторів. Найвища доступна ланка має пріоритет; обчислення витрачаються.",
  },
];
export function newNetwork(): NetworkState {
  return {
    computations: 0,
    runTotal: 0,
    best: 0,
    units: [1, 0, 0, 0],
    purchased: [0, 0, 0, 0],
    reboots: 0,
    protocols: 0,
    totalProtocols: 0,
    upgrades: { cascade: 0, bridge: 0, autobuy: 0 },
    autoBuy: false,
    linked: false,
  };
}
export const rebootNetworkState = (n: NetworkState, reward: number): NetworkState => ({
  ...newNetwork(),
  best: n.best,
  reboots: Math.min(NETWORK.limit, n.reboots + 1),
  protocols: Math.min(NETWORK.limit, n.protocols + reward),
  totalProtocols: Math.min(NETWORK.limit, n.totalProtocols + reward),
  upgrades: { ...n.upgrades },
  autoBuy: n.autoBuy,
  linked: n.linked,
});
