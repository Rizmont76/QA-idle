// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerState, NetworkUnits } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BADGES, CAREER_RULES } from "./content";
import { BLUEPRINTS } from "./architectureData";
import { PIPELINE_TRIALS } from "./pipelineData";
import { NETWORK } from "./networkData";
import { networkStep } from "./networkFlow";
import { networkConnected } from "./networkEffects";
import { agentPower, scriptPower } from "./productionEffects";
import { compiledTestRate, distributedTestRate, production } from "./selectors";
import { passiveProduction } from "./passiveProduction";
import { exportCareer, importCareer, normalizeCareer } from "./persistence";
import { rackPresetPreview } from "./rackPresets";
import { resourceOverview } from "./resources";

const NOW = 1_000_000;
function fixture(): CareerState {
  const s = newCareer(NOW);
  s.careers = 1;
  s.stage = 2;
  s.bestStage = 5;
  s.upgrades = ["auto", "handover"];
  s.badges = BADGES.map((b) => b.id);
  s.pipeline.total = 10_000;
  s.pipeline.credits = 1_000;
  s.pipeline.allocation = [0, 0, 0];
  s.pipeline.completed = PIPELINE_TRIALS.map((t) => t.id);
  s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
  s.pipeline.network.best = 50_000;
  s.pipeline.network.reboots = 1;
  s.pipeline.network.totalProtocols = 1;
  s.pipeline.network.upgrades.bridge = 1;
  s.pipeline.network.linked = true;
  return s;
}

