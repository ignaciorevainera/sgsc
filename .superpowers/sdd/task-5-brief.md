# Task 5: Players Page — Search, Sort, Active Filter

**Files:**
- Modify: `src/pages/players/index.astro`

**Interfaces:**
- Consumes: `src/lib/ux/types.ts` (PlayerFilters), `src/lib/ux/filters.ts` (getFilters, clearFilters), `src/components/features/ux/FilterBar.astro`
- Produces: updated `/players` page with search, sort, active filter

## Steps

1. Read the existing `src/pages/players/index.astro` file to understand current structure
2. Modify the file per the code below
3. Verify it builds (`npx astro check`)
4. Commit

## Changes Summary

Replace `src/pages/players/index.astro` with the following content.

Key changes:
- Add `FilterBar`, `PlayerFilters`, `getFilters`, `clearFilters` imports
- Read `search`, `sort`, `active` URL params with defaults
- Filter players client-side by `filters.search` (case-insensitive nickname match)
- Sort players by `filters.sort` (name/points/wins/matches)
- Render `FilterBar` with search input, sort select, active toggle
- Show contextual empty state ("No se encontraron jugadores que coincidan con...")
- Navigate via URL params on input/change (debounced search: 300ms)

## Implementation

```astro
---
// src/pages/players/index.astro
Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

import { Icon } from "astro-icon/components";
import { supabase } from "@/lib/supabase";
import { getFilters, clearFilters } from "@/lib/ux/filters";
import type { PlayerFilters } from "@/lib/ux/types";
import Alert from "@/components/shared/Alert.astro";
import FilterBar from "@/components/features/ux/FilterBar.astro";
import Main from "@/layouts/Main.astro";
import PlayerCard from "@/components/players/PlayerCard.astro";
import Title from "@/components/shared/Title.astro";

const filters = getFilters<PlayerFilters>(Astro.url, {
  defaults: { search: "", sort: "name", active: false },
});

const { data: players, error } = await supabase
  .from("view_player_stats_all_time")
  .select("player_id, nickname, matches_played, wins, points")
  .eq("is_guest", false)
  .order("nickname", { ascending: true });

let filtered = players || [];

if (filters.search) {
  const q = filters.search.toLowerCase();
  filtered = filtered.filter((p) => p.nickname.toLowerCase().includes(q));
}

const sortBy = filters.sort;
if (sortBy !== "name") {
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "points": return (b.points || 0) - (a.points || 0);
      case "wins": return (b.wins || 0) - (a.wins || 0);
      case "matches": return (b.matches_played || 0) - (a.matches_played || 0);
      default: return 0;
    }
  });
}

const hasError = !!error;
const hasPlayers = !hasError && filtered.length > 0;

const hasActiveFilters = filters.search !== "" || filters.sort !== "name" || filters.active;
const clearUrl = clearFilters(Astro.url, ["search", "sort", "active"]).pathname + clearFilters(Astro.url, ["search", "sort", "active"]).search;
---

<Main title="Plantel | SGSC">
  <Title
    title="Plantel"
    subtitle="¡Haz click en cualquier jugador para conocer todas sus estadísticas!"
  />

  <FilterBar hasActiveFilters={hasActiveFilters} clearUrl={clearUrl}>
    <div class="form-control">
      <label for="search" class="label py-1">
        <span class="label-text text-base-content/60 text-xs font-bold uppercase">Buscar</span>
      </label>
      <div class="relative">
        <Icon
          name="material-symbols:search"
          class="text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2"
          size={18}
          aria-hidden="true"
        />
        <input
          id="search"
          name="search"
          type="text"
          value={filters.search}
          placeholder="Nombre o apodo..."
          class="input input-bordered input-sm md:input-md w-full rounded-xl pl-10"
          aria-label="Buscar jugador por nombre o apodo"
        />
      </div>
    </div>

    <div class="form-control">
      <label for="sort" class="label py-1">
        <span class="label-text text-base-content/60 text-xs font-bold uppercase">Ordenar por</span>
      </label>
      <select
        id="sort"
        name="sort"
        class="select select-bordered select-sm md:select-md w-full rounded-xl"
        aria-label="Ordenar jugadores"
      >
        <option value="name" selected={filters.sort === "name"}>Nombre</option>
        <option value="points" selected={filters.sort === "points"}>Puntos</option>
        <option value="wins" selected={filters.sort === "wins"}>Victorias</option>
        <option value="matches" selected={filters.sort === "matches"}>Partidos</option>
      </select>
    </div>

    <div class="form-control">
      <label class="label cursor-pointer justify-start gap-3 p-0 py-1">
        <span class="label-text text-base-content/60 text-xs font-bold uppercase">Solo activos</span>
        <input
          id="active"
          name="active"
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          checked={filters.active}
          value="true"
        />
      </label>
    </div>
  </FilterBar>

  {
    hasError && (
      <Alert
        type="error"
        message="No se pudo conectar con el servidor. Por favor, intenta más tarde."
      />
    )
  }

  {
    !hasError && !hasPlayers && (
      <Alert
        type="warning"
        message={
          filters.search
            ? `No se encontraron jugadores que coincidan con "${filters.search}".`
            : "No hay jugadores registrados en el sistema."
        }
      />
    )
  }

  {
    hasPlayers && (
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((player) => (
          <PlayerCard player={player} />
        ))}
      </div>
    )
  }
</Main>

<script>
  const s = document.getElementById("search") as HTMLInputElement | null;
  const o = document.getElementById("sort") as HTMLSelectElement | null;
  const a = document.getElementById("active") as HTMLInputElement | null;

  const update = () => {
    const url = new URL(window.location.href);
    if (s && s.value) url.searchParams.set("search", s.value);
    else url.searchParams.delete("search");
    if (o && o.value && o.value !== "name") url.searchParams.set("sort", o.value);
    else url.searchParams.delete("sort");
    if (a && a.checked) url.searchParams.set("active", "true");
    else url.searchParams.delete("active");
    window.location.href = url.toString();
  };

  let debounceTimer: ReturnType<typeof setTimeout>;
  s?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, 300);
  });
  o?.addEventListener("change", update);
  a?.addEventListener("change", update);
</script>
```

## Commit Message

```
feat: add search, sort, and active filter to players page
```
