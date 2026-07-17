# Task 7 Report: Ranking Page — Min Matches Filter

## Status: ✅ Complete

## Changes

### `src/pages/ranking.astro`
- Imported `clearFilters` from `@/lib/ux/filters`
- Added `minMatches` URL param (default 0)
- Added `minFilteredPlayers` filter step before sorting
- Changed `sortedPlayers` to use `minFilteredPlayers`
- Added "Mín. Partidos" number input in filter toolbar (visible on all screens)
- Script: added 500ms debounced `input` listener for `min_matches`

## Build
- `astro build` — **success**

## Commit
```
af938a0 feat: add min matches filter to ranking page
```
