import type { CareerState } from "../../types";
import type { CareerView, PipelineView } from "./discovery";
import { prestigeDiscovered, viewUnlocked } from "./discovery";
import { pipelineUnlocked } from "./pipelineUnlocks";
import { compiledTestRate } from "./selectors";
import { openInsightRate } from "./productEffects";
import { crewCount, hasAutoReport, production, reportValue } from "./selectors";
import { royaltyRate } from "./products";
import { certificates } from "./studioSelectors";
import { coreBudget, allocatedCores } from "./pipelineData";
import {
  architectureUnlocked,
  powerBudget,
  powerUsed,
  sustainableRate,
} from "./architectureEffects";
import { computationRate, networkUnlocked } from "./networkEffects";
import { NETWORK } from "./networkData";

const SECONDS_PER_MINUTE = 60;

export interface ResourceRow {
  id: string;
  title: string;
  symbol: string;
  balance: number;
  rate?: number;
  rateUnit?: "с" | "хв";
  money?: boolean;
  source: string;
  use: string;
  persistence: string;
  view: CareerView;
  layer?: PipelineView;
}
export function resourceOverview(s: CareerState): ResourceRow[] {
  const auto = hasAutoReport(s);
  const rows: ResourceRow[] = [
    {
      id: "money",
      title: "Гроші",
      symbol: "$",
      balance: s.money,
      rate: (auto ? production(s) * reportValue(s) : 0) + royaltyRate(s),
      money: true,
      source: "Звіти, контракти, релізи проєктів і ліцензії продуктів.",
      use: "Найм, покращення й запуск інструментів.",
      persistence: "Нова кар’єра починає рахунок заново.",
      view: "workspace",
    },
    {
      id: "bugs",
      title: "Баги до звіту",
      symbol: "↯",
      balance: s.bugs,
      rate: auto ? 0 : production(s),
      source: auto
        ? "Ручні тести й команда. Автозвіти одразу перетворюють баги на гроші."
        : "Ручні тести й команда. Здай звіт на робочому місці.",
      use: "Звіти дають гроші; знайдені баги паралельно просувають проєкт і контракт.",
      persistence: "Запас скидається у новій кар’єрі.",
      view: "workspace",
    },
  ];
  if (viewUnlocked(s, "studio")) {
    rows.push({
      id: "insights",
      title: "Інсайти",
      rate: openInsightRate(s) * SECONDS_PER_MINUTE,
      rateUnit: "хв",
      symbol: "◈",
      balance: s.insights,
      source:
        "Етапи проєктів і контракти. Відкритий код також дає інсайти за нові автотести.",
      use: "Дослідження студії та запуск продуктів.",
      persistence: "Залишаються після престижу.",
      view: "studio",
    });
  }
  if (certificates(s) > 0) {
    rows.push({
      id: "certificates",
      title: "Сертифіковані клієнти",
      symbol: "▣",
      balance: certificates(s),
      source: "Перший завершений реліз кожного проєкту.",
      use: "Відкривають проєкти, інструменти й спеціалістів. Не витрачаються.",
      persistence: "Сертифікати й їхні рівні залишаються.",
      view: "projects",
    });
  }
  if (Object.values(s.products.releases).some((n) => n > 0)) {
    rows.push({
      id: "clients",
      title: "Користувачі продуктів",
      symbol: "⬡",
      balance: s.products.clients,
      source: "Релізи проєктів і контракти після запуску першого продукту.",
      use: "Посилюють усі ролі продуктів. Не витрачаються.",
      persistence: "Аудиторія залишається після престижу.",
      view: "products",
    });
  }
  if (prestigeDiscovered(s)) {
    rows.push({
      id: "experience",
      title: "Досвід",
      symbol: "✦",
      balance: s.experience,
      source: "Початок нової кар’єри після Director; більше доходу дає більше досвіду.",
      use: "Постійно посилює команду й ручні тести. Не витрачається.",
      persistence: "Залишається назавжди.",
      view: "career",
    });
  }
  if (pipelineUnlocked(s)) {
    rows.push({
      id: "autotests",
      title: "Постійні автотести",
      symbol: "↯",
      balance: s.pipeline.total,
      rate: sustainableRate(s),
      source: "Кожен реліз основного CI/CD створює один автотест.",
      use: `Виробляють ${compiledTestRate(s).toLocaleString("uk-UA", { maximumFractionDigits: 0 })} багів/с. Не витрачаються.`,
      persistence: "Залишаються й працюють після престижу.",
      view: "pipeline",
      layer: "pipeline",
    });
    rows.push({
      id: "credits",
      title: "Кредити збірки",
      symbol: "▧",
      balance: s.pipeline.credits,
      rate: sustainableRate(s),
      source: "Завершені релізи CI/CD. Показано сталий темп після заповнення черг.",
      use: "Ядра конвеєра, а з відкриттям архітектури — модулі й живлення.",
      persistence: "Залишаються після престижу.",
      view: "pipeline",
      layer: "pipeline",
    });
  }
  if (networkUnlocked(s)) {
    rows.push({
      id: "computations",
      title: "Обчислення",
      symbol: "◎",
      balance: s.pipeline.network.computations,
      rate: computationRate(s),
      source: "Робочі вузли мережі; вищі генератори створюють нижчі.",
      use: "Генератори мережі.",
      persistence: "Залишаються після престижу, скидаються при перезапуску мережі.",
      view: "pipeline",
      layer: "network",
    });
    if (
      s.pipeline.network.runTotal >= NETWORK.rebootAt ||
      s.pipeline.network.reboots > 0
    ) {
      rows.push({
        id: "protocols",
        title: "Протоколи",
        symbol: "◇",
        balance: s.pipeline.network.protocols,
        source: "Перезапуск мережі; винагорода залежить від обчислень поточного запуску.",
        use: "Каскад, платформа й автоматичний розвиток мережі.",
        persistence: "Залишаються після престижу та перезапуску мережі.",
        view: "pipeline",
        layer: "network",
      });
    }
  }
  return rows;
}
export function resourceCapacity(s: CareerState) {
  const rows = [
    {
      title: "Команда",
      value: crewCount(s),
      detail: "Одиниці виробництва у поточній кар’єрі",
    },
  ];
  if (pipelineUnlocked(s)) {
    rows.push({
      title: "Ядра конвеєра",
      value: allocatedCores(s.pipeline.allocation),
      detail: `Розподілено з ${String(coreBudget(s.pipeline))} доступних`,
    });
  }
  if (architectureUnlocked(s)) {
    rows.push({
      title: "Живлення шафи",
      value: powerUsed(s.pipeline.architecture.layout),
      detail: `Використано з ${String(powerBudget(s))} доступних`,
    });
  }
  return rows;
}
