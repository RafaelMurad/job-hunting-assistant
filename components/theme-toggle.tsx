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

type ThemeOption = "light" | "system" | "dark";

const themeOptions: { value: ThemeOption; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light mode" },
  { value: "system", icon: Monitor, label: "System preference" },
  { value: "dark", icon: Moon, label: "Dark mode" },
];

/**
 * Animated theme toggle with sliding pill indicator
 * Allows users to switch between light, system, and dark themes
 */
export function ThemeToggle(): JSX.Element {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  // Get the index for the sliding indicator position
  const getIndicatorPosition = (): number => {
    if (!mounted) return 1; // Default to system
    const index = themeOptions.findIndex((opt) => opt.value === theme);
    return index === -1 ? 1 : index;
  };

  const indicatorPosition = getIndicatorPosition();

  if (!mounted) {
    // SSR/hydration placeholder with same dimensions
    return (
      <div
        className="flex h-9 items-center gap-0.5 rounded-full bg-slate-100 p-1 dark:bg-slate-800"
        aria-label="Loading theme toggle"
      >
        {themeOptions.map((option) => (
          <div
            key={option.value}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400"
          >
            <option.icon className="h-4 w-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative flex h-9 items-center gap-0.5 rounded-full bg-slate-100 p-1 dark:bg-slate-800"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {/* Sliding indicator */}
      <div
        className="absolute h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-slate-600"
        style={{
          transform: `translateX(calc(${indicatorPosition} * (1.75rem + 0.125rem)))`,
          left: "0.25rem",
        }}
        aria-hidden="true"
      />

      {/* Theme buttons */}
      {themeOptions.map((option) => {
        const isSelected = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            onClick={() => setTheme(option.value)}
            className={`
              relative z-10 flex h-7 w-7 items-center justify-center rounded-full
              transition-colors duration-200
              ${
                isSelected
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }
            `}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
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
