import { expect, test as base } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: import("@playwright/test").Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Missing TEST_EMAIL/TEST_PASSWORD. Define them in .env.test or environment variables.",
      );
    }

    await page.goto("/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForURL(/\/admin$/);
    await expect(page).toHaveURL(/\/admin$/);

    await use(page);
  },
});

export { expect } from "@playwright/test";
