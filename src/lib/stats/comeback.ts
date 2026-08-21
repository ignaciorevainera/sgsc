import type { Outcome } from "./types";

export function computeComebackRate(outcomes: Outcome[]): number | null {
  let losses = 0;
  let comebacks = 0;
  for (let i = 0; i < outcomes.length - 1; i++) {
    if (outcomes[i] === "L") {
      losses++;
      if (outcomes[i + 1] === "W") comebacks++;
    }
  }
  if (losses === 0) return null;
  return Math.round((comebacks / losses) * 100);
}
