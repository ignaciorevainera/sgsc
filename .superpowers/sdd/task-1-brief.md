# Task 1: Create ToastContainer.astro

**Files:**
- Create: `src/components/shared/ToastContainer.astro`

**Interfaces:**
- Consumes: `Astro.url.searchParams` (for cross-page `?toast=` and `?msg=`), `Astro.props` (for same-page `toastType`, `toastMessage`)
- Produces: `<ToastContainer toastType="error" toastMessage="Mensaje" />` or auto-detects from URL

## Steps

### Step 1: Write the component file

Create `src/components/shared/ToastContainer.astro` with this exact content:

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

### Step 2: Verify file created

Run: `Get-ChildItem -Path "src/components/shared/ToastContainer.astro"`
Expected: file path returned

### Step 3: Run build

Run: `npm run build`
Expected: output ends with `Complete!`

### Step 4: Commit

```bash
git add src/components/shared/ToastContainer.astro
git commit -m "feat: add ToastContainer with slide animation and auto-dismiss"
```

## Report

After completing, write report to `E:\Dev\proyectos\sgsc\.superpowers\sdd\task-1-report.md` with:
- Status (DONE / NEEDS_CONTEXT / BLOCKED)
- Commits made
- Build result
- Any concerns
