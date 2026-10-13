import type { ReleaseLabState } from "../../types";
import { LAB, labProducerUnlocked, autoUnlocked } from "./data";
import { newReleaseLab } from "./engine";

const MAX_IMPORT_LENGTH = 100_000;
const JSON_INDENT = 2;
const asRecord = (v: unknown): Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const amount = (v: unknown, max: number = LAB.limit) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : 0;
export function normalizeReleaseLab(value: unknown, now = Date.now()): ReleaseLabState {
  const d = asRecord(value);
  if (d["version"] !== 1) {
    throw new Error("Невідомий формат лабораторії.");
  }
  const s = newReleaseLab(now);
  s.patterns = Math.floor(amount(d["patterns"], LAB.patterns));
  s.builds = Math.floor(amount(d["builds"], s.patterns));
  s.buildWork = amount(d["buildWork"]);
  s.totalWork = Math.max(s.buildWork, amount(d["totalWork"]));
  s.reports = amount(
    d["reports"],
    Math.min(LAB.limit, s.buildWork + (s.builds > 0 ? LAB.resetReports : 0)),
  );
  s.efficiency = Math.floor(amount(d["efficiency"], LAB.efficiencyLevels));
  const bought = asRecord(d["bought"]);
  for (const id of ["testers", "scripts", "ci"] as const) {
    s.bought[id] = labProducerUnlocked(s, id)
      ? Math.floor(amount(bought[id], LAB.purchases))
      : 0;
  }
  const starter = s.builds > 0 ? 1 : 0;
  s.testers = Math.max(
    starter,
    Math.floor(amount(d["testers"], s.bought.testers + starter)),
  );
  if (labProducerUnlocked(s, "scripts")) {
    s.cases = amount(d["cases"]);
    s.scripts = Math.max(
      starter,
      amount(
        d["scripts"],
        labProducerUnlocked(s, "ci") ? LAB.limit : s.bought.scripts + starter,
      ),
    );
  }
  if (labProducerUnlocked(s, "ci")) {
    s.ci = Math.max(starter, Math.floor(amount(d["ci"], s.bought.ci + starter)));
  }
  s.autoBuy = autoUnlocked(s) && d["autoBuy"] === true;
  const tick = d["lastTick"];
  s.lastTick =
    typeof tick === "number" && Number.isFinite(tick) && tick >= 0
      ? Math.min(tick, now)
      : now;
  return s;
}
export function importReleaseLab(text: string, now = Date.now()): ReleaseLabState {
  if (text.length > MAX_IMPORT_LENGTH) {
    throw new Error("Збереження завелике.");
  }
  const parsed: unknown = JSON.parse(text);
  return normalizeReleaseLab(parsed, now);
}
export const exportReleaseLab = (s: ReleaseLabState) =>
  JSON.stringify(s, null, JSON_INDENT);
export function loadReleaseLab(storage: Pick<Storage, "getItem">, now = Date.now()) {
  let original: string | null = null;
  try {
    original = storage.getItem(LAB.key);
    return {
      state: original === null ? newReleaseLab(now) : importReleaseLab(original, now),
      blocked: false,
      original,
      warning: "",
    };
  } catch {
    return {
      state: newReleaseLab(now),
      blocked: original !== null,
      original,
      warning:
        "Не вдалося завантажити лабораторію. Оригінал збережено; експортуй його перед імпортом.",
    };
  }
}
