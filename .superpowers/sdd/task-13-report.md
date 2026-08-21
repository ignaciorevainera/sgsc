# Task 13 Report — Wire new metrics into /players/[id]

## Files Changed
- `src/pages/players/[id].astro` — 3 edits as per plan:
  - **Step 1 imports** (15 lines after `import { computeHeadToHead }`): added `computeStreaks`, `rollingWinRate`/`computeTrend`, `computeClutch`, `computeConsistency`, `computeComebackRate`, `computeBestWorstMonth`, `computeSynergy`, `toOutcome`, type `Outcome`/`MatchOutcomeInput`, plus 5 components `StreakBadge`, `FormGraph`, `ClutchMeter`, `SynergyList`, `TrendArrow`.
  - **Step 2 computations** (after `const totalClubSeasons = uniqueClubYears.length;` before `const badges =`): added `outcomesAsc` (reverse of `allHistory` desc → asc via `toOutcome`), `streakInfo`, `recentWinRate`, `trend`, `clutch`, `consistency`, `comebackRate`, `matchInputs`, `bestMonth`/`worstMonth` via `computeBestWorstMonth`, `monthName` helper using existing `monthsLabels`, plus synergy query (`match_players` with `player:players!inner(nickname)` filtered by `match_id` IN `allMatchEntries`, `neq player_id`, `is_guest=false`), `myEntryByMatch` map, `synergyMatches` (same-team filter + win calc `myMatch.result === my.team`), `synergyList = computeSynergy(synergyMatches)`.
  - **Step 3 markup** (replaced `  </div>\n</Main>` after bento grid): inserted `<section aria-label="Métricas avanzadas">` with 7 cards — Racha (StreakBadge + longestWin/longestLoss), Tendencia (TrendArrow + FormGraph), Factor Clutch (ClutchMeter), Consistencia, Revancha, Mejor/Peor mes (monthName), Sinergia (SynergyList) — preserving bento grid close `</div>` and `</Main>`.

## Build Result
- `npm run build`: **PASS** — 13.70s, no type errors. DaisyUI `@property` warning is pre-existing, non-fatal. Adapter `@astrojs/vercel` bundled OK. Verified `@` alias resolves for all 10 new stats imports and 5 component imports.

## Tests
- `npx vitest run`: **PASS** — 18 test files, 95 tests, all green. No regressions.

## Self-Review
- Anchors verified pre-edit:
  - Import anchor `import { computeHeadToHead } from "@/lib/utils/headToHead";` at line 13 — match.
  - Computation anchor `const totalClubSeasons = uniqueClubYears.length;` at line 255 — match, inserted before `const badges =`.
  - Markup anchor `    </div>\n  </div>\n</Main>` at lines 913-915 (Forma Reciente card close + bento grid close + Main close) — replaced via `  </div>\n</Main>` substring, which left grid close intact and inserted section before `</Main>`.
  - `monthsLabels` defined at line ~222, well above insertion point — `monthName` helper valid.
  - `getMatchData` helper exists at line ~109 — used for both `outcomesAsc` and `matchInputs`.
  - `allMatchEntries` shape confirmed: `match_id, team, match:matches!inner(result)` — mapped to `Map<match_id, entry>` for win calc.
  - `allHistory` sorted desc verified via `.order("matches(date)", { ascending: false })` — reverse needed for `outcomesAsc` (chronological oldest-first) as required by `computeStreaks` etc.
  - All 7 cards match plan verbatim markup and Spanish labels, DaisyUI tokens only (`bg-base-100`, `border-base-200`, `text-success`/`error` etc.), no hardcoded colors.

## Concerns
- **Anchor drift**: none — plan line numbers (~13, ~255) matched current file exactly; no drift detected. One minor drift risk: original plan snippet for synergy assumed `allMatchEntries.map(m => m.match_id)` non-empty; Supabase `.in()` with empty array may error if player has 0 matches. Current file already handles 0-match via `?? []`, but `.in("match_id", [])` on empty will return 0 rows or Supabase error depending on version. Low severity — edge case only for brand-new players with 0 matches; fallback `teammateRows ?? []` makes `synergyList` empty gracefully even if query errors? Actually Supabase will error on empty `in()`, not return data. Plan specifies exact code without guard, so kept verbatim. If runtime error surfaces, guard with `allMatchEntries?.length ? await supabase... : {data: []}` would be needed. Not changed per task spec.
- **Type of `allMatchEntries` match field**: plan casts `my.match as {result: string}` — correct shape `matches!inner(result)` returns `{result}`; code handles both array and object forms.
- **No manual smoke test run** (`npm run dev` not executed per automated task, but build + vitest cover static correctness).
