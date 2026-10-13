import { CareerNetwork } from "./CareerNetwork";
import { networkUnlocked } from "../game/career/networkEffects";
import type { CareerView, PipelineView } from "../game/career/discovery";
import { CareerArchitecture } from "./CareerArchitecture";
import { architectureUnlocked, pipelineRates } from "../game/career/architectureEffects";
import type { CareerAction, CareerState } from "../types";
import { pipelineUnlocked, trialUnlocked } from "../game/career/pipelineUnlocks";
import { CAREER_RULES } from "../game/career/content";
import { compiledTestRate } from "../game/career/selectors";
import { affordable } from "../game/career/afford";
import {
  coreBudget,
  corePrice,
  PIPELINE,
  PIPELINE_POLICIES,
  PIPELINE_TRIALS,
  policyUnlocked,
} from "../game/career/pipelineData";
import { FlowBoard } from "./CareerFlowBoard";
import { nextDiscovery } from "../game/career/pipelineSelectors";
import { Meter, SectionTitle } from "./CareerWidgets";
import { clockTime, number } from "./careerUtils";
import { MainBalance, BulkDelegation } from "./CareerDelegation";

interface Props {
  game: CareerState;
  send: (action: CareerAction) => void;
  career: () => void;
}
export function DiscoveryCard({
  game,
  open,
}: {
  game: CareerState;
  open: (view: CareerView, layer?: PipelineView) => void;
}) {
  const next = nextDiscovery(game);
  return (
    <section className="discovery-card" aria-label="Наступне відкриття">
      <div className="discovery-icon" aria-hidden="true">
        ⤳
      </div>
      <div className="discovery-copy">
        <span className="eyebrow">НАСТУПНИЙ ВЕЛИКИЙ КРОК</span>
        <h3>{next.title}</h3>
        <p>{next.detail}</p>
        <Meter value={next.value} max={next.target} label="Прогрес відкриття" />
      </div>
      <button className="button secondary" onClick={() => open(next.view, next.layer)}>
        {next.action} →
      </button>
    </section>
  );
}

