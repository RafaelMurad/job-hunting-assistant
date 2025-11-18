import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all applications
export async function GET(request: NextRequest) {
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
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// POST create new application
export async function POST(request: NextRequest) {
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
        appliedAt: status === "applied" ? new Date() : null,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
