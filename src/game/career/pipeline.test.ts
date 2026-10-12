// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { PipelineAllocation } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { simulatePipeline, stationCapacity } from "./pipelineFlow";
import { coreBudget, PIPELINE, PIPELINE_TRIALS } from "./pipelineData";
import { exportCareer, importCareer, normalizeCareer, loadCareer } from "./persistence";
import { BADGES, CAREER_RULES } from "./content";
import { automationIntent } from "./pipelineAutomation";
import { offlineCap } from "./selectors";

const NOW = 1_000_000;
function fixture() {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 100;
  s.pipeline.credits = 100;
  return s;
}
describe("continuous pipeline", () => {
  it("makes reallocation immediately meaningful: 1 to 3 releases/sec", () => {
    expect(
      simulatePipeline(stationCapacity([3, 2, 1], PIPELINE.rates), [0, 0], 60).released,
    ).toBe(60);
    expect(
      simulatePipeline(stationCapacity([1, 2, 3], PIPELINE.rates), [0, 0], 60).released,
    ).toBe(180);
  });
  it("conserves buffered work, drains it with build off and blocks at a full buffer", () => {
    expect(simulatePipeline([9, 3, 1], [0, 0], 100)).toEqual({
      queues: [200, 200],
      released: 100,
      elapsed: 100,
    });
    expect(simulatePipeline([0, 3, 2], [100, 0], 100)).toMatchObject({
      queues: [0, 0],
      released: 100,
    });
    expect(simulatePipeline([9, 3, 0], [0, 0], 1000)).toEqual({
      queues: [200, 200],
      released: 0,
      elapsed: 1000,
    });
  });
  it("matches split ticks through empty/full boundaries for every six-core allocation", () => {
    for (let build = 0; build <= 6; build++) {
      for (let verify = 0; verify <= 6 - build; verify++) {
        const capacity = stationCapacity(
          [build, verify, 6 - build - verify],
          PIPELINE.rates,
        );
        const initial: [number, number] = [73, 189];
        const whole = simulatePipeline(capacity, initial, 401.25);
        let queues = initial;
        let released = 0;
        for (let i = 0; i < 535; i++) {
          const result = simulatePipeline(capacity, queues, 0.75);
          queues = result.queues;
          released += result.released;
        }
        expect(whole.released).toBeCloseTo(released, 6);
        expect(whole.queues[0]).toBeCloseTo(queues[0], 6);
        expect(whole.queues[1]).toBeCloseTo(queues[1], 6);
        expect(whole.queues.every((q) => q >= 0 && q <= 200)).toBe(true);
      }
    }
  });
  it("rejects locked actions, overspending cores, negative and fractional allocation", () => {
    expect(act(newCareer(NOW), { type: "pipelineCore" }, NOW).ok).toBe(false);
    for (const station of [-1, 0.5, 3]) {
      expect(
        act(fixture(), { type: "pipelineAllocate", station, delta: -1 }, NOW).ok,
      ).toBe(false);
    }
    expect(
      act(fixture(), { type: "pipelineAllocate", station: 0, delta: 1 }, NOW).ok,
    ).toBe(false);
    const free = act(
      fixture(),
      { type: "pipelineAllocate", station: 0, delta: -1 },
      NOW,
    ).state;
    expect(
      act(free, { type: "pipelineAllocate", station: 2, delta: 1 }, NOW).state.pipeline
        .allocation,
    ).toEqual([2, 2, 2]);
  });
  it("settles the old allocation first and spends credits without reducing lifetime discoveries", () => {
    const bought = act(fixture(), { type: "pipelineCore" }, NOW).state;
    expect(bought.pipeline).toMatchObject({ credits: 75, total: 100, coreLevel: 1 });
    const changed = act(
      fixture(),
      { type: "pipelineAllocate", station: 2, delta: -1 },
      NOW + 10_000,
    ).state;
    expect(changed.pipeline.total).toBe(110);
    expect(advanceCareer(changed, NOW + 20_000).state.pipeline.total).toBe(110);
  });
});
describe("trial breakthroughs", () => {
  const solutions: PipelineAllocation[] = [
    [1, 1, 2],
    [1, 4, 1],
    [1, 1, 4],
  ];
  for (const [i, def] of PIPELINE_TRIALS.entries()) {
    it(def.title + " stops exactly and rewards once", () => {
      let s = act(fixture(), { type: "startTrial", id: def.id }, NOW).state;
      if (!s.pipeline.trial) {
        throw new Error("fixture");
      }
      s.pipeline.trial.allocation = solutions[i] ?? [1, 1, 2];
      s = advanceCareer(s, NOW + 1_000_000).state;
      expect(s.pipeline.trial?.progress).toBe(def.target);
      expect(s.pipeline.trial?.elapsed).toBe(def.target / 2);
      expect(s.pipeline.total).toBe(1100);
      expect(s.pipeline.completed).toEqual([]);
      const claimed = act(s, { type: "claimTrial" }, s.lastTick);
      expect(claimed.ok).toBe(true);
      expect(claimed.state.pipeline.completed).toEqual([def.id]);
      expect(act(claimed.state, { type: "claimTrial" }, s.lastTick).ok).toBe(false);
      expect(act(claimed.state, { type: "startTrial", id: def.id }, s.lastTick).ok).toBe(
        false,
      );
      if (def.id === "budget") {
        expect(coreBudget(claimed.state.pipeline)).toBe(8);
      }
    });
  }
  it("does not claim unfinished/cancelled trials and keeps rewards on prestige", () => {
    let s = fixture();
    s.pipeline.total = 99;
    expect(act(s, { type: "startTrial", id: "budget" }, NOW).ok).toBe(false);
    s = act(fixture(), { type: "startTrial", id: "budget" }, NOW).state;
    expect(act(s, { type: "claimTrial" }, NOW).ok).toBe(false);
    s = act(s, { type: "cancelTrial" }, NOW).state;
    expect(s.pipeline.completed).toEqual([]);
    s.stage = 5;
    s.earned = 5e6;
    s.pipeline.completed = ["budget", "deployment"];
    s.pipeline.automation.hire = true;
    expect(act(s, { type: "prestige" }, NOW).state.pipeline).toEqual(s.pipeline);
  });
});
describe("old-layer automation", () => {
  it("requires unlock and opt-in, and never spends retroactively", () => {
    const s = fixture();
    s.money = 10000;
    expect(advanceCareer(s, NOW + 60_000).state.crew.assistant).toBe(0);
    expect(
      act(s, { type: "pipelinePolicy", id: "upgrades", enabled: true }, NOW).ok,
    ).toBe(false);
    const enabled = act(
      s,
      { type: "pipelinePolicy", id: "hire", enabled: true },
      NOW + 60_000,
    ).state;
    expect(enabled.crew.assistant).toBe(0);
    expect(advanceCareer(enabled, NOW + 64_999).state.crew.assistant).toBe(0);
    expect(advanceCareer(enabled, NOW + 65_000).state.crew.assistant).toBe(1);
  });
  it("only starts missing bronze projects and can finish a manually chosen silver", () => {
    const s = fixture();
    s.stage = 8;
    s.pipeline.completed = ["verification"];
    s.pipeline.automation.projects = true;
    expect(automationIntent(s, "projects")).toEqual({
      type: "startProject",
      id: "button",
    });
    s.certificates = { button: 1 };
    expect(automationIntent(s, "projects")).not.toEqual({
      type: "startProject",
      id: "button",
    });
    const silver = act(s, { type: "startProject", id: "button" }, NOW).state;
    if (!silver.project) {
      throw new Error("fixture");
    }
    silver.project.progress = 1e10;
    expect(automationIntent(silver, "projects")).toEqual({ type: "submitProject" });
  });
  it.each([true, false])(
    "matches offline/fine ticks, dispatch, purchases, projects (all badges: %s)",
    (allBadges) => {
      const s = fixture();
      s.money = 10000;
      s.earned = 10000;
      s.stage = 3;
      s.bestStage = 3;
      s.crew.assistant = 15;
      s.upgrades = ["auto", "handover"];
      s.badges = allBadges ? BADGES.map((b) => b.id) : [];
      s.office = { ...s.office, licensed: true, contractId: "smoke" };
      s.pipeline.completed = ["budget", "verification", "deployment"];
      s.pipeline.automation = {
        hire: true,
        projects: true,
        promote: true,
        upgrades: true,
      };
      let fine = s;
      for (let i = 1; i <= 2401; i++) {
        fine = advanceCareer(fine, NOW + i * 250).state;
      }
      const long = advanceCareer(s, NOW + 600250, true).state;
      expect(long.money).toBeCloseTo(fine.money, 4);
      expect(long.crew).toEqual(fine.crew);
      expect(long.stage).toBe(fine.stage);
      expect(long.upgrades).toEqual(fine.upgrades);
      expect(long.badges).toEqual(fine.badges);
      expect(long.certificates).toEqual(fine.certificates);
      expect(long.project).toMatchObject({
        id: fine.project?.id,
        phase: fine.project?.phase,
      });
      expect(long.project?.progress).toBeCloseTo(fine.project?.progress ?? 0, 5);
      expect(long.office).toEqual(fine.office);
      expect(long.pipeline).toEqual(fine.pipeline);
      expect(long.crew.assistant).toBeGreaterThan(15);
      expect(long.certificates["button"]).toBe(1);
    },
  );
});
describe("persistence and offline", () => {
  it("preserves old saves, unlocks old prestigious careers and discards locked payloads", () => {
    const s = fixture();
    s.money = 456;
    s.certificates = { button: 1 };
    s.bestStage = 3;
    const old = { ...s, pipeline: undefined };
    expect(normalizeCareer(old, NOW)).toMatchObject({
      money: 456,
      certificates: { button: 1 },
      pipeline: newCareer(NOW).pipeline,
    });
    expect(normalizeCareer({ ...s, careers: 0 }, NOW).pipeline).toEqual(
      newCareer(NOW).pipeline,
    );
    expect(advanceCareer(newCareer(NOW), NOW + 60_000).state.pipeline.total).toBe(0);
  });
  it("sanitizes queues, allocation, policies and unknown/repeated trial ids", () => {
    const s = fixture();
    const normalized = normalizeCareer(
      {
        ...s,
        pipeline: {
          ...s.pipeline,
          allocation: [100, NaN, -1],
          queues: [Infinity, 500],
          completed: ["budget", "fake", "budget"],
          trial: { id: "fake" },
          automation: { hire: true, projects: true },
        },
      },
      NOW,
    );
    expect(normalized.pipeline).toMatchObject({
      allocation: [3, 2, 1],
      queues: [0, 200],
      completed: ["budget"],
      trial: null,
      automation: { hire: true, projects: false },
    });
    expect(importCareer(exportCareer(normalized), NOW)).toEqual(normalized);
  });
  it("caps core ownership by lifetime cost and discards premature trial rewards", () => {
    const s = fixture();
    s.pipeline.total = 24;
    s.pipeline.coreLevel = 6;
    s.pipeline.completed = ["budget", "verification", "deployment"];
    s.pipeline.automation.hire = true;
    expect(normalizeCareer(s, NOW).pipeline).toMatchObject({
      coreLevel: 0,
      completed: [],
      automation: { hire: false },
    });
  });
  it("round-trips an active trial, finishes offline and still requires manual claim", () => {
    let s = act(fixture(), { type: "startTrial", id: "budget" }, NOW).state;
    s = advanceCareer(s, NOW + 10000).state;
    const restored = importCareer(exportCareer(s), s.lastTick);
    expect(restored.pipeline.trial).toEqual(s.pipeline.trial);
    const finished = advanceCareer(restored, s.lastTick + 120000, true).state;
    expect(finished.pipeline.trial?.progress).toBe(60);
    expect(finished.pipeline.completed).toEqual([]);
    expect(
      act(finished, { type: "claimTrial" }, finished.lastTick).state.pipeline.completed,
    ).toEqual(["budget"]);
  });
  it("handles a full capped absence with every policy active", () => {
    const s = fixture();
    s.money = 50;
    s.upgrades = ["auto", "handover"];
    s.pipeline.completed = ["budget", "verification", "deployment"];
    s.pipeline.automation = { hire: true, upgrades: true, promote: true, projects: true };
    const result = advanceCareer(s, NOW + 100 * 3600000, true);
    expect(result.capped).toBe(true);
    expect(result.seconds).toBe(57600);
    expect(result.state.stage).toBeGreaterThanOrEqual(5);
    expect(result.state.careers).toBe(1);
    expect(result.state.money).toBeGreaterThanOrEqual(0);
    expect(Object.values(result.state.certificates).every((n) => n === 1)).toBe(true);
    expect(result.automatedActions).toBeGreaterThan(100);
  });
  it("applies cap/efficiency and checkpoints offline gains exactly once", () => {
    const s = fixture();
    s.pipeline.allocation = [1, 2, 3];
    const map = new Map<string, string>([[CAREER_RULES.saveKey, exportCareer(s)]]);
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
    const now = NOW + 100 * 3600000;
    const first = loadCareer(storage, now);
    expect(first.state.pipeline.total).toBe(100 + offlineCap(s) * 0.75 * 3);
    expect(first.summary?.pipelineCredits).toBe(offlineCap(s) * 0.75 * 3);
    expect(loadCareer(storage, now).state.pipeline).toEqual(first.state.pipeline);
  });
});
