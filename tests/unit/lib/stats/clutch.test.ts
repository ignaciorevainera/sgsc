import { describe, it, expect } from "vitest";
import { computeClutch } from "../../../../src/lib/stats/clutch";

describe("computeClutch", () => {
  it("hot when +20 or more", () => {
    expect(computeClutch(70, 50)).toEqual({ delta: 20, state: "hot" });
  });

  it("cold when -20 or less", () => {
    expect(computeClutch(30, 55)).toEqual({ delta: -25, state: "cold" });
  });

  it("neutral otherwise", () => {
    expect(computeClutch(55, 50)).toEqual({ delta: 5, state: "neutral" });
  });
});
