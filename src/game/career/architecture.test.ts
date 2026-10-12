// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerAction, CareerState, RackModuleId } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BLUEPRINTS, newArchitecture } from "./architectureData";
import { blueprintProgress, blueprintReady } from "./architectureActions";
import {
  architectureEffects,
  architectureUnlocked,
  balanceArchitecture,
  neighbors,
  pipelineRates,
  powerBudget,
  powerUsed,
  sustainableRate,
} from "./architectureEffects";
import { coreBudget, PIPELINE, PIPELINE_TRIALS } from "./pipelineData";
import { advancePipeline } from "./pipelineFlow";
import { exportCareer, importCareer, normalizeCareer } from "./persistence";
import { crewRate } from "./selectors";
import { projectThroughput } from "./studioSelectors";
import { BADGES, CAREER_RULES } from "./content";

const NOW = 1_000_000;
function fixture() {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.completed = PIPELINE_TRIALS.map((t) => t.id);
  s.pipeline.credits = 2000;
  s.pipeline.total = 2000;
  return s;
}
function apply(s: CareerState, action: CareerAction) {
  const result = act(s, action, s.lastTick);
  expect(result.ok, result.message).toBe(true);
  return result.state;
}
function arrange(s: CareerState, layout: (RackModuleId | null)[]) {
  // Remove first so legal rearrangements never need temporary extra power.
  for (let i = 0; i < layout.length; i++) {
    s = apply(s, { type: "rackModule", slot: i, id: null });
  }
  for (const [slot, id] of layout.entries()) {
    s = apply(s, { type: "rackModule", slot, id });
  }
  return s;
}
const BUS_LAYOUT: (RackModuleId | null)[] = [
  "build",
  "bus",
  "verify",
  null,
  "deploy",
  null,
];
const STUDIO_LAYOUT: (RackModuleId | null)[] = [
  "build",
  "archive",
  null,
  "manager",
  "verify",
  null,
];

describe("rack topology and immediate effects", () => {
  it("connects sides only, without row wrap or diagonal neighbours", () => {
    expect(neighbors(0)).toEqual([1, 3]);
    expect(neighbors(1)).toEqual([0, 2, 4]);
    expect(neighbors(2)).toEqual([1, 5]);
    expect(neighbors(3)).toEqual([0, 4]);
    expect(neighbors(4)).toEqual([1, 3, 5]);
    expect(neighbors(5)).toEqual([2, 4]);
  });
  it("makes equal-power arrangements produce different rates", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = ["cycle"];
    const linked = arrange(s, BUS_LAYOUT);
    const unlinked = arrange(s, ["build", "verify", "deploy", "bus", null, null]);
    expect(powerUsed(linked.pipeline.architecture.layout)).toBe(7);
    expect(powerUsed(unlinked.pipeline.architecture.layout)).toBe(7);
    expect(pipelineRates(linked)).toEqual([4.5, 2.625, 1.75]);
    expect(pipelineRates(unlinked)).toEqual([4.5, 2.25, 1.5]);
    expect(blueprintProgress(linked, "bus")).toBe(3);
    expect(blueprintProgress(unlinked, "bus")).toBe(1);
  });
  it("stacks buses on module contributions, never on base rates", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = ["cycle"];
    const linked = arrange(s, ["bus", "build", "bus", null, "bus", null]);
    expect(pipelineRates(linked)).toEqual([5.5, 1.5, 1]);
  });
  it("applies real crew and project bonuses and removes them on reconfiguration", () => {
    const s = fixture();
    s.crew.assistant = 10;
    s.pipeline.architecture.blueprints = ["cycle", "bus", "flow"];
    const configured = arrange(s, STUDIO_LAYOUT);
    expect(architectureEffects(configured)).toMatchObject({ crew: 1.4, projects: 1.5 });
    expect(crewRate(configured, "assistant")).toBeCloseTo(crewRate(s, "assistant") * 1.4);
    expect(projectThroughput(configured)).toBeCloseTo(projectThroughput(s) * 1.5);
    const removed = arrange(configured, [null, null, null, null, null, null]);
    expect(crewRate(removed, "assistant")).toBe(crewRate(s, "assistant"));
    expect(projectThroughput(removed)).toBe(projectThroughput(s));
  });
  it("enforces module unlocks, slots and power; replacement is free", () => {
    const s = fixture();
    expect(act(s, { type: "rackModule", slot: 0, id: "bus" }, NOW).ok).toBe(false);
    for (const slot of [-1, 6, 0.5, NaN]) {
      expect(act(s, { type: "rackModule", slot, id: "build" }, NOW).ok).toBe(false);
    }
    const full = arrange(s, ["build", "build", "build", "build", null, null]);
    expect(act(full, { type: "rackModule", slot: 4, id: "build" }, NOW).ok).toBe(false);
    const replaced = apply(full, { type: "rackModule", slot: 0, id: "verify" });
    expect(powerUsed(replaced.pipeline.architecture.layout)).toBe(8);
    expect(replaced.pipeline.credits).toBe(s.pipeline.credits);
    expect(full.pipeline.architecture.layout[0]).toBe("build");
  });
  it("buys bounded permanent power with existing credits", () => {
    let s = fixture();
    s = apply(s, { type: "rackPower" });
    expect(s.pipeline.credits).toBe(1750);
    s = apply(s, { type: "rackPower" });
    expect(s.pipeline.credits).toBe(250);
    expect(powerBudget(s)).toBe(10);
    expect(act(s, { type: "rackPower" }, NOW).ok).toBe(false);
    s.pipeline.architecture.blueprints = ["cycle", "bus"];
    expect(powerBudget(s)).toBe(11);
    expect(s.pipeline.total).toBe(2000);
  });
  it("settles old rates before an edit and leaves trial simulation unchanged", () => {
    const s = fixture();
    s.pipeline.trial = {
      id: "budget",
      allocation: [1, 1, 2],
      queues: [0, 0],
      progress: 0,
      elapsed: 0,
    };
    const edited = act(
      s,
      { type: "rackModule", slot: 0, id: "deploy" },
      NOW + 10000,
    ).state;
    expect(edited.pipeline.total).toBe(2010);
    const next = advanceCareer(edited, NOW + 20000).state;
    expect(next.pipeline.total).toBe(2025);
    expect(next.pipeline.trial).toEqual(
      advanceCareer(s, NOW + 20000).state.pipeline.trial,
    );
  });
});

