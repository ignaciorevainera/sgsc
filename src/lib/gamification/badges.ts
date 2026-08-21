import type { TierKey } from "./types";
import { tierIndex } from "./types";

export type BadgeCategory =
  | "trayectoria"
  | "ganador"
  | "leyenda"
  | "rachas"
  | "duplas"
  | "consistencia"
  | "comeback"
  | "field"
  | "especial";

export interface ProgressiveBadge {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  tiers: { tier: TierKey; threshold: number }[];
}

export interface SpecialBadge {
  id: string;
  name: string;
  icon: string;
  category: "especial";
  description: string;
}

export const PROGRESSIVE_BADGES: ProgressiveBadge[] = [
  {
    id: "trayectoria",
    name: "Trayectoria",
    icon: "material-symbols:footprint",
    category: "trayectoria",
    tiers: [
      { tier: "bronze", threshold: 5 },
      { tier: "silver", threshold: 10 },
      { tier: "gold", threshold: 15 },
      { tier: "platinum", threshold: 20 },
      { tier: "sapphire", threshold: 25 },
      { tier: "ruby", threshold: 30 },
      { tier: "emerald", threshold: 35 },
      { tier: "diamond", threshold: 40 },
    ],
  },
  {
    id: "ganador",
    name: "Ganador",
    icon: "material-symbols:trophy",
    category: "ganador",
    tiers: [
      { tier: "bronze", threshold: 3 },
      { tier: "silver", threshold: 5 },
      { tier: "gold", threshold: 7 },
      { tier: "platinum", threshold: 10 },
      { tier: "sapphire", threshold: 15 },
      { tier: "ruby", threshold: 17 },
      { tier: "emerald", threshold: 20 },
      { tier: "diamond", threshold: 25 },
    ],
  },
  {
    id: "leyenda",
    name: "Leyenda",
    icon: "material-symbols:workspace-premium",
    category: "leyenda",
    tiers: [
      { tier: "bronze", threshold: 10 },
      { tier: "silver", threshold: 15 },
      { tier: "gold", threshold: 20 },
      { tier: "platinum", threshold: 25 },
      { tier: "sapphire", threshold: 30 },
      { tier: "ruby", threshold: 35 },
      { tier: "emerald", threshold: 40 },
      { tier: "diamond", threshold: 50 },
    ],
  },
  {
    id: "rachas",
    name: "Rachas",
    icon: "material-symbols:local-fire-department",
    category: "rachas",
    tiers: [
      { tier: "bronze", threshold: 3 },
      { tier: "silver", threshold: 5 },
      { tier: "gold", threshold: 7 },
    ],
  },
  {
    id: "duplas",
    name: "Duplas",
    icon: "material-symbols:group-add",
    category: "duplas",
    tiers: [
      { tier: "bronze", threshold: 5 },
      { tier: "silver", threshold: 10 },
      { tier: "gold", threshold: 15 },
    ],
  },
  {
    id: "consistencia",
    name: "Consistencia",
    icon: "material-symbols:calendar-month",
    category: "consistencia",
    tiers: [
      { tier: "bronze", threshold: 10 },
      { tier: "silver", threshold: 20 },
      { tier: "gold", threshold: 30 },
    ],
  },
  {
    id: "comeback",
    name: "Comeback",
    icon: "material-symbols:restart-alt",
    category: "comeback",
    tiers: [
      { tier: "bronze", threshold: 3 },
      { tier: "silver", threshold: 5 },
    ],
  },
  {
    id: "field",
    name: "Dueño de la Cancha",
    icon: "material-symbols:stadium",
    category: "field",
    tiers: [
      { tier: "bronze", threshold: 10 },
      { tier: "silver", threshold: 15 },
      { tier: "gold", threshold: 20 },
    ],
  },
];

export const SPECIAL_BADGES: SpecialBadge[] = [
  { id: "nemesis", name: "Némesis", icon: "material-symbols:swords", category: "especial", description: "Vencer al mismo rival 5+ veces" },
  { id: "clutch-king", name: "Rey del Clutch", icon: "material-symbols:whatshot", category: "especial", description: "80%+ victorias en últimos 5" },
  { id: "iron-man", name: "Iron Man", icon: "material-symbols:shield", category: "especial", description: "Jugó todos los partidos de la temporada" },
  { id: "underdog", name: "Underdog", icon: "material-symbols:pets", category: "especial", description: "Ganó remontando posiciones" },
  { id: "social-butterfly", name: "Social Butterfly", icon: "material-symbols:groups", category: "especial", description: "Jugó con todos los jugadores activos" },
  { id: "presentismo", name: "Presentismo Perfecto", icon: "material-symbols:event-available", category: "especial", description: "Jugó todas las temporadas" },
];

