// @vitest-environment node
import { expect, it } from "vitest";
import { newCareer, act } from "./engine";
import { campaign } from "./simulationPolicy";

const active = campaign(newCareer(1), false, false, true);
const low = campaign(newCareer(1), true, false, true);
const repeat = campaign(
  act(active.state, { type: "prestige" }, active.state.lastTick).state,
  false,
  false,
  true,
);
const bulk = campaign(newCareer(1), false, false, true, true);
it(`bulk reinvestment Director ${String(bulk.director)}s; ${bulk.milestones.join("; ")}`, () => {
  expect(bulk.director).toBeGreaterThan(300);
  expect(bulk.director).toBeLessThan(1200);
  expect(bulk.discoveries[0]?.seconds).toBeLessThan(300);
  expect(bulk.state.pipeline.completed.length).toBeGreaterThanOrEqual(2);
  expect(bulk.state.pipeline.total).toBeGreaterThan(100);
});
it(`first Director: active ${String(active.director)}s, low-click ${String(low.director)}s; ${active.milestones.join("; ")}`, () => {
  expect(active.director).toBeGreaterThan(300);
  expect(active.director).toBeLessThan(1200);
  expect(low.director).toBeLessThan(1500);
  expect(active.discoveries[0]?.seconds).toBeLessThan(300);
  expect(active.discoveries.some((d) => d.title.includes("Автопроєкти"))).toBe(true);
  expect(low.state.pipeline.total).toBeGreaterThan(100);
});
it(`retained production compresses the mastered career to ${String(repeat.director)}s`, () => {
  expect(repeat.director).toBeGreaterThan(0);
  expect(repeat.director).toBeLessThan(active.director / 2);
  expect(repeat.state.pipeline.total).toBeGreaterThanOrEqual(active.state.pipeline.total);
  expect(repeat.state.stage).toBe(5);
});
