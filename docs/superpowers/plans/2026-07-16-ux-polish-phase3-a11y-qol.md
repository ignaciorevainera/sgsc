# UX Polish Phase 3 — Accessibility & Quality of Life Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessibility fundamentals (skip link, focus indicators, ARIA), social sharing (player/match/ranking), and quality-of-life polish (keyboard shortcuts, print styles, SEO structured data).

**Architecture:** SkipLink and accessibility.css are static SSR. ShareButtons and KeyboardShortcutsModal are client islands. Print styles via CSS media query. SEO via JSON-LD `<script type="application/ld+json">` in page frontmatter. Analytics via existing Vercel Analytics + custom events.

**Tech Stack:** Astro 6, TypeScript 5.9, Tailwind CSS 4, DaisyUI 5, Vitest 4.1

## Global Constraints

- Skip link: `href="#main-content"`, hidden until focused, DaisyUI `btn` styling when visible
- Focus indicators: `focus:outline focus:outline-2 focus:outline-primary focus:outline-offset-2` on all interactive elements
- ShareButtons: uses Web Share API when available, falls back to clipboard + WhatsApp link
- Keyboard shortcuts: `?` opens modal, `/` focuses search (Cmd+K), `Esc` closes modals
- Print styles: hide `header`, `footer`, `nav`, `.btm-nav`, `#back-to-top`, `dialog` — optimize for paper
- SEO: JSON-LD for player profiles (`Person` + `SportsTeam`), matches (`SportsEvent`)
- Analytics: track `search_used`, `filter_applied`, `share_clicked` via `window.va?.track`

---

### Task 1: Share Utility and SkipLink