describe("connected network production", () => {
  it("turns an upper generator into growing bug production with an analytic fourth-degree integral", () => {
    const s = fixture();
    s.pipeline.network.units = [0, 0, 0, 1];
    const next = advanceCareer(s, NOW + 100_000);
    const expectedComputations = 12.5 * 1.25 ** 4;
    expect(next.networkBugs).toBeCloseTo(expectedComputations * agentPower(s), 8);
    expect(next.state.money).toBeCloseTo(
      (production(s) * 100 + expectedComputations * agentPower(s)) * 1.5,
      6,
    );
    expect(distributedTestRate(next.state)).toBeGreaterThan(distributedTestRate(s));
    expect(next.state.pipeline.total).toBe(s.pipeline.total);
  });
  it("settles disconnected time before connecting and never connects without Bridge or twice", () => {
    const s = fixture();
    s.pipeline.network.linked = false;
    s.pipeline.network.units = [100, 5, 1, 0];
    const old = advanceCareer(s, NOW + 10_000).state;
    const result = act(s, { type: "networkConnect" }, NOW + 10_000);
    expect(result.ok).toBe(true);
    expect(result.state.money).toBe(old.money);
    expect(networkConnected(result.state)).toBe(true);
    expect(production(result.state)).toBeGreaterThan(production(old));
    expect(act(result.state, { type: "networkConnect" }, result.state.lastTick).ok).toBe(
      false,
    );
    const unavailable = fixture();
    unavailable.pipeline.network.upgrades.bridge = 0;
    unavailable.pipeline.network.linked = false;
    expect(act(unavailable, { type: "networkConnect" }, NOW).ok).toBe(false);
    expect(distributedTestRate(unavailable)).toBe(0);
  });
  it("preserves old disconnected saves, rejects forged flags, and round-trips valid connections", () => {
    const s = fixture();
    expect(importCareer(exportCareer(s), NOW).pipeline.network.linked).toBe(true);
    const old = JSON.parse(exportCareer(s)) as CareerState;
    const missing = {
      ...old,
      pipeline: {
        ...old.pipeline,
        network: { ...old.pipeline.network, linked: undefined },
      },
    };
    const restored = normalizeCareer(missing, NOW);
    expect(restored.pipeline.network.linked).toBe(false);
    expect(distributedTestRate(restored)).toBe(0);
    const forged = {
      ...missing,
      pipeline: {
        ...missing.pipeline,
        network: {
          ...missing.pipeline.network,
          linked: true,
          upgrades: { cascade: 0, bridge: 0, autobuy: 0 },
        },
      },
    };
    expect(normalizeCareer(forged, NOW).pipeline.network.linked).toBe(false);
    const locked = { ...s, careers: 0 };
    expect(distributedTestRate(locked)).toBe(0);
    expect(normalizeCareer(locked, NOW).pipeline.network.linked).toBe(false);
  });
  it("makes a reboot trade live fleet power for permanent acceleration without removing installed tests", () => {
    const s = fixture();
    s.pipeline.network.units = [25_000, 10, 1, 1];
    s.pipeline.network.runTotal = 20_000;
    const before = compiledTestRate(s);
    const result = act(s, { type: "networkReboot" }, NOW);
    expect(result.ok).toBe(true);
    expect(result.state.pipeline.network.linked).toBe(true);
    expect(result.state.pipeline.network.units).toEqual([1, 0, 0, 0]);
    expect(compiledTestRate(result.state)).toBe(before);
    expect(production(result.state)).toBeLessThan(production(s));
    expect(distributedTestRate(result.state)).toBeGreaterThan(0);
    expect(result.state.pipeline.total).toBe(s.pipeline.total);
    const director = { ...s, stage: 5, earned: 100_000_000 };
    const repeat = act(director, { type: "prestige" }, NOW).state;
    expect(repeat.pipeline.network.linked).toBe(true);
    expect(repeat.pipeline.network.units).toEqual(s.pipeline.network.units);
    expect(distributedTestRate(repeat)).toBeGreaterThan(0);
  });
  it("keeps badge, dispatcher and purchase boundaries equal in long and fine offline advances", () => {
    const s = fixture();
    s.stage = 3;
    s.badges = [];
    s.pipeline.allocation = [1, 2, 3];
    s.pipeline.network.units = [30, 5, 2, 1];
    s.pipeline.automation.hire = true;
    s.office = { ...s.office, licensed: true, contractId: "smoke" };
    let fine = s;
    for (let i = 1; i <= 480; i++) {
      fine = advanceCareer(fine, NOW + i * 250, true).state;
    }
    const long = advanceCareer(s, NOW + 120_000, true).state;
    expect(long.money / fine.money).toBeCloseTo(1, 12);
    expect(long.crew).toEqual(fine.crew);
    expect(long.badges).toEqual(fine.badges);
    expect(long.office).toEqual(fine.office);
    long.pipeline.network.units.forEach((value, tier) =>
      expect(value / (fine.pipeline.network.units[tier] ?? 1)).toBeCloseTo(1, 12),
    );
  });
  it("integrates across the shared production cap and keeps physical Agent work active at full balances", () => {
    const s = fixture();
    s.stage = 0;
    s.pipeline.total = 0;
    s.pipeline.network.units = [0, 1e13, 0, 0];
    s.pipeline.network.runTotal = NETWORK.limit;
    s.pipeline.network.computations = NETWORK.limit;
    const slope = 1e13 * 0.04 * 1.25 * 1.25 * agentPower(s);
    const boundary = CAREER_RULES.limit / slope;
    const expected =
      (CAREER_RULES.limit * boundary) / 2 + CAREER_RULES.limit * (3600 - boundary);
    expect(passiveProduction(s, 3600).bugs / expected).toBeCloseTo(1, 12);
    let fine = s;
    for (let i = 1; i <= 120; i++) {
      fine = advanceCareer(fine, NOW + i * 30_000).state;
    }
    const long = advanceCareer(s, NOW + 3_600_000).state;
    expect(long.money / expected).toBeCloseTo(1, 12);
    expect(long.money / fine.money).toBeCloseTo(1, 12);
    expect(production(long)).toBe(CAREER_RULES.limit);
  });
  it("reserves licensed revenue for installed main tests when Agents fill the remaining cap", () => {
    const s = fixture();
    s.pipeline.total = CAREER_RULES.limit / (2 * scriptPower(s));
    s.pipeline.network.units = [0, 2e13, 0, 0];
    s.products.releases["checklist"] = 1;
    const next = advanceCareer(s, NOW + 100_000).state;
    const expected = 100 * (12 + (CAREER_RULES.limit / 2) * 1.5 * 0.25);
    expect(next.products.earned / expected).toBeCloseTo(1, 12);
    expect(next.money).toBeGreaterThan(expected);
    expect(production(next)).toBe(CAREER_RULES.limit);
  });
});

