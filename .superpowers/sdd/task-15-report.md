# Task 15 Report — Add streak column to /ranking

## Summary
Implemented streak column + sort on `/ranking` per plan Task 15 verbatim. Streaks fetched from `view_player_streaks` (all-time, per Decision 4), mapped to ranking rows, sortable via "Racha" option, rendered as badge in StandingsTable.

## Files Changed
- `src/pages/ranking.astro:66-73` — added `view_player_streaks` fetch (`player_id, current_streak_type, current_streak_length`) + `streakByPlayer` Map
- `src/pages/ranking.astro:43` — added `{ value: "streak", label: "Racha" }` to `sortOptions` after "Nombre"
- `src/pages/ranking.astro:106-107` — mapped `current_streak_type` / `current_streak_length` from `streakByPlayer` (null / 0 fallback)
- `src/pages/ranking.astro:120-121` — added `case "streak": return b.current_streak_length - a.current_streak_length;` sort
- `src/components/ranking/StandingsTable.astro:88-89` — added header `<th>Racha</th>` after Forma
- `src/components/ranking/StandingsTable.astro:110-111` — extended inline player type with `current_streak_type: string | null; current_streak_length: number;`
- `src/components/ranking/StandingsTable.astro:170-184` — added streak cell: `V` (success/W), `D` (error/L), `E` (warning/D) + `—` fallback

## Build Result
`npm run build` — **PASS**
- `astro build` server output, Vercel adapter, ~13.96s
- Only warning: daisyUI `@property` unknown at rule (pre-existing, unrelated)
- No type errors

## Self-Review
- Anchors verified against on-disk files before edit; drift none (ranking.astro unchanged in prior plan tasks)
- Streak fetch is additive, does not filter ranking rows; missing streak → 0 / null → renders `—`
- Sort is by `current_streak_length` desc; tie-break not specified (matches plan Self-Review note: negligible)
- Header uses `text-base-content` per plan (not `responsiveClass`); streak column always visible (Forma respects `showDetails`, Racha does not — matches verbatim)
- Cell logic: W→V + success, L→D + error, else E + warning; matches spec `W→V success, L→D error, D→E warning, else —`
- No `select(*)` introduced; explicit columns maintained
- Spanish copy "Racha" consistent with UI language
- No comments added (per constraints)
- Concerns: `view_player_streaks` must exist in Supabase (Task 9 migration) for runtime data; build passes regardless (no DB connection at build). Runtime graceful if view empty (Map empty → defaults).

## Verification
- `npm run build` PASS (see above)
- Manual smoke: not run (requires `npm run dev` + DB); expected: `/ranking` shows Racha column `2V/1D/3E/—`, sort "Racha" orders desc by length
