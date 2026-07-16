export interface PartnerResult {
  id: string;
  nickname: string;
  matches: number;
  wins: number;
  losses: number;
}

export async function computeHeadToHead(
  supabase: any,
  playerId: string,
  allMatchEntries: { match_id: string; team: string; match: unknown; player?: unknown }[],
): Promise<{
  bestPartner: PartnerResult | undefined;
  nemesis: PartnerResult | undefined;
}> {
  const myMatchIds = allMatchEntries.map((m) => m.match_id);
  const myMatchEntriesByMatchId = new Map(
    allMatchEntries.map((entry) => [entry.match_id, entry]),
  );

  if (myMatchIds.length === 0) {
    return { bestPartner: undefined, nemesis: undefined };
  }

  const res = await supabase
    .from("match_players")
    .select(
      `player_id, team, match_id, player:players!inner (nickname, is_guest)`,
    )
    .in("match_id", myMatchIds)
    .neq("player_id", playerId)
    .eq("player.is_guest", false);

  const teammatesAndRivals = (res.data ?? []) as {
    player_id: string;
    team: string;
    match_id: string;
    player: { nickname: string } | { nickname: string }[] | null;
  }[];

  const partnerStats = new Map<string, PartnerResult>();
  const rivalStats = new Map<string, PartnerResult>();

  teammatesAndRivals.forEach((entry) => {
    const myEntry = myMatchEntriesByMatchId.get(entry.match_id);
    if (!myEntry) return;

    const isTeammate = entry.team === myEntry.team;

    const myMatch = Array.isArray(myEntry.match)
      ? (myEntry.match as { result: string }[])[0]
      : (myEntry.match as { result: string } | null);
    const matchResult = myMatch?.result;

    if (!matchResult) return;

    const iWon = myEntry.team === matchResult;
    const iLost = matchResult !== "draw" && myEntry.team !== matchResult;

    const statsMap = isTeammate ? partnerStats : rivalStats;

    if (!statsMap.has(entry.player_id)) {
      const playerData = Array.isArray(entry.player)
        ? entry.player[0]
        : entry.player;
      const playerNickname = playerData?.nickname;

      statsMap.set(entry.player_id, {
        id: entry.player_id,
        nickname: playerNickname || "Desconocido",
        matches: 0,
        wins: 0,
        losses: 0,
      });
    }

    const current = statsMap.get(entry.player_id);
    if (current) {
      current.matches++;
      if (isTeammate) {
        if (iWon) current.wins++;
      } else {
        if (iLost) current.wins++;
      }
    }
  });

  const minMatches = 2;

  const bestPartner = [...partnerStats.values()]
    .filter((p) => p.matches >= minMatches)
    .sort(
      (a, b) => b.wins / b.matches - a.wins / a.matches || b.matches - a.matches,
    )[0];

  const nemesis = [...rivalStats.values()]
    .filter((r) => r.matches >= minMatches)
    .sort(
      (a, b) => b.wins / b.matches - a.wins / a.matches || b.matches - a.matches,
    )[0];

  return { bestPartner, nemesis };
}
