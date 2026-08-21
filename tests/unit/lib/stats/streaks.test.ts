import { describe, it, expect } from "vitest";
import { computeStreaks } from "../../../../src/lib/stats/streaks";
import { toOutcome } from "../../../../src/lib/stats/types";

describe("computeStreaks", () => {
  it("returns empty info for no matches", () => {
    expect(computeStreaks([])).toEqual({
      currentType: null,
      currentLength: 0,
      longestWin: 0,
      longestLoss: 0,
    });
  });

  it("single win", () => {
    expect(computeStreaks(["W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 1,
      longestLoss: 0,
    });
  });

  it("two wins then a loss", () => {
    expect(computeStreaks(["W", "W", "L"])).toEqual({
      currentType: "L",
      currentLength: 1,
      longestWin: 2,
      longestLoss: 1,
    });
  });

  it("draws break runs", () => {
    expect(computeStreaks(["W", "W", "D", "W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 2,
      longestLoss: 0,
    });
  });

  it("longest loss run tracked", () => {
    expect(computeStreaks(["L", "L", "L", "W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 1,
      longestLoss: 3,
    });
  });
});

describe("toOutcome", () => {
  it("maps draw", () => {
    expect(toOutcome("dark", "draw")).toBe("D");
  });
  it("maps win when team equals result", () => {
    expect(toOutcome("light", "light")).toBe("W");
  });
  it("maps loss otherwise", () => {
    expect(toOutcome("light", "dark")).toBe("L");
  });
});
