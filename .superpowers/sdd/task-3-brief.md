# Task 3: FilterBar Component

**Files:**
- Create: `src/components/features/ux/FilterBar.astro`

**Interfaces:**
- Consumes: `src/lib/ux/filters.ts` (setFilter, clearFilters from Task 1)
- Produces: `<FilterBar />` — reusable filter container with controls and clear button
- Props:
  - `hasActiveFilters: boolean` — computed by caller to show/hide clear button
  - `clearUrl?: string` — URL to navigate to when "Clear filters" clicked
  - Slot for filter controls

## Steps

1. Create the FilterBar component
2. Verify it builds with `npx astro check`
3. Commit

## Implementation Code

```astro
---
// src/components/features/ux/FilterBar.astro
import { Icon } from "astro-icon/components";

interface Props {
  hasActiveFilters: boolean;
  clearUrl?: string;
}

const { hasActiveFilters, clearUrl } = Astro.props;
---

<div class="bg-base-100 border-base-200 mb-6 flex flex-col gap-3 rounded-xl border p-4 shadow-md">
  <div class="flex flex-wrap items-end gap-4">
    <slot />
  </div>

  {
    hasActiveFilters && clearUrl && (
      <div class="border-base-200 flex justify-end border-t pt-3">
        <a href={clearUrl} class="btn btn-ghost btn-sm gap-2 rounded-xl">
          <Icon name="material-symbols:filter-list-off" size={18} aria-hidden="true" />
          Limpiar filtros
        </a>
      </div>
    )
  }
</div>
```

## Commit Message

```
feat(ux): add FilterBar reusable component
```
