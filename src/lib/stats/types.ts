export type Outcome = "W" | "L" | "D";

export interface MatchOutcomeInput {
  date: string;
  team: "light" | "dark";
  result: "light" | "dark" | "draw";
  fieldId?: string | null;
  fieldName?: string | null;
}

export function toOutcome(team: string, result: string): Outcome {
  if (result === "draw") return "D";
  return team === result ? "W" : "L";
}
