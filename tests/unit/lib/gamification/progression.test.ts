import { describe, it, expect } from "vitest";
import { computeCumulativePoints } from "../../../../src/lib/gamification/progression";

describe("computeCumulativePoints", () => {
  it("returns empty for no matches", () => {
    expect(computeCumulativePoints([])).toEqual([]);
  });

  it("accumulates W=3 D=1 L=0", () => {
    const result = computeCumulativePoints([
      { date: "2026-01-01", outcome: "W" },
      { date: "2026-01-02", outcome: "D" },
      { date: "2026-01-03", outcome: "L" },
    ]);
    expect(result.map((p) => p.points)).toEqual([3, 4, 4]);
  });

  it("sorts chronologically", () => {
    const result = computeCumulativePoints([
      { date: "2026-01-03", outcome: "W" },
      { date: "2026-01-01", outcome: "W" },
    ]);
    expect(result[0].date).toBe("2026-01-01");
    expect(result[1].points).toBe(6);
  });
});
