/**
 * E2E Tests: Profile Page
 *
 * Tests for the user profile page.
 * Note: Authenticated flow tests are skipped until we set up test user auth.
 */

import { expect, test } from "@playwright/test";

test.describe("Profile Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/profile");
    // neonAuthMiddleware redirects to sign-in without callbackUrl
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("profile route exists (no 404)", async ({ page }) => {
    const response = await page.goto("/profile");
    // Should redirect (302) or show page (200), not 404
    expect(response?.status()).toBeLessThan(404);
  });
});

// FUTURE: Add authenticated tests with test user setup
// test.describe("Profile Page - Authenticated", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("displays profile form", async ({ page }) => {
//     await page.goto("/profile");
//     await expect(page.getByLabel(/name/i)).toBeVisible();
//   });
// });
