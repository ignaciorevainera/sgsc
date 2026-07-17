# Task 10: Search Command Palette Component

**Files:**
- Create: `src/components/features/ux/SearchCommandPalette.astro`

**Interfaces:**
- Consumes: `src/lib/ux/search.ts` (SearchItem type — used in Astro frontmatter types)
- Produces: `<SearchCommandPalette />` — client island with Cmd+K/Ctrl+K trigger, DaisyUI modal
- Props:
  - `items: SearchItem[]` — pre-built search index (passed server-side, used client-side via JSON)

## Steps

1. Create the component
2. Verify build
3. Commit

## Implementation

```astro
---
import { Icon } from "astro-icon/components";
import type { SearchItem } from "@/lib/ux/search";

interface Props {
  items: SearchItem[];
}

const { items } = Astro.props;
const serializedItems = JSON.stringify(items);
---

<button
  id="search-trigger"
  type="button"
  class="btn btn-ghost btn-circle"
  aria-label="Buscar (Ctrl+K)"
  title="Buscar (Ctrl+K)"
>
  <Icon name="material-symbols:search" size={22} aria-hidden="true" />
</button>

<dialog id="search-modal" class="modal">
  <div class="modal-box w-full max-w-lg p-0">
    <div class="flex items-center gap-3 border-b border-base-200 px-4 py-3">
      <Icon
        name="material-symbols:search"
        class="text-base-content/40 shrink-0"
        size={22}
        aria-hidden="true"
      />
      <input
        id="search-input"
        type="text"
        placeholder="Buscar jugadores, partidos, canchas..."
        class="w-full bg-transparent text-base outline-none"
        autocomplete="off"
        aria-label="Buscar en SGSC"
      />
      <kbd class="kbd kbd-sm text-base-content/40">Esc</kbd>
    </div>
    <div id="search-results" class="max-h-80 overflow-y-auto p-2"></div>
    <div id="search-empty" class="hidden p-8 text-center">
      <Icon
        name="material-symbols:search-off"
        class="text-base-content/20 mx-auto mb-2"
        size={40}
        aria-hidden="true"
      />
      <p class="text-base-content/60 text-sm">Sin resultados</p>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<script>
  const items: import("@/lib/ux/search").SearchItem[] = {serializedItems};

  function fuzzyMatch(query: string, target: string): boolean {
    if (!query) return true;
    return target.toLowerCase().includes(query.toLowerCase());
  }

  const modal = document.getElementById("search-modal") as HTMLDialogElement | null;
  const trigger = document.getElementById("search-trigger") as HTMLButtonElement | null;
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const resultsDiv = document.getElementById("search-results") as HTMLElement | null;
  const empty = document.getElementById("search-empty") as HTMLElement | null;

  function renderResults(query: string) {
    if (!resultsDiv || !empty) return;

    if (!query) {
      resultsDiv.innerHTML = '<div class="px-4 py-6 text-center text-sm text-base-content/40">Escribe para buscar...</div>';
      empty.classList.add("hidden");
      return;
    }

    const q = query.toLowerCase();
    const grouped = new Map<string, import("@/lib/ux/search").SearchItem[]>();

    for (const item of items) {
      if (fuzzyMatch(query, item.label) || fuzzyMatch(query, item.subtitle)) {
        const group = grouped.get(item.type) || [];
        group.push(item);
        grouped.set(item.type, group);
      }
    }

    const found: import("@/lib/ux/search").SearchItem[] = [];
    for (const [, groupItems] of grouped) {
      for (const item of groupItems.slice(0, 5)) {
        found.push(item);
      }
    }

    if (found.length === 0) {
      resultsDiv.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");

    const typeLabels: Record<string, string> = {
      player: "Jugadores",
      match: "Partidos",
      field: "Canchas",
    };

    let html = "";
    for (const [type, typeItems] of grouped) {
      html += `<div class="text-base-content/40 px-2 py-1 text-xs font-bold uppercase">${typeLabels[type] || type}</div>`;
      for (const item of typeItems.slice(0, 5)) {
        html += `
          <a href="${item.href}" class="hover:bg-base-200 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors">
            <div class="bg-base-200 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span class="text-base-content/60 text-xs font-bold">${item.label.charAt(0).toUpperCase()}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">${item.label}</div>
              <div class="text-base-content/60 truncate text-xs">${item.subtitle}</div>
            </div>
          </a>
        `;
      }
    }

    resultsDiv.innerHTML = html;
  }

  trigger?.addEventListener("click", () => {
    modal?.showModal();
    setTimeout(() => input?.focus(), 100);
  });

  input?.addEventListener("input", () => {
    renderResults(input?.value || "");
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      modal?.showModal();
      setTimeout(() => {
        input?.focus();
        if (input) input.value = "";
        renderResults("");
      }, 100);
    }
    if (e.key === "Escape" && modal?.open) {
      modal.close();
    }
  });

  modal?.addEventListener("close", () => {
    if (input) input.value = "";
    renderResults("");
  });
</script>
```

## Commit Message

```
feat(ux): add SearchCommandPalette component
```

Note: In Astro, `{serializedItems}` in a `<script>` block renders the variable content directly as a JS expression. Since `serializedItems` is already a valid JSON array string (e.g. `[{"id":"1"}]`), `const items = {serializedItems};` produces `const items = [{"id":"1"}];` which is a valid JS array literal.
