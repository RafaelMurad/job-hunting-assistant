/**
 * E2E Tests: Landing Page
 *
 * Tests for the public landing page.
 * These tests don't require authentication.
 */

import { expect, test } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    // Actual title from metadata
    await expect(page).toHaveTitle(/Job Hunt AI/);
  });

  test("displays hero section", async ({ page }) => {
    // Check for main heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/AI-Powered/i);
  });

  test("has call-to-action buttons", async ({ page }) => {
    // Look for primary CTA - "Get Started Free"
    const ctaButton = page.getByRole("link", { name: /get started/i });
    await expect(ctaButton).toBeVisible();
  });

  test("displays feature sections", async ({ page }) => {
    // Page should have content sections
    const sections = page.locator("section");
    await expect(sections.first()).toBeVisible();
  });

  test("navigates to dashboard from CTA (redirects to auth for unauthenticated)", async ({
    page,
  }) => {
    // Click CTA button - goes to /dashboard which may redirect to auth
    const ctaButton = page.getByRole("link", { name: /get started/i });
    await ctaButton.click();

    // Should redirect to auth sign-in or dashboard
    await expect(page).toHaveURL(/\/auth\/sign-in|\/dashboard/);
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

    const logo = page.getByRole("link", { name: /job hunt ai/i });
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
