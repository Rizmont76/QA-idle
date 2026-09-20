import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES as R } from "../game/career/content";
import { exportCareer } from "../game/career/persistence";
import type { CareerState } from "../types";
import { CareerApp } from "./CareerApp";
const NOW = 20_000_000;
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
  localStorage.setItem(R.saveKey, exportCareer({ ...newCareer(NOW), ...patch }));
  render(<CareerApp />);
  fireEvent.click(screen.getByRole("button", { name: "Офіс" }));
}
it("shows a starter office and prevents buying dispatch before its milestones", () => {
  boot();
  expect(
    screen.getByRole("heading", { name: "Перший робочий стіл" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /Офіс: 0 одиниць/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Відкрити диспетчера/ })).toBeDisabled();
});
it("buys dispatch, repeats a contract automatically and retains the job on pause", () => {
  boot({
    stage: 3,
    bestStage: 3,
    contractsCompleted: 3,
    insights: 20,
    crew: { ...newCareer(NOW).crew, assistant: 100 },
    upgrades: ["auto"],
  });
  fireEvent.click(screen.getByRole("button", { name: /Відкрити диспетчера/ }));
  fireEvent.click(screen.getByRole("button", { name: "Повторювати Smoke-перевірка" }));
  act(() => {
    vi.advanceTimersByTime(65_000);
  });
  const console = screen.getByRole("region", { name: "Керування диспетчером" });
  expect(console).toHaveTextContent("Автоповтор увімкнено");
  expect(console).toHaveTextContent("$12K");
  fireEvent.click(
    within(console).getByRole("button", { name: "Призупинити диспетчера" }),
  );
  expect(console).toHaveTextContent("На паузі");
  const saved = JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
  expect(saved.office).toMatchObject({ licensed: true, completed: 1, contractId: null });
  expect(saved.contract).toMatchObject({ id: "smoke" });
});
it("shows automatic offline earnings and retains the headquarters after prestige", () => {
  boot({
    bestStage: 8,
    stage: 3,
    contractsCompleted: 3,
    crew: { ...newCareer(NOW).crew, assistant: 100 },
    upgrades: ["auto", "handover"],
    lastTick: NOW - 150_000,
    office: { licensed: true, contractId: "smoke", completed: 0, earned: 0, insights: 0 },
  });
  expect(screen.getByRole("heading", { name: "Штаб-квартира" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Повернення до гри" })).toHaveTextContent(
    "Автоматично завершено контрактів: 2",
  );
});
