import type { CareerAction, CareerState } from "../../types";
import { contractQuote, bounded } from "./selectors";
import { amount, record } from "./saveValues";

export const OFFICE_RULES = { licenseCost: 20, stage: 3, contracts: 3 } as const;
export const OFFICES = [
  {
    stage: 0,
    title: "Перший робочий стіл",
    subtitle: "Один ноутбук. Великі плани.",
    color: "#8be2bb",
  },
  {
    stage: 2,
    title: "Кімната команди",
    subtitle: "Тепер є кому сказати: «Перевір ще раз».",
    color: "#88b9f0",
  },
  {
    stage: 4,
    title: "Лабораторія якості",
    subtitle: "Більше пристроїв. Менше сюрпризів на проді.",
    color: "#c7a7ee",
  },
  {
    stage: 6,
    title: "Хмарний кампус",
    subtitle: "Твоя команда працює в різних часових поясах.",
    color: "#edc482",
  },
  {
    stage: 8,
    title: "Штаб-квартира",
    subtitle: "Колись усе починалося з однієї кнопки.",
    color: "#e6a6c9",
  },
] as const;
export function officeLevel(s: CareerState) {
  return OFFICES.filter((o) => o.stage <= s.bestStage).length - 1;
}
export function dispatcherUnlocked(s: CareerState) {
  return (
    s.bestStage >= OFFICE_RULES.stage && s.contractsCompleted >= OFFICE_RULES.contracts
  );
}
export function dispatchQuote(s: CareerState) {
  return s.office.licensed && s.office.contractId
    ? contractQuote(s, s.office.contractId)
    : null;
}
export function officeAction(state: CareerState, action: CareerAction) {
  const fail = (message: string) => ({ state, ok: false, message });
  if (action.type === "buyDispatcher") {
    if (
      state.office.licensed ||
      !dispatcherUnlocked(state) ||
      state.insights < OFFICE_RULES.licenseCost
    ) {
      return fail("Потрібні QA Lead, 3 завершені контракти та 20 інсайтів.");
    }
    return {
      state: {
        ...state,
        insights: state.insights - OFFICE_RULES.licenseCost,
        office: { ...state.office, licensed: true },
      },
      ok: true,
      message: "Диспетчер готовий. Обери контракт для повторення.",
    };
  }
  if (action.type === "dispatch") {
    if (
      !state.office.licensed ||
      (action.id !== null && !contractQuote(state, action.id))
    ) {
      return fail("Цей контракт ще не можна автоматизувати.");
    }
    return {
      state: { ...state, office: { ...state.office, contractId: action.id } },
      ok: true,
      message: action.id
        ? "Диспетчер повторюватиме обраний контракт, зокрема офлайн."
        : "Диспетчер на паузі. Поточний контракт збережено.",
    };
  }
  return fail("Невідома дія офісу.");
}
export function normalizeOffice(state: CareerState, value: unknown) {
  const data = record(value);
  const licensed = data["licensed"] === true && dispatcherUnlocked(state);
  const id = data["contractId"];
  state.office = {
    licensed,
    contractId:
      licensed && typeof id === "string" && contractQuote(state, id) ? id : null,
    completed: licensed
      ? Math.floor(amount(data["completed"], state.contractsCompleted))
      : 0,
    earned: licensed ? amount(data["earned"], state.lifetimeEarned) : 0,
    insights: licensed ? amount(data["insights"], state.lifetimeInsights) : 0,
  };
}
export function dispatchPayment(s: CareerState): CareerState {
  const c = s.contract;
  if (!c) {
    return s;
  }
  return {
    ...s,
    contract: null,
    money: bounded(s.money + c.reward),
    earned: bounded(s.earned + c.reward),
    lifetimeEarned: bounded(s.lifetimeEarned + c.reward),
    insights: bounded(s.insights + c.insights),
    lifetimeInsights: bounded(s.lifetimeInsights + c.insights),
    contractsCompleted: bounded(s.contractsCompleted + 1),
    office: {
      ...s.office,
      completed: bounded(s.office.completed + 1),
      earned: bounded(s.office.earned + c.reward),
      insights: bounded(s.office.insights + c.insights),
    },
  };
}
