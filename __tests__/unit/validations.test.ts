/**
 * Unit Tests: lib/validations/*
 *
 * Tests for Zod validation schemas including:
 * - User schemas (userSchema, userUpdateSchema, cvUploadSchema)
 * - Analyze schemas (analyzeJobSchema, generateCoverLetterSchema)
 * - Application schemas (applicationCreateSchema, applicationUpdateSchema)
 */

import { describe, expect, it } from "vitest";

// User validations
import {
  cvUploadSchema,
  userPatchSchema,
  userSchema,
  userUpdateSchema,
} from "@/lib/validations/user";

// Analyze validations
import {
  analyzeJobSchema,
  generateCoverLetterSchema,
  jobAnalysisResultSchema,
} from "@/lib/validations/analyze";

// Application validations
import {
  applicationCreateSchema,
  applicationDeleteSchema,
  applicationListSchema,
  applicationStatusSchema,
  applicationUpdateSchema,
} from "@/lib/validations/application";

// ============================================================================
// USER VALIDATIONS
// ============================================================================

describe("userSchema", () => {
  const validUser = {
    name: "John Doe",
    email: "john@example.com",
    location: "New York, NY",
    summary: "Experienced software engineer",
    experience: "5 years at Google",
    skills: "TypeScript, React, Node.js",
  };

  it("accepts valid user data", () => {
    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("accepts optional phone field", () => {
    const result = userSchema.safeParse({ ...validUser, phone: "+1234567890" });
    expect(result.success).toBe(true);
  });

  it("accepts null phone field", () => {
    const result = userSchema.safeParse({ ...validUser, phone: null });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = userSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = userSchema.safeParse({ ...validUser, name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Name is required");
  });

  it("rejects invalid email format", () => {
    const result = userSchema.safeParse({ ...validUser, email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("valid email");
  });

  it("rejects name exceeding max length", () => {
    const result = userSchema.safeParse({ ...validUser, name: "A".repeat(101) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("less than 100");
  });

  it("rejects summary exceeding max length", () => {
    const result = userSchema.safeParse({ ...validUser, summary: "A".repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe("userUpdateSchema", () => {
  const validUpdate = {
    id: "user-123",
    name: "Jane Doe",
    email: "jane@example.com",
    location: "San Francisco, CA",
    summary: "Senior engineer",
    experience: "10 years experience",
    skills: "Python, AWS",
  };

  it("requires id field", () => {
    const { id: _, ...withoutId } = validUpdate;
    const result = userUpdateSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("accepts valid update with id", () => {
    const result = userUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});

describe("userPatchSchema", () => {
  it("allows partial updates with only id", () => {
    const result = userPatchSchema.safeParse({ id: "user-123", name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("requires id for patch updates", () => {
    const result = userPatchSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(false);
  });
});

describe("cvUploadSchema", () => {
  it("accepts valid PDF upload", () => {
    const result = cvUploadSchema.safeParse({
      filename: "resume.pdf",
      contentBase64: "SGVsbG8gV29ybGQ=", // "Hello World" in base64
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid DOCX upload", () => {
    const result = cvUploadSchema.safeParse({
      filename: "resume.docx",
      contentBase64: "SGVsbG8gV29ybGQ=",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported file extensions", () => {
    const result = cvUploadSchema.safeParse({
      filename: "resume.txt",
      contentBase64: "SGVsbG8gV29ybGQ=",
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported mime types", () => {
    const result = cvUploadSchema.safeParse({
      filename: "resume.pdf",
      contentBase64: "SGVsbG8gV29ybGQ=",
      mimeType: "text/plain",
    });
    expect(result.success).toBe(false);
  });

  it("rejects files exceeding size limit", () => {
    const largeContent = "A".repeat(2800001); // Exceeds 2.8MB limit
    const result = cvUploadSchema.safeParse({
      filename: "resume.pdf",
      contentBase64: largeContent,
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("too large");
  });
});

// ============================================================================
// ANALYZE VALIDATIONS
// ============================================================================

describe("analyzeJobSchema", () => {
  it("accepts valid job analysis input", () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: "Looking for a senior engineer...",
      userId: "user-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty job description", () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: "",
      userId: "user-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty user ID", () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: "Looking for a senior engineer...",
      userId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("jobAnalysisResultSchema", () => {
  const validResult = {
    company: "Acme Corp",
    role: "Senior Engineer",
    matchScore: 85,
    topRequirements: ["React", "TypeScript"],
    skillsMatch: ["React"],
    gaps: ["Go experience"],
    redFlags: [],
    keyPoints: ["Remote work", "Good benefits"],
  };

  it("accepts valid analysis result", () => {
    const result = jobAnalysisResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it("rejects match score below 0", () => {
    const result = jobAnalysisResultSchema.safeParse({ ...validResult, matchScore: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects match score above 100", () => {
    const result = jobAnalysisResultSchema.safeParse({ ...validResult, matchScore: 105 });
    expect(result.success).toBe(false);
  });

  it("accepts match score at boundaries", () => {
    expect(jobAnalysisResultSchema.safeParse({ ...validResult, matchScore: 0 }).success).toBe(true);
    expect(jobAnalysisResultSchema.safeParse({ ...validResult, matchScore: 100 }).success).toBe(
      true
    );
  });
});

describe("generateCoverLetterSchema", () => {
  const validInput = {
    jobDescription: "Looking for a senior engineer...",
    userId: "user-123",
    analysis: {
      company: "Acme Corp",
      role: "Senior Engineer",
      matchScore: 85,
      topRequirements: ["React"],
      skillsMatch: ["React"],
      gaps: [],
      redFlags: [],
      keyPoints: ["Great team"],
    },
  };

  it("accepts valid cover letter input", () => {
    const result = generateCoverLetterSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects invalid nested analysis", () => {
    const result = generateCoverLetterSchema.safeParse({
      ...validInput,
      analysis: { ...validInput.analysis, matchScore: 150 },
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// APPLICATION VALIDATIONS
// ============================================================================

describe("applicationStatusSchema", () => {
  it("accepts valid statuses", () => {
    const validStatuses = ["saved", "applied", "interviewing", "offer", "rejected"];
    validStatuses.forEach((status) => {
      expect(applicationStatusSchema.safeParse(status).success).toBe(true);
    });
  });

  it("rejects invalid status", () => {
    const result = applicationStatusSchema.safeParse("pending");
    expect(result.success).toBe(false);
  });
});

describe("applicationCreateSchema", () => {
  const validApplication = {
    userId: "user-123",
    company: "Acme Corp",
    role: "Senior Engineer",
    jobDescription: "Looking for a senior engineer...",
  };

  it("accepts valid application", () => {
    const result = applicationCreateSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = applicationCreateSchema.safeParse({
      ...validApplication,
      jobUrl: "https://example.com/job",
      matchScore: 85,
      analysis: "Good match",
      coverLetter: "Dear Hiring Manager...",
      status: "applied",
    });
    expect(result.success).toBe(true);
  });

  it("provides defaults for optional fields", () => {
    const result = applicationCreateSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
    expect(result.data?.matchScore).toBe(0);
    expect(result.data?.analysis).toBe("");
    expect(result.data?.coverLetter).toBe("");
    expect(result.data?.status).toBe("saved");
  });

  it("rejects invalid job URL", () => {
    const result = applicationCreateSchema.safeParse({
      ...validApplication,
      jobUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects match score out of range", () => {
    expect(applicationCreateSchema.safeParse({ ...validApplication, matchScore: -1 }).success).toBe(
      false
    );
    expect(
      applicationCreateSchema.safeParse({ ...validApplication, matchScore: 101 }).success
    ).toBe(false);
  });
});

describe("applicationUpdateSchema", () => {
  it("requires application ID", () => {
    const result = applicationUpdateSchema.safeParse({ status: "applied" });
    expect(result.success).toBe(false);
  });

  it("accepts valid update with status", () => {
    const result = applicationUpdateSchema.safeParse({
      id: "app-123",
      status: "interviewing",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid update with notes", () => {
    const result = applicationUpdateSchema.safeParse({
      id: "app-123",
      notes: "Had a great first interview",
    });
    expect(result.success).toBe(true);
  });
});

describe("applicationListSchema", () => {
  it("requires user ID", () => {
    const result = applicationListSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid user ID", () => {
    const result = applicationListSchema.safeParse({ userId: "user-123" });
    expect(result.success).toBe(true);
  });
});

describe("applicationDeleteSchema", () => {
  it("requires application ID", () => {
    const result = applicationDeleteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid application ID", () => {
    const result = applicationDeleteSchema.safeParse({ id: "app-123" });
    expect(result.success).toBe(true);
  });
});
