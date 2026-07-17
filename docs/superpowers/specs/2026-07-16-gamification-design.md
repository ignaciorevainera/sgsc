# Gamification — Design Spec

**Date:** 2026-07-16
**Status:** Approved
**Author:** SGSC Team

---

## Overview

Gamification system building on stats engine metrics. Hybrid approach: achievement badges (milestones) + temporal awards (POTW/POTM) + seasonal narratives + rivalry hooks. Each piece self-contained, can ship independently.

## Goals

- Foster competition and engagement through recognition
- Provide short-term (weekly) + long-term (achievements) goals
- Create social narratives around rivalries and comebacks
- Enhance existing badge/hall-of-fame system

## Current State

**Existing:**
- `/badges` page: 3 progressive badges (trayectoria, ganador, leyenda) × 8 tiers, 4 special badges
- `/hall-of-fame`: 8 categories + best duo + seasonal champion
- Points system: win = 3, draw = 1
- No per-player badge computation (page shows static definitions)
- No badges on player profiles
- No weekly/monthly awards
- No progression visualization

## Architecture

### Badge System Overhaul

**Visibility model:**
- All players have public badge pages: `/players/[id]/badges` (or tab in profile)
- Player profile header: top 3 badges (most prestigious / recently unlocked)
- No auth required to view badges (public like stats)

**Dynamic computation:**
- New DB function `compute_player_badges(player_id)` returns earned badges + progress
- Compute on profile load (42 matches = fast)
- Optional: `player_badges` table to store unlock timestamps for "recently unlocked" feed

**New progressive badge categories:**

1. **Rachas** — 3-win, 5-win, 7-win streaks
2. **Duplas** — 5, 10, 15 wins with same teammate
3. **Consistencia** — 10, 20, 30 matches played
4. **Comeback** — post-loss win streaks (3x, 5x)
5. **Field mastery** — 10+ wins at one field

**New special badges:**

1. **Nemesis** — beat same player 5+ times h2h
2. **Clutch King** — 80%+ win rate last 5
3. **Iron Man** — every match this season
4. **Underdog** — win after trailing in standings
5. **Social Butterfly** — played with every active player

**Badge page overhaul (`/badges`):**
- Search/filter by player name
- Per-player badge grid with progress bars to next tier
- Category tabs (Trayectoria / Rachas / Duplas / Especiales)

**New route:**
- `/players/[id]/badges` — full badge showcase for that player

### Temporal Awards & Narratives

**Player of the Week/Month:**
- Compute from match dates: best performer in last 7 days / 30 days
- Criteria: points earned + win rate + matches played (min 2 matches to qualify)
- Display: banner on home page, badge on player profile, entry in hall of fame
- Auto-rotate: "Current POTW" updates Monday morning, "POTM" updates 1st of month

**Seasonal narratives (computed from yearly stats):**

1. **Title race** — if current season has clear leader + close competitors, show "X leads by Y points, Z games left"
2. **Comeback story** — player who climbed from bottom 25% to top 25% in same season
3. **Rising star** — new player (first season) with top 3 points
4. **Veteran presence** — player with most matches across all seasons
5. **Duo dominance** — best duo this season vs all-time best duo

**Progression visualization:**
- Player profile: line chart showing cumulative points over time (Astro island with Chart.js or lightweight SVG)
- Ranking page: "form" column showing last 5 matches as colored dots (W/D/L)
- Home page: "Momentum" section — top 3 players by recent form (last 5 matches)

**Where these appear:**
- Home: POTW banner, momentum leaderboard (top 3)
- Player profile: seasonal narrative badge (if applicable), progression chart
- Hall of fame: seasonal champions section, "comeback of the year"
- Ranking: form column, "title race" indicator if close competition

**Edge cases:**
- No matches this week → hide POTW, show last valid
- Season not started → hide title race narrative
- Tie in POTW → show multiple winners or "shared award"

## Components

**New DB views/functions:**
- `compute_player_badges(player_id)` — returns badge array with earned/progress
- `view_player_of_the_week` — best performer last 7 days
- `view_player_of_the_month` — best performer last 30 days
- `view_seasonal_narratives` — comeback story, rising star, etc.

**New utility modules (`src/lib/gamification/`):**
- `badges.ts` — badge definitions, tier logic, computation
- `awards.ts` — POTW/POTM calculation
- `narratives.ts` — seasonal story detection
- `progression.ts` — cumulative points, form trends

**New components (`src/components/features/gamification/`):**
- `BadgeCard.astro` — single badge with tier, progress bar
- `BadgeShowcase.astro` — top 3 badges for profile header
- `BadgeGrid.astro` — full badge list with filters
- `AwardBanner.astro` — POTW/POTM hero banner
- `NarrativeCard.astro` — seasonal story card
- `ProgressionChart.astro` — cumulative points over time (client island)

**New routes:**
- `/players/[id]/badges` — full badge showcase
- `/awards` — POTW/POTM history, seasonal champions
- Redirect `/compare` → `/versus` (from stats spec)

**Integration points:**
- Home: AwardBanner (POTW), momentum leaderboard
- Player profile: BadgeShowcase (top 3), ProgressionChart, NarrativeCard
- Hall of fame: seasonal champions section
- Ranking: form column
- Badges page: search by player, category filters

## Testing

- Unit tests for badge computation (all tiers, edge cases)
- Unit tests for POTW/POTM (ties, insufficient matches)
- Unit tests for narrative detection (comeback, rising star conditions)
- Component snapshot tests

## Performance

- Badge computation: ~50ms per player (42 matches)
- POTW/POTM: cached per page load, invalidate on new match
- ProgressionChart: client-side render, data passed as props

## Migration Strategy

- Add views/functions via Supabase migration (non-breaking)
- New routes additive, existing pages unchanged
- Badge page overhaul: replace static definitions with dynamic computation

## Success Criteria

- Player profile shows top 3 badges + progress bars
- `/badges` page searchable by player
- Home page displays POTW banner
- Hall of fame includes seasonal narratives
- All badge computations have unit tests (90%+ coverage)

## Future Enhancements (Out of Scope)

- Badge notifications (email/push when unlocked)
- Social sharing of badges
- Custom badge creation (admin)
- Badge trading/collection mechanics (gamification layer)
