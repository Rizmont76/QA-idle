import type { CareerState } from "../../types";
import { CAREER_STAGES } from "./content";
import { manualPower, production, reportValue } from "./selectors";
import { royaltyRate } from "./products";

const snapshot = (s: CareerState) => ({
  production: production(s),
  manual: manualPower(s),
  income: production(s) * reportValue(s) + royaltyRate(s),
});
export function promotionImpact(before: CareerState, after: CareerState) {
  return after.careers === before.careers && after.stage > before.stage
    ? {
        title: CAREER_STAGES[after.stage]?.title ?? "Новий ранг",
        capability: CAREER_STAGES[after.stage]?.unlock ?? "Нова можливість",
        before: snapshot(before),
        after: snapshot(after),
      }
    : null;
}
export type PromotionImpact = NonNullable<ReturnType<typeof promotionImpact>>;
