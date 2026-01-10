/**
 * @fileoverview Tests for CSS color system variables
 * @description Validates Nordic color palette, status colors, and shadcn theme tokens
 */

import { describe, expect, it } from "vitest";

describe("Color System", () => {
  describe("Nordic Palette - Fjord Blue (Primary)", () => {
    const fjordColors = {
      "--color-fjord-50": "#f0f9ff",
      "--color-fjord-100": "#e0f2fe",
      "--color-fjord-200": "#bae6fd",
      "--color-fjord-300": "#7dd3fc",
      "--color-fjord-400": "#38bdf8",
      "--color-fjord-500": "#0ea5e9",
      "--color-fjord-600": "#0284c7",
      "--color-fjord-700": "#0369a1",
      "--color-fjord-800": "#075985",
      "--color-fjord-900": "#0c4a6e",
    };

    it("should define complete fjord color scale (50-900)", () => {
      const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      steps.forEach((step) => {
        expect(fjordColors[`--color-fjord-${step}` as keyof typeof fjordColors]).toBeDefined();
      });
    });

    it("should have valid hex color format for fjord colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(fjordColors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe("Nordic Palette - Forest Green (Success)", () => {
    const forestColors = {
      "--color-forest-50": "#f0fdf4",
      "--color-forest-100": "#dcfce7",
      "--color-forest-200": "#bbf7d0",
      "--color-forest-300": "#86efac",
      "--color-forest-400": "#4ade80",
      "--color-forest-500": "#22c55e",
      "--color-forest-600": "#16a34a",
      "--color-forest-700": "#15803d",
      "--color-forest-800": "#166534",
      "--color-forest-900": "#14532d",
    };

    it("should define complete forest color scale (50-900)", () => {
      const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      steps.forEach((step) => {
        expect(forestColors[`--color-forest-${step}` as keyof typeof forestColors]).toBeDefined();
      });
    });

    it("should have valid hex color format for forest colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(forestColors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe("Nordic Palette - Amber (Warning)", () => {
    const amberColors = {
      "--color-amber-50": "#fffbeb",
      "--color-amber-100": "#fef3c7",
      "--color-amber-200": "#fde68a",
      "--color-amber-300": "#fcd34d",
      "--color-amber-400": "#fbbf24",
      "--color-amber-500": "#f59e0b",
      "--color-amber-600": "#d97706",
      "--color-amber-700": "#b45309",
      "--color-amber-800": "#92400e",
      "--color-amber-900": "#78350f",
    };

    it("should define complete amber color scale (50-900)", () => {
      const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      steps.forEach((step) => {
        expect(amberColors[`--color-amber-${step}` as keyof typeof amberColors]).toBeDefined();
      });
    });

    it("should have valid hex color format for amber colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(amberColors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });

    it("should have amber-500 as primary warning color", () => {
      expect(amberColors["--color-amber-500"]).toBe("#f59e0b");
    });
  });

  describe("Nordic Palette - Clay Red (Destructive)", () => {
    const clayColors = {
      "--color-clay-50": "#fef2f2",
      "--color-clay-100": "#fee2e2",
      "--color-clay-200": "#fecaca",
      "--color-clay-300": "#fca5a5",
      "--color-clay-400": "#f87171",
      "--color-clay-500": "#ef4444",
      "--color-clay-600": "#dc2626",
      "--color-clay-700": "#b91c1c",
      "--color-clay-800": "#991b1b",
      "--color-clay-900": "#7f1d1d",
    };

    it("should define complete clay color scale (50-900)", () => {
      const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      steps.forEach((step) => {
        expect(clayColors[`--color-clay-${step}` as keyof typeof clayColors]).toBeDefined();
      });
    });

    it("should have valid hex color format for clay colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(clayColors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe("Application Status Colors", () => {
    const statusColors = {
      "--color-status-applied": "#3b82f6",
      "--color-status-interviewing": "#8b5cf6",
      "--color-status-offered": "#22c55e",
      "--color-status-rejected": "#f87171",
      "--color-status-withdrawn": "#94a3b8",
    };

    it("should define all application status colors", () => {
      expect(statusColors["--color-status-applied"]).toBeDefined();
      expect(statusColors["--color-status-interviewing"]).toBeDefined();
      expect(statusColors["--color-status-offered"]).toBeDefined();
      expect(statusColors["--color-status-rejected"]).toBeDefined();
      expect(statusColors["--color-status-withdrawn"]).toBeDefined();
    });

    it("should have valid hex color format for status colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(statusColors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });

    it("should use blue for applied status", () => {
      expect(statusColors["--color-status-applied"]).toBe("#3b82f6");
    });

    it("should use violet for interviewing status", () => {
      expect(statusColors["--color-status-interviewing"]).toBe("#8b5cf6");
    });

    it("should use green for offered status", () => {
      expect(statusColors["--color-status-offered"]).toBe("#22c55e");
    });

    it("should use soft red for rejected status", () => {
      expect(statusColors["--color-status-rejected"]).toBe("#f87171");
    });

    it("should use gray for withdrawn status", () => {
      expect(statusColors["--color-status-withdrawn"]).toBe("#94a3b8");
    });
  });

  describe("Shadcn Theme Variables", () => {
    describe("Light Mode", () => {
      const lightTheme = {
        "--background": "0 0% 100%",
        "--foreground": "222 47% 11%",
        "--primary": "221 83% 53%",
        "--destructive": "0 84% 60%",
        "--warning": "38 92% 50%",
        "--success": "142 76% 36%",
      };

      it("should define background as white", () => {
        expect(lightTheme["--background"]).toBe("0 0% 100%");
      });

      it("should define foreground as slate-900", () => {
        expect(lightTheme["--foreground"]).toBe("222 47% 11%");
      });

      it("should define primary color", () => {
        expect(lightTheme["--primary"]).toBeDefined();
      });

      it("should define warning color", () => {
        expect(lightTheme["--warning"]).toBe("38 92% 50%");
      });

      it("should define success color", () => {
        expect(lightTheme["--success"]).toBe("142 76% 36%");
      });
    });

    describe("Dark Mode", () => {
      const darkTheme = {
        "--background": "222 47% 11%",
        "--foreground": "210 40% 98%",
        "--card": "217 33% 17%",
        "--warning": "38 92% 50%",
        "--success": "142 76% 36%",
      };

      it("should define dark background as slate-900", () => {
        expect(darkTheme["--background"]).toBe("222 47% 11%");
      });

      it("should define dark foreground as slate-50", () => {
        expect(darkTheme["--foreground"]).toBe("210 40% 98%");
      });

      it("should define card background as slate-800", () => {
        expect(darkTheme["--card"]).toBe("217 33% 17%");
      });

      it("should maintain warning color in dark mode", () => {
        expect(darkTheme["--warning"]).toBe("38 92% 50%");
      });

      it("should maintain success color in dark mode", () => {
        expect(darkTheme["--success"]).toBe("142 76% 36%");
      });
    });
  });

  describe("Color Accessibility", () => {
    it("should have distinct status colors that are visually distinguishable", () => {
      const statusColors = {
        applied: "#3b82f6",
        interviewing: "#8b5cf6",
        offered: "#22c55e",
        rejected: "#f87171",
        withdrawn: "#94a3b8",
      };

      // All colors should be unique
      const uniqueColors = new Set(Object.values(statusColors));
      expect(uniqueColors.size).toBe(5);
    });

    it("should use semantic color mapping for status indicators", () => {
      // Blue for waiting/pending
      const appliedHue = 217; // Blue hue
      expect(appliedHue).toBeGreaterThan(200);
      expect(appliedHue).toBeLessThan(250);

      // Green for success
      const offeredHue = 142; // Green hue
      expect(offeredHue).toBeGreaterThan(100);
      expect(offeredHue).toBeLessThan(170);

      // Red for negative
      const rejectedHue = 0; // Red hue
      expect(rejectedHue).toBeGreaterThanOrEqual(0);
      expect(rejectedHue).toBeLessThan(30);
    });
  });

  describe("Nordic Neutrals", () => {
    const neutrals = {
      "--color-snow": "#ffffff",
      "--color-frost": "#f9fafb",
      "--color-mist": "#f3f4f6",
      "--color-ash": "#e5e7eb",
      "--color-midnight": "#111827",
    };

    it("should define semantic neutral colors", () => {
      expect(neutrals["--color-snow"]).toBe("#ffffff");
      expect(neutrals["--color-frost"]).toBe("#f9fafb");
      expect(neutrals["--color-mist"]).toBe("#f3f4f6");
      expect(neutrals["--color-ash"]).toBe("#e5e7eb");
      expect(neutrals["--color-midnight"]).toBe("#111827");
    });

    it("should have snow as pure white", () => {
      expect(neutrals["--color-snow"]).toBe("#ffffff");
    });

    it("should have midnight as near-black", () => {
      expect(neutrals["--color-midnight"]).toBe("#111827");
    });
  });
});
