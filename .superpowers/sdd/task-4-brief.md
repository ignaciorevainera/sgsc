# Task 4: Fix admin/players/edit/[id].astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/players/edit/[id].astro`

**Context:** Task 2 made Main layout accept toast props. This task replaces the inline `<Alert>` usage in the player edit page with redirect-based toasts following the PRG pattern.

## Steps

### Step 1: Remove Alert import

Remove the line:
```astro
import Alert from "@/components/shared/Alert.astro";
```
(It may not exist — check the current file. If not present, skip.)

### Step 2: Replace POST handler

The current POST handler uses `return Astro.redirect(\`/admin/players/edit/${id}?success=true\`)` and `return new Response("Error interno", { status: 500 })`.

Replace the POST handler with:
```astro
let errorMessage = "";

if (Astro.request.method === "POST") {
  const formData = await Astro.request.formData();
  const action = formData.get("action");

  let error = null;

  if (action === "toggle_status") {
    const newStatus = !player.is_active;
    const { error: updateError } = await supabase
      .from("players")
      .update({ is_active: newStatus })
      .eq("id", id);
    error = updateError;
  } else {
    const playerInput = parsePlayerFormData(formData);
    const { error: updateError } = await supabase
      .from("players")
      .update({ ...playerInput })
      .eq("id", id);
    error = updateError;
  }

  if (error) {
    errorMessage = error.message;
  } else {
    const msg = action === "toggle_status"
      ? "Estado+actualizado+correctamente"
      : "Jugador+actualizado+correctamente";
    return Astro.redirect(`/admin/players/edit/${id}?toast=success&msg=${msg}`);
  }
}
```

### Step 3: Remove inline success alert block

In the template, remove this block if present:
```astro
{
  Astro.url.searchParams.get("success") && (
    <Alert type="success" message="Cambios guardados correctamente." class="mb-4" />
  )
}
```
(ToastContainer in Main reads `?toast=success&msg=...` from URL instead.)

### Step 4: Update Main toast props

Replace `<Main title="Editar Jugador"` opening tag with:
```astro
<Main
  title="Editar Jugador"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

### Step 5: Build

Run: `npm run build`
Expected: `Complete!`

### Step 6: Commit

```bash
git add src/pages/admin/players/edit/[id].astro
git commit -m "fix: replace Alert with toast in player edit page"
```

## Report

Write to `.superpowers/sdd/task-4-report.md` with status, commits, build result, concerns.
