const INTEGER_DISPLAY_THRESHOLD = 100;
const COMPACT_DISPLAY_THRESHOLD = 1_000_000;

function getDisplayNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function formatNumber(value: number) {
  const displayValue = getDisplayNumber(value);
  const sign = displayValue < 0 ? "-" : "";
  const absoluteValue = Math.abs(displayValue);
  const suffixes = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
  ];
  const suffix =
    absoluteValue >= COMPACT_DISPLAY_THRESHOLD
      ? suffixes.find((item) => absoluteValue >= item.value)
      : undefined;

  if (!suffix) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: absoluteValue >= INTEGER_DISPLAY_THRESHOLD ? 0 : 1,
    }).format(absoluteValue)}`;
  }

  return `${sign}${(absoluteValue / suffix.value).toFixed(1)}${suffix.suffix}`;
}

export function formatCurrency(value: number) {
  return `$${formatNumber(value)}`;
}
