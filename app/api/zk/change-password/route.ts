/**
 * Zero-Knowledge Password Change Endpoint
 *
 * POST /api/zk/change-password
 *
 * Atomically updates the user's authKeyHash and encrypted vault.
 * The client handles all cryptographic operations:
 * 1. Decrypt vault with old masterKey
 * 2. Re-encrypt vault with new masterKey
 * 3. Send new authKeyHash + new encrypted vault
 *
 * Request body:
 * {
 *   oldAuthKeyHash: string,  // Proves knowledge of old password
 *   newAuthKeyHash: string,  // New authentication hash
 *   encryptedData: string,   // Vault re-encrypted with new masterKey
 *   lastModified: string     // ISO timestamp
 * }
 *
 * Security:
 * - oldAuthKeyHash must match stored hash (proves old password knowledge)
 * - Both authKeyHash and vault are updated atomically
 * - Session is invalidated after password change
 */

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// Validation Schema
// ============================================

const changePasswordSchema = z.object({
  oldAuthKeyHash: z.string().regex(/^[0-9a-f]{64}$/, "Invalid oldAuthKeyHash format"),
  newAuthKeyHash: z.string().regex(/^[0-9a-f]{64}$/, "Invalid newAuthKeyHash format"),
  encryptedData: z.string().min(1, "Encrypted data required"),
  lastModified: z.string().datetime().optional(),
});

// ============================================
// Session Verification
// ============================================

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("zk_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [userId, timestampStr] = decoded.split(".");

    if (!userId || !timestampStr) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

// ============================================
// Route Handler
// ============================================

export async function POST(request: Request): Promise<NextResponse> {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { oldAuthKeyHash, newAuthKeyHash, encryptedData, lastModified } =
      changePasswordSchema.parse(body);

    // Fetch user with current authKeyHash
    const user = await prisma.zkUser.findUnique({
      where: { id: userId },
      select: { id: true, authKeyHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify old password by comparing authKeyHash
    if (!timingSafeEqual(user.authKeyHash, oldAuthKeyHash)) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 401 });
    }

    // Prevent setting same password
    if (oldAuthKeyHash === newAuthKeyHash) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Atomic update: authKeyHash + vault
    await prisma.$transaction([
      prisma.zkUser.update({
        where: { id: userId },
        data: { authKeyHash: newAuthKeyHash },
      }),
      prisma.zkVault.upsert({
        where: { userId },
        create: {
          userId,
          encryptedData,
          version: 1,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
        },
        update: {
          encryptedData,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
        },
      }),
    ]);

    // Clear session cookie (force re-login with new password)
    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });

    response.cookies.delete("zk_session");

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

// ============================================
// Security Utilities
// ============================================

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
