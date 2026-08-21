# UX Polish Phase 2 — Navigation & Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul navigation (grouped header dropdowns, breadcrumbs), add loading/empty/error states, and improve mobile experience (bottom nav, back-to-top, touch targets).

**Architecture:** Server-rendered Astro components for static UI (Breadcrumb, Skeleton, EmptyState, ErrorRetry, BottomNav). One client island: BackToTop (scroll listener). Header restructured with DaisyUI dropdowns. All state via URL params or CSS — no client state stores.

**Tech Stack:** Astro 6, TypeScript 5.9, Tailwind CSS 4, DaisyUI 5, Vitest 4.1

## Global Constraints

- Header groups: Stats (Ranking, Jugadores, Canchas), Herramientas (Equipos, Armador, Versus), Reconocimientos (Medallas, Salón de la Fama) — exact labels and hrefs from Header.astro:8-18
- DaisyUI semantic tokens only (no hardcoded colors) — use `bg-base-100`, `text-base-content`, `primary`, `secondary`, etc.
- No `select(*)` — always explicit columns in Supabase queries
- Touch targets: minimum 44px (`min-h-11` / `p-3`) on all interactive elements
- BackToTop appears only after 400px scroll, smooth scroll behavior
- Breadcrumbs use DaisyUI `breadcrumbs` class
- Skeletons use DaisyUI `skeleton` class

---

### Task 1: Breadcrumb Helper and Component

**Files:**
- Create: `src/lib/ux/breadcrumbs.ts`
- Create: `src/components/features/ux/Breadcrumb.astro`
- Test: `tests/unit/lib/ux/breadcrumbs.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `BreadcrumbItem` — `{ label: string; href?: string }`
  - `buildBreadcrumbs(pathname: string, playerNickname?: string): BreadcrumbItem[]`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/lib/ux/breadcrumbs.test.ts
import { describe, it, expect } from "vitest";
import { buildBreadcrumbs } from "../../../src/lib/ux/breadcrumbs";

describe("buildBreadcrumbs", () => {
  it("returns single item for home", () => {
    expect(buildBreadcrumbs("/")).toEqual([{ label: "Inicio", href: "/" }]);
  });

  it("builds chain for players list", () => {
    expect(buildBreadcrumbs("/players")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Jugadores" },
    ]);
  });

  it("builds chain for player detail with nickname", () => {
    expect(buildBreadcrumbs("/players/abc-123", "Juancho")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Jugadores", href: "/players" },
      { label: "Juancho" },
    ]);
  });

  it("builds chain for ranking with custom label", () => {
    expect(buildBreadcrumbs("/ranking")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Clasificación" },
    ]);
  });

  it("builds chain for versus page", () => {
    expect(buildBreadcrumbs("/compare")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Versus" },
    ]);
  });

  it("builds chain for fields", () => {
    expect(buildBreadcrumbs("/fields")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Sedes" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/ux/breadcrumbs.test.ts`
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/ux/breadcrumbs.ts
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  players: "Jugadores",
  ranking: "Clasificación",
  matches: "Partidos",
  compare: "Versus",
  versus: "Versus",
  teams: "Equipos",
  "teams-builder": "Armador de Equipos",
  fields: "Sedes",
  badges: "Medallas",
  "hall-of-fame": "Salón de la Fama",
  admin: "Admin",
};

export function buildBreadcrumbs(pathname: string, playerNickname?: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }];

  // Remove leading/trailing slashes and split
  const segments = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

  if (segments.length === 0) return crumbs;

  // Handle /players/[id] → Jugadores > Nickname
  if (segments[0] === "players" && segments.length === 2) {
    crumbs.push({ label: "Jugadores", href: "/players" });
    crumbs.push({ label: playerNickname || segments[1] });
    return crumbs;
  }

  // Handle admin sub-routes
  if (segments[0] === "admin") {
    crumbs.push({ label: "Admin", href: "/admin" });
    if (segments[1]) {
      const label = routeLabels[segments[1]] || segments[1];
      crumbs.push({ label });
    }
    return crumbs;
  }

  // Default: map first segment
  const firstLabel = routeLabels[segments[0]] || segments[0];
  crumbs.push({ label: firstLabel });
  return crumbs;
}
```

```astro
---
// src/components/features/ux/Breadcrumb.astro
import { buildBreadcrumbs } from "@/lib/ux/breadcrumbs";

