import type { CareerAction, CareerState, ProductDevelopment } from "../../types";
import { PRODUCTS, PRODUCT_RULES as P } from "./productData";
import type { ProductDefinition } from "./productData";
import { amount, record } from "./saveValues";

export function productTerms(def: ProductDefinition, version: number) {
  const tier = version - 1;
  return {
    version,
    stage: Math.min(P.lastStage, def.stage + tier),
    cost: def.cost * P.costGrowth ** tier,
    insights: def.insights * version,
    target: def.target * P.workGrowth ** tier,
    seconds: def.seconds * P.timeGrowth ** tier,
    income: def.income * P.incomeGrowth ** tier,
  };
}
export function productUnlocked(s: CareerState, def: ProductDefinition, version: number) {
  return (
    version >= 1 &&
    version <= P.versions &&
    Number.isInteger(version) &&
    s.stage >= productTerms(def, version).stage &&
    (s.certificates[def.project] ?? 0) >= version
  );
}
export function productIncome(s: CareerState, def: ProductDefinition): number {
  const version = s.products.releases[def.id] ?? 0;
  return version > 0 && s.stage >= def.stage ? productTerms(def, version).income : 0;
}
export function royaltyRate(s: CareerState): number {
  return PRODUCTS.reduce((sum, def) => sum + productIncome(s, def), 0);
}
export function developmentTerms(job: ProductDevelopment | null) {
  const def = PRODUCTS.find((p) => p.id === job?.id);
  return def && job ? productTerms(def, job.version) : null;
}
export function productReady(s: CareerState): boolean {
  const job = s.products.development;
  const terms = developmentTerms(job);
  return !!job && !!terms && job.progress >= terms.target && job.elapsed >= terms.seconds;
}
export function productAction(state: CareerState, action: CareerAction) {
  const fail = (message: string) => ({ state, ok: false, message });
  switch (action.type) {
    case "developProduct": {
      const def = PRODUCTS.find((p) => p.id === action.id);
      const version = (state.products.releases[action.id] ?? 0) + 1;
      if (!def || !productUnlocked(state, def, version)) {
        return fail("Потрібні відповідний ранг і сертифікат проєкту.");
      }
      if (state.products.development) {
        return fail("Спочатку випусти або скасуй поточну розробку.");
      }
      const terms = productTerms(def, version);
      if (state.money < terms.cost || state.insights < terms.insights) {
        return fail("Недостатньо грошей або інсайтів для розробки.");
      }
      return {
        state: {
          ...state,
          money: state.money - terms.cost,
          insights: state.insights - terms.insights,
          products: {
            ...state.products,
            development: { id: def.id, version, progress: 0, elapsed: 0 },
          },
        },
        ok: true,
        message: `${def.title} v${String(version)}.0 — розробку розпочато!`,
      };
    }
    case "publishProduct": {
      const job = state.products.development;
      const def = PRODUCTS.find((p) => p.id === job?.id);
      if (
        !job ||
        !def ||
        !productReady(state) ||
        job.version !== (state.products.releases[job.id] ?? 0) + 1 ||
        !productUnlocked(state, def, job.version)
      ) {
        return fail("Реліз ще не готовий. Заверши перевірки та підготовку.");
      }
      return {
        state: {
          ...state,
          products: {
            ...state.products,
            development: null,
            releases: { ...state.products.releases, [job.id]: job.version },
          },
        },
        ok: true,
        message: `${def.title} v${String(job.version)}.0 у світі! Дохід надходить автоматично.`,
      };
    }
    case "cancelProduct":
      if (!state.products.development) {
        return fail("Активної розробки немає.");
      }
      return {
        state: { ...state, products: { ...state.products, development: null } },
        ok: true,
        message:
          "Розробку скасовано. Попередні релізи збережено; витрати не повертаються.",
      };
    default:
      return fail("Невідома дія продукту.");
  }
}

export function normalizeProducts(state: CareerState, value: unknown): void {
  const data = record(value);
  const releases = record(data["releases"]);
  for (const def of PRODUCTS) {
    const version = Math.min(
      Math.floor(amount(releases[def.id], P.versions)),
      state.certificates[def.project] ?? 0,
    );
    if (version > 0 && state.bestStage >= productTerms(def, version).stage) {
      state.products.releases[def.id] = version;
    }
  }
  state.products.earned =
    Object.keys(state.products.releases).length > 0
      ? amount(data["earned"], state.lifetimeEarned)
      : 0;
  const job = record(data["development"]);
  const def = PRODUCTS.find((p) => p.id === job["id"]);
  if (!def) {
    return;
  }
  const version = (state.products.releases[def.id] ?? 0) + 1;
  if (job["version"] !== version || !productUnlocked(state, def, version)) {
    return;
  }
  const terms = productTerms(def, version);
  state.products.development = {
    id: def.id,
    version,
    progress: amount(job["progress"], terms.target),
    elapsed: amount(job["elapsed"], terms.seconds),
  };
}
