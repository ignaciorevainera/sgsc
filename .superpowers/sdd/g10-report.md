# Task 10: /players/[id]/badges route — Report

## What you implemented

- `src/pages/players/[id]/badges.astro` — Plan Task 10 Step 1 verbatim. SSR route with `Cache-Control public, max-age=60, s-maxage=300`, 6 parallel Supabase queries (`players.nickname`, `view_player_stats_all_time matches_played/wins/points`, `view_player_stats_yearly year/matches_played`, `match_players+matches date/result/field_id` for ownRows, `match_players match_id/player_id/team` neq id for coRows, `players count exact head:true is_guest=false` for activeCount), redirect if `!id` or `!player`, `OwnRow` type + `toOwn` unwrapping `r.match` array, `own` mapping, `outcomesAsc` sorted by date via `toOutcome(team,result)`, `longestWin` via `computeStreaks`, `clutchWinRate` via `rollingWinRate(...,5) ?? 0`, `color` via `computeColorStats`, `seasonYears/currentYear/seasonMatchCount` via `yearly` + `own.date.startsWith(year)`, `coMapped` mapping, `metrics` assembly (16 fields: matchesPlayed/wins/points/longestWinStreak/bestDuoWins/comebackStreak/bestFieldWins/nemesisWins/clutchWinRate/ironMan/underdog/socialButterfly/totalClubSeasons/playedSeasons/lightWins/darkWins) via 6 pure helpers, `computePlayerBadges(metrics)` → `BadgeGrid`. Markup: `Main title="${nickname} — Medallas | SGSC"` + `Title Medallas/${nickname}` + `BadgeGrid badges={badges}`.

## Build result

`npm run build` → PASS

```
[build] output: "server"
[build] mode: "server"
directory: E:\Dev\proyectos\sgsc\dist\
adapter: @astrojs/vercel
[build] ✓ Completed in 444ms
[vite] ✓ built in 1.54s (server)
[vite] ✓ built in 4.73s (client)
[vite] ✓ built in 224ms
[build] ✓ Completed in 6.61s
[build] Server built in 14.38s
[build] Complete!
```

Single warning: `@property --radialprogress` unknown rule (daisyUI, pre-existing). No type errors. Route `/players/[id]/badges` generated (server mode, no prerender error).

## Files changed

- Created: `src/pages/players/[id]/badges.astro` (88 lines) — plan Task 10 Step 1 verbatim, directory `src/pages/players/[id]/` now coexists alongside `src/pages/players/[id].astro` (file `[id].astro` vs directory `[id]` — distinct names on Windows)
- Created: `.superpowers/sdd/g10-report.md` (this file)

## Self-review findings

1. **Imports** — `@ alias` verified: `createAstroSupabase` `@/lib/supabase`, `computePlayerBadges` `@/lib/gamification/badges`, `compute*` from `@/lib/gamification/metrics`, `computeStreaks` `@/lib/stats/streaks`, `rollingWinRate` `@/lib/stats/form`, `toOutcome` `@/lib/stats/types`, `computeColorStats` `@/lib/utils/colorStats`, `BadgeGrid` `@/components/features/gamification/BadgeGrid.astro`, `Main` `@/layouts/Main.astro`, `Title` `@/components/shared/Title.astro` — all resolve, build confirms.
2. **Query parity** — 6 queries match plan exactly: `players.select(nickname).eq(id).maybeSingle()`, `view_player_stats_all_time`, `view_player_stats_yearly`, `match_players+matches!inner`, `match_players neq player_id`, `players count exact head:true` — explicit columns, no `select(*)`.
3. **Type unwrapping** — `OwnRow` with `match: {date,result,field_id} | {date,result,field_id}[]` and `Array.isArray` guard per plan, handles Supabase embedding variance.
4. **Metrics assembly** — 16 fields verbatim: `longestWin` from `computeStreaks`, `clutchWinRate` rolling 5, `color.light/dark.wins`, `seasonMatchCount` startsWith year, `coMapped` + `computeBestDuoWins/NemesisWins` with `id, own, coMapped`, `comebackStreak/bestFieldWins/ironMan` pure, `underdog` first==L && last==W with length>=2, `socialButterfly` with `activeCount?.length ?? 0`, `totalClubSeasons` Set size, `playedSeasons` filter `matches_played>=3`.
5. **Rendering** — `Main` + `Title` + `BadgeGrid` minimal shell, matches plan mock, no extra UI.

## Issues or concerns

- **coRows over-fetch** — `supabase.from("match_players").select("match_id, player_id, team").neq("player_id", id)` fetches *all* match_players except current player, not filtered to player's matches. For N matches total, returns O(total rows) vs O(player's matches). Correct filter would be `.in("match_id", ownMatchIds)` (requires two-step query or post-filter). Keeps verbatim per plan but flagged for future optimization; at ~42 matches scale, acceptable, but will not scale.
- **activeCount head:true misuse** — plan uses `activeCount?.length ?? 0` but `head:true` with `count:"exact"` returns `{count, data:[]}` not array length; `count` is correct field. Current code keeps verbatim per task instruction, `socialButterfly` will always receive 0 (since `activeCount.length===0`), so badge may never trigger. If build-time data shows missing social-butterfly, fix to `activeCount?.count ?? 0` (or `activeCount as any`). Noted, not changed per verbatim requirement.
- **currentYear fallback** — `seasonYears[0]` is insertion order from `yearly` not sorted descending; if `yearly` returns unsorted, `currentYear` may be earliest not latest, skewing `seasonMatchCount`/`ironMan`. Yearly typically sorted by DB but not guaranteed; consider `Math.max(...seasonYears)`.
- **Directory coexistence** — `src/pages/players/[id].astro` (file) + `src/pages/players/[id]/` (directory) share prefix `[id]` but distinct on filesystem (`[id].astro` vs `[id]`). Astro resolves both, build passes on Windows, but some tools/linters may warn. Alternative is migrating `[id].astro` → `[id]/index.astro`, not done per task scope.
