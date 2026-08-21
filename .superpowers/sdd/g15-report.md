# Task 15 — Hall of fame — seasonal narratives

Date: 2026-08-21
Plan: docs/superpowers/plans/2026-08-20-gamification.md#task-15

## Steps executed
- Step 1 — Add imports to `src/pages/hall-of-fame.astro` after `Title` import (line 10): `detectRisingStar, detectVeteran, detectTitleRace` from `@/lib/gamification/narratives` + `NarrativeCard` component. Verified anchor: `Title` at line 10, added 2 lines.
- Step 2 — Compute narratives:
  - After `const lastSeason = currentYear - 1;` (line 83) add `yearlyData` fetch (`view_player_stats_yearly` select `year, player_id, nickname, points, matches_played`, `eq is_guest false`) + `years = [...new Set((yearlyData ?? []).map(y.year))]`. Verified no `yearlyData` shadowing — existing yearly query uses `championsData` + `allMatchPlayers` in `Promise.all` destructure, so safe.
  - After `const champions = ...` (line 107) add `veteran = detectVeteran(safePlayers.map(...))` + `risingStar = detectRisingStar((yearlyData ?? []).map(p => ({ nickname, firstSeason: p.year === Math.min(...(years ?? [])), points })))` verbatim per plan.
- Step 3 — Render narratives section before `{champions.length > 0 && (` block (line 319): conditional `(veteran || risingStar)` wrapper with `h2 Historias de la Temporada` + grid 2 cols + `NarrativeCard` for each.
- Step 4 — Verify build: `npm run build` PASS.
- Step 5 — Commit.

## Files changed
- Modified: `src/pages/hall-of-fame.astro` — 535 → 560 lines (+25 lines, 3 edits).

## Edits detail
- Import block (lines 11-12): `import { detectRisingStar, detectVeteran, detectTitleRace }` + `import NarrativeCard`.
- Data fetch (lines 87-91): `const { data: yearlyData } = await supabase.from("view_player_stats_yearly").select("year, player_id, nickname, points, matches_played").eq("is_guest", false)` + `const years`.
- Computation (lines 116-119): `const veteran = detectVeteran(...)` + `const risingStar = detectRisingStar(...)` with plan's `firstSeason: p.year === Math.min(...(years ?? []))` verbatim.
- Markup (lines 331-342): `{(veteran || risingStar) && (<div class="mb-8"><h2>Historias...</h2><div class="grid...">{veteran && <NarrativeCard/>}{risingStar && <NarrativeCard/>}</div></div>)}` inserted before champions block.

## Build
- `npm run build`: PASS — `astro build` server mode, Vercel adapter, 16.94s, no type errors. Warning only `@property` unknown at rule (daisyUI, pre-existing). Routes emitted.

## Self-review
- All 3 plan steps applied verbatim (imports, yearlyData/years fetch, veteran/risingStar detects, narratives section before champions).
- No variable shadowing: `yearlyData` new name does not collide with `championsData` (checked destructure at line 94); `years` fresh.
- `supabase` via direct client `../lib/supabase` — correct for hall-of-fame page (SSR-unwrapped, consistent with file's existing usage; `createAstroSupabase` not needed here).
- `select` uses explicit columns, never `select(*)`.
- DaisyUI tokens preserved (`text-primary`, `bg-base-100`, etc.); no hardcoded colors.
- Narrative logic kept verbatim per plan spec despite known simplification (see Concerns).

## Concerns
- **RisingStar bug kept verbatim** — plan's `firstSeason: p.year === Math.min(...(years ?? []))` checks if row's year equals global min year, not if player's min year equals global min. Player with multiple yearly rows (e.g., 2023 + 2024) will generate one entry per year row, with 2024 row incorrectly marked `firstSeason:false` and 2023 row `true`, so `detectRisingStar` may evaluate duplicate nickname entries with differing `firstSeason`. Correct logic would group by player_id and check `Math.min(...playerYears) === globalMin`. Kept verbatim per instruction; flagged for follow-up.
- **Unused import** — `detectTitleRace` imported but not used in this file (plan Step 1 includes it; Step 2 computation only uses `detectVeteran` + `detectRisingStar`). Build PASS (no unused-var error in Astro/Svelte emit), but linter may flag. Intentional per plan spec (wiring for future title-race narrative).
- **Empty-years edge** — `Math.min(...(years ?? []))` when `yearlyData` empty yields `Infinity`; `p.year === Infinity` always false, so `risingStar` returns null. Handled gracefully (returns `null`, section hidden). No crash due to `?? []` fallbacks.
- **Extra query cost** — `yearlyData` fetch (`select year, player_id, nickname, points, matches_played` without year filter) scans full `view_player_stats_yearly` (all seasons). Champions already fetch `view_player_stats_yearly` for `lastSeason`; could be merged, but kept as two queries per plan spec. Monitor for N+1 if view grows.

## Commit
- `feat(gamification): add seasonal narratives to hall of fame` — `src/pages/hall-of-fame.astro`
