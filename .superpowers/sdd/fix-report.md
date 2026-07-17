# Fix Report

## Issues Fixed

### 1. Invalid `?toast` value silently breaks icon
**File**: `src/components/shared/ToastContainer.astro:9-14`
**Fix**: Added `allowedTypes` const array guard. `rawType` validated against allowed values before assignment, preventing `undefined` icon lookup for invalid query params.

### 2. Stale blank lines in matches/create.astro
**File**: `src/pages/admin/matches/create.astro:71-73`
**Fix**: Removed 2 extra blank lines between `<Title>` and `<form>` where old Alert blocks were removed.

### 3. Stray blank line in matches/edit/[id].astro
**File**: `src/pages/admin/matches/edit/[id].astro:12-13`
**Fix**: Removed double blank line in frontmatter from removed `showSuccess` variable.

## Build Result
`npm run build` completed successfully in ~13.8s (server output, Vercel adapter). No errors.

## Commit
```
7367ab7 — fix: validate toast type, clean up stale blank lines
```
