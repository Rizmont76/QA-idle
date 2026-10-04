import type { CareerState } from "../../types";
import { BADGES } from "./content";
import { royaltyRate } from "./productEffects";
import { hasAutoReport, offlineEfficiency, production, reportValue } from "./selectors";

export function nextPassiveBadge(
  s: CareerState,
  offline: boolean,
): { id: string; seconds: number } | null {
  const efficiency = offline ? offlineEfficiency(s) : 1;
  const bugs = production(s) * efficiency;
  const money =
    royaltyRate(s) * efficiency + (hasAutoReport(s) ? bugs * reportValue(s) : 0);
  let next: { id: string; seconds: number } | null = null;
  for (const badge of BADGES) {
    const threshold = badge.passive;
    if (!threshold || s.badges.includes(badge.id)) {
      continue;
    }
    const rate = threshold.resource === "lifetimeBugs" ? bugs : money;
    if (rate <= 0) {
      continue;
    }
    const seconds = Math.max(0, threshold.target - s[threshold.resource]) / rate;
    if (!next || seconds < next.seconds) {
      next = { id: badge.id, seconds };
    }
  }
  return next;
}
