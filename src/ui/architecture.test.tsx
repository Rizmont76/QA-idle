import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(CAREER_RULES.saveKey) ?? "{}") as CareerState;
}
function boot(s = newCareer(NOW)) {
  localStorage.setItem(CAREER_RULES.saveKey, JSON.stringify(s));
  render(<CareerApp />);
  fireEvent.click(screen.getByRole("button", { name: "CI/CD" }));
}
it("previews the coming spatial layer without enabling locked controls", () => {
  boot();
  fireEvent.click(screen.getByRole("button", { name: /Архітектура/ }));
  expect(
    screen.getByRole("heading", { name: "Важливо, що стоїть поруч." }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Встановити:/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "До конвеєра та випробувань →" }));
  expect(screen.getByRole("heading", { name: "Майстерня CI/CD" })).toBeInTheDocument();
});
it("places modules, claims a blueprint, saves it and opens the next instrument", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 100;
  s.pipeline.completed = ["budget", "verification", "deployment"];
  boot(s);
  expect(screen.getByRole("heading", { name: "Архітектура студії" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Встановити: Шина" })).toBeDisabled();
  for (const [slot, title] of [
    [1, "Збирач"],
    [2, "Сканер"],
    [3, "Шлюз"],
  ] as const) {
    fireEvent.click(
      screen.getByRole("button", { name: `Комірка ${String(slot)}: порожня` }),
    );
    fireEvent.click(screen.getByRole("button", { name: `Встановити: ${title}` }));
  }
  expect(saved().pipeline.architecture.layout).toEqual([
    "build",
    "verify",
    "deploy",
    null,
    null,
    null,
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Відкрити: Повний цикл" }));
  expect(saved().pipeline.architecture.blueprints).toEqual(["cycle"]);
  expect(screen.getByRole("button", { name: "Встановити: Шина" })).toBeEnabled();
  expect(screen.getByRole("region", { name: "Наступне креслення" })).toHaveTextContent(
    "Спільна шина",
  );
  expect(screen.getByRole("switch", { name: "Авторозподіл ядер" })).toBeDisabled();
  expect(screen.getByRole("switch", { name: "Автопокупка ядер" })).toBeDisabled();
});
it("delegates core allocation and preserves live production on the pipeline board", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 1000;
  s.pipeline.completed = ["budget", "verification", "deployment"];
  s.pipeline.architecture.blueprints = ["cycle", "bus", "flow"];
  boot(s);
  const toggle = screen.getByRole("switch", { name: "Авторозподіл ядер" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  fireEvent.click(toggle);
  expect(saved().pipeline.architecture.autoBalance).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Конвеєр" }));
  expect(
    screen.getByRole("button", { name: "Конвеєр: Збірка — забрати ядро" }),
  ).toBeDisabled();
  expect(screen.getByRole("region", { name: "Основний конвеєр" })).toHaveTextContent(
    "Авторозподіл увімкнено",
  );
  expect(screen.getByRole("region", { name: "Основний конвеєр" })).not.toHaveTextContent(
    "Сталий потік: 0",
  );
});
