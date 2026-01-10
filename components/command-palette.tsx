"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Search,
  ClipboardList,
  Settings,
  Plus,
  FileText,
  Upload,
  Keyboard,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Navigation items for the command palette
 */
const navigationItems = [
  {
    icon: LayoutDashboard,
    label: "Go to Dashboard",
    href: "/dashboard",
    shortcut: "g d",
  },
  {
    icon: User,
    label: "Go to Profile",
    href: "/profile",
    shortcut: "g p",
  },
  {
    icon: Search,
    label: "Go to Analyze",
    href: "/analyze",
    shortcut: "g a",
  },
  {
    icon: ClipboardList,
    label: "Go to Tracker",
    href: "/tracker",
    shortcut: "g t",
  },
  {
    icon: FileText,
    label: "Go to CV Editor",
    href: "/cv",
    shortcut: "g c",
  },
  {
    icon: Settings,
    label: "Go to Settings",
    href: "/settings",
    shortcut: "g s",
  },
];

/**
 * Action items for the command palette
 */
const actionItems = [
  {
    icon: Plus,
    label: "New Application",
    action: "new-application",
  },
  {
    icon: Search,
    label: "Analyze Job URL",
    action: "analyze-job",
  },
  {
    icon: Upload,
    label: "Upload CV",
    action: "upload-cv",
  },
];

/**
 * Keyboard shortcuts for the help modal
 */
const keyboardShortcuts = [
  { keys: ["⌘", "K"], description: "Open command palette" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close dialog" },
  { keys: ["g", "d"], description: "Go to Dashboard" },
  { keys: ["g", "p"], description: "Go to Profile" },
  { keys: ["g", "a"], description: "Go to Analyze" },
  { keys: ["g", "t"], description: "Go to Tracker" },
  { keys: ["g", "c"], description: "Go to CV Editor" },
  { keys: ["g", "s"], description: "Go to Settings" },
];

interface CommandPaletteProps {
  /**
   * Callback when an action is triggered
   */
  onAction?: (action: string) => void;
}

/**
 * Command Palette component with keyboard navigation
 * Triggered by ⌘K (Mac) or Ctrl+K (Windows/Linux)
 * Also supports ? for showing keyboard shortcuts
 */
export function CommandPalette({ onAction }: CommandPaletteProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const router = useRouter();

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ⌘K or Ctrl+K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }

    // ? to show keyboard shortcuts (when not in an input)
    if (e.key === "?" && !isInputElement(e.target)) {
      e.preventDefault();
      setShowShortcuts(true);
    }

    // Escape to close
    if (e.key === "Escape") {
      setOpen(false);
      setShowShortcuts(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle navigation
  const handleNavigation = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Handle actions
  const handleAction = useCallback(
    (action: string) => {
      setOpen(false);

      // Default action handlers
      switch (action) {
        case "new-application":
          router.push("/tracker?action=new");
          break;
        case "analyze-job":
          router.push("/analyze");
          break;
        case "upload-cv":
          router.push("/profile?action=upload");
          break;
        default:
          onAction?.(action);
      }
    },
    [router, onAction]
  );

  return (
    <>
      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleNavigation(item.href)}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Actions Group */}
          <CommandGroup heading="Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.action}
                onSelect={() => handleAction(item.action)}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Help */}
          <CommandGroup heading="Help">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                setShowShortcuts(true);
              }}
              className="cursor-pointer"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>Quick navigation and actions for power users.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false;
  const element = target as HTMLElement;
  const tagName = element.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

/**
 * Export navigation and action items for testing
 */
export { navigationItems, actionItems, keyboardShortcuts };
