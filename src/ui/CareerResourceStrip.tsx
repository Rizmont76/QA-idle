import type { CareerState } from "../types";
import { hasAutoReport, production, reportValue } from "../game/career/selectors";
import { royaltyRate } from "../game/career/products";
import { BugIcon } from "./CareerWidgets";
import { cash, number } from "./careerUtils";

export function CareerResourceStrip({ game: s }: { game: CareerState }) {
  const auto = hasAutoReport(s);
  const rate = production(s);
  const royalties = royaltyRate(s);
  return (
    <div className="resource-strip">
      <article className="resource-card">
        <span className="resource-icon mint">$</span>
        <div>
          <span className="resource-label">НА РАХУНКУ</span>
          <strong data-testid="money">{cash(s.money)}</strong>
          <small>
            {auto || royalties > 0
              ? `+${cash((auto ? rate * reportValue(s) : 0) + royalties)} / с`
              : "Здай звіт, щоб отримати гроші"}
          </small>
          {royalties > 0 && <small>Продукти: +{cash(royalties)} / с</small>}
        </div>
      </article>
      <article className="resource-card">
        <span className="resource-icon amber">
          <BugIcon />
        </span>
        <div>
          <span className="resource-label">
            {auto ? "ОБРОБЛЕНО ЗА КАР’ЄРУ" : "БАГИ ДО ЗВІТУ"}
          </span>
          <strong data-testid="bugs">{number(auto ? s.found : s.bugs)}</strong>
          <small>
            {auto ? "Автозвіти · " : ""}
            {cash(reportValue(s))} за кожен баг
          </small>
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
  );
}
