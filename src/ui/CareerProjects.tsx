import { useState } from "react";
import type { CareerAction, CareerProject, CareerState } from "../types";
import { CAREER_STAGES } from "../game/career/content";
import { PROJECTS, SPECIALISTS, STUDIO_RULES as S } from "../game/career/expansionData";
import {
  certificates,
  projectPhase,
  projectQuote,
  projectRank,
  projectReady,
  projectUnlocked,
} from "../game/career/studioSelectors";
import { cash, clockTime, number } from "./careerUtils";
import { Meter, SectionTitle } from "./CareerWidgets";

const RANK_DIGITS = 2;
export const CERTIFICATION_NAMES = ["Бронза", "Срібло", "Золото"] as const;
interface Props {
  game: CareerState;
  send: (action: CareerAction) => void;
  cancelProject: () => void;
  studio: () => void;
}
export function CareerProjects({ game: s, send, cancelProject, studio }: Props) {
  const [filter, setFilter] = useState<"all" | "available" | "completed">("all");
  const [completed, setCompleted] = useState<CareerProject | null>(null);
  const completedDef = PROJECTS.find((p) => p.id === completed?.id);
  const count = certificates(s);
  const active = s.project;
  const activeDef = PROJECTS.find((p) => p.id === active?.id);
  const phase = active ? projectPhase(active) : null;
  const ready = projectReady(s);
  const list = PROJECTS.filter(
    (p) =>
      filter === "all" ||
      (filter === "available" ? projectUnlocked(s, p) : (s.certificates[p.id] ?? 0) > 0),
  );
  return (
    <>
      <section className="panel expansion-hero project-hero">
        <div>
          <div className="eyebrow">КАМПАНІЯ · 9 ІСТОРІЙ</div>
          <h2>
            {count === PROJECTS.length
              ? "Твоя студія залишила свій слід."
              : "Чужі релізи. Твоя історія."}
          </h2>
          <p>
            {count === PROJECTS.length
              ? "Усі клієнти отримали свої релізи. Підкорюй золоті сертифікації або почни наступну кар’єру зі знаннями, які вже ніхто не забере."
              : "Від кнопки маленької крамниці до власної платформи. Виконуй проєкти, збирай портфоліо й запрошуй фахівців у студію."}
          </p>
        </div>
        <div className="hero-score">
          <strong>
            {count}
            <span>/{PROJECTS.length}</span>
          </strong>
          <span>проєктів у портфоліо</span>
          <Meter value={count} max={PROJECTS.length} label="Прогрес кампанії" />
          <button className="text-button" onClick={studio}>
            {number(s.insights)} ◈ інсайтів → Студія
          </button>
        </div>
      </section>
      {completed &&
        completedDef &&
        (s.certificates[completed.id] ?? 0) > completed.tier && (
          <section className="panel project-completion" aria-label="Проєкт завершено">
            <div className="completion-seal" aria-hidden="true">
              ✓
            </div>
            <div>
              <div className="eyebrow">
                РЕЛІЗ ВІДБУВСЯ · {CERTIFICATION_NAMES[completed.tier]}
              </div>
              <h2>{completedDef.title}</h2>
              <p>{completedDef.ending}</p>
              <div className="completion-rewards">
                <strong>+{cash(completed.reward)}</strong>
                <strong>+{number(completed.insights)} ◈ інсайтів</strong>
                <span>Сертифікат у портфоліо</span>
              </div>
              <div className="completion-actions">
                <button className="button primary" onClick={studio}>
                  До студії →
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setCompleted(null);
                  }}
                >
                  Продовжити кампанію
                </button>
              </div>
            </div>
          </section>
        )}
      {active && activeDef && phase && (
        <section
          className={`panel project-active ${ready ? "is-ready" : ""}`}
          aria-label="Активний проєкт"
        >
          <div className="panel-topline">
            <span className="live-badge">
              {ready ? "✓ Етап готовий до здачі" : "● Команда працює"}
            </span>
            <span className="certificate-tag">{CERTIFICATION_NAMES[active.tier]}</span>
          </div>
          <div className="eyebrow">{activeDef.client}</div>
          <h2>{activeDef.title}</h2>
          <ol className="phase-track">
            {activeDef.phases.map((p, i) => (
              <li
                className={
                  i === active.phase ? "current" : i < active.phase ? "complete" : ""
                }
                key={p.title}
              >
                <span>{i < active.phase ? "✓" : i + 1}</span>
                <strong>{p.title}</strong>
              </li>
            ))}
          </ol>
          <div className="phase-body">
            <div>
              <div className="eyebrow">
                ЕТАП {active.phase + 1} / {S.phases}
              </div>
              <h3>{phase.title}</h3>
              <p>{phase.brief}</p>
              <div className="project-meters">
                <div>
                  <div className="row-label">
                    <span>Нові баги</span>
                    <strong>
                      {number(active.progress)} / {number(phase.target)}
                    </strong>
                  </div>
                  <Meter
                    value={active.progress}
                    max={phase.target}
                    label="Баги для етапу"
                  />
                </div>
                <div>
                  <div className="row-label">
                    <span>Час перевірки</span>
                    <strong>
                      {clockTime(active.elapsed)} / {clockTime(phase.seconds)}
                    </strong>
                  </div>
                  <Meter value={active.elapsed} max={phase.seconds} label="Час етапу" />
                </div>
              </div>
            </div>
            <div className="project-claim">
              <span className="tiny muted">За всі три етапи</span>
              <strong>{cash(active.reward)}</strong>
              <span className="insight-text">+{number(active.insights)} ◈ інсайтів</span>
              <button
                className="button primary full"
                disabled={!ready}
                onClick={() => {
                  if (active.phase === S.phases - 1) {
                    setCompleted(active);
                  }
                  send({ type: "submitProject" });
                }}
              >
                {active.phase === S.phases - 1 ? "Завершити проєкт" : "Здати етап"}
              </button>
              <button className="text-button" onClick={cancelProject}>
                Скасувати проєкт
              </button>
            </div>
          </div>
          <p className="tiny muted">
            Ручні тести й команда допомагають одночасно проєкту та контракту. Готовий етап
            чекатиме на твоє рішення.
          </p>
        </section>
      )}
      <SectionTitle eyebrow="ВІД ПЕРШОГО КЛІЄНТА ДО ВЛАСНОЇ СТУДІЇ" title="Твої проєкти">
        <div className="text-tabs">
          {(
            [
              { id: "all", label: "Усі" },
              { id: "available", label: "Доступні" },
              { id: "completed", label: "Портфоліо" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              aria-pressed={filter === t.id}
              onClick={() => {
                setFilter(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </SectionTitle>
      <div className="project-grid">
        {list.map((def) => {
          const index = PROJECTS.indexOf(def);
          const tier = s.certificates[def.id] ?? 0;
          const unlocked = projectUnlocked(s, def);
          const complete = tier >= S.tiers;
          const current = active?.id === def.id;
          const quote = projectQuote(s, def);
          const nextRank = CAREER_STAGES[projectRank(def, tier)]?.title;
          const previous = PROJECTS[index - 1];
          const previousMissing = previous && !(s.certificates[previous.id] ?? 0);
          const specialist = SPECIALISTS.find((p) => p.project === def.id);
          return (
            <article
              className={`panel project-card tone-${def.color} ${current ? "current" : ""}`}
              key={def.id}
            >
              <div className="project-card-heading">
                <span className="chapter-number">
                  {String(index + 1).padStart(RANK_DIGITS, "0")}
                </span>
                <span className="eyebrow">{def.genre}</span>
                <span className="tiny muted">{CAREER_STAGES[def.stage]?.title}</span>
              </div>
              <h3>{def.title}</h3>
              <p className="project-client">{def.client}</p>
              <p className="project-brief">{def.brief}</p>
              <div className="certificate-row" aria-label={`Сертифікати ${def.title}`}>
                {CERTIFICATION_NAMES.map((name, i) => (
                  <span className={tier > i ? `earned tier-${String(i)}` : ""} key={name}>
                    {tier > i ? "✓" : "◇"} {name}
                  </span>
                ))}
              </div>
              {tier > 0 && (
                <details className="project-story">
                  <summary>Історія твого релізу</summary>
                  <p>{def.ending}</p>
                </details>
              )}
              {specialist && (
                <div className="recruit-teaser">
                  <span className={`staff-avatar small tone-${specialist.color}`}>
                    {specialist.initials}
                  </span>
                  <span>
                    {tier > 0
                      ? `${specialist.name} — у твоїй студії`
                      : `Перший сертифікат: ${specialist.name}`}
                    <small>
                      {specialist.role} · {specialist.description}
                    </small>
                  </span>
                </div>
              )}
              {!complete && (
                <div className="project-rewards">
                  <span>{cash(quote.reward)}</span>
                  <span>+{number(quote.insights)} ◈</span>
                  <span>{CERTIFICATION_NAMES[tier]}</span>
                </div>
              )}
              <button
                className={`button full ${unlocked && !active ? "primary" : "ghost"}`}
                disabled={complete || !!active || !unlocked}
                onClick={() => {
                  setCompleted(null);
                  send({ type: "startProject", id: def.id });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-label={`Почати ${def.title}`}
              >
                {current
                  ? "Зараз у роботі"
                  : complete
                    ? "✓ Усі сертифікати отримано"
                    : previousMissing
                      ? `Спершу: ${previous.title}`
                      : s.stage < projectRank(def, tier)
                        ? `Потрібен ${nextRank ?? "наступний ранг"}`
                        : active
                          ? "Заверши активний проєкт"
                          : tier > 0
                            ? `Пройти на ${CERTIFICATION_NAMES[tier] ?? "наступний рівень"}`
                            : "Почати проєкт →"}
              </button>
            </article>
          );
        })}
      </div>
      {!list.length && (
        <div className="empty-state">
          {filter === "completed"
            ? "Перший сертифікат стане початком твого портфоліо."
            : "Підвищуйся та заверши попередній проєкт, щоб відкрити наступний."}
        </div>
      )}
    </>
  );
}
