# Task 7: synergy.ts — Report

## What you implemented

- `src/lib/stats/synergy.ts` (37 lines) — `computeSynergy(matches: SynergyMatchInput[], minMatches = 3, top = 3): SynergyEntry[]`. `SynergyMatchInput = { teammateId, teammateNickname, win }`, `SynergyEntry = { teammateId, teammateNickname, matchesTogether, winsTogether, winRate }`. Aggregates via `Map<string,{nickname,matches,wins}>`, counts `winRate` via `Math.round(wins/matches*100)`, filters `matchesTogether >= minMatches`, sorts `winRate desc` then `matchesTogether desc`, slices `top`. Pure, no Supabase imports. Matches plan verbatim.
- `tests/unit/lib/stats/synergy.test.ts` (32 lines, 2 tests) — plan code with import fix `../../../../`.

Depends on nothing else (standalone pure helper; no `types.ts` consumer).

## What you tested + results

Created `tests/unit/lib/stats/synergy.test.ts` with 2 tests per plan:

- `computeSynergy` (2 tests):
  - filters teammates below min matches (a:3xW keep 100%, b:2 drop → length 1)
  - sorts by win rate then matches, caps at top (a 100% > b 67% > c 33%, top 2 → [a,b])

Results:
- Targeted run `npx vitest run tests/unit/lib/stats/synergy.test.ts` → PASS (2/2)
- Full suite `npx vitest run` → PASS (16 files, 84 tests) — no regressions

## TDD Evidence

### RED (actual output before implementation)

After creating test file, before `src/lib/stats/synergy.ts` existed:

```
 FAIL  tests/unit/lib/stats/synergy.test.ts [ tests/unit/lib/stats/synergy.test.ts ]
Error: Cannot find module '../../../../src/lib/stats/synergy' imported from E:/Dev/proyectos/sgsc/tests/unit/lib/stats/synergy.test.ts
  ❯ tests/unit/lib/stats/synergy.test.ts:2:1

  Test Files  1 failed (1)
       Tests  no tests
    Duration  249ms
```

Matches plan expectation: FAIL — cannot resolve `.../synergy`.

### GREEN (actual output after implementation)

After creating `src/lib/stats/synergy.ts` per plan:

```
 RUN  v4.1.0 E:/Dev/proyectos/sgsc

  Test Files  1 passed (1)
       Tests  2 passed (2)
    Duration  258ms
```

Full suite:

```
 Test Files  16 passed (16)
      Tests  84 passed (84)
   Duration  715ms
```

## Files changed

- Created: `src/lib/stats/synergy.ts` (37 lines, 2 interfaces + 1 export) — plan code verbatim
- Created: `tests/unit/lib/stats/synergy.test.ts` (32 lines, 2 tests) — plan code with import fix `../../../../` (plan says `../../../` but correct depth is 4 dots; consistent with Tasks 1-6)
- Overwrote: `.superpowers/sdd/task-7-report.md` (this file)

Git commit: `feat(stats): add teammate synergy helper` adding `src/lib/stats/synergy.ts` + `tests/unit/lib/stats/synergy.test.ts` (report file untracked per plan — committed separately if needed).

## Self-review findings

1. **Import path fix** — Plan's `../../../src/lib/stats/synergy` is off by one level for `tests/unit/lib/stats/` (needs `../../../../`). Fixed; logic otherwise exact to plan. Verified against existing `tests/unit/lib/stats/streaks.test.ts` etc which all use `../../../../`.
2. **Implementation verbatim** — `Map<string,{nickname,matches,wins}>`, `entry.matches++`, `if(m.win) entry.wins++`, `Math.round((e.wins/e.matches)*100)`, `filter >= minMatches`, `sort(b.winRate - a.winRate || b.matchesTogether - a.matchesTogether)`, `slice(0,top)` all match plan exactly. Defaults `minMatches=3, top=3` per plan. No comments added per global constraints. Pure function, no Supabase imports.
3. **No regressions** — Full suite 84 tests pass (82 prior + 2 new). 16 test files.

## Issues or concerns

None blocking. `nickname` cached from first occurrence per teammateId (`map.get(...) ?? {nickname:m.teammateNickname,...}` then `map.set`) — if same id has differing nicknames later, first wins — matches plan intent and expected.
