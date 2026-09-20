// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BADGES, CAREER_RULES as R } from "./content";
import { PROJECTS } from "./expansionData";
import { PRODUCTS, PRODUCT_RULES as P } from "./productData";
import { productReady, productTerms, royaltyRate } from "./products";
import { exportCareer, importCareer, loadCareer, normalizeCareer } from "./persistence";
import { offlineCap, production } from "./selectors";

const NOW = 1_000_000;
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Expected a test fixture value");
  }
  return value;
}
const FIRST = required(PRODUCTS[0]);
function fixture(patch: Partial<CareerState> = {}): CareerState {
  return {
    ...newCareer(NOW),
    stage: 8,
    bestStage: 8,
    money: 1e14,
    insights: 1_000,
    lifetimeEarned: 1e14,
    lifetimeInsights: 1_000,
    certificates: Object.fromEntries(PROJECTS.map((p) => [p.id, 3])),
    badges: BADGES.map((b) => b.id),
    ...patch,
  };
}
function ready(s = fixture()): CareerState {
  const started = act(s, { type: "developProduct", id: FIRST.id }, NOW).state;
  const job = required(started.products.development);
  const terms = productTerms(FIRST, job.version);
  return {
    ...started,
    products: {
      ...started.products,
      development: { ...job, progress: terms.target, elapsed: terms.seconds },
    },
  };
}
function published(s = fixture()): CareerState {
  return act(ready(s), { type: "publishProduct" }, NOW).state;
}

