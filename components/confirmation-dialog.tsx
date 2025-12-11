/**
 * Confirmation Dialog Component
 *
 * Reusable confirmation dialog for destructive or important actions.
 * Prevents accidental data loss with clear confirmation flow.
 *
 * Usage:
 * ```tsx
 * <ConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Application?"
 *   description="This action cannot be undone. Are you sure?"
 *   onConfirm={handleDelete}
 *   variant="destructive"
 * />
 * ```
 */

"use client";

import * as React from "react";
import { type JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmationDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description: string;
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Visual variant */
  variant?: "default" | "destructive";
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Show loading state during confirmation */
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = "default",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmationDialogProps): JSX.Element {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <svg
                className="h-5 w-5 text-clay-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing confirmation dialog state
 *
 * Usage:
 * ```tsx
 * const confirm = useConfirmation();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Application?',
 *     description: 'This cannot be undone.',
 *     variant: 'destructive',
 *   });
 *
 *   if (confirmed) {
 *     await deleteApplication();
 *   }
 * };
 * ```
 */
export function useConfirmation() {
  const [state, setState] = React.useState<{
    open: boolean;
    resolve?: (value: boolean) => void;
    props?: Omit<ConfirmationDialogProps, "open" | "onOpenChange" | "onConfirm">;
  }>({ open: false });

  const confirm = (
    props: Omit<ConfirmationDialogProps, "open" | "onOpenChange" | "onConfirm">
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, resolve, props });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ open: false });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ open: false });
  };

  const dialog = state.open && state.props ? (
    <ConfirmationDialog
      {...state.props}
      open={state.open}
      onOpenChange={handleCancel}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { confirm, dialog };
}
