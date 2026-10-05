import { BLUEPRINTS } from "./architectureData";
import { blueprintProgress } from "./architectureActions";
import type { CareerState } from "../../types";
import { CAREER_RULES } from "./content";
import { PIPELINE, PIPELINE_TRIALS } from "./pipelineData";

export function nextDiscovery(s: CareerState): {
  title: string;
  detail: string;
  value: number;
  target: number;
  action: string;
} {
  const p = s.pipeline;
  if (s.careers < 1) {
    return {
      title: "Перший престиж → CI/CD-конвеєр",
      detail:
        s.stage >= CAREER_RULES.prestigeStage
          ? "Рубіж досягнуто. Почни нову кар’єру й відкрий ядра, потоки та випробування."
          : "Досягни Director і зроби престиж. Відкриється окремий конвеєр: розподіл ядер, випробування й автоматизація кар’єри.",
      value: Math.min(s.stage, CAREER_RULES.prestigeStage),
      target: CAREER_RULES.prestigeStage,
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
    return {
      title: "Обери наступний прорив",
      detail:
        "Більше ядер, автопроєкти або автоматична кар’єра — випробування можна проходити в будь-якому порядку.",
      value: p.completed.length,
      target: PIPELINE_TRIALS.length,
      action: "Обрати випробування",
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
