import type { CareerState, CrewId } from "../../types";
import { CAREER_SAVE_VERSION } from "../../types";

export const CAREER_RULES = {
  version: CAREER_SAVE_VERSION,
  saveKey: "qa-idle-career-v3",
  legacyKey: "qa-idle-save-v1",
  limit: 1e15,
  experienceLimit: 1e6,
  crewLimit: 100,
  costGrowth: 1.3,
  offlineSeconds: 28_800,
  extendedOfflineSeconds: 57_600,
  offlineEfficiency: 0.75,
  experienceBonus: 0.25,
  badgeBonus: 0.02,
  clickRateShare: 0.15,
  prestigeThreshold: 2_500_000,
  prestigeBase: 5,
  repeatCapital: 50,
  contractStage: 3,
  contractScale: 10,
  milliseconds: 1_000,
  tickMs: 250,
  saveMs: 5_000,
  sleepThresholdMs: 10_000,
  returnSummarySeconds: 30,
} as const;

export const CAREER_STAGES = [
  {
    title: "Junior QA",
    label: "Знайди свій перший баг",
    earned: 0,
    crew: 0,
    value: 1,
    unlock: "Ручне тестування та перший помічник",
    short: "Перші кроки",
    color: "mint",
  },
  {
    title: "Middle QA",
    label: "Більше не працюєш наодинці",
    earned: 150,
    crew: 3,
    value: 1.2,
    unlock: "QA-команда й автоматичні звіти",
    short: "Делегування",
    color: "blue",
  },
  {
    title: "Senior QA",
    label: "Нехай код тестує код",
    earned: 2_500,
    crew: 8,
    value: 1.5,
    unlock: "Автотести та паралельні запуски",
    short: "Автоматизація",
    color: "violet",
  },
  {
    title: "QA Lead",
    label: "Твоя команда. Твої релізи.",
    earned: 35_000,
    crew: 15,
    value: 2,
    unlock: "Контракти з додатковими винагородами",
    short: "Власні проєкти",
    color: "amber",
  },
  {
    title: "Head of QA",
    label: "Якість у промислових масштабах",
    earned: 350_000,
    crew: 25,
    value: 2.5,
    unlock: "QA-лабораторії та спостережуваність",
    short: "Масштабування",
    color: "pink",
  },
  {
    title: "Director",
    label: "Твій досвід тепер працює на тебе",
    earned: 2_500_000,
    crew: 40,
    value: 3,
    unlock: "Нова кар’єра з постійним бонусом",
    short: "Спадщина",
    color: "mint",
  },
] as const;

export interface CrewDefinition {
  id: CrewId;
  name: string;
  description: string;
  tag: string;
  cost: number;
  rate: number;
  stage: number;
  symbol: string;
}
export const CREW: readonly CrewDefinition[] = [
  {
    id: "assistant",
    name: "QA-помічник",
    description: "Помічає те, що ти вже перестав бачити.",
    tag: "ЛЮДИ",
    cost: 25,
    rate: 0.5,
    stage: 0,
    symbol: "01",
  },
  {
    id: "squad",
    name: "QA-команда",
    description: "П’ятеро тестують. Один питає: «А якщо…?»",
    tag: "КОМАНДА",
    cost: 350,
    rate: 2,
    stage: 1,
    symbol: "02",
  },
  {
    id: "runner",
    name: "Автотест-раннер",
    description: "Не п’є каву. Не пропускає регресію.",
    tag: "АВТОМАТИЗАЦІЯ",
    cost: 6_000,
    rate: 8,
    stage: 2,
    symbol: "03",
  },
  {
    id: "lab",
    name: "QA-лабораторія",
    description: "Тисячі пристроїв. Мільйони способів зламатися.",
    tag: "ІНФРАСТРУКТУРА",
    cost: 100_000,
    rate: 50,
    stage: 4,
    symbol: "04",
  },
];
const FIRST_MILESTONE = 10;
const SECOND_MILESTONE = 25;
const THIRD_MILESTONE = 50;
export const CREW_MILESTONES = [
  FIRST_MILESTONE,
  SECOND_MILESTONE,
  THIRD_MILESTONE,
] as const;
export const MILESTONE_MULTIPLIER = 2;

