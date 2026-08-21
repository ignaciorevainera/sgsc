import { describe, it, expect } from "vitest";
import { rollingWinRate, computeTrend } from "../../../../src/lib/stats/form";

describe("rollingWinRate", () => {
  it("returns null for empty", () => {
    expect(rollingWinRate([])).toBeNull();
  });

  it("computes last-5 win rate", () => {
    expect(rollingWinRate(["W", "L", "W", "L", "W"])).toBe(60);
  });

  it("uses shorter window when fewer matches", () => {
    expect(rollingWinRate(["W", "W", "L"])).toBe(67);
  });
});

describe("computeTrend", () => {
  it("improving when recent beats career by 5+", () => {
    expect(computeTrend(["W", "W", "W", "W", "W"], 40)).toBe("improving");
  });

  it("declining when recent below career by 5+", () => {
    expect(computeTrend(["L", "L", "L", "L", "L"], 80)).toBe("declining");
  });

  it("stable within ±5", () => {
    expect(computeTrend(["W", "L", "W", "L", "W"], 58)).toBe("stable");
  });

  it("stable for empty", () => {
    expect(computeTrend([], 50)).toBe("stable");
  });
});
