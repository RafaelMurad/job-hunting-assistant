/**
 * Unit Tests for CV Validation Schemas
 *
 * Tests the Zod schemas used for CV CRUD operations.
 * These are the same schemas used in lib/trpc/routers/cv.ts.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

// Re-create schemas to test (same as in cv router)
const cvCreateSchema = z.object({
  name: z.string().min(1).max(100),
  pdfUrl: z.string().url().optional(),
  latexUrl: z.string().url().optional(),
  latexContent: z.string().optional(),
  isActive: z.boolean().optional().default(false),
});

const cvUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  pdfUrl: z.string().url().optional().nullable(),
  latexUrl: z.string().url().optional().nullable(),
  latexContent: z.string().optional().nullable(),
});

const cvIdSchema = z.object({
  id: z.string().min(1),
});

describe("CV Validation Schemas", () => {
  describe("cvCreateSchema", () => {
    it("accepts valid minimal input", () => {
      const result = cvCreateSchema.safeParse({ name: "My CV" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My CV");
        expect(result.data.isActive).toBe(false); // default
      }
    });

    it("accepts valid complete input", () => {
      const input = {
        name: "Software Engineer CV",
        pdfUrl: "https://example.com/cv.pdf",
        latexUrl: "https://example.com/cv.tex",
        latexContent: "\\documentclass{article}...",
        isActive: true,
      };
      const result = cvCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("rejects empty name", () => {
      const result = cvCreateSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("rejects name exceeding 100 characters", () => {
      const result = cvCreateSchema.safeParse({ name: "a".repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].path).toContain("name");
        expect(result.error.issues[0].message).toContain("100");
      }
    });

    it("accepts name at exactly 100 characters", () => {
      const result = cvCreateSchema.safeParse({ name: "a".repeat(100) });
      expect(result.success).toBe(true);
    });

    it("rejects invalid pdfUrl", () => {
      const result = cvCreateSchema.safeParse({
        name: "My CV",
        pdfUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].path).toContain("pdfUrl");
      }
    });

    it("rejects invalid latexUrl", () => {
      const result = cvCreateSchema.safeParse({
        name: "My CV",
        latexUrl: "invalid-url",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid URLs with different protocols", () => {
      const result = cvCreateSchema.safeParse({
        name: "My CV",
        pdfUrl: "https://blob.vercel-storage.com/abc123.pdf",
        latexUrl: "https://blob.vercel-storage.com/abc123.tex",
      });
      expect(result.success).toBe(true);
    });

    it("defaults isActive to false when not provided", () => {
      const result = cvCreateSchema.safeParse({ name: "My CV" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("accepts latexContent as empty string", () => {
      const result = cvCreateSchema.safeParse({
        name: "My CV",
        latexContent: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts latexContent with LaTeX special characters", () => {
      const latexContent = `
\\documentclass[11pt]{article}
\\usepackage{hyperref}
\\begin{document}
\\section{Experience}
50\\% improvement
\\end{document}
      `;
      const result = cvCreateSchema.safeParse({
        name: "My CV",
        latexContent,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("cvUpdateSchema", () => {
    it("accepts valid update with id only", () => {
      const result = cvUpdateSchema.safeParse({ id: "cv_123" });
      expect(result.success).toBe(true);
    });

    it("accepts valid partial update", () => {
      const result = cvUpdateSchema.safeParse({
        id: "cv_123",
        name: "Updated CV Name",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Updated CV Name");
      }
    });

    it("accepts null values for optional URLs", () => {
      const result = cvUpdateSchema.safeParse({
        id: "cv_123",
        pdfUrl: null,
        latexUrl: null,
        latexContent: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pdfUrl).toBeNull();
        expect(result.data.latexUrl).toBeNull();
        expect(result.data.latexContent).toBeNull();
      }
    });

    it("rejects empty id", () => {
      const result = cvUpdateSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].path).toContain("id");
      }
    });

    it("rejects missing id", () => {
      const result = cvUpdateSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid pdfUrl when provided", () => {
      const result = cvUpdateSchema.safeParse({
        id: "cv_123",
        pdfUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("accepts full update with all fields", () => {
      const result = cvUpdateSchema.safeParse({
        id: "cv_123",
        name: "Full Update CV",
        pdfUrl: "https://example.com/new.pdf",
        latexUrl: "https://example.com/new.tex",
        latexContent: "\\documentclass{article}\\begin{document}Updated\\end{document}",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("cvIdSchema", () => {
    it("accepts valid id", () => {
      const result = cvIdSchema.safeParse({ id: "cv_abc123" });
      expect(result.success).toBe(true);
    });

    it("accepts CUID format", () => {
      const result = cvIdSchema.safeParse({ id: "clxyz1234567890abcdef" });
      expect(result.success).toBe(true);
    });

    it("rejects empty id", () => {
      const result = cvIdSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing id", () => {
      const result = cvIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects null id", () => {
      const result = cvIdSchema.safeParse({ id: null });
      expect(result.success).toBe(false);
    });

    it("rejects non-string id", () => {
      const result = cvIdSchema.safeParse({ id: 12345 });
      expect(result.success).toBe(false);
    });
  });

  describe("Business Rule Validations", () => {
    it("name allows common CV naming patterns", () => {
      const validNames = [
        "Software Engineer CV",
        "Resume - 2026",
        "Tech Lead (Updated)",
        "CV_v2",
        "Frontend Specialist - Jan 2026",
        "AI/ML Focus",
      ];

      for (const name of validNames) {
        const result = cvCreateSchema.safeParse({ name });
        expect(result.success).toBe(true);
      }
    });

    it("accepts Unicode characters in name", () => {
      const result = cvCreateSchema.safeParse({ name: "履歴書 - Software Engineer" });
      expect(result.success).toBe(true);
    });

    it("accepts emojis in name", () => {
      const result = cvCreateSchema.safeParse({ name: "🚀 Startup Resume" });
      expect(result.success).toBe(true);
    });
  });
});
