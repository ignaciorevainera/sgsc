export interface SynergyMatchInput {
  teammateId: string;
  teammateNickname: string;
  win: boolean;
}

export interface SynergyEntry {
  teammateId: string;
  teammateNickname: string;
  matchesTogether: number;
  winsTogether: number;
  winRate: number;
}

export function computeSynergy(
  matches: SynergyMatchInput[],
  minMatches = 3,
  top = 3,
): SynergyEntry[] {
  const map = new Map<string, { nickname: string; matches: number; wins: number }>();

  for (const m of matches) {
    const entry = map.get(m.teammateId) ?? { nickname: m.teammateNickname, matches: 0, wins: 0 };
    entry.matches++;
    if (m.win) entry.wins++;
    map.set(m.teammateId, entry);
  }

  return [...map.entries()]
    .map(([id, e]) => ({
      teammateId: id,
      teammateNickname: e.nickname,
      matchesTogether: e.matches,
      winsTogether: e.wins,
      winRate: Math.round((e.wins / e.matches) * 100),
    }))
    .filter((e) => e.matchesTogether >= minMatches)
    .sort((a, b) => b.winRate - a.winRate || b.matchesTogether - a.matchesTogether)
    .slice(0, top);
}
