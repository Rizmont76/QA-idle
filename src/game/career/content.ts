import type { CareerState, CrewId } from "../../types";
import { CAREER_SAVE_VERSION } from "../../types";
import { EXPANSION_UPGRADES, PROJECTS, RESEARCH } from "./expansionData";

export const CAREER_RULES = {
  version: CAREER_SAVE_VERSION,
  saveKey: "qa-idle-studio-v4",
  previousKey: "qa-idle-career-v3",
  previousVersion: 3,
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
  prestigeStage: 5,
  repeatCapital: 50,
  contractStage: 3,
  contractScale: 10,
  milliseconds: 1_000,
  tickMs: 250,
  saveMs: 5_000,
  sleepThresholdMs: 10_000,
  returnSummarySeconds: 30,
} as const;

export interface CareerRank {
  title: string;
  label: string;
  earned: number;
  crew: number;
  value: number;
  unlock: string;
  short: string;
  color: string;
  projects?: number;
}
export const CAREER_STAGES: readonly [CareerRank, ...CareerRank[]] = [
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
    unlock: "Хмарні ферми та добровільний престиж",
    short: "Спадщина",
    color: "mint",
  },
  {
    title: "VP of Quality",
    label: "Якість перетинає кордони",
    earned: 50_000_000,
    crew: 70,
    projects: 3,
    value: 4,
    unlock: "AI-кластери та глобальні проєкти",
    short: "Світовий масштаб",
    color: "blue",
  },
  {
    title: "Chief Quality Officer",
    label: "Ти задаєш стандарт",
    earned: 1_000_000_000,
    crew: 110,
    projects: 5,
    value: 5,
    unlock: "Орбітальні лабораторії та складні системи",
    short: "Нові горизонти",
    color: "violet",
  },
  {
    title: "Founder",
    label: "Тепер це твоя студія",
    earned: 25_000_000_000,
    crew: 160,
    projects: 8,
    value: 7,
    unlock: "Власна QA-платформа та фінал кампанії",
    short: "Власний продукт",
    color: "amber",
  },
];

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
  {
    id: "cloud",
    name: "Хмарна ферма",
    description: "Регресія в усіх регіонах. Кава ще не охолола.",
    tag: "ХМАРНА ІНФРАСТРУКТУРА",
    cost: 2_500_000,
    rate: 350,
    stage: 5,
    symbol: "05",
  },
  {
    id: "ai",
    name: "AI-кластер",
    description: "Генерує сценарії, яких не було у твоєму чеклісті.",
    tag: "ШТУЧНИЙ ІНТЕЛЕКТ",
    cost: 75_000_000,
    rate: 2_800,
    stage: 6,
    symbol: "06",
  },
  {
    id: "orbital",
    name: "Орбітальна лабораторія",
    description: "Перевіряє навіть там, де немає кнопки перезапуску.",
    tag: "НОВІ ГОРИЗОНТИ",
    cost: 2_500_000_000,
    rate: 24_000,
    stage: 7,
    symbol: "07",
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
  ...EXPANSION_UPGRADES,
];

export interface ContractDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  duration: number;
  reward: number;
  stage: number;
  insights: number;
}
export const CONTRACTS: readonly ContractDefinition[] = [
  {
    id: "smoke",
    title: "Smoke-перевірка",
    description: "«Ми лише трохи змінили кнопку».",
    target: 4_000,
    duration: 60,
    reward: 12_000,
    stage: 3,
    insights: 1,
  },
  {
    id: "regression",
    title: "Повна регресія",
    description: "Перевірити все. Так, знову все.",
    target: 16_000,
    duration: 180,
    reward: 48_000,
    stage: 3,
    insights: 4,
  },
  {
    id: "release",
    title: "Аудит релізу",
    description: "У п’ятницю в прод? З твоєю допомогою.",
    target: 60_000,
    duration: 480,
    reward: 180_000,
    stage: 3,
    insights: 12,
  },
  {
    id: "accessibility",
    title: "Доступно кожному",
    description: "Клавіатура, скринрідер і жодних загублених кнопок.",
    target: 100_000,
    duration: 300,
    reward: 350_000,
    stage: 4,
    insights: 12,
  },
  {
    id: "load",
    title: "Чорна п’ятниця",
    description: "Усі знижки. Усі покупці. Одночасно.",
    target: 300_000,
    duration: 600,
    reward: 1_200_000,
    stage: 4,
    insights: 26,
  },
  {
    id: "migration",
    title: "Переїзд без втрат",
    description: "Нова база, старі дані й право повернутися назад.",
    target: 2_000_000,
    duration: 900,
    reward: 10_000_000,
    stage: 5,
    insights: 44,
  },
  {
    id: "resilience",
    title: "Регіон зник",
    description: "Репетиція великого збою. Нехай клієнти її не помітять.",
    target: 12_000_000,
    duration: 1_200,
    reward: 120_000_000,
    stage: 6,
    insights: 70,
  },
  {
    id: "audit",
    title: "Незалежний аудит",
    description: "Нас цікавлять докази. Особливо ті, що не ввійшли в презентацію.",
    target: 80_000_000,
    duration: 1_500,
    reward: 1_500_000_000,
    stage: 7,
    insights: 110,
  },
  {
    id: "launch",
    title: "Запуск покоління",
    description: "Команди з усього світу довіряють твоєму підпису.",
    target: 500_000_000,
    duration: 1_800,
    reward: 15_000_000_000,
    stage: 8,
    insights: 180,
  },
];

