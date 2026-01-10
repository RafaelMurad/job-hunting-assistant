/**
 * E2E Tests: CV Editor Page
 *
 * Tests for the CV editor and management page.
 * Note: Authenticated flow tests are skipped until we set up test user auth.
 */

import { expect, test } from "@playwright/test";

test.describe("CV Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/cv");
    // neonAuthMiddleware redirects to sign-in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("cv route exists (no 404)", async ({ page }) => {
    const response = await page.goto("/cv");
    // Should redirect (302) or show page (200), not 404
    expect(response?.status()).toBeLessThan(404);
  });

  test("cv route returns valid response", async ({ page }) => {
    const response = await page.goto("/cv");
    // Verify we get a proper redirect response
    expect(response?.ok() || response?.status() === 302).toBeTruthy();
  });
});

// FUTURE: Add authenticated tests with test user setup
// test.describe("CV Page - Authenticated", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("displays CV editor when user has CVs", async ({ page }) => {
//     await page.goto("/cv");
//     // Should show editor or empty state
//     await expect(
//       page.getByRole("heading", { name: /cv|resume|editor/i })
//     ).toBeVisible();
//   });
//
//   test("displays empty state when user has no CVs", async ({ page }) => {
//     // Mock empty CV list
//     await page.goto("/cv");
//     await expect(page.getByText(/no cv|create.*first/i)).toBeVisible();
//   });
//
//   test("can navigate to profile to manage CVs", async ({ page }) => {
//     await page.goto("/cv");
//     const profileLink = page.getByRole("link", { name: /profile|manage/i });
//     if (await profileLink.isVisible()) {
//       await profileLink.click();
//       await expect(page).toHaveURL(/\/profile/);
//     }
//   });
//
//   test("CV editor has save button", async ({ page }) => {
//     await page.goto("/cv");
//     // Editor should have save functionality
//     await expect(
//       page.getByRole("button", { name: /save|update/i })
//     ).toBeVisible();
//   });
//
//   test("CV editor has LaTeX content area", async ({ page }) => {
//     await page.goto("/cv");
//     // Should have textarea or editor for LaTeX content
//     await expect(
//       page.getByRole("textbox").or(page.locator("[data-testid='latex-editor']"))
//     ).toBeVisible();
//   });
// });

// FUTURE: CV CRUD User Journey Tests
// test.describe("CV Management User Journey", () => {
//   test.use({ storageState: "e2e/.auth/user.json" });
//
//   test("complete flow: create, edit, and delete CV", async ({ page }) => {
//     // 1. Go to profile page
//     await page.goto("/profile");
//
//     // 2. Click "New CV" or similar
//     await page.getByRole("button", { name: /new.*cv|create.*cv/i }).click();
//
//     // 3. Fill in CV name
//     await page.getByLabel(/name/i).fill("Test CV");
//
//     // 4. Save
//     await page.getByRole("button", { name: /save|create/i }).click();
//
//     // 5. Verify CV appears in list
//     await expect(page.getByText("Test CV")).toBeVisible();
//
//     // 6. Click edit to go to editor
//     await page.getByRole("button", { name: /edit/i }).first().click();
//     await expect(page).toHaveURL(/\/cv/);
//
//     // 7. Edit LaTeX content
//     const editor = page.getByRole("textbox").first();
//     await editor.fill("\\documentclass{article}\\begin{document}Test\\end{document}");
//
//     // 8. Save changes
//     await page.getByRole("button", { name: /save/i }).click();
//
//     // 9. Go back to profile
//     await page.goto("/profile");
//
//     // 10. Delete the CV
//     await page.getByRole("button", { name: /delete/i }).first().click();
//     await page.getByRole("button", { name: /confirm|yes/i }).click();
//
//     // 11. Verify CV is gone
//     await expect(page.getByText("Test CV")).not.toBeVisible();
//   });
//
//   test("can set active CV", async ({ page }) => {
//     await page.goto("/profile");
//
//     // Find a non-active CV and set it as active
//     const setActiveButton = page.getByRole("button", { name: /set.*active/i }).first();
//     if (await setActiveButton.isVisible()) {
//       await setActiveButton.click();
//       // Verify active indicator appears
//       await expect(page.getByText(/active/i)).toBeVisible();
//     }
//   });
//
//   test("enforces max 5 CVs limit", async ({ page }) => {
//     await page.goto("/profile");
//
//     // If user has 5 CVs, create button should be disabled or show message
//     const createButton = page.getByRole("button", { name: /new.*cv|create.*cv/i });
//     // Check for disabled state or limit message
//     const isDisabled = await createButton.isDisabled().catch(() => false);
//     const limitMessage = page.getByText(/maximum|limit|5.*cv/i);
//
//     // Either button is disabled or limit message is shown
//     expect(isDisabled || (await limitMessage.isVisible().catch(() => false))).toBeTruthy();
//   });
// });
