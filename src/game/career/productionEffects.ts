import type { CareerState } from "../../types";
import { PIPELINE_MODEL_VERSION } from "../../types";
import { CAREER_RULES as R, CAREER_UPGRADES } from "./content";
import { rankMultiplier } from "./chapters";
import { researchBonus } from "./studioSelectors";
import { architectureEffects } from "./architectureEffects";
import { PIPELINE } from "./pipelineData";
import { pipelineUnlocked } from "./pipelineUnlocks";

export const permanentMultiplier = (s: CareerState) =>
  1 + s.experience * R.experienceBonus + s.badges.length * R.badgeBonus;

export const productionFactor = (s: CareerState) =>
  CAREER_UPGRADES.filter(
    (u) => u.effect === "production" && s.upgrades.includes(u.id),
  ).reduce((n, u) => n * u.value, 1) *
  permanentMultiplier(s) *
  rankMultiplier(s) *
  (1 + researchBonus(s, "production")) *
  architectureEffects(s).crew;

export const scriptPower = (s: CareerState) =>
  s.pipeline.model === PIPELINE_MODEL_VERSION && pipelineUnlocked(s)
    ? PIPELINE.scriptRate * productionFactor(s)
    : 0;
