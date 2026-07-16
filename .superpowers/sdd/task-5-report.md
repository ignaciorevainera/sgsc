# Task 5 Report — Replace Alert with toast in match create page

**Status:** ✅ Done

## Completed Steps
1. Removed `import Alert from "@/components/shared/Alert.astro"`
2. Replaced POST handler: `successMessage` → redirect with toast query params; typed `lightPlayers/darkPlayers` as `string[]`
3. Removed Alert blocks from template
4. Updated `<Main>` props: passes `toastType` and `toastMessage` from `errorMessage`

## Commit
```
db4bff5 fix: replace Alert with toast in match create page
```

## Build
`npm run build` → `Complete!` (no errors)

## Concerns
- Error messages surface via Main layout toast (same mechanism as Task 2). Success toast on redirect uses query params.
- DaisyUI `@property` CSS warning pre-existing, not related to this change.