describe("studio products", () => {
  it("validates all 18 authored releases and keeps their investments attainable", () => {
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(6);
    for (const def of PRODUCTS) {
      expect(PROJECTS.some((p) => p.id === def.project)).toBe(true);
      expect(def.releases).toHaveLength(P.versions);
      for (const version of [1, 2, 3]) {
        const terms = productTerms(def, version);
        expect(terms.cost).toBeLessThan(R.limit);
        expect(terms.target).toBeLessThan(R.limit);
        expect(terms.cost / terms.income).toBeGreaterThanOrEqual(300);
        expect(terms.cost / terms.income).toBeLessThanOrEqual(6_000);
        expect(terms.seconds).toBeGreaterThan(0);
        expect(terms.stage).toBeLessThanOrEqual(8);
      }
    }
  });
  it("requires rank, certificate, money and insights before spending", () => {
    for (const patch of [
      { stage: 1 },
      { certificates: {} },
      { money: 3_999 },
      { insights: 2 },
    ]) {
      const s = fixture(patch);
      const result = act(s, { type: "developProduct", id: FIRST.id }, NOW);
      expect(result.ok).toBe(false);
      expect(result.state.money).toBe(s.money);
      expect(result.state.insights).toBe(s.insights);
      expect(result.state.products.development).toBeNull();
    }
    expect(act(fixture(), { type: "developProduct", id: "unknown" }, NOW).ok).toBe(false);
  });
  it("spends once and rejects a second job in the shared development slot", () => {
    const s = fixture();
    const started = act(s, { type: "developProduct", id: FIRST.id }, NOW).state;
    expect(started.money).toBe(s.money - 4_000);
    expect(started.insights).toBe(s.insights - 3);
    for (const id of [FIRST.id, "devices"]) {
      const result = act(started, { type: "developProduct", id }, NOW);
      expect(result.ok).toBe(false);
      expect(result.state.products).toEqual(started.products);
      expect(result.state.money).toBe(started.money);
    }
  });
  it("requires both fresh bugs and elapsed time, never stored bugs", () => {
    const started = act(
      fixture({ bugs: 1e10 }),
      { type: "developProduct", id: FIRST.id },
      NOW,
    ).state;
    const waited = advanceCareer(started, NOW + 100_000).state;
    expect(waited.products.development).toMatchObject({ progress: 0, elapsed: 90 });
    expect(productReady(waited)).toBe(false);
    expect(act(waited, { type: "publishProduct" }, waited.lastTick).ok).toBe(false);
    const bugOnly = {
      ...started,
      products: {
        ...started.products,
        development: { ...required(started.products.development), progress: 2_000 },
      },
    };
    expect(productReady(bugOnly)).toBe(false);
    expect(act(bugOnly, { type: "publishProduct" }, NOW).ok).toBe(false);
  });
  it("counts manual tests and team bugs while leaving other work intact", () => {
    const s = act(
      fixture({ crew: { ...newCareer(NOW).crew, assistant: 10 } }),
      { type: "startProject", id: "button" },
      NOW,
    ).state;
    // Already-gold projects cannot start; use an ordinary unfinished bronze project.
    const projectState = act(
      { ...s, certificates: { button: 1 } },
      { type: "startProject", id: "cart" },
      NOW,
    ).state;
    const started = act(
      projectState,
      { type: "developProduct", id: FIRST.id },
      NOW,
    ).state;
    const manual = act(started, { type: "test" }, NOW).state;
    expect(required(manual.products.development).progress).toBeGreaterThan(0);
    expect(required(manual.products.development).progress).toBe(
      required(manual.project).progress,
    );
    const advanced = advanceCareer(manual, NOW + 1_000).state;
    expect(
      required(advanced.products.development).progress -
        required(manual.products.development).progress,
    ).toBeCloseTo(production(manual));
    expect(required(advanced.project).phase).toBe(0);
  });
  it("never retroactively develops or earns before the player's action", () => {
    const started = act(
      fixture({ crew: { ...newCareer(NOW).crew, assistant: 100 } }),
      { type: "developProduct", id: FIRST.id },
      NOW + 500_000,
    ).state;
    expect(started.products.development).toMatchObject({ progress: 0, elapsed: 0 });
    const launched = act(ready(), { type: "publishProduct" }, NOW + 500_000).state;
    expect(launched.products.earned).toBe(0);
    expect(
      advanceCareer(launched, launched.lastTick + 10_000).state.products.earned,
    ).toBe(120);
  });
  it("publishes once and earns without crew or automatic reports", () => {
    const s = published();
    expect(s.products.releases).toEqual({ checklist: 1 });
    expect(s.products.development).toBeNull();
    expect(act(s, { type: "publishProduct" }, NOW).ok).toBe(false);
    const next = advanceCareer(s, NOW + 10_000);
    expect(next.money).toBe(120);
    expect(next.productMoney).toBe(120);
    expect(next.state.earned).toBe(120);
    expect(next.state.lifetimeEarned - s.lifetimeEarned).toBe(120);
    expect(next.bugs).toBe(0);
  });
  it("requires silver/gold for new versions and replaces, rather than sums, income", () => {
    const s = published();
    expect(
      act(
        { ...s, certificates: { button: 1 } },
        { type: "developProduct", id: FIRST.id },
        NOW,
      ).ok,
    ).toBe(false);
    const upgraded = act(ready(s), { type: "publishProduct" }, NOW).state;
    expect(royaltyRate(upgraded)).toBe(60);
    const mastered = act(ready(upgraded), { type: "publishProduct" }, NOW).state;
    expect(royaltyRate(mastered)).toBe(300);
    expect(act(mastered, { type: "developProduct", id: FIRST.id }, NOW).ok).toBe(false);
  });
  it("keeps previous income during development and cancels without refund", () => {
    const s = published();
    const started = act(s, { type: "developProduct", id: FIRST.id }, NOW).state;
    const next = advanceCareer(started, NOW + 60_000).state;
    expect(next.products.earned).toBe(720);
    const canceled = act(next, { type: "cancelProduct" }, next.lastTick).state;
    expect(canceled.money).toBe(next.money);
    expect(canceled.insights).toBe(next.insights);
    expect(canceled.products).toMatchObject({
      development: null,
      releases: { checklist: 1 },
    });
    expect(royaltyRate(canceled)).toBe(12);
  });
  it("caps offline royalties, applies efficiency and never auto-publishes", () => {
    const s = ready(
      published(fixture({ crew: { ...newCareer(NOW).crew, assistant: 100 } })),
    );
    const next = advanceCareer(s, NOW + 100_000_000, true);
    expect(next.capped).toBe(true);
    expect(next.productMoney).toBe(offlineCap(s) * R.offlineEfficiency * 12);
    expect(next.state.products.releases).toEqual({ checklist: 1 });
    expect(productReady(next.state)).toBe(true);
    expect(advanceCareer(next.state, next.state.lastTick, true).money).toBe(0);
  });
  it("combines many dispatcher boundaries without duplicating royalties", () => {
    const s = published(
      fixture({
        stage: 3,
        contractsCompleted: 3,
        crew: { ...newCareer(NOW).crew, assistant: 100 },
        office: {
          licensed: true,
          contractId: "smoke",
          completed: 0,
          earned: 0,
          insights: 0,
        },
      }),
    );
    const combined = advanceCareer(s, NOW + 601_000);
    let incremental = s;
    for (let i = 1; i <= 601; i++) {
      incremental = advanceCareer(incremental, NOW + i * 1_000).state;
    }
    expect(combined.productMoney).toBeCloseTo(601 * 12);
    expect(combined.state.money).toBeCloseTo(incremental.money);
    expect(combined.state.products).toEqual(incremental.products);
    expect(combined.autoContracts).toBe(10);
  });
  it("preserves products and stats through prestige, pauses income until base rank", () => {
    const s = ready(
      advanceCareer(published(fixture({ earned: 25_000_000 })), NOW + 10_000).state,
    );
    const next = act(s, { type: "prestige" }, s.lastTick).state;
    expect(next.products).toEqual({
      releases: { checklist: 1 },
      development: null,
      earned: 120,
    });
    expect(royaltyRate(next)).toBe(0);
    expect(royaltyRate({ ...next, stage: 2 })).toBe(12);
    expect(importCareer(exportCareer(next), next.lastTick).products).toEqual(
      next.products,
    );
  });
  it("loads old v4 and v3 without granting products, normalizes invalid records", () => {
    const s = fixture();
    expect(normalizeCareer({ ...s, products: undefined }, NOW).products).toEqual(
      newCareer(NOW).products,
    );
    expect(
      importCareer(JSON.stringify({ ...published(), schemaVersion: 3 }), NOW).products,
    ).toEqual(newCareer(NOW).products);
    const bad = normalizeCareer(
      {
        ...s,
        products: {
          releases: { checklist: 99, devices: -1, qaos: Infinity, unknown: 3 },
          earned: -10,
          development: { id: "devices", version: 2, progress: 9999, elapsed: 9999 },
        },
      },
      NOW,
    );
    expect(bad.products).toEqual({
      releases: { checklist: 3 },
      development: null,
      earned: 0,
    });
    const locked = normalizeCareer(
      { ...s, certificates: {}, products: { releases: { checklist: 1 }, earned: 500 } },
      NOW,
    );
    expect(locked.products).toEqual(newCareer(NOW).products);
  });
  it("clamps valid development and discards unknown, skipped and locked versions", () => {
    const s = fixture();
    const good = normalizeCareer(
      {
        ...s,
        products: {
          development: { id: FIRST.id, version: 1, progress: 1e14, elapsed: 1e14 },
        },
      },
      NOW,
    );
    expect(good.products.development).toMatchObject({ progress: 2_000, elapsed: 90 });
    for (const job of [
      { id: "unknown", version: 1 },
      { id: FIRST.id, version: 2 },
      { id: FIRST.id, version: 1.5 },
    ]) {
      expect(
        normalizeCareer({ ...s, products: { development: job } }, NOW).products
          .development,
      ).toBeNull();
    }
    expect(
      normalizeCareer({ ...s, stage: 1, products: good.products }, NOW).products
        .development,
    ).toBeNull();
    const nan = normalizeCareer(
      {
        ...s,
        products: {
          development: { id: FIRST.id, version: 1, progress: NaN, elapsed: Infinity },
        },
      },
      NOW,
    );
    expect(nan.products.development).toMatchObject({ progress: 0, elapsed: 0 });
  });
  it("checkpoints offline royalties exactly once across reloads", () => {
    const data = new Map<string, string>([[R.saveKey, exportCareer(published())]]);
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    const first = loadCareer(storage, NOW + 100_000);
    const second = loadCareer(storage, NOW + 100_000);
    expect(required(first.summary).productMoney).toBe(900);
    expect(second.state.money).toBe(first.state.money);
    expect(second.state.products).toEqual(first.state.products);
  });
  it("ignores invalid time and keeps all earnings finite at the currency cap", () => {
    const s = published(
      fixture({ money: R.limit, earned: R.limit, lifetimeEarned: R.limit }),
    );
    for (const now of [NaN, Infinity, NOW - 1]) {
      expect(advanceCareer(s, now).state).toBe(s);
    }
    const next = advanceCareer(
      { ...s, money: R.limit, products: { ...s.products, earned: R.limit } },
      NOW + 100_000_000,
    ).state;
    expect(next.money).toBe(R.limit);
    expect(next.earned).toBe(R.limit);
    expect(next.lifetimeEarned).toBe(R.limit);
    expect(next.products.earned).toBe(R.limit);
  });
});
