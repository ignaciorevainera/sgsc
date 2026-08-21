import { describe, it, expect } from "vitest";
import { rivalryTier, narrativeHook } from "../../../../src/lib/stats/rivalry";

describe("rivalryTier", () => {
  it("null below 2 matches", () => {
    expect(rivalryTier(0)).toBeNull();
    expect(rivalryTier(1)).toBeNull();
  });
  it("casual 2-5", () => {
    expect(rivalryTier(2)).toBe("casual");
    expect(rivalryTier(5)).toBe("casual");
  });
  it("rival 6-10", () => {
    expect(rivalryTier(6)).toBe("rival");
    expect(rivalryTier(10)).toBe("rival");
  });
  it("legendary 11+", () => {
    expect(rivalryTier(11)).toBe("legendary");
  });
});

describe("narrativeHook", () => {
  it("null when no decided matches", () => {
    expect(narrativeHook(0, 0, "A", "B")).toBeNull();
  });
  it("returns A-dominates hook", () => {
    expect(narrativeHook(9, 3, "A", "B")).toBe("Cuando A gana, B pierde.");
  });
  it("returns B-dominates hook", () => {
    expect(narrativeHook(3, 9, "A", "B")).toBe("Cuando B gana, A pierde.");
  });
  it("null when balanced", () => {
    expect(narrativeHook(5, 5, "A", "B")).toBeNull();
  });
});
