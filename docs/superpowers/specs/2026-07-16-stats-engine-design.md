# Stats Engine — Design Spec

**Date:** 2026-07-16
**Status:** Approved
**Author:** SGSC Team

---

## Overview

Advanced statistical metrics derived from existing match data, without requiring goal/assist tracking. Hybrid approach: core metrics as DB views (fast queries), complex metrics computed on demand.

## Goals

- Provide deeper player insights beyond W/D/L
- Enable rivalry tracking and head-to-head narratives
- Surface form trends and consistency patterns
- Foundation for gamification features

## Data Available

**Tables:**
- `players` (63 rows) — includes is_active, birth_date, height, preferred_foot, is_guest, nickname
- `matches` (42 rows) — date, field_id, result (light/dark/draw), video_url, notes
- `match_players` (442 rows) — player_id, match_id, team (light/dark)
- `fields` (10 rows) — name, city

**Existing Views:**
- `view_player_stats_all_time` — matches_played, wins, draws, losses, points, win_rate, attendance_pct, form_array (last 5)
- `view_player_stats_yearly` — same metrics grouped by year
- `view_match_outcomes` — per-match W/D/L per player
- `view_totals_global`, `view_totals_yearly` — match counts

## Architecture

### Database Views (queried often, indexed)

**1. view_player_streaks**
```sql
- player_id
- current_streak_type (W/L/D)
- current_streak_length
- longest_win_streak
- longest_loss_streak
```

**2. view_head_to_head** (powers `/versus`)
```sql
- player_a_id, player_b_id
- matches_together
- a_wins, b_wins, draws
- a_win_rate
- rivalry_intensity (match count)
- last_5_outcomes (array)
```

**3. view_field_dominance**
```sql
- player_id, field_id
- matches_at_field
- wins, win_rate
- home_field (boolean: field with most matches)
```

### Computed on Demand (per page load)

**4. Form trajectory**
- Rolling win rate over last 5/10 matches
- Trend arrow: improving / declining / stable
- Logic: compare last 5 win rate vs career average

**5. Clutch factor**
- Recent form (last 5) vs career average
- Delta percentage
- Interpretation: "hot" if +20%, "cold" if -20%, "neutral" otherwise

**6. Consistency score**
- Standard deviation of match outcomes (0-100)
- Higher = more predictable
- Edge case: < 3 matches → hide metric

**7. Teammate synergy**
- For each player, top 3 teammates by win rate together
- Min 3 matches together to qualify
- Display: teammate name, matches together, win rate

**8. Side performance delta**
- Win rate when playing dark vs light
- Preference indicator: "dark specialist" / "light specialist" / "balanced"

**9. Temporal patterns**
- Best month (highest win rate)
- Worst month (lowest win rate)
- Day-of-week performance (if date granularity allows)

**10. Comeback metric**
- After loss, how often next match is win
- Calculation: count(loss → win) / count(loss → *)

## Route Changes

**Rename:**
- `/compare` → `/versus` (301 redirect for SEO)
- Update internal links (Header, player profiles, etc.)

**Enhance `/versus`:**
- Timeline graph: match-by-match results between two players
- Rivalry tier: casual (2-5 matches) / rival (6-10) / legendary (11+)
- Shared teams count: how many times on same team
- Narrative hook: "When X wins, Y loses" (if one-sided)

**New pages/sections:**
- `/players/[id]` — add streaks, form graph, clutch factor, synergy list
- `/ranking` — add streak column, sort by streak
- `/fields/[id]` — player rankings at that field (if field detail page exists)

## Components

**New utilities (`src/lib/stats/`):**
- `streaks.ts` — streak calculation helpers
- `form.ts` — rolling win rate, trend arrow logic
- `clutch.ts` — recent vs career delta
- `consistency.ts` — standard deviation calc
- `synergy.ts` — teammate win rate ranking
- `temporal.ts` — month/day aggregation
- `comeback.ts` — post-loss win rate

**New components (`src/components/features/stats/`):**
- `StreakBadge.astro` — current streak with icon + length
- `FormGraph.astro` — last 10 matches W/L/D visual (client-side island optional)
- `ClutchMeter.astro` — gauge showing recent vs career
- `SynergyList.astro` — top 3 teammates cards
- `RivalryTimeline.astro` — match-by-match h2h (for `/versus`)
- `TrendArrow.astro` — up/down/stable indicator

## Edge Cases

- Player with < 3 matches → hide advanced metrics (insufficient data)
- H2H with < 2 matches → show "not enough data" instead of rivalry tier
- Division by zero in consistency → default to 50 (neutral)
- Empty form array → render placeholder, no crash
- Tie in streak length → sort by most recent

## Performance

- Views indexed on player_id, match date
- Computed metrics: cache per page load (SSR memoize)
- 42 matches = small dataset, no heavy optimization needed yet
- Future: if matches > 500, consider materialized views

## Testing

- Unit tests for each `lib/stats/*.ts` module (vitest)
- Edge cases: 0 matches, 1 match, all wins, all draws
- Snapshot tests for new components
- Integration test: verify views return correct data

## Migration Strategy

- Add views via Supabase migration (non-breaking)
- New components additive, existing pages unchanged until opt-in
- `/compare` → `/versus` redirect (301) for SEO, update internal links
- Deprecate old `/compare` route after 1 sprint

## Success Criteria

- Player detail page shows 5+ new metrics without manual calculation
- `/versus` displays rivalry tier + timeline
- Ranking table sortable by streak
- All new metrics have unit tests (90%+ coverage)
- Page load time < 2s with new metrics

## Future Enhancements (Out of Scope)

- Real-time stat updates (WebSocket)
- Advanced visualizations (heatmaps, shot charts) — requires goal tracking
- Export stats to PDF/image
- Stat comparisons across seasons (year-over-year)
