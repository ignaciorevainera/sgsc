import { describe, it, expect } from "vitest";
import { computeSynergy } from "../../../../src/lib/stats/synergy";

const m = (id: string, win: boolean) => ({
  teammateId: id,
  teammateNickname: `P${id}`,
  win,
});

describe("computeSynergy", () => {
  it("filters teammates below min matches", () => {
    const matches = [
      m("a", true),
      m("a", true),
      m("a", true),
      m("b", true),
      m("b", false),
    ];
    const result = computeSynergy(matches, 3);
    expect(result).toHaveLength(1);
    expect(result[0].teammateId).toBe("a");
    expect(result[0].winRate).toBe(100);
  });

  it("sorts by win rate then matches, caps at top", () => {
    const matches = [
      m("a", true), m("a", true), m("a", true), // 100%, 3 matches
      m("b", true), m("b", true), m("b", false), // 67%, 3 matches
      m("c", true), m("c", false), m("c", false), // 33%, 3 matches
    ];
    const result = computeSynergy(matches, 3, 2);
    expect(result.map((e) => e.teammateId)).toEqual(["a", "b"]);
  });
});
