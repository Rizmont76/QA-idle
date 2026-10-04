import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CareerState } from "../types";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES as R } from "../game/career/content";
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
function boot(s = newCareer(NOW)) {
  localStorage.setItem(R.saveKey, JSON.stringify(s));
  render(<CareerApp />);
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
}
it("shows the coming discovery from a new game without activating locked generators", () => {
  boot();
  expect(screen.getByRole("region", { name: "Наступне відкриття" })).toHaveTextContent(
    "Перший престиж",
  );
  fireEvent.click(screen.getByRole("button", { name: /До першого прориву/ }));
  expect(screen.getByRole("heading", { name: "Майстерня CI/CD" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /забрати ядро/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Досягнути Director →" }));
  expect(
    screen.getByRole("heading", { name: "Твій кар’єрний шлях" }),
  ).toBeInTheDocument();
});
it("enforces the shared pool and opt-in, persists allocation and runs purchases", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.money = 1000;
  s.pipeline.total = 100;
  s.pipeline.credits = 100;
  boot(s);
  fireEvent.click(screen.getByRole("button", { name: "CI/CD" }));
  const plus = screen.getByRole("button", { name: "Конвеєр: Деплой — додати ядро" });
  expect(plus).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Конвеєр: Збірка — забрати ядро" }));
  fireEvent.click(plus);
  expect(saved().pipeline.allocation).toEqual([2, 2, 2]);
  expect(screen.getByRole("switch", { name: "Автонайм" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  expect(screen.getByRole("switch", { name: "Автопроєкти" })).toBeDisabled();
  fireEvent.click(screen.getByRole("switch", { name: "Автонайм" }));
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(saved().crew.assistant).toBe(1);
  expect(saved().money).toBe(975);
});
it("finishes a trial and claims a permanent reward explicitly, leaving policies off", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 100;
  boot(s);
  fireEvent.click(screen.getByRole("button", { name: "CI/CD" }));
  fireEvent.click(screen.getByRole("button", { name: "Почати: Важка регресія" }));
  const minus = screen.getByRole("button", {
    name: "Випробування: Збірка — забрати ядро",
  });
  const plus = screen.getByRole("button", {
    name: "Випробування: Перевірка — додати ядро",
  });
  fireEvent.click(minus);
  fireEvent.click(minus);
  fireEvent.click(plus);
  fireEvent.click(plus);
  act(() => {
    vi.advanceTimersByTime(60000);
  });
  expect(saved().pipeline.completed).toEqual([]);
  expect(screen.getByRole("button", { name: "Забрати прорив →" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Забрати прорив →" }));
  expect(saved().pipeline.completed).toEqual(["verification"]);
  expect(screen.getByRole("switch", { name: "Автопроєкти" })).toBeEnabled();
  expect(screen.getByRole("switch", { name: "Автопроєкти" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
});
