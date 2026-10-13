// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerAction, CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { exportCareer, importCareer, normalizeCareer } from "./persistence";
import { viewUnlocked } from "./discovery";
import {
  architectureEffects,
  architectureUnlocked,
  optimalAllocation,
  pipelineRates,
} from "./architectureEffects";
import { coreBudget } from "./pipelineData";
import { currentChapter } from "./chapters";
import { productBoost } from "./productEffects";
import { resourceOverview } from "./resources";

const NOW = 20_000_000;
const layers = (s: CareerState) =>
  (["projects", "pipeline", "products", "studio"] as const).filter((v) =>
    viewUnlocked(s, v),
  );
const funded = () => ({
  ...newCareer(NOW),
  money: 1e12,
  earned: 1e12,
  lifetimeEarned: 1e12,
  rankEarned: 1e12,
  crew: { ...newCareer(NOW).crew, assistant: 100 },
  upgrades: ["checklist"],
});
function perform(s: CareerState, action: CareerAction): CareerState {
  const result = act(s, action, s.lastTick);
  expect(result.ok, result.message).toBe(true);
  return result.state;
}
const promote = (s: CareerState) =>
  perform({ ...s, rankEarned: 1e12 }, { type: "promote" });
const wait = (s: CareerState, seconds = 120) =>
  advanceCareer(s, s.lastTick + seconds * 1000).state;

