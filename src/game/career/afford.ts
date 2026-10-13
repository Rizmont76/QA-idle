const COMPARISON_ULPS = 32;
export const affordable = (balance: number, cost: number) =>
  Number.isFinite(balance) &&
  Number.isFinite(cost) &&
  balance +
    Number.EPSILON * Math.max(1, Math.abs(balance), Math.abs(cost)) * COMPARISON_ULPS >=
    cost;
