/**
 * E2E Tests: Authentication Flows
 *
 * Tests for authentication pages using Neon Auth.
 * Note: Neon Auth uses embedded iframes, so we test page structure
 * and navigation rather than form interactions within the iframe.
 */

import { expect, test } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test.describe("Sign In Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/sign-in");
    });

    test("loads sign in page", async ({ page }) => {
      await expect(page).toHaveURL("/auth/sign-in");
    });

    test("displays auth container", async ({ page }) => {
      // The page should have main content area (use .first() for multiple mains)
      const main = page.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("has navigation back to home", async ({ page }) => {
      const logo = page.getByRole("link", { name: /careerpal/i });
      await expect(logo).toBeVisible();
    });
  });

  test.describe("Sign Up Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/sign-up");
    });

    test("loads sign up page", async ({ page }) => {
      await expect(page).toHaveURL("/auth/sign-up");
    });

    test("displays auth container", async ({ page }) => {
      // The page should have main content area (use .first() for multiple mains)
      const main = page.locator("main").first();
      await expect(main).toBeVisible();
    });
  });

  test.describe("Forgot Password Page", () => {
    test("loads forgot password page", async ({ page }) => {
      await page.goto("/auth/forgot-password");
      await expect(page).toHaveURL("/auth/forgot-password");
    });
  });

  test.describe("Auth Redirects", () => {
    test("redirects unauthenticated users from dashboard to auth", async ({ page }) => {
      await page.goto("/dashboard");

      // Should redirect to sign-in (neonAuthMiddleware handles this)
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });

    test("redirects unauthenticated users from profile to auth", async ({ page }) => {
      await page.goto("/profile");

      // Should redirect to sign-in (neonAuthMiddleware handles this)
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });

    test("redirects unauthenticated users from tracker to auth", async ({ page }) => {
      await page.goto("/tracker");

      // Should redirect to sign-in (neonAuthMiddleware handles this)
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });
  });
});
