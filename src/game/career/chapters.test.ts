// @vitest-environment node
import { describe, expect, it } from "vitest";
import { act, advanceCareer, newCareer } from "./engine";
import { earn } from "./earnings";
import { CAREER_RULES, CAREER_STAGES, CREW } from "./content";
import { CHAPTERS, chapterComplete, chapterValue, rankMultiplier } from "./chapters";
import { manualPower, production, promotionReady, reportValue } from "./selectors";
import { normalizeCareer, exportCareer, importCareer } from "./persistence";
import { automationIntent } from "./pipelineAutomation";
import { PROJECTS, RESEARCH } from "./expansionData";
import { PRODUCTS } from "./productData";
import { chapterIntent } from "./chapterActions";
import { dispatchPayment } from "./office";
import { promotionImpact } from "./promotionImpact";

function completeRank(stage: number) {
  const s = {
    ...newCareer(1),
    stage,
    bestStage: stage,
    money: CAREER_RULES.moneyLimit,
    earned: CAREER_RULES.moneyLimit,
    rankEarned: CAREER_RULES.moneyLimit,
    insights: 1000,
    upgrades: ["auto", "checklist"],
    contractsCompleted: 3,
    specialists: ["marta"],
  };
  for (const c of CREW) {
    if (c.stage <= stage) {
      s.crew[c.id] = 30;
    }
  }
  for (const p of PROJECTS) {
    if (p.stage <= stage) {
      s.certificates[p.id] = 1;
    }
  }
  for (const p of PRODUCTS) {
    if (p.stage <= stage) {
      s.products.releases[p.id] = 1;
    }
  }
  for (const r of RESEARCH) {
    s.research[r.id] = 1;
  }
  return s;
}
describe("career chapters", () => {
  it("requires every current chapter goal and keeps them available at that rank", () => {
    for (let stage = 0; stage < CAREER_STAGES.length - 1; stage++) {
      const s = completeRank(stage);
      expect(chapterComplete(s), `rank ${String(stage)}`).toBe(true);
      expect(promotionReady(s)).toBe(true);
      for (const goal of CHAPTERS[stage]?.goals ?? []) {
        expect(chapterValue(s, goal)).toBeGreaterThanOrEqual(goal.target);
      }
      if (stage === 1) {
        expect(promotionReady({ ...s, crew: { ...s.crew, squad: 2 } })).toBe(false);
      }
      if (stage === 2) {
        expect(promotionReady({ ...s, products: { ...s.products, releases: {} } })).toBe(
          false,
        );
      }
      if (stage === 3) {
        expect(promotionReady({ ...s, research: {} })).toBe(false);
      }
      if (stage === 4) {
        expect(promotionReady({ ...s, specialists: [] })).toBe(false);
      }
    }
  });
  it("resets rank income without spending cash and rejects an immediate next promotion", () => {
    const s = completeRank(0);
    const next = act(s, { type: "promote" }, 1).state;
    expect(next.stage).toBe(1);
    expect(next.rankEarned).toBe(0);
    expect(next.money).toBe(s.money);
    expect(next.earned).toBe(s.earned);
    const allGoals = { ...completeRank(1), rankEarned: next.rankEarned };
    expect(act(allGoals, { type: "promote" }, 1).ok).toBe(false);
  });
  it("doubles existing crew and the entire manual test at each promotion", () => {
    for (let stage = 0; stage < CAREER_STAGES.length - 1; stage++) {
      const s = completeRank(stage);
      const next = { ...s, stage: stage + 1 };
      expect(rankMultiplier(next) / rankMultiplier(s)).toBe(2);
      expect(production(next) / production(s)).toBeCloseTo(2);
      expect(manualPower(next) / manualPower(s)).toBeCloseTo(2);
      expect(production(next) * reportValue(next)).toBeGreaterThanOrEqual(
        production(s) * reportValue(s) * 2,
      );
      expect(promotionImpact(s, next)?.title).toBe(CAREER_STAGES[stage + 1]?.title);
    }
  });
  it("earns rank income at the global career cap and keeps all income sources consistent", () => {
    const s = { ...completeRank(1), rankEarned: 0 };
    const target = CAREER_STAGES[2]?.earned ?? 0;
    const paid = earn(s, target);
    expect(paid.earned).toBe(CAREER_RULES.moneyLimit);
    expect(paid.rankEarned).toBe(target);
    expect(promotionReady(paid)).toBe(true);
    const contract = act(completeRank(3), { type: "contract", id: "smoke" }, 1).state;
    const before = { ...contract, rankEarned: 0 };
    expect(dispatchPayment(before).rankEarned).toBe(before.contract?.reward);
    expect(
      advanceCareer({ ...completeRank(1), rankEarned: 0 }, 1001).state.rankEarned,
    ).toBeGreaterThan(0);
  });
  it("migrates old income once, preserves explicit zero and clamps malformed fields", () => {
    const legacy: Record<string, unknown> = { ...completeRank(1) };
    delete legacy["rankEarned"];
    const migrated = normalizeCareer(legacy, 1);
    expect(migrated.rankEarned).toBe(migrated.earned);
    expect(importCareer(exportCareer({ ...migrated, rankEarned: 0 }), 1).rankEarned).toBe(
      0,
    );
    expect(
      normalizeCareer({ ...legacy, earned: 500, rankEarned: 900 }, 1).rankEarned,
    ).toBe(500);
    expect(normalizeCareer({ ...legacy, rankEarned: -1 }, 1).rankEarned).toBe(0);
    expect(normalizeCareer({ ...legacy, rankEarned: Infinity }, 1).rankEarned).toBe(0);
    const large = normalizeCareer(
      { ...legacy, money: 3e16, earned: 3e16, rankEarned: 2e16, lifetimeEarned: 4e16 },
      1,
    );
    expect(importCareer(exportCareer(large), 1)).toMatchObject({
      money: 3e16,
      earned: 3e16,
      rankEarned: 2e16,
      lifetimeEarned: 4e16,
    });
  });
  it("makes new insight spending opt-in and prioritizes the chapter producer", () => {
    const s = completeRank(2);
    s.careers = 1;
    s.crew.runner = 0;
    s.pipeline.completed = ["deployment"];
    s.pipeline.total = 1000;
    expect(s.pipeline.automation.chapters).toBe(false);
    expect(automationIntent(s, "chapters")).toBe(null);
    s.pipeline.automation.hire = true;
    expect(automationIntent(s, "hire")).toEqual({ type: "hire", id: "runner", mode: 1 });
    const old = normalizeCareer(
      { ...s, pipeline: { ...s.pipeline, automation: { hire: true } } },
      1,
    );
    expect(old.pipeline.automation.chapters).toBe(false);
    const tool = completeRank(5);
    tool.careers = 1;
    tool.pipeline.completed = ["deployment"];
    tool.products.releases = { checklist: 1 };
    tool.pipeline.automation.chapters = true;
    expect(automationIntent(tool, "chapters")?.type).toBe("launchProduct");
    const intent = chapterIntent(tool);
    if (!intent) {
      throw new Error("Missing product intent");
    }
    const launched = act(tool, intent, 1);
    expect(launched.ok).toBe(true);
    expect(launched.state.insights).toBeLessThan(tool.insights);
    expect(chapterIntent({ ...tool, insights: 0 })).toEqual({
      type: "contract",
      id: "smoke",
    });
  });
});
