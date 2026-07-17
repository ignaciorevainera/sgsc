# Task 11: Integrate Search Command Palette into Layout

**Files:**
- Modify: `src/layouts/Main.astro`
- Modify: `src/components/shared/Header.astro`

**Interfaces:**
- Consumes: `src/components/features/ux/SearchCommandPalette.astro`, `src/lib/ux/search.ts` (buildSearchIndex)
- Produces: global search available on all pages via Cmd+K and Header search button

## Steps

1. Read `src/layouts/Main.astro`
2. Read `src/components/shared/Header.astro`
3. Apply changes to both
4. Verify build
5. Commit

## Main.astro Changes

**Add imports** (after existing imports):
```astro
import { supabase } from "@/lib/supabase";
import { buildSearchIndex } from "@/lib/ux/search";
import SearchCommandPalette from "@/components/features/ux/SearchCommandPalette.astro";
```

**Add search index build** (after `mainWidthClass` computation, around line 35):
```astro
const { data: searchPlayers } = await supabase
  .from("view_player_stats_all_time")
  .select("player_id, nickname, matches_played")
  .eq("is_guest", false)
  .order("nickname");

const { data: searchMatchFields } = await supabase
  .from("matches")
  .select("id, date, fields(name)")
  .order("date", { ascending: false })
  .limit(50);

const { data: searchFields } = await supabase
  .from("fields")
  .select("id, name, city")
  .order("name");

const searchIndex = buildSearchIndex(
  (searchPlayers || []).map((p: any) => ({
    id: p.player_id,
    nickname: p.nickname,
    matches_played: p.matches_played,
  })),
  (searchMatchFields || []).map((m: any) => ({
    id: m.id,
    date: m.date,
    field: Array.isArray(m.fields) ? m.fields[0]?.name : m.fields?.name,
  })),
  (searchFields || []) as any,
);
```

**Render SearchCommandPalette** (in `<body>`, after `<Header />`):
```astro
    <Header />
    <SearchCommandPalette items={searchIndex} client:load />
```

## Header.astro Changes

**Add search trigger button** in the `navbar-end` div (before the theme toggle or admin button). Add this before the theme toggle `<label>`:

```astro
    <button
      type="button"
      class="btn btn-ghost btn-circle"
      aria-label="Buscar (Ctrl+K)"
      id="header-search-btn"
      title="Buscar (Ctrl+K)"
    >
      <Icon name="material-symbols:search" size={22} aria-hidden="true" />
    </button>
```

The SearchCommandPalette component in Main.astro renders the modal dialog with id="search-modal". The trigger button in Header needs to open it. Since Header's script is separate from Main's, use an inline onclick or add a listener in Header's script:

**Add to Header's existing `<script>`** block (after the theme toggle handler):
```astro
  document.getElementById("header-search-btn")?.addEventListener("click", () => {
    (document.getElementById("search-modal") as HTMLDialogElement)?.showModal();
    setTimeout(() => {
      (document.getElementById("search-input") as HTMLInputElement)?.focus();
    }, 100);
  });
```

## Commit Message

```
feat: integrate global search command palette into layout
```
