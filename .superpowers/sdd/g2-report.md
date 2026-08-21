# G2 Report — Task 2: badges.ts

## Status: DONE

## TDD Evidence

### RED — Expected FAIL before implementation
```
FAIL tests/unit/lib/gamification/badges.test.ts
Error: Cannot find module '../../../../src/lib/gamification/badges' imported from tests/unit/lib/gamification/badges.test.ts
```
Reason: `src/lib/gamification/badges.ts` did not exist yet. Test import cannot resolve. Suite failed with 0 tests executed. Confirms TDD RED phase.

### GREEN — PASS after implementation
```
Test Files  1 passed (1)
Tests  9 passed (9)
Start at 10:49:40
Duration 281ms (transform 50ms, setup 0ms, import 81ms, tests 6ms)
```
9/9 tests passed:
- catalog: has 8 progressive and 6 special badges
- every progressive badge has ascending thresholds
- no earned badges for zero metrics, but progress exists
- earns trayectory bronze at 5 matches
- earns rachas gold at 7 streak
- progress toward next tier (50% at 5/10)
- earns special badges from thresholds/booleans (nemesis, clutch-king, iron-man, underdog, social-butterfly)
- earns presentismo when played every season
- earns especialista from light/dark wins

Command: `npx vitest run tests/unit/lib/gamification/badges.test.ts`

## Files Changed
- Created `tests/unit/lib/gamification/badges.test.ts` — 9 tests (2 catalog + 7 compute) with BadgeMetrics base fixture
- Created `src/lib/gamification/badges.ts` — PROGRESSIVE_BADGES (8 entries), SPECIAL_BADGES (6 entries), BadgeMetrics (16 fields), EarnedBadge/BadgeProgress/PlayerBadges interfaces, metricValue helper, computePlayerBadges function (~180 lines, single file combining catalog + computation)

## Self-Review
- Pure module: no supabase import, no import.meta.env — PASS
- Imports: `import type { TierKey } from "./types"` + `import { tierIndex } from "./types"` per plan — PASS
- Test import uses relative `../../../../src/lib/gamification/badges` per plan depth — PASS
- Vitest globals used (describe/it/expect) — PASS
- No comments in code — PASS
- Progressive badge thresholds ascend within each badge — PASS
- metricValue correctly maps category to metrics field (trayectoria/consistencia→matchesPlayed, ganador→wins, leyenda→points, rachas→longestWinStreak, duplas→bestDuoWins, comeback→comebackStreak, field→bestFieldWins) — PASS
- computePlayerBadges: earned tier is highest threshold ≤ value, progress is next tier with percentage, special badges gated on exact thresholds (nemesis≥5, clutch≥80, ironMan, underdog, socialButterfly, presentismo totalClubSeasons>1, especialista light vs dark) — PASS
- Especialista produces ids `especialista-claro`/`especialista-oscuro` outside SPECIAL_BADGES catalog — matches plan verbatim — PASS
- All 8 progressive + 6 special catalog entries + dynamic especialista cases covered — PASS

## Commit
- `feat(gamification): add badge catalog and computation` — `src/lib/gamification/badges.ts` + `tests/unit/lib/gamification/badges.test.ts`
