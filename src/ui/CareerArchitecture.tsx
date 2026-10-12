import { useState } from "react";
import type { CareerAction, CareerState } from "../types";
import {
  ARCHITECTURE_POLICIES,
  BLUEPRINTS,
  RACK,
  RACK_MODULES,
} from "../game/career/architectureData";
import {
  architectureEffects,
  architecturePolicyUnlocked,
  architectureUnlocked,
  moduleDefinition,
  moduleUnlocked,
  neighbors,
  powerBudget,
  powerUsed,
  sustainableRate,
} from "../game/career/architectureEffects";
import { blueprintProgress, blueprintReady } from "../game/career/architectureActions";
import { PIPELINE_TRIALS, STATIONS } from "../game/career/pipelineData";
import { Meter, SectionTitle } from "./CareerWidgets";
import { number } from "./careerUtils";

export function CareerArchitecture({
  game: s,
  send,
  pipeline,
}: {
  game: CareerState;
  send: (action: CareerAction) => void;
  pipeline: () => void;
}) {
  const [selected, select] = useState(0);
  const a = s.pipeline.architecture;
  const unlocked = architectureUnlocked(s);
  const effects = architectureEffects(s);
  const used = powerUsed(a.layout);
  const budget = powerBudget(s);
  const cost = RACK.powerCosts[a.powerLevel];
  const next = BLUEPRINTS.find((b) => !a.blueprints.includes(b.id));
  return (
    <>
      <SectionTitle eyebrow="ДРУГА ЗМІНА МАСШТАБУ" title="Архітектура студії">
        <span className="pill">
          {unlocked ? "Схема залишається після престижу" : "Після трьох випробувань"}
        </span>
      </SectionTitle>
      {!unlocked ? (
        <section className="panel rack-locked">
          <div className="rack-preview" aria-hidden="true">
            ◧ ━ ╋ ━ ⌕<br />
            ┃
            <br />↥
          </div>
          <div>
            <span className="eyebrow">НАСТУПНИЙ СПОСІБ ГРАТИ</span>
            <h2>Важливо, що стоїть поруч.</h2>
            <p>
              Збери серверну шафу з модулів. Шини посилять сусідів, архіви пришвидшать
              проєкти, оркестратори — команду. Вдалі схеми відкриють нові можливості.
            </p>
            <strong>
              {s.pipeline.completed.length} / {PIPELINE_TRIALS.length} нагород випробувань
            </strong>
            <button className="button primary" onClick={pipeline}>
              До конвеєра та випробувань →
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="rack-objective" aria-label="Наступне креслення">
            <div>
              <span className="eyebrow">
                {next ? "ПОБУДУЙ І ВІДКРИЙ" : "УСІ КРЕСЛЕННЯ ВІДКРИТО"}
              </span>
              <h2>{next?.title ?? "Твоя студія. Твоя конфігурація."}</h2>
              <p>
                {next?.description ??
                  "Спрямуй потужність на релізи, проєкти або команду. Модулі можна переставляти вільно."}
              </p>
            </div>
            <span className="rack-reward">
              {next?.reward ?? "4 / 4 постійні відкриття ✓"}
            </span>
          </section>
          <div className="rack-workbench">
            <section className="panel rack-panel" aria-label="Серверна шафа">
              <div className="rack-heading">
                <div>
                  <span className="eyebrow">СЕРВЕРНА ШАФА / 2 × 3</span>
                  <h2>З’єднай можливості.</h2>
                </div>
                <span className="rack-power">
                  ϟ {used} / {budget}
                </span>
              </div>
              <Meter value={used} max={budget} label="Використане живлення" />
              <div className="rack-grid">
                {a.layout.map((id, i) => {
                  const def = moduleDefinition(id);
                  const right =
                    i % RACK.columns < RACK.columns - 1 && !!id && !!a.layout[i + 1];
                  const down =
                    i + RACK.columns < RACK.slots && !!id && !!a.layout[i + RACK.columns];
                  return (
                    <button
                      key={i}
                      className={`rack-slot ${id ?? "empty"} ${selected === i ? "selected" : ""} ${right ? "link-right" : ""} ${down ? "link-down" : ""}`}
                      aria-pressed={selected === i}
                      aria-label={`Комірка ${String(i + 1)}: ${def?.title ?? "порожня"}`}
                      onClick={() => select(i)}
                    >
                      <span className="rack-slot-number">0{i + 1}</span>
                      <span className="rack-symbol" aria-hidden="true">
                        {def?.icon ?? "+"}
                      </span>
                      <strong>{def?.title ?? "Порожньо"}</strong>
                      <small>{def ? `ϟ ${String(def.power)}` : "Обери модуль"}</small>
                    </button>
                  );
                })}
              </div>
              <div className="rack-selection">
                <span>
                  Комірка {selected + 1} ·{" "}
                  {neighbors(selected).filter((i) => a.layout[i]).length} сусідів
                </span>
                <button
                  className="button ghost"
                  disabled={!a.layout[selected]}
                  onClick={() => send({ type: "rackModule", slot: selected, id: null })}
                >
                  Прибрати модуль
                </button>
              </div>
              <p className="rack-hint">
                Обери комірку та модуль. З’єднання працюють по сторонах. Перестановки
                безкоштовні.
              </p>
              <div className="rack-expansion">
                <span>
                  Кредити збірки <strong>▧ {number(s.pipeline.credits)}</strong>
                </span>
                <button
                  className="button secondary"
                  disabled={cost === undefined || s.pipeline.credits < cost}
                  onClick={() => send({ type: "rackPower" })}
                >
                  {cost === undefined
                    ? "Живлення розширено ✓"
                    : `+1 живлення · ${number(cost)} ▧`}
                </button>
              </div>
            </section>
            <section className="panel rack-palette" aria-label="Модулі шафи">
              <div className="rack-heading">
                <div>
                  <span className="eyebrow">ВСТАНОВИТИ В КОМІРКУ {selected + 1}</span>
                  <h2>Модулі</h2>
                </div>
                <span className="muted">Без витрат</span>
              </div>
              <div className="rack-module-list">
                {RACK_MODULES.map((def) => {
                  const available = moduleUnlocked(s, def.id);
                  const fits =
                    used -
                      (moduleDefinition(a.layout[selected] ?? null)?.power ?? 0) +
                      def.power <=
                    budget;
                  const requirement = BLUEPRINTS.find((b) => b.id === def.requires);
                  return (
                    <button
                      key={def.id}
                      className={`rack-module ${def.id}`}
                      disabled={!available || !fits}
                      aria-label={`Встановити: ${def.title}`}
                      onClick={() =>
                        send({ type: "rackModule", slot: selected, id: def.id })
                      }
                    >
                      <span className="module-symbol" aria-hidden="true">
                        {available ? def.icon : "◇"}
                      </span>
                      <span>
                        <strong>
                          {def.title} <small>ϟ {def.power}</small>
                        </strong>
                        <span>
                          {available
                            ? def.description
                            : `Креслення «${requirement?.title ?? ""}»`}
                        </span>
                        {available && !fits && (
                          <small className="rack-shortage">
                            Потрібно більше живлення
                          </small>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
          <section className="rack-effects" aria-label="Ефекти архітектури">
            <div>
              <span>СТАЛИЙ ПОТІК</span>
              <strong>
                {number(sustainableRate(s))} <small>/ с</small>
              </strong>
              <button className="rack-text-button" onClick={pipeline}>
                Розподілити ядра →
              </button>
            </div>
            <div>
              <span>НА КОЖНЕ ЯДРО</span>
              <p>
                {effects.rates.map((rate, i) => (
                  <span key={i}>
                    {STATIONS[i]} <b>{number(rate)}</b>
                  </span>
                ))}
              </p>
            </div>
            <div>
              <span>КОМАНДА</span>
              <strong>×{number(effects.crew)}</strong>
              <small>до виробництва</small>
            </div>
            <div>
              <span>ПРОЄКТИ</span>
              <strong>×{number(effects.projects)}</strong>
              <small>до виконаної роботи</small>
            </div>
          </section>
          <SectionTitle eyebrow="РІШЕННЯ ВІДКРИВАЮТЬ НОВІ ІНСТРУМЕНТИ" title="Креслення">
            <span className="pill">
              {a.blueprints.length} / {BLUEPRINTS.length}
            </span>
          </SectionTitle>
          <div className="blueprint-grid">
            {BLUEPRINTS.map((def, i) => {
              const done = a.blueprints.includes(def.id);
              const ready = blueprintReady(s, def.id);
              const available = !def.requires || a.blueprints.includes(def.requires);
              const progress = blueprintProgress(s, def.id);
              return (
                <article
                  className={`panel blueprint ${done ? "complete" : ready ? "ready" : ""}`}
                  key={def.id}
                >
                  <div className="blueprint-top">
                    <span className="eyebrow">
                      {done ? "✓ ВІДКРИТО НАЗАВЖДИ" : `КРЕСЛЕННЯ 0${String(i + 1)}`}
                    </span>
                    <span>
                      {done
                        ? "✓"
                        : `${number(Math.min(progress, def.target))} / ${number(def.target)}`}
                    </span>
                  </div>
                  <h3>{def.title}</h3>
                  <p>{def.description}</p>
                  <Meter
                    value={done ? def.target : progress}
                    max={def.target}
                    label={`Креслення: ${def.title}`}
                  />
                  <strong className="blueprint-reward">↗ {def.reward}</strong>
                  <button
                    className="button secondary"
                    disabled={!ready}
                    onClick={() => send({ type: "claimBlueprint", id: def.id })}
                  >
                    {done
                      ? "Нагорода отримана"
                      : ready
                        ? `Відкрити: ${def.title}`
                        : !available
                          ? "Спочатку попереднє креслення"
                          : "Збери потрібну конфігурацію"}
                  </button>
                </article>
              );
            })}
          </div>
          <SectionTitle
            eyebrow="КОНВЕЄР ПЕРЕХОДИТЬ НА АВТОМАТИКУ"
            title="Делегуй попередній шар"
          />
          <div className="pipeline-policies">
            {ARCHITECTURE_POLICIES.map((policy) => {
              const available = architecturePolicyUnlocked(s, policy.id);
              return (
                <article className="panel pipeline-policy" key={policy.id}>
                  <div>
                    <h3>{policy.title}</h3>
                    <p>{policy.description}</p>
                    <small>
                      {available
                        ? "Відкрито назавжди"
                        : `Креслення «${BLUEPRINTS.find((b) => b.id === policy.requires)?.title ?? ""}»`}
                    </small>
                  </div>
                  <button
                    role="switch"
                    aria-checked={a[policy.id]}
                    aria-label={policy.title}
                    className={`policy-switch ${a[policy.id] ? "on" : ""}`}
                    disabled={!available}
                    onClick={() =>
                      send({
                        type: "architecturePolicy",
                        id: policy.id,
                        enabled: !a[policy.id],
                      })
                    }
                  >
                    {a[policy.id] ? "Увімкнено" : available ? "Вимкнено" : "Закрито"}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
