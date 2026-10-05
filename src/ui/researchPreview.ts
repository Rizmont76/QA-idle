import type { CareerState } from "../types";
import type { ResearchDefinition } from "../game/career/expansionData";
import {
  contractQuote,
  manualPower,
  nextCrewCost,
  offlineCap,
  offlineEfficiency,
  production,
  reportValue,
} from "../game/career/selectors";
import {
  insightReward,
  projectThroughput,
  specialistSlots,
} from "../game/career/studioSelectors";
import { cash, clockTime, duration, number } from "./careerUtils";
const PERCENT = 100;
const SAMPLE_INSIGHTS = 10;

export function researchPreview(state: CareerState, def: ResearchDefinition) {
  const level = state.research[def.id] ?? 0;
  const next = {
    ...state,
    research: { ...state.research, [def.id]: Math.min(def.max, level + 1) },
  };
  let label: string;
  let format: (s: CareerState) => string;
  switch (def.effect) {
    case "production":
      label = "Твоя команда зараз";
      format = (s) => `${number(production(s))} багів/с`;
      break;
    case "projectWork":
      label = "Робота проєкту з кожного бага";
      format = (s) => `×${number(projectThroughput(s))}`;
      break;
    case "manual":
      label = "Твій ручний тест";
      format = (s) => `${number(manualPower(s))} багів`;
      break;
    case "report":
      label = "Вартість твого звіту";
      format = (s) => cash(reportValue(s));
      break;
    case "discount":
      label = "Наступний QA-асистент";
      format = (s) => cash(nextCrewCost(s, "assistant"));
      break;
    case "offlineHours":
      label = "Запас офлайн-часу";
      format = (s) => duration(offlineCap(s));
      break;
    case "offlineEfficiency":
      label = "Ефективність офлайн";
      format = (s) => `${number(offlineEfficiency(s) * PERCENT)}%`;
      break;
    case "slots":
      label = "Місця для фахівців";
      format = (s) => String(specialistSlots(s));
      break;
    case "insight":
      label = "Нагорода з базових 10 інсайтів";
      format = (s) => `${number(insightReward(s, SAMPLE_INSIGHTS))} ◈`;
      break;
    case "contractTime":
      label = "Новий Smoke-контракт";
      format = (s) =>
        clockTime(contractQuote({ ...s, stage: 3 }, "smoke")?.duration ?? 0);
      break;
    case "contractReward":
      label = "Новий Smoke на QA Lead";
      format = (s) => cash(contractQuote({ ...s, stage: 3 }, "smoke")?.reward ?? 0);
      break;
  }
  return { label, before: format(state), after: format(next) };
}
