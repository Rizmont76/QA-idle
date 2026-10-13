import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { newCareer } from "../game/career/engine";
import { exportCareer } from "../game/career/persistence";
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
function boot(s = newCareer(NOW)) {
  localStorage.setItem(CAREER_RULES.saveKey, exportCareer(s));
  return render(<CareerApp />);
}
const navigation = () =>
  within(screen.getByRole("navigation", { name: "Головна навігація" }));
it.each([
  { stage: 1, next: "CI/CD" },
  { stage: 2, next: "Продукти" },
  { stage: 3, next: "Студія" },
])("announces just $next on promotion from rank $stage", ({ stage, next }) => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = stage;
  s.money = s.earned = s.rankEarned = s.lifetimeEarned = 1e12;
  s.crew.assistant = 100;
  s.certificates = { button: 1 };
  s.insights = s.lifetimeInsights = 10;
  s.pipeline.total = 1000;
  s.pipeline.completed = ["budget"];
  if (stage === 3) {
    s.products.releases = { checklist: 1 };
  }
  boot(s);
  expect(navigation().queryByRole("button", { name: next })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Отримати підвищення ↗" }));
  const notice = screen.getByRole("status", { name: "Нове відкриття" });
  expect(within(notice).getAllByRole("button")).toHaveLength(2); // Destination + dismiss.
  expect(notice).toHaveTextContent(next);
  expect(notice).not.toHaveTextContent("Офіс");
  expect(notice).not.toHaveTextContent("Ресурси");
  expect(navigation().getByRole("button", { name: next })).toBeEnabled();
});
it("keeps overview actions outside the tree until opened and retains old navigation", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 1;
  boot(s);
  expect(navigation().queryByRole("button", { name: "Офіс" })).not.toBeInTheDocument();
  const toggle = navigation().getByRole("button", { name: "Огляди" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(navigation().getByRole("button", { name: "Офіс" }));
  expect(
    screen.getByRole("heading", { name: "Перший робочий стіл" }),
  ).toBeInTheDocument();
  fireEvent.click(toggle);
  expect(navigation().queryByRole("button", { name: "Офіс" })).not.toBeInTheDocument();
  cleanup();
  s.journeyModel = 1;
  boot(s);
  expect(navigation().getByRole("button", { name: "Офіс" })).toBeEnabled();
  expect(navigation().queryByRole("button", { name: "Огляди" })).not.toBeInTheDocument();
});
it("delegates the main flow and cash work while preserving trial control and separate purchases", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 4;
  s.pipeline.total = 1000;
  s.pipeline.completed = ["budget", "verification", "deployment"];
  boot(s);
  fireEvent.click(navigation().getByRole("button", { name: "CI/CD" }));
  fireEvent.click(
    screen.getByRole("switch", { name: "Авторозподіл основного конвеєра" }),
  );
  expect(
    screen.getByRole("button", { name: "Конвеєр: Збірка — забрати ядро" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Делегувати освоєну роботу" }));
  expect(screen.getByRole("switch", { name: "Автонайм" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("switch", { name: "Автопроєкти" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("switch", { name: "Автопокращення" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("switch", { name: "Автопідвищення" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  expect(screen.getByRole("switch", { name: "Автостудія" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
});
function networkSave() {
  const s = newCareer(NOW);
  s.careers = 1;
  s.bestStage = 5;
  s.pipeline.total = 10000;
  s.pipeline.completed = ["budget", "verification", "deployment"];
  s.pipeline.architecture.blueprints = ["cycle", "bus", "flow", "studio"];
  return s;
}
it.each([
  { previous: "Конвеєр", destination: "network" },
  { previous: "Архітектура", destination: "network" },
  { previous: "Конвеєр", destination: "architecture" },
])(
  "opens the promised $destination after visiting $previous",
  ({ previous, destination }) => {
    const s = networkSave();
    if (destination === "architecture") {
      s.pipeline.architecture.blueprints.pop();
    }
    boot(s);
    fireEvent.click(navigation().getByRole("button", { name: "CI/CD" }));
    fireEvent.click(screen.getByRole("button", { name: previous }));
    fireEvent.click(navigation().getByRole("button", { name: "Робоче місце" }));
    fireEvent.click(
      within(screen.getByRole("region", { name: "Наступне відкриття" })).getByRole(
        "button",
      ),
    );
    expect(
      screen.getByRole("heading", {
        name: destination === "network" ? "Обчислювальна мережа" : "Архітектура студії",
      }),
    ).toBeInTheDocument();
  },
);
it("starts with two tabs and no hidden systems in the accessibility tree", () => {
  boot();
  expect(
    navigation()
      .getAllByRole("button")
      .map((b) => b.textContent),
  ).toEqual(["▦Робоче місце", "⚙Налаштування"]);
  expect(screen.queryByText("ПОСТІЙНИЙ ДОСВІД")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Наступне відкриття" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Диспетчер в офісі/ }),
  ).not.toBeInTheDocument();
});
it("reveals rank tabs during play, announces them and keeps the first project focused", () => {
  const s = newCareer(NOW);
  s.money = 200;
  s.earned = 150;
  s.rankEarned = 150;
  s.upgrades = ["checklist"];
  s.lifetimeEarned = 150;
  s.crew.assistant = 3;
  boot(s);
  expect(navigation().queryByRole("button", { name: "Проєкти" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Отримати підвищення ↗" }));
  expect(navigation().getByRole("button", { name: "Проєкти" })).toBeEnabled();
  expect(screen.getByRole("status", { name: "Нове відкриття" })).toHaveTextContent(
    "Проєкти",
  );
  expect(screen.getByRole("status", { name: "Нове відкриття" })).not.toHaveTextContent(
    "Офіс",
  );
  expect(screen.getByRole("status", { name: "Нове відкриття" })).not.toHaveTextContent(
    "Кар’єра",
  );
  expect(navigation().queryByRole("button", { name: "Студія" })).not.toBeInTheDocument();
  fireEvent.click(navigation().getByRole("button", { name: "Проєкти" }));
  expect(screen.getByRole("button", { name: "Почати Кнопка, яка продає" })).toBeEnabled();
  expect(document.querySelectorAll(".project-card")).toHaveLength(1);
  expect(
    screen.queryByRole("button", { name: /Керувати продуктами/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /інсайтів → Студія/ }),
  ).not.toBeInTheDocument();
});
it("reveals dependent research immediately when its prerequisite is purchased", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 4;
  s.insights = s.lifetimeInsights = 100;
  boot(s);
  fireEvent.click(navigation().getByRole("button", { name: "Студія" }));
  expect(
    screen.queryByRole("button", { name: "Дослідити Розумні закупівлі" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Фахівці/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Дослідити Стійка автоматизація" }));
  expect(
    screen.getByRole("button", { name: "Дослідити Розумні закупівлі" }),
  ).toBeEnabled();
});
it("shows only the next career rank and keeps prestige hidden until Director", () => {
  const s = newCareer(NOW);
  s.stage = s.bestStage = 1;
  boot(s);
  fireEvent.click(navigation().getByRole("button", { name: "Огляди" }));
  fireEvent.click(navigation().getByRole("button", { name: "Кар’єра" }));
  expect(screen.getByRole("heading", { name: "Senior QA" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Director" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Залиш свій слід." }),
  ).not.toBeInTheDocument();
});
it("reveals trials at 100 releases, without showing unearned reward policies", () => {
  const s = newCareer(NOW);
  s.careers = 1;
  s.pipeline.total = 99;
  boot(s);
  fireEvent.click(navigation().getByRole("button", { name: "CI/CD" }));
  expect(screen.queryByRole("heading", { name: "Випробування" })).not.toBeInTheDocument();
  expect(screen.queryByRole("switch", { name: "Автопроєкти" })).not.toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(screen.getByRole("heading", { name: "Випробування" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Архітектура" })).not.toBeInTheDocument();
});
it("reveals generator nodes at their threshold and keeps reboot and protocols hidden beforehand", () => {
  const s = networkSave();
  s.pipeline.network.best =
    s.pipeline.network.runTotal =
    s.pipeline.network.computations =
      79;
  boot(s);
  fireEvent.click(navigation().getByRole("button", { name: "CI/CD" }));
  expect(
    screen.queryByRole("button", { name: "Купити: Планувальники" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Перезапуск мережі" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Постійні протоколи" }),
  ).not.toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(screen.getByRole("button", { name: "Купити: Планувальники" })).toBeEnabled();
  expect(
    screen.queryByRole("button", { name: "Купити: Кластери" }),
  ).not.toBeInTheDocument();
  const chain = screen.getByRole("region", { name: "Ланцюжок генераторів" });
  expect(chain).toHaveTextContent("Планувальники");
  expect(chain).not.toHaveTextContent("Кластери");
});
it("imports a younger save from a late layer and closes unavailable views without replaying unlocks", () => {
  boot(networkSave());
  fireEvent.click(navigation().getByRole("button", { name: "CI/CD" }));
  expect(document.querySelector(".app-shell")).toHaveAttribute("data-layer", "network");
  fireEvent.click(navigation().getByRole("button", { name: "Налаштування" }));
  fireEvent.change(screen.getByLabelText("Встав JSON збереження для імпорту"), {
    target: { value: exportCareer(newCareer(NOW)) },
  });
  fireEvent.click(screen.getByRole("button", { name: "↑ Імпортувати збереження" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Завантажити" }),
  );
  expect(document.querySelector(".app-shell")).toHaveAttribute("data-layer", "workspace");
  expect(navigation().queryByRole("button", { name: "CI/CD" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("status", { name: "Нове відкриття" }),
  ).not.toBeInTheDocument();
});
