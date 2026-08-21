export interface CumulativePoint {
  date: string;
  points: number;
}

export function computeCumulativePoints(
  matches: { date: string; outcome: "W" | "L" | "D" }[],
): CumulativePoint[] {
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  let acc = 0;
  return sorted.map((m) => {
    acc += m.outcome === "W" ? 3 : m.outcome === "D" ? 1 : 0;
    return { date: m.date, points: acc };
  });
}
