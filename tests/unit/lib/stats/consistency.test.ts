import { describe, it, expect } from "vitest";
import { computeConsistency } from "../../../../src/lib/stats/consistency";

describe("computeConsistency", () => {
  it("returns null below 3 matches", () => {
    expect(computeConsistency([])).toBeNull();
    expect(computeConsistency(["W"])).toBeNull();
    expect(computeConsistency(["W", "L"])).toBeNull();
  });

  it("all wins is perfectly predictable", () => {
    expect(computeConsistency(["W", "W", "W"])).toBe(100);
  });

  it("alternating is maximally unpredictable", () => {
    expect(computeConsistency(["W", "L", "W", "L"])).toBe(0);
  });
});
