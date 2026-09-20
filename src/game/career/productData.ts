export const PRODUCT_RULES = {
  versions: 3,
  lastStage: 8,
  costGrowth: 12,
  workGrowth: 10,
  timeGrowth: 2,
  incomeGrowth: 5,
} as const;

export interface ProductDefinition {
  id: string;
  title: string;
  tagline: string;
  story: string;
  symbol: string;
  color: string;
  project: string;
  stage: number;
  cost: number;
  insights: number;
  target: number;
  seconds: number;
  income: number;
  releases: readonly string[];
}

export const PRODUCTS: readonly ProductDefinition[] = [
  {
    id: "checklist",
    title: "Checklist Studio",
    tagline: "Жодного забутого кроку.",
    story: "Чекліст для крамниці Лізи став інструментом, який просять інші команди.",
    symbol: "☷",
    color: "mint",
    project: "button",
    stage: 2,
    cost: 4_000,
    insights: 3,
    target: 2_000,
    seconds: 90,
    income: 12,
    releases: ["Розумні чеклісти", "Спільні тест-плани", "Бібліотека команди"],
  },
  {
    id: "devices",
    title: "Device Lab",
    tagline: "Тисяча екранів. Один результат.",
    story: "Після мобільного хаосу ти навчився відтворювати баги на будь-якому пристрої.",
    symbol: "▥",
    color: "blue",
    project: "mobile",
    stage: 3,
    cost: 80_000,
    insights: 8,
    target: 25_000,
    seconds: 180,
    income: 200,
    releases: ["Матриця пристроїв", "Відтворення сесій", "Віддалена лабораторія"],
  },
  {
    id: "sandbox",
    title: "Sandbox Pay",
    tagline: "Помилки без втрачених грошей.",
    story:
      "Тепер платіжну п’ятницю можна репетирувати щодня, не ризикуючи жодною копійкою.",
    symbol: "◇",
    color: "amber",
    project: "payments",
    stage: 4,
    cost: 900_000,
    insights: 15,
    target: 200_000,
    seconds: 300,
    income: 1_800,
    releases: ["Тестові платежі", "Сценарії відмов", "Фінансовий двійник"],
  },
  {
    id: "loadcloud",
    title: "Load Cloud",
    tagline: "Запусти мільйон. До першого гравця.",
    story: "Черги на сервер більше не сюрприз. Твоя хмара створює натовп за розкладом.",
    symbol: "≋",
    color: "violet",
    project: "players",
    stage: 5,
    cost: 12_000_000,
    insights: 24,
    target: 2_000_000,
    seconds: 480,
    income: 20_000,
    releases: ["Віртуальні гравці", "Глобальний стрес-тест", "Репетиція запуску"],
  },
  {
    id: "signal",
    title: "Signal Watch",
    tagline: "Першим дізнається твій монітор.",
    story: "Уроки глобальної мережі стали сервісом, що помічає збій до дзвінка клієнта.",
    symbol: "⌁",
    color: "rose",
    project: "network",
    stage: 6,
    cost: 180_000_000,
    insights: 40,
    target: 12_000_000,
    seconds: 720,
    income: 250_000,
    releases: ["Сигнали здоров’я", "Карта інцидентів", "Прогнозування збоїв"],
  },
  {
    id: "qaos",
    title: "QA Operating System",
    tagline: "Твоя школа якості. Для всіх.",
    story:
      "Власна QA-платформа виросла у цілу екосистему. Інші студії починають день із твого продукту.",
    symbol: "⬡",
    color: "mint",
    project: "platform",
    stage: 8,
    cost: 25_000_000_000,
    insights: 80,
    target: 300_000_000,
    seconds: 1_200,
    income: 25_000_000,
    releases: [
      "Єдиний робочий простір",
      "Маркетплейс інструментів",
      "Стандарт індустрії",
    ],
  },
];
