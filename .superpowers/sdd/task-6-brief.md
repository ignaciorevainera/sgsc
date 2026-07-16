# Task 6: Fix admin/matches/edit/[id].astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/matches/edit/[id].astro`

**Context:** Task 2 made Main accept toast props. This task replaces Alert in the match edit page with redirect-based toasts.

## Steps

### Step 1: Remove Alert import

Remove the line:
```astro
import Alert from "@/components/shared/Alert.astro";
```

### Step 2: Change success redirect param

Find the line:
```astro
return Astro.redirect(`/admin/matches/edit/${id}?success=true`);
```
Replace with:
```astro
return Astro.redirect(`/admin/matches/edit/${id}?toast=success&msg=Partido+actualizado+correctamente`);
```

### Step 3: Remove inline Alert blocks

In the template, remove these Alert blocks:
```astro
  {
    showSuccess && (
      <div class="mb-6 flex flex-col gap-2">
        <Alert type="success" message="¡Partido actualizado correctamente!" />
        <a href="/admin/matches" class="btn btn-ghost btn-sm w-full rounded-xl sm:w-fit">
          <Icon name="material-symbols:arrow-back" size={18} />
          Volver al historial
        </a>
      </div>
    )
  }
  {errorMessage && <Alert type="error" message={errorMessage} class="mb-6" />}
```

### Step 4: Remove showSuccess variable

Remove the line:
```astro
const showSuccess = Astro.url.searchParams.get("success") === "true";
```

### Step 5: Update Main props

Replace `<Main title="Editar Partido | SGSC" contentWidth="admin">` with:
```astro
<Main
  title="Editar Partido | SGSC"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

### Step 6: Build

Run: `npm run build`
Expected: `Complete!`

### Step 7: Commit

```bash
git add src/pages/admin/matches/edit/[id].astro
git commit -m "fix: replace Alert with toast in match edit page"
```

## Report

Write to `.superpowers/sdd/task-6-report.md` with status, commits, build result, concerns.
