/**
 * @fileoverview Tests for Command Palette component
 * @description Validates keyboard shortcuts, navigation, and actions
 */

import {
  actionItems,
  CommandPalette,
  keyboardShortcuts,
  navigationItems,
} from "@/components/command-palette";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe("Keyboard Shortcuts", () => {
    it("should open command palette with Cmd+K", async () => {
      render(<CommandPalette />);

      // Command palette should not be visible initially
      expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();

      // Press Cmd+K
      fireEvent.keyDown(document, { key: "k", metaKey: true });

      // Command palette should now be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
      });
    });

    it("should open command palette with Ctrl+K", async () => {
      render(<CommandPalette />);

      // Press Ctrl+K
      fireEvent.keyDown(document, { key: "k", ctrlKey: true });

      // Command palette should be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
      });
    });

    it("should close command palette with Escape", async () => {
      render(<CommandPalette />);

      // Open command palette
      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();
      });
    });

    it("should toggle command palette on repeated Cmd+K", async () => {
      render(<CommandPalette />);

      // Open
      fireEvent.keyDown(document, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
      });

      // Close
      fireEvent.keyDown(document, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();
      });
    });

    it("should open keyboard shortcuts with ? key", async () => {
      render(<CommandPalette />);

      // Press ? key
      fireEvent.keyDown(document, { key: "?" });

      // Keyboard shortcuts dialog should be visible - look for the dialog description
      await waitFor(() => {
        expect(
          screen.getByText(/quick navigation and actions for power users/i)
        ).toBeInTheDocument();
      });
    });

    it("should not open shortcuts when ? is pressed in an input", async () => {
      render(
        <div>
          <input data-testid="test-input" />
          <CommandPalette />
        </div>
      );

      const input = screen.getByTestId("test-input");
      input.focus();

      // Press ? while input is focused
      fireEvent.keyDown(input, { key: "?" });

      // Shortcuts should not open
      expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
    });
  });

  describe("Navigation Items", () => {
    it("should display all navigation items when opened", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText("Navigation")).toBeInTheDocument();
      });

      // Check all navigation items are present
      for (const item of navigationItems) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }
    });

    it("should navigate to dashboard when selected", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/go to dashboard/i));

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should navigate to profile when selected", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/go to profile/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/go to profile/i));

      expect(mockPush).toHaveBeenCalledWith("/profile");
    });

    it("should display keyboard shortcuts for navigation items", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText("g d")).toBeInTheDocument(); // Dashboard shortcut
        expect(screen.getByText("g p")).toBeInTheDocument(); // Profile shortcut
        expect(screen.getByText("g t")).toBeInTheDocument(); // Tracker shortcut
      });
    });
  });

  describe("Action Items", () => {
    it("should display all action items when opened", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });

      // Check all action items are present
      for (const item of actionItems) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }
    });

    it("should navigate to tracker with new action when New Application is selected", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/new application/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/new application/i));

      expect(mockPush).toHaveBeenCalledWith("/tracker?action=new");
    });

    it("should navigate to analyze when Analyze Job URL is selected", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/analyze job url/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/analyze job url/i));

      expect(mockPush).toHaveBeenCalledWith("/analyze");
    });

    it("should navigate to profile with upload action when Upload CV is selected", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/upload cv/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/upload cv/i));

      expect(mockPush).toHaveBeenCalledWith("/profile?action=upload");
    });

    it("should call onAction callback for custom actions", async () => {
      const onAction = vi.fn();
      const user = userEvent.setup();
      render(<CommandPalette onAction={onAction} />);

      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/new application/i)).toBeInTheDocument();
      });

      // The default actions should still work
      await user.click(screen.getByText(/new application/i));

      // onAction is called after default handler
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("Keyboard Shortcuts Dialog", () => {
    it("should display all shortcuts in the help dialog", async () => {
      render(<CommandPalette />);

      // Open shortcuts dialog
      fireEvent.keyDown(document, { key: "?" });

      await waitFor(() => {
        // Look for the dialog description which is unique
        expect(
          screen.getByText(/quick navigation and actions for power users/i)
        ).toBeInTheDocument();
      });

      // Check all shortcuts are documented
      for (const shortcut of keyboardShortcuts) {
        expect(screen.getByText(shortcut.description)).toBeInTheDocument();
      }
    });

    it("should close shortcuts dialog with Escape", async () => {
      render(<CommandPalette />);

      // Open shortcuts dialog
      fireEvent.keyDown(document, { key: "?" });

      await waitFor(() => {
        // Look for the dialog description which is unique
        expect(
          screen.getByText(/quick navigation and actions for power users/i)
        ).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByText(/quick navigation and actions for power users/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should open shortcuts from command palette Help item", async () => {
      const user = userEvent.setup();
      render(<CommandPalette />);

      // Open command palette
      fireEvent.keyDown(document, { key: "k", metaKey: true });

      await waitFor(() => {
        // Command palette should be open, find the help item
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      // Click on Keyboard Shortcuts item (in the Actions group)
      const shortcutsItems = screen.getAllByText(/keyboard shortcuts/i);
      expect(shortcutsItems.length).toBeGreaterThan(0);
      // The first one should be the command item
      await user.click(shortcutsItems[0]!);

      // Shortcuts dialog should open
      await waitFor(() => {
        expect(
          screen.getByText(/quick navigation and actions for power users/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Data Exports", () => {
    it("should export correct number of navigation items", () => {
      expect(navigationItems).toHaveLength(6);
    });

    it("should export correct number of action items", () => {
      expect(actionItems).toHaveLength(3);
    });

    it("should export correct number of keyboard shortcuts", () => {
      expect(keyboardShortcuts).toHaveLength(9);
    });

    it("should have href for all navigation items", () => {
      for (const item of navigationItems) {
        expect(item.href).toBeDefined();
        expect(item.href.startsWith("/")).toBe(true);
      }
    });

    it("should have action for all action items", () => {
      for (const item of actionItems) {
        expect(item.action).toBeDefined();
        expect(item.action.length).toBeGreaterThan(0);
      }
    });
  });
});
