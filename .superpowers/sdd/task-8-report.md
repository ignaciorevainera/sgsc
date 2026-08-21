# Task 8: sidePerformance.ts + rivalry.ts — Report

## What you implemented

- `src/lib/stats/sidePerformance.ts` (44 lines) — `computeSidePerformance(records: {team:"light"|"dark", outcome:Outcome}[]): SidePerformance`. `SidePreference = "dark specialist" | "light specialist" | "balanced"`, `SidePerformance = {light:{matches,winRate}, dark:{matches,winRate}, preference:SidePreference}`. Accumulates via `acc={light:{matches:0,wins:0},dark:{matches:0,wins:0}}`, loops records, skips invalid team, counts wins where `outcome==="W"`, computes `winRate` via `Math.round(wins/matches*100)` or 0, preference threshold `+5` (light>dark+5 → light specialist, dark>light+5 → dark specialist, else balanced). Pure, imports `Outcome` from `./types` only. Plan verbatim.

- `src/lib/stats/rivalry.ts` (22 lines) — `RivalryTier = "casual" | "rival" | "legendary"`, `rivalryTier(matchesAgainst:number): RivalryTier|null` ( <2→null, ≤5→casual, ≤10→rival, else legendary), `narrativeHook(aWins,bWins,aName,bName):string|null` (decided=aWins+bWins, 0→null, aRate=aWins/decided, ≥0.75→A dominates, ≤0.25→B dominates, else null). Pure, no imports. Plan verbatim.

Tests: `tests/unit/lib/stats/sidePerformance.test.ts` (3 tests) + `tests/unit/lib/stats/rivalry.test.ts` (8 tests) = 11 tests total.

## What you tested + results

Created tests per plan (with fixes noted below):

- `computeSidePerformance` (3 tests):
  - returns zeros for no records (`balanced`)
  - prefers light when light wins more (2W light, 1L dark → light specialist)
  - prefers dark when dark wins more (1L light, 2W dark → dark specialist)

- `rivalryTier` (4 tests):
  - null below 2 matches (0,1 → null)
  - casual 2-5 (2,5 → casual)
  - rival 6-10 (6,10 → rival)
  - legendary 11+ (11 → legendary)

- `narrativeHook` (4 tests):
  - null when no decided matches (0,0 → null)
  - returns A-dominates hook (9,3 → "Cuando A gana, B pierde.")
  - returns B-dominates hook (3,9 → "Cuando B gana, A pierde.")
  - null when balanced (5,5 → null)

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/sidePerformance.test.ts tests/unit/lib/stats/rivalry.test.ts` → PASS (2 suites, 11/11)
- Full stats suite `npx vitest run tests/unit/lib/stats/` → PASS (9 suites, 41/41) — no regressions

## TDD Evidence

### RED (actual output before implementation)

After creating test files, before `src/lib/stats/sidePerformance.ts` and `src/lib/stats/rivalry.ts` existed:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 ❯ tests/unit/lib/stats/rivalry.test.ts (0 test)
 ❯ tests/unit/lib/stats/sidePerformance.test.ts (0 test)

── Failed Suites 2 ──

 FAIL  tests/unit/lib/stats/rivalry.test.ts [ tests/unit/lib/stats/rivalry.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/rivalry' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/rivalry.test.ts
 ❯ tests/unit/lib/stats/rivalry.test.ts:2:1

 FAIL  tests/unit/lib/stats/sidePerformance.test.ts [ tests/unit/lib/stats/sidePerformance.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/sidePerformance' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/sidePerformance.test.ts
 ❯ tests/unit/lib/stats/sidePerformance.test.ts:2:1

 Test Files  2 failed (2)
      Tests  no tests
   Duration  266ms (transform 62ms, setup 0ms, import 0ms, tests 0ms, environment 0ms)
```

Matches plan expectation: FAIL — cannot resolve `.../sidePerformance` and `.../rivalry`.

