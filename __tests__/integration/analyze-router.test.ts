/**
 * Integration Tests: Analyze tRPC Router Logic
 *
 * Tests the analyze router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Mock AI functions to avoid external API calls
 * - Test analyzeJob and generateCoverLetter procedures
 * - Verify user profile requirements
 */

import type { JobAnalysisResult } from "@/lib/ai";
import type { PrismaClient, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Mock the AI module
vi.mock("@/lib/ai", () => ({
  analyzeJob: vi.fn(),
  generateCoverLetter: vi.fn(),
}));

// Import mocked functions
import { analyzeJob, generateCoverLetter } from "@/lib/ai";

// Sample user context for tests
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
};

// Sample user data with profile
const mockUserWithProfile: User = {
  id: "user-123",
  name: "John Developer",
  email: "john@example.com",
  phone: "+1234567890",
  location: "San Francisco, CA",
  neonAuthId: "neon-123",
  summary: "Full-stack developer with 5 years of experience",
  experience: "Senior Engineer at TechCorp (2020-present)",
  skills: "TypeScript, React, Node.js, PostgreSQL",
  cvPdfUrl: null,
  cvLatexUrl: null,
  cvFilename: null,
  cvUploadedAt: null,
  role: "USER",
  isTrusted: false,
  isVerified: false,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Sample job analysis result
const mockAnalysisResult: JobAnalysisResult = {
  company: "Acme Corp",
  role: "Senior Frontend Engineer",
  matchScore: 85,
  topRequirements: ["React expertise", "TypeScript proficiency", "5+ years experience"],
  skillsMatch: ["React", "TypeScript", "Node.js"],
  gaps: ["GraphQL experience"],
  redFlags: [],
  keyPoints: ["Remote-first company", "Good culture fit"],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildUserCV(user: User): string {
  return `
Name: ${user.name}
Email: ${user.email}
Location: ${user.location}

Professional Summary:
${user.summary}

Work Experience:
${user.experience}

Skills:
${user.skills}
  `.trim();
}

// =============================================================================
// SIMULATE ROUTER LOGIC
// =============================================================================

// Simulates: analyzeRouter.analyzeJob
async function analyzeJobLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: { jobDescription: string },
  analyzeJobFn: typeof analyzeJob
): Promise<JobAnalysisResult> {
  // Get authenticated user's CV data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found. Please set up your profile first.",
    });
  }

  // Build CV string and analyze
  const userCV = buildUserCV(user);
  return analyzeJobFn(input.jobDescription, userCV);
}

// Simulates: analyzeRouter.generateCoverLetter
async function generateCoverLetterLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: {
    jobDescription: string;
    analysis: JobAnalysisResult;
  },
  generateCoverLetterFn: typeof generateCoverLetter
): Promise<{ coverLetter: string }> {
  // Get authenticated user's CV data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found. Please set up your profile first.",
    });
  }

  // Build CV string and generate cover letter
  const userCV = buildUserCV(user);
  const coverLetter = await generateCoverLetterFn(input.analysis, userCV);

  return { coverLetter };
}

// =============================================================================
// TESTS
// =============================================================================

