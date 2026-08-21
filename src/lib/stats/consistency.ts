import type { Outcome } from "./types";

const VALUE: Record<Outcome, number> = { W: 1, D: 0.5, L: 0 };

export function computeConsistency(outcomes: Outcome[]): number | null {
  if (outcomes.length < 3) return null;
  const mean = outcomes.reduce((acc, o) => acc + VALUE[o], 0) / outcomes.length;
  const variance =
    outcomes.reduce((acc, o) => acc + (VALUE[o] - mean) ** 2, 0) / outcomes.length;
  const stdDev = Math.sqrt(variance);
  return Math.round(100 * (1 - 2 * stdDev));
}
