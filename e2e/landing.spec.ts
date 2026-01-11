/**
 * E2E Tests: Landing Page
 *
 * Tests for the public landing page.
 * In local mode, the landing page redirects to dashboard immediately.
 * These tests handle both modes.
 */

import { expect, test } from "@playwright/test";

/**
 * Helper to wait for the page to settle (either landing, dashboard, or auth)
 * Returns true if redirected away from landing page
 */
async function waitForPageToSettle(page: import("@playwright/test").Page): Promise<boolean> {
  await page.goto("/");
  // Wait for network to be idle and any redirects to complete
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // Check if we're redirected away from landing page
  const url = page.url();
  return url.includes("/dashboard") || url.includes("/auth");
}

test.describe("Landing Page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    // Title works in all modes
    await expect(page).toHaveTitle(/CareerPal/);
  });

  test("displays hero section or redirects in local mode", async ({ page }) => {
    const wasRedirected = await waitForPageToSettle(page);

    if (wasRedirected) {
      // Local mode: redirected away from landing - verify we're at dashboard or auth
      await expect(page).toHaveURL(/\/dashboard|\/auth/);
    } else {
      // Demo mode: check for main heading
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/CareerPal/i);
    }
  });

  test("has call-to-action buttons or redirects in local mode", async ({ page }) => {
    const wasRedirected = await waitForPageToSettle(page);

    if (wasRedirected) {
      await expect(page).toHaveURL(/\/dashboard|\/auth/);
    } else {
      // Demo mode: Look for primary CTA
      const ctaButton = page.getByRole("link", { name: /get started|start using/i });
      await expect(ctaButton).toBeVisible();
    }
  });

  test("displays feature sections or redirects in local mode", async ({ page }) => {
    const wasRedirected = await waitForPageToSettle(page);

    if (wasRedirected) {
      await expect(page).toHaveURL(/\/dashboard|\/auth/);
    } else {
      // Demo mode: Page should have content sections
      const sections = page.locator("section");
      await expect(sections.first()).toBeVisible();
    }
  });

  test("navigates to dashboard from landing", async ({ page }) => {
    const wasRedirected = await waitForPageToSettle(page);

    if (wasRedirected) {
      // Local mode: already redirected
      await expect(page).toHaveURL(/\/dashboard|\/auth/);
    } else {
      // Demo mode: Click CTA button
      const ctaButton = page.getByRole("link", { name: /get started|start using/i });
      if (await ctaButton.isVisible()) {
        await ctaButton.click();
        await expect(page).toHaveURL(/\/auth\/sign-in|\/dashboard/);
      }
    }
  });
});

test.describe("Navigation", () => {
  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");

    // The nav element contains the navigation (use .first() for multiple navs)
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("logo links to home", async ({ page }) => {
    await page.goto("/");

    // Use exact match to avoid matching "Try CareerPal Free" button
    const logo = page.getByRole("link", { name: "CareerPal", exact: true });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("navigation links are visible on desktop", async ({ page }) => {
    await page.goto("/");

    // Desktop navigation links
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Analyze Job" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tracker" })).toBeVisible();
  });
});
