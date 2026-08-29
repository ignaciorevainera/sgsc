// tests/e2e/admin-match-create.spec.ts
import { expect, test } from "./fixtures";

const hasAuth = Boolean(process.env.TEST_EMAIL) && Boolean(process.env.TEST_PASSWORD);

test.describe("Admin Match Create — buscador + refresh", () => {
  test.skip(!hasAuth, "Requires TEST_EMAIL/TEST_PASSWORD");

  test("buscador filtra por nickname y muestra empty state", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto("/admin/matches/create");

    await expect(page.locator("#playerSearch")).toBeVisible();
    await expect(page.locator("#btnRefreshPlayers")).toBeVisible();

    const firstRowNick = await page.locator("[data-player-row]").first().getAttribute("data-nickname");
    expect(firstRowNick).toBeTruthy();

    // Escribir query que matchee 1 jugador — debounce 150ms so wait
    const partial = firstRowNick!.slice(0, 3);
    await page.fill("#playerSearch", partial);
    await page.waitForTimeout(250);

    const visibleRows = page.locator("[data-player-row]:not(.hidden)");
    await expect(visibleRows.first()).toBeVisible();
    // Empty no visible
    await expect(page.locator("#playerEmptyState")).toBeHidden();

    // Query sin resultados
    await page.fill("#playerSearch", "zzz_no_existe_123");
    await page.waitForTimeout(250);
    await expect(page.locator("[data-player-row]:not(.hidden)")).toHaveCount(0);
    await expect(page.locator("#playerEmptyState")).toBeVisible();
    await expect(page.locator("#playerEmptyQuery")).toContainText("zzz_no_existe_123");

    // Limpiar vuelve a mostrar todos
    await page.fill("#playerSearch", "");
    await page.waitForTimeout(250);
    await expect(page.locator("[data-player-row]:not(.hidden)")).not.toHaveCount(0);
  });

  test("refresh preserva estado del formulario", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto("/admin/matches/create");

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    const iso = tomorrow.toISOString().slice(0,10);
    await page.fill('input[name="date"]', iso);
    await page.selectOption('select[name="field_id"]', { index: 1 });
    await page.locator('input[name="result"][value="draw"]').check({ force: true });

    const light = page.locator('.player-selector[value="light"]').first();
    await light.check({ force: true });
    const lightName = await light.getAttribute("data-nickname");

    // Static mock — no route.fetch to avoid recursion/brittleness
    const newPlayer = { id: "00000000-0000-0000-0000-000000000999", nickname: "ZZZ_Nuevo_E2E", is_guest: false };
    await page.route("**/api/players", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([newPlayer]) });
    });

    const countBefore = await page.locator("[data-player-row]").count();
    await page.click("#btnRefreshPlayers");
    await expect(page.locator('[data-player-id="00000000-0000-0000-0000-000000000999"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator("[data-player-row]")).toHaveCount(countBefore + 1);

    // Estado preservado
    await expect(page.locator('input[name="date"]')).toHaveValue(iso);
    await expect(page.locator('input[name="result"][value="draw"]')).toBeChecked();
    await expect(page.locator(`.player-selector[data-nickname="${lightName}"][value="light"]`)).toBeChecked();

    await page.unroute("**/api/players");
  });

  test("refresh sin nuevos muestra feedback y no duplica", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto("/admin/matches/create");
    const countBefore = await page.locator("[data-player-row]").count();
    // Fulfill with empty array — deterministic, no fetch
    await page.route("**/api/players", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.click("#btnRefreshPlayers");
    // esperar que botón se re-habilite
    await expect(page.locator("#btnRefreshPlayers")).toBeEnabled({ timeout: 5000 });
    await expect(page.locator("[data-player-row]")).toHaveCount(countBefore);
    await page.unroute("**/api/players");
  });
});
