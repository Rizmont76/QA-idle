// @vitest-environment node
import { describe, expect, it } from "vitest";
import { newCareer } from "./engine";
import { PROJECTS } from "./expansionData";
import { certificates } from "./studioSelectors";
import { campaign } from "./simulationPolicy";

const active = campaign(newCareer(1_000));
const idle = campaign(newCareer(1_000), true);
const mastery = campaign(active.state, true, true);
describe("studio campaign balance", () => {
  it(`active campaign ${String(active.seconds)}s; ${active.milestones.join("; ")}`, () => {
    expect(active.state.stage).toBe(8);
    expect(certificates(active.state)).toBe(9);
    expect(active.director).toBeGreaterThan(300);
    expect(active.seconds).toBeGreaterThan(900);
    expect(active.seconds).toBeLessThan(1_800);
    expect(active.state.research["automation"]).toBeGreaterThan(0);
    expect(active.state.money).toBeGreaterThanOrEqual(0);
  });
  it(`low-click campaign ${String(idle.seconds)}s; Founder ${String(idle.founder)}s`, () => {
    expect(idle.state.stage).toBe(8);
    expect(certificates(idle.state)).toBe(9);
    expect(idle.seconds).toBeGreaterThan(1_200);
    expect(idle.seconds).toBeLessThan(2_400);
  });
  it(`all gold certifications attainable in another ${String(mastery.seconds)}s`, () => {
    expect(PROJECTS.every((p) => mastery.state.certificates[p.id] === 3)).toBe(true);
    expect(mastery.seconds).toBeLessThan(300);
    expect(mastery.state.badges).toContain("allGold");
  });
});
