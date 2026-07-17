# UX Polish Phase 1 — Fix Report

## Fixed

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `src/pages/players/index.astro` | "Solo activos" toggle no-op | Added secondary query to `players` for `is_active`, client-side filter via `Set` |
| 2 | `src/lib/ux/search.ts` | Match search items had `href: ""` | Changed to `href: "/matches"` |
| 3 | `src/components/features/ux/SearchCommandPalette.astro` | XSS via innerHTML | Added `escapeHTML()` helper, wrapped all interpolations |
| 4 | `src/components/features/ux/SearchCommandPalette.astro` | Missing debounce | Added 300ms `debounceTimer` on input listener |
| 5 | `src/pages/players/index.astro` + `src/pages/fields.astro` | Double `clearFilters()` call | Extracted to `clearedUrl` variable |

## Build

`npx astro check` — **0 new errors** (9 pre-existing, unchanged)

## Tests

`npx vitest run` — **7/7 suites, 45/45 tests passed**

## Deferred

- 9 pre-existing type errors in `compare.astro`, `fields.astro`, `admin/players/create.astro`, `players/[id].astro` (not in scope)
- 2 pre-existing warnings in `Main.astro`, `ranking.astro`
- Playwright E2E not run (requires `.env.test` with credentials)