describe("focused first journey", () => {
  it("introduces one main layer per rank through real project, trial and promotion actions", () => {
    let s = funded();
    expect(layers(s)).toEqual([]);
    s = promote(s);
    expect(layers(s)).toEqual(["projects"]);
    expect(act(s, { type: "research", id: "fieldnotes" }, s.lastTick).ok).toBe(false);
    s = perform(s, { type: "startProject", id: "button" });
    for (let phase = 0; phase < 3; phase++) {
      s = perform(wait(s), { type: "submitProject" });
    }
    expect(s.certificates["button"]).toBe(1);
    expect(s.insights).toBeGreaterThan(0);
    expect(layers(s)).toEqual(["projects"]);
    const knowledge = resourceOverview(s).find((r) => r.id === "insights");
    expect(knowledge?.balance).toBe(s.insights);
    expect(knowledge?.view).toBe("projects");
    expect(act(s, { type: "assignSpecialist", id: "marta" }, s.lastTick).ok).toBe(false);
    s = promote(s);
    expect(layers(s)).toEqual(["projects", "pipeline"]);
    expect(act(s, { type: "launchProduct", id: "checklist" }, s.lastTick).ok).toBe(false);
    s = wait(s);
    s = perform(s, { type: "startTrial", id: "budget" });
    s = perform(wait(s), { type: "claimTrial" });
    expect(s.pipeline.architecture.autoBalance).toBe(false);
    s = promote(s);
    expect(layers(s)).toEqual(["projects", "pipeline", "products"]);
    expect(currentChapter(s).goals).toContainEqual({ kind: "products", target: 1 });
    expect(act({ ...s, rankEarned: 1e12 }, { type: "promote" }, s.lastTick).ok).toBe(
      false,
    );
    s = perform(s, { type: "launchProduct", id: "checklist" });
    s = perform(s, { type: "productMode", id: "checklist", mode: "internal" });
    expect(productBoost(s, "internal")).toBeGreaterThan(0);
    expect(layers(s)).toEqual(["projects", "pipeline", "products"]);
    const savedInsights = s.insights;
    s = promote(s);
    expect(layers(s)).toEqual(["projects", "pipeline", "products", "studio"]);
    expect(s.insights).toBe(savedInsights);
    s = perform(s, { type: "research", id: "fieldnotes" });
    s = perform(s, { type: "assignSpecialist", id: "marta" });
    expect(importCareer(exportCareer(s), s.lastTick)).toEqual(s);
  });

  it.each([undefined, 0, 3, "2", null])(
    "keeps a reached old journey when its marker is %s",
    (marker) => {
      const s = {
        ...funded(),
        stage: 2,
        bestStage: 2,
        certificates: { button: 1 },
        insights: 20,
        lifetimeInsights: 20,
        research: { fieldnotes: 1 },
        specialists: ["marta"],
      };
      s.products.releases = { checklist: 1 };
      s.products.modes = { checklist: "internal" };
      const old = normalizeCareer({ ...s, journeyModel: marker }, NOW);
      expect(old.journeyModel).toBe(1);
      expect(layers(old)).toEqual(["projects", "pipeline", "products", "studio"]);
      expect(old.products.releases).toEqual(s.products.releases);
      expect(old.research).toEqual(s.research);
      expect(old.specialists).toEqual(s.specialists);
      expect(old.insights).toBe(20);
    },
  );

  it("normalizes focused prerequisites without refunding or deleting saved knowledge", () => {
    const s = {
      ...funded(),
      stage: 2,
      bestStage: 2,
      certificates: { button: 1 },
      insights: 20,
      lifetimeInsights: 20,
      research: { fieldnotes: 1 },
      specialists: ["marta"],
    };
    s.products.releases = { checklist: 1 };
    const next = normalizeCareer(s, NOW);
    expect(next.journeyModel).toBe(2);
    expect(next.products.releases).toEqual({});
    expect(next.research).toEqual({});
    expect(next.specialists).toEqual([]);
    expect(next.insights).toBe(20);
    expect(next.certificates).toEqual({ button: 1 });
    expect(
      normalizeCareer({ ...newCareer(NOW), journeyModel: undefined }, NOW).journeyModel,
    ).toBe(2);
  });

  it.each([1, 2] as const)(
    "preserves journey %i and owned effects after prestige",
    (journeyModel) => {
      const s = { ...funded(), journeyModel, stage: 5, bestStage: 5 };
      s.pipeline.total = 1000;
      s.pipeline.completed = ["budget", "verification", "deployment"];
      s.products.releases = { checklist: 1 };
      s.products.modes = { checklist: "internal" };
      const repeat = perform(s, { type: "prestige" });
      expect(repeat.journeyModel).toBe(journeyModel);
      expect(importCareer(exportCareer(repeat), NOW).journeyModel).toBe(journeyModel);
      expect(layers(repeat)).toEqual(["projects", "pipeline", "products"]);
      // Owned Checklist keeps its historical Senior activation rank in focused careers.
      expect(productBoost({ ...repeat, stage: 2 }, "internal")).toBeGreaterThan(0);
      expect(
        currentChapter({ ...repeat, stage: 3 }).goals.every(
          (g) => g.kind !== "products" || repeat.products.releases["checklist"] === 1,
        ),
      ).toBe(true);
    },
  );
});

