import { describe, it, expect } from "vitest";
import { TIER_ORDER, TIER_STYLES, tierIndex } from "../../../../src/lib/gamification/types";

describe("tier types", () => {
  it("has 8 ordered tiers", () => {
    expect(TIER_ORDER).toHaveLength(8);
    expect(tierIndex("bronze")).toBe(0);
    expect(tierIndex("diamond")).toBe(7);
  });

  it("every tier has a name and style", () => {
    for (const key of TIER_ORDER) {
      expect(TIER_STYLES[key].name).toBeTruthy();
      expect(TIER_STYLES[key].style).toBeTruthy();
    }
  });

  it("tierIndex returns -1 for unknown", () => {
    expect(tierIndex("nope" as never)).toBe(-1);
  });
});
