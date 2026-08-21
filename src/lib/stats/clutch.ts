export type ClutchState = "hot" | "cold" | "neutral";

export interface ClutchResult {
  delta: number;
  state: ClutchState;
}

export function computeClutch(recentWinRate: number, careerWinRate: number): ClutchResult {
  const delta = recentWinRate - careerWinRate;
  let state: ClutchState = "neutral";
  if (delta >= 20) state = "hot";
  else if (delta <= -20) state = "cold";
  return { delta, state };
}
