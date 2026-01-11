/**
 * Demo Data Reset Cron Job
 *
 * Runs daily at midnight UTC to reset demo environment data.
 * Only executes in demo mode and requires CRON_SECRET for authentication.
 *
 * Vercel Cron: 0 0 * * * (daily at midnight)
 *
 * @module app/api/cron/reset-demo
 */

import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/storage/interface";
import { prisma } from "@/lib/db";
import { seedDemoData } from "@/prisma/seed-demo";

// ============================================
// Configuration
// ============================================

const CRON_SECRET = process.env.CRON_SECRET;

// ============================================
// Handler
// ============================================

export async function GET(request: Request): Promise<NextResponse> {
  // Only run in demo mode
  if (!isDemoMode()) {
    return NextResponse.json({ error: "This endpoint only works in demo mode" }, { status: 403 });
  }

  // Verify cron secret (Vercel sends this in Authorization header)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resetDemoDataAndSeed();

    return NextResponse.json({
      success: true,
      message: "Demo data reset and re-seeded successfully",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[reset-demo] Error resetting demo data:", error);

    return NextResponse.json(
      {
        error: "Failed to reset demo data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================
// Reset Logic
// ============================================

interface ResetResult {
  deletedApplications: number;
  deletedCVs: number;
  usersReset: number;
  seeded: boolean;
}

/**
 * Reset demo data - clears user-generated content and re-seeds sample data
 */
async function resetDemoDataAndSeed(): Promise<ResetResult> {
  // 1. Delete all applications (demo users can create these)
  const deletedApplications = await prisma.application.deleteMany({});

  // 2. Delete all CVs
  const deletedCVs = await prisma.cV.deleteMany({});

  // 3. Reset user profiles to default state (preserve accounts)
  const usersReset = await prisma.user.updateMany({
    data: {
      summary: "",
      experience: "",
      skills: "",
      cvPdfUrl: null,
      cvLatexUrl: null,
      cvFilename: null,
      cvUploadedAt: null,
    },
  });

  console.warn("[reset-demo] Reset complete:", {
    deletedApplications: deletedApplications.count,
    deletedCVs: deletedCVs.count,
    usersReset: usersReset.count,
  });

  // 4. Re-seed demo data for showcase
  try {
    await seedDemoData();
    console.warn("[reset-demo] Demo data seeded successfully");
  } catch (seedError) {
    console.error("[reset-demo] Failed to seed demo data:", seedError);
    // Don't fail the whole operation if seeding fails
  }

  return {
    deletedApplications: deletedApplications.count,
    deletedCVs: deletedCVs.count,
    usersReset: usersReset.count,
    seeded: true,
  };
}

// ============================================
// Manual Trigger (for testing)
// ============================================

export async function POST(request: Request): Promise<NextResponse> {
  // Same logic as GET but for manual testing
  // Requires admin authentication in production

  if (!isDemoMode()) {
    return NextResponse.json({ error: "This endpoint only works in demo mode" }, { status: 403 });
  }

  // For manual trigger, check for admin or cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized - provide CRON_SECRET" }, { status: 401 });
  }

  try {
    const result = await resetDemoDataAndSeed();

    return NextResponse.json({
      success: true,
      message: "Demo data reset and re-seeded manually",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[reset-demo] Manual reset error:", error);

    return NextResponse.json(
      {
        error: "Failed to reset demo data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
