import type { CrewId } from "../../types";
import type { CareerUpgrade } from "./content";

export const STUDIO_RULES = {
  unlockStage: 1,
  tiers: 3,
  phases: 3,
  researchGrowth: 1.8,
  projectWorkGrowth: 12,
  projectCashGrowth: 10,
  tierTimeBonus: 0.25,
  baseSlots: 2,
  hour: 3_600,
  minimumWorkMultiplier: 0.84,
  minimumContractTimeMultiplier: 0.8,
  maximumContractRewardMultiplier: 1.6,
  maximumInsightMultiplier: 1.6,
  contractInsightRanks: 2,
} as const;

export interface ProjectPhase {
  title: string;
  brief: string;
  target: number;
  seconds: number;
}
export interface ProjectDefinition {
  id: string;
  title: string;
  client: string;
  genre: string;
  brief: string;
  ending: string;
  stage: number;
  reward: number;
  insights: number;
  color: string;
  phases: readonly ProjectPhase[];
}
export const PROJECTS: readonly ProjectDefinition[] = [
  {
    id: "button",
    title: "Кнопка, яка продає",
    client: "Ліза · власниця крамниці",
    genre: "ПЕРШИЙ КЛІЄНТ",
    color: "mint",
    brief:
      "Ліза відкриває онлайн-крамницю. На її ноутбуці все працює. На телефоні покупця кнопка «Купити» тікає за край екрана. Твій перший справжній реліз чекає.",
    ending:
      "Перше замовлення вже в дорозі. Ліза надсилає скриншот: «Натискається!» Марта хоче приєднатися — їй подобається, як ти помічаєш дрібниці.",
    stage: 1,
    reward: 800,
    insights: 3,
    phases: [
      {
        title: "Знайомство з крамницею",
        brief:
          "Перевір розміри екранів, довгі назви товарів і порожні кошики. Тут усе вперше.",
        target: 80,
        seconds: 20,
      },
      {
        title: "Кнопка під мікроскопом",
        brief:
          "Відтвори помилку з реального телефона. Два натискання не мають створювати два замовлення.",
        target: 140,
        seconds: 30,
      },
      {
        title: "Перше замовлення",
        brief:
          "Пройди шлях від каталогу до листа-підтвердження. Тепер можна відчиняти двері.",
        target: 220,
        seconds: 45,
      },
    ],
  },
  {
    id: "cart",
    title: "Нічний кошик",
    client: "Денис · маркетплейс «Ще одну річ»",
    genre: "E-COMMERCE",
    color: "blue",
    brief:
      "О 23:59 зникають знижки, промокод робить суму від’ємною, а останню пару кросівок купили троє. Розпродаж починається сьогодні.",
    ending:
      "Кошики пережили північ. Тарас автоматизував найпідступніші перевірки й залишив повідомлення: «Наступного разу я з вами».",
    stage: 2,
    reward: 8_000,
    insights: 5,
    phases: [
      {
        title: "Полювання на промокоди",
        brief:
          "Склади матрицю знижок, округлень і безкоштовної доставки. Нуль — теж ціна.",
        target: 800,
        seconds: 30,
      },
      {
        title: "Остання пара",
        brief:
          "Перевір одночасні замовлення. Один товар повинен мати одного щасливого власника.",
        target: 1_600,
        seconds: 45,
      },
      {
        title: "Після півночі",
        brief: "Запусти регресію на межі доби. Жодна знижка не має жити вчорашнім днем.",
        target: 3_200,
        seconds: 60,
      },
    ],
  },
  {
    id: "mobile",
    title: "Мобільний хаос",
    client: "Софія · застосунок «Поруч»",
    genre: "МОБІЛЬНИЙ ЗАСТОСУНОК",
    color: "violet",
    brief:
      "Доставка губиться в ліфті без мережі, а після повороту екрана кур’єр стає пасажиром. Команда зібрала 47 телефонів. Почнімо з найстарішого.",
    ending:
      "Застосунок повертається з офлайну без втрат. Софія бачить, що ти вмієш домовлятися з хаосом, і пропонує вести переговори з клієнтами.",
    stage: 3,
    reward: 75_000,
    insights: 8,
    phases: [
      {
        title: "Зоопарк пристроїв",
        brief:
          "Різні екрани, дозволи й версії системи. Знайди те, чого не видно на флагмані.",
        target: 6_000,
        seconds: 45,
      },
      {
        title: "Ліфт без інтернету",
        brief:
          "З’єднання зникає саме після оплати. Черга запитів повинна витримати повернення.",
        target: 12_000,
        seconds: 60,
      },
      {
        title: "Оновлення без сюрпризів",
        brief:
          "Старі профілі, нові дозволи, незавершені замовлення. Усе має пережити оновлення.",
        target: 24_000,
        seconds: 90,
      },
    ],
  },
  {
    id: "payments",
    title: "Платіжна п’ятниця",
    client: "Лев · фінтех «Копійка»",
    genre: "ФІНТЕХ",
    color: "amber",
    brief:
      "П’ятниця, 16:55. «Ми лише оновили округлення». У тестовій виписці вже знайшлася зайва копійка. Цей реліз потребує спокою й хороших журналів.",
    ending:
      "Баланс зійшовся до копійки. Лев приніс команді вечерю та запропонував залишитися наставником. У п’ятницю можна дихати.",
    stage: 4,
    reward: 650_000,
    insights: 12,
    phases: [
      {
        title: "До останньої копійки",
        brief:
          "Перевір валюти й округлення в тестовому середовищі. Великі суми починаються з малих помилок.",
        target: 45_000,
        seconds: 60,
      },
      {
        title: "Повторний запит",
        brief: "Сервіс відповів двічі. Переконайся, що одна дія залишає одну операцію.",
        target: 90_000,
        seconds: 90,
      },
      {
        title: "Звірка перед вихідними",
        brief: "Повернення, часткові списання й журнали. Закрий день із чистою історією.",
        target: 180_000,
        seconds: 120,
      },
    ],
  },
  {
    id: "players",
    title: "Мільйон гравців",
    client: "Ніка · студія «Після патчу»",
    genre: "ІГРОВИЙ ЗАПУСК",
    color: "pink",
    brief:
      "Стример показав гру мільйону людей. Черга входу стала новою найпопулярнішою мінігрою, а рідкісний меч копіюється при виході. До запуску залишився один спринт.",
    ending:
      "Сервери витримали, меч залишився рідкісним. Ніка хоче будувати наступну інфраструктуру разом. Гравці нарешті обговорюють саму гру.",
    stage: 5,
    reward: 6_000_000,
    insights: 18,
    phases: [
      {
        title: "Усі натиснули «Грати»",
        brief:
          "Перевір пікове навантаження та справедливу чергу. Навіть очікування має бути передбачуваним.",
        target: 250_000,
        seconds: 90,
      },
      {
        title: "Меч із двома власниками",
        brief:
          "Транзакції інвентарю, від’єднання й відновлення сесії. Жодного дублювання нагород.",
        target: 500_000,
        seconds: 120,
      },
      {
        title: "День запуску",
        brief:
          "Зіграйте довгу сесію всією командою. Стеж за пам’яттю, чергами й чесними збереженнями.",
        target: 1_000_000,
        seconds: 180,
      },
    ],
  },
  {
    id: "network",
    title: "Глобальна мережа",
    client: "Орест · сервіс «Навколо»",
    genre: "РОЗПОДІЛЕНІ СИСТЕМИ",
    color: "blue",
    brief:
      "Сонце не сідає над датацентрами. На одному континенті вже понеділок, на іншому ще акція вихідного дня. Якість тепер має часові пояси.",
    ending:
      "Збої залишилися локальними, дані — узгодженими. Орест налаштував нічне чергування й приєднався до студії. Можна ненадовго відійти.",
    stage: 6,
    reward: 60_000_000,
    insights: 25,
    phases: [
      {
        title: "Двадцять чотири півночі",
        brief:
          "Локалі, календарі, часові пояси та літній час. У користувачів різне сьогодні.",
        target: 1_500_000,
        seconds: 120,
      },
      {
        title: "Континент пішов офлайн",
        brief:
          "Вимкни тестовий регіон. Перевір перемикання та відновлення без повторних операцій.",
        target: 3_000_000,
        seconds: 180,
      },
      {
        title: "Світова зміна",
        brief:
          "Команда передає роботу між регіонами. Нехай моніторинг знає, коли все гаразд.",
        target: 6_000_000,
        seconds: 240,
      },
    ],
  },
  {
    id: "trust",
    title: "Алгоритм довіри",
    client: "Ада · пошук «Запитай»",
    genre: "AI-ПРОДУКТ",
    color: "violet",
    brief:
      "Демонстрація бездоганна. Справжні запити — не з демонстрації. Команда має навчитися помічати невпевнені відповіді, небажані витоки та зміни поведінки.",
    ending:
      "Продукт навчився чесно казати «не знаю». Набір оцінювання став стандартом команди. Довіра росте повільніше за метрики, але тримається довше.",
    stage: 7,
    reward: 600_000_000,
    insights: 35,
    phases: [
      {
        title: "Питання без репетиції",
        brief:
          "Збери нетипові запити та явні критерії оцінки. Враження від демо не замінить вимірювань.",
        target: 10_000_000,
        seconds: 180,
      },
      {
        title: "Межі впевненості",
        brief:
          "Перевір приватність, суперечливі дані й чесну відмову від вигаданих фактів.",
        target: 20_000_000,
        seconds: 240,
      },
      {
        title: "Модель змінилася",
        brief:
          "Порівняй версії на однаковому наборі. Покращення в середньому не повинно приховувати регресії.",
        target: 40_000_000,
        seconds: 300,
      },
    ],
  },
  {
    id: "orbit",
    title: "Орбітальний реліз",
    client: "Ірина · місія «Обрій»",
    genre: "КОСМІЧНА ІНФРАСТРУКТУРА",
    color: "amber",
    brief:
      "На орбіті немає кнопки «перезапустити роутер». Телеметрія приходить із затримкою, а вікно оновлення коротше за стендап. Симулятор готовий до твоїх перевірок.",
    ending:
      "Пакет підтверджень повернувся із затримкою, але без помилок. «Обрій» на зв’язку. На стіні студії з’явилася фотографія Землі.",
    stage: 7,
    reward: 2_000_000_000,
    insights: 45,
    phases: [
      {
        title: "Довге відлуння",
        brief: "Перевір затримки, пропущені пакети й черговість команд на симуляторі.",
        target: 30_000_000,
        seconds: 180,
      },
      {
        title: "Сонячна буря",
        brief:
          "Випадкові збої у стенді не повинні руйнувати стан. Перевір контрольні точки відновлення.",
        target: 60_000_000,
        seconds: 300,
      },
      {
        title: "Вікно зв’язку",
        brief: "Остання повна репетиція оновлення. Підготуй перевірений шлях повернення.",
        target: 120_000_000,
        seconds: 420,
      },
    ],
  },
  {
    id: "platform",
    title: "Власна QA-платформа",
    client: "Твоя команда · флагман студії",
    genre: "ФІНАЛ КАМПАНІЇ",
    color: "mint",
    brief:
      "Ти перевіряв чужі релізи. Тепер команда будує інструмент, яким користуватимуться інші тестувальники. Усі попередні помилки стали твоєю перевагою.",
    ending:
      "Перша зовнішня команда завершила реліз із твоєю платформою. На екрані — знайоме «Знайти баг». Кар’єра стала студією. Попереду золоті сертифікації та нові початки.",
    stage: 8,
    reward: 15_000_000_000,
    insights: 60,
    phases: [
      {
        title: "Власний інструмент",
        brief:
          "Зведи звіти, автоматизацію й досвід у зрозумілий продукт. Ти знаєш його користувача.",
        target: 100_000_000,
        seconds: 240,
      },
      {
        title: "Тестувальники тестують QA",
        brief:
          "Запроси пілотні команди. Дозволь їм зламати твої припущення до публічного запуску.",
        target: 200_000_000,
        seconds: 360,
      },
      {
        title: "Твій реліз",
        brief:
          "Пройди повний шлях нової команди. Перевір перенесення, відновлення й першу перемогу.",
        target: 400_000_000,
        seconds: 600,
      },
    ],
  },
];

