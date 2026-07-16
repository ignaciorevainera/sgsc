export interface TeamColorStats {
  played: number;
  wins: number;
  points: number;
  winRate: number;
}

export function computeColorStats(
  entries: { team: string; match: unknown }[],
): { light: TeamColorStats; dark: TeamColorStats } {
  const colorStats = {
    light: { played: 0, wins: 0, points: 0 },
    dark: { played: 0, wins: 0, points: 0 },
  };

  entries.forEach((entry) => {
    const matchData = Array.isArray(entry.match)
      ? (entry.match as { result: string }[])[0]
      : (entry.match as { result: string } | null);

    if (!matchData?.result) return;

    const result = matchData.result;
    const myTeam = entry.team?.toLowerCase().trim();
    if (myTeam !== "light" && myTeam !== "dark") return;

    const stats = colorStats[myTeam];
    stats.played++;

    if (result === myTeam) {
      stats.wins++;
      stats.points += 3;
    } else if (result === "draw") {
      stats.points += 1;
    }
  });

  const getWinRate = (wins: number, played: number): number =>
    played > 0 ? Math.round((wins / played) * 100) : 0;

  return {
    light: {
      ...colorStats.light,
      winRate: getWinRate(colorStats.light.wins, colorStats.light.played),
    },
    dark: {
      ...colorStats.dark,
      winRate: getWinRate(colorStats.dark.wins, colorStats.dark.played),
    },
  };
}
