import { describe, it, expect } from "vitest";
import { computeComebackRate } from "../../../../src/lib/stats/comeback";

describe("computeComebackRate", () => {
  it("returns null when no loss is followed by a match", () => {
    expect(computeComebackRate([])).toBeNull();
    expect(computeComebackRate(["W", "W", "W"])).toBeNull();
    expect(computeComebackRate(["W", "L"])).toBeNull();
  });

  it("100% when every loss is followed by a win", () => {
    expect(computeComebackRate(["L", "W", "L", "W"])).toBe(100);
  });

  it("50% when half the losses bounce back", () => {
    expect(computeComebackRate(["L", "W", "L", "L"])).toBe(50);
  });
});
