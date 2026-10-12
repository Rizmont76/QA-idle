import { crewCount } from "./selectors";
import { BLUEPRINTS } from "./architectureData";
import { blueprintProgress } from "./architectureActions";
import { networkDiscovery, networkUnlocked } from "./networkEffects";
import type { CareerState } from "../../types";
import { CAREER_RULES, CAREER_STAGES } from "./content";
import { PIPELINE, PIPELINE_TRIALS } from "./pipelineData";
import { chapterRows } from "./chapters";
import { pipelineUnlocked, trialUnlocked } from "./pipelineUnlocks";
import type { CareerView } from "./discovery";

export function nextDiscovery(s: CareerState): {
  title: string;
  detail: string;
  value: number;
  target: number;
  action: string;
} {
  const p = s.pipeline;
  if (networkUnlocked(s)) {
    return networkDiscovery(s);
  }
  if (!pipelineUnlocked(s)) {
    const rank = CAREER_STAGES[s.stage + 1];
    const missingCrew = Math.max(0, (rank?.crew ?? 0) - crewCount(s));
    const missingMoney = Math.max(0, (rank?.earned ?? 0) - s.rankEarned);
    const missingGoal = chapterRows(s).find((r) => !r.done);
    const step =
      missingCrew > 0
        ? `До ${rank?.title ?? "Director"} бракує ${String(missingCrew)} одиниць команди. Наймай команду на робочому місці.`
        : missingMoney > 0
          ? `До ${rank?.title ?? "Director"} залишилось заробити $${Math.ceil(missingMoney).toLocaleString("uk-UA")}.`
          : missingGoal
            ? `Ціль рангу: ${missingGoal.title} — ${String(missingGoal.value)} / ${String(missingGoal.target)}.`
            : `Умови ${rank?.title ?? "Director"} виконані — прийми підвищення.`;
    return {
      title: (rank?.title ?? "Senior QA") + " → " + (rank?.unlock ?? "CI/CD-конвеєр"),
      detail: step,
      value: s.rankEarned,
      target: rank?.earned ?? 1,
      action: "До першого прориву",
    };
  }
  if (p.total < PIPELINE.hireAt) {
    return {
      title: "25 релізів → автонайм",
      detail: "Перерозподіляй ядра: швидкість усього потоку обмежує найслабший вузол.",
      value: p.total,
      target: PIPELINE.hireAt,
      action: "Налаштувати конвеєр",
    };
  }
  if (p.total < PIPELINE.trialsAt) {
    return {
      title: "100 релізів → випробування",
      detail:
        "Автонайм уже доступний. Далі — окремі задачі з новими обмеженнями та постійними нагородами.",
      value: p.total,
      target: PIPELINE.trialsAt,
      action: "Відкрити CI/CD",
    };
  }
  const trial = PIPELINE_TRIALS.find((t) => t.id === p.trial?.id);
  if (trial && p.trial) {
    return {
      title:
        p.trial.progress >= trial.target
          ? "Прорив готовий — забери нагороду"
          : trial.title + " → " + trial.reward,
      detail: "Основний конвеєр працює паралельно. Нагорода залишиться після престижу.",
      value: p.trial.progress,
      target: trial.target,
      action: "До випробування",
    };
  }
  if (p.completed.length < PIPELINE_TRIALS.length) {
    const available = PIPELINE_TRIALS.find(
      (t) => !p.completed.includes(t.id) && trialUnlocked(s, t),
    );
    if (!available) {
      const rank = CAREER_STAGES[s.stage + 1];
      return {
        title: (rank?.title ?? "Новий ранг") + " → наступне випробування",
        detail: rank?.unlock ?? "Продовжуй кар’єру, щоб відкрити наступний прорив.",
        value: s.rankEarned,
        target: rank?.earned ?? 1,
        action: "До підвищення",
      };
    }
    return {
      title: available.title + " → " + available.reward,
      detail: available.description + " Основний конвеєр продовжує створювати автотести.",
      value: p.completed.length,
      target: PIPELINE_TRIALS.length,
      action: "Обрати випробування",
    };
  }
  if (s.careers < 1) {
    return {
      title: "Перший престиж → серверна шафа",
      detail:
        "Автотести й автоматизація залишаться. Нова кар’єра відкриє модулі, які можна поєднувати у власні схеми.",
      value: Math.min(s.stage, CAREER_RULES.prestigeStage),
      target: CAREER_RULES.prestigeStage,
      action: "До першого престижу",
    };
  }
  const next = BLUEPRINTS.find((b) => !p.architecture.blueprints.includes(b.id));
  if (next) {
    return {
      title:
        next.id === "cycle"
          ? "Новий шар → серверна шафа"
          : next.title + " → нове відкриття",
      detail: next.description + " Нагорода: " + next.reward + ".",
      value: blueprintProgress(s, next.id),
      target: next.target,
      action: "До архітектури",
    };
  }
  return {
    title: "Студія працює за твоєю схемою",
    detail:
      "Усі креслення зібрані. Перемикай конфігурації між швидким конвеєром і сильною командою, збирай срібні та золоті сертифікати.",
    value: p.architecture.blueprints.length,
    target: BLUEPRINTS.length,
    action: "Налаштувати архітектуру",
  };
}

export const discoveryTarget = (s: CareerState): CareerView =>
  !pipelineUnlocked(s) ||
  (s.careers < 1 && s.pipeline.completed.length === PIPELINE_TRIALS.length) ||
  (s.pipeline.total >= PIPELINE.trialsAt &&
    !s.pipeline.trial &&
    s.pipeline.completed.length < PIPELINE_TRIALS.length &&
    !PIPELINE_TRIALS.some(
      (t) => !s.pipeline.completed.includes(t.id) && trialUnlocked(s, t),
    ))
    ? "career"
    : "pipeline";
