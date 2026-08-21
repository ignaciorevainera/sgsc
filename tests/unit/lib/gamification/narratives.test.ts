import { describe, it, expect } from "vitest";
import {
  detectTitleRace,
  detectComebackStory,
  detectRisingStar,
  detectVeteran,
  detectDuoDominance,
} from "../../../../src/lib/gamification/narratives";

describe("detectTitleRace", () => {
  it("detects close race", () => {
    const n = detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 26 }, 3);
    expect(n?.id).toBe("title-race");
  });

  it("null when gap too big", () => {
    expect(detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 10 }, 3)).toBeNull();
  });

  it("null when no games left", () => {
    expect(detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 26 }, 0)).toBeNull();
  });
});

describe("detectComebackStory", () => {
  it("finds bottom-to-top climber", () => {
    const n = detectComebackStory(
      [{ nickname: "A", earlyRank: 16, lateRank: 4 }],
      20,
    );
    expect(n?.id).toBe("comeback");
  });

  it("null when no climber", () => {
    expect(detectComebackStory([{ nickname: "A", earlyRank: 5, lateRank: 6 }], 20)).toBeNull();
  });
});

describe("detectRisingStar", () => {
  it("rookie in top 3", () => {
    const players = [
      { nickname: "A", firstSeason: false, points: 30 },
      { nickname: "B", firstSeason: true, points: 28 },
      { nickname: "C", firstSeason: false, points: 25 },
    ];
    expect(detectRisingStar(players)?.id).toBe("rising-star");
  });

  it("null when no rookie in top 3", () => {
    const players = [
      { nickname: "A", firstSeason: false, points: 30 },
      { nickname: "B", firstSeason: false, points: 28 },
      { nickname: "C", firstSeason: false, points: 25 },
    ];
    expect(detectRisingStar(players)).toBeNull();
  });
});

describe("detectVeteran", () => {
  it("finds most matches", () => {
    const n = detectVeteran([
      { nickname: "A", matchesPlayed: 10 },
      { nickname: "B", matchesPlayed: 40 },
    ]);
    expect(n?.id).toBe("veteran");
    expect(n?.body).toContain("B");
  });

  it("null when empty", () => {
    expect(detectVeteran([])).toBeNull();
  });
});

describe("detectDuoDominance", () => {
  it("season duo beats all-time", () => {
    const n = detectDuoDominance(
      { names: "A & B", winRate: 80 },
      { names: "C & D", winRate: 60 },
    );
    expect(n?.id).toBe("duo-dominance");
  });

  it("null when season duo worse", () => {
    expect(detectDuoDominance({ names: "A & B", winRate: 50 }, { names: "C & D", winRate: 70 })).toBeNull();
  });
});
