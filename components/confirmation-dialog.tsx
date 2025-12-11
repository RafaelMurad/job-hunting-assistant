"use client";

import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  confirmText?: string;
  cancelText?: string;
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
  const handleConfirm = async (): Promise<void> => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" ? (
              <svg
                className="h-5 w-5 text-clay-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : null}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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

export function useConfirmation(): {
  confirm: (
    props: Omit<ConfirmationDialogProps, "open" | "onOpenChange" | "onConfirm">
  ) => Promise<boolean>;
  dialog: JSX.Element | null;
} {
  const [open, setOpen] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const [props, setProps] = useState<Omit<
    ConfirmationDialogProps,
    "open" | "onOpenChange" | "onConfirm"
  > | null>(null);

  const confirm = (
    nextProps: Omit<ConfirmationDialogProps, "open" | "onOpenChange" | "onConfirm">
  ): Promise<boolean> => {
    setProps(nextProps);
    setOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = (): void => {
    resolver?.(true);
    setOpen(false);
    setProps(null);
    setResolver(null);
  };

  const handleCancel = (): void => {
    resolver?.(false);
    setOpen(false);
    setProps(null);
    setResolver(null);
  };

  const dialog =
    open && props ? (
      <ConfirmationDialog
        {...props}
        open={open}
        onOpenChange={handleCancel}
        onConfirm={handleConfirm}
      />
    ) : null;

  return { confirm, dialog };
}
