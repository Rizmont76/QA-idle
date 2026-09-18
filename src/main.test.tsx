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
import { CareerApp } from "./ui/CareerApp";
import { newCareer } from "./game/career/engine";
import { CAREER_RULES as R } from "./game/career/content";
import { exportCareer } from "./game/career/persistence";
import type { CareerState } from "./types";

const NOW = 10_000_000;
function boot(patch?: Partial<CareerState>) {
  if (patch) {
    localStorage.setItem(R.saveKey, exportCareer({ ...newCareer(NOW), ...patch }));
  }
  return render(<CareerApp />);
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

describe("playable career UI", () => {
  it("starts in the game and lets the player find bugs, report, and hire", () => {
    boot();
    expect(screen.getByRole("heading", { name: "Робоче місце." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Контракти" })).not.toBeInTheDocument();
    for (let i = 0; i < 25; i++) {
      fireEvent.click(screen.getByRole("button", { name: /Знайти баг/ }));
    }
    expect(screen.getByTestId("money")).toHaveTextContent("$0");
    fireEvent.click(screen.getByRole("button", { name: /Здати звіт/ }));
    fireEvent.click(screen.getByRole("button", { name: /Найняти QA-помічник/ }));
    expect(screen.getByText(/Нас уже двоє/)).toBeInTheDocument();
    reactAct(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(
      Number(screen.getByTestId("bugs").textContent.replace(",", ".")),
    ).toBeGreaterThan(0);
  });
  it("promotes to Middle, buys automation and earns while idle", () => {
    boot({
      money: 100,
      earned: 150,
      crew: { assistant: 3, squad: 0, runner: 0, lab: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: /Отримати підвищення/ }));
    expect(screen.getByRole("heading", { name: "Senior QA" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Купити Автоматичні звіти" }));
    expect(screen.getByText("Автозвіти працюють")).toBeInTheDocument();
    const oldMoney = screen.getByTestId("money").textContent;
    reactAct(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByTestId("money").textContent).not.toBe(oldMoney);
    expect(screen.getByTestId("bugs")).toHaveTextContent("0");
  });
  it("offers affordable bulk hiring and does not grant a locked producer", () => {
    boot({ money: 110 });
    fireEvent.click(screen.getByRole("button", { name: "Макс" }));
    fireEvent.click(screen.getByRole("button", { name: /Найняти QA-помічник/ }));
    const saved = JSON.parse(localStorage.getItem(R.saveKey) ?? "{}") as CareerState;
    expect(saved.crew.assistant).toBe(3);
    expect(saved.money).toBeGreaterThanOrEqual(0);
    expect(
      screen.queryByRole("button", { name: /Найняти QA-команда/ }),
    ).not.toBeInTheDocument();
  });
  it("requires confirmation before prestige, preserves badges, and returns to a playable start", () => {
    boot({
      stage: 5,
      bestStage: 5,
      earned: 2_500_000,
      lifetimeEarned: 2_500_000,
      money: 500,
      badges: ["director"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Кар’єра" }));
    fireEvent.click(screen.getByRole("button", { name: /Почати нову кар’єру/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("команда");
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Скасувати" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Почати нову кар’єру/ }));
    fireEvent.click(screen.getByRole("button", { name: /Отримати \+5 досвіду/ }));
    expect(screen.getByRole("heading", { name: "Middle QA" })).toBeInTheDocument();
    expect(screen.getByText("Автозвіти працюють")).toBeInTheDocument();
    expect(screen.getByTestId("money")).toHaveTextContent("$50");
  });
  it("validates imports before replacing progress", () => {
    boot({ money: 80 });
    fireEvent.click(screen.getByRole("button", { name: "Налаштування" }));
    fireEvent.change(screen.getByLabelText("Встав JSON збереження для імпорту"), {
      target: { value: "bad-json" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Імпортувати збереження/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("JSON");
    expect(screen.getByTestId("money")).toHaveTextContent("$80");
    fireEvent.change(screen.getByLabelText("Встав JSON збереження для імпорту"), {
      target: { value: exportCareer({ ...newCareer(NOW), money: 222 }) },
    });
    fireEvent.click(screen.getByRole("button", { name: /Імпортувати збереження/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("$222");
    fireEvent.click(screen.getByRole("button", { name: "Завантажити" }));
    expect(screen.getByTestId("money")).toHaveTextContent("$222");
  });
  it("makes hard reset reversible until the explicit confirmation", () => {
    boot({ experience: 5, money: 80 });
    fireEvent.click(screen.getByRole("button", { name: "Налаштування" }));
    fireEvent.click(screen.getByRole("button", { name: "Скинути прогрес" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Скасувати" }),
    );
    expect(screen.getByTestId("money")).toHaveTextContent("$80");
    fireEvent.click(screen.getByRole("button", { name: "Скинути прогрес" }));
    fireEvent.click(screen.getByRole("button", { name: "Так, почати з нуля" }));
    expect(screen.getByTestId("money")).toHaveTextContent("$0");
  });
  it("checks offline rewards, summaries, and a second reload without duplicated income", () => {
    const mounted = boot({
      lastTick: NOW - 3_600_000,
      stage: 1,
      crew: { assistant: 3, squad: 0, runner: 0, lab: 0 },
      upgrades: ["auto"],
    });
    expect(screen.getByRole("region", { name: "Повернення до гри" })).toBeInTheDocument();
    const amount = screen.getByTestId("money").textContent;
    mounted.unmount();
    render(<CareerApp />);
    expect(
      screen.queryByRole("region", { name: "Повернення до гри" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("money").textContent).toBe(amount);
  });
  it("pauses this tab when another tab takes ownership", () => {
    boot();
    reactAct(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: R.saveKey,
          newValue: exportCareer(newCareer(NOW)),
        }),
      );
    });
    expect(screen.getByRole("button", { name: /Знайти баг/ })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("іншій вкладці");
  });
  it("leaves an unsupported save untouched during in-memory play", () => {
    localStorage.setItem(R.saveKey, '{"schemaVersion":99}');
    boot();
    fireEvent.click(screen.getByRole("button", { name: /Знайти баг/ }));
    reactAct(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(localStorage.getItem(R.saveKey)).toBe('{"schemaVersion":99}');
    expect(screen.getByText(/Оригінал залишено/)).toBeInTheDocument();
  });
});
