"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import { useSyncExternalStore } from "react";

/**
 * Hook to safely check if component is mounted (SSR-safe)
 * Uses useSyncExternalStore for proper React 18+ hydration
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Compact theme toggle button
 * Cycles through: light → dark → system → light
 * Shows icon representing what you'll switch TO (or current for system)
 */
export function ThemeToggle(): JSX.Element {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  // Cycle: light → dark → system → light
  const cycleTheme = (): void => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // Get icon and label based on current theme
  const getIconAndLabel = (): { Icon: typeof Sun; label: string } => {
    if (!mounted) return { Icon: Monitor, label: "Loading theme" };

    switch (theme) {
      case "light":
        // In light mode, show moon (click to go dark)
        return { Icon: Moon, label: "Switch to dark mode" };
      case "dark":
        // In dark mode, show sun (click to go system)
        return { Icon: Sun, label: "Switch to system theme" };
      case "system":
      default:
        // In system mode, show monitor
        return { Icon: Monitor, label: "Switch to light mode" };
    }
  };

  const { Icon, label } = getIconAndLabel();

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400"
        disabled
        aria-label="Loading theme toggle"
      >
        <Monitor className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      onClick={cycleTheme}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/**
 * Simple theme toggle button (no dropdown)
 * Toggles between light and dark mode only
 */
export function ThemeToggleSimple(): JSX.Element {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400"
        disabled
        aria-label="Loading theme toggle"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
