// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerAction, CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BLUEPRINTS } from "./architectureData";
import { PIPELINE_TRIALS } from "./pipelineData";
import { GENERATORS, NETWORK, newNetwork } from "./networkData";
import {
  computationRate,
  generatorPrice,
  generatorUnlocked,
  networkBridge,
  networkMultiplier,
  rebootReward,
} from "./networkEffects";
import { advanceNetwork } from "./networkFlow";
import { exportCareer, importCareer, normalizeCareer } from "./persistence";
import { architectureEffects, pipelineRates } from "./architectureEffects";
import { crewRate } from "./selectors";
import { projectThroughput } from "./studioSelectors";
import { BADGES, CAREER_RULES } from "./content";
import { nextDiscovery } from "./pipelineSelectors";

const NOW = 1_000_000;
function fixture() {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.completed = PIPELINE_TRIALS.map((t) => t.id);
  s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
  s.pipeline.total = 10000;
  return s;
}
function apply(s: CareerState, action: CareerAction, now = s.lastTick) {
  const result = act(s, action, now);
  expect(result.ok, result.message).toBe(true);
  return result.state;
}
function funded(s = fixture()) {
  s.pipeline.network.computations = 50000;
  s.pipeline.network.runTotal = 50000;
  s.pipeline.network.best = 50000;
  return s;
}
describe("analytic generator chain", () => {
  it("starts with one productive agent, and higher tiers create working lower tiers", () => {
    const s = fixture();
    expect(computationRate(s)).toBe(1);
    expect(advanceNetwork(s, 10).computations).toBe(10);
    s.pipeline.network.units = [0, 0, 0, 1];
    const result = advanceNetwork(s, 100);
    [0.5, 0.375, 0.5, 1].forEach((value, tier) =>
      expect(result.units[tier]).toBeCloseTo(value, 12),
    );
    expect(result.computations).toBeCloseTo(12.5);
  });
  it("agrees with many split advances for every polynomial tier and partial seconds", () => {
    const s = fixture();
    s.pipeline.network.units = [3.5, 2.4, 1.7, 0.8];
    s.pipeline.network.upgrades.cascade = 2;
    const whole = advanceNetwork(s, 731.25);
    let split = s;
    for (let i = 0; i < 975; i++) {
      split = {
        ...split,
        pipeline: { ...split.pipeline, network: advanceNetwork(split, 0.75) },
      };
    }
    expect(whole.computations).toBeCloseTo(split.pipeline.network.computations, 5);
    whole.units.forEach((value, i) =>
      expect(value).toBeCloseTo(split.pipeline.network.units[i] ?? 0, 6),
    );
    expect(whole.best).toBeCloseTo(split.pipeline.network.best, 5);
    expect(s.pipeline.network.units).toEqual([3.5, 2.4, 1.7, 0.8]);
  });
  it("uses the existing offline cap and efficiency and never overflows", () => {
    const s = fixture();
    const offline = advanceCareer(s, NOW + 10000, true);
    expect(offline.state.pipeline.network.computations).toBeCloseTo(7.5, 10);
    expect(offline.networkComputations).toBeCloseTo(7.5, 10);
    s.pipeline.network.units = [
      NETWORK.limit,
      NETWORK.limit,
      NETWORK.limit,
      NETWORK.limit,
    ];
    const capped = advanceCareer(s, NOW + 100 * 3600000, true);
    expect(capped.capped).toBe(true);
    expect(capped.state.pipeline.network.units).toEqual(Array(4).fill(NETWORK.limit));
    expect(capped.state.pipeline.network.computations).toBe(NETWORK.limit);
    expect(capped.state.pipeline.network.best).toBe(NETWORK.limit);
  });
});
describe("network decisions and permanent protocols", () => {
  it("separates purchase counts from generated units and unlocks by earned progress", () => {
    let s = fixture();
    s.pipeline.network.units[0] = 1000;
    expect(generatorPrice(s, 0)).toBe(10);
    expect(act(s, { type: "networkBuy", tier: 1 }, NOW).ok).toBe(false);
    s = advanceCareer(s, NOW + 1000).state;
    expect(generatorUnlocked(s, 1)).toBe(true);
    expect(generatorUnlocked(s, 2)).toBe(true);
    expect(generatorUnlocked(s, 3)).toBe(false);
    s = apply(s, { type: "networkBuy", tier: 1 });
    expect(s.pipeline.network.computations).toBeCloseTo(920, 8);
    expect(s.pipeline.network.best).toBeCloseTo(1000, 8);
    expect(generatorPrice(s, 1)).toBe(128);
    expect(s.pipeline.network.units[1]).toBe(1);
  });
  it("enforces affordability, tier locks and forty purchases without mutating the source", () => {
    const poor = fixture();
    expect(act(poor, { type: "networkBuy", tier: 0 }, NOW).ok).toBe(false);
    const s = funded();
    const bought = apply(s, { type: "networkBuy", tier: 3 });
    expect(bought.pipeline.network.computations).toBe(30000);
    expect(s.pipeline.network.units[3]).toBe(0);
    bought.pipeline.network.purchased[0] = NETWORK.purchaseLimit;
    expect(act(bought, { type: "networkBuy", tier: 0 }, NOW).ok).toBe(false);
  });
  it("settles previous production before purchases and permanent multiplier changes", () => {
    let s = fixture();
    s = apply(s, { type: "networkBuy", tier: 0 }, NOW + 10000);
    expect(s.pipeline.network.runTotal).toBe(10);
    expect(s.pipeline.network.computations).toBe(0);
    expect(advanceCareer(s, NOW + 20000).state.pipeline.network.computations).toBe(20);
    s = funded(s);
    s = apply(s, { type: "networkReboot" });
    const reward = rebootReward(funded());
    expect(s.pipeline.network.protocols).toBe(reward);
    s = apply(s, { type: "networkProtocol", id: "cascade" }, s.lastTick + 10000);
    expect(s.pipeline.network.runTotal).toBe(12.5);
    expect(networkMultiplier(s)).toBe(1.75);
  });
  it("reboots only the local layer, awards once and retains all permanent progress", () => {
    const s = funded();
    s.money = 555;
    s.crew.assistant = 15;
    s.research = { fieldnotes: 1 };
    s.pipeline.network.units = [15, 2, 1, 1];
    const result = apply(s, { type: "networkReboot" });
    expect(result.pipeline.network).toMatchObject({
      computations: 0,
      runTotal: 0,
      best: 50000,
      units: [1, 0, 0, 0],
      purchased: [0, 0, 0, 0],
      protocols: 5,
      totalProtocols: 5,
      reboots: 1,
    });
    expect(result.money).toBe(s.money);
    expect(result.crew).toEqual(s.crew);
    expect(result.research).toEqual(s.research);
    expect(result.pipeline.architecture).toEqual(s.pipeline.architecture);
    expect(result.pipeline.credits).toBe(s.pipeline.credits);
    expect(act(result, { type: "networkReboot" }, NOW).ok).toBe(false);
    expect(generatorUnlocked(result, 3)).toBe(true);
  });
  it("spends protocols once and visibly improves earlier systems", () => {
    const s = funded();
    s.crew.assistant = 10;
    const restarted = apply(s, { type: "networkReboot" });
    const bridged = apply(restarted, { type: "networkProtocol", id: "bridge" });
    expect(networkBridge(bridged)).toBe(1.25);
    expect(pipelineRates(bridged)).toEqual(
      pipelineRates(restarted).map((rate) => rate * 1.25),
    );
    expect(crewRate(bridged, "assistant")).toBeCloseTo(
      crewRate(restarted, "assistant") * 1.25,
    );
    expect(projectThroughput(bridged)).toBeCloseTo(projectThroughput(restarted) * 1.25);
    expect(bridged.pipeline.network.protocols).toBe(4);
    const maxed = apply(apply(bridged, { type: "networkProtocol", id: "bridge" }), {
      type: "networkProtocol",
      id: "autobuy",
    });
    expect(act(maxed, { type: "networkProtocol", id: "bridge" }, NOW).ok).toBe(false);
  });
});
describe("automation, load and discovery continuity", () => {
  it("handles a capped sixteen-hour absence with every automation active and keeps reboot manual", () => {
    let s = funded();
    s.upgrades = ["auto", "handover"];
    s.money = 100;
    s = apply(s, { type: "networkReboot" });
    s = apply(s, { type: "networkProtocol", id: "autobuy" });
    s = apply(s, { type: "networkProtocol", id: "cascade" });
    s = apply(s, { type: "networkProtocol", id: "bridge" });
    s = apply(s, { type: "networkAuto", enabled: true });
    s.pipeline.automation = {
      hire: true,
      upgrades: true,
      promote: true,
      projects: true,
      chapters: false,
    };
    const result = advanceCareer(s, NOW + 100 * 3600000, true);
    expect(result.capped).toBe(true);
    expect(result.seconds).toBe(57600);
    expect(result.state.pipeline.network.reboots).toBe(1);
    expect(result.state.pipeline.network.protocols).toBe(2);
    expect(result.state.pipeline.network.purchased).toEqual([40, 40, 40, 40]);
    expect(
      result.state.pipeline.network.units.every(
        (n) => Number.isFinite(n) && n >= 0 && n <= NETWORK.limit,
      ),
    ).toBe(true);
    expect(result.automatedActions).toBeGreaterThan(100);
  });
  it("requires opt-in and spends on one highest eligible affordable generator each boundary", () => {
    let s = funded();
    expect(act(s, { type: "networkAuto", enabled: true }, NOW).ok).toBe(false);
    s = apply(s, { type: "networkReboot" });
    s = apply(s, { type: "networkProtocol", id: "autobuy" });
    s = funded(s);
    expect(advanceCareer(s, NOW + 5000).state.pipeline.network.purchased).toEqual([
      0, 0, 0, 0,
    ]);
    s = apply(s, { type: "networkAuto", enabled: true });
    expect(advanceCareer(s, NOW + 4999).state.pipeline.network.purchased).toEqual([
      0, 0, 0, 0,
    ]);
    expect(advanceCareer(s, NOW + 5000).state.pipeline.network.purchased).toEqual([
      0, 0, 0, 1,
    ]);
    expect(advanceCareer(s, NOW + 10000).state.pipeline.network.purchased).toEqual([
      0, 0, 1, 1,
    ]);
  });
  it("matches online and offline across automatic spending, new tier unlocks and career policies", () => {
    let s = funded();
    s.upgrades = ["auto", "handover"];
    s.badges = BADGES.map((b) => b.id);
    s.crew.assistant = 15;
    s.stage = 3;
    s.bestStage = 3;
    s.money = 10000;
    s = apply(s, { type: "networkReboot" });
    s = apply(s, { type: "networkProtocol", id: "autobuy" });
    s = apply(s, { type: "networkProtocol", id: "cascade" });
    s = apply(s, { type: "networkAuto", enabled: true });
    s.pipeline.automation = {
      hire: true,
      upgrades: true,
      promote: true,
      projects: true,
      chapters: false,
    };
    let fine = s;
    for (let i = 1; i <= 1601; i++) {
      fine = advanceCareer(fine, NOW + i * 250).state;
    }
    const offline = advanceCareer(s, NOW + 400250, true).state;
    expect(offline.pipeline.network.purchased).toEqual(fine.pipeline.network.purchased);
    expect(offline.pipeline.network.computations).toBeCloseTo(
      fine.pipeline.network.computations,
      4,
    );
    expect(offline.pipeline.network.runTotal).toBeCloseTo(
      fine.pipeline.network.runTotal,
      4,
    );
    offline.pipeline.network.units.forEach((u, i) =>
      expect(u).toBeCloseTo(fine.pipeline.network.units[i] ?? 0, 6),
    );
    expect(offline.crew).toEqual(fine.crew);
    expect(offline.money / fine.money).toBeCloseTo(1, 12);
    expect(offline.certificates).toEqual(fine.certificates);
    expect(offline.pipeline.network.reboots).toBe(1);
  });
  it("migrates older completed saves without losing career, rack or pipeline progress", () => {
    const s = funded();
    s.money = 123;
    s.pipeline.credits = 100;
    const old = normalizeCareer(
      { ...s, pipeline: { ...s.pipeline, network: undefined } },
      NOW,
    );
    expect(old.money).toBe(123);
    expect(old.pipeline.credits).toBe(100);
    expect(old.pipeline.architecture).toEqual(s.pipeline.architecture);
    expect(old.pipeline.network).toEqual(newNetwork());
    expect(nextDiscovery(old).title).toContain("Планувальники");
  });
  it("round-trips generated units, purchases and protocols and preserves them through career prestige", () => {
    let s = funded();
    s = apply(s, { type: "networkReboot" });
    s = apply(s, { type: "networkProtocol", id: "cascade" });
    s = advanceCareer(s, NOW + 60000).state;
    s = apply(s, { type: "networkBuy", tier: 1 });
    s = advanceCareer(s, s.lastTick + 12345).state;
    const restored = importCareer(exportCareer(s), s.lastTick);
    expect(restored.pipeline.network).toEqual(s.pipeline.network);
    restored.stage = CAREER_RULES.prestigeStage;
    restored.earned = CAREER_RULES.prestigeThreshold;
    expect(apply(restored, { type: "prestige" }).pipeline.network).toEqual(
      restored.pipeline.network,
    );
  });
  it("discards locked data and sanitizes numbers, purchases, protocol budgets and flags", () => {
    const s = fixture();
    s.pipeline.architecture.blueprints = [];
    s.pipeline.network = {
      ...funded().pipeline.network,
      upgrades: { cascade: 3, bridge: 3, autobuy: 1 },
      autoBuy: true,
    };
    expect(advanceNetwork(s, 60)).toEqual(s.pipeline.network);
    expect(architectureEffects(s).crew).toBe(1);
    expect(act(s, { type: "networkReboot" }, NOW).ok).toBe(false);
    expect(normalizeCareer(s, NOW).pipeline.network).toEqual(newNetwork());
    const valid = fixture();
    const normalized = normalizeCareer(
      {
        ...valid,
        pipeline: {
          ...valid.pipeline,
          network: {
            computations: Infinity,
            runTotal: 50,
            best: 2000,
            units: [-4, NaN, Infinity, 200],
            purchased: [40, 5, 9, -1],
            reboots: 1,
            totalProtocols: 1,
            protocols: 99,
            upgrades: { cascade: 3, bridge: 3, autobuy: 1, fake: 8 },
            autoBuy: true,
          },
        },
      },
      NOW,
    ).pipeline.network;
    expect(normalized.purchased).toEqual([2, 0, 0, 0]);
    expect(normalized.units).toEqual([3, 0, 0, 0]);
    expect(normalized.upgrades).toEqual({ cascade: 1, bridge: 0, autobuy: 0 });
    expect(normalized.protocols).toBe(0);
    expect(normalized.autoBuy).toBe(false);
    expect(normalized.computations).toBe(0);
    expect(GENERATORS.length).toBe(4);
  });
});
