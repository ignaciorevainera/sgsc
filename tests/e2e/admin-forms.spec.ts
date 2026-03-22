import { expect, test } from "./fixtures";

const hasAuthCredentials =
  Boolean(process.env.TEST_EMAIL) && Boolean(process.env.TEST_PASSWORD);
const allowMutations = process.env.E2E_ALLOW_MUTATIONS === "true";

test.describe("Admin Forms (real persistence)", () => {
  test.skip(
    !hasAuthCredentials || !allowMutations,
    "Requires TEST_EMAIL/TEST_PASSWORD and E2E_ALLOW_MUTATIONS=true",
  );

  test("creates a player and persists it in admin list", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const nickname = `e2e-${Date.now()}`;

    await page.goto("/admin/players/create");

    await page.fill('input[name="nickname"]', nickname);
    await page.fill('input[name="first_name"]', "E2E");
    await page.fill('input[name="last_name"]', "Tester");
    await page.selectOption('select[name="preferred_foot"]', "right");
    await page.check('input[name="is_guest"]');
    await page.getByRole("button", { name: /guardar jugador/i }).click();

    await expect(page).toHaveURL(/\/admin\/players$/);
    await expect(page.getByText(nickname)).toBeVisible();
  });

  test("creates a match and shows success feedback", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await page.goto("/admin/matches/create");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoDate = tomorrow.toISOString().slice(0, 10);

    await page.fill('input[name="date"]', isoDate);
    await page.selectOption('select[name="field_id"]', { index: 1 });
    await page.locator('input[name="result"][value="draw"]').check({
      force: true,
    });

    const lightSelectors = page.locator('.player-selector[value="light"]');
    const darkSelectors = page.locator('.player-selector[value="dark"]');
    const rowCount = await lightSelectors.count();

    test.skip(rowCount < 2, "Need at least 2 active players for both teams");

    await lightSelectors.nth(0).check({ force: true });
    await darkSelectors.nth(1).check({ force: true });

    await page.getByRole("button", { name: /previsualizar partido/i }).click();
    await page.getByRole("button", { name: /confirmar y guardar/i }).click();

    await expect(page.getByText(/partido registrado con [ée]xito/i)).toBeVisible();
  });
});
