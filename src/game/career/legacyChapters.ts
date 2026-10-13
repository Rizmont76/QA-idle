/* eslint-disable @typescript-eslint/no-magic-numbers -- Shipped document 25 rules, used only to settle a pre-migration offline interval. */
import type { ChapterGoal } from "./chapters";
import type { CareerState } from "../../types";

const LEGACY_GOALS: readonly (readonly ChapterGoal[])[] = [
  [{ kind: "upgrade", target: 1 }],
  [
    { kind: "crew", id: "squad", target: 10 },
    { kind: "certificates", target: 1 },
  ],
  [
    { kind: "crew", id: "runner", target: 10 },
    { kind: "certificates", target: 2 },
    { kind: "products", target: 1 },
  ],
  [
    { kind: "contracts", target: 3 },
    { kind: "research", target: 6 },
    { kind: "certificates", target: 3 },
  ],
  [
    { kind: "crew", id: "lab", target: 10 },
    { kind: "certificates", target: 4 },
    { kind: "staff", target: 1 },
  ],
  [
    { kind: "crew", id: "cloud", target: 10 },
    { kind: "products", target: 2 },
    { kind: "certificates", target: 5 },
  ],
  [
    { kind: "crew", id: "ai", target: 10 },
    { kind: "products", target: 3 },
    { kind: "certificates", target: 6 },
  ],
  [
    { kind: "crew", id: "orbital", target: 10 },
    { kind: "products", target: 4 },
    { kind: "certificates", target: 8 },
  ],
  [{ kind: "certificates", target: 9 }],
];
const LEGACY_INCOME = [
  0, 150, 120_000, 5_000_000, 200_000_000, 10_000_000_000, 500_000_000_000,
  200_000_000_000_000, 30_000_000_000_000_000,
];
const LEGACY_CREW = [0, 3, 8, 15, 25, 40, 70, 110, 160];
const LEGACY_CERTS = [0, 0, 0, 0, 0, 0, 3, 5, 8];
export const legacyGoals = (stage: number) => LEGACY_GOALS[stage] ?? [];
export function legacyRankRequirements(s: CareerState) {
  const index = s.stage + 1;
  return {
    earned: LEGACY_INCOME[index] ?? Infinity,
    crew: LEGACY_CREW[index] ?? Infinity,
    projects: LEGACY_CERTS[index] ?? Infinity,
  };
}
