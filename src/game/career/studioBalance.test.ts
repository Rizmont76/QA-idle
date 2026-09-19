// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CareerAction, CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { CAREER_STAGES, CAREER_UPGRADES, CREW } from "./content";
import { PROJECTS, RESEARCH } from "./expansionData";
import {
  contractReady,
  hasAutoReport,
  production,
  promotionReady,
  reportValue,
} from "./selectors";
import {
  certificates,
  projectReady,
  projectUnlocked,
  recruited,
  researchCost,
  researchUnlocked,
  specialistSlots,
} from "./studioSelectors";

function campaign(initial: CareerState, lowClick = false, mastery = false) {
  let state = initial;
  const start = initial.lastTick;
  const milestones: string[] = [];
  let director = 0;
  let founder = 0;
  const doAction = (action: CareerAction) => {
    state = act(state, action, state.lastTick).state;
  };
  for (let second = 1; second <= 43_200; second++) {
    state = advanceCareer(state, start + second * 1_000).state;
    if ((!lowClick && second % 2 === 0) || (!production(state) && second % 3 === 0)) {
      doAction({ type: "test" });
    }
    if (!hasAutoReport(state) && second % (lowClick ? 20 : 5) === 0) {
      doAction({ type: "report" });
    }
    if (promotionReady(state)) {
      doAction({ type: "promote" });
      milestones.push(`${CAREER_STAGES[state.stage]?.title ?? "?"}: ${String(second)}s`);
      if (state.stage === 5) {
        director = second;
      }
      if (state.stage === 8) {
        founder = second;
      }
    }
    if (state.stage >= 3 && !state.contract) {
      doAction({ type: "contract", id: "smoke" });
    }
    if (contractReady(state)) {
      doAction({ type: "claim" });
    }
    if (projectReady(state)) {
      doAction({ type: "submitProject" });
    }
    if (PROJECTS.every((p) => (state.certificates[p.id] ?? 0) >= (mastery ? 3 : 1))) {
      return { state, seconds: second, milestones, director, founder };
    }
    if (!state.project) {
      const next = PROJECTS.find(
        (p) =>
          (state.certificates[p.id] ?? 0) < (mastery ? 3 : 1) &&
          projectUnlocked(state, p),
      );
      if (next) {
        doAction({ type: "startProject", id: next.id });
      }
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
    const researchOrder = [
      "automation",
      "fieldnotes",
      "bargaining",
      "procurement",
      "leadership",
      "discoveries",
      "reputation",
      "pipelines",
      "intuition",
      "coordination",
    ];
    const research = researchOrder
      .map((id) => RESEARCH.find((r) => r.id === id))
      .find(
        (r) =>
          r &&
          researchUnlocked(state, r) &&
          (state.research[r.id] ?? 0) < r.max &&
          state.insights >= researchCost(state, r),
      );
    if (research) {
      doAction({ type: "research", id: research.id });
    }
    const preferred = (
      state.stage >= 5 ? ["nika", "taras", "lev", "marta"] : ["lev", "taras", "marta"]
    )
      .filter((id) => recruited(state, id))
      .slice(0, specialistSlots(state));
    for (const id of state.specialists) {
      if (!preferred.includes(id)) {
        doAction({ type: "assignSpecialist", id });
      }
    }
    for (const id of preferred) {
      if (!state.specialists.includes(id)) {
        doAction({ type: "assignSpecialist", id });
      }
    }
    const income = production(state) * reportValue(state);
    const choices: { action: CareerAction; score: number }[] = [];
    const options: CareerAction[] = [
      ...CREW.map((c) => ({ type: "hire" as const, id: c.id, mode: 1 as const })),
      ...CAREER_UPGRADES.filter((u) => u.effect !== "offline").map((u) => ({
        type: "upgrade" as const,
        id: u.id,
      })),
    ];
    for (const action of options) {
      const result = act(state, action, state.lastTick);
      if (!result.ok) {
        continue;
      }
      const cost = Math.max(1, state.money - result.state.money);
      const def =
        action.type === "upgrade"
          ? CAREER_UPGRADES.find((u) => u.id === action.id)
          : null;
      const manual =
        !lowClick && def && (def.effect === "click" || def.effect === "clickFlat")
          ? 1 / cost
          : 0;
      choices.push({
        action,
        score:
          (production(result.state) * reportValue(result.state) - income) / cost + manual,
      });
    }
    choices.sort((a, b) => b.score - a.score);
    if (choices[0]) {
      doAction(choices[0].action);
    }
  }
  return { state, seconds: 43_200, milestones, director, founder };
}

const active = campaign(newCareer(1_000));
const idle = campaign(newCareer(1_000), true);
const mastery = campaign(active.state, true, true);
describe("studio campaign balance", () => {
  it(`active campaign ${String(active.seconds)}s; ${active.milestones.join("; ")}`, () => {
    expect(active.state.stage).toBe(8);
    expect(certificates(active.state)).toBe(9);
    expect(active.director).toBeGreaterThan(300);
    expect(active.seconds).toBeGreaterThan(1_800);
    expect(active.seconds).toBeLessThan(14_400);
    expect(active.state.research["automation"]).toBeGreaterThan(0);
    expect(active.state.money).toBeGreaterThanOrEqual(0);
  });
  it(`low-click campaign ${String(idle.seconds)}s; Founder ${String(idle.founder)}s`, () => {
    expect(idle.state.stage).toBe(8);
    expect(certificates(idle.state)).toBe(9);
    expect(idle.seconds).toBeLessThan(21_600);
  });
  it(`all gold certifications attainable in another ${String(mastery.seconds)}s`, () => {
    expect(PROJECTS.every((p) => mastery.state.certificates[p.id] === 3)).toBe(true);
    expect(mastery.seconds).toBeLessThan(36_000);
    expect(mastery.state.badges).toContain("allGold");
  });
});
