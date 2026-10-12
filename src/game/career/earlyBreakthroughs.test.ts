// @vitest-environment node
import { describe, expect, it } from "vitest";
import { act, advanceCareer, newCareer } from "./engine";
import { BADGES, CAREER_RULES } from "./content";
import { production } from "./selectors";
import { pipelineRates } from "./architectureEffects";
import { pipelineUnlocked, trialUnlocked } from "./pipelineUnlocks";
import { PIPELINE_TRIALS } from "./pipelineData";
import { exportCareer, importCareer, loadCareer } from "./persistence";
import { scriptPower } from "./productionEffects";
import { productIncome, productInsightRate } from "./productEffects";
import { PRODUCTS } from "./productData";

const NOW = 1_000_000;
const senior = () => ({
  ...newCareer(NOW),
  stage: 2,
  bestStage: 2,
  upgrades: ["auto"],
  badges: BADGES.map((b) => b.id),
});

describe("products connected to production capital", () => {
  const owned = () => {
    const s = senior();
    s.pipeline.total = 100;
    s.certificates["button"] = 1;
    s.products.releases["checklist"] = 1;
    return s;
  };
  const def = PRODUCTS[0];
  if (!def) {
    throw new Error("Missing first product");
  }
  it("offers income now, faster capital growth, or research resources", () => {
    const license = owned();
    const internal = act(
      license,
      { type: "productMode", id: def.id, mode: "internal" },
      NOW,
    ).state;
    const open = act(
      license,
      { type: "productMode", id: def.id, mode: "open" },
      NOW,
    ).state;
    const licensed = advanceCareer(license, NOW + 10_000).state;
    const built = advanceCareer(internal, NOW + 10_000).state;
    const learned = advanceCareer(open, NOW + 10_000).state;
    expect(productIncome(license, def)).toBeGreaterThan(def.income);
    expect(licensed.money).toBeGreaterThan(built.money);
    expect(built.pipeline.total).toBeGreaterThan(licensed.pipeline.total);
    expect(learned.insights).toBeCloseTo(productInsightRate(open, def) * 10);
    expect(learned.insights).toBeGreaterThan(0);
    expect(learned.products.earned).toBe(0);
    expect(built.insights).toBe(0);
  });
  it("settles the previous role and preserves fractional insights across reloads", () => {
    const s = owned();
    const open = act(
      s,
      { type: "productMode", id: def.id, mode: "open" },
      NOW + 10_000,
    ).state;
    expect(open.products.earned).toBe(
      advanceCareer(s, NOW + 10_000).state.products.earned,
    );
    expect(open.insights).toBe(0);
    const learned = advanceCareer(open, NOW + 11_000).state;
    expect(learned.insights).toBeGreaterThan(0);
    expect(learned.insights).toBeLessThan(1);
    const restored = importCareer(exportCareer(learned), learned.lastTick);
    expect(restored.insights).toBe(learned.insights);
    expect(restored.lifetimeInsights).toBe(learned.lifetimeInsights);
    expect(importCareer(exportCareer(restored), restored.lastTick)).toEqual(restored);
  });
  it("integrates growing royalty and insight rewards identically in offline slices", () => {
    for (const mode of ["license", "open"] as const) {
      const s = owned();
      s.products.modes["checklist"] = mode;
      let fine = s;
      for (let i = 1; i <= 400; i++) {
        fine = advanceCareer(fine, NOW + i * 250, true).state;
      }
      const long = advanceCareer(s, NOW + 100_000, true).state;
      expect(long.money / fine.money).toBeCloseTo(1, 12);
      expect(long.products.earned).toBeCloseTo(fine.products.earned, 6);
      expect(long.insights).toBeCloseTo(fine.insights, 10);
      expect(long.lifetimeInsights).toBeCloseTo(fine.lifetimeInsights, 10);
    }
  });
  it("excludes connected product rewards from pre-update offline periods", () => {
    for (const mode of ["license", "open"] as const) {
      const s = owned();
      s.careers = 1;
      s.products.modes["checklist"] = mode;
      const imported = importCareer(
        JSON.stringify({ ...s, pipeline: { ...s.pipeline, model: undefined } }),
        NOW + 10_000,
      );
      expect(imported.products.earned).toBe(mode === "license" ? 90 : 0);
      expect(imported.insights).toBe(0);
      expect(imported.pipeline.total).toBe(107.5);
    }
  });
  it("stops passive insights at the release cap while installed licensed capital still earns", () => {
    const s = owned();
    s.pipeline.total = CAREER_RULES.limit;
    expect(productIncome(s, def)).toBeGreaterThan(def.income);
    s.products.modes["checklist"] = "open";
    expect(productInsightRate(s, def)).toBe(0);
    expect(advanceCareer(s, NOW + 10_000).state.insights).toBe(0);
  });
});

