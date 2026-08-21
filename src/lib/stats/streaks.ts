import type { Outcome } from "./types";

export type StreakType = "W" | "L" | "D";

export interface StreakInfo {
  currentType: StreakType | null;
  currentLength: number;
  longestWin: number;
  longestLoss: number;
}

export function computeStreaks(outcomes: Outcome[]): StreakInfo {
  if (outcomes.length === 0) {
    return { currentType: null, currentLength: 0, longestWin: 0, longestLoss: 0 };
  }

  let longestWin = 0;
  let longestLoss = 0;
  let winRun = 0;
  let lossRun = 0;

  for (const o of outcomes) {
    if (o === "W") {
      winRun++;
      lossRun = 0;
    } else if (o === "L") {
      lossRun++;
      winRun = 0;
    } else {
      winRun = 0;
      lossRun = 0;
    }
    if (winRun > longestWin) longestWin = winRun;
    if (lossRun > longestLoss) longestLoss = lossRun;
  }

  const last = outcomes[outcomes.length - 1];
  let currentLength = 0;
  for (let i = outcomes.length - 1; i >= 0; i--) {
    if (outcomes[i] === last) currentLength++;
    else break;
  }

  return { currentType: last, currentLength, longestWin, longestLoss };
}
