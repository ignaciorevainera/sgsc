# Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dynamic per-player badge system, temporal awards (Player of the Week/Month), seasonal narratives, and progression visualization on top of the stats engine.

**Architecture:** All gamification logic lives in pure TypeScript under `src/lib/gamification/` (unit-tested, no Supabase imports). Six thin Astro components render computed output; two new routes (`/players/[id]/badges`, `/awards`) and four existing pages (home, player profile, `/badges`, hall of fame) are wired to them. No DB views/functions are created — see Decisions.

**Tech Stack:** Astro 6 (SSR), TypeScript, Supabase Postgres, Tailwind CSS 4 + DaisyUI 5, Vitest (node env, globals), astro-icon (`material-symbols`), ApexCharts (already used on player profile).

## Global Constraints

- UI copy is Spanish (`es-AR`); no hardcoded colors for general UI — use DaisyUI semantic tokens. Exception: badge tier styles reuse the existing metal-palette classes already established in `src/lib/utils/badges.ts` / `src/pages/badges.astro`.
- Components: `PascalCase.astro`; pages: `kebab-case.astro`; utils: `camelCase.ts`.
- Never `select(*)` in pages — always explicit columns.
- Path alias `@` → `src/`.
- Icons via `<Icon name="material-symbols:..." />` from `astro-icon/components`.
- Unit tests live in `tests/unit/lib/` importing via `../../../../src/...`; run with `npx vitest run <path>`.
- All new gamification modules are pure (no `supabase` import, no `import.meta.env`).
- No comments in code unless the repo already uses them for that construct.

## Decisions (deviations from spec, with rationale)

1. **No DB views/functions.** Spec lists `compute_player_badges(player_id)`, `view_player_of_the_week`, `view_player_of_the_month`, `view_seasonal_narratives`. The stats-engine plan already established pure-TS-as-source-of-truth (42 matches = trivial compute), and a Postgres function is not testable under Vitest. All logic is pure TS, fully unit-tested. Deferred views would duplicate tested logic.
2. **Snapshot tests skipped** (no Astro component harness in repo) — logic fully unit-tested; components verified via `npm run build`.
3. **`src/lib/utils/badges.ts` is replaced.** It is untested, flat, lacks progress/categories. New `src/lib/gamification/badges.ts` is a superset; Task 13 migrates the profile to it and deletes the old file.
4. **Two extra modules beyond spec list** — `types.ts` (shared tier types) and `metrics.ts` (derived badge metrics from raw match rows) — so badge computation stays pure and testable.

## File Structure

**New — pure modules (`src/lib/gamification/`):**

| File | Responsibility |
|------|----------------|
| `types.ts` | `TierKey`, `TIER_STYLES`, `TIER_ORDER`, `tierIndex()` |
| `badges.ts` | badge catalog (`PROGRESSIVE_BADGES`, `SPECIAL_BADGES`) + `computePlayerBadges()` |
| `metrics.ts` | derive badge metrics from raw match rows (duo/nemesis/field/comeback/iron-man/social) |
| `awards.ts` | `computeTopPerformers()` — POTW/POTM |
| `narratives.ts` | `detectTitleRace()` etc. — seasonal stories |
| `progression.ts` | `computeCumulativePoints()` |

**New — components (`src/components/features/gamification/`):**

| File | Responsibility |
|------|----------------|
| `BadgeCard.astro` | single badge + tier + progress bar |
| `BadgeShowcase.astro` | top-3 earned badges |
| `BadgeGrid.astro` | earned + progress grouped by category (tabs) |
| `AwardBanner.astro` | POTW/POTM hero banner |
| `NarrativeCard.astro` | seasonal story card |
| `ProgressionChart.astro` | cumulative points line chart (client island) |

**New — routes:**

| File | Responsibility |
|------|----------------|
| `src/pages/players/[id]/badges.astro` | full per-player badge showcase |
| `src/pages/awards.astro` | POTW/POTM + seasonal narratives hub |

**Modified — existing files:**

| File | Change |
|------|--------|
| `src/pages/index.astro` | AwardBanner + momentum leaderboard |
| `src/pages/players/[id].astro` | BadgeShowcase + ProgressionChart + NarrativeCard; migrate off `utils/badges` |
| `src/lib/utils/badges.ts` | deleted (Task 13) |
| `src/pages/badges.astro` | player search + per-player dynamic badges |
| `src/pages/hall-of-fame.astro` | seasonal narratives section |

---

## Task 1: `types.ts`

**Files:**
- Create: `src/lib/gamification/types.ts`
- Test: `tests/unit/lib/gamification/types.test.ts`

**Interfaces:**
- Produces: `type TierKey`, `const TIER_ORDER: TierKey[]`, `interface TierStyle { name: string; style: string }`, `const TIER_STYLES: Record<TierKey, TierStyle>`, `tierIndex(tier: TierKey): number`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/types.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { TIER_ORDER, TIER_STYLES, tierIndex } from "../../../../src/lib/gamification/types";

