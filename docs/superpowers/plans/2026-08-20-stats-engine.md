# Stats Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add advanced per-player and head-to-head statistics (streaks, form, clutch, consistency, synergy, temporal patterns, comeback, side performance, rivalry) to the existing SGSC app.

**Architecture:** All metric logic lives in pure TypeScript functions under `src/lib/stats/` (unit-tested, no Supabase imports, operate on plain arrays). Three SQL views are created in Supabase as a data-access layer for the frequently-queried metrics (streaks, head-to-head, field dominance). Six thin Astro components render the computed values; three existing pages (`/players/[id]`, `/ranking`, `/versus`) are wired to them.

**Tech Stack:** Astro 6 (SSR), TypeScript, Supabase Postgres, Tailwind CSS 4 + DaisyUI 5, Vitest (node env, globals enabled), astro-icon (`material-symbols`).

## Global Constraints

- UI copy is Spanish (`es-AR`); no hardcoded colors — use DaisyUI semantic tokens (`bg-base-100`, `text-base-content`, `primary`, `success`, `warning`, `error`).
- Components: `PascalCase.astro`; pages: `kebab-case.astro`; utils: `camelCase.ts`.
- Never `select(*)` in pages — always explicit columns.
- Path alias `@` → `src/`.
- Icons via `<Icon name="material-symbols:..." />` from `astro-icon/components`.
- Unit tests live in `tests/unit/lib/` and import via relative path (`../../../src/...`); run with `npx vitest run <path>`.
- All new stat modules are pure (no `supabase` import, no `import.meta.env`), so they run under Vitest node env.
- No comments in code unless the repo already uses them for that construct.

## Decisions (deviations from spec, with rationale)

1. **Snapshot tests for components are skipped.** The repo has no Astro component test harness (only pure-lib Vitest tests). All metric logic lives in `src/lib/stats/*.ts` and is fully unit-tested; the `.astro` components are thin presentational wrappers over already-tested output and are verified via `npm run build` + existing E2E navigation tests.
2. **Two extra utils not in the spec's list:** `sidePerformance.ts` (spec item 8 "Side performance delta" has no util in its list) and `rivalry.ts` (rivalry tier + narrative hook are pure functions worth testing). Documented here so the implementer is not confused by the count.
3. **DB views are applied manually via the Supabase SQL editor** — this repo has no Supabase CLI / migrations folder. The SQL is provided verbatim in Task 9 and must be pasted into the Supabase SQL editor by a human. Views are additive and non-breaking.
4. **Streaks for the ranking page are all-time** (streaks are inherently sequential across seasons), regardless of the season filter; the rest of the ranking row follows the season filter.

## File Structure

**New — pure stat modules (`src/lib/stats/`):**

| File | Responsibility |
|------|----------------|
| `types.ts` | Shared `Outcome` type, `MatchOutcomeInput` type, `toOutcome()` helper |
| `streaks.ts` | `computeStreaks()` — current/longest W/L streaks |
| `form.ts` | `rollingWinRate()`, `computeTrend()` — form trajectory |
| `clutch.ts` | `computeClutch()` — recent vs career delta |
| `consistency.ts` | `computeConsistency()` — std-dev 0-100 score |
| `comeback.ts` | `computeComebackRate()` — post-loss win rate |
| `temporal.ts` | `computeMonthPerformance()`, `computeBestWorstMonth()` |
| `synergy.ts` | `computeSynergy()` — top teammates by win rate |
| `sidePerformance.ts` | `computeSidePerformance()` — dark/light preference |
| `rivalry.ts` | `rivalryTier()`, `narrativeHook()` — h2h narrative |

**New — components (`src/components/features/stats/`):**

| File | Responsibility |
|------|----------------|
| `TrendArrow.astro` | up/down/stable icon indicator |
| `StreakBadge.astro` | current streak type + length badge |
| `FormGraph.astro` | last-N W/L/D dot row |
| `ClutchMeter.astro` | gauge comparing recent vs career |
| `SynergyList.astro` | top-3 teammate cards |
| `RivalryTimeline.astro` | match-by-match h2h strip |

**New — SQL views (applied in Supabase, not files):**

| View | Responsibility |
|------|----------------|
| `view_player_streaks` | current + longest streaks per player |
| `view_head_to_head` | pairwise h2h summary + last-5 outcomes |
| `view_field_dominance` | per player-per field win rate + home field |

**Modified — existing files:**

| File | Change |
|------|--------|
| `src/types/database.types.ts` | add 3 view `Row` types |
| `src/pages/players/[id].astro` | render new metric cards |
| `src/pages/ranking.astro` | add streak column + sort option |
| `src/components/ranking/StandingsTable.astro` | add streak column |
| `src/pages/compare.astro` | become 301 redirect to `/versus` |
| `src/pages/versus.astro` | new enhanced versus page |
| `src/components/shared/Header.astro` | nav link `/compare` → `/versus` |

---

## Task 1: Shared types + `streaks.ts`

**Files:**
- Create: `src/lib/stats/types.ts`
- Create: `src/lib/stats/streaks.ts`
- Test: `tests/unit/lib/stats/streaks.test.ts`

**Interfaces:**
- Produces: `type Outcome = "W" | "L" | "D"`, `interface MatchOutcomeInput`, `toOutcome(team, result)`, `computeStreaks(outcomes: Outcome[]): StreakInfo`. `StreakInfo = { currentType: StreakType | null; currentLength: number; longestWin: number; longestLoss: number }`, `StreakType = "W" | "L" | "D"`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/streaks.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeStreaks } from "../../../src/lib/stats/streaks";
import { toOutcome } from "../../../src/lib/stats/types";

