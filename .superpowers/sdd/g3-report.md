# Task 3: metrics.ts — Report

## What you implemented

- `src/lib/gamification/metrics.ts` (109 lines) — `OwnMatchRow` (`match_id`, `date`, `team`, `result`, `field_id`), `CoPlayerRow` (`match_id`, `player_id`, `team`), helper `won(own)`, 6 pure helpers: `computeBestDuoWins`, `computeNemesisWins`, `computeBestFieldWins`, `computeComebackStreak`, `computeIronMan`, `computeSocialButterfly`. Pure, no Supabase imports. Matches plan Step 3 verbatim.
- `tests/unit/lib/gamification/metrics.test.ts` (66 lines, 7 tests) — plan Step 1 code with import fix `../../../../src/lib/gamification/metrics`.

## What you tested + results

Created `tests/unit/lib/gamification/metrics.test.ts` per plan:

- `computeBestDuoWins` (1 test):
  - counts wins with same teammate → 2
- `computeNemesisWins` (1 test):
  - counts wins against same opponent → 2
- `computeBestFieldWins` (1 test):
  - returns max wins at a single field → 2
- `computeComebackStreak` (2 tests):
  - longest win run after loss → 3
  - 0 when no loss precedes win run → 0
- `computeIronMan` (1 test):
  - true when played every match (2/2), false when 2/3
- `computeSocialButterfly` (1 test):
  - true when distinct co-players >= active-1 (2/3), false when 2/4

Results:
- Targeted run `npx vitest run tests/unit/lib/gamification/metrics.test.ts` → PASS (7/7)
- Full suite `npx vitest run` → PASS (21 files, 114 tests) — no regressions

Note: Plan lists "8 tests" but Step 1 code provides 7 `it` blocks (ironMan + social each bundle 2 assertions into 1 test). Vitest reports 7 passed — matches plan code.

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/gamification/metrics.ts` existed:

```
FAIL  tests/unit/lib/gamification/metrics.test.ts [ tests/unit/lib/gamification/metrics.test.ts ]
Error: Cannot find module '../../../../src/lib/gamification/metrics' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/gamification/metrics.test.ts
  ❯ tests/unit/lib/gamification/metrics.test.ts:2:1

 Test Files  1 failed (1)
      Tests  no tests
   Duration  274ms
```

Matches plan expectation: FAIL — cannot resolve `.../metrics`.

### GREEN (actual output after implementation)

After creating `src/lib/gamification/metrics.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 ✓ tests/unit/lib/gamification/metrics.test.ts > computeBestDuoWins > counts wins with same teammate
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeNemesisWins > counts wins against same opponent
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeBestFieldWins > returns max wins at a single field
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeComebackStreak > returns longest win run immediately after a loss
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeComebackStreak > returns 0 when no loss precedes a win run
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeIronMan > true when played every match in season
 ✓ tests/unit/lib/gamification/metrics.test.ts > computeSocialButterfly > true when played with every other active player

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  287ms
```

Full suite:

```
 Test Files  21 passed (21)
      Tests  114 passed (114)
   Duration  877ms
```

## Files changed

- Created: `src/lib/gamification/metrics.ts` (109 lines, 8 exports) — plan Step 3 verbatim (OwnMatchRow, CoPlayerRow, won, 6 functions)
- Created: `tests/unit/lib/gamification/metrics.test.ts` (66 lines, 7 tests) — plan Step 1 verbatim with import depth `../../../../`
- Created: `.superpowers/sdd/g3-report.md` (this file)

Git commit: `feat(gamification): add badge metrics derivation` adding src + test files.

## Self-review findings

1. **Import path fix** — Plan shows `../../../../src/lib/gamification/metrics` (correct for `tests/unit/lib/gamification/`). Used that depth; matches existing `types.test.ts`/`badges.test.ts`.
2. **Implementation verbatim** — `won`, `computeBestDuoWins` (Map by match_id, same team, won filter, max wins), `computeNemesisWins` (opposite team), `computeBestFieldWins` (field_id + won), `computeComebackStreak` (date sort, D/W/L mapping, afterLoss gating), `computeIronMan` (Set distinct match_id >= seasonMatchCount), `computeSocialButterfly` (Set distinct player_id >= active-1) all match plan exactly. No comments, pure functions.
3. **Test count** — Plan doc says "8 tests across 6 functions" but code supplies 7 `it` blocks; verified green 7/7. No missing logic — ironMan and social each combine true/false assertions in single test as per plan code.
4. **No regressions** — Full suite 114 tests pass (107 prior + 7 new).

## Issues or concerns

None blocking. Count discrepancy (7 vs 8) is plan code vs plan description; implementation follows code.