export type ResearchEffect =
  | "production"
  | "projectWork"
  | "report"
  | "discount"
  | "manual"
  | "offlineHours"
  | "contractTime"
  | "contractReward"
  | "offlineEfficiency"
  | "insight"
  | "slots";
export interface ResearchDefinition {
  id: string;
  title: string;
  description: string;
  branch: "engineering" | "discovery" | "business";
  cost: number;
  max: number;
  effect: ResearchEffect;
  value: number;
  requires?: { id: string; level: number };
}
export const RESEARCH: readonly ResearchDefinition[] = [
  {
    id: "automation",
    title: "Стійка автоматизація",
    description: "+10% продуктивності за рівень",
    branch: "engineering",
    cost: 3,
    max: 5,
    effect: "production",
    value: 0.1,
  },
  {
    id: "fieldnotes",
    title: "Польові нотатки",
    description: "−4% потрібних багів у нових проєктах за рівень",
    branch: "discovery",
    cost: 3,
    max: 4,
    effect: "projectWork",
    value: 0.04,
  },
  {
    id: "bargaining",
    title: "Мова бізнесу",
    description: "+8% вартості звітів за рівень",
    branch: "business",
    cost: 4,
    max: 4,
    effect: "report",
    value: 0.08,
  },
  {
    id: "procurement",
    title: "Розумні закупівлі",
    description: "−5% вартості найму за рівень",
    branch: "engineering",
    cost: 5,
    max: 4,
    effect: "discount",
    value: 0.05,
    requires: { id: "automation", level: 1 },
  },
  {
    id: "intuition",
    title: "QA-інтуїція",
    description: "+25% базової сили ручного тесту за рівень",
    branch: "discovery",
    cost: 4,
    max: 3,
    effect: "manual",
    value: 0.25,
    requires: { id: "fieldnotes", level: 1 },
  },
  {
    id: "archive",
    title: "Надійна передача зміни",
    description: "+1 година офлайн-прогресу за рівень",
    branch: "engineering",
    cost: 5,
    max: 4,
    effect: "offlineHours",
    value: 1,
    requires: { id: "automation", level: 1 },
  },
  {
    id: "pipelines",
    title: "Паралельні перевірки",
    description: "−5% мінімального часу нових контрактів за рівень",
    branch: "discovery",
    cost: 6,
    max: 4,
    effect: "contractTime",
    value: 0.05,
    requires: { id: "fieldnotes", level: 1 },
  },
  {
    id: "reputation",
    title: "Портфоліо довіри",
    description: "+10% оплати нових контрактів за рівень",
    branch: "business",
    cost: 6,
    max: 4,
    effect: "contractReward",
    value: 0.1,
    requires: { id: "bargaining", level: 1 },
  },
  {
    id: "nightshift",
    title: "Безшовне чергування",
    description: "+5% офлайн-ефективності за рівень, до 100%",
    branch: "engineering",
    cost: 8,
    max: 4,
    effect: "offlineEfficiency",
    value: 0.05,
    requires: { id: "archive", level: 1 },
  },
  {
    id: "discoveries",
    title: "Культура відкриттів",
    description: "+20% інсайтів із нових завдань за рівень",
    branch: "discovery",
    cost: 10,
    max: 3,
    effect: "insight",
    value: 0.2,
    requires: { id: "fieldnotes", level: 2 },
  },
  {
    id: "leadership",
    title: "Школа лідерства",
    description: "+15% продуктивності за рівень",
    branch: "business",
    cost: 14,
    max: 3,
    effect: "production",
    value: 0.15,
    requires: { id: "automation", level: 3 },
  },
  {
    id: "coordination",
    title: "Третє крісло",
    description: "Ще один активний фахівець у студії",
    branch: "business",
    cost: 35,
    max: 1,
    effect: "slots",
    value: 1,
    requires: { id: "leadership", level: 1 },
  },
];

