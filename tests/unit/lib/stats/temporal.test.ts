import { describe, it, expect } from "vitest";
import { computeMonthPerformance, computeBestWorstMonth } from "../../../../src/lib/stats/temporal";
import type { MatchOutcomeInput } from "../../../../src/lib/stats/types";

const r = (date: string, team: "light" | "dark", result: "light" | "dark" | "draw"): MatchOutcomeInput => ({
  date,
  team,
  result,
});

describe("computeMonthPerformance", () => {
  it("returns empty for no records", () => {
    expect(computeMonthPerformance([])).toEqual([]);
  });

  it("aggregates wins per month", () => {
    const records = [
      r("2026-01-10", "light", "light"),
      r("2026-01-20", "light", "draw"),
      r("2026-02-05", "light", "dark"),
    ];
    const perfs = computeMonthPerformance(records);
    const jan = perfs.find((p) => p.month === 1);
    const feb = perfs.find((p) => p.month === 2);
    expect(jan).toEqual({ month: 1, matches: 2, wins: 1, winRate: 50 });
    expect(feb).toEqual({ month: 2, matches: 1, wins: 0, winRate: 0 });
  });
});

describe("computeBestWorstMonth", () => {
  it("returns nulls for no records", () => {
    expect(computeBestWorstMonth([])).toEqual({ bestMonth: null, worstMonth: null });
  });

  it("picks best and worst by win rate", () => {
    const records = [
      r("2026-01-05", "light", "light"),
      r("2026-01-15", "light", "light"),
      r("2026-02-05", "light", "dark"),
    ];
    const { bestMonth, worstMonth } = computeBestWorstMonth(records);
    expect(bestMonth?.month).toBe(1);
    expect(worstMonth?.month).toBe(2);
  });
});
