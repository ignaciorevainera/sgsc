# Task 4: Pagination Component

**Files:**
- Create: `src/components/features/ux/Pagination.astro`

**Interfaces:**
- Consumes: `src/lib/ux/filters.ts` (setFilter from Task 1)
- Produces: `<Pagination />` — reusable page navigation with DaisyUI `join`
- Props:
  - `currentPage: number`
  - `totalPages: number`
  - `currentUrl: URL`

## Steps

1. Create the Pagination component
2. Verify it builds with `npx astro check`
3. Commit

## Implementation Code

```astro
---
// src/components/features/ux/Pagination.astro
import { Icon } from "astro-icon/components";
import { setFilter } from "@/lib/ux/filters";

interface Props {
  currentPage: number;
  totalPages: number;
  currentUrl: URL;
}

const { currentPage, totalPages, currentUrl } = Astro.props;

function buildPageUrl(page: number): string {
  const url = setFilter(currentUrl, "page", page === 1 ? undefined : page);
  return url.pathname + url.search;
}

if (totalPages <= 1) {
  return new Response(null);
}
---

<div class="mt-6 flex items-center justify-center gap-2">
  <a
    href={currentPage > 1 ? buildPageUrl(currentPage - 1) : undefined}
    class={`btn btn-ghost btn-sm rounded-xl ${currentPage <= 1 ? "btn-disabled" : ""}`}
    aria-label="Página anterior"
  >
    <Icon name="material-symbols:chevron-left" size={20} aria-hidden="true" />
  </a>

  <div class="join rounded-xl">
    {
      Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          const distance = Math.abs(page - currentPage);
          return page === 1 || page === totalPages || distance <= 1;
        })
        .map((page, idx, arr) => {
          const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
          return (
            <>
              {showEllipsis && (
                <span class="join-item btn btn-ghost btn-sm btn-disabled pointer-events-none">...</span>
              )}
              <a
                href={buildPageUrl(page)}
                class={`join-item btn btn-sm ${page === currentPage ? "btn-primary" : "btn-ghost"}`}
              >
                {page}
              </a>
            </>
          );
        })
    }
  </div>

  <a
    href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : undefined}
    class={`btn btn-ghost btn-sm rounded-xl ${currentPage >= totalPages ? "btn-disabled" : ""}`}
    aria-label="Página siguiente"
  >
    <Icon name="material-symbols:chevron-right" size={20} aria-hidden="true" />
  </a>
</div>
```

## Commit Message

```
feat(ux): add Pagination component with DaisyUI join
```