describe("blueprint discovery path", () => {
  it("solves all four without waiting and grants each reward exactly once", () => {
    let s = arrange(fixture(), ["build", "verify", "deploy", null, null, null]);
    expect(blueprintReady(s, "bus")).toBe(false);
    s = apply(s, { type: "claimBlueprint", id: "cycle" });
    expect(act(s, { type: "claimBlueprint", id: "cycle" }, NOW).ok).toBe(false);
    s = arrange(s, BUS_LAYOUT);
    s = apply(s, { type: "claimBlueprint", id: "bus" });
    expect(powerBudget(s)).toBe(9);
    for (let i = 0; i < 3; i++) {
      s = apply(s, { type: "pipelineCore" });
    }
    s.pipeline.allocation = [2, 4, 5];
    expect(sustainableRate(s)).toBe(8.75);
    s = apply(s, { type: "claimBlueprint", id: "flow" });
    expect(s.pipeline.architecture.autoBalance).toBe(false);
    s = arrange(s, STUDIO_LAYOUT);
    s = apply(s, { type: "claimBlueprint", id: "studio" });
    expect(s.pipeline.architecture.blueprints).toEqual(BLUEPRINTS.map((b) => b.id));
    expect(s.pipeline.architecture.autoCores).toBe(false);
    expect(s.lastTick).toBe(NOW);
    for (const { id } of BLUEPRINTS) {
      expect(act(s, { type: "claimBlueprint", id }, NOW).ok).toBe(false);
    }
  });
  it("requires sustained capacity, not buffer bursts; offline never claims", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = ["cycle", "bus"];
    s.pipeline.allocation = [0, 0, 8];
    s.pipeline.queues = [200, 200];
    expect(advancePipeline(s, 1).total - s.pipeline.total).toBe(8);
    expect(blueprintReady(s, "flow")).toBe(false);
    const configured = arrange(s, BUS_LAYOUT);
    const offline = advanceCareer(configured, NOW + 100000, true).state;
    expect(offline.pipeline.architecture.blueprints).toEqual(["cycle", "bus"]);
  });
});

