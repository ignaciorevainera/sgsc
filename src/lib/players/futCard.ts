export function getInitials(nickname: string | null | undefined): string {
  return nickname ? nickname.substring(0, 2).toUpperCase() : "NN";
}

export function getWinRate(wins: number, matchesPlayed: number): number {
  if (!matchesPlayed || matchesPlayed <= 0) return 0;
  return Math.round((wins / matchesPlayed) * 100);
}
