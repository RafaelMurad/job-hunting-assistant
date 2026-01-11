/**
 * Visual Regression Tests
 *
 * Captures screenshots of all pages in light and dark modes
 * to verify the design refresh changes work correctly.
 */

import { expect, test } from "@playwright/test";

// Pages to test (public pages that don't require auth)
const publicPages = [
  { name: "landing", path: "/" },
  { name: "sign-in", path: "/auth/sign-in" },
  { name: "sign-up", path: "/auth/sign-up" },
];

// Protected pages (dashboard, profile, cv, analyze, tracker, settings)
// require authentication and are tested separately in auth.spec.ts

test.describe("Visual Regression - Light Mode", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure light mode
    await page.addInitScript(() => {
      localStorage.setItem("job-hunting-theme", "light");
    });
  });

  for (const { name, path } of publicPages) {
    test(`${name} page renders correctly`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Take screenshot
      await expect(page).toHaveScreenshot(`light-${name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression - Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    // Set dark mode
    await page.addInitScript(() => {
      localStorage.setItem("job-hunting-theme", "dark");
    });
  });

  for (const { name, path } of publicPages) {
    test(`${name} page renders correctly in dark mode`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Take screenshot
      await expect(page).toHaveScreenshot(`dark-${name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

test.describe("Theme Toggle", () => {
  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the theme toggle button
    const themeToggle = page.getByRole("button", { name: /switch to|theme/i });
    await expect(themeToggle).toBeVisible();

    // Click to cycle theme (light → dark)
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Take screenshot after first click
    await expect(page).toHaveScreenshot("toggle-after-click.png", {
      animations: "disabled",
    });

    // Click again to continue cycling
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Take screenshot after second click
    await expect(page).toHaveScreenshot("toggle-after-second-click.png", {
      animations: "disabled",
    });
  });
});

test.describe("Responsive Design", () => {
  test("landing page mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("mobile-landing.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("landing page tablet view", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("tablet-landing.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Component States", () => {
  test("navigation hover states", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hover over navigation links
    const dashboardLink = page.getByRole("link", { name: /dashboard/i });
    if (await dashboardLink.isVisible()) {
      await dashboardLink.hover();
      await page.waitForTimeout(100);
    }

    await expect(page).toHaveScreenshot("nav-hover.png", {
      animations: "disabled",
    });
  });

  test("theme toggle states", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Focus on the theme toggle button
    const themeToggle = page.getByRole("button", { name: /switch to|theme/i });
    await expect(themeToggle).toBeVisible();

    await expect(themeToggle).toHaveScreenshot("theme-toggle-component.png");
  });
});
