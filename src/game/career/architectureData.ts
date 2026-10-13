/* eslint-disable @typescript-eslint/no-magic-numbers -- Authored rack balance, documented in 22-Architecture_Rack. */
import type {
  ArchitectureState,
  BlueprintId,
  RackModuleId,
  RackPresetId,
} from "../../types";

export const RACK = {
  columns: 3,
  slots: 6,
  basePower: 8,
  powerCosts: [250, 1500],
  busBoost: 0.5,
  archiveBoost: 0.25,
  managerBoost: 0.2,
};
export interface RackModule {
  id: RackModuleId;
  title: string;
  icon: string;
  power: number;
  description: string;
  requires?: BlueprintId;
  station?: 0 | 1 | 2;
  rate?: number;
}
export const RACK_MODULES: readonly RackModule[] = [
  {
    id: "build",
    title: "Збирач",
    icon: "◧",
    power: 2,
    station: 0,
    rate: 1,
    description: "+1 збірка / с на кожне ядро.",
  },
  {
    id: "verify",
    title: "Сканер",
    icon: "⌕",
    power: 2,
    station: 1,
    rate: 0.75,
    description: "+0,75 перевірки / с на кожне ядро.",
  },
  {
    id: "deploy",
    title: "Шлюз",
    icon: "↥",
    power: 2,
    station: 2,
    rate: 0.5,
    description: "+0,5 деплою / с на кожне ядро.",
  },
  {
    id: "bus",
    title: "Шина",
    icon: "╋",
    power: 1,
    requires: "cycle",
    description: "+50% до внеску кожного сусіднього робочого модуля.",
  },
  {
    id: "archive",
    title: "Архів",
    icon: "▤",
    power: 2,
    requires: "bus",
    description: "Кожен сусідній робочий модуль: +25% роботи над проєктами.",
  },
  {
    id: "manager",
    title: "Оркестратор",
    icon: "✥",
    power: 2,
    requires: "flow",
    description: "Кожен сусідній робочий модуль: +20% виробництва команди.",
  },
];
export const BLUEPRINTS: readonly {
  id: BlueprintId;
  title: string;
  description: string;
  target: number;
  reward: string;
  requires?: BlueprintId;
}[] = [
  {
    id: "cycle",
    title: "Повний цикл",
    description: "Розмісти збирача, сканер і шлюз у шафі.",
    target: 3,
    reward: "Модуль «Шина»: посилення через сусідство",
  },
  {
    id: "bus",
    title: "Спільна шина",
    description: "З’єднай одну шину з трьома робочими модулями по сторонах.",
    target: 3,
    requires: "cycle",
    reward: "Модуль «Архів» і +1 живлення",
  },
  {
    id: "flow",
    title: "Потік без заторів",
    description:
      "Досягни сталого потоку 8 релізів / с. Допоможуть модулі, нові ядра та їхній розподіл.",
    target: 8,
    requires: "bus",
    reward: "Оркестратор: сусідні модулі підсилюють команду",
  },
  {
    id: "studio",
    title: "Самостійна студія",
    description:
      "Архів та оркестратор мають торкатися щонайменше двох робочих модулів кожен.",
    target: 2,
    requires: "flow",
    reward: "Автопокупка ядер: конвеєр розвивається сам",
  },
];
export const ARCHITECTURE_POLICIES = [
  {
    id: "autoBalance",
    title: "Авторозподіл ядер",
    requires: "flow",
    description:
      "Підбирає найшвидший сталий потік після зміни модулів або кількості ядер. Випробування налаштовуєш ти.",
  },
  {
    id: "autoCores",
    title: "Автопокупка ядер",
    requires: "studio",
    description:
      "Витрачає кредити збірки: кожні 5 секунд купує одне доступне ядро. Живлення шафи купуєш ти.",
  },
] as const;
export const RACK_PRESETS: readonly {
  id: RackPresetId;
  title: string;
  description: string;
  layout: readonly (RackModuleId | null)[];
}[] = [
  {
    id: "flow",
    title: "Потік та інсайти",
    description:
      "Три шини посилюють усі вузли. Більше релізів, кредитів та інсайтів відкритого коду.",
    layout: ["build", "bus", "verify", "bus", "deploy", "bus"],
  },
  {
    id: "production",
    title: "Виробництво",
    description:
      "Два оркестратори посилюють наявну команду, автотести та підключених агентів.",
    layout: ["build", "manager", "verify", "manager", "deploy", null],
  },
  {
    id: "projects",
    title: "Проєкти",
    description: "Два архіви прискорюють сертифікації. Корисно для срібла й золота.",
    layout: ["build", "archive", "verify", "archive", "deploy", null],
  },
];
export function newArchitecture(): ArchitectureState {
  return {
    layout: Array.from({ length: RACK.slots }, () => null),
    powerLevel: 0,
    blueprints: [],
    autoBalance: false,
    autoCores: false,
  };
}
