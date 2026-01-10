/**
 * E2E Tests: Dashboard Page
 *
 * Tests for the main dashboard.
 * Note: Authenticated flow tests are skipped until we set up test user auth.
 */

import { expect, test } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    // neonAuthMiddleware redirects to sign-in without callbackUrl
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("dashboard route exists (no 404)", async ({ page }) => {
    const response = await page.goto("/dashboard");
    // Should redirect (302) or show page (200), not 404
    expect(response?.status()).toBeLessThan(404);
  });
});

// FUTURE: Add authenticated tests with test user setup
// test.describe("Dashboard - Authenticated", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("displays dashboard stats", async ({ page }) => {
//     await page.goto("/dashboard");
//     await expect(page.getByText(/applications/i)).toBeVisible();
//   });
// });