function PipelineWorkshop({ game: s, send, career }: Props) {
  const p = s.pipeline;
  const unlocked = pipelineUnlocked(s);
  const trial = p.trial;
  const trialDef = PIPELINE_TRIALS.find((t) => t.id === trial?.id);
  const trialReady = !!trial && !!trialDef && trial.progress >= trialDef.target;
  return (
    <>
      <SectionTitle eyebrow="КОД ПРАЦЮЄ ЗА ТЕБЕ" title="Майстерня CI/CD">
        <span className="pill">
          {unlocked ? "Залишається після престижу" : "Відкриття попереду"}
        </span>
      </SectionTitle>
      {!unlocked ? (
        <section className="panel pipeline-locked">
          <span className="eyebrow">ТВОЯ ПЕРША ЗМІНА МАСШТАБУ</span>
          <h2>Від команди — до системи.</h2>
          <p>
            Досягни Senior QA. Тут з’являться шість ядер і потік релізів, які створюють
            постійні автотести. Його швидкість визначатимеш ти.
          </p>
          <p>
            Випробування відкриють автоматизацію проєктів, найму й підвищень. Після
            наступного престижу вона залишиться з тобою.
          </p>
          <button className="button primary" onClick={career}>
            Досягнути Senior QA →
          </button>
        </section>
      ) : (
        <>
          <section className="panel pipeline-main" aria-label="Основний конвеєр">
            <div className="pipeline-heading">
              <div>
                <span className="eyebrow">БЕЗПЕРЕРВНИЙ ПОТІК</span>
                <h2>Збалансуй вузли.</h2>
                <p className="muted">
                  Один реліз = один постійний автотест + один кредит збірки. Автотести
                  знаходять баги й прискорюють дохід.
                </p>
              </div>
              <div className="pipeline-currency">
                <span>КРЕДИТИ ЗБІРКИ</span>
                <strong>▧ {number(p.credits)}</strong>
                <small>Всього релізів: {number(p.total)}</small>
                <small>Автотести: +{number(compiledTestRate(s))} багів/с</small>
              </div>
            </div>
            <FlowBoard
              allocation={p.allocation}
              queues={p.queues}
              rates={pipelineRates(s)}
              automatic={s.pipeline.architecture.autoBalance}
              budget={coreBudget(p)}
              send={send}
            />
            <div className="pipeline-expansion">
              <div>
                <h3>Більше простору для рішень</h3>
                <p>
                  Додаткові ядра: {p.coreLevel} / {PIPELINE.maxCoreLevel}
                  {p.completed.includes("budget") ? " · +2 за випробування" : ""}
                </p>
              </div>
              <button
                className="button secondary"
                disabled={
                  p.coreLevel >= PIPELINE.maxCoreLevel ||
                  !affordable(p.credits, corePrice(p))
                }
                onClick={() => send({ type: "pipelineCore" })}
              >
                {p.coreLevel >= PIPELINE.maxCoreLevel
                  ? "Усі ядра куплені ✓"
                  : `+1 ядро · ${number(corePrice(p))} ▧`}
              </button>
            </div>
            <MainBalance game={s} send={send} />
          </section>
          {p.total >= PIPELINE.trialsAt && (
            <>
              {" "}
              <SectionTitle eyebrow="ОБЕРИ ВЛАСНИЙ МАРШРУТ" title="Випробування">
                <span className="pill">
                  {p.completed.length} / {PIPELINE_TRIALS.length}
                </span>
              </SectionTitle>
              <p className="pipeline-intro">
                Окремий конвеєр з іншими правилами. Без скидання кар’єри й без витрат.
                Головний потік працює весь час.
              </p>
              {trial && trialDef && (
                <section
                  className={`panel pipeline-trial ${trialReady ? "ready" : ""}`}
                  aria-label="Активне випробування"
                >
                  <div className="pipeline-heading">
                    <div>
                      <span className="eyebrow">
                        {trialReady ? "ПРОРИВ ГОТОВИЙ" : "АКТИВНЕ ВИПРОБУВАННЯ"}
                      </span>
                      <h2>{trialDef.title}</h2>
                      <p className="muted">{trialDef.description}</p>
                    </div>
                    <strong>
                      {number(trial.progress)} / {number(trialDef.target)}
                    </strong>
                  </div>
                  <Meter
                    value={trial.progress}
                    max={trialDef.target}
                    label="Релізи випробування"
                  />
                  <FlowBoard
                    allocation={trial.allocation}
                    queues={trial.queues}
                    rates={trialDef.rates}
                    budget={trialDef.cores}
                    send={send}
                    trial
                    stopped={trialReady}
                  />
                  <div className="trial-finish">
                    <div>
                      <strong>{trialDef.reward}</strong>
                      <p>Час роботи: {clockTime(trial.elapsed)} · Нагорода назавжди</p>
                    </div>
                    {trialReady ? (
                      <button
                        className="button primary"
                        onClick={() => send({ type: "claimTrial" })}
                      >
                        Забрати прорив →
                      </button>
                    ) : (
                      <button
                        className="button ghost"
                        onClick={() => send({ type: "cancelTrial" })}
                      >
                        Скасувати спробу
                      </button>
                    )}
                  </div>
                </section>
              )}
              <div className="trial-options">
                {PIPELINE_TRIALS.filter((def) => trialUnlocked(s, def)).map((def) => (
                  <article
                    key={def.id}
                    className={`panel trial-option ${p.completed.includes(def.id) ? "complete" : ""}`}
                  >
                    <span className="eyebrow">
                      {p.completed.includes(def.id)
                        ? "✓ ПРОЙДЕНО"
                        : `${String(def.cores)} ЯДЕР · ${String(def.target)} РЕЛІЗІВ`}
                    </span>
                    <h3>{def.title}</h3>
                    <p>{def.description}</p>
                    <strong>{def.reward}</strong>
                    <button
                      className="button secondary"
                      disabled={
                        p.total < PIPELINE.trialsAt ||
                        !!trial ||
                        p.completed.includes(def.id)
                      }
                      onClick={() => send({ type: "startTrial", id: def.id })}
                    >
                      {p.completed.includes(def.id)
                        ? "Нагорода отримана"
                        : p.total < PIPELINE.trialsAt
                          ? `Після ${String(PIPELINE.trialsAt)} релізів`
                          : trial?.id === def.id
                            ? "У процесі"
                            : `Почати: ${def.title}`}
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {PIPELINE_POLICIES.some((policy) => policyUnlocked(p, policy.id)) && (
            <>
              {" "}
              <SectionTitle
                eyebrow="ПОПЕРЕДНІЙ ЦИКЛ ПРАЦЮЄ НА ТЕБЕ"
                title="Автоматизація кар’єри"
              />
              <p className="pipeline-intro">
                Увімкнені політики працюють кожні{" "}
                {PIPELINE.automationMs / CAREER_RULES.milliseconds} секунд, також офлайн.
                По одній дії кожного виду.
              </p>
              <BulkDelegation game={s} send={send} />
              <div className="pipeline-policies">
                {PIPELINE_POLICIES.filter((policy) => policyUnlocked(p, policy.id)).map(
                  (policy) => {
                    const available = policyUnlocked(p, policy.id);
                    return (
                      <article className="panel pipeline-policy" key={policy.id}>
                        <div>
                          <h3>{policy.title}</h3>
                          <p>{policy.description}</p>
                          <small>
                            {available
                              ? "Відкрито назавжди"
                              : `Відкриває: ${policy.unlock}`}
                          </small>
                        </div>
                        <button
                          role="switch"
                          aria-checked={p.automation[policy.id]}
                          aria-label={policy.title}
                          className={`policy-switch ${p.automation[policy.id] ? "on" : ""}`}
                          disabled={!available}
                          onClick={() =>
                            send({
                              type: "pipelinePolicy",
                              id: policy.id,
                              enabled: !p.automation[policy.id],
                            })
                          }
                        >
                          {p.automation[policy.id]
                            ? "Увімкнено"
                            : available
                              ? "Вимкнено"
                              : "Закрито"}
                        </button>
                      </article>
                    );
                  },
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export function CareerPipeline(
  props: Props & { view: PipelineView; setView: (view: PipelineView) => void },
) {
  const available = architectureUnlocked(props.game);
  const network = networkUnlocked(props.game);
  const { view, setView } = props;
  if (!pipelineUnlocked(props.game)) {
    return null;
  }
  return (
    <>
      <nav className="pipeline-subnav" aria-label="Майстерня">
        <button aria-pressed={view === "pipeline"} onClick={() => setView("pipeline")}>
          Конвеєр
        </button>
        {available && (
          <button
            aria-pressed={view === "architecture"}
            onClick={() => setView("architecture")}
          >
            Архітектура
          </button>
        )}
        {network && (
          <button aria-pressed={view === "network"} onClick={() => setView("network")}>
            Мережа
          </button>
        )}
      </nav>
      {view === "network" ? (
        <CareerNetwork
          game={props.game}
          send={props.send}
          architecture={() => setView("architecture")}
        />
      ) : view === "architecture" ? (
        <>
          {network && (
            <button className="rack-gateway" onClick={() => setView("network")}>
              ◎ Мережа відкрита · Генератори, що створюють генератори →
            </button>
          )}
          <CareerArchitecture
            game={props.game}
            send={props.send}
            pipeline={() => setView("pipeline")}
          />
        </>
      ) : (
        <>
          {available && (
            <button className="rack-gateway" onClick={() => setView("architecture")}>
              ╋ Серверна шафа відкрита · Збирай схеми та автоматизуй конвеєр →
            </button>
          )}
          <PipelineWorkshop {...props} />
        </>
      )}
    </>
  );
}