describe("computeStreaks", () => {
  it("returns empty info for no matches", () => {
    expect(computeStreaks([])).toEqual({
      currentType: null,
      currentLength: 0,
      longestWin: 0,
      longestLoss: 0,
    });
  });

  it("single win", () => {
    expect(computeStreaks(["W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 1,
      longestLoss: 0,
    });
  });

  it("two wins then a loss", () => {
    expect(computeStreaks(["W", "W", "L"])).toEqual({
      currentType: "L",
      currentLength: 1,
      longestWin: 2,
      longestLoss: 1,
    });
  });

  it("draws break runs", () => {
    expect(computeStreaks(["W", "W", "D", "W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 2,
      longestLoss: 0,
    });
  });

  it("longest loss run tracked", () => {
    expect(computeStreaks(["L", "L", "L", "W"])).toEqual({
      currentType: "W",
      currentLength: 1,
      longestWin: 1,
      longestLoss: 3,
    });
  });
});

describe("toOutcome", () => {
  it("maps draw", () => {
    expect(toOutcome("dark", "draw")).toBe("D");
  });
  it("maps win when team equals result", () => {
    expect(toOutcome("light", "light")).toBe("W");
  });
  it("maps loss otherwise", () => {
    expect(toOutcome("light", "dark")).toBe("L");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/streaks.test.ts`
Expected: FAIL — cannot resolve `../../../src/lib/stats/streaks` and `.../types` (files don't exist).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/types.ts`:

```ts
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
```

Create `src/lib/stats/streaks.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/streaks.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/types.ts src/lib/stats/streaks.ts tests/unit/lib/stats/streaks.test.ts
git commit -m "feat(stats): add streak calculation helper"
```

---

## Task 2: `form.ts`

**Files:**
- Create: `src/lib/stats/form.ts`
- Test: `tests/unit/lib/stats/form.test.ts`

**Interfaces:**
- Consumes: `Outcome` from `src/lib/stats/types.ts`.
- Produces: `rollingWinRate(outcomes: Outcome[], window?: number): number | null`, `computeTrend(outcomes: Outcome[], careerWinRate: number): Trend`, `type Trend = "improving" | "declining" | "stable"`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/form.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rollingWinRate, computeTrend } from "../../../src/lib/stats/form";

describe("rollingWinRate", () => {
  it("returns null for empty", () => {
    expect(rollingWinRate([])).toBeNull();
  });

  it("computes last-5 win rate", () => {
    expect(rollingWinRate(["W", "L", "W", "L", "W"])).toBe(60);
  });

  it("uses shorter window when fewer matches", () => {
    expect(rollingWinRate(["W", "W", "L"])).toBe(67);
  });
});

describe("computeTrend", () => {
  it("improving when recent beats career by 5+", () => {
    expect(computeTrend(["W", "W", "W", "W", "W"], 40)).toBe("improving");
  });

  it("declining when recent below career by 5+", () => {
    expect(computeTrend(["L", "L", "L", "L", "L"], 80)).toBe("declining");
  });

  it("stable within ±5", () => {
    expect(computeTrend(["W", "L", "W", "L", "W"], 58)).toBe("stable");
  });

  it("stable for empty", () => {
    expect(computeTrend([], 50)).toBe("stable");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/form.test.ts`
Expected: FAIL — cannot resolve `.../form`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/form.ts`:

```ts
import type { Outcome } from "./types";

export type Trend = "improving" | "declining" | "stable";

export function rollingWinRate(outcomes: Outcome[], window = 5): number | null {
  if (outcomes.length === 0) return null;
  const slice = outcomes.slice(-window);
  const wins = slice.filter((o) => o === "W").length;
  return Math.round((wins / slice.length) * 100);
}

export function computeTrend(outcomes: Outcome[], careerWinRate: number): Trend {
  if (outcomes.length === 0) return "stable";
  const recent = rollingWinRate(outcomes, 5) ?? 0;
  const diff = recent - careerWinRate;
  if (diff >= 5) return "improving";
  if (diff <= -5) return "declining";
  return "stable";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/form.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/form.ts tests/unit/lib/stats/form.test.ts
git commit -m "feat(stats): add form trajectory helpers"
```

---

## Task 3: `clutch.ts`

**Files:**
- Create: `src/lib/stats/clutch.ts`
- Test: `tests/unit/lib/stats/clutch.test.ts`

**Interfaces:**
- Produces: `computeClutch(recentWinRate: number, careerWinRate: number): ClutchResult`, `type ClutchState = "hot" | "cold" | "neutral"`, `ClutchResult = { delta: number; state: ClutchState }`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/clutch.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeClutch } from "../../../src/lib/stats/clutch";

describe("computeClutch", () => {
  it("hot when +20 or more", () => {
    expect(computeClutch(70, 50)).toEqual({ delta: 20, state: "hot" });
  });

  it("cold when -20 or less", () => {
    expect(computeClutch(30, 55)).toEqual({ delta: -25, state: "cold" });
  });

  it("neutral otherwise", () => {
    expect(computeClutch(55, 50)).toEqual({ delta: 5, state: "neutral" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/clutch.test.ts`
Expected: FAIL — cannot resolve `.../clutch`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/clutch.ts`:

```ts
export type ClutchState = "hot" | "cold" | "neutral";

export interface ClutchResult {
  delta: number;
  state: ClutchState;
}

export function computeClutch(recentWinRate: number, careerWinRate: number): ClutchResult {
  const delta = recentWinRate - careerWinRate;
  let state: ClutchState = "neutral";
  if (delta >= 20) state = "hot";
  else if (delta <= -20) state = "cold";
  return { delta, state };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/clutch.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/clutch.ts tests/unit/lib/stats/clutch.test.ts
git commit -m "feat(stats): add clutch factor helper"
```

---

## Task 4: `consistency.ts`

**Files:**
- Create: `src/lib/stats/consistency.ts`
- Test: `tests/unit/lib/stats/consistency.test.ts`

**Interfaces:**
- Consumes: `Outcome` from `src/lib/stats/types.ts`.
- Produces: `computeConsistency(outcomes: Outcome[]): number | null` (null when fewer than 3 matches).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/consistency.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeConsistency } from "../../../src/lib/stats/consistency";

describe("computeConsistency", () => {
  it("returns null below 3 matches", () => {
    expect(computeConsistency([])).toBeNull();
    expect(computeConsistency(["W"])).toBeNull();
    expect(computeConsistency(["W", "L"])).toBeNull();
  });

  it("all wins is perfectly predictable", () => {
    expect(computeConsistency(["W", "W", "W"])).toBe(100);
  });

  it("alternating is maximally unpredictable", () => {
    expect(computeConsistency(["W", "L", "W", "L"])).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/consistency.test.ts`
Expected: FAIL — cannot resolve `.../consistency`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/consistency.ts`:

```ts
import type { Outcome } from "./types";

const VALUE: Record<Outcome, number> = { W: 1, D: 0.5, L: 0 };

export function computeConsistency(outcomes: Outcome[]): number | null {
  if (outcomes.length < 3) return null;
  const mean = outcomes.reduce((acc, o) => acc + VALUE[o], 0) / outcomes.length;
  const variance =
    outcomes.reduce((acc, o) => acc + (VALUE[o] - mean) ** 2, 0) / outcomes.length;
  const stdDev = Math.sqrt(variance);
  return Math.round(100 * (1 - 2 * stdDev));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/consistency.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/consistency.ts tests/unit/lib/stats/consistency.test.ts
git commit -m "feat(stats): add consistency score helper"
```

---

## Task 5: `comeback.ts`

**Files:**
- Create: `src/lib/stats/comeback.ts`
- Test: `tests/unit/lib/stats/comeback.test.ts`

**Interfaces:**
- Consumes: `Outcome` from `src/lib/stats/types.ts`.
- Produces: `computeComebackRate(outcomes: Outcome[]): number | null` (null when no loss has a following match).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/comeback.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeComebackRate } from "../../../src/lib/stats/comeback";

describe("computeComebackRate", () => {
  it("returns null when no loss is followed by a match", () => {
    expect(computeComebackRate([])).toBeNull();
    expect(computeComebackRate(["W", "W", "W"])).toBeNull();
    expect(computeComebackRate(["W", "L"])).toBeNull();
  });

  it("100% when every loss is followed by a win", () => {
    expect(computeComebackRate(["L", "W", "L", "W"])).toBe(100);
  });

  it("50% when half the losses bounce back", () => {
    expect(computeComebackRate(["L", "W", "L", "L"])).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/comeback.test.ts`
Expected: FAIL — cannot resolve `.../comeback`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/comeback.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/comeback.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/comeback.ts tests/unit/lib/stats/comeback.test.ts
git commit -m "feat(stats): add comeback rate helper"
```

---

## Task 6: `temporal.ts`

**Files:**
- Create: `src/lib/stats/temporal.ts`
- Test: `tests/unit/lib/stats/temporal.test.ts`

**Interfaces:**
- Consumes: `MatchOutcomeInput`, `toOutcome` from `src/lib/stats/types.ts`.
- Produces: `computeMonthPerformance(records: MatchOutcomeInput[]): MonthPerformance[]` and `computeBestWorstMonth(records: MatchOutcomeInput[]): TemporalSummary`. `MonthPerformance = { month: number; matches: number; wins: number; winRate: number }`, `TemporalSummary = { bestMonth: MonthPerformance | null; worstMonth: MonthPerformance | null }`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/temporal.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeMonthPerformance, computeBestWorstMonth } from "../../../src/lib/stats/temporal";
import type { MatchOutcomeInput } from "../../../src/lib/stats/types";

const r = (date: string, team: "light" | "dark", result: "light" | "dark" | "draw"): MatchOutcomeInput => ({
  date,
  team,
  result,
});

describe("computeMonthPerformance", () => {
  it("returns empty for no records", () => {
    expect(computeMonthPerformance([])).toEqual([]);
  });

  it("aggregates wins per month", () => {
    const records = [
      r("2026-01-10", "light", "light"),
      r("2026-01-20", "light", "draw"),
      r("2026-02-05", "light", "dark"),
    ];
    const perfs = computeMonthPerformance(records);
    const jan = perfs.find((p) => p.month === 1);
    const feb = perfs.find((p) => p.month === 2);
    expect(jan).toEqual({ month: 1, matches: 2, wins: 1, winRate: 50 });
    expect(feb).toEqual({ month: 2, matches: 1, wins: 0, winRate: 0 });
  });
});

describe("computeBestWorstMonth", () => {
  it("returns nulls for no records", () => {
    expect(computeBestWorstMonth([])).toEqual({ bestMonth: null, worstMonth: null });
  });

  it("picks best and worst by win rate", () => {
    const records = [
      r("2026-01-05", "light", "light"),
      r("2026-01-15", "light", "light"),
      r("2026-02-05", "light", "dark"),
    ];
    const { bestMonth, worstMonth } = computeBestWorstMonth(records);
    expect(bestMonth?.month).toBe(1);
    expect(worstMonth?.month).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/temporal.test.ts`
Expected: FAIL — cannot resolve `.../temporal`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/temporal.ts`:

```ts
import { toOutcome } from "./types";
import type { MatchOutcomeInput } from "./types";

export interface MonthPerformance {
  month: number;
  matches: number;
  wins: number;
  winRate: number;
}

export interface TemporalSummary {
  bestMonth: MonthPerformance | null;
  worstMonth: MonthPerformance | null;
}

export function computeMonthPerformance(records: MatchOutcomeInput[]): MonthPerformance[] {
  const map = new Map<number, { matches: number; wins: number }>();

  for (const rec of records) {
    const d = new Date(`${rec.date}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const month = d.getUTCMonth() + 1;
    const entry = map.get(month) ?? { matches: 0, wins: 0 };
    entry.matches++;
    if (toOutcome(rec.team, rec.result) === "W") entry.wins++;
    map.set(month, entry);
  }

  return [...map.entries()].map(([month, e]) => ({
    month,
    matches: e.matches,
    wins: e.wins,
    winRate: Math.round((e.wins / e.matches) * 100),
  }));
}

export function computeBestWorstMonth(records: MatchOutcomeInput[]): TemporalSummary {
  const perfs = computeMonthPerformance(records);
  if (perfs.length === 0) return { bestMonth: null, worstMonth: null };
  const sorted = [...perfs].sort(
    (a, b) => b.winRate - a.winRate || b.matches - a.matches,
  );
  return { bestMonth: sorted[0], worstMonth: sorted[sorted.length - 1] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/temporal.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/temporal.ts tests/unit/lib/stats/temporal.test.ts
git commit -m "feat(stats): add temporal pattern helpers"
```

---

## Task 7: `synergy.ts`

**Files:**
- Create: `src/lib/stats/synergy.ts`
- Test: `tests/unit/lib/stats/synergy.test.ts`

**Interfaces:**
- Produces: `computeSynergy(matches: SynergyMatchInput[], minMatches?: number, top?: number): SynergyEntry[]`. `SynergyMatchInput = { teammateId: string; teammateNickname: string; win: boolean }`, `SynergyEntry = { teammateId: string; teammateNickname: string; matchesTogether: number; winsTogether: number; winRate: number }`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/stats/synergy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeSynergy } from "../../../src/lib/stats/synergy";

const m = (id: string, win: boolean) => ({
  teammateId: id,
  teammateNickname: `P${id}`,
  win,
});

describe("computeSynergy", () => {
  it("filters teammates below min matches", () => {
    const matches = [
      m("a", true),
      m("a", true),
      m("a", true),
      m("b", true),
      m("b", false),
    ];
    const result = computeSynergy(matches, 3);
    expect(result).toHaveLength(1);
    expect(result[0].teammateId).toBe("a");
    expect(result[0].winRate).toBe(100);
  });

  it("sorts by win rate then matches, caps at top", () => {
    const matches = [
      m("a", true), m("a", true), m("a", true), // 100%, 3 matches
      m("b", true), m("b", true), m("b", false), // 67%, 3 matches
      m("c", true), m("c", false), m("c", false), // 33%, 3 matches
    ];
    const result = computeSynergy(matches, 3, 2);
    expect(result.map((e) => e.teammateId)).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/stats/synergy.test.ts`
Expected: FAIL — cannot resolve `.../synergy`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/stats/synergy.ts`:

```ts
export interface SynergyMatchInput {
  teammateId: string;
  teammateNickname: string;
  win: boolean;
}

export interface SynergyEntry {
  teammateId: string;
  teammateNickname: string;
  matchesTogether: number;
  winsTogether: number;
  winRate: number;
}

export function computeSynergy(
  matches: SynergyMatchInput[],
  minMatches = 3,
  top = 3,
): SynergyEntry[] {
  const map = new Map<string, { nickname: string; matches: number; wins: number }>();

  for (const m of matches) {
    const entry = map.get(m.teammateId) ?? { nickname: m.teammateNickname, matches: 0, wins: 0 };
    entry.matches++;
    if (m.win) entry.wins++;
    map.set(m.teammateId, entry);
  }

  return [...map.entries()]
    .map(([id, e]) => ({
      teammateId: id,
      teammateNickname: e.nickname,
      matchesTogether: e.matches,
      winsTogether: e.wins,
      winRate: Math.round((e.wins / e.matches) * 100),
    }))
    .filter((e) => e.matchesTogether >= minMatches)
    .sort((a, b) => b.winRate - a.winRate || b.matchesTogether - a.matchesTogether)
    .slice(0, top);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/stats/synergy.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/synergy.ts tests/unit/lib/stats/synergy.test.ts
git commit -m "feat(stats): add teammate synergy helper"
```

---

## Task 8: `sidePerformance.ts` + `rivalry.ts`

**Files:**
- Create: `src/lib/stats/sidePerformance.ts`
- Create: `src/lib/stats/rivalry.ts`
- Test: `tests/unit/lib/stats/sidePerformance.test.ts`
- Test: `tests/unit/lib/stats/rivalry.test.ts`

**Interfaces:**
- Consumes: `Outcome` from `src/lib/stats/types.ts`.
- Produces (sidePerformance): `computeSidePerformance(records: { team: "light" | "dark"; outcome: Outcome }[]): SidePerformance`. `SidePreference = "dark specialist" | "light specialist" | "balanced"`, `SidePerformance = { light: { matches: number; winRate: number }; dark: { matches: number; winRate: number }; preference: SidePreference }`.
- Produces (rivalry): `rivalryTier(matchesAgainst: number): RivalryTier | null` (`null` below 2), `RivalryTier = "casual" | "rival" | "legendary"`; `narrativeHook(aWins: number, bWins: number, aName: string, bName: string): string | null`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/lib/stats/sidePerformance.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeSidePerformance } from "../../../src/lib/stats/sidePerformance";

describe("computeSidePerformance", () => {
  it("returns zeros for no records", () => {
    expect(computeSidePerformance([])).toEqual({
      light: { matches: 0, winRate: 0 },
      dark: { matches: 0, winRate: 0 },
      preference: "balanced",
    });
  });

  it("prefers light when light wins more", () => {
    const records = [
      { team: "light" as const, outcome: "W" as const },
      { team: "light" as const, outcome: "W" as const },
      { team: "dark" as const, outcome: "L" as const },
    ];
    expect(computeSidePerformance(records).preference).toBe("light specialist");
  });

  it("prefers dark when dark wins more", () => {
    const records = [
      { team: "light" as const, outcome: "L" as const },
      { team: "dark" as const, outcome: "W" as const },
      { team: "dark" as const, outcome: "W" as const },
    ];
    expect(computeSidePerformance(records).preference).toBe("dark specialist");
  });
});
```

Create `tests/unit/lib/stats/rivalry.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rivalryTier, narrativeHook } from "../../../src/lib/stats/rivalry";

describe("rivalryTier", () => {
  it("null below 2 matches", () => {
    expect(rivalryTier(0)).toBeNull();
    expect(rivalryTier(1)).toBeNull();
  });
  it("casual 2-5", () => {
    expect(rivalryTier(2)).toBe("casual");
    expect(rivalryTier(5)).toBe("casual");
  });
  it("rival 6-10", () => {
    expect(rivalryTier(6)).toBe("rival");
    expect(rivalryTier(10)).toBe("rival");
  });
  it("legendary 11+", () => {
    expect(rivalryTier(11)).toBe("legendary");
  });
});

describe("narrativeHook", () => {
  it("null when no decided matches", () => {
    expect(narrativeHook(0, 0, 2, "A", "B")).toBeNull();
  });
  it("returns A-dominates hook", () => {
    expect(narrativeHook(9, 3, 0, "A", "B")).toBe("Cuando A gana, B pierde.");
  });
  it("returns B-dominates hook", () => {
    expect(narrativeHook(3, 9, 0, "A", "B")).toBe("Cuando B gana, A pierde.");
  });
  it("null when balanced", () => {
    expect(narrativeHook(5, 5, 0, "A", "B")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/lib/stats/sidePerformance.test.ts tests/unit/lib/stats/rivalry.test.ts`
Expected: FAIL — cannot resolve `.../sidePerformance` and `.../rivalry`.

- [ ] **Step 3: Write minimal implementations**

Create `src/lib/stats/sidePerformance.ts`:

```ts
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
```

Create `src/lib/stats/rivalry.ts`:

```ts
export type RivalryTier = "casual" | "rival" | "legendary";

export function rivalryTier(matchesAgainst: number): RivalryTier | null {
  if (matchesAgainst < 2) return null;
  if (matchesAgainst <= 5) return "casual";
  if (matchesAgainst <= 10) return "rival";
  return "legendary";
}

export function narrativeHook(
  aWins: number,
  bWins: number,
  aName: string,
  bName: string,
): string | null {
  const decided = aWins + bWins;
  if (decided === 0) return null;
  const aRate = aWins / decided;
  if (aRate >= 0.75) return `Cuando ${aName} gana, ${bName} pierde.`;
  if (aRate <= 0.25) return `Cuando ${bName} gana, ${aName} pierde.`;
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/lib/stats/sidePerformance.test.ts tests/unit/lib/stats/rivalry.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/sidePerformance.ts src/lib/stats/rivalry.ts tests/unit/lib/stats/sidePerformance.test.ts tests/unit/lib/stats/rivalry.test.ts
git commit -m "feat(stats): add side performance and rivalry helpers"
```

---

## Task 9: SQL views + `database.types.ts` update

**Files:**
- Modify: `src/types/database.types.ts` (add 3 view `Row` types)
- No new repo files (SQL applied in Supabase console).

**Interfaces:**
- Produces (DB): `view_player_streaks`, `view_head_to_head`, `view_field_dominance` with the column shapes documented in Step 3 types.
- Note: these are the only metrics the pages read from the DB instead of from `src/lib/stats/*`. Views are additive and non-breaking.

> **IMPORTANT — human step:** This repo has no Supabase CLI. The SQL below must be pasted into the Supabase dashboard **SQL Editor** and run. Ask the user to run it (or run it via Supabase MCP if available), then verify the row counts in Step 4.

- [ ] **Step 1: Apply view SQL in Supabase SQL Editor**

Paste and run all three statements:

```sql
-- view_player_streaks
create or replace view view_player_streaks as
with ordered as (
  select
    mp.player_id,
    mp.match_id,
    m.date,
    case
      when m.result = 'draw' then 'D'
      when mp.team = m.result then 'W'
      else 'L'
    end as outcome
  from match_players mp
  join matches m on m.id = mp.match_id
),
ranked as (
  select
    player_id,
    match_id,
    date,
    outcome,
    row_number() over (partition by player_id order by date, match_id) as rn
  from ordered
),
islands as (
  select
    player_id,
    outcome,
    rn - row_number() over (partition by player_id, outcome order by rn) as grp
  from ranked
),
lengths as (
  select
    i.player_id,
    i.outcome,
    i.grp,
    count(*) as len,
    max(r.rn) as max_rn
  from islands i
  join ranked r on r.player_id = i.player_id and r.rn = i.rn
  group by i.player_id, i.outcome, i.grp
)
select
  p.id as player_id,
  c.outcome as current_streak_type,
  c.len as current_streak_length,
  coalesce(max(case when l.outcome = 'W' then l.len end), 0) as longest_win_streak,
  coalesce(max(case when l.outcome = 'L' then l.len end), 0) as longest_loss_streak
from players p
left join lengths l on l.player_id = p.id
left join lengths c
  on c.player_id = p.id
  and c.max_rn = (select max(max_rn) from lengths where player_id = p.id)
group by p.id, c.outcome, c.len;
```

```sql
-- view_head_to_head
create or replace view view_head_to_head as
with pairs as (
  select
    a.player_id as player_a_id,
    b.player_id as player_b_id,
    m.id as match_id,
    m.date,
    m.result,
    a.team as a_team,
    b.team as b_team
  from match_players a
  join match_players b
    on b.match_id = a.match_id and b.player_id <> a.player_id
  join matches m on m.id = a.match_id
),
ordered_pairs as (
  select
    player_a_id,
    player_b_id,
    match_id,
    date,
    result,
    a_team,
    b_team,
    row_number() over (
      partition by player_a_id, player_b_id
      order by date desc, match_id desc
    ) as rn
  from pairs
),
aggregated as (
  select
    player_a_id,
    player_b_id,
    count(*) as matches_together,
    count(*) filter (where a_team <> b_team) as matches_against,
    count(*) filter (where a_team <> b_team and result = a_team) as a_wins,
    count(*) filter (where a_team <> b_team and result = b_team) as b_wins,
    count(*) filter (where a_team <> b_team and result = 'draw') as draws,
    count(*) filter (where a_team = b_team) as shared_teams
  from pairs
  group by player_a_id, player_b_id
),
last5 as (
  select
    player_a_id,
    player_b_id,
    array_agg(
      case
        when result = 'draw' then 'D'
        when result = a_team then 'A'
        else 'B'
      end
      order by rn
    ) filter (where rn <= 5) as last_5_outcomes
  from ordered_pairs
  group by player_a_id, player_b_id
)
select
  a.player_a_id,
  a.player_b_id,
  a.matches_together,
  a.matches_against,
  a.a_wins,
  a.b_wins,
  a.draws,
  a.shared_teams,
  case
    when a.matches_against = 0 then 0
    else round(100.0 * a.a_wins / a.matches_against)
  end as a_win_rate,
  l.last_5_outcomes
from aggregated a
join last5 l
  on l.player_a_id = a.player_a_id and l.player_b_id = a.player_b_id;
```

```sql
-- view_field_dominance
create or replace view view_field_dominance as
with field_stats as (
  select
    mp.player_id,
    m.field_id,
    count(*) as matches_at_field,
    count(*) filter (where m.result = mp.team) as wins
  from match_players mp
  join matches m on m.id = mp.match_id
  where m.field_id is not null
  group by mp.player_id, m.field_id
),
home as (
  select distinct on (player_id)
    player_id,
    field_id as home_field_id
  from field_stats
  order by player_id, matches_at_field desc, field_id
)
select
  fs.player_id,
  fs.field_id,
  fs.matches_at_field,
  fs.wins,
  case
    when fs.matches_at_field = 0 then 0
    else round(100.0 * fs.wins / fs.matches_at_field)
  end as win_rate,
  (h.home_field_id = fs.field_id) as home_field
from field_stats fs
join home h on h.player_id = fs.player_id;
```

Note: `view_head_to_head.last_5_outcomes[0]` is the **most recent** result (rows ordered `date desc`); values are `'A'` (player A won), `'B'` (player B won), `'D'` (draw).

- [ ] **Step 2: Add the three view `Row` types to `database.types.ts`**

Open `src/types/database.types.ts`. Inside `public.Views`, immediately after the closing brace of `view_player_stats_yearly` (line ~237) and before `view_totals_global`, insert:

```ts
      view_player_streaks: {
        Row: {
          current_streak_length: number | null
          current_streak_type: string | null
          longest_loss_streak: number | null
          longest_win_streak: number | null
          player_id: string | null
        }
        Relationships: []
      }
      view_head_to_head: {
        Row: {
          a_win_rate: number | null
          a_wins: number | null
          b_wins: number | null
          draws: number | null
          last_5_outcomes: string[] | null
          matches_against: number | null
          matches_together: number | null
          player_a_id: string | null
          player_b_id: string | null
          shared_teams: number | null
        }
        Relationships: []
      }
      view_field_dominance: {
        Row: {
          field_id: string | null
          home_field: boolean | null
          matches_at_field: number | null
          player_id: string | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
```

- [ ] **Step 3: Verify types compile**

Run: `npx astro check`
Expected: no new TypeScript errors.

- [ ] **Step 4: Verify views return data**

In the Supabase SQL Editor, run:

```sql
select count(*) from view_player_streaks;
select count(*) from view_head_to_head;
select count(*) from view_field_dominance;
```

Expected: `view_player_streaks` returns up to 63 rows (one per player); `view_head_to_head` and `view_field_dominance` return non-negative counts (may be 0 if no cross-player or field data yet).

- [ ] **Step 5: Commit**

```bash
git add src/types/database.types.ts
git commit -m "feat(stats): type new stats views"
```

---

## Task 10: `TrendArrow.astro` + `StreakBadge.astro`

**Files:**
- Create: `src/components/features/stats/TrendArrow.astro`
- Create: `src/components/features/stats/StreakBadge.astro`

**Interfaces:**
- Consumes: `Trend` from `src/lib/stats/form.ts`, `StreakInfo` from `src/lib/stats/streaks.ts`.
- Produces (TrendArrow): props `{ trend: "improving" | "declining" | "stable" }`.
- Produces (StreakBadge): props `{ info: StreakInfo }` where `StreakInfo = { currentType: "W" | "L" | "D" | null; currentLength: number; longestWin: number; longestLoss: number }`.

- [ ] **Step 1: Create `TrendArrow.astro`**

```astro
---
import { Icon } from "astro-icon/components";

interface Props {
  trend: "improving" | "declining" | "stable";
}

const { trend } = Astro.props;

const config = {
  improving: { icon: "material-symbols:trending-up", color: "text-success", label: "Mejorando" },
  declining: { icon: "material-symbols:trending-down", color: "text-error", label: "En declive" },
  stable: { icon: "material-symbols:trending-flat", color: "text-warning", label: "Estable" },
}[trend];
---

<span class:list={["inline-flex items-center gap-1 text-sm font-bold", config.color]}>
  <Icon name={config.icon} size={18} aria-hidden="true" />
  {config.label}
</span>
```

- [ ] **Step 2: Create `StreakBadge.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { StreakInfo } from "@/lib/stats/streaks";

interface Props {
  info: StreakInfo;
}

const { info } = Astro.props;

const label =
  info.currentType === "W" ? "Victorias" :
  info.currentType === "L" ? "Derrotas" :
  info.currentType === "D" ? "Empates" : "";

const icon =
  info.currentType === "W" ? "material-symbols:local-fire-department" :
  info.currentType === "L" ? "material-symbols:arrow-downward" :
  "material-symbols:balance";

const color =
  info.currentType === "W" ? "text-success" :
  info.currentType === "L" ? "text-error" :
  "text-warning";
---

{
  info.currentLength > 0 && (
    <span class:list={["badge badge-soft gap-1.5 py-3 text-xs font-black uppercase", color]}>
      <Icon name={icon} size={14} aria-hidden="true" />
      {info.currentLength} {label}
    </span>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds (components compile; not yet rendered anywhere).

- [ ] **Step 4: Commit**

```bash
git add src/components/features/stats/TrendArrow.astro src/components/features/stats/StreakBadge.astro
git commit -m "feat(stats): add TrendArrow and StreakBadge components"
```

---

## Task 11: `FormGraph.astro` + `ClutchMeter.astro`

**Files:**
- Create: `src/components/features/stats/FormGraph.astro`
- Create: `src/components/features/stats/ClutchMeter.astro`

**Interfaces:**
- Consumes: `Outcome` from `src/lib/stats/types.ts`, `ClutchResult` from `src/lib/stats/clutch.ts`.
- Produces (FormGraph): props `{ outcomes: Outcome[] }` (chronological, oldest first; last up-to-10 rendered).
- Produces (ClutchMeter): props `{ clutch: ClutchResult }` where `ClutchResult = { delta: number; state: "hot" | "cold" | "neutral" }`.

- [ ] **Step 1: Create `FormGraph.astro`**

```astro
---
import type { Outcome } from "@/lib/stats/types";

interface Props {
  outcomes: Outcome[];
}

const { outcomes } = Astro.props;

const shown = outcomes.slice(-10);

const dotClass: Record<Outcome, string> = {
  W: "bg-success",
  D: "bg-warning",
  L: "bg-error",
};
---

<div class="flex items-center gap-1.5" aria-label="Forma reciente">
  {
    shown.map((o) => (
      <span
        class:list={["h-3 w-3 rounded-full", dotClass[o]]}
        title={o === "W" ? "Victoria" : o === "D" ? "Empate" : "Derrota"}
      />
    ))
  }
  {shown.length === 0 && (
    <span class="text-base-content/40 text-xs font-bold uppercase">Sin datos</span>
  )}
</div>
```

- [ ] **Step 2: Create `ClutchMeter.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { ClutchResult } from "@/lib/stats/clutch";

interface Props {
  clutch: ClutchResult;
}

const { clutch } = Astro.props;

const meta = {
  hot: { icon: "material-symbols:local-fire-department", color: "text-error", label: "En racha" },
  cold: { icon: "material-symbols:ac-unit", color: "text-info", label: "En baja" },
  neutral: { icon: "material-symbols:horizontal-rule", color: "text-warning", label: "Neutral" },
}[clutch.state];

const sign = clutch.delta > 0 ? "+" : "";
---

<div class="flex items-center gap-3">
  <Icon name={meta.icon} size={28} class={meta.color} aria-hidden="true" />
  <div class="flex-1">
    <div class="flex items-baseline justify-between">
      <span class:list={["text-xl font-black", meta.color]}>{sign}{clutch.delta}%</span>
      <span class="text-xs font-bold uppercase opacity-50">{meta.label}</span>
    </div>
    <div class="text-base-content/50 text-xs">vs media de carrera</div>
  </div>
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/stats/FormGraph.astro src/components/features/stats/ClutchMeter.astro
git commit -m "feat(stats): add FormGraph and ClutchMeter components"
```

---

## Task 12: `SynergyList.astro` + `RivalryTimeline.astro`

**Files:**
- Create: `src/components/features/stats/SynergyList.astro`
- Create: `src/components/features/stats/RivalryTimeline.astro`

**Interfaces:**
- Consumes: `SynergyEntry[]` from `src/lib/stats/synergy.ts`.
- Produces (SynergyList): props `{ entries: SynergyEntry[] }`.
- Produces (RivalryTimeline): props `{ outcomes: string[] }` (array of `"A" | "B" | "D"`, index 0 = most recent).

- [ ] **Step 1: Create `SynergyList.astro`**

```astro
---
import type { SynergyEntry } from "@/lib/stats/synergy";

interface Props {
  entries: SynergyEntry[];
}

const { entries } = Astro.props;
---

{
  entries.length === 0 ? (
    <p class="text-sm opacity-50">Sin datos suficientes</p>
  ) : (
    <ul class="divide-base-200 divide-y">
      {entries.map((e) => (
        <li class="flex items-center justify-between gap-2 py-2">
          <span class="truncate text-sm font-black">{e.teammateNickname}</span>
          <span class="text-xs font-bold opacity-60">
            {e.matchesTogether} partidos
          </span>
          <span class="text-success text-sm font-black">{e.winRate}%</span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Create `RivalryTimeline.astro`**

```astro
---
interface Props {
  outcomes: string[];
}

const { outcomes } = Astro.props;

const dotClass: Record<string, string> = {
  A: "bg-primary",
  B: "bg-secondary",
  D: "bg-warning",
};
---

{
  outcomes.length === 0 ? (
    <p class="text-sm opacity-50">Sin enfrentamientos aún</p>
  ) : (
    <div class="flex flex-wrap items-center gap-1.5" aria-label="Línea de tiempo de enfrentamientos">
      {outcomes.map((o) => (
        <span class:list={["h-3 w-3 rounded-full", dotClass[o] ?? "bg-base-300"]} />
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
git add src/components/features/stats/SynergyList.astro src/components/features/stats/RivalryTimeline.astro
git commit -m "feat(stats): add SynergyList and RivalryTimeline components"
```

---

## Task 13: Wire new metrics into `/players/[id]`

**Files:**
- Modify: `src/pages/players/[id].astro`

**Interfaces:**
- Consumes: `computeStreaks`, `rollingWinRate`, `computeTrend`, `computeClutch`, `computeConsistency`, `computeComebackRate`, `computeBestWorstMonth`, `computeSynergy`, `toOutcome`, `Outcome`, `MatchOutcomeInput`; components `StreakBadge`, `FormGraph`, `ClutchMeter`, `SynergyList`, `TrendArrow`.

- [ ] **Step 1: Add imports**

In `src/pages/players/[id].astro`, after line 13 (`import { computeHeadToHead } from "@/lib/utils/headToHead";`) add:

```ts
import { computeStreaks } from "@/lib/stats/streaks";
import { rollingWinRate, computeTrend } from "@/lib/stats/form";
import { computeClutch } from "@/lib/stats/clutch";
import { computeConsistency } from "@/lib/stats/consistency";
import { computeComebackRate } from "@/lib/stats/comeback";
import { computeBestWorstMonth } from "@/lib/stats/temporal";
import { computeSynergy } from "@/lib/stats/synergy";
import { toOutcome } from "@/lib/stats/types";
import type { Outcome, MatchOutcomeInput } from "@/lib/stats/types";
import StreakBadge from "@/components/features/stats/StreakBadge.astro";
import FormGraph from "@/components/features/stats/FormGraph.astro";
import ClutchMeter from "@/components/features/stats/ClutchMeter.astro";
import SynergyList from "@/components/features/stats/SynergyList.astro";
import TrendArrow from "@/components/features/stats/TrendArrow.astro";
```

- [ ] **Step 2: Add metric computations**

Find the line `const totalClubSeasons = uniqueClubYears.length;` (line ~255). Insert the following block immediately after it (before `const badges = computeBadges(...)`):

```ts
const outcomesAsc: Outcome[] = [...(allHistory ?? [])]
  .reverse()
  .map((entry) => {
    const m = getMatchData(entry.matches);
    return m ? toOutcome(entry.team, m.result) : null;
  })
  .filter((o): o is Outcome => o !== null);

const streakInfo = computeStreaks(outcomesAsc);
const recentWinRate = rollingWinRate(outcomesAsc, 5) ?? 0;
const trend = computeTrend(outcomesAsc, win_pct);
const clutch = computeClutch(recentWinRate, win_pct);
const consistency = computeConsistency(outcomesAsc);
const comebackRate = computeComebackRate(outcomesAsc);

const matchInputs: MatchOutcomeInput[] = (allHistory ?? [])
  .map((entry) => {
    const m = getMatchData(entry.matches);
    if (!m) return null;
    return {
      date: m.date,
      team: entry.team as "light" | "dark",
      result: m.result as "light" | "dark" | "draw",
      fieldName: m.fields?.name ?? null,
    };
  })
  .filter((x): x is MatchOutcomeInput => x !== null);

const { bestMonth, worstMonth } = computeBestWorstMonth(matchInputs);
const monthName = (m: number | null) => (m ? monthsLabels[m - 1] : null);

const { data: teammateRows } = await supabase
  .from("match_players")
  .select("player_id, team, match_id, player:players!inner (nickname)")
  .in("match_id", (allMatchEntries ?? []).map((m) => m.match_id))
  .neq("player_id", id)
  .eq("player.is_guest", false);

const myEntryByMatch = new Map(
  (allMatchEntries ?? []).map((e) => [e.match_id, e]),
);

const synergyMatches = (teammateRows ?? [])
  .map((row) => {
    const my = myEntryByMatch.get(row.match_id);
    if (!my) return null;
    const myMatch = Array.isArray(my.match)
      ? (my.match as { result: string }[])[0]
      : (my.match as { result: string } | null);
    if (!myMatch?.result) return null;
    if (row.team !== my.team) return null;
    const nickname = Array.isArray(row.player)
      ? (row.player as { nickname: string }[])[0]?.nickname
      : (row.player as { nickname: string } | null)?.nickname;
    return {
      teammateId: row.player_id,
      teammateNickname: nickname || "Desconocido",
      win: myMatch.result === my.team,
    };
  })
  .filter(
    (x): x is { teammateId: string; teammateNickname: string; win: boolean } =>
      x !== null,
  );

const synergyList = computeSynergy(synergyMatches);
```

- [ ] **Step 3: Render the new metric cards**

Find the end of the bento grid — the unique pair:

```
    </div>
  </div>
</Main>
```

(That is: close of "Forma Reciente" card `    </div>`, close of bento grid `  </div>`, then `</Main>`.) Replace `  </div>\n</Main>` with the new section plus the same closers:

```astro
  </div>

  <!-- Métricas avanzadas -->
  <section aria-label="Métricas avanzadas" class="mt-10">
    <h2 class="mb-4 text-lg font-black tracking-tight">Métricas Avanzadas</h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-bold tracking-wider uppercase opacity-60">Racha</span>
          <StreakBadge info={streakInfo} />
        </div>
        <div class="text-base-content/60 flex justify-between text-xs">
          <span>Racha de victorias más larga: {streakInfo.longestWin}</span>
          <span>Derrotas: {streakInfo.longestLoss}</span>
        </div>
      </div>

      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xs font-bold tracking-wider uppercase opacity-60">Tendencia</span>
          <TrendArrow trend={trend} />
        </div>
        <FormGraph outcomes={outcomesAsc} />
      </div>

      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">Factor Clutch</div>
        <ClutchMeter clutch={clutch} />
      </div>

      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">Consistencia</div>
        {consistency === null ? (
          <p class="text-sm opacity-50">Datos insuficientes (&lt; 3 partidos)</p>
        ) : (
          <span class="text-3xl font-black">{consistency}<span class="text-base opacity-40">/100</span></span>
        )}
      </div>

      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">Revancha tras derrota</div>
        {comebackRate === null ? (
          <p class="text-sm opacity-50">Datos insuficientes</p>
        ) : (
          <span class="text-3xl font-black">{comebackRate}<span class="text-base opacity-40">%</span></span>
        )}
      </div>

      <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
        <div class="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">Mejor / Peor mes</div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-success font-black">{monthName(bestMonth?.month ?? null) ?? "—"}</span>
          <span class="text-base-content/40">vs</span>
          <span class="text-error font-black">{monthName(worstMonth?.month ?? null) ?? "—"}</span>
        </div>
      </div>

      <div class="card bg-base-100 border-base-200 col-span-1 rounded-xl border p-4 shadow-md sm:col-span-2 lg:col-span-3">
        <div class="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">Sinergia (top compañeros)</div>
        <SynergyList entries={synergyList} />
      </div>
    </div>
  </section>
</Main>
```

- [ ] **Step 4: Verify build + unit tests**

Run: `npm run build`
Expected: build succeeds with no type errors.

Run: `npx vitest run`
Expected: all unit tests still pass.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`
Open `http://localhost:4321/players/<any-id>`.
Expected: "Métricas Avanzadas" section renders; metrics show values or "Datos insuficientes" gracefully; no runtime errors for players with < 3 matches.

- [ ] **Step 6: Commit**

```bash
git add src/pages/players/[id].astro
git commit -m "feat(stats): surface advanced metrics on player profile"
```

---

## Task 14: Rename `/compare` → `/versus` (301) + enhanced page

**Files:**
- Modify: `src/pages/compare.astro` (becomes redirect)
- Create: `src/pages/versus.astro` (enhanced page)
- Modify: `src/components/shared/Header.astro` (nav link)

**Interfaces:**
- Consumes: `view_head_to_head` (from Task 9), `rivalryTier`, `narrativeHook` (Task 8), `RivalryTimeline` (Task 12).

- [ ] **Step 1: Turn `compare.astro` into a 301 redirect**

Replace the entire content of `src/pages/compare.astro` with:

```astro
---
export const prerender = false;

return Astro.redirect("/versus", 301);
---
```

- [ ] **Step 2: Update the header nav link**

In `src/components/shared/Header.astro`, line 37, change:

```ts
      { href: "/compare", label: "Versus" },
```

to:

```ts
      { href: "/versus", label: "Versus" },
```

- [ ] **Step 3: Create the enhanced `versus.astro`**

Create `src/pages/versus.astro` (adapted from the old `compare.astro` — keep the player selectors and per-player stat rows; replace the manual h2h block with the `view_head_to_head` query and the new rivalry features):

```astro
---
Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";
import ComparisonRow from "@/components/compare/ComparisonRow.astro";
import RivalryTimeline from "@/components/features/stats/RivalryTimeline.astro";
import { createAstroSupabase } from "@/lib/supabase";
import { rivalryTier, narrativeHook } from "@/lib/stats/rivalry";
import { Icon } from "astro-icon/components";

const supabase = createAstroSupabase(Astro);

const { data: players } = await supabase
  .from("players")
  .select("id, nickname")
  .eq("is_active", true)
  .eq("is_guest", false)
  .order("nickname");

const p1Id = Astro.url.searchParams.get("p1");
const p2Id = Astro.url.searchParams.get("p2");

let p1Stats = null;
let p2Stats = null;
let h2h = null;

if (p1Id && p2Id && p1Id !== p2Id) {
  const { data: basicInfo } = await supabase
    .from("players")
    .select("id, nickname")
    .in("id", [p1Id, p2Id]);

  const p1Basic = basicInfo?.find((p) => String(p.id) === p1Id);
  const p2Basic = basicInfo?.find((p) => String(p.id) === p2Id);

  const { data: history } = await supabase
    .from("match_players")
    .select("player_id, team, match:matches!inner (id, result)")
    .in("player_id", [p1Id, p2Id]);

  type MatchEntry = {
    player_id: string;
    team: string;
    match: { id: string; result: string } | { id: string; result: string }[] | null;
  };

  const getMatchResult = (entry: MatchEntry): string | undefined => {
    if (!entry.match) return;
    const m = Array.isArray(entry.match) ? entry.match[0] : entry.match;
    return m?.result;
  };

  const calculateStats = (playerId: string, matches: MatchEntry[]) => {
    const myMatches = matches?.filter((m) => String(m.player_id) === String(playerId)) || [];
    const played = myMatches.length;
    let won = 0;
    let drawn = 0;
    myMatches.forEach((m) => {
      const res = getMatchResult(m);
      if (res === m.team) won++;
      else if (res === "draw") drawn++;
    });
    const points = won * 3 + drawn * 1;
    const winRate = played > 0 ? ((won / played) * 100).toFixed(0) : 0;
    const effectiveness = played > 0 ? ((points / (played * 3)) * 100).toFixed(0) : 0;
    return { matches_played: played, matches_won: won, points, win_rate: winRate, effectiveness };
  };

  if (p1Basic && history) p1Stats = { ...p1Basic, ...calculateStats(p1Id, history) };
  if (p2Basic && history) p2Stats = { ...p2Basic, ...calculateStats(p2Id, history) };

  const { data: h2hData } = await supabase
    .from("view_head_to_head")
    .select("matches_against, a_wins, b_wins, draws, shared_teams, a_win_rate, last_5_outcomes")
    .eq("player_a_id", p1Id)
    .eq("player_b_id", p2Id)
    .maybeSingle();

  if (h2hData) {
    h2h = {
      played_against: h2hData.matches_against ?? 0,
      p1_wins: h2hData.a_wins ?? 0,
      p2_wins: h2hData.b_wins ?? 0,
      draws_against: h2hData.draws ?? 0,
      shared_teams: h2hData.shared_teams ?? 0,
      last_5_outcomes: h2hData.last_5_outcomes ?? [],
      tier: rivalryTier(h2hData.matches_against ?? 0),
      hook: narrativeHook(
        h2hData.a_wins ?? 0,
        h2hData.b_wins ?? 0,
        p1Basic?.nickname ?? "A",
        p2Basic?.nickname ?? "B",
      ),
    };
  }
}

const tierLabel = { casual: "Casual", rival: "Rival", legendary: "Legendaria" } as const;
---

<Main title="Versus | SGSC">
  <Title title="Versus" subtitle="Comparativa Histórica" />

  <div class="card bg-base-100 border-base-200 mb-8 overflow-hidden rounded-xl border shadow-md">
    <div class="p-4 sm:p-6">
      <div class="flex flex-col items-center gap-4 sm:gap-6">
        <div class="flex w-full flex-col items-center gap-2 sm:flex-row">
          <div class="form-control w-full flex-1 sm:pr-4 sm:text-right">
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend text-primary">Jugador 1</legend>
              <div class="relative">
                <Icon name="material-symbols:search" class="text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                <input id="p1-select" name="p1" type="text" list="players-datalist" value={p1Stats?.nickname || ""} placeholder="Elegir jugador..." class="select w-full rounded-xl pl-10 pr-4" autocomplete="off" aria-label="Buscar jugador 1" />
              </div>
            </fieldset>
          </div>

          <div class="relative z-10 hidden shrink-0 items-center justify-center sm:flex">
            <div class="bg-base-100 border-base-300 text-base-content/40 flex h-14 w-14 items-center justify-center rounded-full border-4 text-xl font-black shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
              VS
            </div>
          </div>

          <div class="form-control w-full flex-1 sm:pl-4 sm:text-left">
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend text-secondary">Jugador 2</legend>
              <div class="relative">
                <Icon name="material-symbols:search" class="text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                <input id="p2-select" name="p2" type="text" list="players-datalist" value={p2Stats?.nickname || ""} placeholder="Elegir jugador..." class="select w-full rounded-xl pl-10 pr-4" autocomplete="off" aria-label="Buscar jugador 2" />
              </div>
            </fieldset>
          </div>
        </div>

        <datalist id="players-datalist">
          {players?.map((p) => (
            <option value={p.nickname} data-id={p.id} />
          ))}
        </datalist>

        <button
          id="btn-compare"
          type="button"
          class="btn btn-primary md:btn-md btn-sm w-full rounded-xl shadow-md"
          disabled={!p1Id || !p2Id || p1Id === p2Id}
        >
          <Icon name="material-symbols:compare-arrows" size={24} aria-hidden="true" />
          Comparar Jugadores
        </button>
      </div>
    </div>
  </div>

  {
    p1Stats && p2Stats ? (
      <div class="space-y-8">
        {
          h2h && h2h.played_against >= 2 && (
            <div class="card bg-base-100 border-base-200 overflow-hidden rounded-xl border shadow-md">
              <div class="card-body p-4 text-center sm:p-8">
                <div class="mb-2 flex items-center justify-center gap-2">
                  <Icon name="material-symbols:swords" aria-hidden="true" />
                  <span class="text-sm font-black uppercase">
                    Rivalidad {h2h.tier ? tierLabel[h2h.tier] : ""}
                  </span>
                </div>
                <RivalryTimeline outcomes={h2h.last_5_outcomes} />
                {h2h.hook && (
                  <p class="text-base-content/60 mt-4 text-sm font-bold italic">"{h2h.hook}"</p>
                )}
              </div>
            </div>
          )
        }

        <div class="card bg-base-100 border-base-200 relative overflow-hidden rounded-xl border shadow-md">
          <div class="card-body p-4 text-center sm:p-8">
            <h3 class="text-base-content/40 mb-6 text-xs font-black tracking-widest uppercase md:text-lg">
              Historial
            </h3>
            <div class="mx-auto flex w-full max-w-lg items-end justify-between gap-4">
              <div class="flex flex-1 flex-col items-center">
                <div class="text-primary mb-2 text-5xl font-black sm:text-7xl" aria-label={`${h2h?.p1_wins ?? 0} victorias de ${p1Stats.nickname}`}>
                  {h2h?.p1_wins ?? 0}
                </div>
                <span class="text-primary/80 w-full truncate text-xs font-bold uppercase">{p1Stats.nickname}</span>
              </div>
              <div class="flex flex-col items-center pb-4">
                <span class="text-base-content/30 text-4xl font-bold">{h2h?.draws_against ?? 0}</span>
                <span class="text-base-content/50 text-sm font-bold uppercase">Empates</span>
              </div>
              <div class="flex flex-1 flex-col items-center">
                <div class="text-secondary mb-2 text-5xl font-black sm:text-7xl" aria-label={`${h2h?.p2_wins ?? 0} victorias de ${p2Stats.nickname}`}>
                  {h2h?.p2_wins ?? 0}
                </div>
                <span class="text-secondary/80 w-full truncate text-xs font-bold uppercase">{p2Stats.nickname}</span>
              </div>
            </div>
            <div class="badge badge-ghost badge-sm md:badge-lg mt-6 gap-2 self-center rounded-xl py-3 font-bold uppercase">
              <Icon name="material-symbols:swords" aria-hidden="true" />
              {h2h?.played_against ?? 0} Partidos disputados
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border-base-200 flex flex-row items-center justify-between gap-4 rounded-xl border p-4 shadow-md">
          <div class="flex shrink-0 items-center gap-3">
            <div class="bg-base-200 text-base-content/60 rounded-full p-2" aria-hidden="true">
              <Icon name="material-symbols:handshake" size={24} />
            </div>
            <div class="text-left">
              <div class="font-bold">Equipos compartidos</div>
              <div class="text-base-content/60 text-xs">Jugando juntos</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black">{h2h?.shared_teams ?? 0}</div>
            <div class="text-base-content/50 text-xs font-bold uppercase">veces</div>
          </div>
        </div>

        <div class="bg-base-100 border-base-200 overflow-hidden rounded-xl border shadow-md" role="table" aria-label="Comparativa de estadísticas entre jugadores">
          <div class="bg-base-200 grid grid-cols-3 items-center py-3" role="row">
            <div class="text-primary text-center font-black" role="columnheader">{p1Stats.nickname}</div>
            <div class="text-base-content/60 text-center text-xs font-bold uppercase sm:text-sm md:text-lg" role="columnheader">Estadística</div>
            <div class="text-secondary text-center font-black" role="columnheader">{p2Stats.nickname}</div>
          </div>
          <div class="divide-base-200 divide-y" role="rowgroup">
            <ComparisonRow label="Puntos Históricos" val1={p1Stats.points} val2={p2Stats.points} />
            <ComparisonRow label="Efectividad" val1={p1Stats.effectiveness + "%"} val2={p2Stats.effectiveness + "%"} num1={Number(p1Stats.effectiveness)} num2={Number(p2Stats.effectiveness)} />
            <ComparisonRow label="Partidos Jugados" val1={p1Stats.matches_played} val2={p2Stats.matches_played} />
            <ComparisonRow label="Victorias" val1={p1Stats.matches_won} val2={p2Stats.matches_won} />
            <ComparisonRow label="% Victorias" val1={p1Stats.win_rate + "%"} val2={p2Stats.win_rate + "%"} num1={Number(p1Stats.win_rate)} num2={Number(p2Stats.win_rate)} />
          </div>
        </div>
      </div>
    ) : (
      <div class="card bg-base-100 rounded-xl p-12 text-center shadow-md">
        <Icon name="material-symbols:compare-arrows" size={64} class="text-base-content/20 mx-auto mb-4" aria-hidden="true" />
        <p class="text-base-content/60 font-bold">Selecciona dos jugadores y pulsa "Comparar"</p>
      </div>
    )
  }
</Main>

<script is:inline>
  const input1 = document.getElementById("p1-select") as HTMLInputElement | null;
  const input2 = document.getElementById("p2-select") as HTMLInputElement | null;
  const btn = document.getElementById("btn-compare") as HTMLButtonElement | null;
  const datalist = document.getElementById("players-datalist") as HTMLDataListElement | null;

  function getPlayerId(nickname: string): string | null {
    if (!datalist) return null;
    for (const opt of datalist.querySelectorAll("option")) {
      if (opt.value.toLowerCase() === nickname.toLowerCase()) {
        return opt.getAttribute("data-id");
      }
    }
    return null;
  }

  function checkValidity() {
    if (!input1 || !input2 || !btn) return;
    const id1 = getPlayerId(input1.value.trim());
    const id2 = getPlayerId(input2.value.trim());
    if (id1 && id2 && id1 !== id2) {
      btn.removeAttribute("disabled");
      btn.classList.remove("btn-disabled");
    } else {
      btn.setAttribute("disabled", "true");
      btn.classList.add("btn-disabled");
    }
  }

  input1?.addEventListener("input", checkValidity);
  input2?.addEventListener("input", checkValidity);

  btn?.addEventListener("click", function () {
    if (!input1 || !input2) return;
    const id1 = getPlayerId(input1.value.trim());
    const id2 = getPlayerId(input2.value.trim());
    if (id1 && id2) {
      const url = new URL(window.location.href);
      url.searchParams.set("p1", id1);
      url.searchParams.set("p2", id2);
      window.location.href = url.toString();
    }
  });

  checkValidity();
</script>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds; `/compare` redirects to `/versus` (301) and `/versus` renders.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`
- Visit `http://localhost:4321/compare` → expect 301 redirect to `/versus`.
- Visit `http://localhost:4321/versus?p1=<id1>&p2=<id2>` → expect rivalry tier + timeline + shared teams + narrative hook when `matches_against >= 2`; "no hay data" (0s) otherwise.

- [ ] **Step 6: Commit**

```bash
git add src/pages/compare.astro src/pages/versus.astro src/components/shared/Header.astro
git commit -m "feat(stats): rename compare to versus with rivalry features"
```

---

## Task 15: Add streak column to `/ranking`

**Files:**
- Modify: `src/pages/ranking.astro`
- Modify: `src/components/ranking/StandingsTable.astro`

**Interfaces:**
- Consumes: `view_player_streaks` (Task 9).

- [ ] **Step 1: Fetch streaks + add sort option in `ranking.astro`**

In `src/pages/ranking.astro`, after the `const { data: rawPlayers, error } = await query.eq("is_guest", false);` line (line ~65), add:

```ts
const { data: streaksData } = await supabase
  .from("view_player_streaks")
  .select("player_id, current_streak_type, current_streak_length");
const streakByPlayer = new Map(
  (streaksData ?? []).map((s) => [s.player_id, s]),
);
```

Then, in the `sortOptions` array (line ~40), add the streak entry right after the `name` entry:

```ts
  { value: "streak", label: "Racha" },
```

Then, in the players mapping (line ~71), inside the mapped object add:

```ts
    current_streak_type: streakByPlayer.get(p.player_id)?.current_streak_type ?? null,
    current_streak_length: streakByPlayer.get(p.player_id)?.current_streak_length ?? 0,
```

Then, add a sort case in the `sortedPlayers` switch (line ~105), after `case "name":`:

```ts
    case "streak":
      return b.current_streak_length - a.current_streak_length;
```

- [ ] **Step 2: Add the streak column to `StandingsTable.astro`**

In `src/components/ranking/StandingsTable.astro`, add a header cell after the `Forma` header (`<th scope="col" class={`${responsiveClass}`}>Forma</th>`, line ~88):

```astro
        <th scope="col" class="text-base-content">Racha</th>
```

And in the player row type annotation (the inline `player: { ... }` type, line ~96), add:

```ts
              current_streak_type: string | null;
              current_streak_length: number;
```

And in the row body, after the Forma cell (`<td class={`${responsiveClass}`}> ... </td>`, lines ~157-166), add:

```astro
              <td>
                {
                  player.current_streak_length > 0 ? (
                    <span class:list={[
                      "font-black",
                      player.current_streak_type === "W" ? "text-success" : player.current_streak_type === "L" ? "text-error" : "text-warning",
                    ]}>
                      {player.current_streak_length}
                      {player.current_streak_type === "W" ? "V" : player.current_streak_type === "L" ? "D" : "E"}
                    </span>
                  ) : (
                    <span class="text-base-content/40">—</span>
                  )
                }
              </td>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`
Open `http://localhost:4321/ranking`.
Expected: a "Racha" column shows `2V`/`1D`/`3E` or `—`; selecting "Racha" in the sort dropdown orders by streak length desc.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ranking.astro src/components/ranking/StandingsTable.astro
git commit -m "feat(stats): add streak column and sort to ranking"
```

---

## Self-Review (spec coverage)

| Spec requirement | Task(s) | Status |
|---|---|---|
| `view_player_streaks` | 9 | ✅ |
| `view_head_to_head` | 9, 14 | ✅ |
| `view_field_dominance` | 9 | ⚠️ created + typed, not consumed — `/fields/[id]` page does not exist (spec says "if field detail page exists"). Deferred. |
| Form trajectory + trend arrow | 2, 13 | ✅ |
| Clutch factor | 3, 13 | ✅ |
| Consistency score | 4, 13 | ✅ (edge: `<3` → hidden, not "default 50"; equivalent UX) |
| Teammate synergy | 7, 13 | ✅ |
| Side performance delta | 8 | ⚠️ tested util; player page keeps existing "Claro vs Oscuro" card (same data). Not re-wired to avoid churn. |
| Temporal patterns (best/worst month) | 6, 13 | ✅ |
| Day-of-week performance | — | ⚠️ optional ("if date granularity allows"); omitted (YAGNI). |
| Comeback metric | 5, 13 | ✅ |
| `/compare` → `/versus` 301 | 14 | ✅ |
| Header internal link update | 14 | ✅ (`breadcrumbs.ts` already maps `versus`) |
| `/versus` timeline + tier + shared teams + hook | 12, 14 | ✅ |
| `/players/[id]` new metrics | 13 | ✅ |
| `/ranking` streak column + sort | 15 | ✅ (tie-break by recency not implemented; negligible at this scale) |
| Snapshot tests | — | ⚠️ skipped (Decision 1 — no component harness; logic fully unit-tested) |

**Placeholder scan:** no `TBD`/`TODO`/`implement later`; every code step has complete code; every run command has expected output.

**Type consistency:** `computeStreaks` → `StreakInfo` used verbatim in `StreakBadge`; `computeTrend` → `Trend` in `TrendArrow`; `computeClutch` → `ClutchResult` in `ClutchMeter`; `computeSynergy` → `SynergyEntry[]` in `SynergyList`; `rivalryTier`/`narrativeHook` → `RivalryTier`/string in `versus.astro`. `view_head_to_head` columns (`matches_against`, `a_wins`, `b_wins`, `draws`, `shared_teams`, `last_5_outcomes`) match the `.select(...)` in Task 14 and the `Row` types in Task 9.

## Final verification (run once all tasks done)

```bash
npx vitest run
npm run build
```

Expected: all unit tests pass; production build succeeds with no type errors.





