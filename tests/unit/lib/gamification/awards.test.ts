import { describe, it, expect } from "vitest";
import { computeTopPerformers } from "../../../../src/lib/gamification/awards";

describe("computeTopPerformers", () => {
  it("excludes players below min matches", () => {
    const result = computeTopPerformers(
      [{ playerId: "a", nickname: "A", points: 9, winRate: 90, matchesPlayed: 1 }],
      2,
    );
    expect(result).toEqual([]);
  });

  it("returns single winner by score", () => {
    const result = computeTopPerformers([
      { playerId: "a", nickname: "A", points: 6, winRate: 70, matchesPlayed: 3 },
      { playerId: "b", nickname: "B", points: 3, winRate: 50, matchesPlayed: 2 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe("a");
    expect(result[0].score).toBe(76);
  });

  it("returns all tied winners", () => {
    const result = computeTopPerformers([
      { playerId: "a", nickname: "A", points: 6, winRate: 70, matchesPlayed: 3 },
      { playerId: "b", nickname: "B", points: 6, winRate: 70, matchesPlayed: 3 },
    ]);
    expect(result).toHaveLength(2);
  });
});
