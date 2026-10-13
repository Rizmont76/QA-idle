import type { CareerState } from "../../types";
import { JOURNEY_MODEL_VERSION } from "../../types";
import type { ProductDefinition } from "./productData";
import { CAREER_STAGES } from "./content";
import { STUDIO_RULES } from "./expansionData";

// Authored introduction ranks, documented in 28-Focused_Journey.
const PRODUCT_INTRODUCTION = 3;
const STUDIO_INTRODUCTION = 4;
export const focusedJourney = (s: CareerState) =>
  s.journeyModel === JOURNEY_MODEL_VERSION;
export const productIntroduction = (s: CareerState, def: ProductDefinition) =>
  Math.max(def.stage, focusedJourney(s) ? PRODUCT_INTRODUCTION : def.stage);
export const studioIntroduced = (s: CareerState) =>
  s.bestStage >= (focusedJourney(s) ? STUDIO_INTRODUCTION : STUDIO_RULES.unlockStage);

const FOCUSED_UNLOCKS: Record<number, string> = {
  1: "Перший клієнт: проєкти перетворюють роботу команди на сертифікати",
  2: "CI/CD: розподіляй ядра й створюй постійні автотести",
  3: "Продукти: обери, що дають твої автотести — дохід, швидкість чи інсайти",
  4: "Студія: накопичені інсайти стають постійними дослідженнями",
};
export const rankDiscovery = (s: CareerState, stage: number) =>
  (focusedJourney(s) ? FOCUSED_UNLOCKS[stage] : undefined) ??
  CAREER_STAGES[stage]?.unlock ??
  "Продовжуй кар’єру, щоб відкрити наступний прорив.";
