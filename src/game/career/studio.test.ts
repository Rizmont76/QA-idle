// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerState } from "../../types";
import { act, advanceCareer, awardBadges, newCareer } from "./engine";
import { BADGES, CAREER_RULES as R, CAREER_STAGES, CONTRACTS, CREW } from "./content";
import { PROJECTS, RESEARCH, SPECIALISTS } from "./expansionData";
import {
  contractQuote,
  hireQuote,
  manualPower,
  nextCrewCost,
  offlineCap,
  offlineEfficiency,
  prestigeReward,
  production,
  promotionReady,
} from "./selectors";
import {
  certificates,
  projectPhase,
  projectQuote,
  projectReady,
  projectUnlocked,
  researchBonus,
  researchCost,
  specialistSlots,
  staffBonus,
} from "./studioSelectors";
import { exportCareer, importCareer, loadCareer } from "./persistence";

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Missing test fixture");
  }
  return value;
}
const NOW = 100_000;
function fixture(overrides: Partial<CareerState> = {}): CareerState {
  return {
    ...newCareer(NOW),
    stage: 8,
    bestStage: 8,
    money: 1e12,
    insights: 1_000,
    lifetimeInsights: 1_000,
    badges: BADGES.map((b) => b.id),
    ...overrides,
  };
}
function firstCertificates(count: number): Record<string, number> {
  return Object.fromEntries(PROJECTS.slice(0, count).map((p) => [p.id, 1]));
}
function finishPhase(s: CareerState): CareerState {
  const phase = s.project && projectPhase(s.project);
  if (!phase) {
    throw new Error("Missing active phase");
  }
  const seconds =
    Math.max(phase.seconds - (s.project?.elapsed ?? 0), phase.target / production(s)) + 1;
  const advanced = advanceCareer(s, s.lastTick + seconds * 1_000).state;
  return act(advanced, { type: "submitProject" }, advanced.lastTick).state;
}
function memory(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("project campaign", () => {
  it("gates rank, predecessor, tier and the single project slot", () => {
    const junior = newCareer(NOW);
    expect(act(junior, { type: "startProject", id: "button" }, NOW).ok).toBe(false);
    expect(act(fixture(), { type: "startProject", id: "cart" }, NOW).ok).toBe(false);
    const started = act(fixture(), { type: "startProject", id: "button" }, NOW).state;
    expect(act(started, { type: "startProject", id: "button" }, NOW).ok).toBe(false);
    expect(
      projectUnlocked(
        fixture({ stage: 1, certificates: { button: 1 } }),
        required(PROJECTS[0]),
      ),
    ).toBe(false);
    expect(
      act(
        fixture({ certificates: { button: 3 } }),
        { type: "startProject", id: "button" },
        NOW,
      ).ok,
    ).toBe(false);
  });
  it("counts only new bugs and requires both work and elapsed time", () => {
    let s = act(
      fixture({ bugs: 1e8 }),
      { type: "startProject", id: "button" },
      NOW,
    ).state;
    expect(s.project?.progress).toBe(0);
    expect(act(s, { type: "submitProject" }, NOW).ok).toBe(false);
    s = act(s, { type: "test" }, NOW).state;
    expect(s.project?.progress).toBeGreaterThan(0);
    s = { ...s, project: { ...required(s.project), progress: 80, elapsed: 0 } };
    expect(projectReady(s)).toBe(false);
    s = advanceCareer(s, NOW + 20_000).state;
    expect(projectReady(s)).toBe(true);
  });
  it("offline completes only the current phase and cannot award certificates", () => {
    let s = fixture({ crew: { ...newCareer(NOW).crew, assistant: 100 } });
    s = act(s, { type: "startProject", id: "button" }, NOW).state;
    const result = advanceCareer(s, NOW + 100 * 3_600_000, true);
    expect(result.capped).toBe(true);
    expect(result.state.project).toMatchObject({ phase: 0, progress: 80, elapsed: 20 });
    expect(result.state.certificates).toEqual({});
    const next = act(
      result.state,
      { type: "submitProject" },
      result.state.lastTick,
    ).state;
    expect(next.project).toMatchObject({ phase: 1, progress: 0, elapsed: 0 });
    expect(act(next, { type: "submitProject" }, next.lastTick).ok).toBe(false);
  });
  it("submits all three phases, awards once and unlocks the next client and specialist", () => {
    let s = fixture({ crew: { ...newCareer(NOW).crew, assistant: 100 } });
    const before = s.money;
    s = act(s, { type: "startProject", id: "button" }, NOW).state;
    for (let phase = 0; phase < 3; phase++) {
      s = finishPhase(s);
    }
    expect(s.project).toBeNull();
    expect(s.certificates).toEqual({ button: 1 });
    expect(s.money).toBe(before + 800);
    expect(s.insights).toBe(1_003);
    expect(s.lifetimeInsights).toBe(1_003);
    expect(act(s, { type: "submitProject" }, s.lastTick).ok).toBe(false);
    expect(act(s, { type: "assignSpecialist", id: "marta" }, s.lastTick).ok).toBe(true);
    expect(projectUnlocked(s, required(PROJECTS[1]))).toBe(true);
  });
  it("snapshots research and rewards, and replays increase difficulty", () => {
    let s = fixture({ research: { fieldnotes: 2, discoveries: 1 } });
    s = act(s, { type: "startProject", id: "button" }, NOW).state;
    expect(projectPhase(required(s.project))?.target).toBe(74);
    const accepted = s.project;
    s = act(s, { type: "research", id: "fieldnotes" }, NOW).state;
    expect(s.project).toEqual(accepted);
    const silver = projectQuote(
      fixture({ certificates: { button: 1 } }),
      required(PROJECTS[0]),
    );
    expect(silver).toMatchObject({ tier: 1, reward: 8_000, insights: 6 });
    expect(projectPhase(silver)).toMatchObject({ target: 960, seconds: 25 });
  });
  it("cancellation discards active work but preserves certificates", () => {
    let s = act(
      fixture({ certificates: { button: 1 } }),
      { type: "startProject", id: "cart" },
      NOW,
    ).state;
    s = act(s, { type: "cancelProject" }, NOW).state;
    expect(s.project).toBeNull();
    expect(s.certificates).toEqual({ button: 1 });
  });
});

describe("permanent studio", () => {
  it("enforces research prerequisites, currency, geometric prices and caps", () => {
    expect(act(newCareer(NOW), { type: "research", id: "automation" }, NOW).ok).toBe(
      false,
    );
    let s = fixture();
    expect(act(s, { type: "research", id: "procurement" }, NOW).ok).toBe(false);
    s = act(s, { type: "research", id: "automation" }, NOW).state;
    expect(s.insights).toBe(997);
    expect(s.research["automation"]).toBe(1);
    expect(researchCost(s, required(RESEARCH[0]))).toBe(6);
    expect(act(s, { type: "research", id: "procurement" }, NOW).ok).toBe(true);
    s = { ...s, insights: 0 };
    expect(act(s, { type: "research", id: "automation" }, NOW).ok).toBe(false);
    s = fixture({ research: { automation: 5 } });
    expect(act(s, { type: "research", id: "automation" }, NOW).ok).toBe(false);
  });
  it("discounts individual prices consistently in bulk purchases", () => {
    const s = fixture({ research: { automation: 1, procurement: 4 }, money: 100 });
    expect(nextCrewCost(s, "assistant")).toBe(20);
    expect(hireQuote(s, "assistant", 10)).toEqual({ count: 3, cost: 80 });
    expect(act(s, { type: "hire", id: "assistant", mode: 10 }, NOW).state.money).toBe(20);
  });
  it("never applies unassigned or unrecruited specialist bonuses", () => {
    const s = fixture({ specialists: ["marta"] });
    expect(staffBonus(s, "manual")).toBe(0);
    expect(act(s, { type: "assignSpecialist", id: "nika" }, NOW).ok).toBe(false);
    expect(staffBonus(fixture({ certificates: { button: 1 } }), "manual")).toBe(0);
  });
  it("enforces two slots, opens a third through research and permits reassignment", () => {
    let s = fixture({ certificates: firstCertificates(6) });
    for (const id of ["marta", "taras"]) {
      s = act(s, { type: "assignSpecialist", id }, NOW).state;
    }
    expect(act(s, { type: "assignSpecialist", id: "sofia" }, NOW).ok).toBe(false);
    s = { ...s, research: { automation: 3, leadership: 1 } };
    s = act(s, { type: "research", id: "coordination" }, NOW).state;
    expect(specialistSlots(s)).toBe(3);
    s = act(s, { type: "assignSpecialist", id: "sofia" }, NOW).state;
    expect(s.specialists).toHaveLength(3);
    s = act(s, { type: "assignSpecialist", id: "marta" }, NOW).state;
    expect(s.specialists).toEqual(["taras", "sofia"]);
  });
  it("applies specialized production and settles old output before assignment", () => {
    const s = fixture({
      certificates: firstCertificates(4),
      crew: { ...newCareer(NOW).crew, assistant: 1 },
    });
    const oldRate = production(s);
    const assigned = act(s, { type: "assignSpecialist", id: "lev" }, NOW + 1_000).state;
    expect(assigned.bugs).toBeCloseTo(oldRate);
    expect(production(assigned)).toBeCloseTo(oldRate * 1.3);
    const marta = { ...s, specialists: ["marta"], crew: newCareer(NOW).crew };
    expect(manualPower(marta)).toBeCloseTo(
      manualPower({ ...marta, specialists: [] }) * 1.5,
    );
  });
  it("extends offline cap and efficiency without exceeding 100 percent", () => {
    const s = fixture({
      certificates: firstCertificates(6),
      specialists: ["orest"],
      research: { automation: 1, archive: 4, nightshift: 4 },
    });
    expect(offlineCap(s)).toBe(14 * 3_600);
    expect(offlineEfficiency(s)).toBe(1);
    expect(offlineCap({ ...s, upgrades: ["handover"] })).toBe(22 * 3_600);
  });
  it("keeps studio and certificates through Director and later prestige", () => {
    const s = fixture({
      stage: 5,
      earned: 2_500_000,
      certificates: firstCertificates(3),
      research: { automation: 2 },
      specialists: ["marta", "taras"],
      project: projectQuote(fixture(), required(PROJECTS[0])),
    });
    expect(prestigeReward(s)).toBe(5);
    const after = act(s, { type: "prestige" }, NOW).state;
    expect(after).toMatchObject({
      stage: 0,
      money: 50,
      experience: 5,
      project: null,
      research: s.research,
      certificates: s.certificates,
      specialists: s.specialists,
      insights: s.insights,
    });
    expect(after.upgrades).toEqual(["auto"]);
    expect(prestigeReward(fixture({ earned: 25_000_000_000 }))).toBe(500);
    expect(
      prestigeReward(
        fixture({ earned: 25_000_000_000, experience: R.experienceLimit - 2 }),
      ),
    ).toBe(2);
  });
});

describe("expanded contracts and promotions", () => {
  it("gates new contracts and snapshots cash, time and insight bonuses", () => {
    expect(contractQuote(fixture({ stage: 3 }), "launch")).toBeNull();
    const base = fixture({
      stage: 3,
      certificates: firstCertificates(3),
      specialists: ["sofia"],
      research: {
        bargaining: 1,
        reputation: 4,
        fieldnotes: 2,
        pipelines: 4,
        discoveries: 3,
      },
    });
    const quote = contractQuote(base, "smoke");
    expect(quote).toMatchObject({
      duration: 48,
      reward: 19_200,
      target: 4_000,
      insights: 1,
    });
    const accepted = act(base, { type: "contract", id: "smoke" }, NOW).state;
    const switched = act(accepted, { type: "assignSpecialist", id: "sofia" }, NOW).state;
    expect(switched.contract).toEqual(quote);
    expect(importCareer(exportCareer(switched), NOW).contract).toEqual(quote);
  });
  it("pays permanent insights on contract claim exactly once", () => {
    let s = act(fixture({ stage: 3 }), { type: "contract", id: "regression" }, NOW).state;
    s = { ...s, contract: { ...required(s.contract), progress: 16_000, elapsed: 180 } };
    const claimed = act(s, { type: "claim" }, NOW);
    expect(claimed.state.insights).toBe(1_004);
    expect(act(claimed.state, { type: "claim" }, NOW).ok).toBe(false);
    expect(claimed.state.contractsCompleted).toBe(1);
  });
  it("requires certificates for the optional post-Director ranks", () => {
    let s = fixture({
      stage: 5,
      earned: 50_000_000,
      crew: { ...newCareer(NOW).crew, assistant: 70 },
    });
    expect(promotionReady(s)).toBe(false);
    s = { ...s, certificates: firstCertificates(3) };
    expect(act(s, { type: "promote" }, NOW).state.stage).toBe(6);
    expect(certificates(s)).toBe(3);
  });
  it("ships complete registries without duplicate IDs or impossible prerequisite order", () => {
    expect(CAREER_STAGES).toHaveLength(9);
    expect(CREW).toHaveLength(7);
    expect(CONTRACTS).toHaveLength(9);
    expect(PROJECTS).toHaveLength(9);
    expect(RESEARCH).toHaveLength(12);
    expect(SPECIALISTS).toHaveLength(6);
    for (const list of [PROJECTS, RESEARCH, SPECIALISTS, CONTRACTS, CREW, BADGES]) {
      expect(new Set(list.map((x) => x.id)).size).toBe(list.length);
    }
    for (const p of PROJECTS) {
      expect(p.phases).toHaveLength(3);
    }
    for (const r of RESEARCH) {
      if (r.requires) {
        expect(RESEARCH.findIndex((p) => p.id === r.requires?.id)).toBeLessThan(
          RESEARCH.indexOf(r),
        );
      }
    }
  });
});

describe("studio persistence", () => {
  it("rejects missing or malformed crew data instead of replacing it with an empty team", () => {
    for (const schemaVersion of [3, 4]) {
      for (const crew of [null, [], "team", undefined]) {
        const raw = JSON.stringify({ ...fixture(), schemaVersion, crew });
        expect(() => importCareer(raw, NOW)).toThrow();
        const store = memory({ [R.saveKey]: raw });
        expect(loadCareer(store, NOW).blocked).toBe(true);
        expect(store.map.get(R.saveKey)).toBe(raw);
      }
    }
  });
  it("migrates v3 without resetting progress and preserves its original bytes", () => {
    const old = {
      ...newCareer(NOW),
      schemaVersion: 3,
      stage: 3,
      bestStage: 3,
      money: 500,
      earned: 50_000,
      crew: { assistant: 10, squad: 5, runner: 1, lab: 0 },
      upgrades: ["auto"],
      contract: {
        id: "smoke",
        title: "old",
        target: 4_000,
        reward: 12_000,
        duration: 60,
        elapsed: 30,
        progress: 500,
      },
    };
    const raw = JSON.stringify(old);
    const store = memory({ [R.previousKey]: raw });
    const loaded = loadCareer(store, NOW + 60_000);
    expect(loaded.blocked).toBe(false);
    expect(loaded.state).toMatchObject({
      schemaVersion: 4,
      stage: 3,
      research: {},
      certificates: {},
      insights: 0,
    });
    expect(loaded.state.money).toBeGreaterThan(500);
    expect(loaded.state.crew).toMatchObject({ assistant: 10, runner: 1, cloud: 0 });
    expect(loaded.state.contract).toMatchObject({
      reward: 12_000,
      insights: 0,
      elapsed: 60,
    });
    expect(store.map.get(R.previousKey)).toBe(raw);
    const again = loadCareer(store, NOW + 60_000);
    expect(again.state.money).toBe(loaded.state.money);
  });
  it("roundtrips a partially completed project, research and assigned staff", () => {
    let s = fixture({
      certificates: firstCertificates(2),
      specialists: ["marta"],
      research: { fieldnotes: 2, discoveries: 1 },
      badges: [],
    });
    s = act(s, { type: "startProject", id: "mobile" }, NOW).state;
    s = advanceCareer(s, NOW + 10_000).state;
    const normalized = importCareer(exportCareer(s), s.lastTick);
    expect(normalized.project).toEqual(s.project);
    expect(normalized.research).toEqual(s.research);
    expect(normalized.certificates).toEqual(s.certificates);
    expect(normalized.specialists).toEqual(["marta"]);
  });
  it("rejects out-of-order certificates, locked staff, unsupported nodes and missing prerequisites", () => {
    const s = importCareer(
      JSON.stringify({
        ...fixture(),
        certificates: { button: 99, mobile: 1, fake: 100 },
        research: { automation: 99, fieldnotes: -2, discoveries: 9, fake: 99 },
        specialists: ["marta", "marta", "nika", "fake"],
        insights: -5,
      }),
      NOW,
    );
    expect(s.certificates).toEqual({ button: 3 });
    expect(s.research).toEqual({ automation: 5 });
    expect(s.specialists).toEqual(["marta"]);
    expect(s.insights).toBe(0);
    expect(researchBonus(s, "insight")).toBe(0);
  });
  it("discards malformed or already completed active projects without granting a reward", () => {
    const project = projectQuote(fixture(), required(PROJECTS[0]));
    for (const patch of [
      { phase: 3 },
      { tier: -1 },
      { reward: 1e15 },
      { workMultiplier: 0 },
      { id: "unknown" },
    ]) {
      const s = importCareer(
        JSON.stringify({ ...fixture(), project: { ...project, ...patch } }),
        NOW,
      );
      expect(s.project).toBeNull();
      expect(s.money).toBe(1e12);
    }
    expect(
      importCareer(
        JSON.stringify({ ...fixture(), certificates: { button: 1 }, project }),
        NOW,
      ).project,
    ).toBeNull();
  });
  it("does not fall back over a broken v4 save or overwrite its original", () => {
    const store = memory({
      [R.saveKey]: "broken",
      [R.previousKey]: JSON.stringify({
        ...newCareer(NOW),
        schemaVersion: 3,
        money: 500,
      }),
    });
    expect(loadCareer(store, NOW).blocked).toBe(true);
    expect(store.map.get(R.saveKey)).toBe("broken");
  });
  it("normalizes all new counters to finite safe values", () => {
    const state = fixture({ insights: -1, lifetimeInsights: Number.POSITIVE_INFINITY });
    const result = importCareer(exportCareer(state), NOW);
    expect(result.insights).toBe(0);
    expect(result.lifetimeInsights).toBe(0);
    expect(awardBadges(newCareer(NOW)).badges).toEqual([]);
  });
});
