import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CareerState } from "../types";
import { newCareer } from "../game/career/engine";
import { CAREER_RULES } from "../game/career/content";
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
function fixture() {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 10000;
  s.pipeline.completed = ["budget", "verification", "deployment"];
  s.pipeline.architecture.blueprints = ["cycle", "bus", "flow", "studio"];
  return s;
}
function boot(s: CareerState) {
  localStorage.setItem(CAREER_RULES.saveKey, JSON.stringify(s));
  render(<CareerApp />);
  fireEvent.click(screen.getByRole("button", { name: "CI/CD" }));
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(CAREER_RULES.saveKey) ?? "{}") as CareerState;
}
it("previews the generator chain before the final blueprint without enabling it", () => {
  boot(newCareer(NOW));
  fireEvent.click(screen.getByRole("button", { name: /Мережа/ }));
  expect(
    screen.getByRole("heading", { name: "Зростання, яке створює себе." }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: Агенти" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "До архітектури →" }));
  expect(screen.getByRole("heading", { name: "Архітектура студії" })).toBeInTheDocument();
});
it("opens the next layer, makes agents productive and keeps automatic purchases opt-in", () => {
  const s = fixture();
  boot(s);
  expect(
    screen.getByRole("heading", { name: "Обчислювальна мережа" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Купити: Агенти" })).toBeDisabled();
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  fireEvent.click(screen.getByRole("button", { name: "Купити: Агенти" }));
  expect(saved().pipeline.network.units[0]).toBe(2);
  expect(saved().pipeline.network.purchased[0]).toBe(1);
  expect(screen.getByRole("switch", { name: "Автопокупка генераторів" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Купити: Планувальники" })).toBeDisabled();
});
it("confirms a local reboot, retains career progress and spends earned protocols", () => {
  const s = fixture();
  s.money = 123;
  s.pipeline.network.computations = 8000;
  s.pipeline.network.runTotal = 8000;
  s.pipeline.network.best = 8000;
  boot(s);
  fireEvent.click(screen.getByRole("button", { name: "Перезапустити мережу →" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("одним агентом");
  fireEvent.click(screen.getByRole("button", { name: "Скасувати" }));
  expect(saved().pipeline.network.reboots).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Перезапустити мережу →" }));
  fireEvent.click(screen.getByRole("button", { name: "Перезапустити" }));
  expect(saved().pipeline.network.reboots).toBe(1);
  expect(saved().money).toBe(123);
  expect(saved().pipeline.network.protocols).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Протокол: Єдина платформа" }));
  fireEvent.click(screen.getByRole("button", { name: "Протокол: Саморозвиток" }));
  const toggle = screen.getByRole("switch", { name: "Автопокупка генераторів" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  fireEvent.click(toggle);
  expect(saved().pipeline.network.autoBuy).toBe(true);
  expect(saved().pipeline.network.upgrades.bridge).toBe(1);
  expect(saved().pipeline.network.protocols).toBe(0);
});
