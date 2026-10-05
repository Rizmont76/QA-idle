import { useState } from "react";
import type { CareerAction, CareerState } from "../types";
import { CAREER_STAGES } from "../game/career/content";
import { PROJECTS } from "../game/career/expansionData";
import { PRODUCTS } from "../game/career/productData";
import type { ProductDefinition } from "../game/career/productData";
import { productUnlocked } from "../game/career/products";
import {
  MARKET,
  PRODUCT_MODES,
  marketStrength,
  productActive,
  productBoost,
  productIncome,
  productMode,
  royaltyRate,
  toolStrength,
} from "../game/career/productEffects";
import { cash, number } from "./careerUtils";
import { SectionTitle } from "./CareerWidgets";

const PERCENT = 100;
interface Props {
  game: CareerState;
  send: (action: CareerAction) => void;
  projects: () => void;
}
function ProductCard({
  game: s,
  def,
  send,
  projects,
}: Props & { def: ProductDefinition }) {
  const owned = (s.products.releases[def.id] ?? 0) > 0;
  const unlocked = productUnlocked(s, def);
  const active = productActive(s, def);
  const mode = productMode(s, def.id);
  const project = PROJECTS.find((p) => p.id === def.project);
  const strength = toolStrength(s, def);
  const affordable = s.money >= def.cost && s.insights >= def.insights;
  return (
    <article className={`panel product-card product-${def.color}`} aria-label={def.title}>
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
          {owned ? "ТВІЙ ІНСТРУМЕНТ" : "НОВА МОЖЛИВІСТЬ"}
        </span>
      </div>
      <div className="product-card-body">
        <div className="product-card-title">
          <h3>{def.title}</h3>
          <span className={active ? "mint" : "muted"}>
            {owned ? (active ? "● Працює" : "◌ Очікує рангу") : "○ Ідея"}
          </span>
        </div>
        <p className="product-tagline">{def.tagline}</p>
        <p className="muted product-story">{def.story}</p>
        {owned ? (
          <>
            {!active && (
              <p className="tiny muted">
                Усі ефекти відновляться на {CAREER_STAGES[def.stage]?.title}. Роль можна
                обрати зараз.
              </p>
            )}
            <div className="eyebrow">ОБЕРИ ОДНУ РОЛЬ</div>
            <div className="product-roles" role="group" aria-label={`Роль ${def.title}`}>
              {PRODUCT_MODES.map((option) => (
                <button
                  key={option.id}
                  aria-pressed={mode === option.id}
                  aria-label={`${def.title}: ${option.title}`}
                  className={mode === option.id ? "selected" : ""}
                  onClick={() => {
                    send({ type: "productMode", id: def.id, mode: option.id });
                  }}
                >
                  <span>
                    {option.symbol} {option.title}
                  </span>
                  <strong>
                    {option.id === "license"
                      ? `${cash(def.income * marketStrength(s))} / с`
                      : option.id === "internal"
                        ? `+${number(strength * PERCENT)}% роботи проєктів`
                        : `+${number(strength * MARKET.insightShare * PERCENT)}% інсайтів`}
                  </strong>
                </button>
              ))}
            </div>
            <p className="product-role-note">
              {mode === "license"
                ? "Продаж ліцензій приносить гроші, також офлайн. Цей інструмент зараз не прискорює проєкти й не додає інсайтів."
                : mode === "internal"
                  ? "Команда використовує інструмент у поточному проєкті. Робота рухається швидше; ліцензійний дохід цього продукту вимкнено."
                  : "Спільнота допомагає дослідженням. Більше інсайтів із нових проєктів і контрактів; ліцензійний дохід вимкнено. Прийняті раніше завдання зберігають свою нагороду."}
            </p>
            <div className="product-current-income">
              <span>Гроші від цього продукту зараз</span>
              <strong>{cash(productIncome(s, def))} / с</strong>
            </div>
          </>
        ) : (
          <>
            <div className="product-next">
              <span>ЗАПУСК БЕЗ ОЧІКУВАННЯ</span>
              <strong>{cash(def.income * marketStrength(s))} / с</strong>
            </div>
            <p className="tiny muted">
              Або +{number(strength * PERCENT)}% роботи проєктів / +
              {number(strength * MARKET.insightShare * PERCENT)}% інсайтів — ти обираєш.
            </p>
            <div className="product-requirements">
              <span className={s.stage >= def.stage ? "mint" : "muted"}>
                {s.stage >= def.stage ? "✓" : "◇"} {CAREER_STAGES[def.stage]?.title}
              </span>
              <button className="text-button" onClick={projects}>
                {(s.certificates[def.project] ?? 0) > 0 ? "✓" : "◇"} Перший сертифікат ·{" "}
                {project?.title} ↗
              </button>
            </div>
            <div className="product-investment">
              <span>{cash(def.cost)}</span>
              <span className="mint">{def.insights} ◈</span>
            </div>
            <button
              className="button primary full"
              aria-label={`Запустити ${def.title}`}
              disabled={!unlocked || !affordable}
              onClick={() => {
                send({ type: "launchProduct", id: def.id });
              }}
            >
              {!unlocked
                ? "Виконай умови запуску"
                : !affordable
                  ? "Накопичуй інвестицію"
                  : "Запустити й обрати роль →"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
export function CareerProducts({ game: s, send, projects }: Props) {
  const [filter, setFilter] = useState<"all" | "owned" | "available">("all");
  const owned = PRODUCTS.filter((p) => (s.products.releases[p.id] ?? 0) > 0).length;
  const list = PRODUCTS.filter(
    (p) =>
      filter === "all" ||
      (filter === "owned"
        ? (s.products.releases[p.id] ?? 0) > 0
        : !(s.products.releases[p.id] ?? 0) && productUnlocked(s, p)),
  );
  return (
    <>
      <section className="panel product-hero">
        <div>
          <div className="eyebrow">ТВОЯ СТУДІЯ · ТВОЯ СТРАТЕГІЯ</div>
          <h2>
            Гроші. Швидкість.
            <br />
            Або нові знання<span className="mint">.</span>
          </h2>
          <p>
            Клієнтські проєкти відкривають інструменти. Ти вирішуєш, що кожен із них
            робить для компанії. Роль можна змінити будь-коли.
          </p>
          <button className="text-button" onClick={projects}>
            Наступний клієнт → новий інструмент →
          </button>
        </div>
        <div className="product-hero-mark" aria-hidden="true">
          <span>⌘</span>
          <i>EARN</i>
          <i>BUILD</i>
          <i>LEARN</i>
        </div>
      </section>
      {s.products.refund && (
        <section className="notice" aria-label="Повернення інвестицій">
          <div>
            <strong>Очікування прибрано. Інвестиції повернено.</strong>
            <p>
              За старі версії та незавершену розробку: {cash(s.products.refund.money)} і{" "}
              {number(s.products.refund.insights)} ◈. Власні продукти збережено — обери
              їхню роль.
            </p>
          </div>
          <button
            className="button ghost"
            onClick={() => {
              send({ type: "dismissProductRefund" });
            }}
          >
            Зрозуміло
          </button>
        </section>
      )}
      <section className="product-portfolio" aria-label="Портфоліо продуктів">
        <div>
          <span>ВЛАСНІ ІНСТРУМЕНТИ</span>
          <strong>
            {owned}
            <small> / {PRODUCTS.length}</small>
          </strong>
          <p>Залишаються після престижу</p>
        </div>
        <div>
          <span>КЛІЄНТИ СТУДІЇ</span>
          <strong>
            {s.products.clients}
            <small> / {MARKET.clients}</small>
          </strong>
          <p>×{number(marketStrength(s))} сила продуктів</p>
        </div>
        <div>
          <span>ЛІЦЕНЗІЙНИЙ ДОХІД</span>
          <strong className="mint">
            {cash(royaltyRate(s))}
            <small> / с</small>
          </strong>
          <p>За весь час: {cash(s.products.earned)}</p>
        </div>
      </section>
      <div className="products-shortcut">
        <span>↯ +{number(productBoost(s, "internal") * PERCENT)}% роботи проєктів</span>
        <span>
          ◈ +{number(productBoost(s, "open") * PERCENT)}% інсайтів нових завдань
        </span>
      </div>
      <p className="product-market-note">
        Після першого запуску кожен завершений контракт приводить +1 клієнта, кожен новий
        сертифікат — +10. Клієнти підсилюють усі твої інструменти. Саме проходження
        кампанії розвиває бізнес.
      </p>
      <SectionTitle
        eyebrow="6 ІНСТРУМЕНТІВ · РІЗНІ СПОСОБИ ГРАТИ"
        title="Портфель студії"
      >
        <div className="filter-group" role="group" aria-label="Фільтр продуктів">
          {(
            [
              ["all", "Усі"],
              ["available", "Доступні"],
              ["owned", "Мої"],
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
              ? "Перший інструмент ще попереду."
              : "Наступний інструмент відкриється через кампанію."}
          </h3>
          <button className="button ghost" onClick={projects}>
            До проєктів →
          </button>
        </div>
      )}
      <div className="product-grid">
        {list.map((def) => (
          <ProductCard key={def.id} game={s} send={send} projects={projects} def={def} />
        ))}
      </div>
      <p className="product-footnote muted">
        Продукти й клієнти залишаються після нової кар’єри; ефекти повертаються на
        базовому ранзі продукту. Для ліцензійного доходу офлайн діють ліміт часу та
        ефективність команди.
      </p>
    </>
  );
}
