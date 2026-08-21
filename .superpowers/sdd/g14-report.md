# Task 14 — Badges page overhaul (player search)

Date: 2026-08-21
Plan: docs/superpowers/plans/2026-08-20-gamification.md#task-14

## Steps executed
- Step 1 — Overwrite `src/pages/badges.astro` (260 lines static catalog → 115 lines player-search version). Verified pre-edit file had `progressiveBadges`, `specialBadges`, `tierOrder`, `tierStyles` — confirmed will be overwritten (no preservation needed per spec overhaul).
- Step 2 — Verify build: `npm run build` PASS.
- Step 3 — Commit.

## Files changed
- Modified: `src/pages/badges.astro` — full replacement per plan Step 1 verbatim.

## Overwritten content detail
- Imports: `createAstroSupabase`, `computePlayerBadges`, `computeStreaks`, `rollingWinRate`, `toOutcome`, `BadgeGrid`, `Main`, `Title`.
- Queries: `players` (select `id, nickname`, `eq is_active true`, `eq is_guest false`, `order nickname`) + conditional `Promise.all` when `?player=` present: `view_player_stats_all_time` (matches_played,wins,points), `match_players` (match_id,team,match:matches!inner(date,result)), `players` nickname lookup.
- Mapping: `own = (ownRows ?? []).map` with `Array.isArray(r.match)` unwrap, `field_id: null`, `outcomes = [...own].sort(date).map(toOutcome)`.
- Metrics: 16-field `BadgeMetrics` via `computePlayerBadges({ matchesPlayed,wins,points,longestWinStreak: computeStreaks(outcomes).longestWin, bestDuoWins:0, comebackStreak:0, bestFieldWins:0, nemesisWins:0, clutchWinRate: rollingWinRate(outcomes,5)??0, ironMan:false, underdog:false, socialButterfly:false, totalClubSeasons:1, playedSeasons:1, lightWins:0, darkWins:0 })`.
- Render: `Main`+`Title` + `form method GET /badges` with `input list=players-datalist` + `datalist option value=nickname data-id=id` + `button Ver medallas` + conditional `result && BadgeGrid` with `Medallas de {selectedNickname}` + `!playerId && p Selecciona un jugador...` + inline script submitting via `data-id` lookup and `window.location.href=/badges?player=${id}`.

## Build
- `npm run build`: PASS — `astro build` server mode, Vercel adapter, 16.51s, no type errors. Warning only `@property` unknown at rule (daisyUI, pre-existing). Route `/badges` emitted.

## Self-review
- File content matches plan Step 1 byte-for-byte (verified imports, queries, `Array.isArray` guard, `outcomes` sort, 16 metrics, form/datalist/script structure).
- `supabase` via `createAstroSupabase(Astro)` — correct SSR client per `src/lib/supabase.ts:12`; no direct `supabase` import.
- `BadgeGrid` import path `@/components/features/gamification/BadgeGrid.astro` resolves (created Task 8).
- `select` uses explicit columns, never `select(*)`.
- Script uses `is:inline` without TypeScript types (plain JS with `as` cast in plan — kept as plan verbatim which uses `as HTMLInputElement | null` inside inline script; Astro strips via esbuild — build PASS confirms no syntax error).
- No hardcoded colors; DaisyUI token classes preserved.

## Concerns
- **Static catalog lost** — previous `progressiveBadges`/`specialBadges`/`tierOrder` UI (260 lines) intentionally removed per spec overhaul. Badges page now shows dynamic per-player badges only; acceptable per Task 14 spec (`Replaces entire src/pages/badges.astro`).
- **Simplified metrics** — badges page hardcodes `bestDuoWins=0`, `comebackStreak=0`, `bestFieldWins=0`, `nemesisWins=0`, `ironMan=false`, `underdog=false`, `socialButterfly=false`, `totalClubSeasons=1`, `playedSeasons=1`, `lightWins=0`, `darkWins=0` (only 5 metrics derived: matchesPlayed/wins/points/longestWinStreak/clutchWinRate). Richer derivation lives on `/players/[id]/badges` (Task 10). Acceptable per spec — badges page is search-wrapper, not full derivation.
- **No manual smoke test** — `?player=` query not curl-tested; build PASS covers compilation; runtime requires `npm run dev` + datalist selection manual verification.

## Commit
- `feat(gamification): add player search to badges page` — `src/pages/badges.astro`
