// @vitest-environment node
import { describe, expect, it } from "vitest";
import { newCareer } from "./engine";
import { resourceOverview } from "./resources";
import { viewUnlocked } from "./discovery";
import { BLUEPRINTS } from "./architectureData";
import { PIPELINE_TRIALS } from "./pipelineData";
import { NETWORK } from "./networkData";
import { production, reportValue } from "./selectors";

describe("discovered resource overview", () => {
  it("keeps the ledger and future currencies hidden on a fresh start", () => {
    const s = newCareer(0);
    expect(viewUnlocked(s, "resources")).toBe(false);
    expect(resourceOverview(s).map((r) => r.id)).toEqual(["money", "bugs"]);
  });
  it("opens with insights and uses current automatic income", () => {
    const s = {
      ...newCareer(0),
      stage: 1,
      bestStage: 1,
      insights: 2,
      upgrades: ["auto"],
    };
    s.crew.assistant = 3;
    expect(viewUnlocked(s, "resources")).toBe(true);
    const rows = resourceOverview(s);
    expect(rows.map((r) => r.id)).toEqual(["money", "bugs", "insights"]);
    expect(rows[0]?.rate).toBe(production(s) * reportValue(s));
    expect(rows[1]?.rate).toBe(0);
    expect(rows.every((r) => viewUnlocked(s, r.view))).toBe(true);
  });
  it("reveals network balances and protocols only at their own milestones", () => {
    const s = { ...newCareer(0), careers: 1, bestStage: 5 };
    s.pipeline.completed = PIPELINE_TRIALS.map((t) => t.id);
    s.pipeline.architecture.blueprints = BLUEPRINTS.map((b) => b.id);
    expect(resourceOverview(s).map((r) => r.id)).toContain("computations");
    expect(resourceOverview(s).map((r) => r.id)).not.toContain("protocols");
    s.pipeline.network.runTotal = NETWORK.rebootAt;
    expect(resourceOverview(s).map((r) => r.id)).toContain("protocols");
  });
});
