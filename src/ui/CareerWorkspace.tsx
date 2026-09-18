import { useState } from "react";
import type { CareerAction, CareerState, PurchaseMode } from "../types";
import { BULK_PURCHASE_SIZE } from "../types";
import {
  CAREER_RULES as R,
  CAREER_STAGES,
  CAREER_UPGRADES,
  CREW,
  CREW_MILESTONES,
  CONTRACTS,
} from "../game/career/content";
import {
  contractReady,
  crewCount,
  crewRate,
  hasAutoReport,
  hireQuote,
  manualPower,
  nextCrewCost,
  production,
  promotionReady,
  reportValue,
} from "../game/career/selectors";
import { BugIcon, Meter, SectionTitle } from "./CareerWidgets";
import { cash, duration, number } from "./careerUtils";

interface Props {
  game: CareerState;
  send: (a: CareerAction) => void;
  career: () => void;
  cancelContract: () => void;
}
export function CareerWorkspace({ game: s, send, career, cancelContract }: Props) {
  const [mode, setMode] = useState<PurchaseMode>(1);
  const [upgradeTab, setUpgradeTab] = useState<"available" | "owned">("available");
  const [burst, setBurst] = useState(0);
  const next = CAREER_STAGES[s.stage + 1];
  const ready = promotionReady(s);
  const rate = production(s);
  const auto = hasAutoReport(s);
  const upgrades = CAREER_UPGRADES.filter(
    (u) =>
      u.stage <= s.stage &&
      (upgradeTab === "owned" ? s.upgrades.includes(u.id) : !s.upgrades.includes(u.id)),
  );
  const nextLocked = CREW.find((c) => c.stage > s.stage);
  return (
    <>
      <div className="workspace-top">
        <section className="panel testing-panel">
          <div className="panel-topline">
            <span className="eyebrow">ТВОЄ РОБОЧЕ МІСЦЕ</span>
            <span className="live-badge">
              <i /> Спринт у процесі
            </span>
          </div>
          <h2>
            Ще один баг.
            <br />
            <span>Ще крок до підвищення.</span>
          </h2>
          <div className="test-console" aria-hidden="true">
            <div className="console-header">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>release_candidate.test</span>
              <span>v{String(s.stage + 1)}.0</span>
            </div>
            <div className="console-code">
              <p>
                <span className="code-purple">describe</span>(
                <span className="code-amber">'на моїй машині працює'</span>, () =&gt;{" "}
                {"{"}
              </p>
              <p className="indented">
                <span className="code-muted">// перевіримо ще раз</span>
              </p>
              <p className="indented">
                <span className="code-purple">expect</span>(release).
                <span className="code-mint">toBeStable</span>();
              </p>
              <p>
                {"}"}); <span className="cursor">▍</span>
              </p>
            </div>
            <div className="console-footer">
              <span className="code-mint">
                ●{" "}
                {rate > 0
                  ? `${number(rate)} багів/с у фоновому режимі`
                  : "Готово до першого тесту"}
              </span>
              <span>
                {s.manualTests > 0 ? `${number(s.manualTests)} тестів` : "Чекаємо на QA"}
              </span>
            </div>
          </div>
          <div className="test-actions">
            <button
              className="test-button"
              onClick={() => {
                send({ type: "test" });
                setBurst((n) => n + 1);
              }}
            >
              <BugIcon size={29} />
              <span>
                Знайти баг<strong>+{number(manualPower(s))} за тест</strong>
              </span>
              <span className="test-key">↵</span>
              {burst > 0 && (
                <span key={burst} className="click-gain" aria-hidden="true">
                  +{number(manualPower(s))}
                </span>
              )}
            </button>
            <button
              className="button report-button"
              disabled={s.bugs <= 0}
              onClick={() => {
                send({ type: "report" });
              }}
            >
              <span>Здати звіт</span>
              <strong>
                {cash(s.bugs * reportValue(s))} <span>↗</span>
              </strong>
            </button>
          </div>
          <p className="panel-caption">
            {auto
              ? "↻ Автозвіти ввімкнено — дохід надходить сам."
              : "Знаходь баги, здавай звіти й інвестуй у команду."}
          </p>
        </section>
        <section className={`panel promotion-panel ${ready ? "promotion-ready" : ""}`}>
          <div className="panel-topline">
            <span className="eyebrow">НАСТУПНА ВЕЛИКА ЦІЛЬ</span>
            <span className="small-icon">↗</span>
          </div>
          <div className="rank-number">
            0{s.stage + 1}
            <span> / 06</span>
          </div>
          <h2>{next?.title ?? "Нова кар’єра"}</h2>
          <p className="muted">
            {next?.unlock ?? "Перетвори цю кар’єру на постійний бонус до наступної."}
          </p>
          {next ? (
            <div className="requirements">
              <div>
                <div className="row-label">
                  <span>Зароблено за кар’єру</span>
                  <strong>
                    {cash(s.earned)} <em>/ {cash(next.earned)}</em>
                  </strong>
                </div>
                <Meter value={s.earned} max={next.earned} label="Дохід для підвищення" />
              </div>
              <div>
                <div className="row-label">
                  <span>Одиниці команди</span>
                  <strong>
                    {crewCount(s)} <em>/ {next.crew}</em>
                  </strong>
                </div>
                <Meter
                  value={crewCount(s)}
                  max={next.crew}
                  label="Команда для підвищення"
                />
              </div>
              <p className="tiny muted">Витрачені гроші теж враховуються.</p>
            </div>
          ) : (
            <div className="prestige-symbol" aria-hidden="true">
              ∞
            </div>
          )}
          <button
            className={`button full ${ready || !next ? "primary" : "ghost"}`}
            disabled={!!next && !ready}
            onClick={() => {
              if (next) {
                send({ type: "promote" });
              } else {
                career();
              }
            }}
          >
            {next
              ? ready
                ? "Отримати підвищення ↗"
                : "Виконай умови підвищення"
              : "Переглянути престиж →"}
          </button>
        </section>
      </div>
      <section className="team-section" id="team">
        <SectionTitle eyebrow="НЕХАЙ ПРАЦЮЮТЬ ЗА ТЕБЕ" title="Твоя команда">
          <div className="buy-toggle" aria-label="Кількість для покупки">
            {([1, BULK_PURCHASE_SIZE, "max"] as const).map((m) => (
              <button
                key={m}
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                }}
              >
                {m === "max" ? "Макс" : `×${String(m)}`}
              </button>
            ))}
          </div>
        </SectionTitle>
        <div className="crew-grid">
          {CREW.filter((c) => c.stage <= s.stage).map((c) => {
            const quote = hireQuote(s, c.id, mode);
            const milestone = CREW_MILESTONES.find((n) => n > s.crew[c.id]);
            const maxed = s.crew[c.id] >= R.crewLimit;
            return (
              <article className="panel crew-card" key={c.id}>
                <div className="crew-top">
                  <span className={`crew-symbol crew-${c.id}`}>
                    {c.id === "runner"
                      ? "</>"
                      : c.id === "lab"
                        ? "⌬"
                        : c.id === "squad"
                          ? "▦"
                          : "◉"}
                  </span>
                  <div>
                    <div className="eyebrow">{c.tag}</div>
                    <h3>{c.name}</h3>
                  </div>
                  <div className="owned-count">
                    {s.crew[c.id]}
                    <span>у команді</span>
                  </div>
                </div>
                <p className="crew-description">{c.description}</p>
                <div className="crew-production">
                  <strong>+{number(crewRate(s, c.id))}</strong>
                  <span> багів/с</span>
                  <span className="base-rate">від {number(c.rate)}/с за од.</span>
                </div>
                <div className="milestone">
                  <div className="row-label">
                    <span>
                      {milestone
                        ? `×2 ефективність на ${String(milestone)} од.`
                        : "Усі бонуси ефективності відкриті"}
                    </span>
                    <span>
                      {milestone ? `${String(s.crew[c.id])}/${String(milestone)}` : "✓"}
                    </span>
                  </div>
                  <Meter
                    value={s.crew[c.id]}
                    max={milestone ?? R.crewLimit}
                    label={`Бонус ${c.name}`}
                  />
                </div>
                <button
                  className="button hire-button"
                  disabled={!quote.count}
                  aria-label={`Найняти ${c.name}${quote.count ? `: ${String(quote.count)}` : ""}`}
                  onClick={() => {
                    send({ type: "hire", id: c.id, mode });
                  }}
                >
                  <span>
                    {maxed
                      ? "Максимальний рівень"
                      : `Найняти ${quote.count > 1 ? `×${String(quote.count)}` : ""}`}
                  </span>
                  <strong>
                    {maxed ? "✓" : cash(quote.count ? quote.cost : nextCrewCost(s, c.id))}{" "}
                    <span>+</span>
                  </strong>
                </button>
                {!quote.count && !maxed && rate > 0 && (
                  <div className="afford-time">
                    {auto ? "Приблизно через" : "Накопичення багів:"}{" "}
                    {duration(
                      (nextCrewCost(s, c.id) - s.money) / (rate * reportValue(s)),
                    )}
                  </div>
                )}
              </article>
            );
          })}
          {nextLocked && (
            <article className="crew-locked">
              <span className="lock-mark">◇</span>
              <div className="eyebrow">НАСТУПНЕ ВІДКРИТТЯ</div>
              <h3>{nextLocked.name}</h3>
              <p>{CAREER_STAGES[nextLocked.stage]?.title}</p>
              <span>Нова потужність для твоєї команди</span>
            </article>
          )}
        </div>
      </section>
      <section className="upgrades-section">
        <SectionTitle eyebrow="ПРАЦЮЙ РОЗУМНІШЕ" title="Покращення">
          <div className="text-tabs">
            <button
              aria-pressed={upgradeTab === "available"}
              onClick={() => {
                setUpgradeTab("available");
              }}
            >
              Доступні
            </button>
            <button
              aria-pressed={upgradeTab === "owned"}
              onClick={() => {
                setUpgradeTab("owned");
              }}
            >
              Придбані ({s.upgrades.length})
            </button>
          </div>
        </SectionTitle>
        <div className="upgrade-grid">
          {upgrades.map((u) => (
            <article
              className={`upgrade-card ${u.id === "auto" ? "auto-upgrade" : ""}`}
              key={u.id}
            >
              <span className="upgrade-icon">{u.icon}</span>
              <div className="upgrade-copy">
                <h3>
                  {u.title}
                  {u.id === "auto" && <span className="recommended">IDLE</span>}
                </h3>
                <p>{u.description}</p>
              </div>
              <button
                className={`button small ${upgradeTab === "owned" ? "owned" : "ghost"}`}
                disabled={upgradeTab === "owned" || s.money < u.cost}
                onClick={() => {
                  send({ type: "upgrade", id: u.id });
                }}
                aria-label={`Купити ${u.title}`}
              >
                {upgradeTab === "owned" ? "✓" : cash(u.cost)}
              </button>
            </article>
          ))}
        </div>
        {upgrades.length === 0 && (
          <div className="empty-state">
            {upgradeTab === "owned"
              ? "Перше покращення вже чекає у вкладці «Доступні»."
              : "Усе доступне придбано. Нові можливості — після підвищення."}
          </div>
        )}
      </section>
      {s.stage >= R.contractStage && (
        <section>
          <SectionTitle eyebrow="ДОДАТКОВИЙ ВИКЛИК" title="Контракти">
            <span className="muted tiny">Виконано: {s.contractsCompleted}</span>
          </SectionTitle>
          {s.contract ? (
            <article className="panel active-contract">
              <div>
                <span className="live-badge">
                  {contractReady(s) ? "✓ Завершено" : "● У роботі"}
                </span>
                <h3>{s.contract.title}</h3>
                <p className="muted">
                  Нові баги: {number(s.contract.progress)} / {number(s.contract.target)} ·
                  Час: {duration(s.contract.elapsed)} / {duration(s.contract.duration)}
                </p>
                <Meter
                  value={Math.min(
                    s.contract.progress / s.contract.target,
                    s.contract.elapsed / s.contract.duration,
                  )}
                  max={1}
                  label="Виконання контракту"
                />
              </div>
              <div>
                <strong className="contract-reward">{cash(s.contract.reward)}</strong>
                <button
                  className="button primary full"
                  disabled={!contractReady(s)}
                  onClick={() => {
                    send({ type: "claim" });
                  }}
                >
                  Забрати винагороду
                </button>
                <button className="text-button" onClick={cancelContract}>
                  Скасувати контракт
                </button>
              </div>
            </article>
          ) : (
            <div className="contract-grid">
              {CONTRACTS.map((c) => {
                const scale = R.contractScale ** (s.stage - R.contractStage);
                return (
                  <article className="panel" key={c.id}>
                    <span className="eyebrow">
                      {duration(c.duration)} · {number(c.target * scale)} багів
                    </span>
                    <h3>{c.title}</h3>
                    <p className="muted">{c.description}</p>
                    <button
                      className="button ghost full"
                      onClick={() => {
                        send({ type: "contract", id: c.id });
                      }}
                    >
                      <span>Взяти контракт</span>
                      <strong>{cash(c.reward * scale)}</strong>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}
