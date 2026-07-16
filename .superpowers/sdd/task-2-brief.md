# Task 2: Add ToastContainer to Main.astro layout

**Files:**
- Modify: `src/layouts/Main.astro`

**Context:** Task 1 created `src/components/shared/ToastContainer.astro`. This task integrates it into the layout so it renders on every page.

**Interfaces:**
- Consumes: `ToastContainer` component (at `@/components/shared/ToastContainer.astro`)
- Produces: `Main.astro` accepts `toastType` and `toastMessage` props, forwards them to `<ToastContainer>`

## Steps

### Step 1: Add toast props to interface and destructure

In `src/layouts/Main.astro`, modify the frontmatter:

Add `ToastContainer` import after existing imports (line 5):
```astro
import ToastContainer from "@/components/shared/ToastContainer.astro";
```

Replace the interface (lines 7-13):
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
```

Replace the destructuring (lines 15-21):
```astro
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

### Step 2: Add ToastContainer to body

Replace the body block around lines 87-96. After `</main>` and before `<Footer />`, add:

```astro
    </main>
    <ToastContainer toastType={toastType} toastMessage={toastMessage} />
    <Footer />
  </body>
```

### Step 3: Run build

Run: `npm run build`
Expected: `Complete!`

### Step 4: Commit

```bash
git add src/layouts/Main.astro
git commit -m "feat: forward toast props through Main layout"
```

## Report

Write report to `E:\Dev\proyectos\sgsc\.superpowers\sdd\task-2-report.md` with:
- Status (DONE / NEEDS_CONTEXT / BLOCKED)
- Commits made
- Build result
- Any concerns
