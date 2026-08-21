export interface OwnMatchRow {
  match_id: string;
  date: string;
  team: string;
  result: string;
  field_id: string | null;
}

export interface CoPlayerRow {
  match_id: string;
  player_id: string;
  team: string;
}

function won(own: OwnMatchRow): boolean {
  return own.result === own.team;
}

export function computeBestDuoWins(
  playerId: string,
  ownRows: OwnMatchRow[],
  coRows: CoPlayerRow[],
): number {
  const ownByMatch = new Map(ownRows.map((r) => [r.match_id, r]));
  const wins = new Map<string, number>();

  for (const c of coRows) {
    if (c.player_id === playerId) continue;
    const own = ownByMatch.get(c.match_id);
    if (!own) continue;
    if (c.team !== own.team) continue;
    if (!won(own)) continue;
    wins.set(c.player_id, (wins.get(c.player_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeNemesisWins(
  playerId: string,
  ownRows: OwnMatchRow[],
  coRows: CoPlayerRow[],
): number {
  const ownByMatch = new Map(ownRows.map((r) => [r.match_id, r]));
  const wins = new Map<string, number>();

  for (const c of coRows) {
    if (c.player_id === playerId) continue;
    const own = ownByMatch.get(c.match_id);
    if (!own) continue;
    if (c.team === own.team) continue;
    if (!won(own)) continue;
    wins.set(c.player_id, (wins.get(c.player_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeBestFieldWins(ownRows: OwnMatchRow[]): number {
  const wins = new Map<string, number>();

  for (const r of ownRows) {
    if (!r.field_id) continue;
    if (!won(r)) continue;
    wins.set(r.field_id, (wins.get(r.field_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeComebackStreak(ownRows: OwnMatchRow[]): number {
  const sorted = [...ownRows].sort((a, b) => a.date.localeCompare(b.date));
  const outcomes = sorted.map((r) => (r.result === "draw" ? "D" : won(r) ? "W" : "L"));

  let best = 0;
  let run = 0;
  let afterLoss = false;

  for (const o of outcomes) {
    if (o === "W" && afterLoss) {
      run++;
    } else if (o === "W") {
      run = 0;
    } else if (o === "L") {
      run = 0;
      afterLoss = true;
    } else {
      run = 0;
      afterLoss = false;
    }
    if (run > best) best = run;
  }

  return best;
}

export function computeIronMan(ownRows: OwnMatchRow[], seasonMatchCount: number): boolean {
  const distinct = new Set(ownRows.map((r) => r.match_id));
  return seasonMatchCount > 0 && distinct.size >= seasonMatchCount;
}

export function computeSocialButterfly(
  coRows: CoPlayerRow[],
  activePlayerCount: number,
): boolean {
  const distinct = new Set(coRows.map((c) => c.player_id));
  return activePlayerCount > 1 && distinct.size >= activePlayerCount - 1;
}
