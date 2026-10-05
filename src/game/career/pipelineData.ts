/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored balance tables, documented in 21-Pipeline_Breakthrough. */
import type {
  PipelineAllocation,
  PipelinePolicy,
  PipelineState,
  PipelineTrialId,
} from "../../types";

export const PIPELINE = {
  baseCores: 6,
  buffer: 200,
  rates: [3, 1.5, 1] as PipelineAllocation,
  maxCoreLevel: 6,
  coreCost: 25,
  coreGrowth: 3,
  hireAt: 25,
  trialsAt: 100,
  automationMs: 5000,
  bonusCores: 2,
};
export const STATIONS = ["Збірка", "Перевірка", "Деплой"] as const;
export interface TrialDefinition {
  id: PipelineTrialId;
  title: string;
  description: string;
  cores: number;
  rates: PipelineAllocation;
  allocation: PipelineAllocation;
  target: number;
  reward: string;
}
export const PIPELINE_TRIALS: readonly TrialDefinition[] = [
  {
    id: "budget",
    title: "Малий бюджет",
    description:
      "Лише чотири ядра. Знайди розподіл, у якому жоден вузол не марнує потужність.",
    cores: 4,
    rates: [3, 2, 1],
    allocation: [2, 1, 1],
    target: 60,
    reward: "+2 постійні ядра конвеєра",
  },
  {
    id: "verification",
    title: "Важка регресія",
    description: "Перевірка одного релізу стала втричі дорожчою. Звільни вузьке місце.",
    cores: 6,
    rates: [3, 0.5, 2],
    allocation: [3, 2, 1],
    target: 120,
    reward: "Автопроєкти: здавання етапів і нові бронзові сертифікати",
  },
  {
    id: "deployment",
    title: "Повільний деплой",
    description: "Сервер приймає лише пів релізу на ядро за секунду. Перебудуй конвеєр.",
    cores: 6,
    rates: [3, 2, 0.5],
    allocation: [3, 2, 1],
    target: 180,
    reward: "Автопокупка покращень і автоматичні підвищення",
  },
];
export const PIPELINE_POLICIES: readonly {
  id: PipelinePolicy;
  title: string;
  description: string;
  unlock: string;
}[] = [
  {
    id: "hire",
    title: "Автонайм",
    description: "Витрачає гроші: купує одну найдешевшу доступну одиницю команди.",
    unlock: "25 релізів",
  },
  {
    id: "projects",
    title: "Автопроєкти",
    description:
      "Здає готові етапи. Запускає наступний відкритий проєкт без бронзового сертифіката. Срібло й золото обираєш ти.",
    unlock: "Важка регресія",
  },
  {
    id: "upgrades",
    title: "Автопокращення",
    description: "Витрачає гроші: купує найдешевше доступне покращення кар’єри.",
    unlock: "Повільний деплой",
  },
  {
    id: "promote",
    title: "Автопідвищення",
    description:
      "Приймає підвищення, коли всі умови виконані. Престиж залишається твоїм рішенням.",
    unlock: "Повільний деплой",
  },
];
export const AUTOMATION_ORDER: readonly PipelinePolicy[] = [
  "promote",
  "upgrades",
  "hire",
  "projects",
];
export function newPipeline(): PipelineState {
  return {
    credits: 0,
    total: 0,
    coreLevel: 0,
    allocation: [3, 2, 1],
    queues: [0, 0],
    completed: [],
    trial: null,
    automation: { hire: false, upgrades: false, promote: false, projects: false },
  };
}
export const coreBudget = (p: PipelineState) =>
  PIPELINE.baseCores +
  p.coreLevel +
  (p.completed.includes("budget") ? PIPELINE.bonusCores : 0);
export const corePrice = (p: PipelineState) =>
  Math.ceil(PIPELINE.coreCost * PIPELINE.coreGrowth ** p.coreLevel);
export const allocatedCores = (allocation: PipelineAllocation) =>
  allocation.reduce((sum, value) => sum + value, 0);
export function policyUnlocked(p: PipelineState, id: PipelinePolicy): boolean {
  switch (id) {
    case "hire":
      return p.total >= PIPELINE.hireAt;
    case "projects":
      return p.completed.includes("verification");
    case "upgrades":
    case "promote":
      return p.completed.includes("deployment");
  }
}
