# Task 6: temporal.ts — Report

## What you implemented

- `src/lib/stats/temporal.ts` (38 lines) — `computeMonthPerformance(records: MatchOutcomeInput[]): MonthPerformance[]` and `computeBestWorstMonth(records: MatchOutcomeInput[]): TemporalSummary`. `MonthPerformance = { month, matches, wins, winRate }`, `TemporalSummary = { bestMonth, worstMonth }`. Groups by `UTC month` via `new Date(date+"T12:00:00")`, skips invalid dates, uses `toOutcome(team,result)` to count wins, winRate `Math.round(wins/matches*100)`. `computeBestWorstMonth` sorts `winRate desc` then `matches desc` to pick best/worst. Interfaces exported. Pure, no Supabase imports, imports `toOutcome` + `MatchOutcomeInput` from `./types`. Matches plan verbatim.
- `tests/unit/lib/stats/temporal.test.ts` (40 lines, 4 tests) — plan code with import fix `../../../../`.

Depends on `MatchOutcomeInput`, `toOutcome` from `src/lib/stats/types.ts` (Task 1).

## What you tested + results

Created `tests/unit/lib/stats/temporal.test.ts` with 4 tests per plan:

- `computeMonthPerformance` (2 tests):
  - returns empty for no records ([] → [])
  - aggregates wins per month (Jan: 2 matches 1 win 50%, Feb: 1 match 0 wins 0%; draw not counted as win)
- `computeBestWorstMonth` (2 tests):
  - returns nulls for no records ({best:null, worst:null})
  - picks best and worst by win rate (Jan 100% → best month 1, Feb 0% → worst month 2)

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/temporal.test.ts` → PASS (4/4)
- Full suite `npx vitest run` → PASS (15 files, 82 tests) — no regressions

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/stats/temporal.ts` existed:

```
 FAIL  tests/unit/lib/stats/temporal.test.ts [ tests/unit/lib/stats/temporal.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/temporal' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/temporal.test.ts
  ❯ tests/unit/lib/stats/temporal.test.ts:2:1

  Test Files  1 failed (1)
       Tests  no tests
    Duration  255ms
```

Matches plan expectation: FAIL — cannot resolve `.../temporal`.

### GREEN (actual output after implementation)

After creating `src/lib/stats/temporal.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

  Test Files  1 passed (1)
       Tests  4 passed (4)
    Duration  263ms
```

Full suite:

```
 Test Files  15 passed (15)
      Tests  82 passed (82)
   Duration  526ms
```

## Files changed

- Created: `src/lib/stats/temporal.ts` (38 lines, 2 exports + 2 interfaces) — plan code verbatim
- Created: `tests/unit/lib/stats/temporal.test.ts` (40 lines, 4 tests) — plan code with import fix `../../../../` (plan says `../../../` but correct depth is 4 dots; consistent with Tasks 1-5)
- Overwrote: `.superpowers/sdd/task-6-report.md` (this file)

Git commit: `feat(stats): add temporal pattern helpers` adding `src/lib/stats/temporal.ts` + `tests/unit/lib/stats/temporal.test.ts` (report file untracked per plan — committed separately if needed).

## Self-review findings

1. **Import path fix** — Plan's `../../../src/lib/stats/temporal` and `.../types` is off by one level for `tests/unit/lib/stats/` (needs `../../../../`). Fixed; logic otherwise exact to plan. Verified against existing `tests/unit/lib/stats/streaks.test.ts` etc which all use `../../../../`.
2. **Implementation verbatim** — `T12:00:00` suffix, `getUTCMonth()+1`, `Map<number,{matches,wins}>`, `toOutcome` check, `Math.round(wins/matches*100)`, `sort(b.winRate - a.winRate || b.matches - a.matches)` all match plan exactly. No comments added per global constraints. Pure functions, no Supabase imports. `computeMonthPerformance` returns unsorted insertion order (Map iteration) — plan test uses `find` not order assertion, so OK. `computeBestWorstMonth` correctly returns same object for best/worst when single month (sorted[0] and sorted[length-1] same ref) — expected.
3. **No regressions** — Full suite 82 tests pass (78 prior + 4 new). 15 test files.

## Issues or concerns

None blocking. `computeMonthPerformance` skips invalid dates via `isNaN(d.getTime()) continue` per plan; edge not tested but matches spec.
