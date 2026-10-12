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
  expect(bulk.director).toBeGreaterThan(1200);
  expect(bulk.director).toBeLessThan(2400);
  for (let i = 1; i < bulk.rankSeconds.length; i++) {
    expect((bulk.rankSeconds[i] ?? 0) - (bulk.rankSeconds[i - 1] ?? 0)).toBeGreaterThan(
      180,
    );
  }
});
it(`first Director: active ${String(active.director)}s, low-click ${String(low.director)}s; ${active.milestones.join("; ")}`, () => {
  expect(active.director).toBeGreaterThan(1200);
  expect(active.director).toBeLessThan(2400);
  expect(low.director).toBeGreaterThan(1200);
  expect(low.director).toBeLessThan(3000);
  for (let i = 1; i < active.rankSeconds.length; i++) {
    expect(
      (active.rankSeconds[i] ?? 0) - (active.rankSeconds[i - 1] ?? 0),
    ).toBeGreaterThan(180);
  }
});
it(`retained knowledge accelerates repeat Director to ${String(repeat.director)}s without instant rank cascades`, () => {
  expect(repeat.director).toBeGreaterThan(0);
  expect(repeat.director).toBeLessThan(active.director / 2);
  for (let i = 1; i < repeat.rankSeconds.length; i++) {
    expect(
      (repeat.rankSeconds[i] ?? 0) - (repeat.rankSeconds[i - 1] ?? 0),
    ).toBeGreaterThan(10);
  }
});
