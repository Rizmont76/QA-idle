import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES } from "../game/career/content";
import type { CareerState } from "../types";
import { CareerApp } from "./CareerApp";

const NOW = 20000000;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
function boot(patch: Partial<CareerState> = {}) {
  localStorage.setItem(
    CAREER_RULES.saveKey,
    JSON.stringify({ ...newCareer(NOW), ...patch }),
  );
  render(<CareerApp />);
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(CAREER_RULES.saveKey) ?? "{}") as CareerState;
}
it("keeps gifted automatic reporting monotonic through manual tests and ticks", () => {
  boot({ stage: 1, bestStage: 1, money: 80, bugs: 9, found: 9, lifetimeBugs: 9 });
  expect(
    screen.queryByRole("button", { name: "Купити Автоматичні звіти" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("ОБРОБЛЕНО ЗА КАР’ЄРУ")).toBeInTheDocument();
  expect(saved().bugs).toBe(0);
  const before = saved().found;
  fireEvent.click(screen.getByRole("button", { name: /Знайти баг/ }));
  expect(saved().bugs).toBe(0);
  expect(saved().found).toBeGreaterThan(before);
  const shown = screen.getByTestId("bugs").textContent;
  act(() => {
    vi.advanceTimersByTime(250);
  });
  expect(screen.getByTestId("bugs").textContent).toBe(shown);
});
it("shows the promotion boost immediately, resets income and exposes the new chapter", () => {
  boot({
    money: 200,
    earned: 150,
    rankEarned: 150,
    lifetimeEarned: 150,
    upgrades: ["checklist"],
    crew: { ...newCareer(NOW).crew, assistant: 3 },
  });
  fireEvent.click(screen.getByRole("button", { name: "Отримати підвищення ↗" }));
  expect(screen.getByRole("status", { name: "Підвищення отримано" })).toHaveTextContent(
    "Middle QA",
  );
  expect(saved().rankEarned).toBe(0);
  expect(screen.getByRole("button", { name: "Виконай умови підвищення" })).toBeDisabled();
  expect(screen.getByRole("region", { name: "Цілі поточного рангу" })).toHaveTextContent(
    "Перший клієнт довіряє тобі реліз",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Закрити повідомлення про підвищення" }),
  );
  expect(
    screen.queryByRole("status", { name: "Підвищення отримано" }),
  ).not.toBeInTheDocument();
});
it("opens a resource ledger without future balances and navigates to the source of insights", () => {
  boot({
    stage: 1,
    bestStage: 1,
    insights: 3,
    lifetimeInsights: 3,
    certificates: { button: 1 },
  });
  fireEvent.click(screen.getByRole("button", { name: "Усі ресурси →" }));
  const table = screen.getByRole("table", { name: "Відкриті ресурси" });
  expect(within(table).getAllByRole("row")).toHaveLength(5);
  expect(within(table).queryByText("Кредити збірки")).not.toBeInTheDocument();
  const insights = within(table).getByRole("row", { name: /Інсайти/ });
  fireEvent.click(within(insights).getByRole("button", { name: "Відкрити →" }));
  expect(screen.getByRole("heading", { name: "Проєкти.", level: 1 })).toBeInTheDocument();
});
