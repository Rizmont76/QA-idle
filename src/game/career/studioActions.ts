import type { CareerAction, CareerState } from "../../types";
import { PROJECTS, RESEARCH, SPECIALISTS, STUDIO_RULES as S } from "./expansionData";
import { bounded } from "./selectors";
import {
  projectQuote,
  projectReady,
  projectUnlocked,
  recruited,
  researchCost,
  researchUnlocked,
  specialistSlots,
} from "./studioSelectors";

export function studioAction(
  state: CareerState,
  action: CareerAction,
): { state: CareerState; ok: boolean; message: string } {
  const fail = (message: string) => ({ state, ok: false, message });
  let message: string;
  switch (action.type) {
    case "research": {
      const def = RESEARCH.find((r) => r.id === action.id);
      if (
        !def ||
        !researchUnlocked(state, def) ||
        (state.research[def.id] ?? 0) >= def.max
      ) {
        return fail("Це дослідження поки недоступне.");
      }
      const cost = researchCost(state, def);
      if (state.insights < cost) {
        return fail("Потрібно більше інсайтів. Завершуй проєкти та контракти.");
      }
      state = {
        ...state,
        insights: state.insights - cost,
        research: { ...state.research, [def.id]: (state.research[def.id] ?? 0) + 1 },
      };
      message = `${def.title}: знання залишаться після престижу.`;
      break;
    }
    case "assignSpecialist": {
      const def = SPECIALISTS.find((p) => p.id === action.id);
      if (!def || !recruited(state, def.id)) {
        return fail("Спочатку заверши проєкт, щоб запросити цього фахівця.");
      }
      if (state.specialists.includes(def.id)) {
        state = {
          ...state,
          specialists: state.specialists.filter((id) => id !== def.id),
        };
        message = `${def.name} тепер у резерві.`;
      } else {
        if (state.specialists.length >= specialistSlots(state)) {
          return fail(
            "Усі місця зайняті. Переведи когось у резерв або відкрий третє крісло.",
          );
        }
        state = { ...state, specialists: [...state.specialists, def.id] };
        message = `${def.name} у команді. ${def.description}.`;
      }
      break;
    }
    case "startProject": {
      const def = PROJECTS.find((p) => p.id === action.id);
      if (state.project) {
        return fail("Спочатку заверши або скасуй поточний проєкт.");
      }
      if (!def || !projectUnlocked(state, def)) {
        return fail("Проєкт ще закритий або всі сертифікації вже отримано.");
      }
      state = { ...state, project: projectQuote(state, def) };
      message = `Проєкт «${def.title}» розпочато. Нові баги наближають реліз.`;
      break;
    }
    case "submitProject": {
      const project = state.project;
      if (!project || !projectReady(state)) {
        return fail("Виконай ціль за багами та часом, щоб здати етап.");
      }
      const def = PROJECTS.find((p) => p.id === project.id);
      if (!def || (state.certificates[def.id] ?? 0) !== project.tier) {
        return fail("Цю сертифікацію вже отримано.");
      }
      if (project.phase < S.phases - 1) {
        state = {
          ...state,
          project: { ...project, phase: project.phase + 1, progress: 0, elapsed: 0 },
        };
        message = "Етап прийнято. Починаємо наступну перевірку!";
      } else {
        state = {
          ...state,
          project: null,
          money: bounded(state.money + project.reward),
          earned: bounded(state.earned + project.reward),
          lifetimeEarned: bounded(state.lifetimeEarned + project.reward),
          insights: bounded(state.insights + project.insights),
          lifetimeInsights: bounded(state.lifetimeInsights + project.insights),
          certificates: { ...state.certificates, [def.id]: project.tier + 1 },
        };
        const specialist =
          project.tier === 0 ? SPECIALISTS.find((p) => p.project === def.id) : undefined;
        message = `Проєкт завершено! +${String(project.insights)} інсайтів.${specialist ? ` ${specialist.name} чекає в студії.` : " Сертифікат у портфоліо."}`;
      }
      break;
    }
    case "cancelProject":
      state = { ...state, project: null };
      message = "Проєкт скасовано. Отримані раніше сертифікати збережено.";
      break;
    default:
      return fail("Невідома дія студії.");
  }
  return { state, ok: true, message };
}