describe("pipeline automation and persistence", () => {
  it("keeps offline badge timing consistent after the last automatic core purchase", () => {
    const s = fixture();
    s.crew.assistant = 1;
    s.upgrades = ["auto", "handover"];
    s.pipeline.coreLevel = 5;
    s.pipeline.credits = 10000;
    s.pipeline.total = 20000;
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    s.pipeline.architecture.autoCores = true;
    let fine = s;
    for (let i = 1; i <= 2400; i++) {
      fine = advanceCareer(fine, NOW + i * 250).state;
    }
    const offline = advanceCareer(s, NOW + 600000, true).state;
    expect(offline.pipeline.coreLevel).toBe(6);
    expect(offline.badges).toEqual(fine.badges);
    expect(offline.money).toBeCloseTo(fine.money, 5);
  });
  it("normalizes enabled balancing and retains its flags through export and import", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    s.pipeline.architecture.autoBalance = true;
    s.pipeline.architecture.autoCores = true;
    s.pipeline.architecture.layout = BUS_LAYOUT;
    s.pipeline.allocation = [8, 0, 0];
    const restored = importCareer(exportCareer(s), NOW);
    expect(sustainableRate(restored)).toBeGreaterThan(0);
    expect(restored.pipeline).toEqual(balanceArchitecture(s).pipeline);
    expect(importCareer(exportCareer(restored), NOW).pipeline).toEqual(restored.pipeline);
  });
  it("maximizes sustained flow, uses every core and preserves optimal ties", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = ["cycle", "bus", "flow"];
    s.pipeline.architecture.autoBalance = true;
    for (let level = 0; level <= PIPELINE.maxCoreLevel; level++) {
      s.pipeline.coreLevel = level;
      const configured = arrange(s, BUS_LAYOUT);
      const balanced = balanceArchitecture(configured);
      const budget = coreBudget(s.pipeline);
      expect(balanced.pipeline.allocation.reduce((a, b) => a + b, 0)).toBe(budget);
      for (let b = 0; b <= budget; b++) {
        for (let v = 0; v <= budget - b; v++) {
          const alternative = {
            ...configured,
            pipeline: {
              ...configured.pipeline,
              allocation: [b, v, budget - b - v] as [number, number, number],
            },
          };
          expect(sustainableRate(balanced)).toBeGreaterThanOrEqual(
            sustainableRate(alternative),
          );
        }
      }
      expect(balanceArchitecture(balanced).pipeline.allocation).toEqual(
        balanced.pipeline.allocation,
      );
    }
  });
  it("rebalances after edits and purchases, locks manual main allocation only", () => {
    let s = fixture();
    s.pipeline.architecture.blueprints = ["cycle", "bus", "flow"];
    s = apply(s, { type: "architecturePolicy", id: "autoBalance", enabled: true });
    expect(act(s, { type: "pipelineAllocate", station: 0, delta: -1 }, NOW).ok).toBe(
      false,
    );
    s = apply(s, { type: "pipelineCore" });
    expect(s.pipeline.allocation.reduce((a, b) => a + b, 0)).toBe(9);
    s = arrange(s, BUS_LAYOUT);
    expect(s.pipeline.allocation).toEqual(balanceArchitecture(s).pipeline.allocation);
    s.pipeline.trial = {
      id: "budget",
      allocation: [2, 1, 1],
      queues: [0, 0],
      progress: 0,
      elapsed: 0,
    };
    expect(
      act(s, { type: "pipelineAllocate", station: 0, delta: -1, trial: true }, NOW).ok,
    ).toBe(true);
    s = apply(s, { type: "architecturePolicy", id: "autoBalance", enabled: false });
    expect(act(s, { type: "pipelineAllocate", station: 0, delta: -1 }, NOW).ok).toBe(
      true,
    );
  });
  it("keeps core purchases opt-in and buys at most one each five seconds", () => {
    let s = fixture();
    expect(
      act(s, { type: "architecturePolicy", id: "autoCores", enabled: true }, NOW).ok,
    ).toBe(false);
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    expect(advanceCareer(s, NOW + 60000).state.pipeline.coreLevel).toBe(0);
    s = apply(s, { type: "architecturePolicy", id: "autoCores", enabled: true });
    expect(advanceCareer(s, NOW + 4999).state.pipeline.coreLevel).toBe(0);
    const tick = advanceCareer(s, NOW + 5000).state;
    expect(tick.pipeline.coreLevel).toBe(1);
    expect(tick.pipeline.credits).toBe(1980);
    expect(tick.pipeline.architecture.powerLevel).toBe(0);
  });
  it("matches offline and fine ticks while spending, rebalancing and automating career", () => {
    let s = fixture();
    s.stage = 3;
    s.bestStage = 3;
    s.crew.assistant = 15;
    s.money = 10000;
    s.earned = 10000;
    s.upgrades = ["auto", "handover"];
    s.badges = BADGES.map((b) => b.id);
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    s = arrange(s, STUDIO_LAYOUT);
    s = apply(s, { type: "architecturePolicy", id: "autoBalance", enabled: true });
    s = apply(s, { type: "architecturePolicy", id: "autoCores", enabled: true });
    s.pipeline.automation = { hire: true, upgrades: true, promote: true, projects: true };
    let fine = s;
    for (let i = 1; i <= 2401; i++) {
      fine = advanceCareer(fine, NOW + i * 250).state;
    }
    const offline = advanceCareer(s, NOW + 600250, true).state;
    expect(offline.pipeline.coreLevel).toBeGreaterThan(0);
    expect(offline.pipeline.allocation).toEqual(fine.pipeline.allocation);
    expect(offline.pipeline.credits).toBeCloseTo(fine.pipeline.credits, 5);
    expect(offline.pipeline.total).toBeCloseTo(fine.pipeline.total, 5);
    expect(offline.crew).toEqual(fine.crew);
    expect(offline.money).toBeCloseTo(fine.money, 4);
    expect(offline.certificates).toEqual(fine.certificates);
    expect(offline.stage).toBe(fine.stage);
    expect(offline.project?.progress ?? 0).toBeCloseTo(fine.project?.progress ?? 0, 5);
  });
  it("preserves old progress and round-trips the new permanent layer through prestige", () => {
    const s = fixture();
    s.stage = 5;
    s.bestStage = 5;
    s.money = 456;
    s.earned = CAREER_RULES.prestigeThreshold;
    s.certificates = { button: 1 };
    const old = normalizeCareer(
      { ...s, pipeline: { ...s.pipeline, architecture: undefined } },
      NOW,
    );
    expect(old.pipeline.architecture).toEqual(newArchitecture());
    expect(old.pipeline.completed).toEqual(s.pipeline.completed);
    expect(old.certificates).toEqual(s.certificates);
    expect(old.money).toBe(456);
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    const configured = arrange(s, STUDIO_LAYOUT);
    const restored = importCareer(exportCareer(configured), NOW);
    expect(restored.pipeline).toEqual(configured.pipeline);
    const reset = apply(restored, { type: "prestige" });
    expect(reset.pipeline).toEqual(restored.pipeline);
  });
  it("sanitizes prerequisites, unknown modules, excess power and invalid flags", () => {
    const s = fixture();
    const normalized = normalizeCareer(
      {
        ...s,
        pipeline: {
          ...s.pipeline,
          architecture: {
            layout: ["manager", "fake", "bus", "build", "build", "build", "deploy"],
            powerLevel: Infinity,
            blueprints: ["studio", "cycle", "cycle", "fake"],
            autoCores: true,
            autoBalance: "true",
          },
        },
      },
      NOW,
    );
    expect(normalized.pipeline.architecture).toEqual({
      layout: [null, null, "bus", "build", "build", "build"],
      powerLevel: 0,
      blueprints: ["cycle"],
      autoCores: false,
      autoBalance: false,
    });
    const over = normalizeCareer(
      {
        ...s,
        pipeline: {
          ...s.pipeline,
          architecture: { layout: Array(6).fill("build"), powerLevel: -4 },
        },
      },
      NOW,
    );
    expect(over.pipeline.architecture.layout).toEqual([
      "build",
      "build",
      "build",
      "build",
      null,
      null,
    ]);
    const poor = fixture();
    poor.pipeline.total = 100;
    poor.pipeline.architecture.powerLevel = 2;
    expect(normalizeCareer(poor, NOW).pipeline.architecture.powerLevel).toBe(0);
  });
  it("keeps locked data inert and discards it on load", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    s.pipeline.architecture.layout = STUDIO_LAYOUT;
    s.pipeline.architecture.autoCores = true;
    s.pipeline.completed = ["budget", "verification"];
    expect(architectureUnlocked(s)).toBe(false);
    expect(architectureEffects(s)).toMatchObject({
      crew: 1,
      projects: 1,
      rates: PIPELINE.rates,
    });
    expect(advanceCareer(s, NOW + 60000).state.pipeline.coreLevel).toBe(0);
    expect(act(s, { type: "rackPower" }, NOW).ok).toBe(false);
    expect(normalizeCareer(s, NOW).pipeline.architecture).toEqual(newArchitecture());
  });
});
