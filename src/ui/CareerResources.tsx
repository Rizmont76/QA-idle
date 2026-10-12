import type { CareerState } from "../types";
import type { CareerView, PipelineView } from "../game/career/discovery";
import { resourceOverview, resourceCapacity } from "../game/career/resources";
import { SectionTitle } from "./CareerWidgets";
import { cash, number } from "./careerUtils";

export function CareerResources({
  game,
  open,
}: {
  game: CareerState;
  open: (view: CareerView, layer?: PipelineView) => void;
}) {
  return (
    <section className="resource-overview">
      <SectionTitle eyebrow="УСЕ ВІДКРИТЕ — В ОДНОМУ МІСЦІ" title="Ресурси студії" />
      <p className="overview-intro">
        Баланс — те, що є зараз. Темп — пасивне надходження. Нагороди проєктів і
        контрактів приходять окремо.
      </p>
      <div className="resource-ledger" role="table" aria-label="Відкриті ресурси">
        <div className="ledger-heading" role="row">
          <span role="columnheader">Ресурс / баланс</span>
          <span role="columnheader">Звідки береться</span>
          <span role="columnheader">Навіщо потрібен</span>
        </div>
        {resourceOverview(game).map((row) => (
          <article className="ledger-row" role="row" key={row.id}>
            <div className="ledger-balance" role="cell">
              <span className="eyebrow">
                {row.symbol} {row.title}
              </span>
              <strong>{row.money ? cash(row.balance) : number(row.balance)}</strong>
              <small>
                {row.rate === undefined
                  ? "Нагорода за події"
                  : `+${row.money ? cash(row.rate) : number(row.rate)} / ${row.rateUnit ?? "с"}`}
              </small>
              <button className="text-button" onClick={() => open(row.view, row.layer)}>
                Відкрити →
              </button>
            </div>
            <div role="cell">
              <span className="ledger-mobile-label">Звідки береться</span>
              <p>{row.source}</p>
            </div>
            <div role="cell">
              <span className="ledger-mobile-label">Навіщо потрібен</span>
              <p>{row.use}</p>
              <small>{row.persistence}</small>
            </div>
          </article>
        ))}
      </div>
      <div className="overview-capacity">
        {resourceCapacity(game).map((row) => (
          <article className="panel" key={row.title}>
            <span className="eyebrow">{row.title}</span>
            <strong>{number(row.value)}</strong>
            <p>{row.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
