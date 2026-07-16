# Task 5: Fix admin/matches/create.astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/matches/create.astro`

**Context:** Task 2 made Main layout accept toast props. This task replaces the inline `<Alert>` usage with redirect-based toasts.

## Steps

### Step 1: Remove Alert import

Remove the line:
```astro
import Alert from "@/components/shared/Alert.astro";
```

### Step 2: Replace POST handler

Current POST handler uses `successMessage` variable and shows Alert in template. Replace the entire POST logic block with:

```astro
let errorMessage = "";

if (Astro.request.method === "POST") {
  try {
    const formData = await Astro.request.formData();
    const date = formData.get("date")?.toString() || "";
    const field_id = formData.get("field_id")?.toString() || "";
    const result = formData.get("result")?.toString() || "";

    const lightPlayers: string[] = [];
    const darkPlayers: string[] = [];

    players?.forEach((p) => {
      const selection = formData.get(`player_${p.id}`);
      if (selection === "light") lightPlayers.push(p.id);
      if (selection === "dark") darkPlayers.push(p.id);
    });

    if (!date || !field_id || !result)
      throw new Error("Faltan datos obligatorios");
    if (lightPlayers.length === 0 || darkPlayers.length === 0)
      throw new Error("Equipos incompletos");

    const { error } = await supabase.rpc("create_complete_match", {
      p_date: date,
      p_field_id: field_id,
      p_result: result,
      p_light_players: lightPlayers,
      p_dark_players: darkPlayers,
    });

    if (error) throw error;
    return Astro.redirect("/admin/matches?toast=success&msg=Partido+registrado+con+exito");
  } catch (err: any) {
    errorMessage = err.message;
  }
}
```

### Step 3: Remove Alert blocks in template

Remove these blocks from the template:
```astro
  {/* Alertas */}
  {
    successMessage && (
      <Alert type="success" message={successMessage} class="mb-6" />
    )
  }

  {errorMessage && <Alert type="error" message={errorMessage} class="mb-6" />}
```

### Step 4: Update Main props

Replace `<Main title="Cargar Partido | SGSC" contentWidth="admin">` with:
```astro
<Main
  title="Cargar Partido | SGSC"
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
git add src/pages/admin/matches/create.astro
git commit -m "fix: replace Alert with toast in match create page"
```

## Report

Write to `.superpowers/sdd/task-5-report.md` with status, commits, build result, concerns.
