// @vitest-environment node
import { expect, it } from "vitest";
import type { CareerAction, PipelineAllocation, RackModuleId } from "../../types";
import { act, advanceCareer, newCareer } from "./engine";
import { campaign } from "./simulationPolicy";
import { optimalAllocation, pipelineRates } from "./architectureEffects";
import {
  coreBudget,
  corePrice,
  PIPELINE_POLICIES,
  PIPELINE_TRIALS,
  policyUnlocked,
} from "./pipelineData";
import { blueprintReady } from "./architectureActions";
import {
  networkUnlocked,
  generatorPrice,
  generatorUnlocked,
  rebootReward,
} from "./networkEffects";
import { GENERATORS, NETWORK } from "./networkData";

function path(lowClick = false) {
  const first = campaign(newCareer(1000), lowClick, false, true);
  let s = first.state;
  const start = 1000;
  const events: { title: string; seconds: number }[] = [
    { title: "Director", seconds: first.seconds },
  ];
  const doAction = (action: CareerAction) => {
    const result = act(s, action, s.lastTick);
    if (!result.ok) {
      throw new Error(result.message);
    }
    s = result.state;
  };
  const event = (title: string) =>
    events.push({ title, seconds: (s.lastTick - start) / 1000 });
  const allocate = (target: PipelineAllocation, trial = false) => {
    const allocation = () =>
      trial ? (s.pipeline.trial?.allocation ?? [0, 0, 0]) : s.pipeline.allocation;
    for (let i = 0; i < target.length; i++) {
      while ((allocation()[i] ?? 0) > (target[i] ?? 0)) {
        doAction({ type: "pipelineAllocate", station: i, delta: -1, trial });
      }
    }
    for (let i = 0; i < target.length; i++) {
      while ((allocation()[i] ?? 0) < (target[i] ?? 0)) {
        doAction({ type: "pipelineAllocate", station: i, delta: 1, trial });
      }
    }
  };
  const arrange = (layout: (RackModuleId | null)[]) => {
    if (JSON.stringify(s.pipeline.architecture.layout) === JSON.stringify(layout)) {
      return;
    }
    for (let slot = 0; slot < layout.length; slot++) {
      doAction({ type: "rackModule", slot, id: null });
    }
    for (const [slot, id] of layout.entries()) {
      doAction({ type: "rackModule", slot, id });
    }
  };
  doAction({ type: "prestige" });
  event("Перший престиж / конвеєр");
  const prestigeAt = s.lastTick;
  allocate(
    optimalAllocation(coreBudget(s.pipeline), pipelineRates(s), s.pipeline.allocation),
  );
  let secondReboot = false;
  let launched = false;
  for (let second = 1; second <= 1800; second++) {
    s = advanceCareer(s, prestigeAt + second * 1000).state;
    for (const policy of PIPELINE_POLICIES) {
      if (policyUnlocked(s.pipeline, policy.id) && !s.pipeline.automation[policy.id]) {
        doAction({ type: "pipelinePolicy", id: policy.id, enabled: true });
      }
    }
    if (s.pipeline.coreLevel < 3 && s.pipeline.credits >= corePrice(s.pipeline)) {
      doAction({ type: "pipelineCore" });
    }
    if (!s.pipeline.architecture.autoBalance) {
      allocate(
        optimalAllocation(
          coreBudget(s.pipeline),
          pipelineRates(s),
          s.pipeline.allocation,
        ),
      );
    }
    if (s.pipeline.total >= 100 && s.pipeline.completed.length < PIPELINE_TRIALS.length) {
      if (s.pipeline.trial) {
        const def = PIPELINE_TRIALS.find((t) => t.id === s.pipeline.trial?.id);
        if (def && s.pipeline.trial.progress >= def.target) {
          doAction({ type: "claimTrial" });
          event(def.title);
        }
      }
      if (!s.pipeline.trial) {
        const next = PIPELINE_TRIALS.find((t) => !s.pipeline.completed.includes(t.id));
        if (next) {
          doAction({ type: "startTrial", id: next.id });
          allocate(
            next.id === "budget"
              ? [1, 1, 2]
              : next.id === "verification"
                ? [1, 4, 1]
                : [1, 1, 4],
            true,
          );
        }
      }
    }
    if (s.pipeline.completed.length === PIPELINE_TRIALS.length && !networkUnlocked(s)) {
      const a = s.pipeline.architecture;
      if (!a.blueprints.includes("cycle")) {
        arrange(["build", "verify", "deploy", null, null, null]);
        doAction({ type: "claimBlueprint", id: "cycle" });
        event("Повний цикл");
      }
      if (!s.pipeline.architecture.blueprints.includes("bus")) {
        arrange(["build", "bus", "verify", null, "deploy", null]);
        doAction({ type: "claimBlueprint", id: "bus" });
        event("Спільна шина");
      }
      if (!s.pipeline.architecture.blueprints.includes("flow")) {
        arrange(["build", "bus", "verify", null, "deploy", null]);
        allocate(
          optimalAllocation(
            coreBudget(s.pipeline),
            pipelineRates(s),
            s.pipeline.allocation,
          ),
        );
        if (blueprintReady(s, "flow")) {
          doAction({ type: "claimBlueprint", id: "flow" });
          doAction({ type: "architecturePolicy", id: "autoBalance", enabled: true });
          event("Потік / авторозподіл");
        }
      }
      if (
        s.pipeline.architecture.blueprints.includes("flow") &&
        !s.pipeline.architecture.blueprints.includes("studio")
      ) {
        arrange(["build", "archive", null, "manager", "verify", null]);
        doAction({ type: "claimBlueprint", id: "studio" });
        doAction({ type: "architecturePolicy", id: "autoCores", enabled: true });
        event("Архітектура / мережа");
      }
    }
    if (!networkUnlocked(s)) {
      continue;
    }
    if (!launched) {
      launched = true;
      event("Перший агент");
    }
    const n = s.pipeline.network;
    if (!n.autoBuy && second % 5 === 0) {
      const generator = [...GENERATORS]
        .reverse()
        .find(
          (g) =>
            generatorUnlocked(s, g.tier) &&
            n.purchased[g.tier] < NETWORK.purchaseLimit &&
            n.computations >= generatorPrice(s, g.tier),
        );
      if (generator) {
        doAction({ type: "networkBuy", tier: generator.tier });
      }
    }
    if (rebootReward(s) > 0 && s.pipeline.network.reboots < 2) {
      doAction({ type: "networkReboot" });
      event(`Перезапуск мережі ${String(s.pipeline.network.reboots)}`);
      doAction({
        type: "networkProtocol",
        id: s.pipeline.network.reboots === 1 ? "autobuy" : "cascade",
      });
      if (!s.pipeline.network.autoBuy) {
        doAction({ type: "networkAuto", enabled: true });
      }
      secondReboot = s.pipeline.network.reboots === 2;
    }
    if (secondReboot && generatorUnlocked(s, 3)) {
      event("Регіони");
      return { state: s, events };
    }
  }
  return { state: s, events };
}
const result = path();
it(`complete first discovery path: ${result.events.map((e) => `${e.title} ${String(e.seconds)}s`).join("; ")}`, () => {
  expect(networkUnlocked(result.state)).toBe(true);
  expect(result.state.pipeline.network.reboots).toBe(2);
  expect(generatorUnlocked(result.state, 3)).toBe(true);
  expect(result.state.pipeline.architecture.blueprints).toHaveLength(4);
  const firstReboot = result.events.find((e) => e.title === "Перезапуск мережі 1");
  expect(firstReboot?.seconds).toBeLessThan(3600);
  const networkAt = result.events.find((e) => e.title === "Перший агент")?.seconds ?? 0;
  expect((firstReboot?.seconds ?? Infinity) - networkAt).toBeLessThan(300);
  expect(result.events[result.events.length - 1]?.seconds).toBeLessThan(3300);
});

const low = path(true);
it(`low-click discovery path reaches regions at ${String(low.events[low.events.length - 1]?.seconds)}s`, () => {
  expect(networkUnlocked(low.state)).toBe(true);
  expect(low.state.pipeline.network.reboots).toBe(2);
  expect(generatorUnlocked(low.state, 3)).toBe(true);
  expect(low.events[low.events.length - 1]?.seconds).toBeLessThan(3600);
});
