# Task 13 — Player profile integration + delete utils/badges.ts

Date: 2026-08-21
Plan: docs/superpowers/plans/2026-08-20-gamification.md#task-13

## Steps executed
- Step 1 — Replace imports: `computeBadges` → `computePlayerBadges` + metrics helpers + `computeCumulativePoints` + `BadgeShowcase`/`ProgressionChart`. File: `src/pages/players/[id].astro:11-15`. Preserved `computeColorStats`, `computeHeadToHead`, etc.
- Step 2 — Add `ownBadgeRows` to `Promise.all` destructure (`src/pages/players/[id].astro:55`) and add 8th query `supabase.from("match_players").select("match_id, team, match:matches!inner (date, result, field_id)").eq("player_id", id)` (`src/pages/players/[id].astro:100-103`).
- Step 3 — Replace `const badges = computeBadges({...})` with `ownBadge` mapping + `badgeMetrics` assembly + `const badges = computePlayerBadges(badgeMetrics)` (`src/pages/players/[id].astro:347-371`). Also added `const progressionData = computeCumulativePoints(...)` (`src/pages/players/[id].astro:373-377`).
- Step 4 — Replace `BadgeItem` map (`src/pages/players/[id].astro:491-496`) with `<BadgeShowcase earned={badges.earned} />` + link to `/players/${id}/badges`.
- Step 5 — Insert full-width `ProgressionChart` card in Métricas Avanzadas grid (`src/pages/players/[id].astro:1070-1077`).
- Step 6 — `git rm src/lib/utils/badges.ts` (deleted).
- Step 7 — Verify build + tests.
- Step 8 — Commit.

## Files changed
- Modified: `src/pages/players/[id].astro` — 7 hunks (imports, Promise.all destructure+query, badge computation, progressionData, banner render, progression card).
- Deleted: `src/lib/utils/badges.ts` (151 lines).

## Build/Test
- `npm run build`: PASS — `astro build` completed in 14.73s, no import errors from deleted file, sitemap generated, Vercel adapter bundled.
- `npx vitest run`: PASS — 24 test files, 131 tests passed, duration 1.03s, no regressions.

## Self-review
- Imports resolve: `@/lib/gamification/badges`, `@/lib/gamification/metrics`, `@/lib/gamification/progression` all exist and export expected symbols; `BadgeShowcase.astro` and `ProgressionChart.astro` exist under `src/components/features/gamification/`.
- `Promise.all` now has 8 parallel queries; destructure length matches array length; Supabase select avoids `select(*)` (explicit columns).
- `badgeMetrics` uses only variables that exist from stats plan: `streakInfo.longestWin`, `clutch.delta`, `win_pct`, `outcomesAsc`, `teammateRows`, `totalClubSeasons`, `yearlyStats`, `statsClaro.wins`/`statsOscuro.wins` — all verified present prior to edit.
- `clutch.delta` may be negative; formula `clutch.delta >= 0 ? clutch.delta + win_pct : win_pct` matches plan (clutch delta added only when non-negative).
- `socialButterfly` second arg hardcoded `0` per plan (known approximation; precise active count lives on `/players/[id]/badges` route which fetches `activeCount`). Acceptable per plan note.
- `ironMan` uses `ownBadge.length` as season count approximation — matches plan note.
- `progressionData` correctly maps `ownBadge` with `result === "draw" ? "D" : result === team ? "W" : "L"` and filters empty dates.
- Banner now renders `badges.earned` (type `EarnedBadge[]`) via `BadgeShowcase` which slices top3 internally; empty state handled by showcase ("Sin medallas aún").
- `BadgeItem` import left unused (line 37) — not breaking but dead code. No runtime error; could be removed in follow-up cleanup.
- No hardcoded colors; DaisyUI tokens preserved.

## Concerns
- `BadgeItem` unused import remains in file (`src/pages/players/[id].astro:37`). Not removed per strict plan edit list; recommend follow-up `rm import BadgeItem` cleanup.
- `socialButterfly` will always be false until passed real `activePlayerCount` (currently 0). Plan acknowledges this — precise logic in `/players/[id]/badges`; profile uses approximation intentionally.
- `id` interpolation in `href={`/players/${id}/badges`}` inside Astro template correctly uses JS expression; verified syntax `href={`/players/${id}/badges`}` renders correctly.
- No remaining imports of deleted `src/lib/utils/badges.ts` (verified via grep: zero hits).
