import { expect, test } from "@playwright/test";

test.describe("Forms", () => {
  test("login form has required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[name="email"][required]')).toBeVisible();
    await expect(
      page.locator('input[name="password"][required]'),
    ).toBeVisible();
  });

  test("login form submit with empty values stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