describe("generator saturation", () => {
  it("finds tiny shared rate-cap boundaries without overpaying a long interval", () => {
    const s = fixture();
    s.stage = 0;
    s.pipeline.total = 0;
    s.pipeline.network.reboots = 1e10;
    s.pipeline.network.units = [1, 0, 0, NETWORK.limit];
    const work = passiveProduction(s, 10);
    expect(work.bugs).toBeLessThanOrEqual(CAREER_RULES.limit * 10);
    expect(work.bugs).toBeGreaterThan(CAREER_RULES.limit * 10 * (1 - 1e-9));
  });
  it("integrates each saturated tier at its actual boundary rather than only clipping the final array", () => {
    const cases: NetworkUnits[] = [
      [NETWORK.limit - 100, 500, 0, 0],
      [1, NETWORK.limit - 1e10, 1e12, 0],
      [1, 1e12, NETWORK.limit - 1e10, 1e14],
    ];
    for (const units of cases) {
      const s = fixture();
      s.pipeline.network.units = units;
      const long = networkStep(s, 100);
      let split = s;
      let generated = 0;
      for (let i = 0; i < 400; i++) {
        const next = networkStep(split, 0.25);
        generated += next.generated;
        split = { ...split, pipeline: { ...split.pipeline, network: next.state } };
      }
      expect(long.generated / generated).toBeCloseTo(1, 12);
      long.state.units.forEach((value, tier) => {
        const reference = split.pipeline.network.units[tier] ?? 0;
        expect((value - reference) / Math.max(1, reference)).toBeCloseTo(0, 12);
      });
      expect(long.state.units.every((value) => value <= NETWORK.limit)).toBe(true);
    }
  });
});

describe("rack schemes with economic consequences", () => {
  it("gives each layout a distinct benefit rather than making one better for every goal", () => {
    const s = fixture();
    s.pipeline.allocation = [1, 2, 3];
    s.pipeline.architecture.powerLevel = 1;
    s.pipeline.architecture.autoBalance = true;
    s.products.releases["checklist"] = 1;
    s.products.modes["checklist"] = "open";
    const flow = rackPresetPreview(s, "flow");
    const production = rackPresetPreview(s, "production");
    const projects = rackPresetPreview(s, "projects");
    expect(flow?.allowed && production?.allowed && projects?.allowed).toBe(true);
    expect(flow?.rate).toBeGreaterThan(production?.rate ?? Infinity);
    expect(flow?.insights).toBeGreaterThan(production?.insights ?? Infinity);
    expect(production?.bugs).toBeGreaterThan(flow?.bugs ?? Infinity);
    expect(projects?.projectWork).toBeGreaterThan(production?.projectWork ?? Infinity);
  });
  it("validates power and discovery, settles previous time, and round-trips the applied layout", () => {
    const s = fixture();
    expect(rackPresetPreview(s, "flow")?.allowed).toBe(true);
    expect(rackPresetPreview(s, "production")?.allowed).toBe(false);
    expect(act(s, { type: "rackPreset", id: "production" }, NOW).state).toEqual(s);
    const locked = fixture();
    locked.pipeline.architecture.blueprints.pop();
    expect(rackPresetPreview(locked, "flow")).toBeNull();
    expect(act(locked, { type: "rackPreset", id: "flow" }, NOW).ok).toBe(false);
    s.pipeline.architecture.powerLevel = 1;
    const before = advanceCareer(s, NOW + 10_000).state;
    const result = act(s, { type: "rackPreset", id: "production" }, NOW + 10_000);
    expect(result.ok).toBe(true);
    expect(result.state.money).toBe(before.money);
    expect(result.state.pipeline.network.units).toEqual(before.pipeline.network.units);
    expect(production(result.state)).toBeGreaterThan(production(before));
    expect(
      importCareer(exportCareer(result.state), result.state.lastTick).pipeline
        .architecture.layout,
    ).toEqual(result.state.pipeline.architecture.layout);
  });
  it("adds live fleet resources only after the explicit studio connection", () => {
    const s = fixture();
    s.pipeline.network.linked = false;
    expect(resourceOverview(s).some((row) => row.id === "networkAgents")).toBe(false);
    expect(resourceOverview(s).find((row) => row.id === "bugs")?.source).not.toContain(
      "підключені агенти",
    );
    s.pipeline.network.linked = true;
    const row = resourceOverview(s).find((row) => row.id === "networkAgents");
    expect(row?.balance).toBe(1);
    expect(row?.use).toContain("багів/с");
    expect(row?.persistence).toContain("одного агента");
    expect(resourceOverview(s).find((row) => row.id === "bugs")?.source).toContain(
      "постійні автотести, підключені агенти мережі",
    );
  });
});