interface Props {
  pathname: string;
  playerNickname?: string;
}

const { pathname, playerNickname } = Astro.props;
const items = buildBreadcrumbs(pathname, playerNickname);
---

<nav class="breadcrumbs text-sm" aria-label="Migas de pan">
  <ul>
    {
      items.map((item) =>
        item.href ? (
          <li><a href={item.href} class="link link-hover">{item.label}</a></li>
        ) : (
          <li class="text-base-content/60">{item.label}</li>
        )
      )
    }
  </ul>
</nav>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/ux/breadcrumbs.test.ts`
Expected: PASS (6/6)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ux/breadcrumbs.ts src/components/features/ux/Breadcrumb.astro tests/unit/lib/ux/breadcrumbs.test.ts
git commit -m "feat(ux): add Breadcrumb helper and component"
```

---

### Task 2: Skeleton Component

**Files:**
- Create: `src/components/features/ux/Skeleton.astro`

**Interfaces:**
- Consumes: nothing
- Produces: `<Skeleton />` — DaisyUI skeleton wrapper, variants: card, table-row, list-item

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/Skeleton.astro
interface Props {
  variant?: "card" | "table-row" | "list-item" | "text";
  count?: number;
}

const { variant = "card", count = 1 } = Astro.props;
---

{
  variant === "card" && (
    <div class="flex flex-col gap-4">
      {Array.from({ length: count }, () => (
        <div class="card bg-base-100 border-base-200 rounded-xl border p-4 shadow-md">
          <div class="flex items-center gap-4">
            <div class="skeleton h-12 w-12 shrink-0 rounded-full"></div>
            <div class="flex flex-col gap-2 flex-1">
              <div class="skeleton h-4 w-3/4"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          </div>
          <div class="skeleton h-20 w-full mt-4 rounded-xl"></div>
        </div>
      ))}
    </div>
  )
}

{
  variant === "table-row" && (
    <div class="flex flex-col gap-2">
      {Array.from({ length: count }, () => (
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="skeleton h-4 w-8"></div>
          <div class="skeleton h-4 w-32"></div>
          <div class="skeleton h-4 w-16 ml-auto"></div>
        </div>
      ))}
    </div>
  )
}