export interface BadgeMetrics {
  matchesPlayed: number;
  wins: number;
  points: number;
  longestWinStreak: number;
  bestDuoWins: number;
  comebackStreak: number;
  bestFieldWins: number;
  nemesisWins: number;
  clutchWinRate: number;
  ironMan: boolean;
  underdog: boolean;
  socialButterfly: boolean;
  totalClubSeasons: number;
  playedSeasons: number;
  lightWins: number;
  darkWins: number;
}

export interface EarnedBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: TierKey | null;
  category: BadgeCategory;
}

export interface BadgeProgress {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  current: number;
  nextTier: TierKey;
  nextThreshold: number;
  progress: number;
}

export interface PlayerBadges {
  earned: EarnedBadge[];
  progress: BadgeProgress[];
}

function metricValue(metrics: BadgeMetrics, category: BadgeCategory): number {
  switch (category) {
    case "trayectoria":
    case "consistencia":
      return metrics.matchesPlayed;
    case "ganador":
      return metrics.wins;
    case "leyenda":
      return metrics.points;
    case "rachas":
      return metrics.longestWinStreak;
    case "duplas":
      return metrics.bestDuoWins;
    case "comeback":
      return metrics.comebackStreak;
    case "field":
      return metrics.bestFieldWins;
    default:
      return 0;
  }
}

export function computePlayerBadges(metrics: BadgeMetrics): PlayerBadges {
  const earned: EarnedBadge[] = [];
  const progress: BadgeProgress[] = [];

  for (const badge of PROGRESSIVE_BADGES) {
    const value = metricValue(metrics, badge.category);
    const tiers = [...badge.tiers].sort(
      (a, b) => tierIndex(a.tier) - tierIndex(b.tier),
    );

    let earnedTier: TierKey | null = null;
    let next: { tier: TierKey; threshold: number } | null = null;

    for (const t of tiers) {
      if (value >= t.threshold) {
        earnedTier = t.tier;
      } else {
        next = t;
        break;
      }
    }

    if (earnedTier) {
      earned.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: `${badge.name} (${earnedTier})`,
        tier: earnedTier,
        category: badge.category,
      });
    }

    if (next) {
      progress.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        category: badge.category,
        current: value,
        nextTier: next.tier,
        nextThreshold: next.threshold,
        progress: Math.min(100, Math.round((value / next.threshold) * 100)),
      });
    }
  }

  if (metrics.nemesisWins >= 5) {
    earned.push({ id: "nemesis", name: "Némesis", icon: "material-symbols:swords", description: "Vencer al mismo rival 5+ veces", tier: null, category: "especial" });
  }
  if (metrics.clutchWinRate >= 80) {
    earned.push({ id: "clutch-king", name: "Rey del Clutch", icon: "material-symbols:whatshot", description: "80%+ victorias en últimos 5", tier: null, category: "especial" });
  }
  if (metrics.ironMan) {
    earned.push({ id: "iron-man", name: "Iron Man", icon: "material-symbols:shield", description: "Jugó todos los partidos de la temporada", tier: null, category: "especial" });
  }
  if (metrics.underdog) {
    earned.push({ id: "underdog", name: "Underdog", icon: "material-symbols:pets", description: "Ganó remontando posiciones", tier: null, category: "especial" });
  }
  if (metrics.socialButterfly) {
    earned.push({ id: "social-butterfly", name: "Social Butterfly", icon: "material-symbols:groups", description: "Jugó con todos los jugadores activos", tier: null, category: "especial" });
  }
  if (metrics.totalClubSeasons > 1 && metrics.playedSeasons === metrics.totalClubSeasons) {
    earned.push({ id: "presentismo", name: "Presentismo Perfecto", icon: "material-symbols:event-available", description: "Jugó todas las temporadas", tier: null, category: "especial" });
  }
  if (metrics.lightWins > metrics.darkWins) {
    earned.push({ id: "especialista-claro", name: "Especialista Claro", icon: "material-symbols:sunny", description: "Rinde mejor de claro", tier: null, category: "especial" });
  } else if (metrics.darkWins > metrics.lightWins) {
    earned.push({ id: "especialista-oscuro", name: "Especialista Oscuro", icon: "material-symbols:dark-mode", description: "Rinde mejor de oscuro", tier: null, category: "especial" });
  }

  return { earned, progress };
}
