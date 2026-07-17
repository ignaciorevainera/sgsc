# UX Polish — Design Spec

**Date:** 2026-07-16
**Status:** Approved
**Author:** SGSC Team

---

## Overview

Comprehensive UX audit addressing search/discovery, navigation, mobile experience, accessibility, and quality-of-life improvements. Ship in phases: (1) search/filters, (2) navigation, (3) polish/accessibility.

## Goals

- Make it easy to find players, matches, stats
- Improve mobile experience (primary use case for amateur sports groups)
- Ensure accessibility compliance (WCAG 2.1 AA)
- Add polish: loading states, empty states, error recovery

## Current State

**Navigation:**
- Header has 9 links in horizontal menu (overflow on medium screens)
- Mobile menu: flat list, no grouping
- No breadcrumbs
- No search functionality

**Mobile:**
- Responsive but not optimized for touch
- No bottom nav
- Tap targets may be too small

**Loading/Empty states:**
- Blank areas during data fetch
- Generic error messages, no retry
- No empty state illustrations

**Accessibility:**
- Partial ARIA labels (icon buttons)
- No skip link
- Focus indicators not audited
- No keyboard shortcuts

## Architecture

### Phase 1: Search & Filters

**Global search (Cmd+K / Ctrl+K):**
- Command palette overlay (DaisyUI modal)
- Search: players by name/nickname, matches by date/opponent, fields by name
- Results grouped by type, max 5 per category
- Keyboard nav (arrow keys, Enter to select, Esc to close)
- Client-side island (Astro `client:load` for instant response)

**Page-specific filters:**

1. **`/players`** — search by name, filter by: active status, position (if added), min matches played, sort by (points/wins/name)
2. **`/matches`** — date range picker, field filter, result filter (W/L/D for specific player), pagination (20 per page)
3. **`/ranking`** — season selector (already exists), add: min matches filter, sort by any column
4. **`/fields`** — filter by city, sort by matches played / win rate
5. **`/versus`** — player search autocomplete (replace current selector)

**Implementation:**
- URL query params for filters (shareable links, bookmarkable)
- Debounced search (300ms)
- "Clear filters" button when active
- Filter state persists in URL (shareable)

**Components:**
- `SearchCommandPalette.astro` (client island)
- `FilterBar.astro` (reusable across pages)
- `DateRangePicker.astro` (DaisyUI datepicker)
- `Pagination.astro` (DaisyUI join)

### Phase 2: Navigation & Mobile

**Header overhaul:**
- Current: 9 links in horizontal menu (overflow on medium screens)
- Solution: Group into dropdowns
  - **Stats**: Ranking, Jugadores, Canchas
  - **Herramientas**: Equipos, Armador, Versus
  - **Reconocimientos**: Medallas, Salón de la Fama
- Mobile: same grouping, accordion-style expand

**Breadcrumbs:**
- Add to: `/players/[id]`, `/admin/*`, `/fields/[id]` (if exists)
- Example: Inicio > Jugadores > Juan Pérez
- DaisyUI breadcrumbs component

**Loading states:**
- Replace blank areas with skeletons during data fetch
- Player list skeleton, match card skeleton, ranking table skeleton
- DaisyUI skeleton component

**Empty states:**
- No matches yet → illustration + "Add first match" (admin) / "Check back soon" (public)
- No players → similar pattern
- No badges earned → "Keep playing to unlock!"
- Filter returns 0 results → "No matches found, try adjusting filters"

**Error recovery:**
- Retry button on failed fetches (not just error message)
- Partial data: show what loaded, error banner for failed section
- Network offline detection → banner "You're offline, data may be stale"

**Mobile improvements:**
- Touch-friendly tap targets (min 44px)
- Swipe gestures: swipe match card to see details (optional, nice-to-have)
- Bottom nav for mobile (alternative to top header): Home, Ranking, Players, Menu
- Sticky "back to top" button on long pages

**Components:**
- `Breadcrumb.astro`
- `Skeleton.astro` (wrapper around DaisyUI)
- `EmptyState.astro`
- `ErrorRetry.astro`
- `BackToTop.astro` (client island)
- `BottomNav.astro` (mobile only)