describe("connected early production", () => {
  it("grants reporting at Middle, reveals CI/CD at Senior, and preserves it on repeat careers", () => {
    const s = newCareer(NOW);
    s.crew.assistant = 3;
    s.rankEarned = 150;
    s.upgrades = ["checklist"];
    const middle = act(s, { type: "promote" }, NOW).state;
    expect(middle.upgrades).toContain("auto");
    expect(pipelineUnlocked(middle)).toBe(false);
    expect(pipelineUnlocked(senior())).toBe(true);
    expect(pipelineUnlocked({ ...middle, careers: 1 })).toBe(true);
  });
  it("compiles growing bug production continuously, including when no crew is owned", () => {
    const s = senior();
    const power = scriptPower(s);
    expect(production(s)).toBe(0);
    const next = advanceCareer(s, NOW + 10_000).state;
    expect(next.pipeline.total).toBe(10);
    expect(production(next)).toBeCloseTo(10 * power);
    expect(next.found).toBeCloseTo(power * 50);
    expect(next.money).toBeGreaterThan(0);
    const stopped = {
      ...next,
      pipeline: { ...next.pipeline, allocation: [0, 0, 0] as [number, number, number] },
    };
    expect(advanceCareer(stopped, NOW + 20_000).state.pipeline.total).toBe(10);
    expect(advanceCareer(stopped, NOW + 20_000).state.found).toBeCloseTo(
      next.found + production(next) * 10,
    );
  });
  it("preserves queued work and integrates compiled tests the same in long and short ticks", () => {
    for (const queues of [
      [0, 0],
      [200, 200],
      [140, 3],
    ] as [number, number][]) {
      const s = senior();
      s.pipeline.queues = queues;
      s.pipeline.allocation = [0, 2, 4];
      let fine = s;
      for (let i = 1; i <= 400; i++) {
        fine = advanceCareer(fine, NOW + i * 250).state;
      }
      const long = advanceCareer(s, NOW + 100_000).state;
      expect(long.money).toBeCloseTo(fine.money, 6);
      expect(long.found).toBeCloseTo(fine.found, 6);
      expect(long.pipeline.total).toBeCloseTo(fine.pipeline.total, 6);
    }
  });
  it("uses crew and internal products to change main capacity while trial constraints stay fixed", () => {
    const s = senior();
    s.pipeline.total = 100;
    s.crew.runner = 16;
    expect(pipelineRates(s)[1]).toBeCloseTo(4.5);
    s.products.releases["checklist"] = 1;
    s.products.modes["checklist"] = "internal";
    expect(pipelineRates(s)[1]).toBeCloseTo(5.625);
    const trial = act(s, { type: "startTrial", id: "budget" }, NOW).state;
    expect(trial.pipeline.trial).not.toBeNull();
    const regression = PIPELINE_TRIALS.find((t) => t.id === "verification");
    if (!regression) {
      throw new Error("Missing trial");
    }
    expect(trialUnlocked(s, regression)).toBe(false);
    expect(trialUnlocked({ ...s, bestStage: 3 }, regression)).toBe(true);
  });
  it("round-trips early pipelines and keeps retained autotests working at Junior after prestige", () => {
    const s = senior();
    s.pipeline.total = 123;
    s.pipeline.credits = 100;
    const restored = importCareer(exportCareer(s), NOW);
    expect(restored.pipeline).toEqual(s.pipeline);
    s.stage = 5;
    s.bestStage = 5;
    s.earned = 100_000_000;
    const repeat = act(s, { type: "prestige" }, NOW).state;
    expect(repeat.pipeline.total).toBe(123);
    expect(repeat.stage).toBe(0);
    expect(production(repeat)).toBeGreaterThan(0);
  });
  it("caps instantaneous production without discarding credits or granting extra work", () => {
    const s = senior();
    s.experience = CAREER_RULES.experienceLimit;
    s.pipeline.total = CAREER_RULES.limit;
    const next = advanceCareer(s, NOW + 10_000).state;
    expect(production(s)).toBe(CAREER_RULES.limit);
    expect(next.money).toBeCloseTo(CAREER_RULES.limit * 10 * 1.5, -1);
    expect(next.pipeline.total).toBe(CAREER_RULES.limit);
  });
});

