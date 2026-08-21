import { describe, it, expect } from "vitest";
import {
  computeBestDuoWins,
  computeNemesisWins,
  computeBestFieldWins,
  computeComebackStreak,
  computeIronMan,
  computeSocialButterfly,
} from "../../../../src/lib/gamification/metrics";
import type { OwnMatchRow, CoPlayerRow } from "../../../../src/lib/gamification/metrics";

const own = (id: string, date: string, team: string, result: string, field_id: string | null = null): OwnMatchRow => ({
  match_id: id,
  date,
  team,
  result,
  field_id,
});

const co = (match_id: string, player_id: string, team: string): CoPlayerRow => ({
  match_id,
  player_id,
  team,
});

describe("computeBestDuoWins", () => {
  it("counts wins with same teammate", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "dark"),
    ];
    const coRows = [
      co("m1", "b", "light"),
      co("m2", "b", "light"),
      co("m3", "b", "light"),
      co("m1", "c", "light"),
    ];
    expect(computeBestDuoWins("a", ownRows, coRows)).toBe(2);
  });
});

describe("computeNemesisWins", () => {
  it("counts wins against same opponent", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "draw"),
    ];
    const coRows = [
      co("m1", "b", "dark"),
      co("m2", "b", "dark"),
      co("m3", "b", "dark"),
    ];
    expect(computeNemesisWins("a", ownRows, coRows)).toBe(2);
  });
});

describe("computeBestFieldWins", () => {
  it("returns max wins at a single field", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light", "f1"),
      own("m2", "2026-01-02", "light", "light", "f1"),
      own("m3", "2026-01-03", "light", "light", "f2"),
    ];
    expect(computeBestFieldWins(ownRows)).toBe(2);
  });
});

describe("computeComebackStreak", () => {
  it("returns longest win run immediately after a loss", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "dark"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "light"),
      own("m4", "2026-01-04", "light", "light"),
    ];
    expect(computeComebackStreak(ownRows)).toBe(3);
  });

  it("returns 0 when no loss precedes a win run", () => {
    const ownRows = [own("m1", "2026-01-01", "light", "light")];
    expect(computeComebackStreak(ownRows)).toBe(0);
  });
});

describe("computeIronMan", () => {
  it("true when played every match in season", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "dark"),
    ];
    expect(computeIronMan(ownRows, 2)).toBe(true);
    expect(computeIronMan(ownRows, 3)).toBe(false);
  });
});

describe("computeSocialButterfly", () => {
  it("true when played with every other active player", () => {
    const coRows = [co("m1", "b", "light"), co("m2", "c", "dark")];
    expect(computeSocialButterfly(coRows, 3)).toBe(true);
    expect(computeSocialButterfly(coRows, 4)).toBe(false);
  });
});