export interface CareerUpgrade {
  id: string;
  title: string;
  description: string;
  cost: number;
  stage: number;
  effect: "clickFlat" | "click" | "production" | "report" | "auto" | "offline";
  value: number;
  icon: string;
}
export const CAREER_UPGRADES: readonly CareerUpgrade[] = [
  {
    id: "checklist",
    title: "Хороший чекліст",
    description: "+1 баг за ручний тест",
    cost: 10,
    stage: 0,
    effect: "clickFlat",
    value: 1,
    icon: "✓",
  },
  {
    id: "coffee",
    title: "Подвійний еспресо",
    description: "×2 сила ручного тестування",
    cost: 40,
    stage: 0,
    effect: "click",
    value: 2,
    icon: "↯",
  },
  {
    id: "templates",
    title: "Зрозумілі баг-репорти",
    description: "+25% грошей за кожен баг",
    cost: 100,
    stage: 0,
    effect: "report",
    value: 1.25,
    icon: "≡",
  },
  {
    id: "plan",
    title: "План тестування",
    description: "+25% продуктивності всієї команди",
    cost: 160,
    stage: 0,
    effect: "production",
    value: 1.25,
    icon: "⌘",
  },
  {
    id: "auto",
    title: "Автоматичні звіти",
    description: "Баги самі перетворюються на гроші",
    cost: 80,
    stage: 1,
    effect: "auto",
    value: 1,
    icon: "↻",
  },
  {
    id: "mentoring",
    title: "Менторство",
    description: "+25% продуктивності всієї команди",
    cost: 400,
    stage: 1,
    effect: "production",
    value: 1.25,
    icon: "↑",
  },
  {
    id: "handover",
    title: "Нічна зміна",
    description: "16 годин офлайн-доходу зі 100% ефективністю",
    cost: 1_200,
    stage: 1,
    effect: "offline",
    value: 1,
    icon: "☾",
  },
  {
    id: "shortcuts",
    title: "Швидкі клавіші",
    description: "×2 сила ручного тестування",
    cost: 3_500,
    stage: 2,
    effect: "click",
    value: 2,
    icon: "⌨",
  },
  {
    id: "parallel",
    title: "Паралельні запуски",
    description: "+50% продуктивності всієї команди",
    cost: 12_000,
    stage: 2,
    effect: "production",
    value: 1.5,
    icon: "⇉",
  },
  {
    id: "bounty",
    title: "Bug bounty",
    description: "+50% грошей за кожен баг",
    cost: 18_000,
    stage: 2,
    effect: "report",
    value: 1.5,
    icon: "$",
  },
  {
    id: "playbook",
    title: "Командний плейбук",
    description: "+50% продуктивності всієї команди",
    cost: 60_000,
    stage: 3,
    effect: "production",
    value: 1.5,
    icon: "▤",
  },
  {
    id: "premium",
    title: "Репутація експерта",
    description: "+50% грошей за кожен баг",
    cost: 90_000,
    stage: 3,
    effect: "report",
    value: 1.5,
    icon: "✦",
  },
  {
    id: "knowledge",
    title: "База знань",
    description: "×2 сила ручного тестування",
    cost: 450_000,
    stage: 4,
    effect: "click",
    value: 2,
    icon: "◇",
  },
  {
    id: "observability",
    title: "Повна спостережуваність",
    description: "+50% продуктивності всієї команди",
    cost: 650_000,
    stage: 4,
    effect: "production",
    value: 1.5,
    icon: "◎",
  },
  {
    id: "global",
    title: "Глобальне покриття",
    description: "+50% продуктивності всієї команди",
    cost: 5_000_000,
    stage: 5,
    effect: "production",
    value: 1.5,
    icon: "⊕",
  },
];

export const CONTRACTS = [
  {
    id: "smoke",
    title: "Smoke-перевірка",
    description: "«Ми лише трохи змінили кнопку».",
    target: 4_000,
    duration: 60,
    reward: 12_000,
  },
  {
    id: "regression",
    title: "Повна регресія",
    description: "Перевірити все. Так, знову все.",
    target: 16_000,
    duration: 180,
    reward: 48_000,
  },
  {
    id: "release",
    title: "Аудит релізу",
    description: "У п’ятницю в прод? З твоєю допомогою.",
    target: 60_000,
    duration: 480,
    reward: 180_000,
  },
] as const;

const BADGE_TARGETS = {
  firstPay: 100,
  team: 10,
  senior: 2,
  lead: 3,
  million: 1_000_000,
  director: 5,
};
export const BADGES: readonly {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: (s: CareerState) => boolean;
}[] = [
  {
    id: "firstBug",
    title: "Це не фіча",
    description: "Знайти перший баг",
    icon: "⌁",
    earned: (s) => s.lifetimeBugs >= 1,
  },
  {
    id: "firstPay",
    title: "Перша зарплата",
    description: "Заробити $100 за весь час",
    icon: "$",
    earned: (s) => s.lifetimeEarned >= BADGE_TARGETS.firstPay,
  },
  {
    id: "firstHire",
    title: "Нас уже двоє",
    description: "Найняти першого помічника",
    icon: "+",
    earned: (s) => s.crew.assistant >= 1,
  },
  {
    id: "team",
    title: "Командний гравець",
    description: "Мати 10 одиниць команди",
    icon: "▦",
    earned: (s) => Object.values(s.crew).reduce((a, b) => a + b, 0) >= BADGE_TARGETS.team,
  },
  {
    id: "senior",
    title: "Питають твоєї поради",
    description: "Стати Senior QA",
    icon: "↑",
    earned: (s) => s.bestStage >= BADGE_TARGETS.senior,
  },
  {
    id: "lead",
    title: "Капітан релізу",
    description: "Стати QA Lead",
    icon: "⚑",
    earned: (s) => s.bestStage >= BADGE_TARGETS.lead,
  },
  {
    id: "contract",
    title: "Підписано й перевірено",
    description: "Завершити перший контракт",
    icon: "✓",
    earned: (s) => s.contractsCompleted >= 1,
  },
  {
    id: "million",
    title: "Сім цифр",
    description: "Заробити $1M за весь час",
    icon: "M",
    earned: (s) => s.lifetimeEarned >= BADGE_TARGETS.million,
  },
  {
    id: "director",
    title: "Якість — твоя справа",
    description: "Стати Director",
    icon: "◇",
    earned: (s) => s.bestStage >= BADGE_TARGETS.director,
  },
  {
    id: "rebirth",
    title: "Новий початок",
    description: "Почати другу кар’єру",
    icon: "∞",
    earned: (s) => s.careers >= 1,
  },
];
