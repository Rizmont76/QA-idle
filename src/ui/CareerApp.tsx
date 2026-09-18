import { useState } from "react";
import type { CareerState } from "../types";
import { BADGES, CAREER_RULES as R, CAREER_STAGES } from "../game/career/content";
import { advanceCareer, newCareer } from "../game/career/engine";
import { exportCareer, importCareer } from "../game/career/persistence";
import {
  hasAutoReport,
  offlineCap,
  permanentMultiplier,
  prestigeReward,
  production,
  reportValue,
} from "../game/career/selectors";
import { useCareer } from "./useCareer";
import { CareerWorkspace } from "./CareerWorkspace";
import { BugIcon, ConfirmDialog, SectionTitle } from "./CareerWidgets";
import { cash, duration, number } from "./careerUtils";

type View = "workspace" | "career" | "achievements" | "settings";
const PERCENT = 100;
const NAV: readonly { id: View; title: string; symbol: string; subtitle: string }[] = [
  {
    id: "workspace",
    title: "Робоче місце",
    symbol: "▦",
    subtitle: "Кожен баг — це можливість.",
  },
  {
    id: "career",
    title: "Кар’єра",
    symbol: "↗",
    subtitle: "Від першого звіту до власної спадщини.",
  },
  {
    id: "achievements",
    title: "Досягнення",
    symbol: "◇",
    subtitle: "Маленькі перемоги. Постійні бонуси.",
  },
  {
    id: "settings",
    title: "Налаштування",
    symbol: "⚙",
    subtitle: "Твій прогрес — під твоїм контролем.",
  },
];
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, R.saveMs);
}
export function CareerApp() {
  const {
    game: s,
    send,
    replace,
    saved,
    warning,
    otherTab,
    summary,
    dismissSummary,
    toast,
    clearToast,
  } = useCareer();
  const [view, setView] = useState<View>("workspace");
  const [confirmation, setConfirmation] = useState<
    "prestige" | "reset" | "import" | "contract" | null
  >(null);
  const [saveText, setSaveText] = useState("");
  const [importError, setImportError] = useState("");
  const [pendingSave, setPendingSave] = useState<CareerState | null>(null);
  const currentNav = NAV.find((n) => n.id === view) ?? NAV[0];
  const stage = CAREER_STAGES[s.stage] ?? CAREER_STAGES[0];
  const rate = production(s);
  const auto = hasAutoReport(s);
  const reward = prestigeReward(s);
  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function previewImport() {
    try {
      setPendingSave(importCareer(saveText));
      setImportError("");
      setConfirmation("import");
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Не вдалося прочитати збереження.",
      );
    }
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#game-content">
        До гри
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate("workspace");
          }}
          aria-label="QA Idle — робоче місце"
        >
          <span className="brand-icon">
            <BugIcon size={27} />
          </span>
          <span>
            QA<span className="brand-idle">idle</span>
            <small>ЗНАЙШОВ. ЗАРОБИВ. ВИРІС.</small>
          </span>
        </a>
        <div className="sidebar-label">ТВІЙ ПРОСТІР</div>
        <nav aria-label="Головна навігація">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-link ${view === n.id ? "selected" : ""}`}
              aria-current={view === n.id ? "page" : undefined}
              onClick={() => {
                navigate(n.id);
              }}
            >
              <span aria-hidden="true">{n.symbol}</span>
              {n.title}
              {n.id === "achievements" && <small>{s.badges.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="career-pass">
            <span className="eyebrow">ПОСТІЙНИЙ ДОСВІД</span>
            <div>
              <span>✦</span>
              <strong>{number(s.experience)}</strong>
              <small>+{number(s.experience * R.experienceBonus * PERCENT)}%</small>
            </div>
            <p>
              {s.careers
                ? `${String(s.careers + 1)}-га кар’єра. Ти вже знаєш, як це працює.`
                : "Твій досвід залишиться з тобою після нової кар’єри."}
            </p>
          </div>
          <div className="profile">
            <span className="avatar">QA</span>
            <div>
              <strong>{stage.title}</strong>
              <small>Кар’єра №{s.careers + 1}</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <main className="main-content" id="game-content">
        <header className="page-header">
          <div>
            <div className="breadcrumbs">
              Твій простір <span>/</span> <strong>{currentNav?.title}</strong>
            </div>
            <h1>
              {currentNav?.title}
              <span className="heading-dot">.</span>
            </h1>
            <p>{currentNav?.subtitle}</p>
          </div>
          <div className="header-status">
            <span className={`save-status ${saved && !otherTab ? "" : "unsaved"}`}>
              <i />
              {otherTab
                ? "Інша вкладка активна"
                : saved
                  ? "Прогрес збережено"
                  : "Перевір збереження"}
            </span>
            <span className="version-chip">CAREER EDITION</span>
          </div>
        </header>
        {warning && (
          <div className="notice" role="status">
            {warning}
          </div>
        )}
        {otherTab && (
          <div className="notice" role="alert">
            Гра продовжується в іншій вкладці. Цю призупинено, щоб зберегти прогрес.{" "}
            <button
              className="text-button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Продовжити тут
            </button>
          </div>
        )}
        {summary && (
          <section className="return-banner" aria-label="Повернення до гри">
            <span className="return-icon">☾</span>
            <div>
              <h2>Поки тебе не було, команда працювала.</h2>
              <p>
                {duration(summary.seconds)}{" "}
                {summary.capped ? "(досягнуто ліміту)" : "офлайн"} · +
                {number(summary.bugs)} багів
                {summary.money > 0
                  ? ` · +${cash(summary.money)}`
                  : " · здай звіт, щоб отримати гроші"}
              </p>
            </div>
            <button className="button ghost" onClick={dismissSummary}>
              Чудово ✓
            </button>
          </section>
        )}
        <fieldset className="game-fieldset" disabled={otherTab}>
          <div className="resource-strip">
            <article className="resource-card">
              <span className="resource-icon mint">$</span>
              <div>
                <span className="resource-label">НА РАХУНКУ</span>
                <strong data-testid="money">{cash(s.money)}</strong>
                <small>
                  {auto
                    ? `+${cash(rate * reportValue(s))} / с`
                    : "Здай звіт, щоб отримати гроші"}
                </small>
              </div>
            </article>
            <article className="resource-card">
              <span className="resource-icon amber">
                <BugIcon />
              </span>
              <div>
                <span className="resource-label">ЗНАЙДЕНІ БАГИ</span>
                <strong data-testid="bugs">{number(s.bugs)}</strong>
                <small>{cash(reportValue(s))} за кожен баг</small>
              </div>
            </article>
            <article className="resource-card">
              <span className="resource-icon blue">↯</span>
              <div>
                <span className="resource-label">ПРОДУКТИВНІСТЬ</span>
                <strong>
                  {number(rate)}
                  <em> / с</em>
                </strong>
                <small>
                  {auto
                    ? "Автозвіти працюють"
                    : rate > 0
                      ? "Баги накопичуються автоматично"
                      : "Найми першого помічника"}
                </small>
              </div>
              <span
                className={`automation-indicator ${auto ? "on" : ""}`}
                title={auto ? "Автоматичні звіти" : "Ручні звіти"}
              >
                ↻
              </span>
            </article>
          </div>
          {view === "workspace" && (
            <CareerWorkspace
              game={s}
              send={send}
              career={() => {
                navigate("career");
              }}
              cancelContract={() => {
                setConfirmation("contract");
              }}
            />
          )}
          {view === "career" && (
            <>
              <SectionTitle
                eyebrow="ШІСТЬ ПОСАД. ОДНА ВЕЛИКА ІСТОРІЯ."
                title="Твій кар’єрний шлях"
              >
                <span className="pill">{stage.title}</span>
              </SectionTitle>
              <div className="career-layout">
                <div className="career-timeline">
                  {CAREER_STAGES.map((rank, i) => (
                    <article
                      key={rank.title}
                      className={`timeline-card ${i === s.stage ? "current" : ""} ${i < s.stage ? "complete" : ""}`}
                    >
                      <span className="timeline-number">
                        {i < s.stage ? "✓" : `0${String(i + 1)}`}
                      </span>
                      <div>
                        <span className="eyebrow">
                          {rank.short}
                          {i === s.stage ? " · ТИ ТУТ" : ""}
                        </span>
                        <h3>{rank.title}</h3>
                        <p>{rank.unlock}</p>
                        <small>
                          {i === 0
                            ? "Кожна кар’єра починається тут"
                            : `${cash(rank.earned)} за кар’єру · ${String(rank.crew)} од. команди`}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
                <section className="panel prestige-panel">
                  <div className="eyebrow">КІНЕЦЬ — ЦЕ ПОЧАТОК</div>
                  <div className="prestige-symbol">∞</div>
                  <h2>Залиш свій слід.</h2>
                  <p className="muted">
                    Почни нову кар’єру. Знання залишаться з тобою — і кожен наступний шлях
                    буде швидшим.
                  </p>
                  <div className="prestige-stats">
                    <div>
                      <span>Накопичений досвід</span>
                      <strong>{number(s.experience)} ✦</strong>
                    </div>
                    <div>
                      <span>Поточний постійний множник</span>
                      <strong>×{number(permanentMultiplier(s))}</strong>
                    </div>
                    <div>
                      <span>За нову кар’єру зараз</span>
                      <strong className="mint">+{number(reward)} ✦</strong>
                    </div>
                  </div>
                  {reward > 0 && (
                    <p className="prestige-preview">
                      Досвід дасть ще +{number(reward * R.experienceBonus * PERCENT)}%
                      базової продуктивності. Стартуєш із $50 та автозвітами.
                    </p>
                  )}
                  <button
                    className="button primary full"
                    disabled={reward <= 0}
                    onClick={() => {
                      setConfirmation("prestige");
                    }}
                  >
                    {reward > 0 ? "Почати нову кар’єру ↻" : "Відкриється на Director"}
                  </button>
                  <p className="tiny muted">
                    Можна залишитися на Director: більший дохід дає більше досвіду.
                  </p>
                </section>
              </div>
            </>
          )}
          {view === "achievements" && (
            <>
              <SectionTitle
                eyebrow="ТВОЇ МАЛЕНЬКІ ВЕЛИКІ ПЕРЕМОГИ"
                title="Колекція досягнень"
              >
                <span className="pill">
                  {s.badges.length} / {BADGES.length}
                </span>
              </SectionTitle>
              <div className="achievement-intro">
                Кожне досягнення дає <strong>+2% продуктивності назавжди</strong>. Твій
                бонус:{" "}
                <strong className="mint">
                  +{number(s.badges.length * R.badgeBonus * PERCENT)}%
                </strong>
                .
              </div>
              <div className="badge-grid">
                {BADGES.map((b) => {
                  const earned = s.badges.includes(b.id);
                  return (
                    <article
                      key={b.id}
                      className={`panel badge-card ${earned ? "earned" : ""}`}
                    >
                      <span className="badge-symbol">{b.icon}</span>
                      <span className="badge-state">
                        {earned ? "✓ Відкрито" : "Ще попереду"}
                      </span>
                      <h3>{b.title}</h3>
                      <p>{b.description}</p>
                      <strong>+2% назавжди</strong>
                    </article>
                  );
                })}
              </div>
            </>
          )}
          {view === "settings" && (
            <div className="settings-grid">
              <section className="panel settings-panel">
                <SectionTitle eyebrow="НЕ ЗАГУБИ СВОЮ КАР’ЄРУ" title="Збереження" />
                <p className="muted">
                  Гра зберігається в цьому браузері кожні 5 секунд та після покупок.
                  Резервна копія допоможе перенести її на інший пристрій.
                </p>
                <div className="setting-buttons">
                  <button
                    className="button primary"
                    onClick={() => {
                      const text = exportCareer(s);
                      setSaveText(text);
                      download(text, "qa-idle-save.json");
                    }}
                  >
                    ↓ Експортувати прогрес
                  </button>
                  <button
                    className="button ghost"
                    onClick={() => {
                      try {
                        const raw =
                          localStorage.getItem(R.saveKey) ??
                          localStorage.getItem(R.legacyKey);
                        if (raw) {
                          setSaveText(raw);
                          download(raw, "qa-idle-original.json");
                        }
                      } catch {
                        setImportError("Браузер не дозволив прочитати оригінал.");
                      }
                    }}
                  >
                    Копія оригіналу
                  </button>
                </div>
                <label className="textarea-label" htmlFor="save-json">
                  Встав JSON збереження для імпорту
                </label>
                <textarea
                  id="save-json"
                  value={saveText}
                  onChange={(e) => {
                    setSaveText(e.target.value);
                  }}
                  placeholder={'{"schemaVersion":3, ...}'}
                  spellCheck={false}
                />
                {importError && (
                  <p className="error-message" role="alert">
                    {importError}
                  </p>
                )}
                <button
                  className="button ghost"
                  disabled={!saveText.trim()}
                  onClick={previewImport}
                >
                  ↑ Імпортувати збереження
                </button>
              </section>
              <div>
                <section className="panel settings-panel">
                  <div className="eyebrow">ТВІЙ ПРОГРЕС У ЦИФРАХ</div>
                  <h2>Статистика</h2>
                  <dl className="statistics">
                    <div>
                      <dt>Зароблено за весь час</dt>
                      <dd>{cash(s.lifetimeEarned)}</dd>
                    </div>
                    <div>
                      <dt>Знайдено багів</dt>
                      <dd>{number(s.lifetimeBugs)}</dd>
                    </div>
                    <div>
                      <dt>Ручних тестів</dt>
                      <dd>{number(s.manualTests)}</dd>
                    </div>
                    <div>
                      <dt>Час у грі</dt>
                      <dd>{duration(s.playedSeconds)}</dd>
                    </div>
                    <div>
                      <dt>Завершено контрактів</dt>
                      <dd>{s.contractsCompleted}</dd>
                    </div>
                    <div>
                      <dt>Ліміт офлайн-прогресу</dt>
                      <dd>{duration(offlineCap(s))}</dd>
                    </div>
                  </dl>
                </section>
                <section className="panel reset-panel">
                  <h3>Почати з чистого аркуша</h3>
                  <p className="muted">
                    Видалити поточну кар’єру, досвід та досягнення. Перед цим збережи
                    резервну копію.
                  </p>
                  <button
                    className="button danger"
                    onClick={() => {
                      setConfirmation("reset");
                    }}
                  >
                    Скинути прогрес
                  </button>
                </section>
              </div>
            </div>
          )}
        </fieldset>
        <footer className="game-footer">
          <span>
            <BugIcon size={16} /> QA IDLE <span>·</span> Маленькі баги. Велика кар’єра.
          </span>
          <span>Зроблено для тих, хто натискає «а якщо?»</span>
        </footer>
      </main>
      {toast && (
        <div className="toast" role="status">
          <span>✦</span>
          <p>{toast}</p>
          <button onClick={clearToast} aria-label="Закрити повідомлення">
            ×
          </button>
        </div>
      )}
      {confirmation === "prestige" && (
        <ConfirmDialog
          title="Готовий до нової кар’єри?"
          label={`Отримати +${String(reward)} досвіду`}
          close={() => {
            setConfirmation(null);
          }}
          confirm={() => {
            send({ type: "prestige" });
            navigate("workspace");
          }}
        >
          <p>
            Ти отримаєш <strong>+{reward} постійного досвіду</strong>, $50 на старті та
            автоматичні звіти.
          </p>
          <p>
            Гроші, баги, посада, команда, покращення та поточний контракт скинуться.
            Досягнення, досвід і загальна статистика залишаться.
          </p>
        </ConfirmDialog>
      )}
      {confirmation === "reset" && (
        <ConfirmDialog
          title="Скинути весь прогрес?"
          label="Так, почати з нуля"
          danger
          close={() => {
            setConfirmation(null);
          }}
          confirm={() => {
            replace(newCareer());
            navigate("workspace");
          }}
        >
          <p>
            Поточна кар’єра, досвід та досягнення будуть видалені. Повернути їх можна буде
            лише з експортованої копії.
          </p>
        </ConfirmDialog>
      )}
      {confirmation === "import" && pendingSave && (
        <ConfirmDialog
          title="Завантажити цю кар’єру?"
          label="Завантажити"
          close={() => {
            setConfirmation(null);
          }}
          confirm={() => {
            replace(advanceCareer(pendingSave, Date.now(), true).state);
            setSaveText("");
            navigate("workspace");
          }}
        >
          <p>
            {CAREER_STAGES[pendingSave.stage]?.title} · {cash(pendingSave.money)} ·{" "}
            {number(pendingSave.experience)} досвіду
          </p>
          <p>
            Це замінить поточний прогрес. Експортуй його спочатку, якщо хочеш зберегти
            обидві кар’єри.
          </p>
        </ConfirmDialog>
      )}
      {confirmation === "contract" && (
        <ConfirmDialog
          title="Скасувати контракт?"
          label="Скасувати контракт"
          close={() => {
            setConfirmation(null);
          }}
          confirm={() => {
            send({ type: "cancelContract" });
          }}
        >
          <p>
            Прогрес цього контракту зникне, винагороди не буде. Гроші й знайдені баги
            залишаться.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
