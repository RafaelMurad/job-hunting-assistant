import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Mock applications for when database is unavailable
const MOCK_APPLICATIONS = [
  {
    id: "mock-app-1",
    userId: "mock-user-1",
    company: "TechCorp Inc.",
    role: "Senior Frontend Engineer",
    jobDescription: "We are looking for a Senior Frontend Engineer...",
    jobUrl: "https://example.com/job/1",
    matchScore: 85,
    analysis: JSON.stringify({ topRequirements: ["React", "TypeScript"], skillsMatch: ["React", "TypeScript", "Next.js"], gaps: ["GraphQL"], redFlags: [] }),
    coverLetter: "Dear Hiring Manager...",
    status: "applied",
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-app-2",
    userId: "mock-user-1",
    company: "StartupXYZ",
    role: "Full Stack Developer",
    jobDescription: "Join our growing team...",
    jobUrl: "https://example.com/job/2",
    matchScore: 72,
    analysis: JSON.stringify({ topRequirements: ["Node.js", "React"], skillsMatch: ["React", "Node.js"], gaps: ["Python"], redFlags: [] }),
    coverLetter: "Dear Hiring Manager...",
    status: "interviewing",
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Phone screen scheduled",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-app-3",
    userId: "mock-user-1",
    company: "BigTech Co",
    role: "React Developer",
    jobDescription: "Looking for a React specialist...",
    jobUrl: null,
    matchScore: 91,
    analysis: JSON.stringify({ topRequirements: ["React", "Redux"], skillsMatch: ["React", "TypeScript", "Redux"], gaps: [], redFlags: [] }),
    coverLetter: "",
    status: "saved",
    appliedAt: null,
    notes: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET all applications
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications (using mock):", error);
    // Return mock applications when database is unavailable
    return NextResponse.json(MOCK_APPLICATIONS);
  }
}

// POST create new application
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      userId,
      company,
      role,
      jobDescription,
      jobUrl,
      matchScore,
      analysis,
      coverLetter,
      status,
    } = body;

    if (!userId || !company || !role || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        company,
        role,
        jobDescription,
        jobUrl: jobUrl || null,
        matchScore: matchScore || 0,
        analysis: analysis || "",
        coverLetter: coverLetter || "",
        status: status || "saved",
        ...(status === "applied" && { appliedAt: new Date() }),
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
