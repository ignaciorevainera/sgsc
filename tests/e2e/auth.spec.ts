import { expect, test } from "@playwright/test";
import { expect as authExpect, test as authTest } from "./fixtures";

const hasAuthCredentials =
  Boolean(process.env.TEST_EMAIL) && Boolean(process.env.TEST_PASSWORD);

test.describe("Authentication", () => {
  test("redirects to login when accessing protected route", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login with invalid credentials shows error and remains on login", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrong-password");
    await page.getByRole("button", { name: /ingresar/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/incorrectos|incompletos/i)).toBeVisible();
  });

  test("GET signout endpoint is not publicly available", async ({ request }) => {
    const response = await request.get("/api/auth/signout");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

authTest.describe("Authentication (real credentials)", () => {
  authTest.skip(
    !hasAuthCredentials,
    "TEST_EMAIL/TEST_PASSWORD not configured for authenticated e2e.",
  );

  authTest("login with valid credentials reaches admin", async ({
    authenticatedPage,
  }) => {
    await authExpect(authenticatedPage).toHaveURL(/\/admin$/);
    await authExpect(
      authenticatedPage.getByRole("heading", { name: /panel de control/i }),
    ).toBeVisible();
  });

  authTest("logout with active session redirects to login", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole("button", { name: /cerrar sesi[oó]n/i })
      .click();

    await authExpect(authenticatedPage).toHaveURL(/\/login$/);
  });
});
