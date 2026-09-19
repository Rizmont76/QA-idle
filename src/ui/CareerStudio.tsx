import { useState } from "react";
import type { CareerAction, CareerState } from "../types";
import {
  PROJECTS,
  RESEARCH,
  SPECIALISTS,
  STUDIO_RULES as S,
} from "../game/career/expansionData";
import {
  recruited,
  researchCost,
  researchUnlocked,
  specialistSlots,
} from "../game/career/studioSelectors";
import { offlineCap, offlineEfficiency } from "../game/career/selectors";
import { Meter, SectionTitle } from "./CareerWidgets";
import { duration, number } from "./careerUtils";

const PERCENT = 100;
const BRANCHES = [
  {
    id: "engineering",
    title: "Інженерія",
    subtitle: "Потужність і стабільність",
    symbol: "⌘",
  },
  {
    id: "discovery",
    title: "Дослідження",
    subtitle: "Знаходь більше. Дізнавайся швидше.",
    symbol: "⌕",
  },
  {
    id: "business",
    title: "Лідерство",
    subtitle: "Знання, які працюють на команду",
    symbol: "↗",
  },
] as const;
export function CareerStudio({
  game: s,
  send,
  projects,
}: {
  game: CareerState;
  send: (a: CareerAction) => void;
  projects: () => void;
}) {
  const [tab, setTab] = useState<"research" | "specialists">("research");
  const slots = specialistSlots(s);
  const levels = Object.values(s.research).reduce((a, b) => a + b, 0);
  const maxLevels = RESEARCH.reduce((a, r) => a + r.max, 0);
  return (
    <>
      <section className="panel expansion-hero studio-hero">
        <div>
          <div className="eyebrow">ТВОЯ ПОСТІЙНА ПЕРЕВАГА</div>
          <h2>
            Кар’єри змінюються.
            <br />
            Досвід команди залишається.
          </h2>
          <p>
            Інсайти з проєктів і контрактів відкривають дослідження. Фахівці підсилюють
            обраний стиль гри. Усе в студії зберігається після престижу.
          </p>
          <button className="text-button" onClick={projects}>
            Заробити інсайти в проєктах →
          </button>
        </div>
        <div className="hero-score insight-wallet">
          <span className="insight-gem" aria-hidden="true">
            ◈
          </span>
          <strong data-testid="insights">{number(s.insights)}</strong>
          <span>інсайтів для досліджень</span>
          <small>Отримано за весь час: {number(s.lifetimeInsights)}</small>
        </div>
      </section>
      {s.bestStage < S.unlockStage && (
        <div className="notice">
          Студія відкриється на Middle QA. Перший проєкт принесе інсайти та запросить
          Марту в команду.
        </div>
      )}
      <div className="studio-tabs">
        <div className="buy-toggle" aria-label="Розділ студії">
          <button
            aria-pressed={tab === "research"}
            onClick={() => {
              setTab("research");
            }}
          >
            Дослідження{" "}
            <span>
              {levels}/{maxLevels}
            </span>
          </button>
          <button
            aria-pressed={tab === "specialists"}
            onClick={() => {
              setTab("specialists");
            }}
          >
            Фахівці{" "}
            <span>
              {s.specialists.length}/{slots}
            </span>
          </button>
        </div>
        <span className="tiny muted">
          Офлайн: {duration(offlineCap(s))} · {number(offlineEfficiency(s) * PERCENT)}%
          ефективності
        </span>
      </div>
      {tab === "research" ? (
        <div className="research-branches">
          {BRANCHES.map((branch) => (
            <section className={`research-branch branch-${branch.id}`} key={branch.id}>
              <header>
                <span>{branch.symbol}</span>
                <div>
                  <h2>{branch.title}</h2>
                  <p>{branch.subtitle}</p>
                </div>
              </header>
              {RESEARCH.filter((r) => r.branch === branch.id).map((def) => {
                const level = s.research[def.id] ?? 0;
                const unlocked = researchUnlocked(s, def);
                const cost = researchCost(s, def);
                const full = level >= def.max;
                const dependency = RESEARCH.find((r) => r.id === def.requires?.id);
                return (
                  <article
                    className={`panel research-card ${!unlocked ? "locked" : ""} ${full ? "complete" : ""}`}
                    key={def.id}
                  >
                    <div className="panel-topline">
                      <span className="eyebrow">ПОСТІЙНЕ ДОСЛІДЖЕННЯ</span>
                      <strong>
                        {level}/{def.max}
                      </strong>
                    </div>
                    <h3>{def.title}</h3>
                    <p>{def.description}</p>
                    <Meter value={level} max={def.max} label={`Рівень ${def.title}`} />
                    {dependency && (
                      <p className={`research-dependency ${unlocked ? "satisfied" : ""}`}>
                        {unlocked ? "✓" : "◇"} {dependency.title} · рівень{" "}
                        {def.requires?.level}
                      </p>
                    )}
                    <button
                      className={`button full ${unlocked && !full && s.insights >= cost ? "primary" : "ghost"}`}
                      disabled={!unlocked || full || s.insights < cost}
                      aria-label={`Дослідити ${def.title}`}
                      onClick={() => {
                        send({ type: "research", id: def.id });
                      }}
                    >
                      <span>
                        {full
                          ? "✓ Завершено"
                          : !unlocked
                            ? "Спочатку передумови"
                            : "Дослідити"}
                      </span>
                      {!full && <strong>{number(cost)} ◈</strong>}
                    </button>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      ) : (
        <>
          <section className="panel assignment-panel">
            <div>
              <div className="eyebrow">АКТИВНА КОМАНДА</div>
              <h2>
                {s.specialists.length} / {slots} фахівців
              </h2>
              <p>
                Призначай під поточну ціль. Щоб змінити склад, спочатку переведи когось у
                резерв.
              </p>
            </div>
            <div className="assignment-slots">
              {Array.from({ length: slots }, (_, i) => {
                const specialist = SPECIALISTS.find((p) => p.id === s.specialists[i]);
                return (
                  <div
                    className={`assignment-slot ${specialist ? "occupied" : ""}`}
                    key={i}
                  >
                    {specialist ? (
                      <>
                        <span className={`staff-avatar tone-${specialist.color}`}>
                          {specialist.initials}
                        </span>
                        <strong>{specialist.name}</strong>
                        <small>{specialist.role}</small>
                      </>
                    ) : (
                      <>
                        <span className="staff-avatar">+</span>
                        <span>Вільне місце</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          <SectionTitle eyebrow="ЗАПРОШУЙ ЧЕРЕЗ ПРОЄКТИ" title="Люди твоєї студії" />
          <div className="specialist-grid">
            {SPECIALISTS.map((def) => {
              const unlocked = recruited(s, def.id);
              const active = s.specialists.includes(def.id);
              const project = PROJECTS.find((p) => p.id === def.project);
              return (
                <article
                  className={`panel specialist-card tone-${def.color} ${active ? "assigned" : ""}`}
                  key={def.id}
                >
                  <div className="specialist-heading">
                    <span className={`staff-avatar large tone-${def.color}`}>
                      {def.initials}
                    </span>
                    <div>
                      <div className="eyebrow">{def.role}</div>
                      <h3>{def.name}</h3>
                    </div>
                    {active && <span className="live-badge">У команді</span>}
                  </div>
                  <blockquote>{def.quote}</blockquote>
                  <p className="specialist-effect">{def.description}</p>
                  <p className="tiny muted">
                    {unlocked
                      ? "Запрошення прийнято. Бонус діє, коли фахівець у команді."
                      : `Потрібен перший сертифікат: «${project?.title ?? "проєкт"}».`}
                  </p>
                  <button
                    className={`button full ${active ? "ghost" : "primary"}`}
                    disabled={!unlocked || (!active && s.specialists.length >= slots)}
                    onClick={() => {
                      send({ type: "assignSpecialist", id: def.id });
                    }}
                    aria-label={`${active ? "У резерв" : "Призначити"} ${def.name}`}
                  >
                    {active
                      ? "Перевести в резерв"
                      : !unlocked
                        ? "Запросити через проєкт"
                        : s.specialists.length >= slots
                          ? "Усі місця зайняті"
                          : "Призначити в команду"}
                  </button>
                  {!unlocked && (
                    <button className="text-button" onClick={projects}>
                      Переглянути проєкт →
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
