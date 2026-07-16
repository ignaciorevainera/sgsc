# SGSC — Agent Instructions

## Stack
- **Astro 6** (output: `server`, SSR via `@astrojs/vercel`)
- **Tailwind CSS 4** + **DaisyUI 5** (no inline styles; prefer token classes: `bg-base-100`, `text-base-content`, `primary`, etc.)
- **Supabase** Postgres (typed via `src/types/database.types.ts`)
- **Icon set**: `material-symbols` via `astro-icon`
- **Font**: Sora Variable (`@fontsource-variable/sora`)
- **Theme**: light/dark toggle via `theme-change`; init script in layout

## Auth
- Supabase Auth (email/password), SSR via `@supabase/ssr`
- **Two Supabase clients**:
  - `src/lib/supabase.ts:9` — `supabase` (direct client, browser-safe)
  - `src/lib/supabase.ts:12` — `createAstroSupabase(context)` (SSR, use in `.astro` frontmatter)
- Middleware (`src/middleware.ts`): redirects `/admin/*` to `/login` if unauthenticated; CSRF check on POST to `/admin` and `/api/auth/signout`

## Commands
| Command | What |
|---------|------|
| `npm run dev` | dev server (port 4321) |
| `npm run build` | production build |
| `npm run preview` | preview production build |
| `npm test` | vitest (watch) |
| `npm run test:run` | vitest (single run) |
| `npm run test:coverage` | vitest with coverage |
| `npm run test:e2e` | Playwright E2E |

## Test details
- **Unit**: `tests/unit/` via `vitest` (node env, globals enabled)
- **E2E**: `tests/e2e/` via `@playwright/test` (baseURL `http://localhost:4321`; auto-starts dev server)
- E2E auth fixture: requires `.env.test` with `TEST_EMAIL` + `TEST_PASSWORD`
- E2E mutations gated by `E2E_ALLOW_MUTATIONS=false` (set `true` only for mutation tests)

## Path aliases
`@` → `src/`, `@components/`, `@layouts/`, `@lib/`, `@styles/`, `@assets/`

## Database
- **Tables**: `players`, `matches`, `match_players`, `fields`
- **Views**: `view_player_stats_all_time`, `view_player_stats_yearly`, `view_match_outcomes`, `view_totals_global`, `view_totals_yearly`
- **RPC**: `create_complete_match(p_dark_players, p_date, p_field_id, p_light_players, p_result)`
- **Rule**: never `select(*)` in pages — always explicit columns

## Code conventions
- Components: `PascalCase.astro`
- Pages: `kebab-case.astro`, dynamic `[id].astro`
- Utils: `camelCase.ts`
- No hardcoded colors for UI general; use DaisyUI semantic tokens
- Component dirs: `global/` (header/footer), `ui/` (atoms), `sections/` (blocks), `features/<name>/` (domain)

## Env vars
`SUPABASE_URL`, `SUPABASE_KEY` (in `.env`; also in Vercel secrets)

## Source files of truth
- `CONTEXT.md` — project brief, page inventory, stack, visual/functional requirements
- `DESIGN.md` — design system tokens, typography, spacing, naming conventions

## Existing skills (24 installed)
Key: `caveman`, `brainstorming`, `systematic-debugging`, `test-driven-development`, `writing-plans`, `executing-plans`, `verification-before-completion`, `requesting-code-review`, `subagent-driven-development`, `using-superpowers`
