// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BADGES, CAREER_RULES as R } from "./content";
import { exportCareer, importCareer, loadCareer } from "./persistence";
import { contractQuote, offlineCap, production, reportValue } from "./selectors";
import { officeLevel } from "./office";

const NOW = 1_000_000;
function fixture(patch: Partial<CareerState> = {}): CareerState {
  return {
    ...newCareer(NOW),
    stage: 3,
    bestStage: 3,
    crew: { ...newCareer(NOW).crew, assistant: 100 },
    upgrades: ["auto", "handover"],
    badges: BADGES.map((b) => b.id),
    contractsCompleted: 3,
    insights: 100,
    lifetimeInsights: 100,
    office: { licensed: true, contractId: "smoke", completed: 0, earned: 0, insights: 0 },
    ...patch,
  };
}
function storage(s: CareerState) {
  const data = new Map<string, string>([[R.saveKey, exportCareer(s)]]);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
}
describe("office dispatch", () => {
  it("requires rank, three contracts and 20 insights; license is bought only once", () => {
    const base = fixture({ office: newCareer(NOW).office });
    for (const patch of [{ bestStage: 2 }, { contractsCompleted: 2 }, { insights: 19 }]) {
      expect(act({ ...base, ...patch }, { type: "buyDispatcher" }, NOW).ok).toBe(false);
    }
    const bought = act(base, { type: "buyDispatcher" }, NOW).state;
    expect(bought.insights).toBe(80);
    expect(bought.office).toMatchObject({ licensed: true, contractId: null });
    expect(act(bought, { type: "buyDispatcher" }, NOW).ok).toBe(false);
  });
  it("rejects locked/unknown policies and an unlicensed dispatcher", () => {
    for (const id of ["launch", "bogus"]) {
      expect(act(fixture(), { type: "dispatch", id }, NOW).ok).toBe(false);
    }
    expect(act(newCareer(NOW), { type: "dispatch", id: "smoke" }, NOW).ok).toBe(false);
  });
  it("never applies the newly enabled policy to time before selection", () => {
    const started = act(
      fixture({ office: { ...fixture().office, contractId: null } }),
      { type: "dispatch", id: "smoke" },
      NOW + 600_000,
    ).state;
    expect(started.office.completed).toBe(0);
    expect(started.contract).toBeNull();
    expect(advanceCareer(started, started.lastTick + 60_000).state.office.completed).toBe(
      1,
    );
  });
  it("pays multiple contracts and keeps a partial final job", () => {
    const s = fixture();
    const result = advanceCareer(s, NOW + 150_000);
    expect(result.state.contractsCompleted).toBe(5);
    expect(result.state.office).toMatchObject({
      completed: 2,
      earned: 24_000,
      insights: 2,
    });
    expect(result.state.contract).toMatchObject({
      id: "smoke",
      elapsed: 30,
      target: 4_000,
      progress: 4_000,
    });
    expect(result.state.money).toBeCloseTo(production(s) * 150 * reportValue(s) + 24_000);
    expect(result.state.insights).toBe(102);
  });
  it("retains a matching active job's snapshotted reward, including v3 zero insights", () => {
    const s = fixture();
    const c = contractQuote(s, "smoke");
    if (!c) {
      throw new Error("fixture");
    }
    s.contract = { ...c, reward: 12_000, insights: 0, elapsed: 50, progress: 4_000 };
    const result = advanceCareer(s, NOW + 10_000);
    expect(result.state.office).toMatchObject({
      completed: 1,
      earned: 12_000,
      insights: 0,
    });
    expect(result.state.contract).toBeNull();
  });
  it("leaves a different job for manual claim and resumes afterwards", () => {
    const s = fixture();
    s.contract = contractQuote(s, "regression");
    const waiting = advanceCareer(s, NOW + 300_000).state;
    expect(waiting.office.completed).toBe(0);
    expect(waiting.contract).toMatchObject({ id: "regression", elapsed: 180 });
    const claimed = act(waiting, { type: "claim" }, waiting.lastTick).state;
    expect(advanceCareer(claimed, claimed.lastTick + 60_000).state.office.completed).toBe(
      1,
    );
  });
  it("pauses without discarding a job and cancellation pauses repetition", () => {
    const s = advanceCareer(fixture(), NOW + 30_000).state;
    const paused = act(s, { type: "dispatch", id: null }, s.lastTick).state;
    expect(paused.contract).toEqual(s.contract);
    expect(advanceCareer(paused, NOW + 300_000).state.office.completed).toBe(0);
    const cancelled = act(s, { type: "cancelContract" }, s.lastTick).state;
    expect(cancelled.contract).toBeNull();
    expect(cancelled.office.contractId).toBeNull();
  });
  it("cannot finish work with zero producers; manual bugs can subsequently unblock it", () => {
    const s = advanceCareer(fixture({ crew: newCareer(NOW).crew }), NOW + 600_000).state;
    expect(s.office.completed).toBe(0);
    expect(s.contract).toMatchObject({ elapsed: 60, progress: 0 });
    const c = s.contract;
    if (!c) {
      throw new Error("fixture");
    }
    const ready = { ...s, contract: { ...c, progress: c.target } };
    expect(advanceCareer(ready, ready.lastTick + 1_000).state.office.completed).toBe(1);
  });
  it("respects offline caps and checkpoints prevent replay", () => {
    const s = fixture();
    const store = storage(s);
    const first = loadCareer(store, NOW + 100 * 3_600_000);
    expect(first.state.office.completed).toBe(offlineCap(s) / 60);
    expect(first.summary).toMatchObject({
      autoContracts: 960,
      autoInsights: 960,
      capped: true,
    });
    const second = loadCareer(store, NOW + 100 * 3_600_000);
    expect(second.state.money).toBe(first.state.money);
    expect(second.state.office).toEqual(first.state.office);
  });
  it("uses reduced offline output when work is the bottleneck", () => {
    const s = fixture({ upgrades: [], crew: { ...newCareer(NOW).crew, assistant: 1 } });
    const online = advanceCareer(s, NOW + 5_500_000);
    const offline = advanceCareer(s, NOW + 5_500_000, true);
    expect(online.state.office.completed).toBe(1);
    expect(offline.state.office.completed).toBe(0);
  });
  it("matches fine ticks and a long advance without spending or badge changes", () => {
    const start = fixture();
    let fine = start;
    for (let i = 1; i <= 601; i++) {
      fine = advanceCareer(fine, NOW + i * 1_000).state;
    }
    const whole = advanceCareer(start, NOW + 601_000).state;
    expect(whole.office).toEqual(fine.office);
    expect(whole.money).toBeCloseTo(fine.money);
    expect(whole.contract?.progress).toBeCloseTo(fine.contract?.progress ?? 0);
    expect(whole.contract?.elapsed).toBeCloseTo(fine.contract?.elapsed ?? 0);
  });
  it("does not advance project phases while dispatch runs", () => {
    const started = act(fixture(), { type: "startProject", id: "button" }, NOW).state;
    const result = advanceCareer(started, NOW + 600_000).state;
    expect(result.project).toMatchObject({ phase: 0, progress: 80, elapsed: 20 });
    expect(result.certificates).toEqual({});
    expect(result.office.completed).toBe(10);
  });
  it("keeps license, location and statistics on prestige but clears the selected policy", () => {
    const state = advanceCareer(
      fixture({ stage: 5, bestStage: 8, earned: 5e6 }),
      NOW + 600_000,
    ).state;
    const result = act(state, { type: "prestige" }, state.lastTick).state;
    expect(result.office).toEqual({ ...state.office, contractId: null });
    expect(result.contract).toBeNull();
    expect(officeLevel(result)).toBe(4);
    expect(importCareer(exportCareer(result), result.lastTick).office).toEqual(
      result.office,
    );
  });
  it("defaults old v4 saves, removes unearned licenses and sanitizes unknown policies", () => {
    const old = { ...fixture(), office: undefined };
    expect(importCareer(JSON.stringify(old), NOW).office).toEqual(newCareer(NOW).office);
    const invalid = {
      ...fixture(),
      office: {
        licensed: true,
        contractId: "bogus",
        completed: Infinity,
        earned: -1,
        insights: -9,
      },
    };
    expect(importCareer(JSON.stringify(invalid), NOW).office).toEqual({
      ...newCareer(NOW).office,
      licensed: true,
    });
    expect(
      importCareer(exportCareer(fixture({ contractsCompleted: 0 })), NOW).office.licensed,
    ).toBe(false);
  });
  it("grants nothing for invalid or backwards elapsed time", () => {
    const s = fixture();
    for (const now of [NOW, NOW - 1, Infinity, NaN]) {
      expect(advanceCareer(s, now).state).toBe(s);
    }
  });
});
