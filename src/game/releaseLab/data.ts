/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored release and generator rules, documented in 29-Release_Lab_Experiment. */
import type { LabProducer, ReleaseLabState } from "../../types";

export const LAB = {
  key: "qa-idle-release-lab-v1",
  limit: 1e15,
  patterns: 1e6,
  purchases: 100,
  efficiencyLevels: 5,
  efficiencyCost: 60,
  efficiencyGrowth: 5,
  click: 3,
  resetReports: 9,
  releaseWork: 300,
  complexityGrowth: 2.5,
  complexityExponent: 32,
  caseRate: 0.12,
  caseOutput: 0.25,
  ciRate: 0.05,
  autoMs: 5000,
  milliseconds: 1000,
  offlineSeconds: 28_800,
  tickMs: 250,
} as const;
export const LAB_PRODUCERS: readonly {
  id: LabProducer;
  title: string;
  cost: number;
  growth: number;
  unlock: number;
  symbol: string;
}[] = [
  { id: "testers", title: "Тестувальник", cost: 9, growth: 1.22, unlock: 0, symbol: "◉" },
  { id: "scripts", title: "Скрипт", cost: 1200, growth: 1.5, unlock: 3, symbol: "</>" },
  { id: "ci", title: "CI-вузол", cost: 60000, growth: 1.7, unlock: 12, symbol: "⬡" },
];
export const LAB_DISCOVERIES = [
  {
    at: 1,
    title: "Код, який можна використати знову",
    detail: "Перший реліз дасть ×4 силу наступній збірці.",
  },
  {
    at: 3,
    title: "Тести почнуть писати тести",
    detail: "Скрипти створюватимуть нові продуктивні тест-кейси без покупок.",
  },
  {
    at: 8,
    title: "Освоєні покупки працюватимуть самі",
    detail: "Можна буде доручити лабораторії купівлю виробників.",
  },
  {
    at: 12,
    title: "Фабрика тестування",
    detail: "CI-вузли створюватимуть скрипти. Ланцюжок почне розганяти сам себе.",
  },
] as const;
export const patternPower = (patterns: number) => (1 + patterns) ** 2;
export const outputPower = (s: ReleaseLabState) =>
  patternPower(s.patterns) * 2 ** s.efficiency;
export const efficiencyPower = (s: ReleaseLabState) => 2 ** s.efficiency;
export const nextLabDiscovery = (s: ReleaseLabState) =>
  LAB_DISCOVERIES.find((d) => s.patterns < d.at);
export const labProducerUnlocked = (s: ReleaseLabState, id: LabProducer) =>
  LAB_PRODUCERS.some((p) => p.id === id && s.patterns >= p.unlock);
export const labPrice = (s: ReleaseLabState, id: LabProducer) => {
  const p = LAB_PRODUCERS.find((p) => p.id === id);
  return p ? Math.ceil(p.cost * p.growth ** s.bought[id]) : Infinity;
};
export const efficiencyPrice = (s: ReleaseLabState) =>
  Math.ceil(LAB.efficiencyCost * LAB.efficiencyGrowth ** s.efficiency);
export function labBatchQuote(s: ReleaseLabState, id: LabProducer) {
  let count = 0;
  let cost = 0;
  const p = LAB_PRODUCERS.find((producer) => producer.id === id);
  if (!p || !labProducerUnlocked(s, id)) {
    return { count, cost };
  }
  while (s.bought[id] + count < LAB.purchases) {
    const price = Math.ceil(p.cost * p.growth ** (s.bought[id] + count));
    if (cost + price > s.reports) {
      break;
    }
    cost += price;
    count++;
  }
  return { count, cost };
}
export const labRate = (s: ReleaseLabState) =>
  outputPower(s) *
  (s.testers + (labProducerUnlocked(s, "scripts") ? s.cases * LAB.caseOutput : 0));
export const releaseWork = (s: ReleaseLabState) =>
  Math.min(
    LAB.limit,
    LAB.releaseWork *
      LAB.complexityGrowth ** Math.min(s.patterns, LAB.complexityExponent),
  );
export const releaseGain = (s: ReleaseLabState) =>
  Math.min(Math.floor(Math.sqrt(s.buildWork / releaseWork(s))), releaseRewardCap(s));
export const autoUnlocked = (s: ReleaseLabState) =>
  s.patterns >= (LAB_DISCOVERIES.find((d) => d.at === 8)?.at ?? Infinity);
export const releaseRewardCap = (s: ReleaseLabState) =>
  Math.min(
    (nextLabDiscovery(s)?.at ?? LAB.patterns) - s.patterns,
    Math.floor(Math.sqrt(LAB.limit / releaseWork(s))),
  );
export const nextRewardWork = (s: ReleaseLabState) =>
  releaseWork(s) *
  Math.min(Math.max(1, releaseGain(s) + 1), Math.max(1, releaseRewardCap(s))) ** 2;
