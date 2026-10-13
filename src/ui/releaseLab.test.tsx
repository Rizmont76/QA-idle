import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReleaseLabState } from "../types";
import { CAREER_RULES } from "../game/career/content";
import { LAB } from "../game/releaseLab/data";
import { newReleaseLab } from "../game/releaseLab/engine";
import { exportReleaseLab } from "../game/releaseLab/persistence";
import { ReleaseLabApp } from "./ReleaseLabApp";

const NOW = 1000000;
const CAREER = '{"valuable":"player career must remain byte-for-byte identical"}';
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
  localStorage.setItem(CAREER_RULES.saveKey, CAREER);
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
function boot(patch?: Partial<ReleaseLabState>) {
  if (patch) {
    localStorage.setItem(LAB.key, exportReleaseLab({ ...newReleaseLab(NOW), ...patch }));
  }
  return render(<ReleaseLabApp />);
}
function saved(): ReleaseLabState {
  return JSON.parse(localStorage.getItem(LAB.key) ?? "{}") as ReleaseLabState;
}
function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

it("plays first tests and hiring with only the nearest discovery and no career writes", () => {
  const write = vi.spyOn(Storage.prototype, "setItem");
  boot();
  expect(
    screen.getByRole("heading", { name: "Спершу — одна кнопка." }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: Скрипт" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: CI-вузол" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByRole("button", { name: /Перевірити збірку/ }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Купити: Тестувальник" }));
  tick(1000);
  expect(saved()).toMatchObject({ testers: 1, reports: 1, buildWork: 10 });
  expect(
    screen.getByRole("region", { name: "Реліз і наступна збірка" }),
  ).toHaveTextContent("×1 → ×4");
  expect(write.mock.calls.every(([key]) => key === LAB.key)).toBe(true);
  expect(localStorage.getItem(CAREER_RULES.saveKey)).toBe(CAREER);
});
it("shows the actual loss and next rate before shipping and reveals one next horizon", () => {
  boot({
    buildWork: 10000,
    totalWork: 10000,
    reports: 100,
    testers: 8,
    bought: { testers: 8, scripts: 0, ci: 0 },
    efficiency: 2,
  });
  const release = screen.getByRole("region", { name: "Реліз і наступна збірка" });
  expect(release).toHaveTextContent("8 тестувальників");
  expect(release).toHaveTextContent("ефективність ×4");
  expect(release).toHaveTextContent("+4 звітів/с");
  fireEvent.click(
    within(release).getByRole("button", { name: "Випустити реліз · +1 ✦" }),
  );
  expect(saved()).toMatchObject({
    patterns: 1,
    builds: 1,
    testers: 1,
    efficiency: 0,
    reports: 9,
  });
  expect(screen.getByText("Тести почнуть писати тести")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: Скрипт" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText("Фабрика тестування")).not.toBeInTheDocument();
  expect(localStorage.getItem(CAREER_RULES.saveKey)).toBe(CAREER);
});
it("buys an explicitly priced batch with one click instead of repeated hiring", () => {
  boot({ reports: 100, buildWork: 100, totalWork: 100 });
  const batch = screen.getByRole("button", { name: "Максимум: Тестувальник" });
  expect(batch).toHaveTextContent("+6 за 96 звітів");
  fireEvent.click(batch);
  expect(saved()).toMatchObject({
    testers: 6,
    reports: 4,
    buildWork: 100,
    bought: { testers: 6, scripts: 0, ci: 0 },
  });
  expect(
    screen.queryByRole("button", { name: "Максимум: Тестувальник" }),
  ).not.toBeInTheDocument();
  expect(localStorage.getItem(CAREER_RULES.saveKey)).toBe(CAREER);
});
it("shows cases and report output growing automatically while later controls stay hidden", () => {
  boot({ patterns: 3, builds: 2, testers: 1, scripts: 1, reports: 9 });
  expect(screen.getByRole("button", { name: "Купити: Скрипт" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Купити: CI-вузол" }),
  ).not.toBeInTheDocument();
  tick(10000);
  expect(screen.getByTestId("lab-cases")).toHaveTextContent("1,2");
  expect(saved().reports).toBeCloseTo(193);
  expect(saved().bought).toEqual({ testers: 0, scripts: 0, ci: 0 });
  expect(screen.getByText("+20,8 / с")).toBeInTheDocument();
});
it("unlocks automation switched off and spends only after the player opts in", () => {
  boot({ patterns: 8, builds: 3, testers: 1, scripts: 1 });
  const toggle = screen.getByRole("switch", { name: "Автопокупки лабораторії" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  tick(10000);
  expect(saved().bought.testers).toBe(0);
  fireEvent.click(toggle);
  tick(5000);
  expect(saved().bought.testers).toBe(1);
  expect(saved().builds).toBe(3);
  expect(saved().efficiency).toBe(0);
});
it("round-trips through public import confirmation without replacing the career", () => {
  boot();
  fireEvent.click(screen.getByText("Збереження лабораторії"));
  const target = {
    ...newReleaseLab(NOW),
    patterns: 12,
    builds: 4,
    testers: 1,
    scripts: 1,
    ci: 1,
    reports: 9,
  };
  fireEvent.change(screen.getByRole("textbox", { name: "JSON лабораторії" }), {
    target: { value: exportReleaseLab(target) },
  });
  fireEvent.click(screen.getByRole("button", { name: "Імпортувати лабораторію" }));
  expect(localStorage.getItem(LAB.key)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Завантажити" }));
  expect(saved()).toEqual(target);
  expect(
    screen.getByRole("heading", { name: "Ти запустив фабрику." }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Експортувати лабораторію" }));
  expect(screen.getByRole("textbox", { name: "JSON лабораторії" })).toHaveValue(
    exportReleaseLab(target),
  );
  expect(localStorage.getItem(CAREER_RULES.saveKey)).toBe(CAREER);
});
it("keeps corrupt bytes intact, exports the original and resumes saving only after explicit valid import", () => {
  const corrupt = "unreadable valuable original";
  localStorage.setItem(LAB.key, corrupt);
  boot();
  fireEvent.click(screen.getByRole("button", { name: /Перевірити збірку/ }));
  tick(1000);
  expect(localStorage.getItem(LAB.key)).toBe(corrupt);
  fireEvent.click(screen.getByText("Збереження лабораторії"));
  fireEvent.click(screen.getByRole("button", { name: "Експортувати лабораторію" }));
  expect(screen.getByRole("textbox", { name: "JSON лабораторії" })).toHaveValue(corrupt);
  fireEvent.change(screen.getByRole("textbox", { name: "JSON лабораторії" }), {
    target: { value: exportReleaseLab(newReleaseLab(NOW + 1000)) },
  });
  fireEvent.click(screen.getByRole("button", { name: "Імпортувати лабораторію" }));
  fireEvent.click(screen.getByRole("button", { name: "Завантажити" }));
  fireEvent.click(screen.getByRole("button", { name: /Перевірити збірку/ }));
  expect(saved().reports).toBe(3);
  expect(localStorage.getItem(CAREER_RULES.saveKey)).toBe(CAREER);
});
it("ignores career storage events but pauses writes and controls if this lab is updated elsewhere", () => {
  boot({
    testers: 1,
    bought: { testers: 1, scripts: 0, ci: 0 },
    reports: 0,
    buildWork: 9,
  });
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", { key: CAREER_RULES.saveKey, newValue: CAREER }),
    );
  });
  tick(1000);
  expect(saved().reports).toBe(1);
  const before = localStorage.getItem(LAB.key);
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: LAB.key, newValue: "{}" }));
  });
  tick(1000);
  expect(localStorage.getItem(LAB.key)).toBe(before);
  expect(screen.getByRole("button", { name: /Перевірити збірку/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Продовжити тут" })).toBeInTheDocument();
});