export interface SpecialistDefinition {
  id: string;
  name: string;
  role: string;
  initials: string;
  project: string;
  quote: string;
  description: string;
  color: string;
  crew?: readonly CrewId[];
  production?: number;
  manual?: number;
  contractReward?: number;
  offlineEfficiency?: number;
  offlineHours?: number;
}
export const SPECIALISTS: readonly SpecialistDefinition[] = [
  {
    id: "marta",
    name: "Марта",
    role: "Дослідниця",
    initials: "М",
    project: "button",
    quote: "«А якщо натиснути двічі?»",
    description: "+50% базової сили ручного тесту",
    color: "mint",
    manual: 0.5,
  },
  {
    id: "taras",
    name: "Тарас",
    role: "Автоматизатор",
    initials: "Т",
    project: "cart",
    quote: "«Нехай регресія бігає, поки ми думаємо».",
    description: "+25% продуктивності раннерів і хмарних ферм",
    color: "blue",
    crew: ["runner", "cloud"],
    production: 0.25,
  },
  {
    id: "sofia",
    name: "Софія",
    role: "Переговорниця",
    initials: "С",
    project: "mobile",
    quote: "«Хороша перевірка має справедливу ціну».",
    description: "+20% грошей за нові контракти",
    color: "violet",
    contractReward: 0.2,
  },
  {
    id: "lev",
    name: "Лев",
    role: "Наставник",
    initials: "Л",
    project: "payments",
    quote: "«Поясню ще раз. І намалюю».",
    description: "+30% продуктивності помічників і QA-команд",
    color: "amber",
    crew: ["assistant", "squad"],
    production: 0.3,
  },
  {
    id: "nika",
    name: "Ніка",
    role: "Архітекторка",
    initials: "Н",
    project: "players",
    quote: "«Спершу перевіримо, як воно падає».",
    description: "+25% продуктивності лабораторій, AI та орбітальних стендів",
    color: "pink",
    crew: ["lab", "ai", "orbital"],
    production: 0.25,
  },
  {
    id: "orest",
    name: "Орест",
    role: "Операційник",
    initials: "О",
    project: "network",
    quote: "«Йди відпочинь. Ми підхопимо».",
    description: "+15% офлайн-ефективності та +2 години ліміту",
    color: "blue",
    offlineEfficiency: 0.15,
    offlineHours: 2,
  },
];

