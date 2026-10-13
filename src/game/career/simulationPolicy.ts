/* eslint-disable @typescript-eslint/no-magic-numbers -- Reproducible player policy for balance simulations, shared with regression tests. */
import type { CareerAction, CareerState } from "../../types";
import { act, advanceCareer } from "./engine";
import { CAREER_STAGES, CAREER_UPGRADES, CREW } from "./content";
import { PROJECTS, RESEARCH } from "./expansionData";
import { chapterInsightReserve, chapterIntent } from "./chapterActions";
import { chapterComplete } from "./chapters";
import { optimalAllocation, pipelineRates } from "./architectureEffects";
import {
  coreBudget,
  corePrice,
  delegatedPolicies,
  PIPELINE_TRIALS,
} from "./pipelineData";
import { mainBalanceUnlocked, pipelineUnlocked, trialUnlocked } from "./pipelineUnlocks";
import type { PipelineAllocation } from "../../types";
import {
  contractReady,
  hasAutoReport,
  production,
  prestigeReward,
  promotionReady,
  reportValue,
} from "./selectors";
import {
  projectReady,
  projectUnlocked,
  recruited,
  researchCost,
  researchUnlocked,
  specialistSlots,
} from "./studioSelectors";

export function campaign(
  initial: CareerState,
  lowClick = false,
  mastery = false,
  stopAtPrestige = false,
  fastBuys = false,
  delegate = false,
) {
  let state = initial;
  const start = initial.lastTick;
  const milestones: string[] = [];
  const rankSeconds: number[] = [];
  const incomeReached: Record<number, number> = {};
  const chapterReached: Record<number, number> = {};
  let director = 0;
  let founder = 0;
  let firstHire = 0;
  let automation = hasAutoReport(initial) ? 1 : 0;
  const discoveries: { title: string; seconds: number }[] = [];
  const actions: Partial<Record<CareerAction["type"], number>> = {};
  const result = (seconds: number) => ({
    state,
    seconds,
    milestones,
    rankSeconds,
    incomeReached,
    chapterReached,
    director,
    founder,
    firstHire,
    automation,
    discoveries,
    actions,
    managementActions: Object.entries(actions)
      .filter(([type]) => type !== "test" && type !== "report")
      .reduce((sum, [, count]) => sum + count, 0),
  });
  const doAction = (action: CareerAction) => {
    const outcome = act(state, action, state.lastTick);
    state = outcome.state;
    if (outcome.ok) {
      actions[action.type] = (actions[action.type] ?? 0) + 1;
    }
    const second = (state.lastTick - start) / 1_000;
    if (!firstHire && production(state) > 0) {
      firstHire = second;
    }
    if (!automation && hasAutoReport(state)) {
      automation = second;
    }
  };
  const allocate = (target: PipelineAllocation, trial = false) => {
    const allocation = () =>
      trial ? (state.pipeline.trial?.allocation ?? [0, 0, 0]) : state.pipeline.allocation;
    for (let station = 0; station < target.length; station++) {
      while ((allocation()[station] ?? 0) > (target[station] ?? 0)) {
        doAction({ type: "pipelineAllocate", station, delta: -1, trial });
      }
    }
    for (let station = 0; station < target.length; station++) {
      while ((allocation()[station] ?? 0) < (target[station] ?? 0)) {
        doAction({ type: "pipelineAllocate", station, delta: 1, trial });
      }
    }
  };
  for (let second = 1; second <= 43_200; second++) {
    state = advanceCareer(state, start + second * 1_000).state;
    if ((!lowClick && second % 2 === 0) || (!production(state) && second % 3 === 0)) {
      doAction({ type: "test" });
    }
    if (!hasAutoReport(state) && second % (lowClick ? 20 : 5) === 0) {
      doAction({ type: "report" });
    }
    const nextRank = CAREER_STAGES[state.stage + 1];
    if (nextRank && state.rankEarned >= nextRank.earned && !incomeReached[state.stage]) {
      incomeReached[state.stage] = second;
    }
    if (chapterComplete(state) && !chapterReached[state.stage]) {
      chapterReached[state.stage] = second;
    }
    if (promotionReady(state)) {
      doAction({ type: "promote" });
      milestones.push(`${CAREER_STAGES[state.stage]?.title ?? "?"}: ${String(second)}s`);
      rankSeconds.push(second);
      if (state.stage === 2) {
        discoveries.push({ title: "CI/CD → постійні автотести", seconds: second });
      }
      if (state.stage === 5) {
        director = second;
      }
      if (state.stage === 8) {
        founder = second;
      }
    }
    if (stopAtPrestige && prestigeReward(state) > 0) {
      return result(second);
    }
    if (state.stage >= 3 && !state.contract) {
      doAction({ type: "contract", id: "smoke" });
    }
    if (contractReady(state)) {
      doAction({ type: "claim" });
    }
    if (
      projectReady(state) &&
      (!delegate || mastery || !state.pipeline.automation.projects)
    ) {
      doAction({ type: "submitProject" });
    }
    if (PROJECTS.every((p) => (state.certificates[p.id] ?? 0) >= (mastery ? 3 : 1))) {
      return result(second);
    }
    if (!state.project && (!delegate || mastery || !state.pipeline.automation.projects)) {
      const next = PROJECTS.find(
        (p) =>
          (state.certificates[p.id] ?? 0) < (mastery ? 3 : 1) &&
          projectUnlocked(state, p),
      );
      if (next) {
        doAction({ type: "startProject", id: next.id });
      }
    }
    if (state.stage >= 1 && !hasAutoReport(state) && state.money >= 80) {
      doAction({ type: "upgrade", id: "auto" });
    }
    if (state.stage >= 1 && !hasAutoReport(state)) {
      continue;
    }
    if (second % 5 !== 0) {
      continue;
    }
    if (pipelineUnlocked(state)) {
      if (
        delegate &&
        mainBalanceUnlocked(state) &&
        !state.pipeline.architecture.autoBalance
      ) {
        doAction({ type: "pipelineBalance", enabled: true });
      }
      if (
        delegate &&
        delegatedPolicies(state.pipeline).some((p) => !state.pipeline.automation[p.id])
      ) {
        doAction({ type: "pipelineDelegate", enabled: true });
      }
      if (
        state.pipeline.coreLevel < 3 &&
        state.pipeline.credits >= corePrice(state.pipeline)
      ) {
        doAction({ type: "pipelineCore" });
      }
      if (!state.pipeline.architecture.autoBalance) {
        allocate(
          optimalAllocation(
            coreBudget(state.pipeline),
            pipelineRates(state),
            state.pipeline.allocation,
          ),
        );
      }
      if (state.pipeline.trial) {
        const trial = PIPELINE_TRIALS.find((t) => t.id === state.pipeline.trial?.id);
        if (trial && state.pipeline.trial.progress >= trial.target) {
          doAction({ type: "claimTrial" });
          discoveries.push({ title: trial.reward, seconds: second });
        }
      }
      if (!state.pipeline.trial) {
        const trial = PIPELINE_TRIALS.find(
          (t) => !state.pipeline.completed.includes(t.id) && trialUnlocked(state, t),
        );
        if (trial) {
          doAction({ type: "startTrial", id: trial.id });
          allocate(optimalAllocation(trial.cores, trial.rates, trial.allocation), true);
        }
      }
    }
    const chapterAction = chapterIntent(state);
    if (chapterAction) {
      doAction(chapterAction);
      if (chapterAction.type === "launchProduct") {
        doAction({ type: "productMode", id: chapterAction.id, mode: "internal" });
      }
    }
    const researchOrder = [
      "automation",
      "fieldnotes",
      "bargaining",
      "procurement",
      "leadership",
      "discoveries",
      "reputation",
      "pipelines",
      "intuition",
      "coordination",
    ];
    const research = researchOrder
      .map((id) => RESEARCH.find((r) => r.id === id))
      .find(
        (r) =>
          r &&
          researchUnlocked(state, r) &&
          (state.research[r.id] ?? 0) < r.max &&
          state.insights - chapterInsightReserve(state) >= researchCost(state, r),
      );
    if (research) {
      doAction({ type: "research", id: research.id });
    }
    const preferred = (
      state.stage >= 5 ? ["nika", "taras", "lev", "marta"] : ["lev", "taras", "marta"]
    )
      .filter((id) => recruited(state, id))
      .slice(0, specialistSlots(state));
    for (const id of state.specialists) {
      if (!preferred.includes(id)) {
        doAction({ type: "assignSpecialist", id });
      }
    }
    for (const id of preferred) {
      if (!state.specialists.includes(id)) {
        doAction({ type: "assignSpecialist", id });
      }
    }
    for (let purchase = 0; purchase < (fastBuys ? 30 : 1); purchase++) {
      const income = production(state) * reportValue(state);
      const choices: { action: CareerAction; score: number }[] = [];
      const options: CareerAction[] = [
        ...CREW.map((c) => ({
          type: "hire" as const,
          id: c.id,
          mode: fastBuys ? ("max" as const) : (1 as const),
        })),
        ...CAREER_UPGRADES.filter((u) => u.effect !== "offline").map((u) => ({
          type: "upgrade" as const,
          id: u.id,
        })),
      ];
      for (const action of options) {
        if (
          delegate &&
          ((action.type === "hire" && state.pipeline.automation.hire) ||
            (action.type === "upgrade" && state.pipeline.automation.upgrades))
        ) {
          continue;
        }
        const result = act(state, action, state.lastTick);
        if (!result.ok) {
          continue;
        }
        const cost = Math.max(1, state.money - result.state.money);
        const def =
          action.type === "upgrade"
            ? CAREER_UPGRADES.find((u) => u.id === action.id)
            : null;
        const manual =
          !lowClick && def && (def.effect === "click" || def.effect === "clickFlat")
            ? 1 / cost
            : 0;
        choices.push({
          action,
          score:
            (production(result.state) * reportValue(result.state) - income) / cost +
            manual,
        });
      }
      choices.sort((a, b) => b.score - a.score);
      if (choices[0]) {
        doAction(choices[0].action);
      } else {
        break;
      }
    }
  }
  return result(43_200);
}
