import { toOutcome } from "./types";
import type { MatchOutcomeInput } from "./types";

export interface MonthPerformance {
  month: number;
  matches: number;
  wins: number;
  winRate: number;
}

export interface TemporalSummary {
  bestMonth: MonthPerformance | null;
  worstMonth: MonthPerformance | null;
}

export function computeMonthPerformance(records: MatchOutcomeInput[]): MonthPerformance[] {
  const map = new Map<number, { matches: number; wins: number }>();

  for (const rec of records) {
    const d = new Date(`${rec.date}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const month = d.getUTCMonth() + 1;
    const entry = map.get(month) ?? { matches: 0, wins: 0 };
    entry.matches++;
    if (toOutcome(rec.team, rec.result) === "W") entry.wins++;
    map.set(month, entry);
  }

  return [...map.entries()].map(([month, e]) => ({
    month,
    matches: e.matches,
    wins: e.wins,
    winRate: Math.round((e.wins / e.matches) * 100),
  }));
}

export function computeBestWorstMonth(records: MatchOutcomeInput[]): TemporalSummary {
  const perfs = computeMonthPerformance(records);
  if (perfs.length === 0) return { bestMonth: null, worstMonth: null };
  const sorted = [...perfs].sort(
    (a, b) => b.winRate - a.winRate || b.matches - a.matches,
  );
  return { bestMonth: sorted[0], worstMonth: sorted[sorted.length - 1] };
}
