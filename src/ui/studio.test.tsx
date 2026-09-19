import "@testing-library/jest-dom/vitest";
import {
  act as reactAct,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CareerState } from "../types";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES as R } from "../game/career/content";
import { PROJECTS } from "../game/career/expansionData";
import { exportCareer } from "../game/career/persistence";
import { projectQuote } from "../game/career/studioSelectors";
import { CareerApp } from "./CareerApp";

const NOW = 20_000_000;
function boot(patch: Partial<CareerState> = {}) {
  const state = { ...newCareer(NOW), ...patch };
  localStorage.setItem(R.saveKey, exportCareer(state));
  return render(<CareerApp />);
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("studio UI", () => {
  it("takes a project through three phases, buys permanent research and assigns its recruit", () => {
    boot({
      stage: 1,
      bestStage: 1,
      crew: { ...newCareer(NOW).crew, assistant: 100 },
      upgrades: ["auto"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Проєкти" }));
    fireEvent.click(screen.getByRole("button", { name: "Почати Кнопка, яка продає" }));
    expect(screen.getByRole("button", { name: "Здати етап" })).toBeDisabled();
    for (const seconds of [20, 30, 45]) {
      reactAct(() => {
        vi.advanceTimersByTime(seconds * 1_000);
      });
      fireEvent.click(
        screen.getByRole("button", {
          name: seconds === 45 ? "Завершити проєкт" : "Здати етап",
        }),
      );
    }
    expect(
      screen.queryByRole("region", { name: "Активний проєкт" }),
    ).not.toBeInTheDocument();
    expect(saved().certificates["button"]).toBe(1);
    const completion = screen.getByRole("region", { name: "Проєкт завершено" });
    expect(completion).toHaveTextContent("Сертифікат у портфоліо");
    expect(completion).toHaveTextContent("+3 ◈ інсайтів");
    fireEvent.click(within(completion).getByRole("button", { name: "До студії →" }));
    expect(screen.getByTestId("insights")).toHaveTextContent("3");
    fireEvent.click(
      screen.getByRole("button", { name: "Дослідити Стійка автоматизація" }),
    );
    expect(screen.getByTestId("insights")).toHaveTextContent("0");
    expect(
      screen.getByRole("progressbar", { name: "Рівень Стійка автоматизація" }),
    ).toHaveAttribute("aria-valuenow", "1");
    fireEvent.click(screen.getByRole("button", { name: /Фахівці 0\/2/ }));
    fireEvent.click(screen.getByRole("button", { name: "Призначити Марта" }));
    expect(screen.getByRole("button", { name: "У резерв Марта" })).toBeEnabled();
    expect(saved().specialists).toEqual(["marta"]);
  });
  it("requires confirmation to cancel an active project, retaining completed certificates", () => {
    const state = {
      ...newCareer(NOW),
      stage: 2,
      bestStage: 2,
      certificates: { button: 1 },
    };
    const def = PROJECTS.find((p) => p.id === "cart");
    if (!def) {
      throw new Error("Missing cart project");
    }
    boot({ ...state, project: projectQuote(state, def) });
    fireEvent.click(screen.getByRole("button", { name: "Проєкти" }));
    fireEvent.click(screen.getByRole("button", { name: "Скасувати проєкт" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Раніше отримані сертифікати");
    fireEvent.click(within(dialog).getByRole("button", { name: "Скасувати" }));
    expect(screen.getByRole("region", { name: "Активний проєкт" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Скасувати проєкт" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Скасувати проєкт",
      }),
    );
    expect(saved().project).toBeNull();
    expect(saved().certificates).toEqual({ button: 1 });
  });
  it("shows certificate gates after Director and still offers the original prestige", () => {
    boot({
      stage: 5,
      bestStage: 5,
      earned: 50_000_000,
      crew: { ...newCareer(NOW).crew, assistant: 70 },
    });
    expect(
      screen.getByRole("progressbar", { name: "Проєкти для підвищення" }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(
      screen.getByRole("button", { name: "Виконай умови підвищення" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Престиж уже доступний →" }));
    expect(screen.getByRole("button", { name: "Почати нову кар’єру ↻" })).toBeEnabled();
  });
  it("disables missing prerequisites and full specialist slots", () => {
    boot({
      stage: 5,
      bestStage: 5,
      insights: 100,
      certificates: { button: 1, cart: 1, mobile: 1 },
      specialists: ["marta", "taras"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Студія" }));
    expect(
      screen.getByRole("button", { name: "Дослідити Розумні закупівлі" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Фахівці 2\/2/ }));
    expect(screen.getByRole("button", { name: "Призначити Софія" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "У резерв Марта" }));
    fireEvent.click(screen.getByRole("button", { name: "Призначити Софія" }));
    expect(saved().specialists).toEqual(["taras", "sofia"]);
  });
  it("retains research, insights, recruits and certificates after confirmed prestige", () => {
    boot({
      stage: 5,
      bestStage: 5,
      earned: 2_500_000,
      insights: 7,
      research: { automation: 2 },
      certificates: { button: 1 },
      specialists: ["marta"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Кар’єра" }));
    fireEvent.click(screen.getByRole("button", { name: "Почати нову кар’єру ↻" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "дослідження, фахівці, сертифікати",
    );
    fireEvent.click(screen.getByRole("button", { name: "Отримати +5 досвіду" }));
    expect(saved()).toMatchObject({
      stage: 0,
      insights: 7,
      research: { automation: 2 },
      certificates: { button: 1 },
      specialists: ["marta"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Студія" }));
    expect(screen.getByTestId("insights")).toHaveTextContent("7");
  });
  it("migrates a live career save without touching the previous version", () => {
    const previous = JSON.stringify({
      ...newCareer(NOW),
      schemaVersion: 3,
      stage: 3,
      bestStage: 3,
      money: 75_000,
      earned: 100_000,
      upgrades: ["auto"],
      crew: { assistant: 15, squad: 7, runner: 2, lab: 0 },
    });
    localStorage.setItem(R.previousKey, previous);
    render(<CareerApp />);
    expect(screen.getByTestId("money")).toHaveTextContent("$75K");
    expect(screen.getByText(/Попередній прогрес перенесено/)).toBeInTheDocument();
    expect(saved().schemaVersion).toBe(4);
    expect(saved().stage).toBe(3);
    expect(localStorage.getItem(R.previousKey)).toBe(previous);
    fireEvent.click(screen.getByRole("button", { name: "Проєкти" }));
    expect(
      screen.getByRole("button", { name: "Почати Кнопка, яка продає" }),
    ).toBeEnabled();
  });
});