**Files:**
- Create: `src/lib/ux/share.ts`
- Create: `src/components/features/ux/SkipLink.astro`
- Create: `src/styles/accessibility.css`
- Test: `tests/unit/lib/ux/share.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `buildShareUrl(type: 'whatsapp' | 'twitter' | 'copy', url: string, text: string): string`
  - `copyToClipboard(text: string): Promise<boolean>`
  - `<SkipLink />` — hidden skip-to-content link

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/lib/ux/share.test.ts
import { describe, it, expect } from "vitest";
import { buildShareUrl } from "../../../src/lib/ux/share";

describe("buildShareUrl", () => {
  it("builds WhatsApp share URL", () => {
    const url = buildShareUrl("whatsapp", "https://sgsc.vercel.app/players/123", "Mira el perfil de Juancho");
    expect(url).toBe(
      "https://wa.me/?text=" + encodeURIComponent("Mira el perfil de Juancho https://sgsc.vercel.app/players/123")
    );
  });

  it("builds Twitter share URL", () => {
    const url = buildShareUrl("twitter", "https://sgsc.vercel.app/ranking", "Tabla SGSC");
    expect(url).toContain("https://twitter.com/intent/tweet");
    expect(url).toContain(encodeURIComponent("https://sgsc.vercel.app/ranking"));
    expect(url).toContain(encodeURIComponent("Tabla SGSC"));
  });

  it("returns raw URL for copy type", () => {
    const url = buildShareUrl("copy", "https://sgsc.vercel.app/players/123", "text");
    expect(url).toBe("https://sgsc.vercel.app/players/123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/ux/share.test.ts`
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/ux/share.ts
export function buildShareUrl(
  type: "whatsapp" | "twitter" | "copy",
  url: string,
  text: string,
): string {
  if (type === "whatsapp") {
    return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  }
  if (type === "twitter") {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
```

```astro
---
// src/components/features/ux/SkipLink.astro
---

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:btn focus:btn-primary focus:rounded-xl focus:px-4 focus:py-2 focus:shadow-lg"
>
  Saltar al contenido principal
</a>
```

```css
/* src/styles/accessibility.css */
/* Focus indicators for all interactive elements */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid oklch(var(--p));
  outline-offset: 2px;
}

/* Skip link: hidden until focused (sr-only pattern) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: fixed;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/ux/share.test.ts`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ux/share.ts src/components/features/ux/SkipLink.astro src/styles/accessibility.css tests/unit/lib/ux/share.test.ts
git commit -m "feat(ux): add share URL builder and SkipLink with a11y styles"
```

---

### Task 2: ShareButtons Island

**Files:**
- Create: `src/components/features/ux/ShareButtons.astro`

**Interfaces:**
- Consumes: `src/lib/ux/share.ts` (buildShareUrl, copyToClipboard)
- Produces: `<ShareButtons />` — client island with WhatsApp, Twitter, Copy buttons + toast feedback
- Props: `url: string`, `text: string`, `variant?: 'compact' | 'full'`

- [ ] **Step 1: Create the component**

```astro
---
// src/components/features/ux/ShareButtons.astro
import { Icon } from "astro-icon/components";

interface Props {
  url: string;
  text: string;
  variant?: "compact" | "full";
}

const { url, text, variant = "compact" } = Astro.props;
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
---

<div class="flex items-center gap-2" data-share-url={url} data-share-text={text}>
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="btn btn-sm btn-circle bg-[#25D366] text-white border-none hover:bg-[#128C7E]"
    aria-label="Compartir por WhatsApp"
    title="WhatsApp"
    data-share-action="whatsapp"
  >
    <Icon name="material-symbols:share" size={18} aria-hidden="true" />
  </a>

  <a
    href={twitterUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="btn btn-sm btn-circle bg-[#1DA1F2] text-white border-none hover:bg-[#0d8bd9]"
    aria-label="Compartir en X"
    title="X / Twitter"
    data-share-action="twitter"
  >
    <Icon name="material-symbols:share" size={18} aria-hidden="true" />
  </a>

  <button
    type="button"
    class="btn btn-sm btn-circle btn-ghost border-base-300 border"
    aria-label="Copiar enlace"
    title="Copiar enlace"
    data-share-action="copy"
  >
    <Icon name="material-symbols:content-copy" size={18} aria-hidden="true" />
  </button>

  <span class="share-feedback hidden text-xs font-bold text-success ml-1" role="status" aria-live="polite">
    ¡Copiado!
  </span>
</div>

<script>
  document.querySelectorAll("[data-share-action='copy']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const container = btn.closest("[data-share-url]") as HTMLElement | null;
      if (!container) return;
      const url = container.dataset.shareUrl || window.location.href;
      const feedback = container.querySelector(".share-feedback") as HTMLElement | null;

      try {
        await navigator.clipboard.writeText(url);
        if (feedback) {
          feedback.classList.remove("hidden");
          setTimeout(() => feedback.classList.add("hidden"), 2000);
        }
      } catch {
        // Fallback: select and copy via execCommand
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (feedback) {
          feedback.classList.remove("hidden");
          setTimeout(() => feedback.classList.add("hidden"), 2000);
        }
      }

      // Analytics
      (window as any).va?.track?.("share_clicked", { action: "copy", url });
    });
  });

  document.querySelectorAll("[data-share-action='whatsapp'], [data-share-action='twitter']").forEach((link) => {
    link.addEventListener("click", () => {
      const action = (link as HTMLElement).dataset.shareAction;
      const container = link.closest("[data-share-url]") as HTMLElement | null;
      const url = container?.dataset.shareUrl || window.location.href;
      (window as any).va?.track?.("share_clicked", { action, url });
    });
  });
</script>
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/ShareButtons.astro
git commit -m "feat(ux): add ShareButtons island with WhatsApp/Twitter/copy"
```

---

### Task 3: Keyboard Shortcuts and Print Styles

**Files:**
- Create: `src/components/features/ux/KeyboardShortcutsModal.astro`
- Create: `src/styles/print.css`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `<KeyboardShortcutsModal />` — client island, `?` opens modal, `/` focuses search
  - Print stylesheet hiding nav/footer/dialog, optimizing for paper

- [ ] **Step 1: Create the components**

```astro
---
// src/components/features/ux/KeyboardShortcutsModal.astro
import { Icon } from "astro-icon/components";
---

<dialog id="shortcuts-modal" class="modal">
  <div class="modal-box max-w-md">
    <h3 class="text-lg font-black mb-4">Atajos de teclado</h3>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm">Buscar</span>
        <kbd class="kbd kbd-sm">Ctrl + K</kbd>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm">Atajos</span>
        <kbd class="kbd kbd-sm">?</kbd>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm">Cerrar modal</span>
        <kbd class="kbd kbd-sm">Esc</kbd>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm">Ir al contenido</span>
        <kbd class="kbd kbd-sm">Tab</kbd>
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-sm rounded-xl">Cerrar</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<!-- Trigger: press ? anywhere -->
<script>
  document.addEventListener("keydown", (e) => {
    // Don't trigger when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      (document.getElementById("shortcuts-modal") as HTMLDialogElement)?.showModal();
    }

    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      e.preventDefault();
      (document.getElementById("search-modal") as HTMLDialogElement)?.showModal();
      setTimeout(() => {
        (document.getElementById("search-input") as HTMLInputElement)?.focus();
      }, 100);
    }
  });
</script>
```

```css
/* src/styles/print.css */
@media print {
  header,
  footer,
  nav,
  .btm-nav,
  #back-to-top,
  dialog,
  .modal,
  .modal-backdrop,
  [role="banner"],
  [aria-label="Navegación inferior"],
  [aria-label="Migas de pan"] {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }

  .card,
  .stats,
  .alert {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    break-inside: avoid;
  }

  a {
    color: black !important;
    text-decoration: underline !important;
  }

  main {
    padding: 0 !important;
  }
}
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/ux/KeyboardShortcutsModal.astro src/styles/print.css
git commit -m "feat(ux): add keyboard shortcuts modal and print styles"
```

---

### Task 4: SEO Structured Data and Layout Integration

**Files:**
- Modify: `src/layouts/Main.astro`
- Modify: `src/pages/players/[id].astro` (add JSON-LD)

**Interfaces:**
- Consumes: `SkipLink.astro`, `accessibility.css`, `print.css`, `KeyboardShortcutsModal.astro`, `ShareButtons.astro` (from prior tasks)

- [ ] **Step 1: Modify Main.astro — add SkipLink, stylesheets, and shortcuts modal**

In `src/layouts/Main.astro`, add imports:

```astro
import SkipLink from "@/components/features/ux/SkipLink.astro";
import KeyboardShortcutsModal from "@/components/features/ux/KeyboardShortcutsModal.astro";
import "@styles/accessibility.css";
import "@styles/print.css";
```

Add `<SkipLink />` as first child of `<body>`:

```astro
  <body class="bg-base-300 flex min-h-dvh flex-col">
    <SkipLink />
    <Header />
```

Add `<KeyboardShortcutsModal client:load />` after `<ToastContainer />` and before `</body>`:

```astro
    <ToastContainer toastType={toastType} toastMessage={toastMessage} />
    <KeyboardShortcutsModal client:load />
    <Footer />
```

In `src/styles/accessibility.css`, ensure the `sr-only` class matches DaisyUI/Tailwind expectations. In `src/styles/print.css`, ensure `@media print` overrides don't break screen layouts.

- [ ] **Step 2: Modify players/[id].astro — add JSON-LD structured data**

In `src/pages/players/[id].astro`, add after the frontmatter computations (before `<Main>` tag):

```astro
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.nickname,
    memberOf: {
      "@type": "SportsTeam",
      name: "Solo Gente Súper Comprometida F.C.",
      url: "https://sgsc.vercel.app",
    },
    description: `${player.nickname} — ${player.points} puntos, ${player.matches_played} partidos, ${player.wins} victorias. Efectividad: ${win_pct}%.`,
  };
