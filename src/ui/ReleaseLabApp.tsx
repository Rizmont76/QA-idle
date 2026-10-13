import { useState } from "react";
import type { ReleaseLabState } from "../types";
import {
  autoUnlocked,
  efficiencyPrice,
  LAB,
  LAB_PRODUCERS,
  labPrice,
  labProducerUnlocked,
  labRate,
  nextLabDiscovery,
  outputPower,
  patternPower,
  releaseGain,
  efficiencyPower,
  releaseRewardCap,
  nextRewardWork,
  releaseWork,
  labBatchQuote,
} from "../game/releaseLab/data";
import { exportReleaseLab, importReleaseLab } from "../game/releaseLab/persistence";
import { useReleaseLab } from "./useReleaseLab";
import { number } from "./careerUtils";
import { BugIcon, ConfirmDialog, Meter } from "./CareerWidgets";

const READY_FRACTION = 0.66;
const RATE_DIGITS = 3;
const rate = (n: number) =>
  n > 0 && n < 1
    ? n.toLocaleString("uk-UA", { maximumFractionDigits: RATE_DIGITS })
    : number(n);
function ClientBuild({ game: s }: { game: ReleaseLabState }) {
  const ready = s.buildWork >= releaseWork(s);
  const uncovered = s.buildWork < releaseWork(s) * READY_FRACTION;
  return (
    <div className={`lab-client ${ready ? "build-ready" : ""}`}>
      <div className="lab-client-message">
        <span className="lab-client-avatar">Л</span>
        <div>
          <strong>Ліза · маленька крамниця</strong>
          <p>
            {s.builds === 0
              ? "На моєму телефоні кнопки немає. А завтра я маю відкритися…"
              : "Перший реліз працює! Додала нові товари. Перевіримо наступну збірку?"}
          </p>
        </div>
      </div>
      <div
        className="lab-store"
        role="img"
        aria-label={
          ready
            ? "Крамниця: стабільна збірка готова до релізу"
            : "Крамниця: кнопка покупки ще перевіряється"
        }
      >
        <div className="lab-browser-bar">
          <span>● ● ●</span>lizashop / preview<span>↗</span>
        </div>
        <div className="lab-store-content">
          <div>
            <span className="lab-store-tag">МАЛЕНЬКІ РЕЧІ ДЛЯ ВЕЛИКИХ ДНІВ</span>
            <h3>
              Щось тепле.
              <br />
              Щось своє.
            </h3>
            <p>Чашка, з якої починається спокійний ранок.</p>
            <div className={`lab-mock-buy ${uncovered ? "button-escaped" : ""}`}>
              {ready ? "✓ Замовлення перевірено" : "Додати до кошика"}
            </div>
          </div>
          <svg viewBox="0 0 160 170" aria-hidden="true">
            <ellipse cx="78" cy="145" rx="59" ry="10" fill="#223e39" opacity=".25" />
            <path d="M43 57h78v65q0 20-39 20t-39-20z" fill="#e4a783" />
            <path
              d="M121 71h13q28 2 8 39h-21"
              fill="none"
              stroke="#e4a783"
              strokeWidth="13"
            />
            <ellipse cx="82" cy="57" rx="39" ry="9" fill="#a46b54" />
            <path
              d="M65 40q-15-13 2-26m24 26q-15-13 2-26"
              fill="none"
              stroke="#cce2ce"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className={`lab-build-status ${ready ? "is-ready" : ""}`}>
          <i />
          {ready
            ? "Стабільна збірка. Можна відкривати крамницю."
            : uncovered
              ? "Проблему відтворено: кнопка виходить за екран."
              : "Кнопка на місці. Перевіряємо шлях замовлення."}
        </div>
      </div>
    </div>
  );
}

