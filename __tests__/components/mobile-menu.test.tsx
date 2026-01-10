/**
 * Component Tests: MobileMenu
 *
 * Tests for the mobile navigation menu component.
 */

import { render, screen } from "@/__tests__/setup/test-utils";
import { MobileMenu } from "@/components/mobile-menu";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    // Clean up body overflow
    document.body.style.overflow = "unset";
  });

  describe("Rendering", () => {
    it("renders hamburger button", () => {
      render(<MobileMenu />);

      const button = screen.getByRole("button", { name: /toggle mobile menu/i });
      expect(button).toBeInTheDocument();
    });

    it("hamburger button has correct aria attributes when closed", () => {
      render(<MobileMenu />);

      const button = screen.getByRole("button", { name: /toggle mobile menu/i });
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("hamburger button has correct aria attributes when open", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      const button = screen.getByRole("button", { name: /toggle mobile menu/i });
      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Menu Toggle", () => {
    it("opens menu when hamburger button is clicked", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      // Menu should now be visible - look for navigation links
      expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    });

    it("closes menu when hamburger button is clicked again", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      const button = screen.getByRole("button", { name: /toggle mobile menu/i });

      // Open menu
      await user.click(button);
      expect(screen.getByRole("link", { name: /dashboard/i })).toBeVisible();

      // Close menu
      await user.click(button);

      // Menu should start closing (translate-x-full applied)
      const menuPanel = document.querySelector(".-translate-x-full");
      expect(menuPanel).toBeInTheDocument();
    });

    it("closes menu when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      // Open menu
      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      // Click close button
      const closeButton = screen.getByRole("button", { name: /close menu/i });
      await user.click(closeButton);

      // Menu should be closing
      const menuPanel = document.querySelector(".-translate-x-full");
      expect(menuPanel).toBeInTheDocument();
    });

    it("closes menu when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      // Open menu
      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      // Click backdrop (aria-hidden div)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        await user.click(backdrop);
      }

      // Menu should be closing
      const menuPanel = document.querySelector(".-translate-x-full");
      expect(menuPanel).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("displays all navigation links when menu is open", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /cv editor/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /analyze job/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /tracker/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
    });

    it("navigation links have correct href attributes", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
        "href",
        "/dashboard"
      );
      expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/profile");
    });

    it("displays logo link in menu header", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      const logoLink = screen.getByRole("link", { name: /job hunt ai/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Body Scroll Prevention", () => {
    it("prevents body scroll when menu is open", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when menu is closed", async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);

      // Open menu
      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));
      expect(document.body.style.overflow).toBe("hidden");

      // Close menu
      await user.click(screen.getByRole("button", { name: /toggle mobile menu/i }));
      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Styling", () => {
    it("applies custom className when provided", () => {
      render(<MobileMenu className="custom-class" />);

      const button = screen.getByRole("button", { name: /toggle mobile menu/i });
      expect(button).toHaveClass("custom-class");
    });
  });
});