```

Add inside `<Main>` but before the banner div:

```astro
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 3: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Main.astro src/pages/players/[id].astro src/styles/accessibility.css src/styles/print.css
git commit -m "feat: integrate SkipLink, shortcuts, print styles, and SEO JSON-LD"
```

---

### Task 5: ShareButtons Integration on Player/Match/Ranking Pages

**Files:**
- Modify: `src/pages/players/[id].astro` (add ShareButtons near banner)
- Modify: `src/pages/ranking.astro` (add ShareButtons near Title)

**Interfaces:**
- Consumes: `ShareButtons.astro` (Task 2)

- [ ] **Step 1: Add ShareButtons to player detail**

In `src/pages/players/[id].astro`, add import:

```astro
import ShareButtons from "@/components/features/ux/ShareButtons.astro";
```

Add after the banner card (after the `</div>` closing the banner):

```astro
  <div class="flex justify-end mb-4">
    <ShareButtons
      url={`https://sgsc.vercel.app/players/${id}`}
      text={`Mira las estadísticas de ${player.nickname} en SGSC`}
      client:load
    />
  </div>
```

- [ ] **Step 2: Add ShareButtons to ranking page**

In `src/pages/ranking.astro`, add import:

```astro
import ShareButtons from "@/components/features/ux/ShareButtons.astro";
```

Add after `<Title>`:

```astro
  <div class="flex justify-end mb-4">
    <ShareButtons
      url={`https://sgsc.vercel.app${Astro.url.pathname}${Astro.url.search}`}
      text="Tabla de posiciones SGSC"
      client:load
    />
  </div>
```

- [ ] **Step 3: Verify it builds**

Run: `npx astro check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/players/[id].astro src/pages/ranking.astro
git commit -m "feat: add ShareButtons to player detail and ranking pages"
```

---

## Self-Review Checklist

- [ ] Spec coverage: Phase 3 requirements (skip link, focus, share, shortcuts, print, SEO) all have tasks
- [ ] No placeholders
- [ ] Type consistency: `buildShareUrl`, `copyToClipboard` signatures match across tasks
- [ ] Islands minimized (only ShareButtons, KeyboardShortcutsModal use `client:load`)
- [ ] DaisyUI tokens only