export function ReleaseLabApp() {
  const {
    game: s,
    send,
    replace,
    warning,
    blocked,
    original,
    otherTab,
  } = useReleaseLab();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<ReleaseLabState | null>(null);
  const next = nextLabDiscovery(s);
  const gain = releaseGain(s);
  const power = outputPower(s);
  const boostAfter = patternPower(
    s.patterns + Math.min(Math.max(1, gain), releaseRewardCap(s)),
  );
  const efficiency = efficiencyPower(s);
  const growing = labProducerUnlocked(s, "scripts");
  const factory = labProducerUnlocked(s, "ci");
  return (
    <main className="lab-app">
      <header className="lab-header">
        <a href={window.location.pathname} className="lab-logo">
          <BugIcon />
          QA<span>idle</span>
        </a>
        <span className="lab-edition">РЕЛІЗНА МАЙСТЕРНЯ</span>
        <a href={window.location.pathname} className="lab-old-career">
          Моя кар’єра ↗
        </a>
      </header>
      <div className="lab-opening">
        <span className="eyebrow">ЗБІРКА {s.builds + 1} · СЬОГОДНІ РЕЛІЗ</span>
        <h1>
          {factory
            ? "Ти запустив фабрику."
            : growing
              ? "Тести вже пишуть тести."
              : "Спершу — одна кнопка."}
        </h1>
        <p>
          {growing
            ? "Система росте між покупками. Виріши, коли перетворити цю збірку на ще сильнішу основу."
            : "Збери докази. Побудуй команду. Відкрий крамницю й забери код, який зробить наступну збірку сильнішою."}
        </p>
      </div>
      {warning && (
        <div className="notice" role="alert">
          {warning}
        </div>
      )}
      {otherTab && (
        <div className="notice" role="alert">
          Лабораторія працює в іншій вкладці.{" "}
          <button className="text-button" onClick={() => window.location.reload()}>
            Продовжити тут
          </button>
        </div>
      )}
      <fieldset className="game-fieldset" disabled={otherTab}>
        <div className="lab-workshop">
          <section className="lab-workbench" aria-label="Тестова збірка">
            <ClientBuild game={s} />
            <div className="lab-work-output">
              <div>
                <span>ЗВІТИ ДЛЯ ІНВЕСТИЦІЙ</span>
                <strong data-testid="lab-reports">{number(s.reports)}</strong>
                <small>+{rate(labRate(s))} / с</small>
              </div>
              <button className="lab-test-button" onClick={() => send({ type: "test" })}>
                <BugIcon />
                <span>
                  Перевірити збірку<small>+{number(LAB.click * power)} звітів</small>
                </span>
                <span>↵</span>
              </button>
            </div>
          </section>
          <section className="lab-release" aria-label="Реліз і наступна збірка">
            <span className="eyebrow">ПРОРИВ, ЯКИЙ ЗАЛИШАЄТЬСЯ</span>
            <h2>{gain > 0 ? "Можна випускати." : "Підготуй реліз."}</h2>
            <div className="lab-patterns">
              <span>✦</span>
              <strong>+{number(gain)}</strong>
              <small>патернів для наступної збірки</small>
            </div>
            <Meter
              value={s.buildWork}
              max={nextRewardWork(s)}
              label="Робота до наступної нагороди"
            />
            <p className="lab-work-caption">
              Зібрано {number(s.buildWork)} роботи. Витрачені звіти теж враховуються.
              {s.patterns > 0
                ? ` Складність збірки: ${number(releaseWork(s))} роботи за перший патерн.`
                : ""}
            </p>
            <div className="lab-power-preview">
              <span>
                {gain > 0 ? "Сила коду після релізу" : "Сила коду після готового релізу"}
              </span>
              <strong>
                ×{number(patternPower(s.patterns))} <i>→</i> ×{number(boostAfter)}
              </strong>
            </div>
            <p>Живе виробництво й подвоєння почнуть знову. Код з патернів залишиться.</p>
            <dl className="lab-reset-preview">
              <dt>Почнуть знову</dt>
              <dd>
                {number(s.testers)} тестувальників
                {growing
                  ? ` · ${number(s.scripts)} скриптів · ${number(s.cases)} тест-кейсів`
                  : ""}
                {factory ? ` · ${number(s.ci)} CI-вузлів` : ""} · ефективність ×
                {number(efficiency)}
              </dd>
              <dt>
                {gain > 0 ? "На старті нової збірки" : "На старті після готового релізу"}
              </dt>
              <dd>
                +{number(boostAfter)} звітів/с
                {growing || (next?.at !== undefined && s.patterns + gain >= next.at)
                  ? " · з виробниками вже освоєних систем"
                  : ""}
              </dd>
            </dl>
            <button
              className="button primary lab-ship"
              disabled={gain < 1}
              onClick={() => send({ type: "ship" })}
            >
              {gain > 0
                ? `Випустити реліз · +${number(gain)} ✦`
                : s.patterns >= LAB.patterns
                  ? "Усі патерни освоєно"
                  : `Ще ${number(Math.max(0, releaseWork(s) - s.buildWork))} роботи`}
            </button>
            {gain > 0 && (
              <small className="lab-hold-hint">
                {gain < releaseRewardCap(s)
                  ? `До ще одного патерна: ${number(Math.max(0, nextRewardWork(s) - s.buildWork))} роботи. Можеш розігнати цю збірку або випустити її зараз.`
                  : next
                    ? "Ця збірка вже дає найближчий прорив. Випусти реліз, щоб відкрити його."
                    : "Ця збірка вже дає максимальну доступну нагороду."}
              </small>
            )}
            {next ? (
              <div className="lab-horizon">
                <span>НАСТУПНЕ ВІДКРИТТЯ · {next.at} ✦</span>
                <h3>{next.title}</h3>
                <p>{next.detail}</p>
                <Meter value={s.patterns} max={next.at} label="Патерни до відкриття" />
              </div>
            ) : (
              <div className="lab-horizon">
                <span>ПОЧАТКОВИЙ ЦИКЛ ПРОЙДЕНО</span>
                <h3>Фабрика вже працює.</h3>
                <p>
                  Тепер CI створює скрипти, скрипти — тест-кейси, а вони — нові звіти. Це
                  основа для наступного масштабу.
                </p>
              </div>
            )}
          </section>
        </div>
        <section className="lab-machinery" aria-label="Виробництво лабораторії">
          <div className="lab-section-title">
            <h2>{growing ? "Потік, який росте сам" : "Робота між твоїми кліками"}</h2>
            <span>
              КОД ×{number(patternPower(s.patterns))} · ЕФЕКТИВНІСТЬ ×{number(efficiency)}
            </span>
          </div>
          {growing && (
            <div className="lab-chain" aria-label="Ланцюжок зростання">
              {factory && (
                <>
                  <span>
                    <strong>{number(s.ci)}</strong> CI-вузлів
                    <small>+{rate(s.ci * LAB.ciRate * efficiency)} скриптів/с</small>
                  </span>
                  <b>→</b>
                </>
              )}
              <span>
                <strong>{number(s.scripts)}</strong> скриптів
                <small>
                  +{rate(s.scripts * LAB.caseRate * efficiency)} тест-кейсів/с
                </small>
              </span>
              <b>→</b>
              <span>
                <strong data-testid="lab-cases">{number(s.cases)}</strong> тест-кейсів
                <small>+{rate(s.cases * LAB.caseOutput * power)} звітів/с</small>
              </span>
            </div>
          )}
          <div className="lab-investments">
            {LAB_PRODUCERS.filter((p) => labProducerUnlocked(s, p.id)).map((p) => {
              const batch = labBatchQuote(s, p.id);
              return (
                <article className={`lab-investment producer-${p.id}`} key={p.id}>
                  <span className="lab-producer-symbol">{p.symbol}</span>
                  <h3>{p.title}</h3>
                  <strong>
                    {number(s[p.id])}
                    <small> у роботі</small>
                  </strong>
                  <p>
                    {p.id === "testers"
                      ? `Кожен знаходить ${number(power)} звітів/с.`
                      : p.id === "scripts"
                        ? `Кожен пише ${rate(LAB.caseRate * efficiency)} продуктивних тест-кейсів/с.`
                        : `Кожен створює ${rate(LAB.ciRate * efficiency)} скриптів/с.`}
                  </p>
                  <button
                    className="button secondary"
                    aria-label={`Купити: ${p.title}`}
                    disabled={
                      s.reports < labPrice(s, p.id) || s.bought[p.id] >= LAB.purchases
                    }
                    onClick={() => send({ type: "buy", id: p.id })}
                  >
                    {s.bought[p.id] >= LAB.purchases
                      ? "Усе придбано ✓"
                      : `${number(labPrice(s, p.id))} звітів · +1`}
                  </button>
                  {batch.count > 1 && (
                    <button
                      className="text-button lab-buy-max"
                      aria-label={`Максимум: ${p.title}`}
                      onClick={() => send({ type: "buyMax", id: p.id })}
                    >
                      Максимум · +{batch.count} за {number(batch.cost)} звітів
                    </button>
                  )}
                </article>
              );
            })}
            <article className="lab-investment lab-efficiency">
              <span className="lab-producer-symbol">↟</span>
              <h3>Зручніше тестувати</h3>
              <strong>
                ×{number(efficiency)}
                <small> ефективність</small>
              </strong>
              <p>
                Подвоює силу тестування.
                {growing
                  ? " Скрипти й генератори також працюють удвічі швидше."
                  : " Команда знаходить удвічі більше звітів."}
              </p>
              <button
                className="button secondary"
                disabled={
                  s.reports < efficiencyPrice(s) || s.efficiency >= LAB.efficiencyLevels
                }
                onClick={() => send({ type: "efficiency" })}
              >
                {s.efficiency >= LAB.efficiencyLevels
                  ? "Максимум цієї збірки ✓"
                  : `Подвоїти · ${number(efficiencyPrice(s))} звітів`}
              </button>
            </article>
          </div>
          {autoUnlocked(s) && (
            <div className="lab-auto">
              <div>
                <h3>Освоєні покупки можна делегувати</h3>
                <p>
                  Витрачає звіти: кожні 5 секунд купує одного найдешевшого доступного
                  виробника. Реліз і подвоєння залишаються твоїми рішеннями.
                </p>
              </div>
              <button
                className={`policy-switch ${s.autoBuy ? "on" : ""}`}
                role="switch"
                aria-label="Автопокупки лабораторії"
                aria-checked={s.autoBuy}
                onClick={() => send({ type: "auto", enabled: !s.autoBuy })}
              >
                {s.autoBuy ? "Увімкнено" : "Вимкнено"}
              </button>
            </div>
          )}
        </section>
      </fieldset>
      <footer className="lab-footer">
        <span>
          {s.builds} релізів · {number(s.patterns)} ✦ збережено · {number(s.totalWork)}{" "}
          роботи за весь час
        </span>
        <details>
          <summary>Збереження лабораторії</summary>
          <p>
            Цей цикл має власне збереження. Прогрес основної кар’єри залишається окремо.
          </p>
          <button
            className="button ghost"
            onClick={() => setText(blocked ? (original ?? "") : exportReleaseLab(s))}
          >
            Експортувати лабораторію
          </button>
          <textarea
            aria-label="JSON лабораторії"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="button secondary"
            disabled={!text || otherTab}
            onClick={() => {
              try {
                setPending(importReleaseLab(text));
                setError("");
              } catch {
                setError("Не вдалося прочитати збереження лабораторії.");
              }
            }}
          >
            Імпортувати лабораторію
          </button>
          {error && <p role="alert">{error}</p>}
        </details>
      </footer>
      {pending && (
        <ConfirmDialog
          title="Завантажити лабораторію?"
          label="Завантажити"
          close={() => setPending(null)}
          confirm={() => replace(pending)}
        >
          <p>Це замінить лише цей ігровий цикл. Основна кар’єра зберігається окремо.</p>
        </ConfirmDialog>
      )}
    </main>
  );
}
