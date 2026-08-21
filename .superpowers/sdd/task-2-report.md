# Task 2: form.ts — Report

## What you implemented

- `src/lib/stats/form.ts` (20 lines) — `Trend` type (`"improving" | "declining" | "stable"`), `rollingWinRate(outcomes, window=5)` (null on empty, slices last window, counts W, rounds to percent), `computeTrend(outcomes, careerWinRate)` (stable on empty, computes recent via rollingWinRate, diff >=5 → improving, <=-5 → declining, else stable). Pure, no Supabase imports. Matches plan verbatim.
- `tests/unit/lib/stats/form.test.ts` (30 lines, 7 tests) — plan code with import fix `../../../../`.

Depends on `Outcome` from `src/lib/stats/types.ts` (Task 1, already exists).

## What you tested + results

Created `tests/unit/lib/stats/form.test.ts` with 7 tests per plan:

- `rollingWinRate` (3 tests):
  - returns null for empty
  - computes last-5 win rate (3W/5 → 60)
  - uses shorter window when fewer matches (2W/3 → 67)
- `computeTrend` (4 tests):
  - improving when recent beats career by 5+ (100 vs 40)
  - declining when recent below career by 5+ (0 vs 80)
  - stable within ±5 (60 vs 58 → diff 2)
  - stable for empty

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/form.test.ts` → PASS (7/7)
- Full suite `npx vitest run` → PASS (11 files, 69 tests) — no regressions

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/stats/form.ts` existed:

```
FAIL  tests/unit/lib/stats/form.test.ts [ tests/unit/lib/stats/form.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/form' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/form.test.ts
  ❯ tests/unit/lib/stats/form.test.ts:2:1

 Test Files  1 failed (1)
      Tests  no tests
   Duration  253ms
```

Matches plan expectation: FAIL — cannot resolve `.../form`.

### GREEN (actual output after implementation)

After creating `src/lib/stats/form.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  254ms
```

Full suite:

```
 Test Files  11 passed (11)
      Tests  69 passed (69)
   Duration  438ms
```

## Files changed

- Created: `src/lib/stats/form.ts` (20 lines, 2 exports) — plan code verbatim
- Created: `tests/unit/lib/stats/form.test.ts` (30 lines, 7 tests) — plan code with import fix `../../../../` (plan says `../../../` but correct depth is 4 dots; consistent with Task 1 fixer)

Git commit: `feat(stats): add form trajectory helpers` adding those 2 files.

## Self-review findings

1. **Import path fix** — Plan's `../../../src/lib/stats/form` is off by one level for `tests/unit/lib/stats/` (needs `../../../../`). Fixed; logic otherwise exact to plan. Verified against existing `tests/unit/lib/stats/streaks.test.ts` which uses `../../../../`.
2. **Implementation verbatim** — `rollingWinRate` and `computeTrend` match plan exactly (default window 5, Math.round, null/0 handling, ±5 thresholds). No comments added per global constraints.
3. **Pure module** — No supabase imports, relative import of `Outcome` type, runs under vitest node env with globals.
4. **No regressions** — Full suite 69 tests pass (62 prior + 7 new).

## Issues or concerns

None blocking.
