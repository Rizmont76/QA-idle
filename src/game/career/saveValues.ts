import { CAREER_RULES as R } from "./content";
import { bounded } from "./selectors";
export type RecordValue = Record<string, unknown>;
export function record(value: unknown): RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
}
export function amount(value: unknown, max: number = R.limit): number {
  return typeof value === "number" ? bounded(value, max) : 0;
}
export function ids(value: unknown, allowed: readonly string[]): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id: unknown): id is string => typeof id === "string" && allowed.includes(id),
          ),
        ),
      ]
    : [];
}