const BADGE_TARGETS = {
  firstPay: 100,
  team: 10,
  senior: 2,
  lead: 3,
  million: 1_000_000,
  director: 5,
  vp: 6,
  chief: 7,
  founder: 8,
  contractsTen: 10,
  contractsFifty: 50,
  projectsThree: 3,
  projectsSix: 6,
  gold: 3,
  researches: 10,
  billion: 1_000_000_000,
  trillion: 1_000_000_000_000,
  careersThree: 3,
  careersTen: 10,
  crewHundred: 100,
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
  {
    id: "firstProject",
    title: "Перший клієнт",
    description: "Отримати перший сертифікат проєкту",
    icon: "▣",
    earned: (s) => Object.values(s.certificates).some((n) => n > 0),
  },
  {
    id: "portfolio",
    title: "Є що показати",
    description: "Завершити 3 різні проєкти",
    icon: "▤",
    earned: (s) =>
      Object.values(s.certificates).filter((n) => n > 0).length >=
      BADGE_TARGETS.projectsThree,
  },
  {
    id: "worldwide",
    title: "Портфоліо без кордонів",
    description: "Завершити 6 різних проєктів",
    icon: "◎",
    earned: (s) =>
      Object.values(s.certificates).filter((n) => n > 0).length >=
      BADGE_TARGETS.projectsSix,
  },
  {
    id: "gold",
    title: "Золотий стандарт",
    description: "Отримати золоту сертифікацію",
    icon: "★",
    earned: (s) => Object.values(s.certificates).some((n) => n >= BADGE_TARGETS.gold),
  },
  {
    id: "campaign",
    title: "Зроблено твоєю студією",
    description: "Завершити всі 9 проєктів",
    icon: "◈",
    earned: (s) => PROJECTS.every((p) => (s.certificates[p.id] ?? 0) > 0),
  },
  {
    id: "allGold",
    title: "Жодних сумнівів",
    description: "Золото в кожному проєкті",
    icon: "✧",
    earned: (s) =>
      PROJECTS.every((p) => (s.certificates[p.id] ?? 0) >= BADGE_TARGETS.gold),
  },
  {
    id: "research",
    title: "Висновки зроблено",
    description: "Придбати перше дослідження",
    icon: "⌘",
    earned: (s) => Object.values(s.research).some((n) => n > 0),
  },
  {
    id: "scientist",
    title: "Знання — сила",
    description: "Придбати 10 рівнів досліджень",
    icon: "◇",
    earned: (s) =>
      Object.values(s.research).reduce((a, b) => a + b, 0) >= BADGE_TARGETS.researches,
  },
  {
    id: "fullResearch",
    title: "Бібліотека досвіду",
    description: "Завершити всі дослідження",
    icon: "▥",
    earned: (s) => RESEARCH.every((r) => (s.research[r.id] ?? 0) >= r.max),
  },
  {
    id: "specialist",
    title: "Правильна людина",
    description: "Призначити фахівця",
    icon: "+",
    earned: (s) => s.specialists.length > 0,
  },
  {
    id: "vp",
    title: "Світовий масштаб",
    description: "Стати VP of Quality",
    icon: "↗",
    earned: (s) => s.bestStage >= BADGE_TARGETS.vp,
  },
  {
    id: "chief",
    title: "Ти задаєш стандарт",
    description: "Стати Chief Quality Officer",
    icon: "⌬",
    earned: (s) => s.bestStage >= BADGE_TARGETS.chief,
  },
  {
    id: "founder",
    title: "Це твоя справа",
    description: "Заснувати власну студію",
    icon: "⊕",
    earned: (s) => s.bestStage >= BADGE_TARGETS.founder,
  },
  {
    id: "tenContracts",
    title: "Надійний партнер",
    description: "Виконати 10 контрактів",
    icon: "✓",
    earned: (s) => s.contractsCompleted >= BADGE_TARGETS.contractsTen,
  },
  {
    id: "fiftyContracts",
    title: "Телефон не замовкає",
    description: "Виконати 50 контрактів",
    icon: "≡",
    earned: (s) => s.contractsCompleted >= BADGE_TARGETS.contractsFifty,
  },
  {
    id: "billion",
    title: "Дев’ять нулів",
    description: "Заробити $1B за весь час",
    icon: "B",
    earned: (s) => s.lifetimeEarned >= BADGE_TARGETS.billion,
  },
  {
    id: "trillion",
    title: "Індустрія якості",
    description: "Заробити $1T за весь час",
    icon: "T",
    earned: (s) => s.lifetimeEarned >= BADGE_TARGETS.trillion,
  },
  {
    id: "thirdCareer",
    title: "Третій старт",
    description: "Завершити 3 кар’єри",
    icon: "↻",
    earned: (s) => s.careers >= BADGE_TARGETS.careersThree,
  },
  {
    id: "tenCareers",
    title: "Серійний засновник",
    description: "Завершити 10 кар’єр",
    icon: "∞",
    earned: (s) => s.careers >= BADGE_TARGETS.careersTen,
  },
  {
    id: "hundredCrew",
    title: "Власний кампус",
    description: "Мати 100 одиниць команди",
    icon: "▦",
    earned: (s) =>
      Object.values(s.crew).reduce((a, b) => a + b, 0) >= BADGE_TARGETS.crewHundred,
  },
];
