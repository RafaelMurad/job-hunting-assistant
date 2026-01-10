/**
 * E2E Tests: Job Analyzer Page
 *
 * Tests for the job analysis feature.
 * Note: Authenticated flow tests are skipped until we set up test user auth.
 */

import { expect, test } from "@playwright/test";

test.describe("Analyze Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/analyze");
    // neonAuthMiddleware redirects to sign-in without callbackUrl
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("analyze route exists (no 404)", async ({ page }) => {
    const response = await page.goto("/analyze");
    // Should redirect (302) or show page (200), not 404
    expect(response?.status()).toBeLessThan(404);
  });
});

// FUTURE: Add authenticated tests with test user setup
// test.describe("Analyze - Authenticated", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("displays job URL input", async ({ page }) => {
//     await page.goto("/analyze");
//     await expect(page.getByLabel(/url|job posting/i)).toBeVisible();
//   });
// });
