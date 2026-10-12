import { expect, it } from "vitest";
import { newCareer, act } from "./engine";
import { importCareer, exportCareer } from "./persistence";
import {
  pipelineView,
  productDiscovered,
  projectDiscovered,
  prestigeDiscovered,
  viewUnlocked,
} from "./discovery";
import type { CareerView } from "./discovery";
import { PRODUCTS } from "./productData";
import { PROJECTS } from "./expansionData";
const NOW = 20_000_000;
const views: CareerView[] = [
  "workspace",
  "settings",
  "office",
  "projects",
  "studio",
  "career",
  "products",
  "pipeline",
  "achievements",
];
it("reveals only playable workspace and settings for a fresh save", () => {
  const s = newCareer(NOW);
  expect(views.filter((v) => viewUnlocked(s, v))).toEqual(["workspace", "settings"]);
  expect(prestigeDiscovered(s)).toBe(false);
  expect(pipelineView(s, "network")).toBe("pipeline");
});
it("reveals rank, insights and tools at their actual milestones without using affordability", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 1;
  expect(viewUnlocked(s, "office")).toBe(true);
  expect(viewUnlocked(s, "projects")).toBe(true);
  expect(viewUnlocked(s, "studio")).toBe(false);
  s.lifetimeInsights = 3;
  expect(viewUnlocked(s, "studio")).toBe(true);
  s.certificates["button"] = 1;
  expect(viewUnlocked(s, "products")).toBe(false);
  s.bestStage = 2;
  expect(viewUnlocked(s, "products")).toBe(true);
  const [firstTool, secondTool] = PRODUCTS;
  const [, secondProject, thirdProject] = PROJECTS;
  if (!firstTool || !secondTool || !secondProject || !thirdProject) {
    throw new Error("Missing discovery fixtures");
  }
  expect(productDiscovered(s, firstTool)).toBe(true);
  expect(productDiscovered(s, secondTool)).toBe(false);
  expect(projectDiscovered(s, secondProject)).toBe(true);
  expect(projectDiscovered(s, thirdProject)).toBe(false);
});
it("retains discovery after ordinary prestige and normalized reload", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 5;
  s.earned = 2_500_000;
  s.lifetimeEarned = s.earned;
  s.lifetimeInsights = 3;
  s.certificates["button"] = 1;
  const result = act(s, { type: "prestige" }, NOW);
  expect(result.ok).toBe(true);
  const loaded = importCareer(exportCareer(result.state));
  for (const v of [
    "office",
    "projects",
    "studio",
    "career",
    "products",
    "pipeline",
  ] as const) {
    expect(viewUnlocked(loaded, v)).toBe(true);
  }
  expect(prestigeDiscovered(loaded)).toBe(true);
});
it("does not reveal late subtabs until all reward claims, and defaults safely for younger saves", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.completed = ["budget", "verification"];
  expect(pipelineView(s, "architecture")).toBe("pipeline");
  s.pipeline.completed.push("deployment");
  expect(pipelineView(s, "architecture")).toBe("architecture");
  expect(pipelineView(s, "network")).toBe("pipeline");
  s.pipeline.architecture.blueprints = ["cycle", "bus", "flow", "studio"];
  expect(pipelineView(s, "network")).toBe("network");
  expect(pipelineView(newCareer(NOW), "network")).toBe("pipeline");
});
