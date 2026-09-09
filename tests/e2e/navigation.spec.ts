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

  test("navigates client-side across public pages with View Transitions preserving SPA state and search modal", async ({
    page,
  }) => {
    const navigateViaLink = async (href: string) => {
      const directLink = page.locator(`a[href="${href}"]:visible`).first();
      if ((await directLink.count()) > 0) {
        await directLink.click();
        return;
      }
      const mobileBtn = page.getByRole("button", {
        name: /abrir men[uú] de navegaci[oó]n/i,
      });
      if (await mobileBtn.isVisible()) {
        await mobileBtn.click();
        await page.locator(`#mobile-menu a[href="${href}"]`).click();
        return;
      }
      const statsSummary = page
        .locator("nav[aria-label='Navegación principal'] details summary")
        .first();
      const isOpen = await statsSummary.evaluate(
        (el) => (el.parentElement as HTMLDetailsElement)?.open
      );
      if (!isOpen) {
        await statsSummary.click();
      }
      await page
        .locator(`nav[aria-label="Navegación principal"] a[href="${href}"]`)
        .click();
    };

    await page.goto("/");
    await expect(page).toHaveTitle(/SGSC/i);

    await page.evaluate(() => {
      (window as unknown as { __sgsc_spa_active?: boolean }).__sgsc_spa_active = true;
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    });

    await navigateViaLink("/ranking");
    await expect(page).toHaveURL(/\/ranking/);
    await expect(page.getByRole("heading", { name: /clasificaci[oó]n/i })).toBeVisible();

    let isSpaActive = await page.evaluate(
      () => (window as unknown as { __sgsc_spa_active?: boolean }).__sgsc_spa_active
    );
    expect(isSpaActive).toBe(true);
    let theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");

    await navigateViaLink("/players");
    await expect(page).toHaveURL(/\/players/);
    await expect(page.getByRole("heading", { name: /plantel/i })).toBeVisible();

    isSpaActive = await page.evaluate(
      () => (window as unknown as { __sgsc_spa_active?: boolean }).__sgsc_spa_active
    );
    expect(isSpaActive).toBe(true);
    theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");

    await navigateViaLink("/matches");
    await expect(page).toHaveURL(/\/matches/);
    await expect(page.getByRole("heading", { name: /partidos/i })).toBeVisible();

    isSpaActive = await page.evaluate(
      () => (window as unknown as { __sgsc_spa_active?: boolean }).__sgsc_spa_active
    );
    expect(isSpaActive).toBe(true);
    theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");

    await page.keyboard.press("Control+k");
    const searchModal = page.locator("#search-modal");
    await expect(searchModal).toBeVisible();
    await expect(page.locator("#search-input")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(searchModal).not.toBeVisible();
  });
});
