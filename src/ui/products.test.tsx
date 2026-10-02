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
function boot(patch: Record<string, unknown> = {}) {
  localStorage.setItem(R.saveKey, JSON.stringify({ ...newCareer(NOW), ...patch }));
  render(<CareerApp />);
  fireEvent.click(screen.getByRole("button", { name: "Продукти" }));
}
function saved(): CareerState {
  return JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
}
it("shows six tools, prerequisites and a route to projects", () => {
  boot();
  expect(
    screen
      .getAllByRole("article")
      .filter((card) => card.classList.contains("product-card")),
  ).toHaveLength(6);
  expect(
    screen.getByRole("button", { name: "Запустити Checklist Studio" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Наступний клієнт/ }));
  expect(
    screen.getByRole("heading", { name: "Чужі релізи. Твоя історія." }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Керувати продуктами/ }));
  expect(screen.getByRole("heading", { name: "Портфель студії" })).toBeInTheDocument();
});
it("launches instantly and switches between cash, project work and knowledge", () => {
  boot({
    stage: 3,
    bestStage: 3,
    money: 100_000,
    insights: 20,
    certificates: { button: 1 },
  });
  fireEvent.click(screen.getByRole("button", { name: "Запустити Checklist Studio" }));
  expect(saved().money).toBe(96_000);
  expect(saved().insights).toBe(17);
  expect(saved().products.releases).toEqual({ checklist: 1 });
  expect(
    screen.getByRole("button", { name: "Checklist Studio: Ліцензії" }),
  ).toHaveAttribute("aria-pressed", "true");
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(saved().products.earned).toBeCloseTo(120);
  fireEvent.click(screen.getByRole("button", { name: "Checklist Studio: Для команди" }));
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(saved().products.earned).toBeCloseTo(120);
  expect(saved().products.modes["checklist"]).toBe("internal");
  fireEvent.click(
    screen.getByRole("button", { name: "Checklist Studio: Відкритий код" }),
  );
  expect(saved().products.modes["checklist"]).toBe("open");
  expect(
    screen.queryByRole("button", { name: /Випустити продукт/ }),
  ).not.toBeInTheDocument();
});
it("explains legacy refunds once and dormant retained tools", () => {
  boot({
    stage: 0,
    bestStage: 4,
    certificates: { button: 3 },
    products: { releases: { checklist: 3 }, development: null, earned: 0 },
  });
  expect(screen.getByRole("region", { name: "Повернення інвестицій" })).toHaveTextContent(
    "$624K",
  );
  expect(screen.getByRole("article", { name: "Checklist Studio" })).toHaveTextContent(
    "Очікує рангу",
  );
  expect(saved().products.releases).toEqual({ checklist: 1 });
  expect(saved().products.earned).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Зрозуміло" }));
  expect(saved().products.refund).toBeNull();
});
