import type { CareerState, ProductMode } from "../../types";
import { PRODUCTS } from "./productData";
import type { ProductDefinition } from "./productData";
import { PIPELINE_MODEL_VERSION } from "../../types";
import { compiledTestRate, reportValue } from "./selectors";
import { sustainableRate } from "./architectureEffects";
import { pipelineUnlocked } from "./pipelineUnlocks";
import { CAREER_RULES } from "./content";

export const MARKET = {
  clients: 400,
  contractClients: 1,
  projectClients: 10,
  scale: 10,
  insightShare: 0.5,
  insightReleases: 10,
} as const;
const STRENGTH: Record<string, number> = {
  checklist: 0.25,
  devices: 0.35,
  sandbox: 0.5,
  loadcloud: 0.65,
  signal: 0.8,
  qaos: 1,
};
export const PRODUCT_MODES: readonly {
  id: ProductMode;
  title: string;
  symbol: string;
}[] = [
  { id: "license", title: "Ліцензії", symbol: "$" },
  { id: "internal", title: "Для команди", symbol: "↯" },
  { id: "open", title: "Відкритий код", symbol: "◈" },
];
export function marketStrength(s: CareerState): number {
  return 1 + Math.sqrt(s.products.clients) / MARKET.scale;
}
export function productMode(s: CareerState, id: string): ProductMode {
  return s.products.modes[id] ?? "license";
}
export function productActive(s: CareerState, def: ProductDefinition): boolean {
  return (s.products.releases[def.id] ?? 0) > 0 && s.stage >= def.stage;
}
export function toolStrength(s: CareerState, def: ProductDefinition): number {
  return (STRENGTH[def.id] ?? 0) * marketStrength(s);
}
export function productBoost(s: CareerState, mode: ProductMode): number {
  return (
    PRODUCTS.filter((p) => productActive(s, p) && productMode(s, p.id) === mode).reduce(
      (sum, p) => sum + toolStrength(s, p),
      0,
    ) * (mode === "open" ? MARKET.insightShare : 1)
  );
}
export function productIncome(s: CareerState, def: ProductDefinition): number {
  return productActive(s, def) && productMode(s, def.id) === "license"
    ? def.income * marketStrength(s) +
        compiledTestRate(s) * reportValue(s) * toolStrength(s, def)
    : 0;
}
export function royaltyRate(s: CareerState): number {
  return PRODUCTS.reduce((sum, p) => sum + productIncome(s, p), 0);
}
export const baseRoyaltyRate = (s: CareerState) =>
  PRODUCTS.filter(
    (p) => productActive(s, p) && productMode(s, p.id) === "license",
  ).reduce((sum, p) => sum + p.income * marketStrength(s), 0);
export const royaltyWork = (s: CareerState, seconds: number, scriptBugs: number) =>
  baseRoyaltyRate(s) * seconds + scriptBugs * reportValue(s) * productBoost(s, "license");
export const openInsightsPerRelease = (s: CareerState) =>
  s.pipeline.model === PIPELINE_MODEL_VERSION &&
  pipelineUnlocked(s) &&
  s.pipeline.total < CAREER_RULES.limit
    ? productBoost(s, "open") / MARKET.insightReleases
    : 0;
export const openInsightRate = (s: CareerState) =>
  openInsightsPerRelease(s) * sustainableRate(s);
export const productInsightRate = (s: CareerState, def: ProductDefinition) =>
  productActive(s, def) &&
  productMode(s, def.id) === "open" &&
  openInsightsPerRelease(s) > 0
    ? ((toolStrength(s, def) * MARKET.insightShare) / MARKET.insightReleases) *
      sustainableRate(s)
    : 0;
export function gainClients(s: CareerState, amount: number): CareerState {
  if (!Object.values(s.products.releases).some((owned) => owned > 0)) {
    return s;
  }
  return {
    ...s,
    products: {
      ...s.products,
      clients: Math.min(MARKET.clients, s.products.clients + amount),
    },
  };
}
