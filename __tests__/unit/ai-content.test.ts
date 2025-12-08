/**
 * AI Content Extraction Tests
 *
 * Tests for CV content parsing and Zod validation.
 */

import { describe, it, expect } from "vitest";
import { parseExtractedContent, extractedCVContentSchema } from "@/lib/ai";

describe("AI Content Extraction", () => {
  describe("extractedCVContentSchema", () => {
    it("should validate a complete valid CV content", () => {
      const validContent = {
        name: "John Doe",
        title: "Software Engineer",
        contact: {
          email: "john@example.com",
          phone: "+1234567890",
          location: "San Francisco, CA",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe",
        },
        summary: "Experienced software engineer with 10 years...",
        skills: [
          { category: "Frontend", items: "React, TypeScript, CSS" },
          { category: "Backend", items: "Node.js, Python, Go" },
        ],
        experience: [
          {
            title: "Senior Engineer",
            company: "Tech Corp",
            location: "Remote",
            startDate: "Jan 2020",
            endDate: "Present",
            bullets: ["Led team of 5", "Built microservices"],
          },
        ],
        education: [
          {
            degree: "BS Computer Science",
            institution: "MIT",
            startDate: "2010",
            endDate: "2014",
          },
        ],
      };

      const result = extractedCVContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it("should require name field", () => {
      const missingName = {
        title: "Software Engineer",
        contact: { email: "", phone: "", location: "" },
      };

      const result = extractedCVContentSchema.safeParse(missingName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
      }
    });

    it("should require title field", () => {
      const missingTitle = {
        name: "John Doe",
        contact: { email: "", phone: "", location: "" },
      };

      const result = extractedCVContentSchema.safeParse(missingTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("title"))).toBe(true);
      }
    });

    it("should reject empty name", () => {
      const emptyName = {
        name: "",
        title: "Engineer",
        contact: { email: "", phone: "", location: "" },
      };

      const result = extractedCVContentSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });

    it("should provide defaults for optional arrays", () => {
      const minimalContent = {
        name: "Jane Doe",
        title: "Designer",
        contact: {},
      };

      const result = extractedCVContentSchema.safeParse(minimalContent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toEqual([]);
        expect(result.data.experience).toEqual([]);
        expect(result.data.education).toEqual([]);
        expect(result.data.summary).toBe("");
      }
    });

    it("should validate experience structure", () => {
      const invalidExperience = {
        name: "John",
        title: "Dev",
        contact: {},
        experience: [
          {
            // Missing required fields
            company: "Corp",
          },
        ],
      };

      const result = extractedCVContentSchema.safeParse(invalidExperience);
      expect(result.success).toBe(false);
    });

    it("should validate skill category structure", () => {
      const invalidSkills = {
        name: "John",
        title: "Dev",
        contact: {},
        skills: [
          {
            // Missing category or items
            name: "Frontend",
          },
        ],
      };

      const result = extractedCVContentSchema.safeParse(invalidSkills);
      expect(result.success).toBe(false);
    });
  });

  describe("parseExtractedContent", () => {
    it("should parse valid JSON string", () => {
      const jsonString = JSON.stringify({
        name: "Test User",
        title: "Developer",
        contact: {
          email: "test@test.com",
          phone: "123",
          location: "NYC",
        },
        summary: "A summary",
        skills: [],
        experience: [],
        education: [],
      });

      const result = parseExtractedContent(jsonString);
      expect(result.name).toBe("Test User");
      expect(result.title).toBe("Developer");
    });

    it("should strip markdown code blocks from response", () => {
      const withCodeBlock = `\`\`\`json
{
  "name": "Markdown User",
  "title": "Tester",
  "contact": { "email": "", "phone": "", "location": "" }
}
\`\`\``;

      const result = parseExtractedContent(withCodeBlock);
      expect(result.name).toBe("Markdown User");
    });

    it("should strip json code blocks without language tag", () => {
      const withCodeBlock = `\`\`\`
{
  "name": "Plain Block",
  "title": "Engineer",
  "contact": {}
}
\`\`\``;

      const result = parseExtractedContent(withCodeBlock);
      expect(result.name).toBe("Plain Block");
    });

    it("should throw on invalid JSON", () => {
      const invalidJson = "{ invalid json }";

      expect(() => parseExtractedContent(invalidJson)).toThrow(
        "Failed to parse CV content: Invalid JSON response from AI"
      );
    });

    it("should throw on missing required fields", () => {
      const missingFields = JSON.stringify({
        contact: {},
      });

      expect(() => parseExtractedContent(missingFields)).toThrow("Failed to parse CV content:");
    });

    it("should include field path in error message", () => {
      const missingName = JSON.stringify({
        title: "Dev",
        contact: {},
      });

      try {
        parseExtractedContent(missingName);
        expect.fail("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("name");
      }
    });

    it("should handle whitespace around JSON", () => {
      const withWhitespace = `
      
      {
        "name": "Whitespace User",
        "title": "QA",
        "contact": {}
      }
      
      `;

      const result = parseExtractedContent(withWhitespace);
      expect(result.name).toBe("Whitespace User");
    });

    it("should preserve optional fields when present", () => {
      const withOptionals = JSON.stringify({
        name: "Full User",
        title: "Engineer",
        contact: {
          email: "full@test.com",
          phone: "555",
          location: "LA",
          linkedin: "https://linkedin.com/in/full",
          github: "https://github.com/full",
          website: "https://full.dev",
        },
        summary: "Expert engineer",
        skills: [{ category: "Code", items: "TS, JS" }],
        experience: [
          {
            title: "Lead",
            company: "Startup",
            location: "Remote",
            startDate: "2022",
            endDate: "Present",
            bullets: ["Did stuff"],
          },
        ],
        education: [
          {
            degree: "PhD",
            institution: "Stanford",
            startDate: "2015",
            endDate: "2020",
          },
        ],
        projects: [
          {
            name: "Side Project",
            url: "https://project.com",
            bullets: ["Built it"],
          },
        ],
        certifications: ["AWS Certified"],
        languages: [{ language: "English", level: "Native" }],
      });

      const result = parseExtractedContent(withOptionals);
      expect(result.contact.linkedin).toBe("https://linkedin.com/in/full");
      expect(result.projects).toHaveLength(1);
      expect(result.certifications).toContain("AWS Certified");
      expect(result.languages).toHaveLength(1);
    });
  });
});
