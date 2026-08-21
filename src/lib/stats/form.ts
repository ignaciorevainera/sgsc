import type { Outcome } from "./types";

export type Trend = "improving" | "declining" | "stable";

export function rollingWinRate(outcomes: Outcome[], window = 5): number | null {
  if (outcomes.length === 0) return null;
  const slice = outcomes.slice(-window);
  const wins = slice.filter((o) => o === "W").length;
  return Math.round((wins / slice.length) * 100);
}

export function computeTrend(outcomes: Outcome[], careerWinRate: number): Trend {
  if (outcomes.length === 0) return "stable";
  const recent = rollingWinRate(outcomes, 5) ?? 0;
  const diff = recent - careerWinRate;
  if (diff >= 5) return "improving";
  if (diff <= -5) return "declining";
  return "stable";
}
