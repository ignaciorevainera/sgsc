# Task 9: Versus Page — Player Search Autocomplete

**Files:**
- Modify: `src/pages/compare.astro`

**Interfaces:**
- Consumes: nothing new (existing player list, h2h logic unchanged)
- Produces: updated `/compare` page where `<select>` dropdowns are replaced with `<input list="players-datalist">` + `<datalist>` for searchable autocomplete

## Steps

1. Read existing `src/pages/compare.astro` (431 lines)
2. Apply these specific changes:
   - Replace both `<select>` elements with `<input list="players-datalist">`
   - Add a shared `<datalist id="players-datalist">` populated from `players` array
   - Add search icons inside both inputs
   - Rewrite the inline `<script>` to:
     - Use `getPlayerId(nickname)` to match nickname → UUID via datalist `data-id` attributes
     - Map nickname to ID on "Comparar" button click
     - Enable/disable button based on whether both nicknames resolve to valid IDs
3. Verify build
4. Commit

## Changes Summary

**Replace Player 1 select** (lines 173-188) with:
```html
                <div class="relative">
                  <Icon name="material-symbols:search" class="text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                  <input id="p1-select" name="p1" type="text" list="players-datalist" value={p1Stats?.nickname || ""} placeholder="Elegir jugador..." class="select w-full rounded-xl pl-10 pr-4" autocomplete="off" aria-label="Buscar jugador 1" />
                </div>
```

**Replace Player 2 select** (lines 204-216) with:
```html
                <div class="relative">
                  <Icon name="material-symbols:search" class="text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                  <input id="p2-select" name="p2" type="text" list="players-datalist" value={p2Stats?.nickname || ""} placeholder="Elegir jugador..." class="select w-full rounded-xl pl-10 pr-4" autocomplete="off" aria-label="Buscar jugador 2" />
                </div>
```

**Add datalist** after both inputs (before the bot�n comparar):
```html
              <datalist id="players-datalist">
                {players?.map((p) => (
                  <option value={p.nickname} data-id={p.id} />
                ))}
              </datalist>
```

**Replace the script** (lines 394-431) with:
```html
<script is:inline>
  const input1 = document.getElementById("p1-select") as HTMLInputElement | null;
  const input2 = document.getElementById("p2-select") as HTMLInputElement | null;
  const btn = document.getElementById("btn-compare") as HTMLButtonElement | null;
  const datalist = document.getElementById("players-datalist") as HTMLDataListElement | null;

  function getPlayerId(nickname: string): string | null {
    if (!datalist) return null;
    const options = datalist.querySelectorAll("option");
    for (const opt of options) {
      if (opt.value.toLowerCase() === nickname.toLowerCase()) {
        return opt.getAttribute("data-id");
      }
    }
    return null;
  }

  function checkValidity() {
    if (!input1 || !input2 || !btn) return;
    const v1 = input1.value.trim();
    const v2 = input2.value.trim();
    const id1 = getPlayerId(v1);
    const id2 = getPlayerId(v2);
    if (id1 && id2 && id1 !== id2) {
      btn.removeAttribute("disabled");
      btn.classList.remove("btn-disabled");
    } else {
      btn.setAttribute("disabled", "true");
      btn.classList.add("btn-disabled");
    }
  }

  input1?.addEventListener("input", checkValidity);
  input2?.addEventListener("input", checkValidity);

  if (btn) {
    btn.addEventListener("click", function () {
      if (!input1 || !input2) return;
      const id1 = getPlayerId(input1.value.trim());
      const id2 = getPlayerId(input2.value.trim());
      if (id1 && id2) {
        const url = new URL(window.location.href);
        url.searchParams.set("p1", id1);
        url.searchParams.set("p2", id2);
        window.location.href = url.toString();
      }
    });
  }

  checkValidity();
</script>
```

**Note:** When page loads with `?p1=uuid&p2=uuid` in URL, the frontmatter already resolves nicknames via `basicInfo` query. The `value={p1Stats?.nickname || ""}` correctly shows the cached nickname.

## Commit Message

```
feat: replace compare selects with searchable autocomplete inputs
```