### GREEN (actual output after implementation)

After creating both src modules per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 Test Files  2 passed (2)
      Tests  11 passed (11)
   Duration  266ms (transform 77ms, setup 0ms, import 136ms, tests 7ms, environment 0ms)
```

Full stats suite:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

 Test Files  9 passed (9)
      Tests  41 passed (41)
   Duration  369ms (transform 475ms, setup 0ms, import 782ms, tests 45ms, environment 1ms)
```

Previously 7 stats suites (30 tests) → now 9 suites (+2) and 41 tests (+11). Counts include `streaks` (8), `form` (7), `clutch` (3), `consistency` (3), `comeback` (3), `temporal` (4), `synergy` (2), `sidePerformance` (3), `rivalry` (8).

Plan expected "3 + 7 = 10 tests" but plan actually lists 3 + 8 = 11 (rivalryTier 4 + narrativeHook 4). Job description miscounts 7; actual is 11 and matches plan code count.

## Files changed

- Created: `src/lib/stats/sidePerformance.ts` (44 lines, 1 type + 1 interface + 1 export) — plan code verbatim
- Created: `src/lib/stats/rivalry.ts` (22 lines, 1 type + 2 exports) — plan code verbatim
- Created: `tests/unit/lib/stats/sidePerformance.test.ts` (30 lines, 3 tests) — plan code with import fix `../../../../` (plan says `../../../` but correct depth is 4 levels; consistent with Tasks 1-7)
- Created: `tests/unit/lib/stats/rivalry.test.ts` (35 lines, 8 tests) — plan code with import fix + narrativeHook signature fix (see below)
- Overwrote: `.superpowers/sdd/task-8-report.md` (this file) — TDD evidence + fixes documentation

Git commit: `feat(stats): add side performance and rivalry helpers` adding the 4 files above (report file not included in commit per task steps).

## Self-review findings

1. **Import path fix** — Plan's `../../../src/lib/stats/sidePerformance` and `../../../src/lib/stats/rivalry` are off by one level for `tests/unit/lib/stats/` (needs `../../../../`). Fixed; verified against existing `tests/unit/lib/stats/streaks.test.ts` etc which all use `../../../../`. Logic otherwise exact to plan.

2. **narrativeHook signature fix** — Plan test passes 5 args `narrativeHook(0,0,2,"A","B")` (with draws), but plan impl is `narrativeHook(aWins,bWins,aName,bName)` (4 args, no draws). Adapted tests to match impl: `narrativeHook(0,0,"A","B")`, `narrativeHook(9,3,"A","B")`, `narrativeHook(3,9,"A","B")`, `narrativeHook(5,5,"A","B")`. Impl uses `decided=aWins+bWins`, so draws correctly excluded by caller (matches Task 14 `versus.astro` which passes `a_wins, b_wins` only). No logic change needed.

3. **Implementations verbatim** — `sidePerformance`: `acc` with wins/matches, `if(r.team!=="light"&&r.team!=="dark")continue`, `Math.round(wins/matches*100)`, `if(light.winRate>dark.winRate+5)` threshold. `rivalry`: `if(matchesAgainst<2)return null`, `<=5 casual`, `<=10 rival`, `else legendary`, `decided=aWins+bWins`, `aRate>=0.75` / `<=0.25` with Spanish strings. No comments added per global constraints. Pure functions, no Supabase.

4. **No regressions** — Full stats suite 41 tests pass (30 prior + 11 new). 9 test files.

## Issues or concerns

None blocking. `computeSidePerformance` treats `D` (draw) as non-win for winRate (draw counts as match but not win) — matches plan intent for dark/light preference (winRate based on wins). Balanced threshold is ±5% winRate; edge case equal matches with 0 winRate each → balanced (correct). `narrativeHook` uses decided = aWins+bWins (draws ignored), so 75% threshold means 9-3 qualifies, 3-9 qualifies, 5-5 null — per plan.
