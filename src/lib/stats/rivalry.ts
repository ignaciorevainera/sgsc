export type RivalryTier = "casual" | "rival" | "legendary";

export function rivalryTier(matchesAgainst: number): RivalryTier | null {
  if (matchesAgainst < 2) return null;
  if (matchesAgainst <= 5) return "casual";
  if (matchesAgainst <= 10) return "rival";
  return "legendary";
}

export function narrativeHook(
  aWins: number,
  bWins: number,
  aName: string,
  bName: string,
): string | null {
  const decided = aWins + bWins;
  if (decided === 0) return null;
  const aRate = aWins / decided;
  if (aRate >= 0.75) return `Cuando ${aName} gana, ${bName} pierde.`;
  if (aRate <= 0.25) return `Cuando ${bName} gana, ${aName} pierde.`;
  return null;
}
