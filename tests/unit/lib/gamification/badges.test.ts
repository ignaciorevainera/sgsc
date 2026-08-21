import { describe, it, expect } from "vitest";
import {
  computePlayerBadges,
  PROGRESSIVE_BADGES,
  SPECIAL_BADGES,
} from "../../../../src/lib/gamification/badges";
import type { BadgeMetrics } from "../../../../src/lib/gamification/badges";

const base: BadgeMetrics = {
  matchesPlayed: 0,
  wins: 0,
  points: 0,
  longestWinStreak: 0,
  bestDuoWins: 0,
  comebackStreak: 0,
  bestFieldWins: 0,
  nemesisWins: 0,
  clutchWinRate: 0,
  ironMan: false,
  underdog: false,
  socialButterfly: false,
  totalClubSeasons: 1,
  playedSeasons: 1,
  lightWins: 0,
  darkWins: 0,
};

describe("catalog", () => {
  it("has 8 progressive and 6 special badges", () => {
    expect(PROGRESSIVE_BADGES).toHaveLength(8);
    expect(SPECIAL_BADGES).toHaveLength(6);
  });

  it("every progressive badge has ascending thresholds", () => {
    for (const b of PROGRESSIVE_BADGES) {
      for (let i = 1; i < b.tiers.length; i++) {
        expect(b.tiers[i].threshold).toBeGreaterThan(b.tiers[i - 1].threshold);
      }
    }
  });
});

describe("computePlayerBadges", () => {
  it("no earned badges for zero metrics, but progress exists", () => {
    const { earned, progress } = computePlayerBadges(base);
    expect(earned).toHaveLength(0);
    expect(progress.length).toBeGreaterThan(0);
  });

  it("earns trayectory bronze at 5 matches", () => {
    const { earned } = computePlayerBadges({ ...base, matchesPlayed: 5 });
    expect(earned.find((b) => b.id === "trayectoria")?.tier).toBe("bronze");
  });

  it("earns rachas gold at 7 streak", () => {
    const { earned } = computePlayerBadges({ ...base, longestWinStreak: 7 });
    expect(earned.find((b) => b.id === "rachas")?.tier).toBe("gold");
  });

  it("progress toward next tier", () => {
    const { progress } = computePlayerBadges({ ...base, matchesPlayed: 5 });
    const tray = progress.find((p) => p.id === "trayectoria");
    expect(tray?.nextTier).toBe("silver");
    expect(tray?.nextThreshold).toBe(10);
    expect(tray?.progress).toBe(50);
  });

  it("earns special badges from thresholds/booleans", () => {
    const { earned } = computePlayerBadges({
      ...base,
      nemesisWins: 5,
      clutchWinRate: 85,
      ironMan: true,
      underdog: true,
      socialButterfly: true,
    });
    const ids = earned.filter((b) => b.tier === null).map((b) => b.id);
    expect(ids).toContain("nemesis");
    expect(ids).toContain("clutch-king");
    expect(ids).toContain("iron-man");
    expect(ids).toContain("underdog");
    expect(ids).toContain("social-butterfly");
  });

  it("earns presentismo when played every season", () => {
    const { earned } = computePlayerBadges({ ...base, totalClubSeasons: 3, playedSeasons: 3 });
    expect(earned.some((b) => b.id === "presentismo")).toBe(true);
  });

  it("earns especialista from light/dark wins", () => {
    const { earned } = computePlayerBadges({ ...base, lightWins: 4, darkWins: 1 });
    expect(earned.some((b) => b.id === "especialista-claro")).toBe(true);
  });
});
