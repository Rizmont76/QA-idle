import type { CareerState } from "../../types";
import { PIPELINE_MODEL_VERSION } from "../../types";
import { PIPELINE } from "./pipelineData";
import type { TrialDefinition } from "./pipelineData";

export const pipelineUnlocked = (s: CareerState) =>
  (s.pipeline.model === PIPELINE_MODEL_VERSION && s.bestStage >= PIPELINE.unlockStage) ||
  s.careers > 0;

export const mainBalanceUnlocked = (s: CareerState) =>
  pipelineUnlocked(s) && s.pipeline.completed.includes("budget");

export const trialUnlocked = (s: CareerState, trial: TrialDefinition) =>
  pipelineUnlocked(s) &&
  s.pipeline.total >= PIPELINE.trialsAt &&
  (s.bestStage >= trial.stage || s.careers > 0);
