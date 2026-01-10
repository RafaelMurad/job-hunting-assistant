/**
 * E2E Tests: Application Tracker Page
 *
 * Tests for the job application tracker.
 * Note: Authenticated flow tests are skipped until we set up test user auth.
 */

import { expect, test } from "@playwright/test";

test.describe("Tracker Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/tracker");
    await expect(page).toHaveURL(/\/auth\/sign-in.*callbackUrl/);
  });

  test("tracker route exists (no 404)", async ({ page }) => {
    const response = await page.goto("/tracker");
    // Should redirect (302) or show page (200), not 404
    expect(response?.status()).toBeLessThan(404);
  });
});

// FUTURE: Add authenticated tests with test user setup
// test.describe("Tracker - Authenticated", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("displays applications list", async ({ page }) => {
//     await page.goto("/tracker");
//     await expect(page.getByRole("table")).toBeVisible();
//   });
// });
