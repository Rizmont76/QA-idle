// @vitest-environment node
import { expect, it } from "vitest";
import type { CareerAction, CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { CAREER_UPGRADES, CREW } from "./content";
import {
  contractReady,
  hasAutoReport,
  production,
  promotionReady,
  reportValue,
} from "./selectors";

function simulate(initial: CareerState, lowClick = false) {
  let state = initial;
  const start = state.lastTick;
  const milestones: number[] = [];
  let firstHire = 0;
  let automation = 0;
  const doAction = (action: CareerAction) => {
    state = act(state, action, state.lastTick).state;
  };
  for (let second = 1; second <= 10_800; second++) {
    state = advanceCareer(state, start + second * 1_000).state;
    if ((!lowClick && second % 2 === 0) || (!production(state) && second % 3 === 0)) {
      doAction({ type: "test" });
    }
    if (!hasAutoReport(state) && second % (lowClick ? 20 : 5) === 0) {
      doAction({ type: "report" });
    }
    if (promotionReady(state)) {
      doAction({ type: "promote" });
      milestones.push(second);
    }
    if (state.stage === 5) {
      return { state, seconds: second, milestones, firstHire, automation };
    }
    if (state.stage >= 3 && !state.contract) {
      doAction({ type: "contract", id: "smoke" });
    }
    if (contractReady(state)) {
      doAction({ type: "claim" });
    }
    if (state.stage >= 1 && !hasAutoReport(state) && state.money >= 80) {
      doAction({ type: "upgrade", id: "auto" });
    }
    if (state.stage >= 1 && !hasAutoReport(state)) {
      continue;
    }
    if (second % 5 !== 0) {
      continue;
    }
    const choices: { action: CareerAction; gain: number }[] = [];
    const income = production(state) * reportValue(state);
    for (const c of CREW) {
      const action: CareerAction = { type: "hire", id: c.id, mode: 1 };
      const result = act(state, action, state.lastTick);
      if (result.ok) {
        choices.push({
          action,
          gain:
            (production(result.state) * reportValue(result.state) - income) /
            Math.max(1, state.money - result.state.money),
        });
      }
    }
    for (const u of CAREER_UPGRADES) {
      if (u.effect === "offline") {
        continue;
      }
      const action: CareerAction = { type: "upgrade", id: u.id };
      const result = act(state, action, state.lastTick);
      if (result.ok) {
        const manualGain =
          u.effect === "clickFlat" || u.effect === "click"
            ? lowClick
              ? 0
              : 1 / u.cost
            : 0;
        choices.push({
          action,
          gain:
            (production(result.state) * reportValue(result.state) - income) / u.cost +
            manualGain,
        });
      }
    }
    choices.sort((a, b) => b.gain - a.gain);
    const best = choices[0];
    if (best) {
      doAction(best.action);
    }
    if (!firstHire && production(state) > 0) {
      firstHire = second;
    }
    if (!automation && hasAutoReport(state)) {
      automation = second;
    }
  }
  return { state, seconds: 10_800, milestones, firstHire, automation };
}
const active = simulate(newCareer(1_000));
const idle = simulate(newCareer(1_000), true);
const repeated = simulate(
  act(active.state, { type: "prestige" }, active.state.lastTick).state,
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
