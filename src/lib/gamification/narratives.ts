export interface Narrative {
  id: string;
  title: string;
  body: string;
}

export function detectTitleRace(
  leader: { nickname: string; points: number } | null,
  runnerUp: { nickname: string; points: number } | null,
  gamesLeft: number,
): Narrative | null {
  if (!leader || !runnerUp || gamesLeft <= 0) return null;
  const gap = leader.points - runnerUp.points;
  if (gap <= 0 || gap > 6) return null;
  return {
    id: "title-race",
    title: "Carrera por el título",
    body: `${leader.nickname} lidera por ${gap} puntos con ${gamesLeft} partidos restantes.`,
  };
}

export function detectComebackStory(
  players: { nickname: string; earlyRank: number; lateRank: number }[],
  totalPlayers: number,
): Narrative | null {
  if (totalPlayers === 0) return null;
  const bottom = Math.ceil(totalPlayers * 0.75);
  const top = Math.floor(totalPlayers * 0.25);
  const candidate = players.find((p) => p.earlyRank > bottom && p.lateRank <= top);
  if (!candidate) return null;
  return {
    id: "comeback",
    title: "Historia de remontada",
    body: `${candidate.nickname} escaló del fondo al top de la tabla en la temporada.`,
  };
}

export function detectRisingStar(
  players: { nickname: string; firstSeason: boolean; points: number }[],
): Narrative | null {
  if (players.length === 0) return null;
  const top3 = [...players].sort((a, b) => b.points - a.points).slice(0, 3);
  const star = players.find((p) => p.firstSeason && top3.some((t) => t.nickname === p.nickname));
  if (!star) return null;
  return {
    id: "rising-star",
    title: "Estrella en ascenso",
    body: `${star.nickname} brilla en su primera temporada dentro del top 3.`,
  };
}

export function detectVeteran(
  players: { nickname: string; matchesPlayed: number }[],
): Narrative | null {
  if (players.length === 0) return null;
  const vet = [...players].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0];
  return {
    id: "veteran",
    title: "Presencia veterana",
    body: `${vet.nickname} acumula ${vet.matchesPlayed} partidos, el máximo histórico.`,
  };
}

export function detectDuoDominance(
  seasonDuo: { names: string; winRate: number } | null,
  allTimeDuo: { names: string; winRate: number } | null,
): Narrative | null {
  if (!seasonDuo || !allTimeDuo) return null;
  if (seasonDuo.winRate <= allTimeDuo.winRate) return null;
  return {
    id: "duo-dominance",
    title: "Dominio de dupla",
    body: `${seasonDuo.names} (${seasonDuo.winRate}%) supera la mejor dupla histórica (${allTimeDuo.winRate}%).`,
  };
}
