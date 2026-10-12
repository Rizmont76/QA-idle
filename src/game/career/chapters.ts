/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored rank chapters, documented in 25-Career_Chapters. */
import type { CareerState, CrewId } from "../../types";
import { CAREER_STAGES, CAREER_UPGRADES, CREW } from "./content";
import { PRODUCTS } from "./productData";
import { RESEARCH } from "./expansionData";
import { activeSpecialists, certificates } from "./studioSelectors";
import type { CareerView } from "./discovery";

export type ChapterGoal =
  | { kind: "crew"; id: CrewId; target: number }
  | {
      kind: "upgrade" | "certificates" | "products" | "research" | "contracts" | "staff";
      target: number;
    };
export interface ChapterDefinition {
  title: string;
  brief: string;
  goals: readonly ChapterGoal[];
}
export const CHAPTERS: readonly [ChapterDefinition, ...ChapterDefinition[]] = [
  {
    title: "Від першого бага до делегування",
    brief:
      "Знайди свій робочий ритм: покращення роблять тести сильнішими, а помічники працюють між кліками.",
    goals: [{ kind: "upgrade", target: 1 }],
  },
  {
    title: "Команда, якій можна довірити реліз",
    brief:
      "Збери QA-команду, увімкни автозвіти й доведи першого клієнта до релізу. Інсайти відкриють студію.",
    goals: [
      { kind: "crew", id: "squad", target: 10 },
      { kind: "certificates", target: 1 },
    ],
  },
  {
    title: "Код починає тестувати код",
    brief:
      "Освой раннери та запусти перший інструмент. Його роль — ліцензії, робота для команди чи відкритий код — обираєш ти.",
    goals: [
      { kind: "crew", id: "runner", target: 10 },
      { kind: "certificates", target: 2 },
      { kind: "products", target: 1 },
    ],
  },
  {
    title: "Власний процес, власні клієнти",
    brief:
      "Візьми контракт і розвивай дослідження студії. Команда працює над проєктом і контрактом паралельно.",
    goals: [
      { kind: "contracts", target: 3 },
      { kind: "research", target: 6 },
      { kind: "certificates", target: 3 },
    ],
  },
  {
    title: "Якість у промислових масштабах",
    brief:
      "Нові лабораторії стануть основою виробництва. Розширюй портфоліо й запроси фахівця, який посилить твій стиль гри.",
    goals: [
      { kind: "crew", id: "lab", target: 10 },
      { kind: "certificates", target: 4 },
      { kind: "staff", target: 1 },
    ],
  },
  {
    title: "Вибір: спадщина чи світовий масштаб",
    brief:
      "Перший престиж уже відкриває новий шар. Або залишайся: хмарні ферми й другий продукт підготують студію до глобальних клієнтів.",
    goals: [
      { kind: "crew", id: "cloud", target: 10 },
      { kind: "products", target: 2 },
      { kind: "certificates", target: 5 },
    ],
  },
  {
    title: "Навчи систему знаходити більше",
    brief:
      "AI-кластери підхоплюють виробництво. Поєднай три інструменти та розшир портфоліо, щоб перейти до нової інфраструктури.",
    goals: [
      { kind: "crew", id: "ai", target: 10 },
      { kind: "products", target: 3 },
      { kind: "certificates", target: 6 },
    ],
  },
  {
    title: "Релізи за межами звичного",
    brief:
      "Орбітальні лабораторії — твій новий двигун. Підготуй вісім клієнтів і чотири інструменти до власної платформи.",
    goals: [
      { kind: "crew", id: "orbital", target: 10 },
      { kind: "products", target: 4 },
      { kind: "certificates", target: 8 },
    ],
  },
  {
    title: "Твоя студія — твій стандарт",
    brief:
      "Кампанію завершено. Дев’ятий клієнт — додаткова мета; можна вдосконалювати сертифікати або почати нову кар’єру.",
    goals: [{ kind: "certificates", target: 9 }],
  },
];
export const rankMultiplier = (s: CareerState) => 2 ** s.stage;
export const currentChapter = (s: CareerState) => CHAPTERS[s.stage] ?? CHAPTERS[0];
export const researchLevels = (s: CareerState) =>
  RESEARCH.reduce((sum, r) => sum + (s.research[r.id] ?? 0), 0);
export const ownedProducts = (s: CareerState) =>
  PRODUCTS.filter((p) => (s.products.releases[p.id] ?? 0) > 0).length;
export function chapterValue(s: CareerState, goal: ChapterGoal): number {
  switch (goal.kind) {
    case "crew":
      return s.crew[goal.id];
    case "upgrade":
      return CAREER_UPGRADES.filter((u) => s.upgrades.includes(u.id)).length;
    case "certificates":
      return certificates(s);
    case "products":
      return ownedProducts(s);
    case "research":
      return researchLevels(s);
    case "contracts":
      return s.contractsCompleted;
    case "staff":
      return activeSpecialists(s).length;
  }
}
export const chapterComplete = (s: CareerState) =>
  currentChapter(s).goals.every((g) => chapterValue(s, g) >= g.target);
export const chapterCrew = (s: CareerState) =>
  currentChapter(s).goals.find(
    (g): g is Extract<ChapterGoal, { kind: "crew" }> =>
      g.kind === "crew" && chapterValue(s, g) < g.target,
  );
export function chapterRows(s: CareerState) {
  return currentChapter(s).goals.map((goal) => {
    let title: string;
    let view: CareerView = "workspace";
    switch (goal.kind) {
      case "crew":
        title = CREW.find((c) => c.id === goal.id)?.name ?? goal.id;
        break;
      case "upgrade":
        title = "Придбане покращення";
        break;
      case "certificates":
        title = "Сертифіковані клієнти";
        view = "projects";
        break;
      case "products":
        title = "Запущені інструменти";
        view = "products";
        break;
      case "research":
        title = "Рівні досліджень";
        view = "studio";
        break;
      case "contracts":
        title = "Завершені контракти";
        break;
      case "staff":
        title = "Активні фахівці";
        view = "studio";
        break;
    }
    return {
      goal,
      title,
      view,
      value: chapterValue(s, goal),
      target: goal.target,
      done: chapterValue(s, goal) >= goal.target,
    };
  });
}
export function promotionPreview(s: CareerState) {
  return CAREER_STAGES[s.stage + 1] ? { ...s, stage: s.stage + 1 } : null;
}
