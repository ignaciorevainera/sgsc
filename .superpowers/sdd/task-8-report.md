# Task 8 Report

**Status:** ✅ Complete
**Commit:** `6432fac` — `feat: add city filter and sort to fields page`

## Changes
- Replaced `src/pages/fields.astro` with new implementation
- Added city filter dropdown (dynamic unique cities from DB)
- Added sort dropdown (`Más partidos` / `Nombre`)
- Integrated `getFilters`/`clearFilters` from `@/lib/ux/filters` and `FieldFilters` type
- Integrated `FilterBar` component wrapping filter controls
- Client-side `<script>` updates URL params on change, triggering SSR re-render
- Fixed encoding: `M�s` → `Más` at line 130
- Build: ✅ passes
