// @vitest-environment node
import { expect, it } from "vitest";
import { act, newCareer } from "./engine";
import { production } from "./selectors";
import { campaign } from "./simulationPolicy";
const active = campaign(newCareer(1_000), false, false, true);
const idle = campaign(newCareer(1_000), true, false, true);
const repeated = campaign(
  act(active.state, { type: "prestige" }, active.state.lastTick).state,
  false,
  false,
  true,
);
it(`active career reaches Director in ${String(active.seconds)}s; milestones ${active.milestones.join(", ")}; crew ${JSON.stringify(active.state.crew)}; upgrades ${active.state.upgrades.join(",")}; rate ${String(production(active.state))}`, () => {
  expect(active.state.stage).toBe(5);
  expect(active.firstHire).toBeLessThanOrEqual(90);
  expect(active.automation).toBeLessThan(600);
  expect(active.seconds).toBeGreaterThan(900);
  expect(active.seconds).toBeLessThan(2_700);
});
it(`low-click career reaches Director in ${String(idle.seconds)}s; automation ${String(idle.automation)}s`, () => {
  expect(idle.state.stage).toBe(5);
  expect(idle.seconds).toBeLessThan(7_200);
});
it(`prestige accelerates the next career: ${String(active.seconds)}s -> ${String(repeated.seconds)}s`, () => {
  expect(repeated.state.stage).toBe(5);
  expect(repeated.seconds).toBeLessThan(active.seconds * 0.8);
  expect(repeated.state.money).toBeGreaterThanOrEqual(0);
});
