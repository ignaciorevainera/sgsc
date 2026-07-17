# Task 7: Ranking Page — Min Matches Filter

**Files:**
- Modify: `src/pages/ranking.astro`

**Interfaces:**
- Consumes: `src/lib/ux/filters.ts` (clearFilters), `src/components/features/ux/FilterBar.astro`
- Produces: updated `/ranking` page with min matches filter input

## Steps

1. Read existing `src/pages/ranking.astro`
2. Add these changes:
   - Import `clearFilters` from `@/lib/ux/filters`
   - Read `min_matches` URL param (default 0)
   - Add `min_matches` number input in the filter toolbar
   - Filter players client-side before sorting
   - Update script to include `min_matches` with 500ms debounce
3. Verify build
4. Commit

## Changes Detail

**Add imports** (after existing imports, around line 9):
```astro
import { clearFilters } from "@/lib/ux/filters";
```

**Add min_matches param** (after `mode` line, around line 30):
```astro
const minMatches = Number(Astro.url.searchParams.get("min_matches")) || 0;
```

**Add filter logic** (after the players map block, before sortedPlayers, around line 94):
```astro
const minFilteredPlayers = minMatches > 0
  ? players.filter((p) => p.matches_played >= minMatches)
  : players;
```

**Update sortedPlayers** to use `minFilteredPlayers`:
```astro
const sortedPlayers = [...minFilteredPlayers].sort((a, b) => {
```

**Add input in template** (after mode toggle section, before the `</div>` that closes filter container):
```astro
    <div class="divider m-0 sm:hidden"></div>

    <div class="form-control w-full">
      <label for="min_matches" class="label py-1">
        <span class="label-text text-base-content/60 text-xs font-bold uppercase">Mín. Partidos</span>
      </label>
      <input
        id="min_matches"
        name="min_matches"
        type="number"
        min="0"
        max="50"
        value={minMatches || ""}
        placeholder="Sin mínimo"
        class="input input-bordered input-sm md:input-md w-full rounded-xl"
        aria-label="Filtrar por mínimo de partidos jugados"
      />
    </div>
```

**Update script block** (add min_matches handling):
```astro
  const mm = document.getElementById("min_matches") as HTMLInputElement;

  let debounceTimer: ReturnType<typeof setTimeout>;
  mm?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, 500);
  });
```

And add to the existing `update()` function:
```astro
    if (mm && mm.value) url.searchParams.set("min_matches", mm.value);
    else url.searchParams.delete("min_matches");
```

## Commit Message

```
feat: add min matches filter to ranking page
```
