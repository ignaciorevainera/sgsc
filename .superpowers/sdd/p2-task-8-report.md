# P2 Task 8: Integrate into layout/pages — Report

## Status
Complete

## Commit
d9cdb20 — `feat: integrate Breadcrumb, BackToTop, BottomNav into layout and pages`

## Files Changed
- Modified: `src/layouts/Main.astro` (+ BackToTop/BottomNav imports, `pb-20 xl:pb-0` on `<main>`, renders `<BackToTop />` + `<BottomNav />` after `<Footer />`)
- Modified: `src/pages/players/[id].astro` (+ `Breadcrumb` import, `<Breadcrumb pathname={Astro.url.pathname} playerNickname={player.nickname} />` after `<Main>` open)

## Implementation Notes
- Main.astro: Added `import BackToTop` + `import BottomNav` alongside existing `buildSearchIndex`/`SearchCommandPalette` — zero lines removed from Phase 1 search index queries (searchPlayers/searchMatchFields/searchFields/buildSearchIndex) + `SearchCommandPalette` import/render preserved byte-for-byte, verified via `git diff`
- Main padding: `class="mx-auto flex w-full ${mainWidthClass} flex-1 flex-col px-4 py-8 sm:py-12 pb-20 xl:pb-0"` prevents BottomNav overlap on mobile (`pb-20`) while resetting on `xl`
- BottomNav: `xl:hidden` ensures desktop no-op, BackToTop: fixed `right-4 bottom-4 z-40`, hidden until 400px scroll via internal script
- Render order: `ToastContainer` → `Footer` → `BackToTop` → `BottomNav` → `</body>` per plan Task 8 Step 1
- players/[id].astro: Breadcrumb placed immediately inside `<Main>` before `<!-- Banner Principal -->`, consumes `Astro.url.pathname` + `player.nickname` (player resolved via `view_player_stats_all_time` single, fallback `Jugador`)
- DaisyUI tokens only, no hardcoded colors, explicit columns maintained (not applicable here, no new queries)

## Verification
- **Command**: `npx astro check`
- **Result**: 9 errors, 0 warnings, 3 hints — all pre-existing, none in modified files:
  - `src/pages/compare.astro` (6x TS assertions in JS script)
  - `src/pages/fields.astro` (FieldFilters constraint)
  - `src/pages/ranking.astro` (unused clearFilters)
  - `src/pages/admin/players/create.astro` (preferred_foot union)
  - `src/pages/admin/players/edit/[id].astro` (unused msg)
  - `src/pages/players/[id].astro` (yearlyStats nullability — pre-existing, unchanged by Breadcrumb addition)
  - `src/layouts/Main.astro` (Analytics unused hint)
  - `src/layouts/Main.astro` + `src/pages/players/[id].astro` new imports/renders: 0 new errors
- Search preservation verified: `git diff src/layouts/Main.astro` shows only 4 added lines (2 imports + 2 renders + 1 class tweak), `SearchCommandPalette` + `buildSearchIndex` block untouched

## Deviations
- Plan specifies `<BackToTop client:load />`; implemented as `<BackToTop />`. Reason: `BackToTop.astro` is static Astro component with internal `<script>` (no framework island), `client:load` has no effect on `.astro` and triggers Astro hint — rendered without directive to avoid noise, behavior identical (scroll listener + smooth scroll preserved). BottomNav rendered without directive as specified.
