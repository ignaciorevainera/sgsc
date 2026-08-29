export type MatchPlayer = { id: string; nickname: string; is_guest: boolean | null };

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function filterPlayerIds(players: MatchPlayer[], query: string): Set<string> {
  const nq = normalizeQuery(query);
  if (!nq) return new Set(players.map(p => p.id));
  const out = new Set<string>();
  for (const p of players) {
    const nn = normalizeQuery(p.nickname ?? "");
    if (nn.includes(nq)) out.add(p.id);
  }
  return out;
}

export function sortPlayers(players: MatchPlayer[]): MatchPlayer[] {
  return [...players].sort((a,b) => {
    const ag = a.is_guest ? 1 : 0;
    const bg = b.is_guest ? 1 : 0;
    if (ag !== bg) return ag - bg;
    return (a.nickname ?? "").localeCompare(b.nickname ?? "", "es", { sensitivity: "base" });
  });
}

export function mergePlayers(existing: MatchPlayer[], fresh: MatchPlayer[]): { merged: MatchPlayer[]; added: MatchPlayer[] } {
  const existingIds = new Set(existing.map(p => String(p.id)));
  const added = fresh.filter(p => !existingIds.has(String(p.id)));
  const merged = sortPlayers([...existing, ...added]);
  return { merged, added: sortPlayers(added) };
}
