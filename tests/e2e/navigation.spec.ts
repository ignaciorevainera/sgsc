import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("public pages respond and render core content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SGSC/i);

    await page.goto("/players");
    await expect(page.getByRole("heading", { name: /plantel/i })).toBeVisible();

    await page.goto("/matches");
    await expect(page.getByRole("heading", { name: /partidos/i })).toBeVisible();
  });

  test("mobile viewport loads players page correctly", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/players");
    await expect(page.getByRole("heading", { name: /plantel/i })).toBeVisible();
  });
});
