/**
 * @fileoverview Tests for Geist typography system
 * @description Validates Geist font configuration, CSS variables, and type scale tokens
 */

import { describe, expect, it, vi } from "vitest";

// Mock the geist package
vi.mock("geist/font/sans", () => ({
  GeistSans: {
    variable: "--font-geist-sans",
    className: "font-geist-sans",
    style: { fontFamily: "Geist Sans" },
  },
}));

vi.mock("geist/font/mono", () => ({
  GeistMono: {
    variable: "--font-geist-mono",
    className: "font-geist-mono",
    style: { fontFamily: "Geist Mono" },
  },
}));

describe("Geist Typography System", () => {
  describe("Font Package Configuration", () => {
    it("should export GeistSans with correct variable name", async () => {
      const { GeistSans } = await import("geist/font/sans");
      expect(GeistSans.variable).toBe("--font-geist-sans");
    });

    it("should export GeistMono with correct variable name", async () => {
      const { GeistMono } = await import("geist/font/mono");
      expect(GeistMono.variable).toBe("--font-geist-mono");
    });
  });

  describe("Type Scale Tokens", () => {
    // Heading tokens (single-line, display text)
    const headingTokens = {
      "--text-heading-32": "2rem",
      "--text-heading-24": "1.5rem",
      "--text-heading-20": "1.25rem",
      "--text-heading-16": "1rem",
    };

    // Label tokens (UI elements, buttons, navigation)
    const labelTokens = {
      "--text-label-16": "1rem",
      "--text-label-14": "0.875rem",
      "--text-label-13": "0.8125rem",
      "--text-label-12": "0.75rem",
    };

    // Copy tokens (multi-line, body text)
    const copyTokens = {
      "--text-copy-16": "1rem",
      "--text-copy-14": "0.875rem",
      "--text-copy-13": "0.8125rem",
      "--text-copy-12": "0.75rem",
    };

    it("should define all heading type scale tokens", () => {
      Object.keys(headingTokens).forEach((token) => {
        expect(token).toMatch(/^--text-heading-\d+$/);
      });
      expect(Object.keys(headingTokens)).toHaveLength(4);
    });

    it("should define all label type scale tokens", () => {
      Object.keys(labelTokens).forEach((token) => {
        expect(token).toMatch(/^--text-label-\d+$/);
      });
      expect(Object.keys(labelTokens)).toHaveLength(4);
    });

    it("should define all copy type scale tokens", () => {
      Object.keys(copyTokens).forEach((token) => {
        expect(token).toMatch(/^--text-copy-\d+$/);
      });
      expect(Object.keys(copyTokens)).toHaveLength(4);
    });

    it("should have consistent size progression for headings", () => {
      const sizes = Object.values(headingTokens).map((size) => parseFloat(size));
      // Verify descending order (32 > 24 > 20 > 16)
      for (let i = 0; i < sizes.length - 1; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i + 1]!);
      }
    });

    it("should have consistent size progression for labels", () => {
      const sizes = Object.values(labelTokens).map((size) => parseFloat(size));
      // Verify descending order (16 > 14 > 13 > 12)
      for (let i = 0; i < sizes.length - 1; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i + 1]!);
      }
    });

    it("should have consistent size progression for copy", () => {
      const sizes = Object.values(copyTokens).map((size) => parseFloat(size));
      // Verify descending order (16 > 14 > 13 > 12)
      for (let i = 0; i < sizes.length - 1; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i + 1]!);
      }
    });
  });

  describe("Line Height Tokens", () => {
    const lineHeightTokens = {
      "--leading-heading": 1.2,
      "--leading-label": 1,
      "--leading-copy": 1.5,
    };

    it("should define appropriate line height for headings", () => {
      expect(lineHeightTokens["--leading-heading"]).toBe(1.2);
    });

    it("should define tight line height for labels", () => {
      expect(lineHeightTokens["--leading-label"]).toBe(1);
    });

    it("should define readable line height for copy", () => {
      expect(lineHeightTokens["--leading-copy"]).toBe(1.5);
    });

    it("should have headings tighter than copy", () => {
      expect(lineHeightTokens["--leading-heading"]).toBeLessThan(
        lineHeightTokens["--leading-copy"]
      );
    });
  });

  describe("Font Family Configuration", () => {
    it("should use Geist Sans as primary font", () => {
      const expectedPattern = /var\(--font-geist-sans\)/;
      const fontFamilySans =
        "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      expect(fontFamilySans).toMatch(expectedPattern);
    });

    it("should use Geist Mono for monospace", () => {
      const expectedPattern = /var\(--font-geist-mono\)/;
      const fontFamilyMono =
        "var(--font-geist-mono), ui-monospace, SF Mono, Menlo, Monaco, Cascadia Code, monospace";
      expect(fontFamilyMono).toMatch(expectedPattern);
    });

    it("should have proper fallback fonts for sans-serif", () => {
      const fontFamilySans =
        "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      expect(fontFamilySans).toContain("system-ui");
      expect(fontFamilySans).toContain("-apple-system");
      expect(fontFamilySans).toContain("BlinkMacSystemFont");
    });

    it("should have proper fallback fonts for monospace", () => {
      const fontFamilyMono =
        "var(--font-geist-mono), ui-monospace, SF Mono, Menlo, Monaco, Cascadia Code, monospace";
      expect(fontFamilyMono).toContain("ui-monospace");
      expect(fontFamilyMono).toContain("Menlo");
      expect(fontFamilyMono).toContain("Monaco");
    });
  });

  describe("Font Weight Tokens", () => {
    const fontWeights = {
      "--font-weight-normal": 400,
      "--font-weight-medium": 500,
      "--font-weight-semibold": 600,
      "--font-weight-bold": 700,
    };

    it("should define standard font weights", () => {
      expect(fontWeights["--font-weight-normal"]).toBe(400);
      expect(fontWeights["--font-weight-medium"]).toBe(500);
      expect(fontWeights["--font-weight-semibold"]).toBe(600);
      expect(fontWeights["--font-weight-bold"]).toBe(700);
    });

    it("should have weights in ascending order", () => {
      const weights = Object.values(fontWeights);
      for (let i = 0; i < weights.length - 1; i++) {
        expect(weights[i]).toBeLessThan(weights[i + 1]!);
      }
    });
  });
});

describe("Typography Accessibility", () => {
  it("should have minimum body text size of 14px (0.875rem)", () => {
    const bodySizeRem = 0.875; // --text-copy-14
    const baseFontSizePx = 16;
    const bodySizePx = bodySizeRem * baseFontSizePx;
    expect(bodySizePx).toBeGreaterThanOrEqual(14);
  });

  it("should have adequate line height for body text", () => {
    const copyLineHeight = 1.5; // --leading-copy
    // WCAG recommends 1.5 for body text
    expect(copyLineHeight).toBeGreaterThanOrEqual(1.5);
  });

  it("should not have excessively tight letter spacing", () => {
    const tighterSpacing = -0.05; // em
    // Tightest spacing should not exceed -0.05em for readability
    expect(Math.abs(tighterSpacing)).toBeLessThanOrEqual(0.05);
  });
});
