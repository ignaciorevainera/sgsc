# UX Polish Phase 2/3 — Review Fix Report

## Scope
Base `f6c37fb` → Head `454ee3c` — 9 review findings (C1-C2, I1-I9)

## Fixes

| # | File | Finding | Fix |
|---|------|---------|-----|
| C1 | `src/components/shared/Header.astro:82-97` | `<div class="divider">` direct child of `<ul>` invalid HTML; fragment `<>` leaked | Wrapped divider in `<li class="p-0" aria-hidden="true">`, removed trailing divider (`idx < navGroups.length-1`), same for admin dropdown (`Header.astro:164,216`) |
| C2 | `src/components/features/ux/ShareButtons.astro:55-95` | Duplicate listeners: global `querySelectorAll` in each island instance adds N× handlers | Scoped to `[data-share-container]`, guard `dataset.bound==="true"`, per-container listeners via `el.querySelector` |
| I1 | `ShareButtons.astro:20,32` + `BottomNav.astro:21` | Hardcoded hex `bg-[#25D366]/bg-[#1DA1F2]/hover:bg-[#128C7E]` and arbitrary `shadow-[0_-4px_12px_rgba(0,0,0,0.08)]` | Replaced with DaisyUI tokens: `bg-success text-success-content`, `bg-info text-info-content`, `hover:opacity-90`, `shadow-md` |
| I2 | `ShareButtons.astro:1-12` | `variant` prop declared but unused; `buildShareUrl` not imported, URLs built inline | Added `import { buildShareUrl }` and `whatsappUrl=buildShareUrl(...)`/`twitterUrl=buildShareUrl(...)`; wired `variant` → `isFull` toggles `btn-md` vs `btn-sm btn-circle` and label span |
| I3 | `ErrorRetry.astro:26` + `ShareButtons.astro:70-76` | Inline `onclick="location.reload()"` (CSP) + deprecated `document.execCommand("copy")` fallback | Removed `onclick`, added `data-retry-reload` + script `addEventListener`; removed `execCommand` branch, now `clipboard.writeText` only (early return on catch) |
| I4 | `BackToTop.astro:8` + `Main.astro:143-145` | `bottom-4` overlaps `BottomNav` on mobile; missing `client:load` directive | Changed to `bottom-[4.5rem] xl:bottom-4`; added `client:load` to `<BackToTop client:load />` in `Main.astro` (kept `KeyboardShortcutsModal client:load`) |
| I5 | `src/styles/accessibility.css:11-33` | Custom `.sr-only` duplicates Tailwind `sr-only` utility | Deleted `.sr-only` / `.sr-only:focus` block, kept only `focus-visible` outline rules |
| I6 | `KeyboardShortcutsModal.astro:8-24,38-58` | Text shows only `Ctrl+K` while handler listens for `/`; second `/` handler duplicated guard | Updated display to `<kbd>/</kbd><kbd>Ctrl+K</kbd>` and handler to `if (e.key==="?"...)` + `if ((e.key==="/"&&!ctrl) || ((k/K)&&(ctrl||meta)))` with guard against `Ctrl+/`; aligned with `SearchCommandPalette` `Ctrl+K` |
| I7 | `Main.astro:138` | `pb-20` ordering overridden by `py-8 sm:py-12` on sm breakpoint (px-4 py-8 sm:py-12 pb-20) | Changed to `px-4 pt-8 pb-20 sm:pt-12 sm:pb-20 xl:pb-0` — explicit split `pt`/`pb` so `sm:py-12` no longer clobbers `pb-20` |
| I8 | `ShareButtons.astro:15-35` | Both share anchors used identical `material-symbols:share` icon | Distinct icons: `material-symbols:chat-bubble` (WhatsApp) vs `material-symbols:alternate-email` (X/Twitter) |
| I9 | `players/[id].astro:275-289` | JSON-LD missing `is:inline` and hardcoded `https://sgsc.vercel.app` | Added `is:inline` to `<script>`, derived URL via `Astro.site?.toString().replace(/\/$/,"") ?? Astro.url.origin` → `siteUrl` |

## Verification

- `npx astro check` — 0 new errors (9 pre-existing: `compare.astro` TS assertions, `fields.astro` FieldFilters, `admin/players/create` preferred_foot, `players/[id]` yearlyStats nullability). No warnings in touched files (removed unused `Icon` import in `KeyboardShortcutsModal`).
- `npx vitest run` — 9/9 suites, 54/54 tests passed.

## Commit

Single fix commit on `master` covering all 9 files.
