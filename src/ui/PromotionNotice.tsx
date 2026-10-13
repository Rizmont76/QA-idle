import type { PromotionImpact } from "../game/career/promotionImpact";
import { cash, number } from "./careerUtils";

export function PromotionNotice({
  impact,
  close,
}: {
  impact: PromotionImpact;
  close: () => void;
}) {
  return (
    <section className="promotion-notice" role="status" aria-label="Підвищення отримано">
      <div className="promotion-notice-heading">
        <div>
          <span className="eyebrow">НОВИЙ РАНГ · НОВА ПОТУЖНІСТЬ</span>
          <h2>{impact.title}</h2>
          <p>{impact.capability}</p>
        </div>
        <button
          className="button ghost"
          onClick={close}
          aria-label="Закрити повідомлення про підвищення"
        >
          Чудово ✓
        </button>
      </div>
      <div className="promotion-impact">
        <div>
          <small>Виробництво · багів/с</small>
          <strong>
            {number(impact.before.production)} → {number(impact.after.production)}
          </strong>
        </div>
        <div>
          <small>Ручний тест · багів</small>
          <strong>
            {number(impact.before.manual)} → {number(impact.after.manual)}
          </strong>
        </div>
        <div>
          <small>Потенціал · грошей/с</small>
          <strong>
            {cash(impact.before.income)} → {cash(impact.after.income)}
          </strong>
        </div>
      </div>
    </section>
  );
}
