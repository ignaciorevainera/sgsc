# Task 9: Versus Page — Player Search Autocomplete

**Status:** Done

## Changes

`src/pages/compare.astro`:

- Replaced both `<select>` dropdowns with `<input list="players-datalist">` + search `Icon` inside `.relative` wrappers
- Added shared `<datalist id="players-datalist">` populated from `players` array with `data-id` attribute mapping nickname → UUID
- Rewrote inline `<script is:inline>` — `getPlayerId(nickname)` resolves nickname to UUID via datalist options; `checkValidity()` enables button only when both inputs match valid, distinct players; click handler sets `?p1=uuid&p2=uuid` via URL params

## Verification

- `npm run build` — passes
- Commit `624c428` — "feat: replace compare selects with searchable autocomplete inputs"
