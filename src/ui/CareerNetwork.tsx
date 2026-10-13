import { useState } from "react";
import type { CareerAction, CareerState } from "../types";
import { affordable } from "../game/career/afford";
import { GENERATORS, NETWORK, NETWORK_PROTOCOLS } from "../game/career/networkData";
import {
  computationRate,
  generatorPrice,
  generatorUnlocked,
  networkBridge,
  networkConnected,
  networkConnectionUnlocked,
  networkDiscovery,
  networkMultiplier,
  networkUnlocked,
  protocolPrice,
  rebootReward,
} from "../game/career/networkEffects";
import { BLUEPRINTS } from "../game/career/architectureData";
import { ConfirmDialog, Meter, SectionTitle } from "./CareerWidgets";
import { cash, number } from "./careerUtils";
import {
  networkConnectPreview,
  networkImpact,
  networkRebootPreview,
} from "../game/career/networkImpact";

const precise = (value: number) =>
  value.toLocaleString("uk-UA", { maximumFractionDigits: 3 });
function protocols(value: number): string {
  const category = new Intl.PluralRules("uk-UA").select(value);
  const word =
    category === "one" ? "протокол" : category === "few" ? "протоколи" : "протоколів";
  return `${number(value)} ${word}`;
}
export function CareerNetwork({
  game: s,
  send,
  architecture,
}: {
  game: CareerState;
  send: (action: CareerAction) => void;
  architecture: () => void;
}) {
  const [confirming, confirm] = useState(false);
  const n = s.pipeline.network;
  const unlocked = networkUnlocked(s);
  const next = networkDiscovery(s);
  const reward = rebootReward(s);
  const multiplier = networkMultiplier(s);
  const bridge = networkBridge(s);
  const current = networkImpact(s);
  const connection = networkConnectPreview(s);
  const reboot = networkRebootPreview(s);
  return (
    <>
      <SectionTitle eyebrow="ВІД ОДНІЄЇ СХЕМИ ДО МЕРЕЖІ" title="Обчислювальна мережа">
        <span className="pill">
          {unlocked ? "Генератори створюють генератори" : "Після чотирьох креслень"}
        </span>
      </SectionTitle>
      {!unlocked ? (
        <section className="panel network-locked">
          <div className="network-preview" aria-hidden="true">
            ◎ → ⬡ → ⌘ → ◉
          </div>
          <h2>Зростання, яке створює себе.</h2>
          <p>
            Регіони створюють кластери. Кластери — планувальників. Планувальники —
            агентів. Кожна ланка розганяє наступну.
          </p>
          <p>
            Перезапуски відкриють постійні протоколи: прискорення мережі, посилення всієї
            студії та автоматичний розвиток.
          </p>
          <strong>
            {s.pipeline.architecture.blueprints.length} / {BLUEPRINTS.length} креслень
          </strong>
          <button className="button primary" onClick={architecture}>
            До архітектури →
          </button>
        </section>
      ) : (
        <>
          <div className="network-summary">
            <section className="panel network-balance">
              <span className="eyebrow">ОБЧИСЛЕННЯ</span>
              <strong>◌ {number(n.computations)}</strong>
              <span className="mint">+{precise(computationRate(s))} / с</span>
              <small>
                За запуск: {number(n.runTotal)} · Найкращий: {number(n.best)}
              </small>
            </section>
            <section className="network-next" aria-label="Наступний рубіж мережі">
              <span className="eyebrow">ЗРОСТАННЯ ВІДКРИВАЄ МОЖЛИВОСТІ</span>
              <h3>{next.title}</h3>
              <p>{next.detail}</p>
              <Meter value={next.value} max={next.target} label="Рубіж мережі" />
            </section>
          </div>
          {networkConnectionUnlocked(s) && connection && (
            <section
              className="panel network-studio-link"
              aria-label="Мережа й виробництво багів"
            >
              <div>
                <span className="eyebrow">ГЕНЕРАТОРИ ПРАЦЮЮТЬ ДЛЯ СТУДІЇ</span>
                <h2>
                  {networkConnected(s)
                    ? "Тестування, яке нарощує себе."
                    : "Нехай агенти тестують твої релізи."}
                </h2>
                <p>
                  Вищі генератори створюють агентів.{" "}
                  {networkConnected(s)
                    ? "Кожен агент одночасно приносить обчислення й знаходить баги."
                    : "Після підключення кожен агент одночасно приноситиме обчислення й знаходитиме баги."}{" "}
                  Більше флоту — більше доходу між покупками.
                </p>
              </div>
              <div className="network-link-impact">
                <span>Від агентів</span>
                <strong>
                  +{number(connection.agents)} <small>багів / с</small>
                </strong>
                {!networkConnected(s) && (
                  <p>
                    Студія: {number(current.bugs)} → {number(connection.bugs)} багів/с
                    <br />
                    Дохід: {cash(current.income)} → {cash(connection.income)} / с
                  </p>
                )}
                {networkConnected(s) ? (
                  <span className="mint">Підключено назавжди ✓</span>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => send({ type: "networkConnect" })}
                  >
                    Підключити агентів до студії →
                  </button>
                )}
              </div>
            </section>
          )}
          <section className="network-chain" aria-label="Ланцюжок генераторів">
            {GENERATORS.filter((g) => generatorUnlocked(s, g.tier))
              .reverse()
              .map((g) => (
                <span key={g.tier}>
                  {g.title} <b>→</b>
                </span>
              ))}
            <strong>Обчислення</strong>
          </section>
          <div className="generator-grid">
            {GENERATORS.filter((g) => generatorUnlocked(s, g.tier)).map((g) => {
              const available = generatorUnlocked(s, g.tier);
              const price = generatorPrice(s, g.tier);
              const capped = n.purchased[g.tier] >= NETWORK.purchaseLimit;
              return (
                <article
                  className={`panel generator ${available ? "" : "locked"}`}
                  key={g.tier}
                >
                  <div className="generator-top">
                    <span className="generator-icon" aria-hidden="true">
                      {g.icon}
                    </span>
                    <span className="eyebrow">
                      {available ? `ЛАНКА 0${String(g.tier + 1)}` : "НАСТУПНЕ ВІДКРИТТЯ"}
                    </span>
                  </div>
                  <h3>{g.title}</h3>
                  <strong className="generator-quantity">
                    {available ? number(n.units[g.tier]) : "◇"}
                  </strong>
                  <p>
                    {available
                      ? `+${precise(n.units[g.tier] * g.rate * multiplier)} ${g.produces} / с`
                      : `Відкриється після ${number(g.unlock)} обчислень за один запуск`}
                  </p>
                  <small>
                    {available
                      ? `Куплено ${String(n.purchased[g.tier])} · Створено ${number(Math.max(0, n.units[g.tier] - n.purchased[g.tier] - (g.tier === 0 ? 1 : 0)))}`
                      : "Найкращий запуск зберігається після перезапуску"}
                  </small>
                  <button
                    className="button secondary"
                    aria-label={`Купити: ${g.title}`}
                    disabled={!available || capped || !affordable(n.computations, price)}
                    onClick={() => send({ type: "networkBuy", tier: g.tier })}
                  >
                    {!available
                      ? `Рубіж ${number(g.unlock)} ◌`
                      : capped
                        ? "Ліміт покупок ✓"
                        : `+1 · ${number(price)} ◌`}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="network-note">
            Створені генератори одразу працюють і не підвищують ціну покупки. Уся мережа
            працює також офлайн.
          </p>
          {(n.best >= NETWORK.rebootAt || n.reboots > 0) && (
            <>
              {" "}
              <section
                className={`panel network-reboot ${reward > 0 ? "ready" : ""}`}
                aria-label="Перезапуск мережі"
              >
                <div>
                  <span className="eyebrow">ПОСТІЙНИЙ РОЗВИТОК</span>
                  <h2>Почни знову. Побудуй більше.</h2>
                  <p>
                    Поверни мережу до одного агента й отримай протоколи. Кожен перезапуск
                    додає +25% швидкості генераторів.
                  </p>
                  <small>
                    Перезапусків: {number(n.reboots)} · Швидкість мережі ×
                    {precise(multiplier)} · Зв’язок зі студією ×{precise(bridge)}
                  </small>
                </div>
                <div className="reboot-action">
                  <strong>+{number(reward)} ⌬</strong>
                  <span>протоколи за перезапуск</span>
                  <button
                    className="button primary"
                    disabled={reward < 1}
                    onClick={() => confirm(true)}
                  >
                    {reward > 0
                      ? "Перезапустити мережу →"
                      : `Після ${number(NETWORK.rebootAt)} обчислень`}
                  </button>
                </div>
              </section>
            </>
          )}
          {n.totalProtocols > 0 && (
            <>
              {" "}
              <SectionTitle eyebrow="ОБЕРИ, ЩО РОЗВИВАТИ" title="Постійні протоколи">
                <span className="pill">⌬ {protocols(n.protocols)}</span>
              </SectionTitle>
              <div className="protocol-grid">
                {NETWORK_PROTOCOLS.map((p) => {
                  const price = protocolPrice(s, p.id);
                  return (
                    <article className="panel network-protocol" key={p.id}>
                      <span className="protocol-icon" aria-hidden="true">
                        {p.icon}
                      </span>
                      <h3>{p.title}</h3>
                      <p>{p.description}</p>
                      <small>
                        Рівень {n.upgrades[p.id]} / {p.costs.length}
                      </small>
                      <button
                        className="button secondary"
                        aria-label={`Протокол: ${p.title}`}
                        disabled={price === undefined || n.protocols < price}
                        onClick={() => send({ type: "networkProtocol", id: p.id })}
                      >
                        {price === undefined
                          ? "Повністю розвинено ✓"
                          : `Наступний рівень · ${String(price)} ⌬`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
          {n.upgrades.autobuy > 0 && (
            <>
              {" "}
              <section className="panel pipeline-policy network-policy">
                <div>
                  <h3>Автопокупка генераторів</h3>
                  <p>
                    Кожні 5 секунд купує один генератор найвищої доступної ланки, яку
                    можна оплатити. Витрачає обчислення. Перезапуск і протоколи обираєш
                    ти.
                  </p>
                  <small>
                    {n.upgrades.autobuy > 0
                      ? "Протокол «Саморозвиток» активовано"
                      : "Відкриває протокол «Саморозвиток»"}
                  </small>
                </div>
                <button
                  role="switch"
                  className={`policy-switch ${n.autoBuy ? "on" : ""}`}
                  aria-label="Автопокупка генераторів"
                  aria-checked={n.autoBuy}
                  disabled={n.upgrades.autobuy < 1}
                  onClick={() => send({ type: "networkAuto", enabled: !n.autoBuy })}
                >
                  {n.autoBuy
                    ? "Увімкнено"
                    : n.upgrades.autobuy > 0
                      ? "Вимкнено"
                      : "Закрито"}
                </button>
              </section>
            </>
          )}
        </>
      )}
      {confirming && (
        <ConfirmDialog
          title="Перезапустити обчислювальну мережу?"
          label="Перезапустити"
          close={() => confirm(false)}
          confirm={() => send({ type: "networkReboot" })}
        >
          <p>
            Обчислення, генератори та покупки цього запуску почнуться з нуля, з одним
            агентом.
          </p>
          <p>
            Отримаєш <strong>{protocols(reward)}</strong> і +25% швидкості мережі.
            Найкращий запуск, відкриті ланки та постійні протоколи залишаться.
          </p>
          <p>Кар’єра, конвеєр, архітектура й решта студії продовжать працювати.</p>
          {networkConnected(s) && reboot && (
            <div className="network-reset-impact">
              <strong>Поточний флот почне з одного агента.</strong>
              <p>
                Виробництво студії: {number(current.bugs)} → {number(reboot.bugs)}{" "}
                багів/с.
                <br />
                Дохід: {cash(current.income)} → {cash(reboot.income)} / с.
              </p>
              <p>
                Накопичені автотести продовжать працювати. Підключення агентів
                залишається; новий флот відновить його потужність.
              </p>
            </div>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}
