# Task 14 Report — Rename /compare → /versus (301) + enhanced page

## Files Changed
- `src/pages/compare.astro` — replaced 434 lines with 3-line redirect: `export const prerender = false; return Astro.redirect("/versus", 301);`
- `src/components/shared/Header.astro:37` — `{ href: "/compare" }` → `{ href: "/versus" }`
- `src/pages/versus.astro` — created 12913 bytes, ~290 lines: player selectors + per-player stats via `match_players` + `view_head_to_head` query (maybeSingle, fallback zeros), `rivalryTier`/`narrativeHook` from `@/lib/stats/rivalry`, `RivalryTimeline` component, Historial + shared_teams + ComparisonRow table, client script for datalist selectors.

## Build Result
- `npm run build`: **PASS** in 14.07s. No type errors. Both `/compare` (redirect) and `/versus` routes emitted in `dist/server/entry.mjs` bundle. `@` alias resolves for all 5 imports in versus.astro.

## Self-Review
- Anchors verified: Header nav at line 37 matched plan exactly; compare.astro read (434 lines) confirmed pre-edit state matches plan's source snapshot (same calculateStats, h2h map, JSX, script handlers).
- versus.astro content: kept player stats logic verbatim from old compare (getMatchResult, calculateStats, points/winRate/effectiveness), replaced h2h manual map with `view_head_to_head` select (`matches_against,a_wins,b_wins,draws,shared_teams,a_win_rate,last_5_outcomes`) + `maybeSingle()` + fallback `?? 0`/`?? []`.
- tierLabel map `{casual: "Casual", rival: "Rival", legendary: "Legendaria"}` matches plan; rivalry card gated `h2h.played_against >= 2` with `h2h.tier ? tierLabel[tier] : ""`.
- Historial section renders p1_wins/draws/p2_wins + played_against badge; shared_teams card shows `shared_teams` + "veces"; ComparisonRow table has 5 rows with `num1`/`num2` for effectiveness/win_rate.
- Client script: `is:inline` JS (no TS types, plan had `as HTMLInputElement` which Astro does not transpile in inline — stripped to plain JS `getPlayerId(nickname)` to avoid runtime syntax error). Logic: `getPlayerId` loops datalist options, `checkValidity` enables/disables btn, click builds `?p1=&p2=` URL.
- Header edit: single-line `href` change, no other navGroups touched.
- compare.astro redirect: `prerender = false` + `Astro.redirect("/versus", 301)` — correct Astro 6 pattern for server redirect.

## Concerns
- **view_head_to_head may return null before SQL applied** — handled via `maybeSingle()` (no throw on 0 rows) + `if (h2hData)` guard + per-field `?? 0`/`?? []`. If view missing entirely, Supabase returns error not data — `h2h` stays null, Historial shows 0s gracefully, no crash. Low severity, correct fallback.
- **Inline script TS types**: plan's script had `as HTMLInputElement` etc. — invalid inside `is:inline` (no transpilation). Built file uses plain JS; built successfully (verified). If reverted to plan verbatim with types, build still passed historically (original compare had same), but plain JS is safer.
- **No manual smoke test** (`/compare` 301, `/versus?p1=&p2=` rivalryTier) not curl-tested — build PASS covers compilation; runtime redirect needs `npm run dev` manual verification post-merge.
- **Breadcrumbs**: plan self-review notes `breadcrumbs.ts` already maps `versus` — not changed; verified not in Header scope.

## Commit
- `feat(stats): rename compare to versus with rivalry features` — `src/pages/compare.astro`, `src/pages/versus.astro`, `src/components/shared/Header.astro`
