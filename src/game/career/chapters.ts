/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored capability chapters, documented in 26-Early_Breakthroughs. */
import type { CareerState, CrewId } from "../../types";
import { CAREER_STAGES, CAREER_UPGRADES, CREW } from "./content";
import { PRODUCTS } from "./productData";
import { RESEARCH } from "./expansionData";
import { activeSpecialists, certificates } from "./studioSelectors";
import type { CareerView } from "./discovery";
import { legacyGoals } from "./legacyChapters";

export type ChapterGoal =
  | { kind: "crew"; id: CrewId; target: number }
  | {
      kind:
        | "upgrade"
        | "certificates"
        | "products"
        | "research"
        | "contracts"
        | "staff"
        | "pipeline"
        | "trials";
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
      "Звіти вже здаються самі. Доведи першого клієнта до релізу: він відкриє інструмент, а Senior — конвеєр автотестів.",
    goals: [{ kind: "certificates", target: 1 }],
  },
  {
    title: "Код починає тестувати код",
    brief:
      "Кожен реліз CI/CD створює автотест, який знаходить баги без тебе. Раннери прискорюють перевірку; інструменти для команди — весь потік.",
    goals: [{ kind: "pipeline", target: 100 }],
  },
  {
    title: "Власний процес, власні клієнти",
    brief:
      "Важка регресія відкриває автопроєкти. Обери випробування, перебудуй потік і делегуй роботу, яку вже освоїв.",
    goals: [{ kind: "trials", target: 1 }],
  },
  {
    title: "Якість у промислових масштабах",
    brief:
      "Лабораторії прискорюють деплой. Нове випробування відкриває автопокупки й підвищення; Director — престиж і наступний шар.",
    goals: [{ kind: "trials", target: 2 }],
  },
  {
    title: "Вибір: спадщина чи світовий масштаб",
    brief:
      "Автотести залишаться після престижу й підхоплять нову кар’єру. Три нагороди випробувань і перший престиж відкриють серверну шафу.",
    goals: [],
  },
  {
    title: "Навчи систему знаходити більше",
    brief:
      "AI-кластери прискорюють усі вузли конвеєра. Обери між заробітком на автотестах, створенням нових та інсайтами для досліджень.",
    goals: [],
  },
  {
    title: "Релізи за межами звичного",
    brief:
      "Орбітальні лабораторії прискорюють весь потік. Поєднуй інструменти та дослідження, щоб вийти на масштаб власної платформи.",
    goals: [],
  },
  {
    title: "Твоя студія — твій стандарт",
    brief:
      "Кампанію завершено. Дев’ятий клієнт — додаткова мета; можна вдосконалювати сертифікати або почати нову кар’єру.",
    goals: [{ kind: "certificates", target: 9 }],
  },
];
export const rankMultiplier = (s: CareerState) => 2 ** s.stage;
export const currentChapter = (s: CareerState) => {
  const chapter = CHAPTERS[s.stage] ?? CHAPTERS[0];
  return s.pipeline.model === 1 ? { ...chapter, goals: legacyGoals(s.stage) } : chapter;
};
export const researchLevels = (s: CareerState) =>
  RESEARCH.reduce((sum, r) => sum + (s.research[r.id] ?? 0), 0);
export const ownedProducts = (s: CareerState) =>
  PRODUCTS.filter((p) => (s.products.releases[p.id] ?? 0) > 0).length;
export function chapterValue(s: CareerState, goal: ChapterGoal): number {
  switch (goal.kind) {
    case "pipeline":
      return s.pipeline.total;
    case "trials":
      return s.pipeline.completed.length;
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
      case "pipeline":
        title = "Автотести з релізів CI/CD";
        view = "pipeline";
        break;
      case "trials":
        title = "Прориви з випробувань";
        view = "pipeline";
        break;
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
  return CAREER_STAGES[s.stage + 1]
    ? {
        ...s,
        stage: s.stage + 1,
        bestStage: Math.max(s.bestStage, s.stage + 1),
        upgrades: s.upgrades.includes("auto") ? s.upgrades : [...s.upgrades, "auto"],
      }
    : null;
}
