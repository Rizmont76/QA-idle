import type { CSSProperties } from "react";
import type { CareerAction, CareerState } from "../types";
import { CAREER_STAGES, CONTRACTS } from "../game/career/content";
import {
  dispatchQuote,
  dispatcherUnlocked,
  officeLevel,
  OFFICES,
  OFFICE_RULES as O,
} from "../game/career/office";
import { contractQuote, crewCount } from "../game/career/selectors";
import { cash, clockTime, number } from "./careerUtils";
import { Meter, SectionTitle } from "./CareerWidgets";
import { OfficeScene } from "./OfficeScene";

export function CareerOffice({
  game: s,
  send,
  workspace,
  projects,
  studio,
}: {
  game: CareerState;
  send: (a: CareerAction) => void;
  workspace: () => void;
  projects: () => void;
  studio: () => void;
}) {
  const level = officeLevel(s);
  const office = OFFICES[level];
  const nextOffice = OFFICES[level + 1];
  const quote = dispatchQuote(s);
  const waiting = quote && s.contract && s.contract.id !== quote.id;
  return (
    <>
      <section
        className="panel office-panorama"
        style={{ "--office-accent": office?.color } as CSSProperties}
        aria-label="Твій офіс"
      >
        <div className="office-heading">
          <div>
            <div className="eyebrow">
              ТВОЯ КОМПАНІЯ · РІВЕНЬ {level + 1} / {OFFICES.length}
            </div>
            <h2>{office?.title}</h2>
            <p>{office?.subtitle}</p>
          </div>
          <span className="office-status">
            <i />
            {crewCount(s) ? "Команда на зміні" : "Чекає на першого колегу"}
          </span>
        </div>
        <OfficeScene game={s} level={level} />
        <div className="office-floorplan">
          {OFFICES.map((o, i) => (
            <div key={o.stage} className={i <= level ? "reached" : ""}>
              <span>{i <= level ? "✓" : "◇"}</span>
              <strong>{o.title}</strong>
              <small>{CAREER_STAGES[o.stage]?.title}</small>
            </div>
          ))}
        </div>
        <p className="office-next tiny muted">
          {nextOffice
            ? `Наступна локація: ${nextOffice.title} на ${CAREER_STAGES[nextOffice.stage]?.title ?? "новому ранзі"}.`
            : "Твоя штаб-квартира відкрита. Компанія пройшла великий шлях."}{" "}
          Офіс залишається після нової кар’єри.
        </p>
      </section>
      <div className="office-shortcuts">
        <button className="panel office-shortcut" onClick={workspace}>
          <span>▦</span>
          <strong>{number(crewCount(s))} у команді</strong>
          <small>Найняти колег →</small>
        </button>
        <button className="panel office-shortcut" onClick={projects}>
          <span>▣</span>
          <strong>{s.project ? "Реліз у роботі" : "Нові клієнти чекають"}</strong>
          <small>Перейти до проєктів →</small>
        </button>
        <button className="panel office-shortcut" onClick={studio}>
          <span>◈</span>
          <strong>{s.specialists.length} активних фахівців</strong>
          <small>Керувати студією →</small>
        </button>
      </div>
      <SectionTitle
        eyebrow="КОМПАНІЯ ПРАЦЮЄ, ПОКИ ТИ ВІДПОЧИВАЄШ"
        title="Диспетчер контрактів"
      />
      {!s.office.licensed ? (
        <section className="panel dispatch-unlock">
          <div className="dispatch-emblem" aria-hidden="true">
            ⇄
          </div>
          <div>
            <h3>Одна інструкція. Ціла зміна роботи.</h3>
            <p>
              Обери контракт — диспетчер прийматиме його, забиратиме нагороду та
              повторюватиме. Працює також офлайн у межах твого ліміту.
            </p>
            <div className="dispatch-requirements">
              <span className={s.bestStage >= O.stage ? "done" : ""}>
                {s.bestStage >= O.stage ? "✓" : "◇"} Досягти QA Lead
              </span>
              <span className={s.contractsCompleted >= O.contracts ? "done" : ""}>
                {Math.min(O.contracts, s.contractsCompleted)} / {O.contracts} контрактів
                завершено
              </span>
              <span>Ліцензія назавжди</span>
            </div>
            <button
              className="button primary"
              disabled={!dispatcherUnlocked(s) || s.insights < O.licenseCost}
              onClick={() => {
                send({ type: "buyDispatcher" });
              }}
            >
              Відкрити диспетчера · {O.licenseCost} ◈
            </button>
            <p className="tiny muted">
              У тебе {number(s.insights)} інсайтів. Зміна команди та витрати залишаються
              під твоїм контролем.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="panel dispatch-console" aria-label="Керування диспетчером">
            <div className="panel-topline">
              <span
                className={`dispatch-indicator ${quote && !waiting ? "running" : ""}`}
              >
                <i />
                {waiting
                  ? "Чекає на вільний слот"
                  : quote
                    ? "Автоповтор увімкнено"
                    : "На паузі"}
              </span>
              {quote && (
                <button
                  className="button ghost"
                  onClick={() => {
                    send({ type: "dispatch", id: null });
                  }}
                >
                  Призупинити диспетчера
                </button>
              )}
            </div>
            <h3>{quote?.title ?? "Обери роботу для своєї команди"}</h3>
            <p>
              {waiting
                ? "Заверши або скасуй інший активний контракт у робочому місці. Його прогрес збережено."
                : quote
                  ? "Нагороди надходять автоматично. Після завершення почнеться такий самий контракт за актуальними умовами."
                  : "Пауза зберігає активний контракт. Його можна здати вручну або продовжити автоповтор."}
            </p>
            {s.contract && (
              <div className="dispatch-progress">
                <strong>{s.contract.title}</strong>
                <span>
                  {number(s.contract.progress)} / {number(s.contract.target)} багів ·{" "}
                  {clockTime(s.contract.elapsed)} / {clockTime(s.contract.duration)}
                </span>
                <Meter
                  value={Math.min(
                    s.contract.progress / s.contract.target,
                    s.contract.elapsed / s.contract.duration,
                  )}
                  max={1}
                  label="Контракт диспетчера"
                />
                <span>
                  Винагорода: {cash(s.contract.reward)} · {number(s.contract.insights)} ◈
                </span>
              </div>
            )}
            <div className="dispatch-totals">
              <div>
                <strong>{number(s.office.completed)}</strong>
                <span>автоматичних контрактів</span>
              </div>
              <div>
                <strong>{cash(s.office.earned)}</strong>
                <span>заробив диспетчер</span>
              </div>
              <div>
                <strong>{number(s.office.insights)} ◈</strong>
                <span>приніс інсайтів</span>
              </div>
            </div>
          </section>
          <div className="dispatch-options">
            {CONTRACTS.filter((c) => c.stage <= s.stage).map((c) => {
              const q = contractQuote(s, c.id);
              return (
                q && (
                  <button
                    key={c.id}
                    className={`panel dispatch-option ${s.office.contractId === c.id ? "selected" : ""}`}
                    aria-pressed={s.office.contractId === c.id}
                    aria-label={`Повторювати ${c.title}`}
                    onClick={() => {
                      send({ type: "dispatch", id: c.id });
                    }}
                  >
                    <span className="eyebrow">
                      {s.office.contractId === c.id
                        ? "✓ ОБРАНИЙ КОНТРАКТ"
                        : "⇄ ПОВТОРЮВАТИ"}
                    </span>
                    <strong>{c.title}</strong>
                    <span>
                      {cash(q.reward)} <em>+{number(q.insights)} ◈</em>
                    </span>
                    <small>
                      від {clockTime(q.duration)} · {number(q.target)} багів
                    </small>
                  </button>
                )
              );
            })}
          </div>
          {s.stage < O.stage && (
            <p className="notice">
              Ліцензія збережена. Досягни QA Lead у цій кар’єрі, щоб обрати контракт.
            </p>
          )}
        </>
      )}
    </>
  );
}
