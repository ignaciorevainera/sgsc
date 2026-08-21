export interface AwardCandidate {
  playerId: string;
  nickname: string;
  points: number;
  winRate: number;
  matchesPlayed: number;
}

export interface AwardWinner {
  playerId: string;
  nickname: string;
  score: number;
}

export function computeTopPerformers(
  candidates: AwardCandidate[],
  minMatches = 2,
): AwardWinner[] {
  const eligible = candidates.filter((c) => c.matchesPlayed >= minMatches);
  if (eligible.length === 0) return [];

  const scored = eligible.map((c) => ({
    playerId: c.playerId,
    nickname: c.nickname,
    score: c.points + c.winRate,
  }));

  const topScore = scored.reduce((max, c) => Math.max(max, c.score), scored[0].score);

  return scored.filter((c) => c.score === topScore);
}
