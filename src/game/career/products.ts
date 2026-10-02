import type { CareerAction, CareerState } from "../../types";
import { PRODUCT_MODEL_VERSION } from "../../types";
import { PRODUCTS, PRODUCT_RULES as P } from "./productData";
import type { ProductDefinition } from "./productData";
import { amount, record } from "./saveValues";
import { bounded } from "./selectors";
import { MARKET, PRODUCT_MODES } from "./productEffects";
export { productIncome, royaltyRate } from "./productEffects";

export function productUnlocked(s: CareerState, def: ProductDefinition) {
  return s.stage >= def.stage && (s.certificates[def.project] ?? 0) > 0;
}
export function productAction(state: CareerState, action: CareerAction) {
  const fail = (message: string) => ({ state, ok: false, message });
  switch (action.type) {
    case "launchProduct": {
      const def = PRODUCTS.find((p) => p.id === action.id);
      if (
        !def ||
        !productUnlocked(state, def) ||
        (state.products.releases[def.id] ?? 0) > 0
      ) {
        return fail(
          "Потрібні ранг і перший сертифікат. Кожен продукт запускається один раз.",
        );
      }
      if (state.money < def.cost || state.insights < def.insights) {
        return fail("Недостатньо грошей або інсайтів для запуску.");
      }
      return {
        state: {
          ...state,
          money: state.money - def.cost,
          insights: state.insights - def.insights,
          products: {
            ...state.products,
            releases: { ...state.products.releases, [def.id]: 1 },
            modes: { ...state.products.modes, [def.id]: "license" as const },
          },
        },
        ok: true,
        message: `${def.title} запущено. Обери, як він допомагатиме студії.`,
      };
    }
    case "productMode": {
      if (
        !(state.products.releases[action.id] ?? 0) ||
        !PRODUCT_MODES.some((m) => m.id === action.mode)
      ) {
        return fail("Цей продукт або режим недоступний.");
      }
      return {
        state: {
          ...state,
          products: {
            ...state.products,
            modes: { ...state.products.modes, [action.id]: action.mode },
          },
        },
        ok: true,
        message: "Роль продукту змінено. Новий ефект уже працює.",
      };
    }
    case "dismissProductRefund":
      return {
        state: { ...state, products: { ...state.products, refund: null } },
        ok: true,
        message: "Інвестиції повернено. Обери нову стратегію продуктів.",
      };
    default:
      return fail("Невідома дія продукту.");
  }
}

// Called on a fresh normalized state. Legacy costs are derived, never trusted from saves.
export function normalizeProducts(state: CareerState, value: unknown): void {
  const data = record(value);
  const legacy = data["model"] !== PRODUCT_MODEL_VERSION;
  const releases = record(data["releases"]);
  const modes = record(data["modes"]);
  let returnedCash = 0;
  let returnedInsights = 0;
  const oldVersions: Record<string, number> = {};
  for (const def of PRODUCTS) {
    const version = Math.floor(amount(releases[def.id], legacy ? P.versions : 1));
    const requiredCertificates = legacy ? version : 1;
    const rank = legacy ? Math.min(P.lastStage, def.stage + version - 1) : def.stage;
    if (
      version <= 0 ||
      (state.certificates[def.project] ?? 0) < requiredCertificates ||
      state.bestStage < rank
    ) {
      continue;
    }
    oldVersions[def.id] = version;
    state.products.releases[def.id] = 1;
    state.products.modes[def.id] =
      PRODUCT_MODES.find((m) => !legacy && m.id === modes[def.id])?.id ?? "license";
    if (legacy) {
      for (let tier = 1; tier < version; tier++) {
        returnedCash += def.cost * P.costGrowth ** tier;
        returnedInsights += def.insights * (tier + 1);
      }
    }
  }
  const job = record(data["development"]);
  const def = PRODUCTS.find((p) => p.id === job["id"]);
  const version = def ? (oldVersions[def.id] ?? 0) + 1 : 0;
  if (
    legacy &&
    def &&
    job["version"] === version &&
    version <= P.versions &&
    state.stage >= Math.min(P.lastStage, def.stage + version - 1) &&
    (state.certificates[def.project] ?? 0) >= version
  ) {
    returnedCash += def.cost * P.costGrowth ** (version - 1);
    returnedInsights += def.insights * version;
  }
  const owned = Object.keys(state.products.releases).length > 0;
  state.products.earned = owned ? amount(data["earned"], state.lifetimeEarned) : 0;
  state.products.clients =
    owned && !legacy ? Math.floor(amount(data["clients"], MARKET.clients)) : 0;
  if (legacy && (returnedCash > 0 || returnedInsights > 0)) {
    const money = bounded(state.money + returnedCash);
    const insights = bounded(state.insights + returnedInsights);
    state.products.refund = {
      money: money - state.money,
      insights: insights - state.insights,
    };
    state.money = money;
    state.insights = insights;
    state.lifetimeInsights = Math.max(state.lifetimeInsights, insights);
  } else if (!legacy && data["refund"] !== null && typeof data["refund"] === "object") {
    const refund = record(data["refund"]);
    state.products.refund = {
      money: amount(refund["money"]),
      insights: amount(refund["insights"]),
    };
  }
}