describe("Analyze Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("analyzeJob", () => {
    const jobDescription = `
      We're looking for a Senior Frontend Engineer to join our team.
      Requirements:
      - 5+ years of React experience
      - TypeScript proficiency
      - Experience with modern build tools
    `;

    it("analyzes job successfully with user profile", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(analyzeJob).mockResolvedValue(mockAnalysisResult);

      const result = await analyzeJobLogic(
        prismaMock,
        mockUser.id,
        { jobDescription },
        analyzeJob as typeof analyzeJob
      );

      expect(result.company).toBe("Acme Corp");
      expect(result.matchScore).toBe(85);
      expect(result.skillsMatch).toContain("React");
    });

    it("passes user CV to AI analysis", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(analyzeJob).mockResolvedValue(mockAnalysisResult);

      await analyzeJobLogic(
        prismaMock,
        mockUser.id,
        { jobDescription },
        analyzeJob as typeof analyzeJob
      );

      expect(analyzeJob).toHaveBeenCalledWith(
        jobDescription,
        expect.stringContaining("John Developer")
      );
      expect(analyzeJob).toHaveBeenCalledWith(
        jobDescription,
        expect.stringContaining("Full-stack developer")
      );
    });

    it("throws NOT_FOUND when user profile is missing", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        analyzeJobLogic(
          prismaMock,
          mockUser.id,
          { jobDescription },
          analyzeJob as typeof analyzeJob
        )
      ).rejects.toThrow(TRPCError);

      await expect(
        analyzeJobLogic(
          prismaMock,
          mockUser.id,
          { jobDescription },
          analyzeJob as typeof analyzeJob
        )
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "User not found. Please set up your profile first.",
      });
    });

    it("handles AI analysis errors", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(analyzeJob).mockRejectedValue(new Error("AI service unavailable"));

      await expect(
        analyzeJobLogic(
          prismaMock,
          mockUser.id,
          { jobDescription },
          analyzeJob as typeof analyzeJob
        )
      ).rejects.toThrow("AI service unavailable");
    });

    it("builds CV with all user fields", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(analyzeJob).mockResolvedValue(mockAnalysisResult);

      await analyzeJobLogic(
        prismaMock,
        mockUser.id,
        { jobDescription },
        analyzeJob as typeof analyzeJob
      );

      const cvArg = vi.mocked(analyzeJob).mock.calls[0]?.[1];
      expect(cvArg).toContain("John Developer");
      expect(cvArg).toContain("john@example.com");
      expect(cvArg).toContain("San Francisco, CA");
      expect(cvArg).toContain("Full-stack developer with 5 years of experience");
      expect(cvArg).toContain("Senior Engineer at TechCorp");
      expect(cvArg).toContain("TypeScript, React, Node.js, PostgreSQL");
    });
  });

  describe("generateCoverLetter", () => {
    const mockCoverLetter = `
Dear Hiring Manager,

I am excited to apply for the Senior Frontend Engineer position at Acme Corp.
With my 5 years of experience in React and TypeScript, I am confident I would be a great fit.

Best regards,
John Developer
    `.trim();

    it("generates cover letter successfully", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(generateCoverLetter).mockResolvedValue(mockCoverLetter);

      const result = await generateCoverLetterLogic(
        prismaMock,
        mockUser.id,
        { jobDescription: "Frontend role", analysis: mockAnalysisResult },
        generateCoverLetter as typeof generateCoverLetter
      );

      expect(result.coverLetter).toContain("Dear Hiring Manager");
      expect(result.coverLetter).toContain("Acme Corp");
    });

    it("passes analysis and CV to generation function", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(generateCoverLetter).mockResolvedValue(mockCoverLetter);

      await generateCoverLetterLogic(
        prismaMock,
        mockUser.id,
        { jobDescription: "Frontend role", analysis: mockAnalysisResult },
        generateCoverLetter as typeof generateCoverLetter
      );

      expect(generateCoverLetter).toHaveBeenCalledWith(
        mockAnalysisResult,
        expect.stringContaining("John Developer")
      );
    });

    it("throws NOT_FOUND when user profile is missing", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        generateCoverLetterLogic(
          prismaMock,
          mockUser.id,
          { jobDescription: "Frontend role", analysis: mockAnalysisResult },
          generateCoverLetter as typeof generateCoverLetter
        )
      ).rejects.toThrow(TRPCError);
    });

    it("handles AI generation errors", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(generateCoverLetter).mockRejectedValue(new Error("Generation failed"));

      await expect(
        generateCoverLetterLogic(
          prismaMock,
          mockUser.id,
          { jobDescription: "Frontend role", analysis: mockAnalysisResult },
          generateCoverLetter as typeof generateCoverLetter
        )
      ).rejects.toThrow("Generation failed");
    });

    it("uses analysis data for personalization", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithProfile);
      vi.mocked(generateCoverLetter).mockResolvedValue(mockCoverLetter);

      await generateCoverLetterLogic(
        prismaMock,
        mockUser.id,
        { jobDescription: "Frontend role", analysis: mockAnalysisResult },
        generateCoverLetter as typeof generateCoverLetter
      );

      const analysisArg = vi.mocked(generateCoverLetter).mock.calls[0]?.[0];
      expect(analysisArg?.company).toBe("Acme Corp");
      expect(analysisArg?.role).toBe("Senior Frontend Engineer");
      expect(analysisArg?.matchScore).toBe(85);
    });
  });

  describe("buildUserCV helper", () => {
    it("formats CV correctly with all fields", () => {
      const cv = buildUserCV(mockUserWithProfile);

      expect(cv).toContain("Name: John Developer");
      expect(cv).toContain("Email: john@example.com");
      expect(cv).toContain("Location: San Francisco, CA");
      expect(cv).toContain("Professional Summary:");
      expect(cv).toContain("Work Experience:");
      expect(cv).toContain("Skills:");
    });

    it("handles empty optional fields gracefully", () => {
      const userWithEmpty = {
        ...mockUserWithProfile,
        summary: "",
        experience: "",
        skills: "",
      };

      const cv = buildUserCV(userWithEmpty);

      expect(cv).toContain("Name: John Developer");
      expect(cv).toContain("Professional Summary:");
    });
  });
});
