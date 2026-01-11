/**
 * Component Tests: ConfirmationDialog
 *
 * Tests for the reusable confirmation dialog component.
 */

import { render, screen, waitFor } from "@/__tests__/setup/test-utils";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("ConfirmationDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    onConfirm: vi.fn(),
  };

  describe("Rendering", () => {
    it("renders dialog when open is true", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    });

    it("does not render dialog when open is false", () => {
      render(<ConfirmationDialog {...defaultProps} open={false} />);

      expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
    });

    it("renders confirm and cancel buttons", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("uses custom button text when provided", () => {
      render(<ConfirmationDialog {...defaultProps} confirmText="Delete" cancelText="Keep" />);

      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /keep/i })).toBeInTheDocument();
    });

    it("shows warning icon for destructive variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="destructive" />);

      // Check for SVG warning icon (has specific path)
      const svg = document.querySelector("svg.text-red-600");
      expect(svg).toBeInTheDocument();
    });

    it("does not show warning icon for default variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="default" />);

      const svg = document.querySelector("svg.text-red-600");
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onOpenChange with false when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("closes dialog after confirm", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(
        <ConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} onConfirm={onConfirm} />
      );

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("handles async onConfirm", async () => {
      const user = userEvent.setup();
      const onConfirm = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe("Loading State", () => {
    it("disables buttons when isLoading is true", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      // When loading, confirm button shows "Processing..." instead of "Confirm"
      expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("shows spinner when isLoading is true", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      // Check for animate-spin class on loading spinner
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("buttons are enabled when isLoading is false", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={false} />);

      expect(screen.getByRole("button", { name: /confirm/i })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /cancel/i })).not.toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has accessible dialog title", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has accessible description", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    });
  });
});