### Phase 3: Accessibility & Quality of Life

**Accessibility (a11y):**
- Skip to main content link (hidden, focusable)
- Focus indicators on all interactive elements (DaisyUI `focus:outline focus:outline-2`)
- ARIA labels on icon-only buttons (already partial, audit + complete)
- Keyboard navigation: full tab order through all interactive elements
- Color contrast audit (DaisyUI tokens should pass, verify)
- Alt text on all images (audit existing)
- Form labels linked to inputs (audit admin forms)

**Social sharing:**
- Share buttons on: player profiles, match results, ranking page
- Open Graph tags per page (player name + stats, match result, ranking screenshot)
- Twitter cards (already in Main.astro, verify per-page overrides)
- Copy link button (clipboard API)
- "Share to WhatsApp" (common for amateur sports groups)

**Quality of life:**
- Dark mode: respect system preference on first visit (already does localStorage, add `prefers-color-scheme`)
- Keyboard shortcuts: `?` to show shortcuts modal, `/` to focus search
- Print styles: hide nav/footer, optimize for paper (player stats, match history)
- SEO: structured data (JSON-LD) for player profiles, matches
- Performance: prefetch on hover (already in Astro config), image optimization (Vercel image service)

**Analytics improvements:**
- Track most-viewed players, matches, filters used
- Vercel Analytics already integrated, add custom events for key actions (search, filter, share)

**Components:**
- `SkipLink.astro`
- `ShareButtons.astro` (client island for clipboard)
- `KeyboardShortcutsModal.astro` (client island)
- `PrintStyles.global.css`

## Implementation Strategy

**New utility modules (`src/lib/ux/`):**
- `search.ts` — search index builder, fuzzy matching
- `filters.ts` — URL param parser, filter state management
- `share.ts` — social share URL builders, clipboard helpers
- `shortcuts.ts` — keyboard shortcut registry

**New components (`src/components/features/ux/`):**
- `SearchCommandPalette.astro` (client:load)
- `FilterBar.astro`
- `DateRangePicker.astro` (client:load)
- `Pagination.astro`
- `Breadcrumb.astro`
- `Skeleton.astro`
- `EmptyState.astro`
- `ErrorRetry.astro`
- `BackToTop.astro` (client:load)
- `BottomNav.astro` (mobile only)
- `SkipLink.astro`
- `ShareButtons.astro` (client:load)
- `KeyboardShortcutsModal.astro` (client:load)

**Global styles:**
- `src/styles/accessibility.css` — skip link, focus indicators
- `src/styles/print.css` — print media queries

**Integration points:**
- All list pages: FilterBar, Pagination, EmptyState
- Header: SearchCommandPalette trigger, grouped nav
- Mobile: BottomNav (conditional render)
- Player/match pages: ShareButtons, Breadcrumb
- All pages: SkipLink, BackToTop, KeyboardShortcutsModal

## Testing

- Unit tests for search/filters (URL parsing, fuzzy match)
- Unit tests for share (URL builders)
- E2E tests: keyboard nav through search, filter persistence
- Accessibility audit: axe-core integration in E2E

## Migration Strategy

- Add components incrementally, no breaking changes
- Header nav restructuring: update Header.astro, test mobile/desktop
- Search: add to all pages via layout (Main.astro)

## Performance

- Client islands: only search, date picker, back-to-top, share, shortcuts (minimal JS)
- Filters: server-rendered, URL-driven (no client state)
- Skeletons: CSS-only, no JS

## Success Criteria

- Global search accessible via Cmd+K on all pages
- All list pages have filters (players, matches, ranking)
- Mobile nav grouped logically, touch-friendly
- Accessibility audit passes (axe-core, 0 critical violations)
- Loading skeletons on all data-fetching pages
- Share buttons on player profiles, match results

## Future Enhancements (Out of Scope)

- PWA (progressive web app) for offline access
- Push notifications for match results
- Voice search
- Advanced filters (date ranges with presets like "last month")
