# Task 6 Report — Replace Alert with toast in match edit page

**Status:** ✅ Complete

## Changes

1. Removed `import Alert` from `src/pages/admin/matches/edit/[id].astro`
2. Removed `showSuccess` variable
3. Changed redirect from `?success=true` to `?toast=success&msg=Partido+actualizado+correctamente`
4. Removed inline Alert blocks from template (success + error)
5. Updated `<Main>` with `toastType` and `toastMessage` props

## Commit

```
989a045 fix: replace Alert with toast in match edit page
```

## Build

`npm run build` → `Complete!` (12.97s)

## Concerns

- CSS warning about `@property` at-rule is pre-existing from DaisyUI 5, unrelated.
- Empty line remains at line 13 where `showSuccess` was removed — cosmetic only.
