export type TierKey =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "sapphire"
  | "ruby"
  | "emerald"
  | "diamond";

export const TIER_ORDER: TierKey[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "sapphire",
  "ruby",
  "emerald",
  "diamond",
];

export interface TierStyle {
  name: string;
  style: string;
}

export const TIER_STYLES: Record<TierKey, TierStyle> = {
  bronze: { name: "Bronce", style: "bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800" },
  silver: { name: "Plata", style: "bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-600" },
  gold: { name: "Oro", style: "bg-yellow-50 text-yellow-800 border-yellow-400 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-700" },
  platinum: { name: "Platino", style: "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-700" },
  sapphire: { name: "Zafiro", style: "bg-blue-50 text-blue-800 border-blue-400 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700" },
  ruby: { name: "Rubí", style: "bg-rose-50 text-rose-800 border-rose-400 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700" },
  emerald: { name: "Esmeralda", style: "bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700" },
  diamond: { name: "Diamante", style: "bg-sky-50 text-sky-800 border-sky-400 shadow-md dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700" },
};

export function tierIndex(tier: TierKey): number {
  return TIER_ORDER.indexOf(tier);
}
