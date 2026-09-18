const COMPACT_AT = 10_000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;
const PERCENT = 100;
const format = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
export function number(n: number): string {
  return n >= COMPACT_AT ? compact.format(n) : format.format(n);
}
export function cash(n: number): string {
  return `$${number(n)}`;
}
export function duration(s: number): string {
  if (!Number.isFinite(s)) {
    return "—";
  }
  if (s >= SECONDS_PER_HOUR) {
    return `${number(s / SECONDS_PER_HOUR)} год`;
  }
  if (s >= SECONDS_PER_MINUTE) {
    return `${String(Math.ceil(s / SECONDS_PER_MINUTE))} хв`;
  }
  return `${String(Math.ceil(Math.max(0, s)))} с`;
}
export function percent(value: number, target: number): number {
  return Math.min(PERCENT, Math.max(0, (value / Math.max(1, target)) * PERCENT));
}
