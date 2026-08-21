# Task 1: Shared types + streaks.ts — Report

## What you implemented

- `src/lib/stats/types.ts` (14 lines) — `Outcome` type (`"W" | "L" | "D"`), `MatchOutcomeInput` interface, `toOutcome(team, result)` helper (maps `draw` → `D`, `team===result` → `W`, else `L`). Pure, no Supabase imports. Matches plan verbatim.
- `src/lib/stats/streaks.ts` (45 lines) — `StreakType`, `StreakInfo` (`currentType`, `currentLength`, `longestWin`, `longestLoss`), `computeStreaks(outcomes)` — iterates to track longest W/L runs (draws reset both), then walks backward from last outcome to compute current streak. Matches plan verbatim.

Both files were already present and verified correct before this step; no edits needed.

## What you tested + results

Created `tests/unit/lib/stats/streaks.test.ts` with 8 tests per plan:

- `computeStreaks` (5 tests):
  - returns empty info for no matches
  - single win
  - two wins then a loss
  - draws break runs
  - longest loss run tracked
- `toOutcome` (3 tests):
  - maps draw
  - maps win when team equals result
  - maps loss otherwise

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/streaks.test.ts` → PASS (8/8)
- Full suite `npx vitest run` → PASS (10 files, 62 tests) — no regressions

## TDD Evidence

### RED (why expected)

Plan Step 2 expects FAIL before `src/lib/stats/streaks.ts` and `types.ts` exist:
`Error: Cannot find module '../../../src/lib/stats/streaks' imported from .../streaks.test.ts` (and same for `types`).

Reproduced after creating test file with plan's original `../../../` import: run failed with `Cannot find module '../../../src/lib/stats/streaks'` because file at `tests/unit/lib/stats/` needs `../../../../` (4 levels to project root, not 3). This confirms RED would have occurred pre-implementation; import bug also surfaced.

### GREEN (actual output)

After correcting import depth to `../../../../src/lib/stats/...` (logic unchanged) and with src files present:

```
RUN  v4.1.0 E:/Dev/proyectos/sgsc
 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  262ms
```

Full suite:

```
 Test Files  10 passed (10)
      Tests  62 passed (62)
   Duration  587ms
```

## Files changed

- Created: `tests/unit/lib/stats/streaks.test.ts` (53 lines, 8 tests) — plan code with import fix `../../../../`
- Verified unchanged: `src/lib/stats/types.ts` (14 lines)
- Verified unchanged: `src/lib/stats/streaks.ts` (45 lines)

Git commit: `feat(stats): add streak calculation helper` adding those 3 files.

## Self-review findings

1. **Import path bug in plan** — Plan's `../../../src/lib/stats/...` is wrong for `tests/unit/lib/stats/` (needs `../../../../`). Existing `tests/unit/lib/*.test.ts` files correctly use `../../../` because they are one level shallower. Fixed by adding one `../` level; test logic otherwise exact to plan.
2. **Src files already correct** — `types.ts` and `streaks.ts` match plan verbatim (no comments, pure functions, handles empty array, draw-breaks, longest tracking, current streak walk-back). No fixes needed.
3. **No regressions** — Full suite 62 tests pass (54 existing + 8 new).
4. **No hardcoded colors / Supabase imports** — Compliant with global constraints.

## Issues or concerns

None blocking. Import depth deviation from plan verbatim documented above; required for tests to resolve.
