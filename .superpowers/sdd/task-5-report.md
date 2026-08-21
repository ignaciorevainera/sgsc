# Task 5: comeback.ts — Report

## What you implemented

- `src/lib/stats/comeback.ts` (13 lines) — `computeComebackRate(outcomes: Outcome[]): number | null` (loops `i < length-1`, counts losses with following match, increments comebacks when next is `W`, returns null if `losses===0`, else `Math.round(comebacks/losses*100)`). Pure, no Supabase imports, imports `Outcome` type from `./types`. Matches plan verbatim.
- `tests/unit/lib/stats/comeback.test.ts` (15 lines, 3 tests) — plan code with import fix `../../../../`.

Depends on `Outcome` from `src/lib/stats/types.ts` (Task 1, already exists).

## What you tested + results

Created `tests/unit/lib/stats/comeback.test.ts` with 3 tests per plan:

- `computeComebackRate` (3 tests):
  - returns null when no loss is followed by a match ([] → null, WWW → null, ["W","L"] → null)
  - 100% when every loss is followed by a win (LWLW → 100)
  - 50% when half the losses bounce back (LWLL → 50)

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/comeback.test.ts` → PASS (3/3)
- Full suite `npx vitest run` → PASS (14 files, 78 tests) — no regressions

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/stats/comeback.ts` existed:

```
FAIL  tests/unit/lib/stats/comeback.test.ts [ tests/unit/lib/stats/comeback.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/comeback' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/comeback.test.ts
  ❯ tests/unit/lib/stats/comeback.test.ts:2:1

 Test Files  1 failed (1)
      Tests  no tests
   Duration  251ms
```

Matches plan expectation: FAIL — cannot resolve `.../comeback`.

### GREEN (actual output after implementation)

After creating `src/lib/stats/comeback.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  252ms
```

Full suite:

```
 Test Files  14 passed (14)
      Tests  78 passed (78)
   Duration  499ms
```

## Files changed

- Created: `src/lib/stats/comeback.ts` (13 lines, 1 export) — plan code verbatim
- Created: `tests/unit/lib/stats/comeback.test.ts` (15 lines, 3 tests) — plan code with import fix `../../../../` (plan says `../../../` but correct depth is 4 dots; consistent with Tasks 1-4)
- Overwrote: `.superpowers/sdd/task-5-report.md` (this file)

Git commit: `feat(stats): add comeback rate helper` adding `src/lib/stats/comeback.ts` + `tests/unit/lib/stats/comeback.test.ts` (report file untracked per plan — committed separately if needed).

## Self-review findings

1. **Import path fix** — Plan's `../../../src/lib/stats/comeback` is off by one level for `tests/unit/lib/stats/` (needs `../../../../`). Fixed; logic otherwise exact to plan. Verified against existing `tests/unit/lib/stats/consistency.test.ts`, `clutch.test.ts` which all use `../../../../`.
2. **Implementation verbatim** — Loop `i < length-1`, `losses`/`comebacks` counters, `null if losses===0`, `Math.round(comebacks/losses*100)` all match plan exactly. No comments added per global constraints. Pure function, no Supabase imports. Note: `["W","L"]` → null because last loss has no following match (loop excludes last index); matches plan test expectation. Keep as plan.
3. **No regressions** — Full suite 78 tests pass (75 prior + 3 new). 14 test files.

## Issues or concerns

None blocking. Plan notes `["W","L"]` → null is intentional (only losses with a following match counted); impl reflects that.
