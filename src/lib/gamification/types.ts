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
  bronze: { name: "Bronce", style: "bg-orange-50 text-orange-900 border-orange-300" },
  silver: { name: "Plata", style: "bg-slate-50 text-slate-700 border-slate-300" },
  gold: { name: "Oro", style: "bg-yellow-50 text-yellow-800 border-yellow-400" },
  platinum: { name: "Platino", style: "bg-cyan-50 text-cyan-800 border-cyan-300" },
  sapphire: { name: "Zafiro", style: "bg-blue-50 text-blue-800 border-blue-400" },
  ruby: { name: "Rubí", style: "bg-rose-50 text-rose-800 border-rose-400" },
  emerald: { name: "Esmeralda", style: "bg-emerald-50 text-emerald-800 border-emerald-400" },
  diamond: { name: "Diamante", style: "bg-sky-50 text-sky-800 border-sky-400 shadow-md" },
};

export function tierIndex(tier: TierKey): number {
  return TIER_ORDER.indexOf(tier);
}
