# P3 Task 4: SEO + Layout Integration — Report

## Status
Complete

## Commit
f7ebd8c — `feat: integrate SkipLink, shortcuts, print styles, and SEO JSON-LD`

## Astro Check
Command: `npx astro check`
Result: Task files — 0 new errors. 1 hint on new JSON-LD script line (expected):
- `players/[id].astro:288` — `This script will be treated as if it has the is:inline directive` (`astro(4000)`) — `type="application/ld+json"` attribute triggers inline treatment; not an error.

Full project: 9 errors in pre-existing files (`compare.astro` type annotations in JS script, `fields.astro` FieldFilters, `admin/players/create.astro` preferred_foot, `players/[id].astro:260` yearlyStats null handling) + 7 hints/warnings (ShareButtons variant/unused, KeyboardShortcutsModal Icon unused, Main.astro Analytics unused, etc.) — none introduced by this task, identical to pre-task baseline.

## Files Changed
- Modified: `src/layouts/Main.astro` (+6 lines)
  - Added imports: `SkipLink` from `@/components/features/ux/SkipLink.astro`, `KeyboardShortcutsModal` from `@/components/features/ux/KeyboardShortcutsModal.astro`, `@styles/accessibility.css`, `@styles/print.css`
  - Added `<SkipLink />` as first child of `<body>` (before `<Header />`), per plan — `href="#main-content"` with `sr-only` → `focus:fixed` pattern, matches `accessibility.css`
  - Added `<KeyboardShortcutsModal client:load />` after `<ToastContainer />` and before `<Footer />` — island handles `?` → `#shortcuts-modal`, `/` → `#search-modal` + focus `#search-input`
  - CRITICAL PRESERVE verified: `buildSearchIndex` + `searchPlayers`/`searchMatchFields`/`searchFields` + `searchIndex` const + `<SearchCommandPalette items={searchIndex} client:load />` intact; `BackToTop` + `BottomNav` imports and placements intact; `main` retains `pb-20 xl:pb-0` and `id="main-content"`
- Modified: `src/pages/players/[id].astro` (+13 lines)
  - Added `jsonLd` const before `---` (after `debutYear`): `{"@context":"https://schema.org","@type":"Person", name: player.nickname, memberOf: {"@type":"SportsTeam", name:"Solo Gente Súper Comprometida F.C.", url:"https://sgsc.vercel.app"}, description: "${nickname} — ${points} puntos..." }` — exact from plan Task 4 Step 2
  - Added `<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />` inside `<Main>` before banner div (after `<Main>` open, before `<Breadcrumb />`) — renders SEO structured data (Person + SportsTeam)
  - No other page logic altered; `Breadcrumb` remains first visible element after JSON-LD

## Implementation Notes
- Exact code from `docs/superpowers/plans/2026-07-16-ux-polish-phase3-a11y-qol.md` Task 4 Steps 1-2, no deviations
- `src/styles/accessibility.css` (33 lines) and `src/styles/print.css` (38 lines) already created in Tasks 1/3 — no content change; verified `sr-only` pattern and `@media print` hide selectors (`header, footer, nav, .btm-nav, #back-to-top, dialog, .modal, ...`) match plan
- `SkipLink.astro` verified: `href="#main-content"` matches `Main.astro` `main#main-content`
- `KeyboardShortcutsModal.astro` verified: `dialog#shortcuts-modal`, shortcuts `Ctrl+K`/`?`/`Esc`/`Tab`, script ignores INPUT/TEXTAREA/SELECT, matches `SearchCommandPalette` IDs `search-modal`/`search-input`
- DaisyUI tokens: `btn btn-primary`, `modal`, `kbd`, `rounded-xl` — no inline colors
- Commit includes `src/layouts/Main.astro` + `src/pages/players/[id].astro` together per plan Step 4

## Verification
- `git diff HEAD~1` shows only Task 4 additions, no deletions of Phase 1/2 code
- `npx astro check` — task delta 0 errors
- `SkipLink` is first `<body>` child, `KeyboardShortcutsModal` is before footer, JSON-LD inside player detail