{
  variant === "list-item" && (
    <div class="flex flex-col gap-3">
      {Array.from({ length: count }, () => (
        <div class="flex items-center gap-3">
          <div class="skeleton h-10 w-10 rounded-full"></div>
          <div class="flex flex-col gap-2 flex-1">
            <div class="skeleton h-3 w-24"></div>
            <div class="skeleton h-2 w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

{
  variant === "text" && (
    <div class="flex flex-col gap-2">
      {Array.from({ length: count }, () => (
        <div class="skeleton h-4 w-full"></div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/Skeleton.astro
git commit -m "feat(ux): add Skeleton component with card/table/list variants"
```

---

### Task 3: EmptyState Component

**Files:**
- Create: `src/components/features/ux/EmptyState.astro`

**Interfaces:**
- Consumes: nothing
- Produces: `<EmptyState />`
- Props: `icon: string`, `title: string`, `description: string`, `actionHref?: string`, `actionLabel?: string`

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/EmptyState.astro
import { Icon } from "astro-icon/components";

interface Props {
  icon: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

const { icon, title, description, actionHref, actionLabel } = Astro.props;
---

<div class="card bg-base-100 border-base-200 rounded-xl border p-8 text-center shadow-md">
  <div class="bg-base-200 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
    <Icon name={icon} size={32} class="text-base-content/40" aria-hidden="true" />
  </div>
  <h3 class="text-lg font-black">{title}</h3>
  <p class="text-base-content/60 mx-auto mt-2 max-w-sm text-sm">{description}</p>
  {
    actionHref && actionLabel && (
      <a href={actionHref} class="btn btn-primary btn-sm mt-4 rounded-xl">
        {actionLabel}
      </a>
    )
  }
</div>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/EmptyState.astro
git commit -m "feat(ux): add EmptyState component"
```

---

### Task 4: ErrorRetry Component

**Files:**
- Create: `src/components/features/ux/ErrorRetry.astro`

**Interfaces:**
- Consumes: nothing
- Produces: `<ErrorRetry />`
- Props: `message: string`, `retryHref?: string`

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/ErrorRetry.astro
import { Icon } from "astro-icon/components";

interface Props {
  message: string;
  retryHref?: string;
}

const { message, retryHref } = Astro.props;
---

<div class="alert alert-error rounded-xl shadow-md" role="alert">
  <Icon name="material-symbols:error" size={24} aria-hidden="true" />
  <div class="flex flex-1 items-center justify-between gap-4">
    <span class="text-sm">{message}</span>
    {
      retryHref ? (
        <a href={retryHref} class="btn btn-sm btn-ghost shrink-0 rounded-xl">
          <Icon name="material-symbols:refresh" size={18} aria-hidden="true" />
          Reintentar
        </a>
      ) : (
        <button
          type="button"
          class="btn btn-sm btn-ghost shrink-0 rounded-xl"
          onclick="location.reload()"
        >
          <Icon name="material-symbols:refresh" size={18} aria-hidden="true" />
          Reintentar
        </button>
      )
    }
  </div>
</div>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/ErrorRetry.astro
git commit -m "feat(ux): add ErrorRetry component"
```

---

### Task 5: Header Overhaul — Grouped Navigation

**Files:**
- Modify: `src/components/shared/Header.astro`

**Interfaces:**
- Consumes: nothing new
- Produces: Header with 3 dropdown groups instead of 9 flat links, both desktop and mobile

- [ ] **Step 1: Read existing Header.astro, then replace the `links` array and nav sections**

Replace `const links = [...]` (lines 8-18) with:

```ts
const navGroups = [
  {
    label: "Estadísticas",
    groups: [
      { href: "/ranking", label: "Clasificación" },
      { href: "/players", label: "Jugadores" },
      { href: "/fields", label: "Canchas" },
    ],
  },
  {
    label: "Herramientas",
    groups: [
      { href: "/teams", label: "Equipos" },
      { href: "/teams-builder", label: "Armador de Equipos" },
      { href: "/compare", label: "Versus" },
    ],
  },
  {
    label: "Reconocimientos",
    groups: [
      { href: "/badges", label: "Medallas" },
      { href: "/hall-of-fame", label: "Salón de la Fama" },
      { href: "/matches", label: "Partidos" },
    ],
  },
];

const isGroupActive = (group: { href: string }[]) =>
  group.some((link) => isLinkActive(link.href));
```

Add helper `isGroupActive` that checks if any link in a group matches `isLinkActive`.

**Step 1b:** Replace the desktop nav `<nav class="navbar-center hidden xl:flex">` block with grouped dropdowns:

```astro
  <nav class="navbar-center hidden xl:flex" aria-label="Navegación principal">
    <ul class="menu menu-horizontal px-1" role="menubar">
      {
        navGroups.map((group) => (
          <li>
            <details>
              <summary class={isGroupActive(group.groups) ? "text-primary font-bold" : ""}>
                {group.label}
              </summary>
              <ul class="bg-base-100 rounded-xl p-2 shadow-md">
                {group.groups.map((link) => (
                  <li>
                    <a
                      href={link.href}
                      class={isLinkActive(link.href) ? "active text-primary font-bold" : ""}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))
      }
    </ul>
  </nav>
```

**Step 1c:** Replace the mobile menu `<ul id="mobile-menu">` with grouped sections:

```astro
      <ul
        tabindex="-1"
        id="mobile-menu"
        class="menu dropdown-content bg-base-100 z-10 mt-4 w-64 rounded-xl p-2 shadow-md"
        role="menu"
      >
        {
          navGroups.map((group) => (
            <>
              <li class="menu-title text-base-content/40 text-xs uppercase">{group.label}</li>
              {group.groups.map((link) => (
                <li>
                  <a
                    href={link.href}
                    class={isLinkActive(link.href) ? "active text-primary font-bold" : ""}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <div class="divider m-0" />
            </>
          ))
        }
      </ul>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Header.astro
git commit -m "feat: group header nav into Stats/Herramientas/Reconocimientos dropdowns"
```

---

### Task 6: BackToTop Island

**Files:**
- Create: `src/components/features/ux/BackToTop.astro`

**Interfaces:**
- Consumes: nothing
- Produces: `<BackToTop />` — client island, appears after 400px scroll, smooth scroll to top

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/BackToTop.astro
import { Icon } from "astro-icon/components";
---

<button
  type="button"
  id="back-to-top"
  class="btn btn-circle btn-primary fixed right-4 bottom-4 z-40 hidden shadow-lg"
  aria-label="Volver arriba"
  title="Volver arriba"
>
  <Icon name="material-symbols:arrow-upward" size={22} aria-hidden="true" />
</button>

<script>
  const btn = document.getElementById("back-to-top") as HTMLButtonElement | null;

  const toggleVisibility = () => {
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.classList.remove("hidden");
      btn.classList.add("flex");
    } else {
      btn.classList.add("hidden");
      btn.classList.remove("flex");
    }
  };

  btn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();
</script>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/BackToTop.astro
git commit -m "feat(ux): add BackToTop island with scroll detection"
```

---

### Task 7: BottomNav Component (Mobile Only)

**Files:**
- Create: `src/components/features/ux/BottomNav.astro`

**Interfaces:**
- Consumes: nothing (reads `Astro.url.pathname` for active state)
- Produces: `<BottomNav />` — fixed bottom nav, visible only on mobile (`xl:hidden`), 4 icons

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/BottomNav.astro
import { Icon } from "astro-icon/components";

const currentPath = Astro.url.pathname;

const items = [
  { href: "/", label: "Inicio", icon: "material-symbols:home" },
  { href: "/ranking", label: "Ranking", icon: "material-symbols:leaderboard" },
  { href: "/players", label: "Jugadores", icon: "material-symbols:groups" },
  { href: "/matches", label: "Partidos", icon: "material-symbols:history" },
];

const isActive = (href: string) => {
  if (href === "/") return currentPath === "/";
  return currentPath.startsWith(href);
};
---

<nav
  class="btm-nav btm-nav-sm bg-base-100 border-base-200 fixed bottom-0 z-40 flex border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] xl:hidden"
  aria-label="Navegación inferior"
>
  {
    items.map((item) => (
      <a
        href={item.href}
        class={`flex flex-col items-center justify-center gap-0.5 py-1 ${isActive(item.href) ? "active text-primary border-primary border-t-2" : "text-base-content/60"}`}
        aria-label={item.label}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        <Icon name={item.icon} size={22} aria-hidden="true" />
        <span class="text-[10px] font-bold uppercase">{item.label}</span>
      </a>
    ))
  }
</nav>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/BottomNav.astro
git commit -m "feat(ux): add BottomNav for mobile with 4 primary links"
```

---

### Task 8: Integrate Breadcrumb, States, and Mobile Nav into Layout/Pages

**Files:**
- Modify: `src/layouts/Main.astro`
- Modify: `src/pages/players/[id].astro`
- Modify: `src/pages/players/index.astro` (optional: add EmptyState for filtered empty)

**Interfaces:**
- Consumes: `Breadcrumb.astro`, `BackToTop.astro`, `BottomNav.astro`, `EmptyState.astro`

- [ ] **Step 1: Modify Main.astro to add BackToTop and BottomNav**

In `src/layouts/Main.astro`, add imports:

```astro
import BackToTop from "@/components/features/ux/BackToTop.astro";
import BottomNav from "@/components/features/ux/BottomNav.astro";
```

Render after `<Footer />` and before `</body>`:

```astro
    <BackToTop client:load />
    <BottomNav />
```

Also add bottom padding to `<main>` when on mobile to avoid BottomNav overlap. Change the main class to include `pb-20 xl:pb-0`:

```astro
    <main
      id="main-content"
      class={`mx-auto flex w-full ${mainWidthClass} flex-1 flex-col px-4 py-8 sm:py-12 pb-20 xl:pb-0`}
    >
```

- [ ] **Step 2: Modify players/[id].astro to add Breadcrumb**

In `src/pages/players/[id].astro`, add import:

```astro
import Breadcrumb from "@/components/features/ux/Breadcrumb.astro";
```

Render after `<Main>` opening and before the banner (after `<!-- Banner Principal -->`):

```astro
  <Breadcrumb pathname={Astro.url.pathname} playerNickname={player.nickname} />
```

- [ ] **Step 3: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Main.astro src/pages/players/[id].astro
git commit -m "feat: integrate Breadcrumb, BackToTop, BottomNav into layout and pages"
```

---

## Self-Review Checklist

- [ ] Spec coverage: every Phase 2 requirement has a task (header grouping, breadcrumbs, skeletons, empty states, error retry, mobile nav, back-to-top)
- [ ] No placeholders (TBD, TODO, "handle edge cases")
- [ ] Type consistency: `BreadcrumbItem`, props match across consumer tasks
- [ ] Touch targets meet 44px minimum
- [ ] DaisyUI tokens only
