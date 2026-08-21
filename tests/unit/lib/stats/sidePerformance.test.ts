import { describe, it, expect } from "vitest";
import { computeSidePerformance } from "../../../../src/lib/stats/sidePerformance";

describe("computeSidePerformance", () => {
  it("returns zeros for no records", () => {
    expect(computeSidePerformance([])).toEqual({
      light: { matches: 0, winRate: 0 },
      dark: { matches: 0, winRate: 0 },
      preference: "balanced",
    });
  });

  it("prefers light when light wins more", () => {
    const records = [
      { team: "light" as const, outcome: "W" as const },
      { team: "light" as const, outcome: "W" as const },
      { team: "dark" as const, outcome: "L" as const },
    ];
    expect(computeSidePerformance(records).preference).toBe("light specialist");
  });

  it("prefers dark when dark wins more", () => {
    const records = [
      { team: "light" as const, outcome: "L" as const },
      { team: "dark" as const, outcome: "W" as const },
      { team: "dark" as const, outcome: "W" as const },
    ];
    expect(computeSidePerformance(records).preference).toBe("dark specialist");
  });
});
