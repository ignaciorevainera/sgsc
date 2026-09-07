import { describe, it, expect, vi } from "vitest";
import {
  calculateHeadToHead,
  computeHeadToHead,
  type TeammateRivalEntry,
} from "../../../src/lib/utils/headToHead";

describe("calculateHeadToHead", () => {
  const currentUserId = "user-1";

  const sampleMatchEntries = [
    { match_id: "m1", team: "light", match: { result: "light" } },
    { match_id: "m2", team: "light", match: { result: "light" } },
    { match_id: "m3", team: "dark", match: { result: "light" } },
    { match_id: "m4", team: "dark", match: { result: "light" } },
  ];

  it("correctly derives best partner and nemesis in memory", () => {
    const teammatesAndRivals: TeammateRivalEntry[] = [
      { match_id: "m1", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "m1", player_id: "r1", team: "dark", player: { nickname: "RivalOne" } },
      { match_id: "m2", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "m2", player_id: "r1", team: "dark", player: { nickname: "RivalOne" } },
      { match_id: "m3", player_id: "p3", team: "dark", player: [{ nickname: "PartnerThree" }] },
      { match_id: "m3", player_id: "r1", team: "light", player: { nickname: "RivalOne" } },
      { match_id: "m4", player_id: "p3", team: "dark", player: [{ nickname: "PartnerThree" }] },
      { match_id: "m4", player_id: "r1", team: "light", player: { nickname: "RivalOne" } },
    ];

    const result = calculateHeadToHead(
      currentUserId,
      sampleMatchEntries,
      teammatesAndRivals,
    );

    expect(result.bestPartner).toEqual({
      id: "p2",
      nickname: "PartnerTwo",
      matches: 2,
      wins: 2,
      losses: 0,
    });

    expect(result.nemesis).toEqual({
      id: "r1",
      nickname: "RivalOne",
      matches: 4,
      wins: 2,
      losses: 0,
    });
  });

  it("handles minMatches threshold (returns undefined if < 2 matches)", () => {
    const teammatesAndRivals: TeammateRivalEntry[] = [
      { match_id: "m1", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "m1", player_id: "r1", team: "dark", player: { nickname: "RivalOne" } },
    ];

    const result = calculateHeadToHead(
      currentUserId,
      sampleMatchEntries,
      teammatesAndRivals,
    );

    expect(result.bestPartner).toBeUndefined();
    expect(result.nemesis).toBeUndefined();
  });

  it("ignores the target player if present in teammatesAndRivals", () => {
    const teammatesAndRivals: TeammateRivalEntry[] = [
      { match_id: "m1", player_id: currentUserId, team: "light", player: { nickname: "Me" } },
      { match_id: "m2", player_id: currentUserId, team: "light", player: { nickname: "Me" } },
    ];

    const result = calculateHeadToHead(
      currentUserId,
      sampleMatchEntries,
      teammatesAndRivals,
    );

    expect(result.bestPartner).toBeUndefined();
    expect(result.nemesis).toBeUndefined();
  });

  it("handles draw matches without counting wins for partner or rival", () => {
    const drawMatchEntries = [
      { match_id: "md1", team: "light", match: { result: "draw" } },
      { match_id: "md2", team: "light", match: { result: "draw" } },
    ];
    const teammatesAndRivals: TeammateRivalEntry[] = [
      { match_id: "md1", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "md1", player_id: "r1", team: "dark", player: { nickname: "RivalOne" } },
      { match_id: "md2", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "md2", player_id: "r1", team: "dark", player: { nickname: "RivalOne" } },
    ];

    const result = calculateHeadToHead(
      currentUserId,
      drawMatchEntries,
      teammatesAndRivals,
    );

    expect(result.bestPartner).toEqual({
      id: "p2",
      nickname: "PartnerTwo",
      matches: 2,
      wins: 0,
      losses: 0,
    });

    expect(result.nemesis).toEqual({
      id: "r1",
      nickname: "RivalOne",
      matches: 2,
      wins: 0,
      losses: 0,
    });
  });

  it("returns undefined for both if allMatchEntries or teammatesAndRivals is empty", () => {
    expect(calculateHeadToHead(currentUserId, [], [])).toEqual({
      bestPartner: undefined,
      nemesis: undefined,
    });
    expect(calculateHeadToHead(currentUserId, sampleMatchEntries, [])).toEqual({
      bestPartner: undefined,
      nemesis: undefined,
    });
  });
});

describe("computeHeadToHead", () => {
  const currentUserId = "user-1";
  const sampleMatchEntries = [
    { match_id: "m1", team: "light", match: { result: "light" } },
    { match_id: "m2", team: "light", match: { result: "light" } },
  ];

  it("delegates to in-memory calculation when preloaded teammate records are provided (bypassing supabase client)", async () => {
    const mockSupabase = {
      from: vi.fn(),
    };

    const preloadedTeammates: TeammateRivalEntry[] = [
      { match_id: "m1", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "m2", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
    ];

    const result = await computeHeadToHead(
      mockSupabase,
      currentUserId,
      sampleMatchEntries,
      preloadedTeammates,
    );

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result.bestPartner).toEqual({
      id: "p2",
      nickname: "PartnerTwo",
      matches: 2,
      wins: 2,
      losses: 0,
    });
  });

  it("queries supabase when preloadedTeammates is not provided", async () => {
    const dbTeammates: TeammateRivalEntry[] = [
      { match_id: "m1", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
      { match_id: "m2", player_id: "p2", team: "light", player: { nickname: "PartnerTwo" } },
    ];

    const chain: any = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: dbTeammates, error: null }),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue(chain),
    };

    const result = await computeHeadToHead(
      mockSupabase,
      currentUserId,
      sampleMatchEntries,
    );

    expect(mockSupabase.from).toHaveBeenCalledWith("match_players");
    expect(chain.select).toHaveBeenCalled();
    expect(chain.in).toHaveBeenCalledWith("match_id", ["m1", "m2"]);
    expect(chain.neq).toHaveBeenCalledWith("player_id", currentUserId);
    expect(chain.eq).toHaveBeenCalledWith("player.is_guest", false);
    expect(result.bestPartner?.id).toBe("p2");
  });

  it("returns undefined partner and nemesis if allMatchEntries is empty without querying supabase", async () => {
    const mockSupabase = {
      from: vi.fn(),
    };

    const result = await computeHeadToHead(
      mockSupabase,
      currentUserId,
      [],
    );

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result).toEqual({ bestPartner: undefined, nemesis: undefined });
  });
});
