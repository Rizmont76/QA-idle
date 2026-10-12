/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored balance tables, documented in 21-Pipeline_Breakthrough. */
import type {
  PipelineAllocation,
  PipelinePolicy,
  PipelineState,
  PipelineTrialId,
} from "../../types";
import { newArchitecture } from "./architectureData";
import { newNetwork } from "./networkData";
import { PIPELINE_MODEL_VERSION } from "../../types";

export const PIPELINE = {
  unlockStage: 2,
  scriptRate: 0.5,
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
  stage: number;
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
    stage: 2,
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
    stage: 3,
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
    stage: 4,
    title: "Повільний деплой",
    description: "Сервер приймає лише пів релізу на ядро за секунду. Перебудуй конвеєр.",
    cores: 6,
    rates: [3, 2, 0.5],
    allocation: [3, 2, 1],
    target: 180,
    reward: "Автопокращення, підвищення й розвиток студії",
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
    description:
      "Витрачає гроші: спочатку наймає потрібних для цілі рангу виробників, потім — найдешевшу одиницю.",
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
  {
    id: "chapters",
    title: "Автостудія",
    description:
      "Витрачає гроші ТА інсайти: запускає доступні інструменти й купує дослідження. Зберігає інсайти для найближчого інструмента та ролі власних продуктів. Нагороди випробувань забираєш ти.",
    unlock: "Повільний деплой",
  },
];
export const AUTOMATION_ORDER: readonly PipelinePolicy[] = [
  "chapters",
  "promote",
  "upgrades",
  "hire",
  "projects",
];
export function newPipeline(): PipelineState {
  return {
    model: PIPELINE_MODEL_VERSION,
    credits: 0,
    total: 0,
    coreLevel: 0,
    allocation: [3, 2, 1],
    queues: [0, 0],
    completed: [],
    trial: null,
    automation: {
      hire: false,
      upgrades: false,
      promote: false,
      projects: false,
      chapters: false,
    },
    architecture: newArchitecture(),
    network: newNetwork(),
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
    case "chapters":
      return p.completed.includes("deployment");
  }
}
