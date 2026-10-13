import type { CareerAction, CareerState } from "../types";
import { mainBalanceUnlocked } from "../game/career/pipelineUnlocks";
import { delegatedPolicies } from "../game/career/pipelineData";

interface Props {
  game: CareerState;
  send: (action: CareerAction) => void;
}
export function MainBalance({ game: s, send }: Props) {
  if (!mainBalanceUnlocked(s)) {
    return null;
  }
  const enabled = s.pipeline.architecture.autoBalance;
  return (
    <div className="pipeline-expansion" aria-label="Керування основним конвеєром">
      <div>
        <h3>Ядра вже можуть розподілятись самі</h3>
        <p>
          Підлаштовує головний потік під нові ядра й потужність команди. Випробування
          налаштовуєш окремо.
        </p>
      </div>
      <button
        role="switch"
        aria-label="Авторозподіл основного конвеєра"
        aria-checked={enabled}
        className={`policy-switch ${enabled ? "on" : ""}`}
        onClick={() => send({ type: "pipelineBalance", enabled: !enabled })}
      >
        {enabled ? "Увімкнено" : "Вимкнено"}
      </button>
    </div>
  );
}

export function BulkDelegation({ game: s, send }: Props) {
  const policies = delegatedPolicies(s.pipeline);
  if (!policies.length) {
    return null;
  }
  const enabled = policies.every((p) => s.pipeline.automation[p.id]);
  const cashPurchases = policies.some((p) => p.id === "hire" || p.id === "upgrades");
  return (
    <section className="panel delegation-choice" aria-label="Делегування освоєної роботи">
      <div>
        <h3>Освоєне працює за тебе</h3>
        <p>Зараз включає: {policies.map((p) => p.title).join(" · ")}.</p>
        <p className="muted">
          {cashPurchases
            ? "Автоматичні покупки витрачають гроші з рахунку."
            : "Здавання етапів і запуск проєктів не витрачають грошей."}{" "}
          Нові політики додаєш власним рішенням, коли вони відкриються.
        </p>
      </div>
      <button
        className="button secondary"
        onClick={() => send({ type: "pipelineDelegate", enabled: !enabled })}
      >
        {enabled ? "Повернути ручне керування" : "Делегувати освоєну роботу"}
      </button>
    </section>
  );
}
