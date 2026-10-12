import type { CareerAction, PipelineAllocation } from "../types";
import { allocatedCores, PIPELINE, STATIONS } from "../game/career/pipelineData";
import { flowRates, stationCapacity } from "../game/career/pipelineFlow";
import { Meter } from "./CareerWidgets";
import { number } from "./careerUtils";

export function FlowBoard({
  allocation,
  queues,
  rates,
  budget,
  send,
  trial = false,
  stopped = false,
  automatic = false,
}: {
  allocation: PipelineAllocation;
  queues: [number, number];
  rates: PipelineAllocation;
  budget: number;
  send: (action: CareerAction) => void;
  trial?: boolean;
  stopped?: boolean;
  automatic?: boolean;
}) {
  const capacity = stationCapacity(allocation, rates);
  const actual = stopped ? [0, 0, 0] : flowRates(capacity, queues);
  const minimum = Math.min(...capacity);
  const balanced = minimum > 0 && capacity.every((rate) => rate === minimum);
  const free = budget - allocatedCores(allocation);
  return (
    <div className="flow-board">
      <div className="flow-pool">
        <span>
          Спільний пул <strong>{number(budget)} ядер</strong>
        </span>
        <span className={free > 0 ? "mint" : "muted"}>
          Вільно: <strong>{number(free)}</strong>
        </span>
      </div>
      <p className="flow-throughput">
        Сталий потік: <strong>{number(minimum)} релізів / с</strong>
        {balanced ? " · Усі вузли збалансовані" : ""}
      </p>
      <div className="flow-stations">
        {STATIONS.map((title, index) => (
          <article
            className={`flow-station ${balanced ? "balanced" : capacity[index] === minimum ? "bottleneck" : ""}`}
            key={title}
            aria-label={`${trial ? "Випробування" : "Конвеєр"}: ${title}`}
          >
            <div className="flow-station-top">
              <span className="eyebrow">
                0{index + 1} / {title}
              </span>
              <span aria-hidden="true">
                {index === 0 ? "◧" : index === 1 ? "⌕" : "↥"}
              </span>
            </div>
            <h3>
              {number(actual[index] ?? 0)} <small>релізів / с</small>
            </h3>
            <p>
              Місткість: {number(capacity[index] ?? 0)} / с<br />
              {number(rates[index] ?? 0)} / с на ядро
            </p>
            <div className="core-controls">
              <button
                disabled={stopped || automatic || allocation[index] === 0}
                aria-label={`${trial ? "Випробування" : "Конвеєр"}: ${title} — забрати ядро`}
                onClick={() =>
                  send({ type: "pipelineAllocate", station: index, delta: -1, trial })
                }
              >
                −
              </button>
              <strong>
                {allocation[index]} <small>ядер</small>
              </strong>
              <button
                disabled={stopped || automatic || free === 0}
                aria-label={`${trial ? "Випробування" : "Конвеєр"}: ${title} — додати ядро`}
                onClick={() =>
                  send({ type: "pipelineAllocate", station: index, delta: 1, trial })
                }
              >
                +
              </button>
            </div>
            <span className="flow-status">
              {stopped
                ? "Завершено"
                : balanced
                  ? "Збалансовано ✓"
                  : capacity[index] === minimum
                    ? "● Вузьке місце"
                    : (actual[index] ?? 0) < (capacity[index] ?? 0)
                      ? "Очікує сусідній вузол"
                      : "Працює на повну"}
            </span>
          </article>
        ))}
      </div>
      <div className="flow-queues">
        {queues.map((value, index) => (
          <div key={index}>
            <div>
              <span>
                {STATIONS[index]} → {STATIONS[index + 1]}
              </span>
              <strong>
                {number(value)} / {PIPELINE.buffer}
              </strong>
            </div>
            <Meter
              value={value}
              max={PIPELINE.buffer}
              label={`${trial ? "Випробування" : "Конвеєр"}: черга ${String(index + 1)}`}
            />
          </div>
        ))}
      </div>
      <p className="flow-tip">
        {automatic
          ? "Авторозподіл увімкнено. Для ручного керування вимкни його в «Архітектурі»."
          : "Забери ядро кнопкою − й додай його до іншого вузла. Повна черга стримує попередній вузол; порожня — залишає наступний без роботи."}
      </p>
    </div>
  );
}
