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
it("hides the generator layer before the final blueprint", () => {
  const s = fixture();
  s.pipeline.architecture.blueprints = ["cycle", "bus", "flow"];
  boot(s);
  expect(screen.queryByRole("button", { name: "Мережа" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: Агенти" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Архітектура студії" })).toBeInTheDocument();
});
it("opens the next layer, makes agents productive and keeps automatic purchases opt-in", () => {
  const s = fixture();
  boot(s);
  expect(
    screen.getByRole("heading", { name: "Обчислювальна мережа" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Купити: Агенти" })).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: "Підключити агентів до студії →" }),
  ).not.toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  fireEvent.click(screen.getByRole("button", { name: "Купити: Агенти" }));
  expect(saved().pipeline.network.units[0]).toBe(2);
  expect(saved().pipeline.network.purchased[0]).toBe(1);
  expect(
    screen.queryByRole("switch", { name: "Автопокупка генераторів" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: Планувальники" }),
  ).not.toBeInTheDocument();
});

function bridged() {
  const s = fixture();
  s.bestStage = 5;
  s.pipeline.network.best = 50_000;
  s.pipeline.network.reboots = 1;
  s.pipeline.network.totalProtocols = 1;
  s.pipeline.network.upgrades.bridge = 1;
  s.pipeline.network.units = [100, 3, 1, 0];
  return s;
}
it("requires an explicit connection and reveals working fleet resources afterwards", () => {
  boot(bridged());
  expect(saved().pipeline.network.linked).toBe(false);
  const connection = screen.getByRole("button", {
    name: "Підключити агентів до студії →",
  });
  expect(connection).toBeEnabled();
  fireEvent.click(connection);
  expect(saved().pipeline.network.linked).toBe(true);
  expect(screen.getByText("Підключено назавжди ✓")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Підключити агентів до студії →" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ресурси" }));
  expect(screen.getByRole("table", { name: "Відкриті ресурси" })).toHaveTextContent(
    "Агенти мережі",
  );
});
it("shows the fleet income tradeoff before a confirmed network reboot", () => {
  const s = bridged();
  s.pipeline.network.linked = true;
  s.pipeline.network.runTotal = 8_000;
  boot(s);
  fireEvent.click(screen.getByRole("button", { name: "Перезапустити мережу →" }));
  const dialog = screen.getByRole("dialog", {
    name: "Перезапустити обчислювальну мережу?",
  });
  expect(dialog).toHaveTextContent("Поточний флот почне з одного агента.");
  expect(dialog).toHaveTextContent("Дохід:");
  expect(dialog).toHaveTextContent("Накопичені автотести продовжать працювати.");
  fireEvent.click(screen.getByRole("button", { name: "Перезапустити" }));
  expect(saved().pipeline.network.linked).toBe(true);
  expect(saved().pipeline.network.units).toEqual([1, 0, 0, 0]);
  expect(saved().pipeline.total).toBe(10_000);
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
