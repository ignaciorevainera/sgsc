# Toast Notification System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static `<Alert>` components with animated DaisyUI toast notifications across all admin CRUD operations (create, edit, delete/toggle). Toast uses slide-in animation, auto-dismiss after 5s, and click-to-dismiss.

**Architecture:** `ToastContainer.astro` renders fixed-position toasts via DaisyUI `toast toast-top toast-end` + `alert` classes. Two trigger modes: (1) URL query params `?toast=success&msg=...` for cross-page redirects, (2) Astro props forwarded through `Main.astro` layout for same-page error feedback. Client-side JS animates slide-in, auto-dismiss, and cleans URL params from history.

**Tech Stack:** DaisyUI 5 (`toast`, `alert-*` classes), vanilla JS, Astro redirects, CSS `@keyframes`.

## Global Constraints

- No inline styles — use DaisyUI semantic tokens and CSS class-based animations
- Keep existing `Alert.astro` for public pages (login, ranking, etc.) — only replace in admin pages
- Icons: `material-symbols` via `astro-icon`
- Post-Redirect-Get (PRG) for success redirects
- Same-page re-render for errors (preserve form data)
- URL param key names: `toast` (type), `msg` (message)
- Destroyed `Alert` usage in admin: `create.astro` (players + matches), `edit/[id].astro` (players + matches)

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/components/shared/ToastContainer.astro` | Create | Toast container + CSS animation + JS auto-dismiss |
| `src/layouts/Main.astro` | Modify | Accept `toastType`/`toastMessage` props, render `<ToastContainer>` |
| `src/pages/admin/players/create.astro` | Modify | Error toast on same page, success redirect with `?toast=success&msg=...`, pre-fill form on error |
| `src/pages/admin/players/edit/[id].astro` | Modify | Replace `<Alert>` with toast redirects on save/toggle |
| `src/pages/admin/matches/create.astro` | Modify | Replace `<Alert>` with error toast props on same page, success redirect |
| `src/pages/admin/matches/edit/[id].astro` | Modify | Replace `<Alert>` with error toast props on same page, success redirect |

---

### Task 1: Create ToastContainer.astro

**Files:**
- Create: `src/components/shared/ToastContainer.astro`

**Interfaces:**
- Consumes: `Astro.url.searchParams` (for cross-page `?toast=` and `?msg=`), `Astro.props` (for same-page `toastType`, `toastMessage`)
- Produces: `<ToastContainer toastType="error" toastMessage="Mensaje" />` or auto-detects from URL

- [ ] **Step 1: Write the component file**

Create `src/components/shared/ToastContainer.astro`:

```astro
---
import { Icon } from "astro-icon/components";

interface Props {
  toastType?: "success" | "error" | "warning" | "info";
  toastMessage?: string;
}

const urlType = Astro.url.searchParams.get("toast") as Props["toastType"];
const urlMessage = Astro.url.searchParams.get("msg");

const type = Astro.props.toastType || urlType;
const message = Astro.props.toastMessage || urlMessage;
const show = type && message;

const icons: Record<string, string> = {
  success: "material-symbols:check-circle",
  error: "material-symbols:error",
  warning: "material-symbols:warning",
  info: "material-symbols:info",
};
---

{show && (
  <div
    id="toast-container"
    class="toast toast-top toast-end pointer-events-none fixed z-[9999]"
  >
    <div
      role="alert"
      class={`toast-item alert alert-${type} pointer-events-auto cursor-pointer rounded-xl shadow-lg`}
      onclick="this.remove()"
    >
      <Icon name={icons[type!]} size={24} />
      <span>{message}</span>
    </div>
  </div>
)}

<script>
  const toastItem = document.querySelector(".toast-item");
  if (toastItem) {
    setTimeout(() => {
      toastItem.classList.add("toast-out");
      setTimeout(() => toastItem.remove(), 300);
    }, 5000);
  }

  const url = new URL(window.location.href);
  if (url.searchParams.has("toast")) {
    url.searchParams.delete("toast");
    url.searchParams.delete("msg");
    window.history.replaceState({}, "", url.toString());
  }
</script>

