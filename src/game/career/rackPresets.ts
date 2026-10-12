import type { CareerState, RackPresetId } from "../../types";
import { BLUEPRINTS, RACK_PRESETS } from "./architectureData";
import {
  architectureUnlocked,
  balanceArchitecture,
  moduleUnlocked,
  powerBudget,
  powerUsed,
  sustainableRate,
} from "./architectureEffects";
import { production } from "./selectors";
import { projectThroughput } from "./studioSelectors";
import { openInsightRate } from "./productEffects";

export const rackPresetsUnlocked = (s: CareerState) =>
  architectureUnlocked(s) &&
  BLUEPRINTS.every((b) => s.pipeline.architecture.blueprints.includes(b.id));

const stats = (s: CareerState) => ({
  bugs: production(s),
  rate: sustainableRate(s),
  projectWork: production(s) * projectThroughput(s),
  insights: openInsightRate(s),
});

export function rackPresetPreview(s: CareerState, id: RackPresetId) {
  const def = RACK_PRESETS.find((p) => p.id === id);
  if (!def || !rackPresetsUnlocked(s)) {
    return null;
  }
  const power = powerUsed([...def.layout]);
  const allowed =
    power <= powerBudget(s) &&
    def.layout.every((module) => module === null || moduleUnlocked(s, module));
  const state = balanceArchitecture({
    ...s,
    pipeline: {
      ...s.pipeline,
      architecture: { ...s.pipeline.architecture, layout: [...def.layout] },
    },
  });
  return {
    state,
    allowed,
    power,
    ...stats(state),
    current: stats(s),
    selected: s.pipeline.architecture.layout.every(
      (module, slot) => module === def.layout[slot],
    ),
  };
}
