# Task 3: Fix admin/players/create.astro — error toast + success redirect

**Files:**
- Modify: `src/pages/admin/players/create.astro`

**Context:** Task 2 made `Main.astro` accept `toastType`/`toastMessage` props for same-page errors. This task integrates the toast + error feedback into the player create form.

## Steps

### Step 1: Replace the frontmatter

Current frontmatter (lines 1-24):
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

Replace with:
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

### Step 2: Update Main props to pass toast + form values

Replace `<Main title="Nuevo Jugador" contentWidth="admin">` with:
```astro
<Main
  title="Nuevo Jugador"
  contentWidth="admin"
  toastType={errorMessage ? "error" : undefined}
  toastMessage={errorMessage || undefined}
>
```

Replace `<PlayerFormFields idPrefix="create-player" />` with:
```astro
<PlayerFormFields idPrefix="create-player" values={formValues} />
```

### Step 3: Build

Run: `npm run build`
Expected: `Complete!`

### Step 4: Commit

```bash
git add src/pages/admin/players/create.astro
git commit -m "fix: add error toast and form pre-fill to player create"
```

## Report

Write to `E:\Dev\proyectos\sgsc\.superpowers\sdd\task-3-report.md` with status, commits, build result, concerns.
