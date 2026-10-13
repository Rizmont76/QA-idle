import { expect, it, vi } from "vitest";
import { LAB } from "./data";
import { labWork, newReleaseLab, releaseLabAction } from "./engine";
import {
  exportReleaseLab,
  importReleaseLab,
  loadReleaseLab,
  normalizeReleaseLab,
} from "./persistence";

const NOW = 1000000;
it("round-trips a shipped, bought and growing laboratory without losing stock or policies", () => {
  let s = {
    ...newReleaseLab(NOW),
    patterns: 8,
    builds: 3,
    reports: 10000,
    buildWork: 10000,
    totalWork: 10000,
    scripts: 1,
    testers: 1,
  };
  s = releaseLabAction(s, { type: "auto", enabled: true }, NOW).state;
  s = releaseLabAction(s, { type: "buy", id: "scripts" }, NOW).state;
  s = releaseLabAction(s, { type: "efficiency" }, NOW).state;
  s = labWork(s, 20);
  expect(importReleaseLab(exportReleaseLab(s), NOW)).toEqual(s);
});
it("reads only its own key and leaves an absent prototype separate from the career", () => {
  const storage = { getItem: vi.fn(() => null) };
  expect(loadReleaseLab(storage, NOW).state).toEqual(newReleaseLab(NOW));
  expect(storage.getItem).toHaveBeenCalledExactlyOnceWith(LAB.key);
});
it("retains malformed data and blocks autosave instead of replacing it with a new game", () => {
  const original = '{"version":999,"valuable":"original"}';
  expect(loadReleaseLab({ getItem: () => original }, NOW)).toMatchObject({
    blocked: true,
    original,
    state: newReleaseLab(NOW),
  });
  expect(() => importReleaseLab("not json", NOW)).toThrow();
  expect(() =>
    importReleaseLab(exportReleaseLab(newReleaseLab(NOW)).repeat(2000), NOW),
  ).toThrow();
});
it("removes locked ownership, stocks and automation and clamps unsafe numeric values", () => {
  const s = normalizeReleaseLab(
    {
      version: 1,
      patterns: -3,
      builds: Infinity,
      reports: NaN,
      buildWork: -1,
      totalWork: Infinity,
      testers: 999,
      scripts: 999,
      cases: 999,
      ci: 999,
      bought: { testers: 2.9, scripts: 10, ci: 10 },
      efficiency: 999,
      autoBuy: true,
      lastTick: NOW + 10000,
    },
    NOW,
  );
  expect(s).toEqual({
    ...newReleaseLab(NOW),
    testers: 2,
    bought: { testers: 2, scripts: 0, ci: 0 },
    efficiency: LAB.efficiencyLevels,
  });
});
it("preserves starter ownership while preventing made-up purchased producers", () => {
  const s = normalizeReleaseLab(
    {
      ...newReleaseLab(NOW),
      patterns: 3,
      builds: 2,
      reports: 100,
      buildWork: 5,
      testers: 999,
      scripts: 999,
      cases: 2,
      ci: 3,
      bought: { testers: 1, scripts: 2, ci: 3 },
    },
    NOW,
  );
  expect(s).toMatchObject({
    reports: 14,
    testers: 2,
    scripts: 3,
    cases: 2,
    ci: 0,
    bought: { testers: 1, scripts: 2, ci: 0 },
    totalWork: 5,
  });
});
it("allows fractional generated scripts only after CI and requires a boolean opt-in", () => {
  const s = normalizeReleaseLab(
    {
      ...newReleaseLab(NOW),
      patterns: 12,
      builds: 3,
      scripts: 10.25,
      cases: 100.5,
      ci: 1.9,
      autoBuy: "true",
      lastTick: NaN,
    },
    NOW,
  );
  expect(s).toMatchObject({
    scripts: 10.25,
    cases: 100.5,
    ci: 1,
    autoBuy: false,
    lastTick: NOW,
  });
});
it("never adds starter reports above the documented resource ceiling during import", () => {
  const s = normalizeReleaseLab(
    {
      ...newReleaseLab(NOW),
      patterns: 12,
      builds: 4,
      buildWork: LAB.limit,
      reports: LAB.limit * 10,
      totalWork: LAB.limit * 10,
    },
    NOW,
  );
  expect(s.reports).toBe(LAB.limit);
  expect(s.buildWork).toBe(LAB.limit);
  expect(s.totalWork).toBe(LAB.limit);
});
