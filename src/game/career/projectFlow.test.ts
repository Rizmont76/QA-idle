// @vitest-environment node
import { expect, it } from "vitest";
import type { CareerState } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { advanceProject } from "./projectFlow";
import { projectPhase, projectQuote, projectReady } from "./studioSelectors";
import { PROJECTS } from "./expansionData";
import { exportCareer, importCareer, normalizeCareer } from "./persistence";
import { manualPower, production } from "./selectors";

const NOW = 100_000;
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Missing fixture");
  }
  return value;
}
function fixture(patch: Partial<CareerState> = {}): CareerState {
  const s = {
    ...newCareer(NOW),
    stage: 3,
    bestStage: 3,
    insights: 100,
    research: { fieldnotes: 1 },
    ...patch,
  };
  return act(s, { type: "startProject", id: "button" }, NOW).state;
}
it("carries excess work into the next phase exactly once", () => {
  const s = fixture();
  const next = advanceProject(s, 90); // 100 work: 80 for phase 1, 20 for phase 2.
  expect(next).toMatchObject({ phase: 1, progress: 20 });
  expect(s.project).toMatchObject({ phase: 0, progress: 0 });
});
it("manual production uses the same throughput as passive work", () => {
  const s = fixture();
  const next = act(s, { type: "test" }, NOW).state;
  expect(next.project?.progress).toBeCloseTo(manualPower(s) / 0.9);
});
it("automatic offline phases stop at the final release without claiming rewards", () => {
  const s = fixture({ crew: { ...newCareer(NOW).crew, assistant: 100 } });
  const next = advanceCareer(s, NOW + 3_600_000, true).state;
  expect(next.project?.phase).toBe(2);
  expect(projectReady(next)).toBe(true);
  expect(next.certificates).toEqual({});
  expect(next.insights).toBe(100);
  expect(act(next, { type: "submitProject" }, next.lastTick).state.certificates).toEqual({
    button: 1,
  });
});
it("a long tick and small ticks conserve the same project work", () => {
  const s = fixture({ crew: { ...newCareer(NOW).crew, assistant: 10 } });
  const next = advanceCareer(s, NOW + 45_000).state;
  let split = s;
  for (let i = 1; i <= 45; i++) {
    split = advanceCareer(split, NOW + i * 1000).state;
  }
  expect(split.project?.phase).toBe(next.project?.phase);
  expect(split.project?.progress).toBeCloseTo(required(next.project).progress);
  expect(production(s)).toBeGreaterThan(0);
});
it("buying field notes accelerates the current project only after purchase", () => {
  const s = fixture({ research: {}, crew: { ...newCareer(NOW).crew, assistant: 1 } });
  const next = act(s, { type: "research", id: "fieldnotes" }, NOW + 10_000).state;
  expect(next.project?.progress).toBeCloseTo(production(s) * 10);
  const after = advanceCareer(next, next.lastTick + 10_000).state;
  expect(required(after.project).progress - required(next.project).progress).toBeCloseTo(
    (production(next) * 10) / 0.9,
  );
});
it("maps legacy silver progress proportionally, preserves rewards, and does not migrate twice", () => {
  const s = { ...newCareer(NOW), stage: 3, bestStage: 3, certificates: { button: 1 } };
  const quote = projectQuote(s, required(PROJECTS[0]));
  const legacy = {
    ...quote,
    flowVersion: undefined,
    workMultiplier: 0.92,
    progress: Math.ceil(80 * 12 * 0.92) / 2,
    elapsed: 25,
  };
  const next = normalizeCareer({ ...s, project: legacy }, NOW);
  expect(next.project).toMatchObject({
    flowVersion: 1,
    phase: 0,
    progress: 160,
    elapsed: 0,
    workMultiplier: 1,
    reward: 8000,
  });
  expect(importCareer(exportCareer(next), NOW).project).toEqual(next.project);
  const completed = normalizeCareer(
    { ...s, project: { ...legacy, progress: Math.ceil(80 * 12 * 0.92) } },
    NOW,
  );
  expect(projectReady(completed)).toBe(true);
  expect(required(projectPhase(required(completed.project))).target).toBe(320);
});
