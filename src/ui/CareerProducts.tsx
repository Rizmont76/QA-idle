import { useState } from "react";
import type { CareerAction, CareerState } from "../types";
import { CAREER_STAGES } from "../game/career/content";
import { PROJECTS } from "../game/career/expansionData";
import { PRODUCTS, PRODUCT_RULES as P } from "../game/career/productData";
import type { ProductDefinition } from "../game/career/productData";
import {
  developmentTerms,
  productIncome,
  productReady,
  productTerms,
  productUnlocked,
  royaltyRate,
} from "../game/career/products";
import { CERTIFICATION_NAMES } from "./CareerProjects";
import { cash, clockTime, number } from "./careerUtils";
import { Meter, SectionTitle } from "./CareerWidgets";

interface Props {
  game: CareerState;
  send: (action: CareerAction) => void;
  projects: () => void;
  cancelProduct: () => void;
}
function ProductCard({
  game: s,
  def,
  send,
  projects,
}: Omit<Props, "cancelProduct"> & { def: ProductDefinition }) {
  const version = s.products.releases[def.id] ?? 0;
  const complete = version >= P.versions;
  const next = productTerms(def, Math.min(P.versions, version + 1));
  const unlocked = !complete && productUnlocked(s, def, next.version);
  const certificate = s.certificates[def.project] ?? 0;
  const project = PROJECTS.find((p) => p.id === def.project);
  const active = s.products.development?.id === def.id;
  const income = productIncome(s, def);
  const affordable = s.money >= next.cost && s.insights >= next.insights;
  return (
    <article
      className={`panel product-card product-${def.color} ${version > 0 ? "product-owned" : ""}`}
      aria-label={def.title}
    >
      <div className="product-cover" aria-hidden="true">
        <div className="product-app-icon">{def.symbol}</div>
        <div className="product-preview">
          <div className="product-window">
            <i />
            <i />
            <i />
            <span>{def.title}</span>
          </div>
          <div className="product-preview-body">
            <span>{def.symbol}</span>
            <div>
              <i />
              <i />
              <i />
            </div>
            <b>✓</b>
          </div>
        </div>
        <span className="product-version">
          {version > 0 ? `v${String(version)}.0` : "КОНЦЕПТ"}
        </span>
      </div>
      <div className="product-card-body">
        <div className="product-card-title">
          <h3>{def.title}</h3>
          <span className={income > 0 ? "mint" : "muted"}>
            {version > 0 ? (income > 0 ? "● Працює" : "◌ Очікує рангу") : "○ Ідея"}
          </span>
        </div>
        <p className="product-tagline">{def.tagline}</p>
        <p className="muted product-story">{def.story}</p>
        <ol className="product-versions" aria-label={`Версії ${def.title}`}>
          {def.releases.map((label, index) => (
            <li
              key={label}
              className={
                version > index
                  ? "released"
                  : active && next.version === index + 1
                    ? "developing"
                    : ""
              }
            >
              <span>{version > index ? "✓" : `v${String(index + 1)}`}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>
        {version > 0 && (
          <div className="product-current-income">
            <span>Дохід продукту</span>
            <strong>{cash(income)} / с</strong>
          </div>
        )}
        {version > 0 && income === 0 && (
          <p className="tiny muted">
            Дохід відновиться на {CAREER_STAGES[def.stage]?.title}. Випущена версія
            збережена.
          </p>
        )}
        {complete ? (
          <div className="product-mastered">
            ✦ Усі версії випущено · продукт у твоєму портфоліо назавжди
          </div>
        ) : (
          <>
            <div className="product-next">
              <span>РЕЛІЗ v{next.version}.0</span>
              <strong>{cash(next.income)} / с</strong>
            </div>
            <div className="product-requirements">
              <span className={s.stage >= next.stage ? "mint" : "muted"}>
                {s.stage >= next.stage ? "✓" : "◇"} {CAREER_STAGES[next.stage]?.title}
              </span>
              <button
                className={`text-button ${certificate >= next.version ? "mint" : ""}`}
                onClick={projects}
              >
                {certificate >= next.version ? "✓" : "◇"}{" "}
                {CERTIFICATION_NAMES[next.version - 1]} · {project?.title} ↗
              </button>
            </div>
            <p className="tiny muted">
              {number(next.target)} нових багів · від {clockTime(next.seconds)}
            </p>
            <div className="product-investment">
              <span className={s.money >= next.cost ? "" : "muted"}>
                {cash(next.cost)}
              </span>
              <span className={s.insights >= next.insights ? "mint" : "muted"}>
                {number(next.insights)} ◈
              </span>
            </div>
            <button
              className="button primary full"
              aria-label={`Розробити ${def.title} v${String(next.version)}.0`}
              disabled={!unlocked || !affordable || !!s.products.development}
              onClick={() => {
                send({ type: "developProduct", id: def.id });
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              {active
                ? "Розробка триває ↑"
                : s.products.development
                  ? "Розробка зайнята"
                  : !unlocked
                    ? "Виконай умови релізу"
                    : !affordable
                      ? "Накопичуй інвестицію"
                      : `Розробити v${String(next.version)}.0 →`}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
export function CareerProducts({ game: s, send, projects, cancelProduct }: Props) {
  const [filter, setFilter] = useState<"all" | "owned" | "available">("all");
  const [launched, setLaunched] = useState<{ id: string; version: number } | null>(null);
  const launchedDef = PRODUCTS.find((p) => p.id === launched?.id);
  const published = PRODUCTS.filter((p) => (s.products.releases[p.id] ?? 0) > 0).length;
  const versions = PRODUCTS.reduce(
    (total, p) => total + (s.products.releases[p.id] ?? 0),
    0,
  );
  const active = s.products.development;
  const activeDef = PRODUCTS.find((p) => p.id === active?.id);
  const terms = developmentTerms(active);
  const ready = productReady(s);
  const list = PRODUCTS.filter(
    (p) =>
      filter === "all" ||
      (filter === "owned"
        ? (s.products.releases[p.id] ?? 0) > 0
        : productUnlocked(s, p, (s.products.releases[p.id] ?? 0) + 1)),
  );
  return (
    <>
      <section className="panel product-hero">
        <div>
          <div className="eyebrow">ВІД ДОСВІДУ ДО ВЛАСНОГО ПРОДУКТУ</div>
          <h2>
            Тепер працюють
            <br />
            твої ідеї<span className="mint">.</span>
          </h2>
          <p>
            Створи інструменти, якими користуватимуться інші студії. Кожен реліз — нове
            джерело доходу.
          </p>
          <button className="text-button" onClick={projects}>
            Сертифікати відкривають нові версії →
          </button>
        </div>
        <div className="product-hero-mark" aria-hidden="true">
          <span>⌘</span>
          <i>BUILD</i>
          <i>TEST</i>
          <i>SHIP</i>
        </div>
      </section>
      <section className="product-portfolio" aria-label="Портфоліо продуктів">
        <div>
          <span>ВИПУЩЕНО ПРОДУКТІВ</span>
          <strong>
            {published}
            <small> / {PRODUCTS.length}</small>
          </strong>
          <p>
            {versions} / {PRODUCTS.length * P.versions} релізів
          </p>
        </div>
        <div>
          <span>ДОХІД ВІД ПРОДУКТІВ</span>
          <strong className="mint">
            {cash(royaltyRate(s))}
            <small> / с</small>
          </strong>
          <p>Також працює офлайн</p>
        </div>
        <div>
          <span>ЗАРОБЛЕНО ПРОДУКТАМИ</span>
          <strong>{cash(s.products.earned)}</strong>
          <p>За всі твої кар’єри</p>
        </div>
      </section>
      {launched &&
        launchedDef &&
        (s.products.releases[launched.id] ?? 0) >= launched.version && (
          <section className="panel product-launch" aria-label="Продукт випущено">
            <span aria-hidden="true">✦</span>
            <div>
              <div className="eyebrow">ТВОЯ ІДЕЯ ВЖЕ ПРАЦЮЄ</div>
              <h2>
                {launchedDef.title} v{launched.version}.0
              </h2>
              <p>
                {launchedDef.releases[launched.version - 1]} · +
                {cash(productTerms(launchedDef, launched.version).income)} / с
              </p>
            </div>
            <button
              className="button ghost"
              aria-label="Закрити повідомлення про реліз"
              onClick={() => {
                setLaunched(null);
              }}
            >
              Чудово ✓
            </button>
          </section>
        )}
      {active && activeDef && terms && (
        <section className="panel product-development" aria-label="Активна розробка">
          <div className="product-development-heading">
            <div>
              <div className="eyebrow">
                {ready ? "УСІ ПЕРЕВІРКИ ПРОЙДЕНО" : "ЛАБОРАТОРІЯ ПРОДУКТУ"}
              </div>
              <h2>
                {activeDef.title} <span className="muted">v{active.version}.0</span>
              </h2>
              <p>{activeDef.releases[active.version - 1]}</p>
            </div>
            <span className={`status-pill ${ready ? "mint" : ""}`}>
              {ready ? "✓ Готовий до релізу" : "◌ Розробка триває"}
            </span>
          </div>
          <div className="product-development-progress">
            <div>
              <div>
                <span>Перевірено нових багів</span>
                <strong>
                  {number(active.progress)} / {number(terms.target)}
                </strong>
              </div>
              <Meter
                value={active.progress}
                max={terms.target}
                label="Перевірки продукту"
              />
            </div>
            <div>
              <div>
                <span>Підготовка релізу</span>
                <strong>
                  {clockTime(active.elapsed)} / {clockTime(terms.seconds)}
                </strong>
              </div>
              <Meter
                value={active.elapsed}
                max={terms.seconds}
                label="Час розробки продукту"
              />
            </div>
          </div>
          <div className="product-development-actions">
            <div>
              <strong className="mint">{cash(terms.income)} / с після релізу</strong>
              <p className="tiny muted">
                {(s.products.releases[active.id] ?? 0) > 0
                  ? "Попередня версія продовжує заробляти."
                  : "Команда й ручні перевірки наближають реліз."}
              </p>
            </div>
            <button
              className="button primary"
              disabled={!ready}
              onClick={() => {
                setLaunched({ id: active.id, version: active.version });
                send({ type: "publishProduct" });
              }}
            >
              Випустити продукт ↗
            </button>
            <button className="text-button" onClick={cancelProduct}>
              Скасувати розробку
            </button>
          </div>
        </section>
      )}
      <SectionTitle eyebrow="ВЛАСНІ ІНСТРУМЕНТИ · 18 РЕЛІЗІВ" title="Каталог продуктів">
        <div className="filter-group" role="group" aria-label="Фільтр продуктів">
          {(
            [
              ["all", "Усі"],
              ["available", "Доступні"],
              ["owned", "Випущені"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? "selected" : ""}
              aria-pressed={filter === id}
              onClick={() => {
                setFilter(id);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </SectionTitle>
      {list.length === 0 && (
        <div className="panel product-empty">
          <h3>
            {filter === "owned"
              ? "Перший реліз ще попереду."
              : "Наступна ідея чекає на досвід."}
          </h3>
          <p className="muted">
            Завершуй проєкти й збирай сертифікати. Перший продукт відкриється на Senior
            QA.
          </p>
          <button className="button ghost" onClick={projects}>
            До проєктів →
          </button>
        </div>
      )}
      <div className="product-grid">
        {list.map((def) => (
          <ProductCard key={def.id} def={def} game={s} send={send} projects={projects} />
        ))}
      </div>
      <p className="product-footnote muted">
        Випущені продукти залишаються після нової кар’єри. Їхній дохід відновлюється на
        початковому ранзі продукту. Офлайн діють ліміт часу та ефективність твоєї команди.
      </p>
    </>
  );
}
