import type { CareerState } from "../../types";
import { BADGES } from "./content";
import { royaltyWork } from "./productEffects";
import { hasAutoReport, offlineEfficiency, offlineCap, reportValue } from "./selectors";
import { passiveProduction, secondsToBugs } from "./passiveProduction";

export function nextPassiveBadge(
  s: CareerState,
  offline: boolean,
  maximum = offlineCap(s),
): { id: string; seconds: number } | null {
  const efficiency = offline ? offlineEfficiency(s) : 1;
  const flow = passiveProduction(s, maximum * efficiency);
  const bugs = flow.bugs;
  const money =
    royaltyWork(s, maximum * efficiency, flow.scriptBugs) +
    (hasAutoReport(s) ? bugs * reportValue(s) : 0);
  let next: { id: string; seconds: number } | null = null;
  for (const badge of BADGES) {
    const threshold = badge.passive;
    if (!threshold || s.badges.includes(badge.id)) {
      continue;
    }
    const missing = Math.max(0, threshold.target - s[threshold.resource]);
    const available = threshold.resource === "lifetimeBugs" ? bugs : money;
    if (available < missing || (available === 0 && missing > 0)) {
      continue;
    }
    const seconds =
      threshold.resource === "lifetimeBugs"
        ? secondsToBugs(s, missing, maximum, offline)
        : moneyThreshold(s, missing, maximum, offline);
    if (!next || seconds < next.seconds) {
      next = { id: badge.id, seconds };
    }
  }
  return next;
}

const SEARCH_PASSES = 40;
const BISECTION_DIVISOR = 2;
function moneyThreshold(
  s: CareerState,
  missing: number,
  maximum: number,
  offline: boolean,
) {
  const efficiency = offline ? offlineEfficiency(s) : 1;
  let low = 0;
  let high = maximum;
  for (let pass = 0; pass < SEARCH_PASSES; pass++) {
    const mid = (low + high) / BISECTION_DIVISOR;
    const flow = passiveProduction(s, mid * efficiency);
    const income =
      royaltyWork(s, mid * efficiency, flow.scriptBugs) +
      (hasAutoReport(s) ? flow.bugs * reportValue(s) : 0);
    if (income < missing) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return high;
}
