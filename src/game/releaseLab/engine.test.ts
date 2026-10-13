import { describe, expect, it } from "vitest";
import type { ReleaseLabState } from "../../types";
import {
  LAB,
  labRate,
  outputPower,
  patternPower,
  releaseGain,
  nextLabDiscovery,
  releaseWork,
  nextRewardWork,
  releaseRewardCap,
} from "./data";
import { advanceReleaseLab, labWork, newReleaseLab, releaseLabAction } from "./engine";

const NOW = 1_000_000;
function boot(patch: Partial<ReleaseLabState> = {}) {
  return { ...newReleaseLab(NOW), ...patch };
}
function act(
  s: ReleaseLabState,
  action: Parameters<typeof releaseLabAction>[1],
  now = s.lastTick,
) {
  return releaseLabAction(s, action, now);
}
function close(a: ReleaseLabState, b: ReleaseLabState) {
  for (const key of ["reports", "buildWork", "totalWork", "cases", "scripts"] as const) {
    expect(Math.abs(a[key] - b[key]) / Math.max(1, a[key], b[key]), key).toBeLessThan(
      1e-10,
    );
  }
}
describe("Release Lab production and shipping", () => {
  it("turns three manual tests into the first producer without losing completed work", () => {
    let s = boot();
    for (let i = 0; i < 3; i++) {
      s = act(s, { type: "test" }).state;
    }
    expect(s.reports).toBe(9);
    s = act(s, { type: "buy", id: "testers" }).state;
    expect(s).toMatchObject({ reports: 0, buildWork: 9, testers: 1 });
    expect(labRate(s)).toBe(1);
    expect(labWork(s, 10)).toMatchObject({ reports: 10, buildWork: 19 });
  });
  it("settles old production before a purchase, failed action or efficiency change", () => {
    const s = boot({ testers: 1, reports: 50, buildWork: 50 });
    const boosted = act(s, { type: "efficiency" }, NOW + 10_000);
    expect(boosted.ok).toBe(true);
    expect(boosted.state).toMatchObject({ reports: 0, buildWork: 60, efficiency: 1 });
    expect(labWork(boosted.state, 10).reports).toBe(20);
    const failed = act(
      boot({ testers: 1 }),
      { type: "buy", id: "scripts" },
      NOW + 10_000,
    );
    expect(failed.ok).toBe(false);
    expect(failed.state.reports).toBe(10);
  });
  it("settles old work before an affordable batch and spends only its actual quote", () => {
    const before = boot({ patterns: 1, builds: 1, testers: 1 });
    const result = act(before, { type: "buyMax", id: "testers" }, NOW + 15000);
    expect(result.ok).toBe(true);
    expect(result.state).toMatchObject({
      testers: 5,
      bought: { testers: 4, scripts: 0, ci: 0 },
      reports: 9,
      buildWork: 60,
      totalWork: 60,
    });
    expect(act(boot({ reports: LAB.limit }), { type: "buyMax", id: "scripts" }).ok).toBe(
      false,
    );
    expect(act(boot(), { type: "buyMax", id: "testers" }).ok).toBe(false);
  });
  it("makes maximum buying equal sequential purchases and respects the remaining purchase cap", () => {
    const before = boot({
      patterns: 12,
      builds: 4,
      reports: LAB.limit,
      testers: 96,
      bought: { testers: 95, scripts: 0, ci: 0 },
    });
    const batch = act(before, { type: "buyMax", id: "testers" }).state;
    let single = before;
    for (let i = 0; i < 5; i++) {
      single = act(single, { type: "buy", id: "testers" }).state;
    }
    expect(batch).toEqual(single);
    expect(batch.bought.testers).toBe(100);
    expect(batch.testers).toBe(101);
    expect(act(batch, { type: "buyMax", id: "testers" }).ok).toBe(false);
  });
  it("caps the first shipment at one pattern and grants a real fourfold new start", () => {
    const before = boot({
      reports: 20,
      buildWork: 30000,
      totalWork: 50000,
      testers: 8,
      efficiency: 2,
    });
    expect(releaseGain(before)).toBe(1);
    const result = act(before, { type: "ship" });
    expect(result.ok).toBe(true);
    expect(result.state).toMatchObject({
      patterns: 1,
      builds: 1,
      reports: 9,
      buildWork: 0,
      totalWork: 50000,
      testers: 1,
      scripts: 0,
      cases: 0,
      ci: 0,
      efficiency: 0,
      autoBuy: false,
      bought: { testers: 0, scripts: 0, ci: 0 },
    });
    expect(patternPower(result.state.patterns)).toBe(4);
    expect(labRate(result.state)).toBe(4);
    expect(act(result.state, { type: "test" }).state.reports).toBe(21);
    expect(nextLabDiscovery(result.state)?.at).toBe(3);
  });
  it("offers an early shipment or a larger gain after growing the same build", () => {
    const early = boot({ patterns: 1, builds: 1, testers: 2, buildWork: 750 });
    expect(releaseGain(early)).toBe(1);
    const held = labWork(early, 281.25);
    expect(held.buildWork).toBe(3000);
    expect(releaseGain(held)).toBe(2);
    const shipped = act(held, { type: "ship" }).state;
    expect(shipped).toMatchObject({
      patterns: 3,
      testers: 1,
      scripts: 1,
      cases: 0,
      ci: 0,
    });
    expect(shipped.autoBuy).toBe(false);
  });
  it.each([
    [0, 1],
    [1, 3],
    [3, 8],
    [7, 8],
    [8, 12],
  ])("never skips multiple discoveries from %i patterns", (patterns, endpoint) => {
    const s = act(boot({ patterns, builds: patterns, buildWork: LAB.limit }), {
      type: "ship",
    }).state;
    expect(s.patterns).toBe(endpoint);
    expect(s.autoBuy).toBe(false);
  });
  it("makes scripts grow productive cases without any purchase or claim", () => {
    const s = boot({ patterns: 3, builds: 2, testers: 1, scripts: 1 });
    const grown = labWork(s, 10);
    expect(grown.cases).toBeCloseTo(1.2);
    expect(grown.reports).toBeCloseTo(184);
    expect(labRate(grown)).toBeCloseTo(20.8);
    expect(grown.bought).toEqual(s.bought);
  });
  it("integrates CI to scripts to cases to reports as a cubic chain", () => {
    const s = boot({ patterns: 12, builds: 4, testers: 1, scripts: 1, ci: 1 });
    const grown = labWork(s, 20);
    expect(grown.scripts).toBeCloseTo(2);
    expect(grown.cases).toBeCloseTo(3.6);
    expect(grown.reports).toBeCloseTo(
      169 * (20 + 0.25 * (0.5 * 0.12 * 400 + (0.05 * 0.12 * 8000) / 6)),
    );
    expect(labRate(grown)).toBeGreaterThan(labRate(s));
    expect(grown.ci).toBe(1);
  });
  it("doubles generation and report output without multiplying stocks by pattern power", () => {
    const s = boot({ patterns: 12, testers: 1, scripts: 1, ci: 1, efficiency: 1 });
    const grown = labWork(s, 10);
    expect(grown.scripts).toBeCloseTo(2);
    expect(grown.cases).toBeCloseTo(3.6);
    expect(outputPower(grown)).toBe(338);
  });
  it("keeps locked stocks and opt-ins inert even before normalization", () => {
    const s = boot({ testers: 1, scripts: 999, cases: 999, ci: 999, autoBuy: true });
    const grown = advanceReleaseLab(s, NOW + 10_000);
    expect(grown).toMatchObject({ reports: 10, scripts: 0, cases: 0, testers: 1 });
    expect(act(s, { type: "auto", enabled: true }).ok).toBe(false);
    expect(act(s, { type: "buy", id: "scripts" }).ok).toBe(false);
    expect(act(s, { type: "buy", id: "ci" }).ok).toBe(false);
  });
  it("rejects incomplete and capped shipments and unaffordable or maxed purchases", () => {
    expect(act(boot({ buildWork: 299 }), { type: "ship" }).ok).toBe(false);
    expect(
      act(boot({ patterns: LAB.patterns, buildWork: LAB.limit }), { type: "ship" }).ok,
    ).toBe(false);
    expect(act(boot({ reports: 8 }), { type: "buy", id: "testers" }).ok).toBe(false);
    expect(
      act(
        boot({
          reports: LAB.limit,
          bought: { testers: LAB.purchases, scripts: 0, ci: 0 },
        }),
        { type: "buy", id: "testers" },
      ).ok,
    ).toBe(false);
    expect(
      act(boot({ reports: LAB.limit, efficiency: LAB.efficiencyLevels }), {
        type: "efficiency",
      }).ok,
    ).toBe(false);
  });
  it("keeps complexity and reward previews finite without promising work above the ceiling", () => {
    const s = boot({ patterns: 1000, buildWork: LAB.limit });
    expect(releaseWork(s)).toBe(LAB.limit);
    expect(releaseGain(s)).toBe(1);
    expect(releaseRewardCap(s)).toBe(1);
    expect(nextRewardWork(s)).toBe(LAB.limit);
  });
});
describe("Release Lab elapsed-time parity", () => {
  it.each([
    { patterns: 3, testers: 4, scripts: 6, efficiency: 2 },
    { patterns: 12, testers: 5, scripts: 3, ci: 4, cases: 10, efficiency: 3 },
    { patterns: 12, testers: 2, scripts: LAB.limit - 1, ci: 3, cases: LAB.limit - 2 },
    { patterns: 12, scripts: 1, ci: 20, cases: LAB.limit - 3, efficiency: 4 },
  ])("matches small online steps through growing stocks and saturation: %j", (patch) => {
    const s = boot(patch);
    const whole = labWork(s, 100);
    let small = s;
    for (let i = 0; i < 400; i++) {
      small = labWork(small, 0.25);
    }
    close(whole, small);
    expect(whole.cases).toBeLessThanOrEqual(LAB.limit);
    expect(whole.scripts).toBeLessThanOrEqual(LAB.limit);
    expect(whole.reports).toBeLessThanOrEqual(LAB.limit);
  });
  it("matches offline and online automatic buying at the same five-second boundaries", () => {
    const s = boot({ patterns: 12, testers: 2, scripts: 1, ci: 1, autoBuy: true });
    const offline = advanceReleaseLab(s, NOW + 60_000);
    let online = s;
    for (let i = 1; i <= 240; i++) {
      online = advanceReleaseLab(online, NOW + i * 250);
    }
    close(offline, online);
    expect(offline.bought).toEqual(online.bought);
    expect(offline.bought.testers).toBeGreaterThan(0);
    expect(offline.efficiency).toBe(0);
    expect(offline.builds).toBe(0);
  });
  it("does not spend retroactively when automation is enabled after an absence", () => {
    const s = boot({ patterns: 8, builds: 3, testers: 1, scripts: 1 });
    const enabled = act(s, { type: "auto", enabled: true }, NOW + 60_000).state;
    expect(enabled.bought.testers).toBe(0);
    expect(enabled.reports).toBeGreaterThan(0);
    expect(advanceReleaseLab(enabled, NOW + 64_999).bought.testers).toBe(0);
    expect(advanceReleaseLab(enabled, NOW + 65_000).bought.testers).toBe(1);
    const shipped = act(
      { ...enabled, buildWork: releaseWork(enabled) },
      { type: "ship" },
    ).state;
    expect(shipped.autoBuy).toBe(true);
    expect(shipped).toMatchObject({ patterns: 9, scripts: 1, ci: 0 });
  });
  it("caps offline time at eight hours and then starts the current clock", () => {
    const s = boot({ testers: 1 });
    const offline = advanceReleaseLab(s, NOW + 24 * 3600_000);
    expect(offline.reports).toBe(LAB.offlineSeconds);
    expect(offline.lastTick).toBe(NOW + 24 * 3600_000);
    expect(advanceReleaseLab(offline, offline.lastTick + 1000).reports).toBe(
      LAB.offlineSeconds + 1,
    );
  });
  it.each([NaN, Infinity, -100])(
    "ignores invalid or reversed elapsed time: %s",
    (time) => {
      const s = boot({ testers: 1 });
      expect(advanceReleaseLab(s, time)).toBe(s);
      expect(labWork(s, time)).toBe(s);
    },
  );
});
