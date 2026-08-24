import type { TierKey } from "./types";
import { tierIndex, TIER_STYLES } from "./types";

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
  category: Exclude<BadgeCategory, "especial">;
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
    name: "Remontada",
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
  { id: "clutch-king", name: "Sangre Fría", icon: "material-symbols:whatshot", category: "especial", description: "80%+ victorias en últimos 5" },
  { id: "iron-man", name: "Hombre de Hierro", icon: "material-symbols:shield", category: "especial", description: "Jugó todos los partidos de la temporada" },
  { id: "underdog", name: "El Tapado", icon: "material-symbols:pets", category: "especial", description: "Ganó remontando posiciones" },
  { id: "social-butterfly", name: "Alma de la Fiesta", icon: "material-symbols:groups", category: "especial", description: "Jugó con todos los jugadores activos" },
  { id: "presentismo", name: "Presentismo Perfecto", icon: "material-symbols:event-available", category: "especial", description: "Jugó todas las temporadas" },
  { id: "especialista-claro", name: "Especialista Claro", icon: "material-symbols:sunny", category: "especial", description: "Rinde mejor de claro" },
  { id: "especialista-oscuro", name: "Especialista Oscuro", icon: "material-symbols:dark-mode", category: "especial", description: "Rinde mejor de oscuro" },
];

export interface BadgeMetrics {
  matchesPlayed: number;
  wins: number;
  points: number;
  longestWinStreak: number;
  bestDuoWins: number;
  bestDuoPartner?: string | null;
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
  howToGet: string;
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
  howToGet: string;
}

const METRIC_LABELS: Record<Exclude<BadgeCategory, "especial">, string> = {
  trayectoria: "partidos jugados",
  ganador: "victorias totales",
  leyenda: "puntos históricos",
  rachas: "victorias consecutivas",
  duplas: "victorias con el mismo compañero",
  consistencia: "partidos en la temporada",
  comeback: "victorias seguidas tras una derrota",
  field: "victorias en una misma cancha",
};

export interface PlayerBadges {
  earned: EarnedBadge[];
  progress: BadgeProgress[];
  locked: LockedBadge[];
}

export interface LockedBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  howToGet: string;
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

    const metricLabel = METRIC_LABELS[badge.category];
    const duoWith = badge.category === "duplas" && metrics.bestDuoPartner ? `victorias con ${metrics.bestDuoPartner}` : metricLabel;

    if (earnedTier) {
      const earnedThreshold = tiers.find((t) => t.tier === earnedTier)?.threshold ?? 0;
      earned.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: `${badge.name} (${TIER_STYLES[earnedTier].name})`,
        howToGet: `${earnedThreshold}+ ${duoWith}`,
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
        howToGet: `${next.threshold} ${duoWith} para ${TIER_STYLES[next.tier].name}`,
      });
    }
  }

  if (metrics.nemesisWins >= 5) {
    const d = "Vencer al mismo rival 5+ veces";
    earned.push({ id: "nemesis", name: "Némesis", icon: "material-symbols:swords", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.clutchWinRate >= 80) {
    const d = "80%+ victorias en últimos 5";
    earned.push({ id: "clutch-king", name: "Sangre Fría", icon: "material-symbols:whatshot", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.ironMan) {
    const d = "Jugó todos los partidos de la temporada";
    earned.push({ id: "iron-man", name: "Hombre de Hierro", icon: "material-symbols:shield", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.underdog) {
    const d = "Ganó remontando posiciones";
    earned.push({ id: "underdog", name: "El Tapado", icon: "material-symbols:pets", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.socialButterfly) {
    const d = "Jugó con todos los jugadores activos";
    earned.push({ id: "social-butterfly", name: "Alma de la Fiesta", icon: "material-symbols:groups", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.totalClubSeasons > 1 && metrics.playedSeasons === metrics.totalClubSeasons) {
    const d = "Jugó todas las temporadas";
    earned.push({ id: "presentismo", name: "Presentismo Perfecto", icon: "material-symbols:event-available", description: d, howToGet: d, tier: null, category: "especial" });
  }
  if (metrics.lightWins > metrics.darkWins) {
    const d = "Rinde mejor de claro";
    earned.push({ id: "especialista-claro", name: "Especialista Claro", icon: "material-symbols:sunny", description: d, howToGet: d, tier: null, category: "especial" });
  } else if (metrics.darkWins > metrics.lightWins) {
    const d = "Rinde mejor de oscuro";
    earned.push({ id: "especialista-oscuro", name: "Especialista Oscuro", icon: "material-symbols:dark-mode", description: d, howToGet: d, tier: null, category: "especial" });
  }

  const earnedIds = new Set(earned.map((b) => b.id));
  const locked: LockedBadge[] = SPECIAL_BADGES.filter((s) => !earnedIds.has(s.id)).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    description: s.description,
    howToGet: s.description,
  }));

  return { earned, progress, locked };
}
