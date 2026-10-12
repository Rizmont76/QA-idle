// @vitest-environment node
import { describe, expect, it } from "vitest";
import { act, advanceCareer, newCareer } from "./engine";
import { manualPower, reportValue } from "./selectors";
import { production } from "./selectors";
import { BADGES, CAREER_RULES, CAREER_UPGRADES } from "./content";
import type { CareerState } from "../../types";

describe("atomic automatic reporting", () => {
  it("pays a manual report above the former cash cap at the full current price", () => {
    const s = { ...newCareer(1), stage: 8, bestStage: 8, bugs: CAREER_RULES.limit };
    const next = act(s, { type: "report" }, 1).state;
    expect(next.money).toBe(CAREER_RULES.limit * reportValue(s));
    expect(next.earned).toBe(next.money);
    expect(next.rankEarned).toBe(next.money);
    expect(next.bugs).toBe(0);
  });
  it("pays the full automatic flow even when a long tick exceeds the unsold inventory cap", () => {
    const s: CareerState = {
      ...newCareer(1),
      stage: 8,
      bestStage: 8,
      experience: CAREER_RULES.experienceLimit,
      badges: BADGES.map((b) => b.id),
      upgrades: CAREER_UPGRADES.map((u) => u.id),
    };
    for (const id of Object.keys(s.crew) as (keyof typeof s.crew)[]) {
      s.crew[id] = CAREER_RULES.crewLimit;
    }
    const next = advanceCareer(s, 2001).state;
    expect(production(s) * 2).toBeGreaterThan(CAREER_RULES.limit);
    expect(next.money / (production(s) * 2 * reportValue(s))).toBeCloseTo(1, 12);
    let fine = s;
    for (let i = 1; i <= 8; i++) {
      fine = advanceCareer(fine, 1 + i * 250).state;
    }
    expect(fine.money / next.money).toBeCloseTo(1, 12);
    expect(next.bugs).toBe(0);
  });
  it("settles existing stock when the $80 upgrade is bought", () => {
    const s = { ...newCareer(0), stage: 1, money: 80, bugs: 9, found: 9 };
    const bought = act(s, { type: "upgrade", id: "auto" }, 0);
    expect(bought.ok).toBe(true);
    expect(bought.state.bugs).toBe(0);
    expect(bought.state.money).toBe(9 * reportValue(s));
    expect(bought.state.earned).toBe(9 * reportValue(s));
    expect(bought.state.found).toBe(9);
  });
  it("pays a manual test without exposing pending bugs or losing project work", () => {
    let s = { ...newCareer(0), stage: 1, upgrades: ["auto"] };
    s = act(s, { type: "startProject", id: "button" }, 0).state;
    const power = manualPower(s);
    const next = act(s, { type: "test" }, 0).state;
    expect(next.bugs).toBe(0);
    expect(next.money - s.money).toBeCloseTo(power * reportValue(s));
    expect(next.found - s.found).toBeCloseTo(power);
    expect(next.project?.progress).toBeGreaterThan(s.project?.progress ?? 0);
    expect(advanceCareer(next, 250).state.found).toBe(next.found);
  });
  it("keeps manual-report stock available before automation", () => {
    const next = act(newCareer(0), { type: "test" }, 0).state;
    expect(next.bugs).toBeGreaterThan(0);
    expect(next.money).toBe(0);
  });
});
