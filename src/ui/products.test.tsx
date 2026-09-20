import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CareerState } from "../types";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES as R } from "../game/career/content";
import { exportCareer } from "../game/career/persistence";
import { CareerApp } from "./CareerApp";
const NOW = 20_000_000;
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
function boot(patch: Partial<CareerState> = {}) {
  localStorage.setItem(R.saveKey, exportCareer({ ...newCareer(NOW), ...patch }));
  render(<CareerApp />);
  fireEvent.click(screen.getByRole("button", { name: "Продукти" }));
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
}
it("shows six concepts, clear prerequisites and a route back to projects", () => {
  boot();
  expect(
    screen
      .getAllByRole("article")
      .filter((card) => card.classList.contains("product-card")),
  ).toHaveLength(6);
  expect(
    screen.getByRole("button", { name: "Розробити Checklist Studio v1.0" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Сертифікати відкривають/ }));
  expect(
    screen.getByRole("heading", { name: "Чужі релізи. Твоя історія." }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Створити власний продукт/ }));
  expect(screen.getByRole("heading", { name: "Каталог продуктів" })).toBeInTheDocument();
});
it("invests, progresses, requires publication, then earns and confirms cancellation", () => {
  boot({
    stage: 3,
    bestStage: 3,
    money: 100_000,
    insights: 20,
    certificates: { button: 2 },
    crew: { ...newCareer(NOW).crew, assistant: 100 },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Розробити Checklist Studio v1.0" }),
  );
  expect(saved().money).toBe(96_000);
  expect(saved().insights).toBe(17);
  expect(screen.getByRole("button", { name: /Випустити продукт/ })).toBeDisabled();
  act(() => {
    vi.advanceTimersByTime(95_000);
  });
  expect(saved().products.releases).toEqual({});
  fireEvent.click(screen.getByRole("button", { name: /Випустити продукт/ }));
  expect(screen.getByRole("region", { name: "Продукт випущено" })).toHaveTextContent(
    "Checklist Studio v1.0",
  );
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(saved().products.earned).toBeCloseTo(120);
  fireEvent.click(
    screen.getByRole("button", { name: "Розробити Checklist Studio v2.0" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Скасувати розробку" }));
  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("Витрачені гроші та інсайти не повернуться");
  fireEvent.click(within(dialog).getByRole("button", { name: "Скасувати" }));
  expect(saved().products.development).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Скасувати розробку" }));
  fireEvent.click(screen.getByRole("button", { name: "Так, скасувати розробку" }));
  expect(saved().products).toMatchObject({
    development: null,
    releases: { checklist: 1 },
  });
});
it("reports offline product income and explains dormant retained releases", () => {
  const base = {
    stage: 2,
    bestStage: 4,
    certificates: { button: 3 },
    products: { releases: { checklist: 3 }, development: null, earned: 0 },
    lastTick: NOW - 60_000,
  };
  boot(base);
  expect(screen.getByRole("region", { name: "Повернення до гри" })).toHaveTextContent(
    "Із них від продуктів: +$13.5K",
  );
  expect(screen.getByRole("region", { name: "Портфоліо продуктів" })).toHaveTextContent(
    "$300",
  );
  cleanup();
  boot({ ...base, stage: 0 });
  expect(screen.getByRole("article", { name: "Checklist Studio" })).toHaveTextContent(
    "Очікує рангу",
  );
  expect(saved().products.releases).toEqual({ checklist: 3 });
  expect(saved().products.earned).toBe(0);
});
