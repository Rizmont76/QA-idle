import { crewCount } from "./selectors";
import { BLUEPRINTS } from "./architectureData";
import { blueprintProgress } from "./architectureActions";
import { networkDiscovery, networkUnlocked } from "./networkEffects";
import type { CareerState } from "../../types";
import { CAREER_RULES, CAREER_STAGES } from "./content";
import { PIPELINE, PIPELINE_TRIALS } from "./pipelineData";

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
  if (s.careers < 1) {
    const rank = CAREER_STAGES[Math.min(s.stage + 1, CAREER_RULES.prestigeStage)];
    const missingCrew = Math.max(0, (rank?.crew ?? 0) - crewCount(s));
    const missingMoney = Math.max(0, (rank?.earned ?? 0) - s.earned);
    const step =
      missingCrew > 0
        ? `До ${rank?.title ?? "Director"} бракує ${String(missingCrew)} одиниць команди. Наймай команду на робочому місці.`
        : missingMoney > 0
          ? `До ${rank?.title ?? "Director"} залишилось заробити $${Math.ceil(missingMoney).toLocaleString("uk-UA")}.`
          : `Умови ${rank?.title ?? "Director"} виконані — прийми підвищення.`;
    return {
      title: "Перший престиж → CI/CD-конвеєр",
      detail:
        s.stage >= CAREER_RULES.prestigeStage
          ? "Рубіж досягнуто. Почни нову кар’єру й відкрий ядра, потоки та випробування."
          : step +
            " Перший престиж відкриє конвеєр, випробування й автоматизацію кар’єри.",
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
