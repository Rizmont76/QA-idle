// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { BADGES, CAREER_RULES as R } from "./content";
import { PROJECTS } from "./expansionData";
import { PRODUCTS } from "./productData";
import { gainClients, marketStrength, productBoost, royaltyRate } from "./productEffects";
import { exportCareer, importCareer, loadCareer, normalizeCareer } from "./persistence";
import { contractQuote, offlineCap } from "./selectors";
import { projectPhase, projectThroughput } from "./studioSelectors";

const NOW = 1_000_000;
function required<T>(v: T | null | undefined): T {
  if (v === null || v === undefined) {
    throw new Error("Missing fixture");
  }
  return v;
}
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
function launched(s = fixture()) {
  return act(s, { type: "launchProduct", id: "checklist" }, s.lastTick).state;
}

describe("products as studio tools", () => {
  it("launches all six once, requiring only a first certificate and base rank", () => {
    let s = fixture({ certificates: Object.fromEntries(PROJECTS.map((p) => [p.id, 1])) });
    for (const def of PRODUCTS) {
      const before = s;
      const result = act(s, { type: "launchProduct", id: def.id }, NOW);
      expect(result.ok).toBe(true);
      s = result.state;
      expect(s.money).toBe(before.money - def.cost);
      expect(s.insights).toBe(before.insights - def.insights);
      expect(s.products.releases[def.id]).toBe(1);
      expect(act(s, { type: "launchProduct", id: def.id }, NOW).state).toEqual(s);
    }
    expect(Object.keys(s.products.releases)).toHaveLength(6);
  });
  it("validates prerequisites without spending or granting work", () => {
    for (const patch of [
      { stage: 1 },
      { certificates: {} },
      { money: 3_999 },
      { insights: 2 },
    ]) {
      const s = fixture(patch);
      const result = act(s, { type: "launchProduct", id: "checklist" }, NOW);
      expect(result.ok).toBe(false);
      expect(result.state).toEqual(s);
    }
    expect(act(fixture(), { type: "launchProduct", id: "unknown" }, NOW).ok).toBe(false);
    expect(
      act(fixture(), { type: "productMode", id: "checklist", mode: "internal" }, NOW).ok,
    ).toBe(false);
  });
  it("never retroactively earns before launch or applies a mode before its action", () => {
    const s = act(
      fixture(),
      { type: "launchProduct", id: "checklist" },
      NOW + 500_000,
    ).state;
    expect(s.products.earned).toBe(0);
    const next = act(
      s,
      { type: "productMode", id: "checklist", mode: "internal" },
      s.lastTick + 10_000,
    ).state;
    expect(next.products.earned).toBe(120);
    expect(advanceCareer(next, next.lastTick + 10_000).productMoney).toBe(0);
    expect(royaltyRate(next)).toBe(0);
    expect(projectThroughput(next)).toBe(1.25);
  });
  it("makes roles mutually exclusive, and open source affects only new quotes", () => {
    const s = launched();
    const original = required(contractQuote(s, "smoke"));
    const open = act(
      { ...s, contract: original },
      { type: "productMode", id: "checklist", mode: "open" },
      NOW,
    ).state;
    expect(royaltyRate(open)).toBe(0);
    expect(productBoost(open, "internal")).toBe(0);
    expect(productBoost(open, "open")).toBe(0.125);
    expect(open.contract).toEqual(original);
    expect(required(contractQuote(open, "smoke")).insights).toBe(
      Math.floor(original.insights * 1.125),
    );
  });
  it("earns without crew/reports, caps offline time and applies efficiency", () => {
    const s = launched();
    const online = advanceCareer(s, NOW + 10_000);
    expect(online.productMoney).toBe(120);
    expect(online.state.earned).toBe(120);
    expect(online.state.lifetimeEarned - s.lifetimeEarned).toBe(120);
    expect(online.bugs).toBe(0);
    const offline = advanceCareer(s, NOW + 100_000_000, true);
    expect(offline.capped).toBe(true);
    expect(offline.productMoney).toBe(offlineCap(s) * R.offlineEfficiency * 12);
    expect(advanceCareer(offline.state, offline.state.lastTick, true).money).toBe(0);
  });
  it("grows clients only after ownership; bounds strength and never awards on switching", () => {
    expect(gainClients(fixture(), 10).products.clients).toBe(0);
    let s = gainClients(launched(), 10);
    expect(s.products.clients).toBe(10);
    s = act(s, { type: "productMode", id: "checklist", mode: "internal" }, NOW).state;
    expect(s.products.clients).toBe(10);
    s = gainClients(s, 1000);
    expect(s.products.clients).toBe(400);
    expect(marketStrength(s)).toBe(3);
    expect(productBoost(s, "internal")).toBe(0.75);
  });
  it("awards clients once for manual contracts and certificates, never cancellation", () => {
    let s = launched(fixture({ certificates: { button: 1 } }));
    const contract = required(contractQuote(s, "smoke"));
    s = act(
      {
        ...s,
        contract: { ...contract, elapsed: contract.duration, progress: contract.target },
      },
      { type: "claim" },
      NOW,
    ).state;
    expect(s.products.clients).toBe(1);
    s = act(s, { type: "claim" }, NOW).state;
    expect(s.products.clients).toBe(1);
    s = act(s, { type: "startProject", id: "cart" }, NOW).state;
    const project = { ...required(s.project), phase: 2 };
    s = act(
      { ...s, project: { ...project, progress: required(projectPhase(project)).target } },
      { type: "submitProject" },
      NOW,
    ).state;
    expect(s.products.clients).toBe(11);
    expect(act(s, { type: "cancelProject" }, NOW).state.products.clients).toBe(11);
  });
  it("splits royalties correctly across dispatcher growth boundaries", () => {
    const s = launched(
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
      incremental = advanceCareer(incremental, NOW + i * 1000).state;
    }
    expect(combined.state.money).toBeCloseTo(incremental.money, 0);
    expect(combined.state.products.clients).toBe(10);
    expect(combined.state.products.earned).toBeCloseTo(incremental.products.earned, 6);
    expect(combined.autoContracts).toBe(10);
  });
  it("preserves ownership, modes and clients through prestige; rank gates all effects", () => {
    let s = gainClients(launched(fixture({ earned: 25_000_000 })), 100);
    s = act(s, { type: "productMode", id: "checklist", mode: "internal" }, NOW).state;
    const next = act(s, { type: "prestige" }, NOW).state;
    expect(next.products).toEqual(s.products);
    expect(productBoost(next, "internal")).toBe(0);
    expect(productBoost({ ...next, stage: 2 }, "internal")).toBe(0.5);
    expect(importCareer(exportCareer(next), NOW).products).toEqual(next.products);
  });
  it("keeps earnings finite at the currency cap and ignores invalid time", () => {
    const s = launched(
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
    expect(next.products.earned).toBe(R.limit);
  });
});

describe("product save conversion", () => {
  it("refunds v2/v3 investments and converts ownership exactly once", () => {
    const source = fixture({ money: 10, insights: 0, lifetimeEarned: 99_999_999 });
    const migrated = normalizeCareer(
      { ...source, products: { releases: { checklist: 3 }, earned: 100 } },
      NOW,
    );
    expect(migrated.products.releases).toEqual({ checklist: 1 });
    expect(migrated.products.modes).toEqual({ checklist: "license" });
    expect(migrated.products.refund).toEqual({ money: 624_000, insights: 15 });
    expect(migrated.money).toBe(624_010);
    expect(migrated.insights).toBe(15);
    expect(migrated.earned).toBe(source.earned);
    expect(migrated.lifetimeEarned).toBe(source.lifetimeEarned);
    const next = importCareer(exportCareer(migrated), NOW);
    expect(next).toEqual(migrated);
    const dismissed = act(next, { type: "dismissProductRefund" }, NOW).state;
    expect(importCareer(exportCareer(dismissed), NOW).products.refund).toBeNull();
  });
  it("refunds a valid pending launch without granting its product or trusting saved prices", () => {
    const source = fixture({ money: 0, insights: 0 });
    const next = normalizeCareer(
      {
        ...source,
        products: {
          development: { id: "checklist", version: 1, cost: 1e14, progress: 0 },
        },
      },
      NOW,
    );
    expect(next.products.releases).toEqual({});
    expect(next.products.refund).toEqual({ money: 4000, insights: 3 });
    expect(next.money).toBe(4000);
    expect(next.insights).toBe(3);
  });
  it("refunds both earlier upgrades and a paid pending next version", () => {
    const s = normalizeCareer(
      {
        ...fixture(),
        products: {
          releases: { checklist: 2 },
          development: { id: "checklist", version: 3 },
        },
      },
      NOW,
    );
    expect(s.products.refund).toEqual({ money: 624_000, insights: 15 });
  });
  it("rejects unknown, skipped, fractional and rank/certificate locked investments", () => {
    for (const job of [
      { id: "unknown", version: 1 },
      { id: "checklist", version: 2 },
      { id: "checklist", version: 1.5 },
    ]) {
      expect(
        normalizeCareer({ ...fixture(), products: { development: job } }, NOW).products
          .refund,
      ).toBeNull();
    }
    for (const patch of [{ stage: 1 }, { certificates: {} }]) {
      expect(
        normalizeCareer(
          {
            ...fixture(patch),
            products: { development: { id: "checklist", version: 1 } },
          },
          NOW,
        ).products.refund,
      ).toBeNull();
    }
  });
  it("normalizes modes, clients and ownership without paying again for a refund notice", () => {
    const s = fixture({ money: 100 });
    const next = normalizeCareer(
      {
        ...s,
        products: {
          model: 2,
          releases: { checklist: 99, devices: -1, qaos: Infinity, unknown: 1 },
          clients: 999,
          modes: { checklist: "hacker" },
          earned: -10,
          refund: { money: 1e10, insights: -20 },
        },
      },
      NOW,
    );
    expect(next.products).toMatchObject({
      releases: { checklist: 1 },
      modes: { checklist: "license" },
      clients: 400,
      earned: 0,
    });
    expect(next.money).toBe(100);
    expect(
      normalizeCareer({ ...s, products: { model: 2, clients: 10 } }, NOW).products
        .clients,
    ).toBe(0);
    expect(normalizeCareer({ ...s, products: undefined }, NOW).products).toEqual(
      newCareer(NOW).products,
    );
    expect(
      importCareer(JSON.stringify({ ...launched(), schemaVersion: 3 }), NOW).products,
    ).toEqual(newCareer(NOW).products);
  });
  it("checkpoints refunds and offline royalties once across reloads", () => {
    const legacy = {
      ...fixture({ money: 0, insights: 0 }),
      products: { releases: { checklist: 3 }, earned: 0 },
    };
    const data = new Map<string, string>([[R.saveKey, JSON.stringify(legacy)]]);
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    const first = loadCareer(storage, NOW + 100_000);
    const second = loadCareer(storage, NOW + 100_000);
    expect(required(first.summary).productMoney).toBe(900);
    expect(first.state.money).toBe(624_900);
    expect(second.state.money).toBe(first.state.money);
    expect(second.state.products).toEqual(first.state.products);
  });
});