describe("delegating demonstrated work", () => {
  const senior = () => {
    const s = { ...funded(), stage: 2, bestStage: 2 };
    s.upgrades.push("auto");
    s.pipeline.total = 200;
    s.pipeline.credits = 200;
    return s;
  };
  it("requires Budget, balances immediately and keeps every locked rack effect inert", () => {
    let s = senior();
    expect(act(s, { type: "pipelineBalance", enabled: true }, NOW).ok).toBe(false);
    s.pipeline.completed = ["budget"];
    s = perform(s, { type: "pipelineBalance", enabled: true });
    expect(s.pipeline.allocation).toEqual(
      optimalAllocation(coreBudget(s.pipeline), pipelineRates(s), [3, 2, 1]),
    );
    expect(architectureUnlocked(s)).toBe(false);
    s = perform(s, { type: "pipelineCore" });
    const allocationBeforeHire = s.pipeline.allocation;
    s = perform(s, { type: "hire", id: "runner", mode: 1 });
    expect(s.pipeline.allocation).toEqual(
      optimalAllocation(coreBudget(s.pipeline), pipelineRates(s), allocationBeforeHire),
    );
    expect(s.pipeline.allocation).not.toEqual(allocationBeforeHire);
    const forged = {
      ...s.pipeline.architecture,
      layout: ["manager", "archive", "bus", "manager", "archive", "bus"],
      blueprints: ["cycle", "bus", "flow", "studio"],
      autoCores: true,
      powerLevel: 4,
    };
    const loaded = normalizeCareer(
      { ...s, pipeline: { ...s.pipeline, architecture: forged } },
      NOW,
    );
    expect(loaded.pipeline.architecture.autoBalance).toBe(true);
    expect(loaded.pipeline.architecture.blueprints).toEqual([]);
    expect(loaded.pipeline.architecture.autoCores).toBe(false);
    expect(loaded.pipeline.architecture.powerLevel).toBe(0);
    expect(architectureEffects(loaded)).toEqual(architectureEffects(s));
    expect(act(loaded, { type: "pipelineAllocate", station: 0, delta: -1 }, NOW).ok).toBe(
      false,
    );
    const lead = { ...loaded, stage: 3, bestStage: 3 };
    const trial = perform(lead, { type: "startTrial", id: "verification" });
    expect(
      perform(trial, { type: "pipelineAllocate", station: 0, delta: -1, trial: true })
        .pipeline.allocation,
    ).toEqual(trial.pipeline.allocation);
  });

  it("enables only currently unlocked cash/project policies; later unlocks stay opt-in", () => {
    let s = senior();
    s = perform(s, { type: "pipelineDelegate", enabled: true });
    expect(s.pipeline.automation).toEqual({
      hire: true,
      upgrades: false,
      projects: false,
      promote: false,
      chapters: false,
    });
    const lead = { ...s, stage: 3, bestStage: 3 };
    lead.pipeline.completed = ["budget", "verification"];
    expect(lead.pipeline.automation.projects).toBe(false);
    s = perform(lead, { type: "pipelineDelegate", enabled: true });
    expect(s.pipeline.automation.projects).toBe(true);
    s.pipeline.completed.push("deployment");
    s = perform(s, { type: "pipelineDelegate", enabled: true });
    expect(s.pipeline.automation.upgrades).toBe(true);
    expect(s.pipeline.automation.promote).toBe(false);
    expect(s.pipeline.automation.chapters).toBe(false);
    s = perform(s, { type: "pipelineDelegate", enabled: false });
    expect(s.pipeline.automation.hire).toBe(false);
    expect(s.pipeline.automation.projects).toBe(false);
    expect(s.pipeline.automation.upgrades).toBe(false);
  });
  it("settles before opt-in and matches offline steps when automatic hires change capacity", () => {
    const s = senior();
    s.crew.squad = 20;
    s.pipeline.completed = ["budget"];
    const opted = act(s, { type: "pipelineDelegate", enabled: true }, NOW + 5000);
    expect(opted.ok).toBe(true);
    expect(opted.state.crew).toEqual(s.crew);
    const initial = perform(opted.state, { type: "pipelineBalance", enabled: true });
    const long = advanceCareer(initial, initial.lastTick + 60_000, true).state;
    let fine = initial;
    for (let second = 1; second <= 60; second++) {
      fine = advanceCareer(fine, initial.lastTick + second * 1000, true).state;
    }
    expect(long.crew).toEqual(fine.crew);
    expect(long.crew.runner).toBeGreaterThan(0);
    expect(long.pipeline.allocation).toEqual(fine.pipeline.allocation);
    expect(long.money / fine.money).toBeCloseTo(1, 12);
    expect(long.pipeline.total).toBeCloseTo(fine.pipeline.total, 10);
    expect(long.found).toBeCloseTo(fine.found, 8);
    expect(importCareer(exportCareer(long), long.lastTick)).toEqual(long);
  });
});