<style>
  @keyframes toast-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes toast-out {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .toast-item {
    animation: toast-in 0.3s ease-out;
  }
  .toast-out {
    animation: toast-out 0.3s ease-in forwards;
  }
</style>
```

- [ ] **Step 2: Verify file created**

Run: `Get-ChildItem -Path "src/components/shared/ToastContainer.astro"`

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ToastContainer.astro
git commit -m "feat: add ToastContainer with slide animation and auto-dismiss"
```

---

### Task 2: Add ToastContainer to Main.astro layout

**Files:**
- Modify: `src/layouts/Main.astro`

**Interfaces:**
- Consumes: `ToastContainer` component (from Task 1)
- Produces: `Main.astro` now accepts optional `toastType` and `toastMessage` props, forwards them to `<ToastContainer>`

**Current Main.astro frontmatter (lines 1-31):**

```astro
---
import "@styles/global.css";
import Analytics from "@vercel/analytics/astro";
import Footer from "@/components/shared/Footer.astro";
import Header from "@/components/shared/Header.astro";

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  contentWidth?: "public" | "admin";
}

const {
  title,
  description = "Resultados, estadísticas y ranking del grupo Solo Gente Súper Comprometida.",
  image = "/images/og-default.jpg",
  type = "website",
  contentWidth = "public",
} = Astro.props;
```

- [ ] **Step 1: Add toast props to interface and destructure them**

Replace the interface and destructuring (lines 7-21) with:

```astro
interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  contentWidth?: "public" | "admin";
  toastType?: "success" | "error" | "warning" | "info";
  toastMessage?: string;
}

const {
  title,
  description = "Resultados, estadísticas y ranking del grupo Solo Gente Súper Comprometida.",
  image = "/images/og-default.jpg",
  type = "website",
  contentWidth = "public",
  toastType,
  toastMessage,
} = Astro.props;
```

- [ ] **Step 2: Import ToastContainer and render it in body**

Add import after existing imports (line 5):

```astro
import ToastContainer from "@/components/shared/ToastContainer.astro";
```

Add `<ToastContainer />` before `<Footer />` in the body (replace lines 93-96):

```astro
    </main>
    <ToastContainer toastType={toastType} toastMessage={toastMessage} />
    <Footer />
  </body>
```

- [ ] **Step 3: Verify whole file is correct**

Read `src/layouts/Main.astro` to confirm the modified file has:
- Import for ToastContainer
- `toastType` and `toastMessage` in Props interface and destructuring
- `<ToastContainer toastType={toastType} toastMessage={toastMessage} />` in body

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Main.astro
git commit -m "feat: forward toast props through Main layout"
```

---

### Task 3: Fix admin/players/create.astro — error toast + success redirect

**Files:**
- Modify: `src/pages/admin/players/create.astro`

**Interfaces:**
- Consumes: `Main` (now accepts `toastType`, `toastMessage`), `parsePlayerFormData` from `@/lib/utils/playerForm`, `PlayerFormFields` (accepts `values` prop for pre-fill)
- Produces: POST error → same page with error toast + pre-filled form. POST success → redirect to `/admin/players?toast=success&msg=Jugador+creado+correctamente`

**Current frontmatter (lines 1-24):**

```astro
---
import { createAstroSupabase } from "@/lib/supabase";
import { Icon } from "astro-icon/components";
import PlayerFormFields from "@/components/admin/PlayerFormFields.astro";
import { parsePlayerFormData } from "@/lib/utils/playerForm";
import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";

const supabase = createAstroSupabase(Astro);

if (Astro.request.method === "POST") {
  const formData = await Astro.request.formData();
  const playerInput = parsePlayerFormData(formData);

  const { error } = await supabase.from("players").insert({
    ...playerInput,
  });

  if (error) {
    console.error(error);
  } else {
    return Astro.redirect("/admin/players");
  }
}
---
```

- [ ] **Step 1: Replace frontmatter with error variable + form pre-fill + success redirect**

Replace the entire frontmatter block (lines 1-24) with:

```astro
---
import { createAstroSupabase } from "@/lib/supabase";
import { Icon } from "astro-icon/components";
import PlayerFormFields from "@/components/admin/PlayerFormFields.astro";
import { parsePlayerFormData } from "@/lib/utils/playerForm";
import Main from "@/layouts/Main.astro";
import Title from "@/components/shared/Title.astro";

const supabase = createAstroSupabase(Astro);
let errorMessage = "";
let formValues = {
  nickname: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  preferred_foot: "right" as const,
  is_guest: false,
};

if (Astro.request.method === "POST") {
  const formData = await Astro.request.formData();
  const playerInput = parsePlayerFormData(formData);

  formValues = {
    nickname: playerInput.nickname,
    first_name: playerInput.first_name ?? "",
    last_name: playerInput.last_name ?? "",
    birth_date: playerInput.birth_date ?? "",
    preferred_foot: playerInput.preferred_foot ?? "right",
    is_guest: playerInput.is_guest,
  };

  const { error } = await supabase.from("players").insert({
    ...playerInput,
  });

  if (error) {
    errorMessage = error.message;
  } else {
    return Astro.redirect("/admin/players?toast=success&msg=Jugador+creado+correctamente");
  }
}
---
```

- [ ] **Step 2: Pass toast props and form values to template**

Replace `<Main>` opening tag (line 27):

```astro
<Main
  title="Nuevo Jugador"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

Replace `<PlayerFormFields idPrefix="create-player" />` (line 36) with:

```astro
<PlayerFormFields idPrefix="create-player" values={formValues} />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/players/create.astro
git commit -m "fix: add error toast and form pre-fill to player create"
```

---

### Task 4: Fix admin/players/edit/[id].astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/players/edit/[id].astro`

**Interfaces:**
- Consumes: `Main` (with `toastType`, `toastMessage` props)
- Produces: Save → redirect to same page with `?toast=success&msg=Jugador+actualizado`. Toggle → redirect to same page with `?toast=success&msg=Estado+actualizado`. Error → same page with error toast.

**Current frontmatter POST handler (lines 30-66):**

```astro
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
      .update({
        ...playerInput,
      })
      .eq("id", id);
    error = updateError;
  }

  if (error) {
    console.error("Error al actualizar jugador:", error);
    return new Response("Error interno", { status: 500 });
  }

  return Astro.redirect(`/admin/players/edit/${id}?success=true`);
}
```

- [ ] **Step 1: Replace POST handler with redirect-toast pattern**

Replace the entire `if (Astro.request.method === "POST")` block (lines 32-66) with:

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
      .update({
        ...playerInput,
      })
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

- [ ] **Step 2: Remove Alert import and inline success check, add toast props to Main**

Remove the Alert import at top of file:

```diff
-import Alert from "@/components/shared/Alert.astro";
```

Remove the inline success alert block (this appears after `<Title>` in the template):

```astro
{
  Astro.url.searchParams.get("success") && (
    <Alert type="success" message="Cambios guardados correctamente." class="mb-4" />
  )
}
```

Replace `<Main>` opening tag with:

```astro
<Main
  title="Editar Jugador"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/players/edit/[id].astro
git commit -m "fix: replace Alert with toast in player edit page"
```

---

### Task 5: Fix admin/matches/create.astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/matches/create.astro`

**Interfaces:**
- Consumes: `Main` (with `toastType`, `toastMessage` props)
- Produces: POST success → redirect to `/admin/matches?toast=success&msg=Partido+registrado+con+exito`. POST error → same page with error toast.

**Current frontmatter (lines 25-64):**

```astro
// --- 3. POST LOGIC ---
let successMessage = "";
let errorMessage = "";

if (Astro.request.method === "POST") {
  try {
    const formData = await Astro.request.formData();
    const date = formData.get("date")?.toString() || "";
    const field_id = formData.get("field_id")?.toString() || "";
    const result = formData.get("result")?.toString() || "";

    const lightPlayers: any[] = [];
    const darkPlayers: any[] = [];

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
    successMessage = "¡Partido registrado con éxito!";
  } catch (err: any) {
    errorMessage = err.message;
  }
}
---
```

- [ ] **Step 1: Replace POST handler to redirect on success, keep errorMessage for same-page**

Replace the POST logic block (lines 25-64) with:

```astro
// --- 3. POST LOGIC ---
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
---
```

Note: Removed `successMessage` variable (unused now). Changed `lightPlayers: any[]` to `lightPlayers: string[]` (minor type improvement).

- [ ] **Step 2: Remove Alert references in template, pass toast props to Main**

Replace `<Main>` opening tag (line 67):

```astro
<Main
  title="Cargar Partido | SGSC"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

Remove Alert import at top of file (line 4):
```
import Alert from "@/components/shared/Alert.astro";
```
(This line is no longer needed)

Remove the Alert block in template (lines 70-75 — the `{successMessage && (<Alert ... />)}` and `{errorMessage && (<Alert ... />)}` blocks).

Actually, let me re-read lines 70-85 to get exact context for the removal:

```astro
  {/* Alertas */}
  {
    successMessage && (
      <Alert type="success" message={successMessage} class="mb-6" />
    )
  }

  {errorMessage && <Alert type="error" message={errorMessage} class="mb-6" />}
```

Remove both `{successMessage && ...}` and `{errorMessage && ...}` blocks.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/matches/create.astro
git commit -m "fix: replace Alert with toast in match create page"
```

---

### Task 6: Fix admin/matches/edit/[id].astro — replace Alert with toast

**Files:**
- Modify: `src/pages/admin/matches/edit/[id].astro`

**Interfaces:**
- Consumes: `Main` (with `toastType`, `toastMessage` props)
- Produces: POST success → redirect to `/admin/matches?toast=success&msg=Partido+actualizado+correctamente`. POST error → same page with error toast.

**Current state:**
- Line 18: `let errorMessage = "";`
- Line 19: `const showSuccess = Astro.url.searchParams.get("success") === "true";`
- Line 189: `return Astro.redirect(`/admin/matches/edit/${id}?success=true`);`
- Lines 195-210: Alert for success and error

- [ ] **Step 1: Change success redirect to use toast params**

Replace line 189:
```astro
    return Astro.redirect(`/admin/matches/edit/${id}?success=true`);
```
With:
```astro
    return Astro.redirect(`/admin/matches/edit/${id}?toast=success&msg=Partido+actualizado+correctamente`);
```

- [ ] **Step 2: Remove showSuccess variable and old Alert blocks**

Remove line 19:
```astro
const showSuccess = Astro.url.searchParams.get("success") === "true";
```

Replace `<Main>` opening tag (line 192):
```astro
<Main
  title="Editar Partido | SGSC"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

Remove the Alert import at top (line 4):
```
import Alert from "@/components/shared/Alert.astro";
```

Remove the Alert blocks (lines 195-210):
```astro
  {showSuccess && (
    <div class="mb-6 flex flex-col gap-2">
      <Alert type="success" message="¡Partido actualizado correctamente!" />
      <a href="/admin/matches" class="btn btn-ghost btn-sm w-full rounded-xl sm:w-fit">
        <Icon name="material-symbols:arrow-back" size={18} />
        Volver al historial
      </a>
    </div>
  )}
  {errorMessage && <Alert type="error" message={errorMessage} class="mb-6" />}
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Run tests**

Run: `npm run test:run`
Expected: 5 files, 30 tests passed

- [ ] **Step 5: Run astro check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings (same as before)

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/matches/edit/[id].astro
git commit -m "fix: replace Alert with toast in match edit page"
```

---

## Self-Review

**1. Spec coverage:**
- Create operations: Task 3 (player), Task 5 (match) ✓
- Edit operations: Task 4 (player), Task 6 (match) ✓
- Delete/toggle operations: Task 4 (player toggle_status) ✓
- Animation: Task 1 (CSS keyframes for slide-in/out) ✓
- Auto-dismiss: Task 1 (5s timeout + click-to-dismiss) ✓
- All admin mutations covered ✓

**2. Placeholder scan:** No TBD, TODO, or vague instructions. Every step has explicit code. ✓

**3. Type consistency:**
- `toastType` prop: `"success" | "error" | "warning" | "info" | undefined` — consistent across Main, ToastContainer, and all admin pages ✓
- `toastMessage` prop: `string | undefined` — consistent ✓
- URL params: `toast` and `msg` — same keys everywhere ✓
- `errorMessage` variable: `string` (initialized to `""`) — consistent across all pages ✓