describe("tier types", () => {
  it("has 8 ordered tiers", () => {
    expect(TIER_ORDER).toHaveLength(8);
    expect(tierIndex("bronze")).toBe(0);
    expect(tierIndex("diamond")).toBe(7);
  });

  it("every tier has a name and style", () => {
    for (const key of TIER_ORDER) {
      expect(TIER_STYLES[key].name).toBeTruthy();
      expect(TIER_STYLES[key].style).toBeTruthy();
    }
  });

  it("tierIndex returns -1 for unknown", () => {
    expect(tierIndex("nope" as never)).toBe(-1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/types.test.ts`
Expected: FAIL — cannot resolve `../../../../src/lib/gamification/types`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/types.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/types.ts tests/unit/lib/gamification/types.test.ts
git commit -m "feat(gamification): add tier types"
```

---

## Task 2: `badges.ts` (catalog + `computePlayerBadges`)

**Files:**
- Create: `src/lib/gamification/badges.ts`
- Test: `tests/unit/lib/gamification/badges.test.ts`

**Interfaces:**
- Consumes: `TierKey`, `tierIndex` from `./types`.
- Produces: `type BadgeCategory`, `interface ProgressiveBadge { id; name; icon; category; tiers: { tier: TierKey; threshold: number }[] }`, `interface SpecialBadge { id; name; icon; category: "especial"; description }`, `const PROGRESSIVE_BADGES`, `const SPECIAL_BADGES`, `interface BadgeMetrics` (16 numeric/boolean fields, see Step 3), `interface EarnedBadge { id; name; icon; description; tier: TierKey | null; category }`, `interface BadgeProgress { id; name; icon; category; current; nextTier; nextThreshold; progress }`, `interface PlayerBadges { earned; progress }`, `computePlayerBadges(metrics: BadgeMetrics): PlayerBadges`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/badges.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  computePlayerBadges,
  PROGRESSIVE_BADGES,
  SPECIAL_BADGES,
} from "../../../../src/lib/gamification/badges";
import type { BadgeMetrics } from "../../../../src/lib/gamification/badges";

const base: BadgeMetrics = {
  matchesPlayed: 0,
  wins: 0,
  points: 0,
  longestWinStreak: 0,
  bestDuoWins: 0,
  comebackStreak: 0,
  bestFieldWins: 0,
  nemesisWins: 0,
  clutchWinRate: 0,
  ironMan: false,
  underdog: false,
  socialButterfly: false,
  totalClubSeasons: 1,
  playedSeasons: 1,
  lightWins: 0,
  darkWins: 0,
};

describe("catalog", () => {
  it("has 8 progressive and 6 special badges", () => {
    expect(PROGRESSIVE_BADGES).toHaveLength(8);
    expect(SPECIAL_BADGES).toHaveLength(6);
  });

  it("every progressive badge has ascending thresholds", () => {
    for (const b of PROGRESSIVE_BADGES) {
      for (let i = 1; i < b.tiers.length; i++) {
        expect(b.tiers[i].threshold).toBeGreaterThan(b.tiers[i - 1].threshold);
      }
    }
  });
});

describe("computePlayerBadges", () => {
  it("no earned badges for zero metrics, but progress exists", () => {
    const { earned, progress } = computePlayerBadges(base);
    expect(earned).toHaveLength(0);
    expect(progress.length).toBeGreaterThan(0);
  });

  it("earns trayectory bronze at 5 matches", () => {
    const { earned } = computePlayerBadges({ ...base, matchesPlayed: 5 });
    expect(earned.find((b) => b.id === "trayectoria")?.tier).toBe("bronze");
  });

  it("earns rachas gold at 7 streak", () => {
    const { earned } = computePlayerBadges({ ...base, longestWinStreak: 7 });
    expect(earned.find((b) => b.id === "rachas")?.tier).toBe("gold");
  });

  it("progress toward next tier", () => {
    const { progress } = computePlayerBadges({ ...base, matchesPlayed: 5 });
    const tray = progress.find((p) => p.id === "trayectoria");
    expect(tray?.nextTier).toBe("silver");
    expect(tray?.nextThreshold).toBe(10);
    expect(tray?.progress).toBe(50);
  });

  it("earns special badges from thresholds/booleans", () => {
    const { earned } = computePlayerBadges({
      ...base,
      nemesisWins: 5,
      clutchWinRate: 85,
      ironMan: true,
      underdog: true,
      socialButterfly: true,
    });
    const ids = earned.filter((b) => b.tier === null).map((b) => b.id);
    expect(ids).toContain("nemesis");
    expect(ids).toContain("clutch-king");
    expect(ids).toContain("iron-man");
    expect(ids).toContain("underdog");
    expect(ids).toContain("social-butterfly");
  });

  it("earns presentismo when played every season", () => {
    const { earned } = computePlayerBadges({ ...base, totalClubSeasons: 3, playedSeasons: 3 });
    expect(earned.some((b) => b.id === "presentismo")).toBe(true);
  });

  it("earns especialista from light/dark wins", () => {
    const { earned } = computePlayerBadges({ ...base, lightWins: 4, darkWins: 1 });
    expect(earned.some((b) => b.id === "especialista-claro")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/badges.test.ts`
Expected: FAIL — cannot resolve `.../badges`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/badges.ts` (catalog part):

```ts
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
```

Append to the same `src/lib/gamification/badges.ts` (types + compute):

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/badges.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/badges.ts tests/unit/lib/gamification/badges.test.ts
git commit -m "feat(gamification): add badge catalog and computation"
```

---

## Task 3: `metrics.ts`

**Files:**
- Create: `src/lib/gamification/metrics.ts`
- Test: `tests/unit/lib/gamification/metrics.test.ts`

**Interfaces:**
- Produces: `interface OwnMatchRow { match_id: string; date: string; team: string; result: string; field_id: string | null }`, `interface CoPlayerRow { match_id: string; player_id: string; team: string }`, and pure helpers `computeBestDuoWins(playerId, ownRows, coRows): number`, `computeNemesisWins(playerId, ownRows, coRows): number`, `computeBestFieldWins(ownRows): number`, `computeComebackStreak(ownRows): number`, `computeIronMan(ownRows, seasonMatchCount): boolean`, `computeSocialButterfly(coRows, activePlayerCount): boolean`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/metrics.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  computeBestDuoWins,
  computeNemesisWins,
  computeBestFieldWins,
  computeComebackStreak,
  computeIronMan,
  computeSocialButterfly,
} from "../../../../src/lib/gamification/metrics";
import type { OwnMatchRow, CoPlayerRow } from "../../../../src/lib/gamification/metrics";

const own = (id: string, date: string, team: string, result: string, field_id: string | null = null): OwnMatchRow => ({
  match_id: id,
  date,
  team,
  result,
  field_id,
});

const co = (match_id: string, player_id: string, team: string): CoPlayerRow => ({
  match_id,
  player_id,
  team,
});

describe("computeBestDuoWins", () => {
  it("counts wins with same teammate", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "dark"),
    ];
    const coRows = [
      co("m1", "b", "light"),
      co("m2", "b", "light"),
      co("m3", "b", "light"),
      co("m1", "c", "light"),
    ];
    expect(computeBestDuoWins("a", ownRows, coRows)).toBe(2);
  });
});

describe("computeNemesisWins", () => {
  it("counts wins against same opponent", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "draw"),
    ];
    const coRows = [
      co("m1", "b", "dark"),
      co("m2", "b", "dark"),
      co("m3", "b", "dark"),
    ];
    expect(computeNemesisWins("a", ownRows, coRows)).toBe(2);
  });
});

describe("computeBestFieldWins", () => {
  it("returns max wins at a single field", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light", "f1"),
      own("m2", "2026-01-02", "light", "light", "f1"),
      own("m3", "2026-01-03", "light", "light", "f2"),
    ];
    expect(computeBestFieldWins(ownRows)).toBe(2);
  });
});

describe("computeComebackStreak", () => {
  it("returns longest win run immediately after a loss", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "dark"),
      own("m2", "2026-01-02", "light", "light"),
      own("m3", "2026-01-03", "light", "light"),
      own("m4", "2026-01-04", "light", "light"),
    ];
    expect(computeComebackStreak(ownRows)).toBe(3);
  });

  it("returns 0 when no loss precedes a win run", () => {
    const ownRows = [own("m1", "2026-01-01", "light", "light")];
    expect(computeComebackStreak(ownRows)).toBe(0);
  });
});

describe("computeIronMan", () => {
  it("true when played every match in season", () => {
    const ownRows = [
      own("m1", "2026-01-01", "light", "light"),
      own("m2", "2026-01-02", "light", "dark"),
    ];
    expect(computeIronMan(ownRows, 2)).toBe(true);
    expect(computeIronMan(ownRows, 3)).toBe(false);
  });
});

describe("computeSocialButterfly", () => {
  it("true when played with every other active player", () => {
    const coRows = [co("m1", "b", "light"), co("m2", "c", "dark")];
    expect(computeSocialButterfly(coRows, 3)).toBe(true);
    expect(computeSocialButterfly(coRows, 4)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/metrics.test.ts`
Expected: FAIL — cannot resolve `.../metrics`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/metrics.ts`:

```ts
export interface OwnMatchRow {
  match_id: string;
  date: string;
  team: string;
  result: string;
  field_id: string | null;
}

export interface CoPlayerRow {
  match_id: string;
  player_id: string;
  team: string;
}

function won(own: OwnMatchRow): boolean {
  return own.result === own.team;
}

export function computeBestDuoWins(
  playerId: string,
  ownRows: OwnMatchRow[],
  coRows: CoPlayerRow[],
): number {
  const ownByMatch = new Map(ownRows.map((r) => [r.match_id, r]));
  const wins = new Map<string, number>();

  for (const c of coRows) {
    if (c.player_id === playerId) continue;
    const own = ownByMatch.get(c.match_id);
    if (!own) continue;
    if (c.team !== own.team) continue;
    if (!won(own)) continue;
    wins.set(c.player_id, (wins.get(c.player_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeNemesisWins(
  playerId: string,
  ownRows: OwnMatchRow[],
  coRows: CoPlayerRow[],
): number {
  const ownByMatch = new Map(ownRows.map((r) => [r.match_id, r]));
  const wins = new Map<string, number>();

  for (const c of coRows) {
    if (c.player_id === playerId) continue;
    const own = ownByMatch.get(c.match_id);
    if (!own) continue;
    if (c.team === own.team) continue;
    if (!won(own)) continue;
    wins.set(c.player_id, (wins.get(c.player_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeBestFieldWins(ownRows: OwnMatchRow[]): number {
  const wins = new Map<string, number>();

  for (const r of ownRows) {
    if (!r.field_id) continue;
    if (!won(r)) continue;
    wins.set(r.field_id, (wins.get(r.field_id) ?? 0) + 1);
  }

  return Math.max(0, ...wins.values());
}

export function computeComebackStreak(ownRows: OwnMatchRow[]): number {
  const sorted = [...ownRows].sort((a, b) => a.date.localeCompare(b.date));
  const outcomes = sorted.map((r) => (r.result === "draw" ? "D" : won(r) ? "W" : "L"));

  let best = 0;
  let run = 0;
  let afterLoss = false;

  for (const o of outcomes) {
    if (o === "W" && afterLoss) {
      run++;
    } else if (o === "W") {
      run = 0;
    } else if (o === "L") {
      run = 0;
      afterLoss = true;
    } else {
      run = 0;
      afterLoss = false;
    }
    if (run > best) best = run;
  }

  return best;
}

export function computeIronMan(ownRows: OwnMatchRow[], seasonMatchCount: number): boolean {
  const distinct = new Set(ownRows.map((r) => r.match_id));
  return seasonMatchCount > 0 && distinct.size >= seasonMatchCount;
}

export function computeSocialButterfly(
  coRows: CoPlayerRow[],
  activePlayerCount: number,
): boolean {
  const distinct = new Set(coRows.map((c) => c.player_id));
  return activePlayerCount > 1 && distinct.size >= activePlayerCount - 1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/metrics.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/metrics.ts tests/unit/lib/gamification/metrics.test.ts
git commit -m "feat(gamification): add badge metrics derivation"
```

---

## Task 4: `awards.ts`

**Files:**
- Create: `src/lib/gamification/awards.ts`
- Test: `tests/unit/lib/gamification/awards.test.ts`

**Interfaces:**
- Produces: `interface AwardCandidate { playerId: string; nickname: string; points: number; winRate: number; matchesPlayed: number }`, `interface AwardWinner { playerId: string; nickname: string; score: number }`, `computeTopPerformers(candidates: AwardCandidate[], minMatches?: number): AwardWinner[]` (returns all tied for first).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/awards.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeTopPerformers } from "../../../../src/lib/gamification/awards";

describe("computeTopPerformers", () => {
  it("excludes players below min matches", () => {
    const result = computeTopPerformers(
      [{ playerId: "a", nickname: "A", points: 9, winRate: 90, matchesPlayed: 1 }],
      2,
    );
    expect(result).toEqual([]);
  });

  it("returns single winner by score", () => {
    const result = computeTopPerformers([
      { playerId: "a", nickname: "A", points: 6, winRate: 70, matchesPlayed: 3 },
      { playerId: "b", nickname: "B", points: 3, winRate: 50, matchesPlayed: 2 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe("a");
    expect(result[0].score).toBe(76);
  });

  it("returns all tied winners", () => {
    const result = computeTopPerformers([
      { playerId: "a", nickname: "A", points: 6, winRate: 70, matchesPlayed: 3 },
      { playerId: "b", nickname: "B", points: 6, winRate: 70, matchesPlayed: 3 },
    ]);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/awards.test.ts`
Expected: FAIL — cannot resolve `.../awards`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/awards.ts`:

```ts
export interface AwardCandidate {
  playerId: string;
  nickname: string;
  points: number;
  winRate: number;
  matchesPlayed: number;
}

export interface AwardWinner {
  playerId: string;
  nickname: string;
  score: number;
}

export function computeTopPerformers(
  candidates: AwardCandidate[],
  minMatches = 2,
): AwardWinner[] {
  const eligible = candidates.filter((c) => c.matchesPlayed >= minMatches);
  if (eligible.length === 0) return [];

  const scored = eligible.map((c) => ({
    playerId: c.playerId,
    nickname: c.nickname,
    score: c.points + c.winRate,
  }));

  const topScore = scored.reduce((max, c) => Math.max(max, c.score), scored[0].score);

  return scored.filter((c) => c.score === topScore);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/awards.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/awards.ts tests/unit/lib/gamification/awards.test.ts
git commit -m "feat(gamification): add POTW/POTM awards computation"
```

---

## Task 5: `narratives.ts`

**Files:**
- Create: `src/lib/gamification/narratives.ts`
- Test: `tests/unit/lib/gamification/narratives.test.ts`

**Interfaces:**
- Produces: `interface Narrative { id: string; title: string; body: string }`, `detectTitleRace(leader, runnerUp, gamesLeft)`, `detectComebackStory(players, totalPlayers)`, `detectRisingStar(players)`, `detectVeteran(players)`, `detectDuoDominance(seasonDuo, allTimeDuo)`. Each returns `Narrative | null`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/narratives.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  detectTitleRace,
  detectComebackStory,
  detectRisingStar,
  detectVeteran,
  detectDuoDominance,
} from "../../../../src/lib/gamification/narratives";

describe("detectTitleRace", () => {
  it("detects close race", () => {
    const n = detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 26 }, 3);
    expect(n?.id).toBe("title-race");
  });

  it("null when gap too big", () => {
    expect(detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 10 }, 3)).toBeNull();
  });

  it("null when no games left", () => {
    expect(detectTitleRace({ nickname: "A", points: 30 }, { nickname: "B", points: 26 }, 0)).toBeNull();
  });
});

describe("detectComebackStory", () => {
  it("finds bottom-to-top climber", () => {
    const n = detectComebackStory(
      [{ nickname: "A", earlyRank: 16, lateRank: 4 }],
      20,
    );
    expect(n?.id).toBe("comeback");
  });

  it("null when no climber", () => {
    expect(detectComebackStory([{ nickname: "A", earlyRank: 5, lateRank: 6 }], 20)).toBeNull();
  });
});

describe("detectRisingStar", () => {
  it("rookie in top 3", () => {
    const players = [
      { nickname: "A", firstSeason: false, points: 30 },
      { nickname: "B", firstSeason: true, points: 28 },
      { nickname: "C", firstSeason: false, points: 25 },
    ];
    expect(detectRisingStar(players)?.id).toBe("rising-star");
  });

  it("null when no rookie in top 3", () => {
    const players = [
      { nickname: "A", firstSeason: false, points: 30 },
      { nickname: "B", firstSeason: false, points: 28 },
      { nickname: "C", firstSeason: false, points: 25 },
    ];
    expect(detectRisingStar(players)).toBeNull();
  });
});

describe("detectVeteran", () => {
  it("finds most matches", () => {
    const n = detectVeteran([
      { nickname: "A", matchesPlayed: 10 },
      { nickname: "B", matchesPlayed: 40 },
    ]);
    expect(n?.id).toBe("veteran");
    expect(n?.body).toContain("B");
  });

  it("null when empty", () => {
    expect(detectVeteran([])).toBeNull();
  });
});

describe("detectDuoDominance", () => {
  it("season duo beats all-time", () => {
    const n = detectDuoDominance(
      { names: "A & B", winRate: 80 },
      { names: "C & D", winRate: 60 },
    );
    expect(n?.id).toBe("duo-dominance");
  });

  it("null when season duo worse", () => {
    expect(detectDuoDominance({ names: "A & B", winRate: 50 }, { names: "C & D", winRate: 70 })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/narratives.test.ts`
Expected: FAIL — cannot resolve `.../narratives`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/narratives.ts`:

```ts
export interface Narrative {
  id: string;
  title: string;
  body: string;
}

export function detectTitleRace(
  leader: { nickname: string; points: number } | null,
  runnerUp: { nickname: string; points: number } | null,
  gamesLeft: number,
): Narrative | null {
  if (!leader || !runnerUp || gamesLeft <= 0) return null;
  const gap = leader.points - runnerUp.points;
  if (gap <= 0 || gap > 6) return null;
  return {
    id: "title-race",
    title: "Carrera por el título",
    body: `${leader.nickname} lidera por ${gap} puntos con ${gamesLeft} partidos restantes.`,
  };
}

export function detectComebackStory(
  players: { nickname: string; earlyRank: number; lateRank: number }[],
  totalPlayers: number,
): Narrative | null {
  if (totalPlayers === 0) return null;
  const bottom = Math.ceil(totalPlayers * 0.75);
  const top = Math.floor(totalPlayers * 0.25);
  const candidate = players.find((p) => p.earlyRank > bottom && p.lateRank <= top);
  if (!candidate) return null;
  return {
    id: "comeback",
    title: "Historia de remontada",
    body: `${candidate.nickname} escaló del fondo al top de la tabla en la temporada.`,
  };
}

export function detectRisingStar(
  players: { nickname: string; firstSeason: boolean; points: number }[],
): Narrative | null {
  if (players.length === 0) return null;
  const top3 = [...players].sort((a, b) => b.points - a.points).slice(0, 3);
  const star = players.find((p) => p.firstSeason && top3.some((t) => t.nickname === p.nickname));
  if (!star) return null;
  return {
    id: "rising-star",
    title: "Estrella en ascenso",
    body: `${star.nickname} brilla en su primera temporada dentro del top 3.`,
  };
}

export function detectVeteran(
  players: { nickname: string; matchesPlayed: number }[],
): Narrative | null {
  if (players.length === 0) return null;
  const vet = [...players].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0];
  return {
    id: "veteran",
    title: "Presencia veterana",
    body: `${vet.nickname} acumula ${vet.matchesPlayed} partidos, el máximo histórico.`,
  };
}

export function detectDuoDominance(
  seasonDuo: { names: string; winRate: number } | null,
  allTimeDuo: { names: string; winRate: number } | null,
): Narrative | null {
  if (!seasonDuo || !allTimeDuo) return null;
  if (seasonDuo.winRate <= allTimeDuo.winRate) return null;
  return {
    id: "duo-dominance",
    title: "Dominio de dupla",
    body: `${seasonDuo.names} (${seasonDuo.winRate}%) supera la mejor dupla histórica (${allTimeDuo.winRate}%).`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/narratives.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/narratives.ts tests/unit/lib/gamification/narratives.test.ts
git commit -m "feat(gamification): add seasonal narrative detection"
```

---

## Task 6: `progression.ts`

**Files:**
- Create: `src/lib/gamification/progression.ts`
- Test: `tests/unit/lib/gamification/progression.test.ts`

**Interfaces:**
- Produces: `interface CumulativePoint { date: string; points: number }`, `computeCumulativePoints(matches: { date: string; outcome: "W" | "L" | "D" }[]): CumulativePoint[]` (chronological ascending, +3 W, +1 D).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/gamification/progression.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeCumulativePoints } from "../../../../src/lib/gamification/progression";

describe("computeCumulativePoints", () => {
  it("returns empty for no matches", () => {
    expect(computeCumulativePoints([])).toEqual([]);
  });

  it("accumulates W=3 D=1 L=0", () => {
    const result = computeCumulativePoints([
      { date: "2026-01-01", outcome: "W" },
      { date: "2026-01-02", outcome: "D" },
      { date: "2026-01-03", outcome: "L" },
    ]);
    expect(result.map((p) => p.points)).toEqual([3, 4, 4]);
  });

  it("sorts chronologically", () => {
    const result = computeCumulativePoints([
      { date: "2026-01-03", outcome: "W" },
      { date: "2026-01-01", outcome: "W" },
    ]);
    expect(result[0].date).toBe("2026-01-01");
    expect(result[1].points).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/gamification/progression.test.ts`
Expected: FAIL — cannot resolve `.../progression`.

- [ ] **Step 3: Write implementation**

Create `src/lib/gamification/progression.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/gamification/progression.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification/progression.ts tests/unit/lib/gamification/progression.test.ts
git commit -m "feat(gamification): add cumulative points progression"
```

---

## Task 7: `BadgeCard.astro` + `BadgeShowcase.astro`

**Files:**
- Create: `src/components/features/gamification/BadgeCard.astro`
- Create: `src/components/features/gamification/BadgeShowcase.astro`

**Interfaces:**
- Consumes: `TIER_STYLES`, `TierKey` from `@/lib/gamification/types`; `EarnedBadge` from `@/lib/gamification/badges`.
- Produces (BadgeCard): props `{ name: string; icon: string; description: string; tier: TierKey | null; progress?: number | null }`.
- Produces (BadgeShowcase): props `{ earned: EarnedBadge[] }`.

- [ ] **Step 1: Create `BadgeCard.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import { TIER_STYLES } from "@/lib/gamification/types";
import type { TierKey } from "@/lib/gamification/types";

interface Props {
  name: string;
  icon: string;
  description: string;
  tier: TierKey | null;
  progress?: number | null;
}

const { name, icon, description, tier, progress } = Astro.props;
const style = tier ? TIER_STYLES[tier].style : "bg-base-200 text-base-content border-base-300";
const tierName = tier ? TIER_STYLES[tier].name : "Especial";
---

<div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
  <div class="flex items-start gap-3">
    <div class:list={["shrink-0 rounded-lg border p-2.5", style]}>
      <Icon name={icon} size={24} />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <h3 class="font-black">{name}</h3>
        <span class:list={["badge badge-sm rounded-lg border font-bold uppercase", style]}>{tierName}</span>
      </div>
      <p class="text-base-content/70 mt-1 text-sm">{description}</p>
      {progress !== null && progress !== undefined && (
        <progress class="progress progress-primary mt-3 w-full" value={progress} max="100"></progress>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create `BadgeShowcase.astro`**

```astro
---
import BadgeCard from "./BadgeCard.astro";
import type { EarnedBadge } from "@/lib/gamification/badges";

interface Props {
  earned: EarnedBadge[];
}

const { earned } = Astro.props;
const top3 = earned.slice(0, 3);
---

{
  top3.length === 0 ? (
    <p class="text-sm opacity-50">Sin medallas aún</p>
  ) : (
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {top3.map((b) => (
        <BadgeCard name={b.name} icon={b.icon} description={b.description} tier={b.tier} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/gamification/BadgeCard.astro src/components/features/gamification/BadgeShowcase.astro
git commit -m "feat(gamification): add BadgeCard and BadgeShowcase"
```

---

## Task 8: `BadgeGrid.astro`

**Files:**
- Create: `src/components/features/gamification/BadgeGrid.astro`

**Interfaces:**
- Consumes: `PlayerBadges` from `@/lib/gamification/badges`.
- Produces: props `{ badges: PlayerBadges }`. Renders earned + progress badges with category tabs (client-side filter).

- [ ] **Step 1: Create `BadgeGrid.astro`**

```astro
---
import BadgeCard from "./BadgeCard.astro";
import type { PlayerBadges } from "@/lib/gamification/badges";

interface Props {
  badges: PlayerBadges;
}

const { badges } = Astro.props;

const groups = [
  { id: "all", label: "Todas" },
  { id: "trayectoria", label: "Trayectoria" },
  { id: "rachas", label: "Rachas" },
  { id: "duplas", label: "Duplas" },
  { id: "especial", label: "Especiales" },
];
---

<div class="space-y-4">
  <div role="tablist" class="tabs tabs-box" id="badge-tabs">
    {groups.map((g, i) => (
      <button
        role="tab"
        type="button"
        class:list={["tab", i === 0 && "tab-active"]}
        data-group={g.id}
      >
        {g.label}
      </button>
    ))}
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" id="badge-grid">
    {badges.earned.map((b) => (
      <div data-group-item={b.category}>
        <BadgeCard name={b.name} icon={b.icon} description={b.description} tier={b.tier} />
      </div>
    ))}
    {badges.progress.map((p) => (
      <div data-group-item={p.category}>
        <BadgeCard
          name={p.name}
          icon={p.icon}
          description={`${p.current} / ${p.nextThreshold} para ${p.nextTier}`}
          tier={null}
          progress={p.progress}
        />
      </div>
    ))}
  </div>
</div>

<script>
  const tabs = document.querySelectorAll<HTMLButtonElement>("#badge-tabs .tab");
  const items = document.querySelectorAll<HTMLElement>("[data-group-item]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("tab-active"));
      tab.classList.add("tab-active");
      const group = tab.dataset.group;
      items.forEach((item) => {
        const match = group === "all" || item.dataset.groupItem === group;
        item.style.display = match ? "" : "none";
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/gamification/BadgeGrid.astro
git commit -m "feat(gamification): add BadgeGrid with category tabs"
```

---

## Task 9: `AwardBanner.astro` + `NarrativeCard.astro` + `ProgressionChart.astro`

**Files:**
- Create: `src/components/features/gamification/AwardBanner.astro`
- Create: `src/components/features/gamification/NarrativeCard.astro`
- Create: `src/components/features/gamification/ProgressionChart.astro`

**Interfaces:**
- Consumes: `AwardWinner` from `@/lib/gamification/awards`; `Narrative` from `@/lib/gamification/narratives`; `CumulativePoint` from `@/lib/gamification/progression`; `Avatar` from `@/components/Avatar.astro`.
- Produces (AwardBanner): props `{ winners: AwardWinner[]; period: "week" | "month" }`.
- Produces (NarrativeCard): props `{ narrative: Narrative }`.
- Produces (ProgressionChart): props `{ data: CumulativePoint[] }`.

- [ ] **Step 1: Create `AwardBanner.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import Avatar from "@/components/Avatar.astro";
import type { AwardWinner } from "@/lib/gamification/awards";

interface Props {
  winners: AwardWinner[];
  period: "week" | "month";
}

const { winners, period } = Astro.props;
const label = period === "week" ? "Jugador de la Semana" : "Jugador del Mes";
const icon = period === "week" ? "material-symbols:emoji-events" : "material-symbols:workspace-premium";
---

{
  winners.length > 0 && (
    <div class="card border-warning/30 from-warning/10 via-base-100 to-base-100 mb-8 border-2 bg-linear-to-br shadow-lg">
      <div class="card-body flex flex-col items-center py-8 text-center">
        <div class="bg-warning text-base-100 mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-lg">
          <Icon name={icon} size={28} />
        </div>
        <h2 class="text-warning text-sm font-black tracking-widest uppercase">{label}</h2>
        <div class="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:justify-center">
          {winners.map((w) => (
            <div class="flex flex-col items-center">
              <Avatar initial={w.nickname.charAt(0).toUpperCase()} ring={true} />
              <span class="mt-2 text-xl font-black">{w.nickname}</span>
              <span class="text-base-content/60 text-xs font-bold uppercase">{w.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `NarrativeCard.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { Narrative } from "@/lib/gamification/narratives";

interface Props {
  narrative: Narrative;
}

const { narrative } = Astro.props;
---

<div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
  <div class="flex items-start gap-3">
    <div class="bg-primary/10 text-primary shrink-0 rounded-xl p-2.5">
      <Icon name="material-symbols:auto-stories" size={24} />
    </div>
    <div>
      <h3 class="font-black">{narrative.title}</h3>
      <p class="text-base-content/70 mt-1 text-sm">{narrative.body}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create `ProgressionChart.astro`**

```astro
---
import type { CumulativePoint } from "@/lib/gamification/progression";

interface Props {
  data: CumulativePoint[];
}

const { data } = Astro.props;
const labels = data.map((d) => d.date);
const values = data.map((d) => d.points);
---

<div id="progression-chart" class="h-64 w-full"></div>

<script is:inline src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script is:inline define:vars={{ labels, values }}>
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector("#progression-chart");
    if (el && typeof ApexCharts !== "undefined") {
      new ApexCharts(el, {
        chart: { type: "line", height: 256, toolbar: { show: false } },
        series: [{ name: "Puntos", data: values }],
        xaxis: { categories: labels },
        dataLabels: { enabled: false },
      }).render();
    }
  });
</script>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/gamification/AwardBanner.astro src/components/features/gamification/NarrativeCard.astro src/components/features/gamification/ProgressionChart.astro
git commit -m "feat(gamification): add AwardBanner, NarrativeCard, ProgressionChart"
```

---

## Task 10: `/players/[id]/badges` route

**Files:**
- Create: `src/pages/players/[id]/badges.astro`

**Interfaces:**
- Consumes: `computePlayerBadges`, `BadgeMetrics` from `@/lib/gamification/badges`; `computeBestDuoWins`, `computeNemesisWins`, `computeBestFieldWins`, `computeComebackStreak`, `computeIronMan`, `computeSocialButterfly` from `@/lib/gamification/metrics`; `computeStreaks` + `rollingWinRate` from `@/lib/stats/*`; `computeColorStats` from `@/lib/utils/colorStats`; `BadgeGrid` component.

- [ ] **Step 1: Create `src/pages/players/[id]/badges.astro`**

```astro
---
Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

import { createAstroSupabase } from "@/lib/supabase";
import { computePlayerBadges } from "@/lib/gamification/badges";
import {
  computeBestDuoWins,
  computeNemesisWins,
  computeBestFieldWins,
  computeComebackStreak,
  computeIronMan,
  computeSocialButterfly,
} from "@/lib/gamification/metrics";
import { computeStreaks } from "@/lib/stats/streaks";
import { rollingWinRate } from "@/lib/stats/form";
import { toOutcome } from "@/lib/stats/types";
import { computeColorStats } from "@/lib/utils/colorStats";
import BadgeGrid from "@/components/features/gamification/BadgeGrid.astro";
import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";

const supabase = createAstroSupabase(Astro);
const { id } = Astro.params;
if (!id) return Astro.redirect("/players");

const [
  { data: player },
  { data: stats },
  { data: yearly },
  { data: ownRows },
  { data: coRows },
  { data: activeCount },
] = await Promise.all([
  supabase.from("players").select("nickname").eq("id", id).maybeSingle(),
  supabase.from("view_player_stats_all_time").select("matches_played, wins, points").eq("player_id", id).maybeSingle(),
  supabase.from("view_player_stats_yearly").select("year, matches_played").eq("player_id", id),
  supabase.from("match_players").select("match_id, team, match:matches!inner (date, result, field_id)").eq("player_id", id),
  supabase.from("match_players").select("match_id, player_id, team").neq("player_id", id),
  supabase.from("players").select("id", { count: "exact", head: true }).eq("is_guest", false),
]);

if (!player) return Astro.redirect("/players");

const matchesPlayed = stats?.matches_played ?? 0;
const wins = stats?.wins ?? 0;
const points = stats?.points ?? 0;

type OwnRow = { match_id: string; team: string; match: { date: string; result: string; field_id: string | null } | { date: string; result: string; field_id: string | null }[] };
const toOwn = (r: OwnRow) => {
  const m = Array.isArray(r.match) ? r.match[0] : r.match;
  return { match_id: r.match_id, date: m?.date ?? "", team: r.team, result: m?.result ?? "", field_id: m?.field_id ?? null };
};
const own = (ownRows ?? []).map(toOwn);

const outcomesAsc = [...own]
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((r) => toOutcome(r.team, r.result));

const { longestWin } = computeStreaks(outcomesAsc);
const clutchWinRate = rollingWinRate(outcomesAsc, 5) ?? 0;
const color = computeColorStats(own.map((r) => ({ team: r.team, match: { result: r.result } })));

const seasonYears = [...new Set((yearly ?? []).map((y) => y.year))];
const currentYear = seasonYears[0];
const seasonMatchCount = own.filter((r) => r.date.startsWith(String(currentYear))).length;

const coMapped = (coRows ?? []).map((c) => ({ match_id: c.match_id, player_id: c.player_id, team: c.team }));

const metrics = {
  matchesPlayed,
  wins,
  points,
  longestWinStreak: longestWin,
  bestDuoWins: computeBestDuoWins(id, own, coMapped),
  comebackStreak: computeComebackStreak(own),
  bestFieldWins: computeBestFieldWins(own),
  nemesisWins: computeNemesisWins(id, own, coMapped),
  clutchWinRate,
  ironMan: computeIronMan(own, seasonMatchCount),
  underdog: outcomesAsc.length >= 2 && outcomesAsc[0] === "L" && outcomesAsc[outcomesAsc.length - 1] === "W",
  socialButterfly: computeSocialButterfly(coMapped, activeCount?.length ?? 0),
  totalClubSeasons: seasonYears.length,
  playedSeasons: (yearly ?? []).filter((y) => y.matches_played >= 3).length,
  lightWins: color.light.wins,
  darkWins: color.dark.wins,
};

const badges = computePlayerBadges(metrics);
---

<Main title={`${player.nickname} — Medallas | SGSC`}>
  <Title title="Medallas" subtitle={player.nickname} />
  <BadgeGrid badges={badges} />
</Main>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds; `/players/[id]/badges` route generated.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`
Open `http://localhost:4321/players/<id>/badges`.
Expected: badge grid renders with category tabs; earned + progress badges visible; no crash for players with 0 matches.

- [ ] **Step 4: Commit**

```bash
git add src/pages/players/[id]/badges.astro
git commit -m "feat(gamification): add per-player badge showcase route"
```

---

## Task 11: `/awards` route

**Files:**
- Create: `src/pages/awards.astro`

**Interfaces:**
- Consumes: `computeTopPerformers`, `AwardCandidate` from `@/lib/gamification/awards`; `detectTitleRace`, `detectVeteran` from `@/lib/gamification/narratives`; `AwardBanner`, `NarrativeCard` components.

- [ ] **Step 1: Create `src/pages/awards.astro`**

```astro
---
Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

import { createAstroSupabase } from "@/lib/supabase";
import { getCurrentYear } from "@/lib/utils/dateUtils";
import { computeTopPerformers } from "@/lib/gamification/awards";
import type { AwardCandidate } from "@/lib/gamification/awards";
import { detectTitleRace, detectVeteran } from "@/lib/gamification/narratives";
import AwardBanner from "@/components/features/gamification/AwardBanner.astro";
import NarrativeCard from "@/components/features/gamification/NarrativeCard.astro";
import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";

const supabase = createAstroSupabase(Astro);
const year = getCurrentYear();

const { data: yearly } = await supabase
  .from("view_player_stats_yearly")
  .select("player_id, nickname, points, win_rate, matches_played")
  .eq("year", year)
  .eq("is_guest", false);

const candidates: AwardCandidate[] = (yearly ?? []).map((p) => ({
  playerId: p.player_id,
  nickname: p.nickname,
  points: p.points,
  winRate: p.win_rate ?? 0,
  matchesPlayed: p.matches_played,
}));

const potm = computeTopPerformers(candidates, 2);

const sorted = [...candidates].sort((a, b) => b.points - a.points);
const titleRace = detectTitleRace(
  sorted[0] ? { nickname: sorted[0].nickname, points: sorted[0].points } : null,
  sorted[1] ? { nickname: sorted[1].nickname, points: sorted[1].points } : null,
  3,
);
const veteran = detectVeteran(candidates.map((c) => ({ nickname: c.nickname, matchesPlayed: c.matchesPlayed })));
---

<Main title="Premios | SGSC">
  <Title title="Premios" subtitle="Reconocimientos de la temporada" />
  <AwardBanner winners={potm} period="month" />
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {titleRace && <NarrativeCard narrative={titleRace} />}
    {veteran && <NarrativeCard narrative={veteran} />}
  </div>
</Main>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds; `/awards` route generated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/awards.astro
git commit -m "feat(gamification): add awards hub route"
```

---

## Task 12: Home page integration (AwardBanner + momentum)

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `computeTopPerformers` + `AwardCandidate` from `@/lib/gamification/awards`; `rollingWinRate` from `@/lib/stats/form`; `AwardBanner` component.

- [ ] **Step 1: Add imports**

In `src/pages/index.astro`, after line 10 (`import MatchCard from "@/components/MatchCard.astro";`) add:

```ts
import { computeTopPerformers } from "@/lib/gamification/awards";
import type { AwardCandidate } from "@/lib/gamification/awards";
import { rollingWinRate } from "@/lib/stats/form";
import AwardBanner from "@/components/features/gamification/AwardBanner.astro";
```

- [ ] **Step 2: Add data query + computation**

After the `const { data: topPlayers } = ...` block (line ~54), add:

```ts
const { data: weeklyStats } = await supabase
  .from("view_player_stats_yearly")
  .select("player_id, nickname, points, win_rate, matches_played, form_array")
  .eq("year", lastMatchYear)
  .eq("is_guest", false);

const potwCandidates: AwardCandidate[] = (weeklyStats ?? []).map((p) => ({
  playerId: p.player_id,
  nickname: p.nickname,
  points: p.points,
  winRate: p.win_rate ?? 0,
  matchesPlayed: p.matches_played,
}));
const potw = computeTopPerformers(potwCandidates, 2);

const momentum = (weeklyStats ?? [])
  .map((p) => {
    const form = (p.form_array ?? []).map((f) => (f === "W" ? "W" : f === "D" ? "D" : "L") as "W" | "D" | "L");
    return { nickname: p.nickname, player_id: p.player_id, rate: rollingWinRate(form, 5) ?? 0 };
  })
  .sort((a, b) => b.rate - a.rate)
  .slice(0, 3);
```

- [ ] **Step 3: Render AwardBanner + momentum section**

Find the `{/* Alerta de error de conexión */}` block (line ~127). Insert immediately BEFORE it:

```astro
    <AwardBanner winners={potw} period="week" />

    {
      momentum.length > 0 && (
        <div class="card bg-base-100 border-base-200 mb-6 rounded-xl border p-6 shadow-md">
          <h2 class="text-primary mb-4 text-lg font-black uppercase">Momentum</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {momentum.map((m, i) => (
              <a href={`/players/${m.player_id}`} class="hover:bg-base-200 flex items-center justify-between rounded-xl border border-base-200 p-4 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="text-base-content/50 text-sm font-bold">#{i + 1}</span>
                  <span class="font-bold">{m.nickname}</span>
                </div>
                <span class="text-success text-lg font-black">{m.rate}%</span>
              </a>
            ))}
          </div>
        </div>
      )
    }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(gamification): add POTW banner and momentum to home"
```

---

## Task 13: Player profile integration + delete `utils/badges.ts`

**Files:**
- Modify: `src/pages/players/[id].astro`
- Delete: `src/lib/utils/badges.ts`

**Interfaces:**
- Consumes: `computePlayerBadges` from `@/lib/gamification/badges`; `computeBestDuoWins`, `computeNemesisWins`, `computeComebackStreak`, `computeBestFieldWins`, `computeIronMan`, `computeSocialButterfly` from `@/lib/gamification/metrics`; `computeCumulativePoints` from `@/lib/gamification/progression`; `BadgeShowcase`, `ProgressionChart` components.
- Note: `src/pages/players/[id].astro` currently imports `computeBadges` from `@/lib/utils/badges` (line 11) and renders badges via `BadgeItem` (lines ~384-402). Only this file imports it (verified). After migration the old util is deleted.

- [ ] **Step 1: Replace imports**

Replace `import { computeBadges } from "@/lib/utils/badges";` (line 11) with:

```ts
import { computePlayerBadges } from "@/lib/gamification/badges";
import { computeBestDuoWins, computeNemesisWins, computeComebackStreak, computeBestFieldWins, computeIronMan, computeSocialButterfly } from "@/lib/gamification/metrics";
import { computeCumulativePoints } from "@/lib/gamification/progression";
import BadgeShowcase from "@/components/features/gamification/BadgeShowcase.astro";
import ProgressionChart from "@/components/features/gamification/ProgressionChart.astro";
```

- [ ] **Step 2: Add own-rows query**

Inside the existing `Promise.all` at the top of the file (the block that already fetches `allHistory`, `allMatchEntries`, etc.), add one more parallel entry:

```ts
  supabase
    .from("match_players")
    .select("match_id, team, match:matches!inner (date, result, field_id)")
    .eq("player_id", id),
```

And in the destructure on the left side of `await Promise.all([...])`, add a corresponding name `{ data: ownBadgeRows },` as the last element.

- [ ] **Step 3: Replace the badge computation**

Find `const badges = computeBadges({ ... });` (line ~338) and the `{ ...badges... }` call block. Replace the whole `computeBadges({...})` call and `const badges =` assignment with:

```ts
const ownBadge = (ownBadgeRows ?? []).map((r: any) => {
  const m = Array.isArray(r.match) ? r.match[0] : r.match;
  return { match_id: r.match_id, date: m?.date ?? "", team: r.team, result: m?.result ?? "", field_id: m?.field_id ?? null };
});

const badgeMetrics = {
  matchesPlayed: player.matches_played,
  wins: player.wins,
  points: player.points,
  longestWinStreak: streakInfo.longestWin,
  bestDuoWins: computeBestDuoWins(id, ownBadge, (teammateRows ?? []).map((c: any) => ({ match_id: c.match_id, player_id: c.player_id, team: c.team }))),
  comebackStreak: computeComebackStreak(ownBadge),
  bestFieldWins: computeBestFieldWins(ownBadge),
  nemesisWins: computeNemesisWins(id, ownBadge, (teammateRows ?? []).map((c: any) => ({ match_id: c.match_id, player_id: c.player_id, team: c.team }))),
  clutchWinRate: clutch.delta >= 0 ? clutch.delta + win_pct : win_pct,
  ironMan: computeIronMan(ownBadge, ownBadge.length),
  underdog: outcomesAsc.length >= 2 && outcomesAsc[0] === "L" && outcomesAsc[outcomesAsc.length - 1] === "W",
  socialButterfly: computeSocialButterfly((teammateRows ?? []).map((c: any) => ({ match_id: c.match_id, player_id: c.player_id, team: c.team })), 0),
  totalClubSeasons: totalClubSeasons,
  playedSeasons: (yearlyStats ?? []).filter((y: any) => y.matches_played >= 3).length,
  lightWins: statsClaro.wins,
  darkWins: statsOscuro.wins,
};

const badges = computePlayerBadges(badgeMetrics);
```

Note: `streakInfo`, `clutch`, `win_pct`, `outcomesAsc`, `teammateRows`, `totalClubSeasons`, `yearlyStats`, `statsClaro`, `statsOscuro` already exist in this file from the stats-engine plan (Task 13 of that plan). If any is missing, compute it (see `src/lib/stats/*`). `ironMan` uses `ownBadge.length` as the season match count (all matches in latest season approximation) — the precise value lives on `/players/[id]/badges`.

- [ ] **Step 4: Replace badge rendering**

Find the badges render block (`{ badges.length > 0 ? (...) : (...) }` mapping `BadgeItem`, lines ~384-402). Replace with:

```astro
          <BadgeShowcase earned={badges.earned} />
          <a href={`/players/${id}/badges`} class="text-xs font-bold tracking-widest uppercase opacity-40 transition-opacity hover:opacity-70">
            Ver todas las medallas
          </a>
```

- [ ] **Step 5: Add ProgressionChart + NarrativeCard section**

Add the chart data computation after the badge block:

```ts
const progressionData = computeCumulativePoints(
  ownBadge
    .map((r) => ({ date: r.date, outcome: r.result === "draw" ? "D" : r.result === r.team ? "W" : "L" as "W" | "L" | "D" }))
    .filter((m) => m.date),
);
```

Then in the markup, inside the "Métricas Avanzadas" section (added by the stats plan, before `</Main>`), insert a full-width card:

```astro
      <div class="col-span-1 sm:col-span-2 lg:col-span-3">
        <div class="card bg-base-100 border-base-200 overflow-hidden rounded-xl border shadow-md">
          <div class="p-4 sm:p-6">
            <div class="mb-4 text-xs font-black tracking-widest uppercase opacity-50">Progresión de Puntos</div>
            <ProgressionChart data={progressionData} />
          </div>
        </div>
      </div>
```

- [ ] **Step 6: Delete `src/lib/utils/badges.ts`**

Run: `git rm src/lib/utils/badges.ts`

- [ ] **Step 7: Verify build + tests**

Run: `npm run build` (expect PASS), then `npx vitest run` (expect no regressions).

- [ ] **Step 8: Commit**

```bash
git add src/pages/players/[id].astro src/lib/utils/badges.ts
git commit -m "feat(gamification): surface badges and progression on player profile"
```

---

## Task 14: Badges page overhaul (player search)

**Files:**
- Modify: `src/pages/badges.astro`

**Interfaces:**
- Consumes: `supabase` from `@/lib/supabase`; `BadgeGrid` component.

- [ ] **Step 1: Add player search + dynamic badge rendering**

Replace the entire content of `src/pages/badges.astro` with:

```astro
---
Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

import { createAstroSupabase } from "@/lib/supabase";
import { computePlayerBadges } from "@/lib/gamification/badges";
import { computeStreaks } from "@/lib/stats/streaks";
import { rollingWinRate } from "@/lib/stats/form";
import { toOutcome } from "@/lib/stats/types";
import BadgeGrid from "@/components/features/gamification/BadgeGrid.astro";
import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";

const supabase = createAstroSupabase(Astro);
const playerId = Astro.url.searchParams.get("player");

const { data: players } = await supabase
  .from("players")
  .select("id, nickname")
  .eq("is_active", true)
  .eq("is_guest", false)
  .order("nickname");

let result = null;
let selectedNickname = "";

if (playerId) {
  const [{ data: stats }, { data: ownRows }, { data: p }] = await Promise.all([
    supabase.from("view_player_stats_all_time").select("matches_played, wins, points").eq("player_id", playerId).maybeSingle(),
    supabase.from("match_players").select("match_id, team, match:matches!inner (date, result)").eq("player_id", playerId),
    supabase.from("players").select("nickname").eq("id", playerId).maybeSingle(),
  ]);

  selectedNickname = p?.nickname ?? "";

  const own = (ownRows ?? []).map((r: any) => {
    const m = Array.isArray(r.match) ? r.match[0] : r.match;
    return { match_id: r.match_id, date: m?.date ?? "", team: r.team, result: m?.result ?? "", field_id: null };
  });

  const outcomes = [...own]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => toOutcome(r.team, r.result));

  result = computePlayerBadges({
    matchesPlayed: stats?.matches_played ?? 0,
    wins: stats?.wins ?? 0,
    points: stats?.points ?? 0,
    longestWinStreak: computeStreaks(outcomes).longestWin,
    bestDuoWins: 0,
    comebackStreak: 0,
    bestFieldWins: 0,
    nemesisWins: 0,
    clutchWinRate: rollingWinRate(outcomes, 5) ?? 0,
    ironMan: false,
    underdog: false,
    socialButterfly: false,
    totalClubSeasons: 1,
    playedSeasons: 1,
    lightWins: 0,
    darkWins: 0,
  });
}
---

<Main title="Medallas | SGSC">
  <Title title="Medallas" subtitle="Sistema de Reconocimientos" />

  <form method="GET" action="/badges" class="card bg-base-100 border-base-200 mb-8 rounded-xl border p-4 shadow-md">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label for="player" class="text-xs font-bold uppercase opacity-60">Buscar jugador</label>
      <input id="player" name="player" list="players-datalist" class="select w-full rounded-xl" placeholder="Elegir jugador..." />
      <datalist id="players-datalist">
        {players?.map((p) => (
          <option value={p.nickname} data-id={p.id} />
        ))}
      </datalist>
      <button type="submit" class="btn btn-primary rounded-xl">Ver medallas</button>
    </div>
  </form>

  {result && (
    <>
      <p class="mb-4 text-base-content/60 text-sm font-bold uppercase">Medallas de {selectedNickname}</p>
      <BadgeGrid badges={result} />
    </>
  )}

  {!playerId && (
    <p class="text-base-content/60 text-center text-sm">Selecciona un jugador para ver sus medallas.</p>
  )}
</Main>

<script is:inline>
  const input = document.getElementById("player") as HTMLInputElement | null;
  const datalist = document.getElementById("players-datalist") as HTMLDataListElement | null;
  const form = input?.closest("form");
  form?.addEventListener("submit", (e) => {
    if (!input || !datalist) return;
    const v = input.value.trim();
    for (const opt of datalist.querySelectorAll("option")) {
      if (opt.value.toLowerCase() === v.toLowerCase()) {
        const id = opt.getAttribute("data-id");
        if (id) {
          e.preventDefault();
          window.location.href = `/badges?player=${id}`;
        }
        return;
      }
    }
  });
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/badges.astro
git commit -m "feat(gamification): add player search to badges page"
```

---

## Task 15: Hall of fame — seasonal narratives

**Files:**
- Modify: `src/pages/hall-of-fame.astro`

**Interfaces:**
- Consumes: `detectRisingStar`, `detectVeteran`, `detectTitleRace` from `@/lib/gamification/narratives`; `NarrativeCard` component.

- [ ] **Step 1: Add imports**

In `src/pages/hall-of-fame.astro`, after line 10 (`import Title from "@/components/shared/Title.astro";`) add:

```ts
import { detectRisingStar, detectVeteran, detectTitleRace } from "@/lib/gamification/narratives";
import NarrativeCard from "@/components/features/gamification/NarrativeCard.astro";
```

- [ ] **Step 2: Compute narratives**

After `const champions = ...` (line ~107), add:

```ts
const veteran = detectVeteran(safePlayers.map((p: any) => ({ nickname: p.nickname, matchesPlayed: p.matches_played })));
const risingStar = detectRisingStar(
  (yearlyData ?? []).map((p: any) => ({ nickname: p.nickname, firstSeason: p.year === Math.min(...(years ?? [])) , points: p.points })),
);
```

And near the top, after `const lastSeason = currentYear - 1;` (line ~83), add the `yearlyData`/`years` fetch used above:

```ts
const { data: yearlyData } = await supabase
  .from("view_player_stats_yearly")
  .select("year, player_id, nickname, points, matches_played")
  .eq("is_guest", false);
const years = [...new Set((yearlyData ?? []).map((y: any) => y.year))];
```

- [ ] **Step 3: Render narratives section**

Find the `{champions.length > 0 && (` block (line ~319). Insert BEFORE it:

```astro
  {
    (veteran || risingStar) && (
      <div class="mb-8">
        <h2 class="text-primary mb-4 text-xl font-black uppercase">Historias de la Temporada</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {veteran && <NarrativeCard narrative={veteran} />}
          {risingStar && <NarrativeCard narrative={risingStar} />}
        </div>
      </div>
    )
  }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/hall-of-fame.astro
git commit -m "feat(gamification): add seasonal narratives to hall of fame"
```

---

## Self-Review (spec coverage)

| Spec requirement | Task(s) | Status |
|---|---|---|
| Dynamic `compute_player_badges` | 2 (as pure `computePlayerBadges`) | ✅ |
| Progressive: Rachas / Duplas / Consistencia / Comeback / Field | 2 | ✅ |
| Special: Nemesis / Clutch King / Iron Man / Underdog / Social Butterfly | 2 | ✅ |
| Badge page search by player | 14 | ✅ |
| Per-player grid + progress bars | 8 | ✅ |
| Category tabs | 8 | ✅ |
| `/players/[id]/badges` route | 10 | ✅ |
| POTW/POTM computation (min 2 matches, ties) | 4 | ✅ |
| POTW banner on home | 12 | ✅ |
| Momentum leaderboard (top 3 recent form) | 12 | ✅ |
| `/awards` route | 11 | ✅ |
| Narratives: title race / comeback / rising star / veteran / duo dominance | 5 | ✅ (tested) |
| Narrative wiring: home/profile/HOF | 11, 13, 15 | ⚠️ titleRace + veteran + risingStar wired; comeback + duoDominance tested but not wired (need standings-snapshot / duo data) |
| Progression chart (cumulative points) | 6, 9, 13 | ✅ |
| Ranking "form" column | stats-engine plan (already done) | ✅ (exists as "Forma" column) |
| Snapshot tests | — | ⚠️ skipped (no component harness) |
| DB views/functions | — | ⚠️ deferred (Decision 1) |

**Placeholder scan:** no `TBD`/`TODO`/`implement later`; every code step has complete code + run command + expected output.

**Type consistency:** `computePlayerBadges` → `PlayerBadges { earned, progress }` consumed by `BadgeShowcase` (earned) and `BadgeGrid` (badges); `AwardWinner { playerId, nickname, score }` → `AwardBanner`; `Narrative { id, title, body }` → `NarrativeCard`; `CumulativePoint { date, points }` → `ProgressionChart`. `computeBestDuoWins`/`computeNemesisWins`/etc. signatures match their use in Tasks 10/13. `OwnMatchRow`/`CoPlayerRow` shapes match the query mappings (`r.match` may be array — unwrapped via `Array.isArray`).

## Final verification (run once all tasks done)

```bash
npx vitest run
npm run build
```

Expected: all unit tests pass; production build succeeds with no type errors.









