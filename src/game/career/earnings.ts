import type { CareerState } from "../../types";
import { bounded } from "./selectors";
import { CAREER_RULES as R } from "./content";

// Every cash reward shares these counters; purchasing and refunds never call it.
export function earn(s: CareerState, amount: number): CareerState {
  return {
    ...s,
    money: bounded(s.money + amount, R.moneyLimit),
    earned: bounded(s.earned + amount, R.moneyLimit),
    rankEarned: bounded(s.rankEarned + amount, R.moneyLimit),
    lifetimeEarned: bounded(s.lifetimeEarned + amount, R.moneyLimit),
  };
}
