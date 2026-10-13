// @vitest-environment node
import { expect, it } from "vitest";
import { act, newCareer } from "./engine";
import { campaign } from "./simulationPolicy";

const first = campaign(newCareer(1000), true, false, true);
const delegated = campaign(newCareer(1000), true, false, true, false, true);
const reset = act(first.state, { type: "prestige" }, first.state.lastTick);
if (!reset.ok) {
  throw new Error(reset.message);
}
const repeat = campaign(reset.state, true, false, true);
const repeatDelegated = campaign(reset.state, true, false, true, false, true);

it(`first career: manual ${String(first.managementActions)} management actions / ${String(first.director)}s; delegated ${String(delegated.managementActions)} / ${String(delegated.director)}s`, () => {
  expect(first.state.stage).toBe(5);
  expect(delegated.state.stage).toBe(5);
  expect(delegated.managementActions).toBeLessThan(first.managementActions * 0.7);
  expect(delegated.director).toBeLessThan(1800);
  expect(delegated.state.pipeline.automation.promote).toBe(false);
  expect(delegated.state.pipeline.automation.chapters).toBe(false);
});
it(`repeat career: manual ${String(repeat.managementActions)} management actions / ${String(repeat.director)}s; delegated ${String(repeatDelegated.managementActions)} / ${String(repeatDelegated.director)}s`, () => {
  expect(repeat.state.stage).toBe(5);
  expect(repeatDelegated.state.stage).toBe(5);
  expect(repeatDelegated.managementActions).toBeLessThan(repeat.managementActions);
  expect(repeatDelegated.director).toBeLessThan(180);
});