it("keeps dispatcher payments and purchases aligned with growing badge boundaries", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 100;
  s.pipeline.credits = 100;
  s.money = 10000;
  s.earned = 10000;
  s.stage = 3;
  s.bestStage = 3;
  s.crew.assistant = 15;
  s.upgrades = ["auto", "handover"];
  s.office = { ...s.office, licensed: true, contractId: "smoke" };
  s.pipeline.completed = ["budget", "verification", "deployment"];
  s.pipeline.automation = {
    chapters: true,
    hire: true,
    projects: true,
    promote: true,
    upgrades: true,
  };
  let fine = s;
  for (let i = 1; i <= 2400; i++) {
    fine = advanceCareer(fine, NOW + i * 250).state;
    if (i % 20 === 0) {
      const long = advanceCareer(s, NOW + i * 250, true).state;
      expect(long.money / fine.money).toBeCloseTo(1, 12);
      expect(long.crew).toEqual(fine.crew);
      expect(long.badges).toEqual(fine.badges);
      expect(long.stage).toBe(fine.stage);
      expect(long.office).toEqual(fine.office);
    }
  }
});

it("starts newly eligible pipelines after migration rather than rewarding the old absence", () => {
  const s = senior();
  s.crew.assistant = 10;
  const original = JSON.stringify({
    ...s,
    pipeline: { ...s.pipeline, model: undefined },
  });
  const entries = new Map<string, string>([[CAREER_RULES.saveKey, original]]);
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
  const loaded = loadCareer(storage, NOW + 100_000);
  expect(loaded.state.pipeline.model).toBe(2);
  expect(loaded.state.pipeline.total).toBe(0);
  expect(loaded.state.money).toBeCloseTo(production(s) * 100 * 0.75 * 1.5);
  expect(loadCareer(storage, NOW + 100_000).state.money).toBe(loaded.state.money);
  const next = advanceCareer(loaded.state, NOW + 110_000).state;
  expect(next.pipeline.total).toBe(10);
  expect(production(next)).toBeGreaterThan(production(loaded.state));
});

it("retains previous main releases but pays no retrospective compiled-test income", () => {
  const s = senior();
  s.careers = 1;
  s.pipeline.total = 100;
  s.pipeline.credits = 100;
  const imported = importCareer(
    JSON.stringify({ ...s, pipeline: { ...s.pipeline, model: undefined } }),
    NOW + 10_000,
  );
  expect(imported.pipeline.total).toBeCloseTo(107.5);
  expect(imported.money).toBe(0);
  expect(imported.pipeline.model).toBe(2);
  expect(production(imported)).toBeGreaterThan(0);
  expect(importCareer(exportCareer(imported), NOW + 10_000).money).toBe(0);
});

it("integrates growing production precisely with real Date-sized timestamps", () => {
  const start = 1_800_000_000_000;
  const s = { ...newCareer(start), stage: 2, bestStage: 2, upgrades: ["auto"] };
  let fine = s;
  for (let i = 1; i <= 400; i++) {
    fine = advanceCareer(fine, start + i * 250).state;
  }
  const long = advanceCareer(s, start + 100_000).state;
  expect(long.money / fine.money).toBeCloseTo(1, 12);
  expect(long.pipeline.total / fine.pipeline.total).toBeCloseTo(1, 12);
  expect(long.badges).toEqual(fine.badges);
});