export const EXPANSION_UPGRADES: readonly CareerUpgrade[] = [
  {
    id: "exploratory",
    title: "Дослідницька сесія",
    description: "×2 сила ручного тестування",
    cost: 250_000,
    stage: 3,
    effect: "click",
    value: 2,
    icon: "⌕",
  },
  {
    id: "devicepool",
    title: "Парк реальних пристроїв",
    description: "+50% продуктивності команди",
    cost: 2_000_000,
    stage: 4,
    effect: "production",
    value: 1.5,
    icon: "▣",
  },
  {
    id: "sharding",
    title: "Розподілені прогони",
    description: "×2 продуктивність команди",
    cost: 9_000_000,
    stage: 5,
    effect: "production",
    value: 2,
    icon: "⋈",
  },
  {
    id: "enterprise",
    title: "Корпоративні клієнти",
    description: "+50% вартості звітів",
    cost: 15_000_000,
    stage: 5,
    effect: "report",
    value: 1.5,
    icon: "$",
  },
  {
    id: "fuzzing",
    title: "Розумний фаззинг",
    description: "×2 сила ручного тестування",
    cost: 22_000_000,
    stage: 5,
    effect: "click",
    value: 2,
    icon: "※",
  },
  {
    id: "chaos",
    title: "Контрольований хаос",
    description: "×2 продуктивність команди",
    cost: 70_000_000,
    stage: 6,
    effect: "production",
    value: 2,
    icon: "↝",
  },
  {
    id: "synthetic",
    title: "Синтетичні середовища",
    description: "×2 продуктивність команди",
    cost: 180_000_000,
    stage: 6,
    effect: "production",
    value: 2,
    icon: "⌬",
  },
  {
    id: "sla",
    title: "Гарантія якості",
    description: "+50% вартості звітів",
    cost: 300_000_000,
    stage: 6,
    effect: "report",
    value: 1.5,
    icon: "✓",
  },
  {
    id: "heuristics",
    title: "Каталог евристик",
    description: "×2 сила ручного тестування",
    cost: 500_000_000,
    stage: 6,
    effect: "click",
    value: 2,
    icon: "⌕",
  },
  {
    id: "digitaltwin",
    title: "Цифрові двійники",
    description: "×2 продуктивність команди",
    cost: 1_500_000_000,
    stage: 7,
    effect: "production",
    value: 2,
    icon: "◈",
  },
  {
    id: "evaluation",
    title: "Безперервне оцінювання",
    description: "×2 продуктивність команди",
    cost: 4_000_000_000,
    stage: 7,
    effect: "production",
    value: 2,
    icon: "∿",
  },
  {
    id: "standards",
    title: "Світовий стандарт",
    description: "×2 вартість звітів",
    cost: 8_000_000_000,
    stage: 7,
    effect: "report",
    value: 2,
    icon: "◎",
  },
  {
    id: "telemetry",
    title: "Телеметрія без меж",
    description: "×2 сила ручного тестування",
    cost: 14_000_000_000,
    stage: 7,
    effect: "click",
    value: 2,
    icon: "↗",
  },
  {
    id: "ecosystem",
    title: "Власна екосистема",
    description: "×2 продуктивність команди",
    cost: 40_000_000_000,
    stage: 8,
    effect: "production",
    value: 2,
    icon: "⊕",
  },
  {
    id: "platform",
    title: "Платформа для всіх",
    description: "×2 вартість звітів",
    cost: 100_000_000_000,
    stage: 8,
    effect: "report",
    value: 2,
    icon: "▦",
  },
  {
    id: "legacy",
    title: "Школа наступного покоління",
    description: "×3 продуктивність команди",
    cost: 400_000_000_000,
    stage: 8,
    effect: "production",
    value: 3,
    icon: "∞",
  },
];
