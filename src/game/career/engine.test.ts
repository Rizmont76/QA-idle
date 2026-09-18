// @vitest-environment node
import { describe, expect, it } from "vitest";
import { act, advanceCareer, newCareer } from "./engine";
import { CAREER_RULES as R, CAREER_STAGES, CAREER_UPGRADES, CREW } from "./content";
import {
  crewRate,
  hireQuote,
  manualPower,
  permanentMultiplier,
  prestigeReward,
  production,
  reportValue,
} from "./selectors";
import { exportCareer, importCareer, loadCareer, normalizeCareer } from "./persistence";
import type { CareerState } from "../../types";

const NOW = 1_000_000;
const base = (patch: Partial<CareerState> = {}): CareerState => ({
  ...newCareer(NOW),
  ...patch,
});
function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
describe("career economy", () => {
  it("starts with only manual play and makes reporting the source of money", () => {
    const tested = act(base(), { type: "test" }, NOW).state;
    expect(tested.bugs).toBe(1);
    expect(tested.money).toBe(0);
    expect(tested.badges).toContain("firstBug");
    const reported = act(tested, { type: "report" }, NOW).state;
    expect(reported.bugs).toBe(0);
    expect(reported.money).toBe(1);
    expect(reported.earned).toBe(1);
    expect(act(reported, { type: "report" }, NOW).ok).toBe(false);
  });
  it("rejects unavailable systems and unaffordable purchases inside the engine", () => {
    const richJunior = base({ money: 1e9 });
    expect(act(richJunior, { type: "hire", id: "lab", mode: "max" }, NOW).ok).toBe(false);
    expect(act(richJunior, { type: "upgrade", id: "auto" }, NOW).ok).toBe(false);
    expect(act(base(), { type: "hire", id: "assistant", mode: 1 }, NOW).ok).toBe(false);
    expect(act(richJunior, { type: "contract", id: "smoke" }, NOW).ok).toBe(false);
    expect(act(richJunior, { type: "prestige" }, NOW).ok).toBe(false);
  });
  it("bulk buying matches sequential purchases including rounded costs and milestones", () => {
    let sequential = base({ money: 2_500 });
    const quote = hireQuote(sequential, "assistant", "max");
    const bulk = act(
      sequential,
      { type: "hire", id: "assistant", mode: "max" },
      NOW,
    ).state;
    for (let i = 0; i < quote.count; i++) {
      sequential = act(sequential, { type: "hire", id: "assistant", mode: 1 }, NOW).state;
    }
    expect(bulk.crew).toEqual(sequential.crew);
    expect(bulk.money).toBe(sequential.money);
    expect(bulk.money).toBeGreaterThanOrEqual(0);
    expect(bulk.crew.assistant).toBeGreaterThanOrEqual(10);
    expect(production(bulk)).toBe(production(sequential));
  });
  it("doubles the whole producer group at a milestone and caps unit counts", () => {
    const before = base({ crew: { assistant: 9, squad: 0, runner: 0, lab: 0 } });
    const after = { ...before, crew: { ...before.crew, assistant: 10 } };
    expect(crewRate(after, "assistant") / crewRate(before, "assistant")).toBeCloseTo(
      20 / 9,
    );
    const full = act(
      base({ money: R.limit }),
      { type: "hire", id: "assistant", mode: "max" },
      NOW,
    ).state;
    expect(full.crew.assistant).toBe(R.crewLimit);
    expect(hireQuote(full, "assistant", 10).count).toBe(0);
  });
  it("requires lifetime run income and staff, not an unspent balance, to promote", () => {
    const s = base({
      earned: 150,
      money: 0,
      crew: { assistant: 3, squad: 0, runner: 0, lab: 0 },
    });
    expect(act(s, { type: "promote" }, NOW).state.stage).toBe(1);
    expect(act({ ...s, earned: 149 }, { type: "promote" }, NOW).ok).toBe(false);
    expect(
      act({ ...s, crew: { ...s.crew, assistant: 2 } }, { type: "promote" }, NOW).ok,
    ).toBe(false);
  });
  it("settles elapsed production before buying a multiplier", () => {
    const s = base({
      money: 500,
      crew: { assistant: 1, squad: 0, runner: 0, lab: 0 },
      badges: ["firstHire", "firstBug", "firstPay"],
    });
    const purchased = act(s, { type: "upgrade", id: "plan" }, NOW + 1_000).state;
    expect(purchased.found).toBeCloseTo(production(s));
    expect(production(purchased)).toBeCloseTo(production(s) * 1.25);
  });
  it("keeps manual play useful as production grows", () => {
    const s = base({ stage: 4, crew: { assistant: 20, squad: 20, runner: 10, lab: 2 } });
    expect(manualPower(s)).toBeGreaterThan(production(s) * R.clickRateShare);
  });
  it("has unique content ids and valid bounded costs", () => {
    for (const list of [CREW, CAREER_UPGRADES]) {
      expect(new Set(list.map((c) => c.id)).size).toBe(list.length);
      expect(
        list.every((c) => c.cost > 0 && c.stage >= 0 && c.stage < CAREER_STAGES.length),
      ).toBe(true);
    }
  });
});
describe("time and automation", () => {
  const producing = () =>
    base({
      stage: 1,
      crew: { assistant: 3, squad: 1, runner: 0, lab: 0 },
      badges: ["firstBug", "firstHire", "firstPay"],
    });
  it("uses elapsed time and makes split ticks equivalent before unlock boundaries", () => {
    const s = producing();
    const single = advanceCareer(s, NOW + 10_000).state;
    let split = s;
    for (let i = 1; i <= 40; i++) {
      split = advanceCareer(split, NOW + i * 250).state;
    }
    expect(split.bugs).toBeCloseTo(single.bugs, 8);
    expect(split.money).toBe(0);
    expect(advanceCareer(single, NOW).state).toBe(single);
  });
  it("converts the backlog exactly once after auto-report is purchased", () => {
    const s = { ...producing(), upgrades: ["auto"], bugs: 20 };
    const tick = advanceCareer(s, NOW + 1_000).state;
    expect(tick.money).toBeCloseTo((20 + production(s)) * reportValue(s));
    expect(tick.bugs).toBe(0);
    expect(advanceCareer(tick, NOW + 1_000).state.money).toBe(tick.money);
  });
  it("caps offline awards, uses offline efficiency, and respects auto-report state", () => {
    const s = producing();
    const offline = advanceCareer(s, NOW + 24 * 3_600_000, true);
    expect(offline.seconds).toBe(28_800);
    expect(offline.capped).toBe(true);
    expect(offline.bugs).toBeCloseTo(production(s) * 28_800 * 0.75);
    expect(offline.money).toBe(0);
    const automated = advanceCareer(
      { ...s, upgrades: ["auto", "handover"] },
      NOW + 24 * 3_600_000,
      true,
    );
    expect(automated.seconds).toBe(57_600);
    expect(automated.state.bugs).toBe(0);
    expect(automated.money).toBeCloseTo(production(s) * 57_600 * reportValue(s));
  });
});
describe("contracts and prestige", () => {
  it("requires both elapsed time and new bugs, with one claim per contract", () => {
    const s = base({
      stage: 3,
      found: 1e6,
      bugs: 1e6,
      crew: { assistant: 0, squad: 0, runner: 100, lab: 0 },
    });
    const started = act(s, { type: "contract", id: "smoke" }, NOW).state;
    expect(started.contract?.progress).toBe(0);
    expect(act(started, { type: "claim" }, NOW).ok).toBe(false);
    expect(act(started, { type: "contract", id: "release" }, NOW).ok).toBe(false);
    const early = advanceCareer(started, NOW + 1_000).state;
    expect(act(early, { type: "claim" }, NOW + 1_000).ok).toBe(false);
    const completed = advanceCareer(early, NOW + 60_000).state;
    const paid = act(completed, { type: "claim" }, NOW + 60_000).state;
    expect(paid.money).toBe(12_000);
    expect(paid.contractsCompleted).toBe(1);
    expect(paid.badges).toContain("contract");
    expect(act(paid, { type: "claim" }, NOW + 60_000).ok).toBe(false);
    expect(paid.bugs).toBeGreaterThan(s.bugs);
  });
  it("carries contract snapshots through promotion and offline return", () => {
    let s = act(
      base({
        stage: 3,
        earned: 350_000,
        crew: { assistant: 25, squad: 0, runner: 0, lab: 0 },
      }),
      { type: "contract", id: "smoke" },
      NOW,
    ).state;
    s = act(s, { type: "promote" }, NOW).state;
    expect(s.stage).toBe(4);
    expect(s.contract?.target).toBe(4_000);
    expect(importCareer(exportCareer(s), NOW).contract?.reward).toBe(12_000);
    expect(advanceCareer(s, NOW + 28_800_000, true).state.contract?.progress).toBe(4_000);
  });
  it("resets only the career, preserves permanent progress, and starts automation", () => {
    const s = base({
      stage: 5,
      bestStage: 5,
      earned: 2_500_000,
      money: 5_000,
      lifetimeEarned: 3_000_000,
      upgrades: ["plan", "auto"],
      crew: { assistant: 40, squad: 8, runner: 3, lab: 1 },
      badges: ["director"],
      contractsCompleted: 3,
    });
    expect(prestigeReward(s)).toBe(5);
    const next = act(s, { type: "prestige" }, NOW).state;
    expect(next.stage).toBe(0);
    expect(next.money).toBe(50);
    expect(next.earned).toBe(0);
    expect(next.crew.assistant).toBe(0);
    expect(next.upgrades).toEqual(["auto"]);
    expect(next.experience).toBe(5);
    expect(next.badges).toContain("director");
    expect(next.badges).toContain("rebirth");
    expect(next.lifetimeEarned).toBe(3_000_000);
    expect(next.contractsCompleted).toBe(3);
    expect(permanentMultiplier(next)).toBeGreaterThan(2);
  });
});
describe("save safety", () => {
  it("checkpoints offline production so reopening cannot replay the interval", () => {
    const initial = base({
      stage: 1,
      crew: { assistant: 3, squad: 0, runner: 0, lab: 0 },
      upgrades: ["auto"],
    });
    const store = storage({ [R.saveKey]: exportCareer(initial) });
    const first = loadCareer(store, NOW + 3_600_000);
    const second = loadCareer(store, NOW + 3_600_000);
    expect(first.state.money).toBeGreaterThan(0);
    expect(second.state.money).toBe(first.state.money);
    expect(second.summary?.seconds).toBe(0);
  });
  it("migrates v2 without retroactive rewards and preserves the original", () => {
    const original = JSON.stringify({
      meta: { schemaVersion: 2 },
      game: {
        resources: { money: 333, bugs_found: 17 },
        careerStage: "middle_qa",
        totalMoneyEarned: 444,
        totalBugsFound: 500,
        lastPlayedAt: 1,
        upgrades: { upgrade_better_checklist: 1, upgrade_keyboard_shortcuts: 1 },
        assistant: {
          unlocked: true,
          level: 8,
          ownedSupportUpgradeIds: ["support_offline_handover"],
        },
      },
    });
    const store = storage({ [R.legacyKey]: original });
    const loaded = loadCareer(store, NOW);
    expect(loaded.state.money).toBe(333);
    expect(loaded.state.bugs).toBe(17);
    expect(loaded.state.crew.assistant).toBe(9);
    expect(loaded.state.upgrades).toEqual(
      expect.arrayContaining(["checklist", "coffee", "plan", "handover"]),
    );
    expect(loaded.state.lastTick).toBe(NOW);
    expect(store.getItem(R.legacyKey)).toBe(original);
  });
  it("imports raw and schema-v1 saves", () => {
    expect(
      importCareer('{"money":25,"bugs":7,"upgrades":{"coffee":true}}', NOW).money,
    ).toBe(25);
    expect(
      importCareer(
        '{"meta":{"schemaVersion":1},"game":{"resources":{"money":50},"careerStage":"middle"}}',
        NOW,
      ).stage,
    ).toBe(1);
  });
  it("sanitizes non-finite balances, unknown ids, future timestamps, and locked content", () => {
    const s = normalizeCareer(
      {
        money: Infinity,
        bugs: -10,
        experience: NaN,
        stage: 1,
        lastTick: NOW + 5_000,
        crew: { assistant: 999, runner: 50 },
        upgrades: ["auto", "auto", "bad", "global"],
        badges: ["bad"],
      },
      NOW,
    );
    expect(s.money).toBe(0);
    expect(s.bugs).toBe(0);
    expect(s.experience).toBe(0);
    expect(s.lastTick).toBe(NOW);
    expect(s.crew.assistant).toBe(100);
    expect(s.crew.runner).toBe(0);
    expect(s.upgrades).toEqual(["auto"]);
    expect(advanceCareer(s, NOW).bugs).toBe(0);
  });
  it("does not overwrite corrupt or unsupported saves", () => {
    for (const raw of ["broken", '{"schemaVersion":99}', "{}", "null"]) {
      const store = storage({ [R.saveKey]: raw });
      expect(loadCareer(store, NOW).blocked).toBe(true);
      expect(store.getItem(R.saveKey)).toBe(raw);
      expect(() => importCareer(raw, NOW)).toThrow();
    }
  });
  it("reports storage failures while retaining in-memory offline progress", () => {
    const initial = base({ crew: { assistant: 1, squad: 0, runner: 0, lab: 0 } });
    const store = {
      getItem: () => exportCareer(initial),
      setItem: () => {
        throw new Error("quota");
      },
    };
    const result = loadCareer(store, NOW + 60_000);
    expect(result.state.bugs).toBeGreaterThan(0);
    expect(result.warning).not.toBe("");
  });
});
