import type { Outcome } from "./types";

export type SidePreference = "dark specialist" | "light specialist" | "balanced";

export interface SidePerformance {
  light: { matches: number; winRate: number };
  dark: { matches: number; winRate: number };
  preference: SidePreference;
}

export function computeSidePerformance(
  records: { team: "light" | "dark"; outcome: Outcome }[],
): SidePerformance {
  const acc = {
    light: { matches: 0, wins: 0 },
    dark: { matches: 0, wins: 0 },
  };

  for (const r of records) {
    if (r.team !== "light" && r.team !== "dark") continue;
    const s = acc[r.team];
    s.matches++;
    if (r.outcome === "W") s.wins++;
  }

  const light = {
    matches: acc.light.matches,
    winRate: acc.light.matches ? Math.round((acc.light.wins / acc.light.matches) * 100) : 0,
  };
  const dark = {
    matches: acc.dark.matches,
    winRate: acc.dark.matches ? Math.round((acc.dark.wins / acc.dark.matches) * 100) : 0,
  };

  let preference: SidePreference = "balanced";
  if (light.winRate > dark.winRate + 5) preference = "light specialist";
  else if (dark.winRate > light.winRate + 5) preference = "dark specialist";

  return { light, dark, preference };
}
