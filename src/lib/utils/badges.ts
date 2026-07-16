export type TierKey =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "sapphire"
  | "ruby"
  | "emerald"
  | "diamond";

export type TierThreshold = [number, TierKey];

export interface Badge {
  label: string;
  icon: string;
  description: string;
  style: string;
  subLabel?: string;
}

const tiers: Record<TierKey, { name: string; style: string }> = {
  bronze: { name: "Bronce", style: "bg-orange-50 text-orange-900 border-orange-300" },
  silver: { name: "Plata", style: "bg-slate-50 text-slate-700 border-slate-300" },
  gold: { name: "Oro", style: "bg-yellow-50 text-yellow-800 border-yellow-400" },
  platinum: { name: "Platino", style: "bg-cyan-50 text-cyan-800 border-cyan-300" },
  sapphire: { name: "Zafiro", style: "bg-blue-50 text-blue-800 border-blue-400" },
  ruby: { name: "Rubí", style: "bg-rose-50 text-rose-800 border-rose-400" },
  emerald: { name: "Esmeralda", style: "bg-emerald-50 text-emerald-800 border-emerald-400" },
  diamond: { name: "Diamante", style: "bg-sky-50 text-sky-800 border-sky-400 shadow-md" },
};

const getTierBadge = (
  value: number,
  thresholds: TierThreshold[],
  baseLabel: string,
  icon: string,
  descriptionFn: (limit: number) => string,
): Badge | null => {
  for (const [limit, tierKey] of thresholds) {
    if (value >= limit) {
      return {
        label: baseLabel,
        icon,
        description: descriptionFn(limit),
        style: tiers[tierKey].style,
      };
    }
  }
  return null;
};

export function computeBadges(params: {
  matchesPlayed: number;
  wins: number;
  points: number;
  yearlyStats: { year: number; matches_played: number }[];
  totalClubSeasons: number;
  lightWins: number;
  darkWins: number;
  allHistory: { team: string; matches: unknown }[];
  getMatchData: (m: unknown) => { result: string } | null;
}): Badge[] {
  const badges: Badge[] = [];

  const matchThresholds: TierThreshold[] = [
    [40, "diamond"], [35, "emerald"], [30, "ruby"],
    [25, "sapphire"], [20, "platinum"], [15, "gold"],
    [10, "silver"], [5, "bronze"],
  ];
  const trayectoryBadge = getTierBadge(
    params.matchesPlayed, matchThresholds, "Trayectoria",
    "material-symbols:footprint",
    (limit) => `Superó los ${limit} partidos jugados`,
  );
  if (trayectoryBadge) badges.push(trayectoryBadge);

  const winThresholds: TierThreshold[] = [
    [25, "diamond"], [20, "emerald"], [17, "ruby"],
    [15, "sapphire"], [10, "platinum"], [7, "gold"],
    [5, "silver"], [3, "bronze"],
  ];
  const winnerBadge = getTierBadge(
    params.wins, winThresholds, "Ganador",
    "material-symbols:trophy",
    (limit) => `Acumula más de ${limit} victorias`,
  );
  if (winnerBadge) badges.push(winnerBadge);

  const pointsThresholds: TierThreshold[] = [
    [50, "diamond"], [40, "emerald"], [35, "ruby"],
    [30, "sapphire"], [25, "platinum"], [20, "gold"],
    [15, "silver"], [10, "bronze"],
  ];
  const legendBadge = getTierBadge(
    params.points, pointsThresholds, "Leyenda",
    "material-symbols:workspace-premium",
    (limit) => `Superó la barrera de los ${limit} puntos`,
  );
  if (legendBadge) badges.push(legendBadge);

  const validPlayerSeasons =
    params.yearlyStats.filter((y) => y.matches_played >= 3).length;

  if (params.totalClubSeasons > 1 && validPlayerSeasons === params.totalClubSeasons) {
    badges.push({
      label: "Presentismo",
      subLabel: "Perfecto",
      icon: "material-symbols:calendar-month",
      description: `Jugó todas las temporadas (${params.totalClubSeasons}) de la historia`,
      style: "bg-purple-50 text-purple-800 border-purple-400 shadow-md",
    });
  }

  if (params.lightWins > 0 || params.darkWins > 0) {
    if (params.lightWins > params.darkWins) {
      badges.push({
        label: "Especialista",
        icon: "material-symbols:sunny",
        description: "Rinde mejor con camiseta Clara",
        style: "bg-orange-50 text-orange-800 border-orange-300",
      });
    } else if (params.darkWins > params.lightWins) {
      badges.push({
        label: "Especialista",
        icon: "material-symbols:dark-mode",
        description: "Rinde mejor con camiseta Oscura",
        style: "bg-indigo-50 text-indigo-800 border-indigo-300",
      });
    }
  }

  const last3 = params.allHistory.slice(0, 3);
  const isOnFire =
    last3.length === 3 &&
    last3.every((m) => {
      const matchData = params.getMatchData(m.matches);
      return matchData?.result === m.team;
    });

  if (isOnFire) {
    badges.push({
      label: "En Racha",
      subLabel: "En Racha",
      icon: "material-symbols:local-fire-department",
      description: "Ganó sus últimos 3 partidos seguidos",
      style: "bg-red-50 text-red-700 border-red-400 animate-pulse",
    });
  }

  return badges;
}
