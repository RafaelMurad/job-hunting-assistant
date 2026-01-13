/**
 * Zero-Knowledge Vault Endpoint
 *
 * GET /api/zk/vault - Retrieve encrypted vault
 * PUT /api/zk/vault - Store encrypted vault
 *
 * The server stores only encrypted blobs. It cannot decrypt the data
 * since the encryption key (masterKey) never leaves the client.
 *
 * Authentication: zk_session cookie or Authorization header
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ============================================
// Validation Schemas
// ============================================

const vaultSchema = z.object({
  encryptedData: z.string().min(1, "Encrypted data required"),
  version: z.number().int().positive().optional(),
  lastModified: z.string().datetime().optional(),
});

// ============================================
// Session Verification
// ============================================

/**
 * Verify session token and return user ID.
 * Returns null if token is invalid.
 */
async function verifySession(request: Request): Promise<string | null> {
  // Try cookie first
  const cookieStore = await cookies();
  let token = cookieStore.get("zk_session")?.value;

  // Fall back to Authorization header
  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    // Decode token: base64url(userId.timestamp.random)
    const decoded = Buffer.from(token, "base64url").toString();
    const [userId, timestampStr] = decoded.split(".");

    if (!userId || !timestampStr) {
      return null;
    }

    // Check token age (7 days max)
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    if (Date.now() - timestamp > maxAge) {
      return null;
    }

    // Verify user exists
    const user = await prisma.zkUser.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ============================================
// GET - Retrieve Vault
// ============================================

export async function GET(request: Request): Promise<NextResponse> {
  const userId = await verifySession(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vault = await prisma.zkVault.findUnique({
      where: { userId },
      select: {
        encryptedData: true,
        version: true,
        lastModified: true,
        serverUpdatedAt: true,
      },
    });

    if (!vault) {
      // No vault yet - return null (client will create empty vault)
      return NextResponse.json({
        vault: null,
      });
    }

    return NextResponse.json({
      vault: {
        encryptedData: vault.encryptedData,
        version: vault.version,
        lastModified: vault.lastModified.toISOString(),
        serverUpdatedAt: vault.serverUpdatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Vault GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve vault" }, { status: 500 });
  }
}

// ============================================
// PUT - Store Vault
// ============================================

export async function PUT(request: Request): Promise<NextResponse> {
  const userId = await verifySession(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { encryptedData, version, lastModified } = vaultSchema.parse(body);

    // Upsert vault (create or update)
    const updateData: { encryptedData: string; version?: number; lastModified: Date } = {
      encryptedData,
      lastModified: lastModified ? new Date(lastModified) : new Date(),
    };

    // Only include version in update if provided
    if (version !== undefined) {
      updateData.version = version;
    }

    const vault = await prisma.zkVault.upsert({
      where: { userId },
      create: {
        userId,
        encryptedData,
        version: version ?? 1,
        lastModified: lastModified ? new Date(lastModified) : new Date(),
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      serverUpdatedAt: vault.serverUpdatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Vault PUT error:", error);
    return NextResponse.json({ error: "Failed to store vault" }, { status: 500 });
  }
}
