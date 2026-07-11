const COMPACT_NUMBER_INTEGER_THRESHOLD = 100;

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
    { value: 1_000, suffix: "K" },
  ];
  const suffix = suffixes.find((item) => absoluteValue >= item.value);

  if (!suffix) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: absoluteValue >= COMPACT_NUMBER_INTEGER_THRESHOLD ? 0 : 1,
    }).format(absoluteValue)}`;
  }

  return `${sign}${(absoluteValue / suffix.value).toFixed(1)}${suffix.suffix}`;
}

export function formatCurrency(value: number) {
  return `$${formatNumber(value)}`;
}
