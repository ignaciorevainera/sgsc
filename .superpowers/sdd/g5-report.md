# Task 5: narratives.ts — Report

## What you implemented

- `src/lib/gamification/narratives.ts` (75 lines) — `Narrative { id, title, body }` + 5 detectors:
  - `detectTitleRace(leader, runnerUp, gamesLeft): Narrative | null` — gap `leader.points - runnerUp.points`, threshold `0 < gap <= 6 && gamesLeft > 0`, null if either null.
  - `detectComebackStory(players, totalPlayers)` — `bottom = ceil(total*0.75)`, `top = floor(total*0.25)`, finds `earlyRank > bottom && lateRank <= top`.
  - `detectRisingStar(players)` — top3 by `points` desc, finds `firstSeason && in top3`.
  - `detectVeteran(players)` — max `matchesPlayed`, null if empty.
  - `detectDuoDominance(seasonDuo, allTimeDuo)` — `seasonDuo.winRate > allTimeDuo.winRate`.
  Pure, no Supabase imports, no comments. Matches plan Step 3 verbatim.
- `tests/unit/lib/gamification/narratives.test.ts` (73 lines, 11 tests) — plan Step 1 verbatim with import `../../../../src/lib/gamification/narratives`.

## What you tested + results

Created `tests/unit/lib/gamification/narratives.test.ts` per plan (plan states 10 tests, file contains 11 — 3+2+2+2+2):

- `detectTitleRace` (3 tests):
  - detects close race — gap 4 with 3 games left → `id title-race`
  - null when gap too big — gap 20 → null
  - null when no games left — `gamesLeft 0` → null
- `detectComebackStory` (2 tests):
  - finds bottom-to-top climber — `earlyRank 16, lateRank 4` with `total 20` (bottom 15, top 5) → `comeback`
  - null when no climber — `early 5, late 6` with `total 20` → null
- `detectRisingStar` (2 tests):
  - rookie in top3 — B firstSeason true, points 28 in top3 → `rising-star`
  - null when no rookie in top3 — all firstSeason false → null
- `detectVeteran` (2 tests):
  - finds most matches — B 40 vs A 10 → `veteran`, body contains B
  - null when empty — `[]` → null
- `detectDuoDominance` (2 tests):
  - season duo beats all-time — 80% vs 60% → `duo-dominance`
  - null when season duo worse — 50% vs 70% → null

Results:
- Targeted run `npx vitest run tests/unit/lib/gamification/narratives.test.ts` → PASS (11/11)
- Full suite `npx vitest run` → PASS (23 files, 128 tests) — no regressions (117 prior + 11 new = 128)

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/gamification/narratives.ts` existed:

```
FAIL  tests/unit/lib/gamification/narratives.test.ts [ tests/unit/lib/gamification/narratives.test.ts ]
Error: Cannot find module '../../../../src/lib/gamification/narratives' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/gamification/narratives.test.ts
  ❯ tests/unit/lib/gamification/narratives.test.ts:2:1

 Test Files  1 failed (1)
      Tests  no tests
   Duration  257ms
```

Matches plan expectation: FAIL — cannot resolve `.../narratives`.

### GREEN (actual output after implementation)

After creating `src/lib/gamification/narratives.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 Test Files  1 passed (1)
      Tests  11 passed (11)
   Duration  267ms
```

Full suite:

```
 Test Files  23 passed (23)
      Tests  128 passed (128)
   Duration  1.01s
```

## Files changed

- Created: `src/lib/gamification/narratives.ts` (75 lines, 6 exports) — plan Step 3 verbatim
- Created: `tests/unit/lib/gamification/narratives.test.ts` (73 lines, 11 tests) — plan Step 1 verbatim with import depth `../../../../`
- Created: `.superpowers/sdd/g5-report.md` (this file)

Git commit: `feat(gamification): add seasonal narrative detection` adding src + test files.

## Self-review findings

1. **Import path** — `../../../../src/lib/gamification/narratives` correct for `tests/unit/lib/gamification/` (3 levels up to tests/, then src/); matches `types`/`badges`/`metrics`/`awards` tests.
2. **Implementation verbatim** — All thresholds exact: `titleRace gap 0 < gap <= 6 && gamesLeft > 0`; `comeback bottom ceil(total*0.75) top floor(total*0.25)` with `earlyRank > bottom && lateRank <= top`; `risingStar` top3 slice by points; `veteran` max matches; `duo season winRate > allTime winRate`. No comments, pure functions per global constraints.
3. **Test count discrepancy** — Plan doc header says "10 tests" but Step 1 code contains 11 (3+2+2+2+2). Implemented exact code (11 tests) → PASS 11/11. No logic divergence.
4. **No regressions** — Full suite 128 tests pass.

## Issues or concerns

None.
