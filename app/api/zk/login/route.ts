/**
 * Zero-Knowledge Login Endpoint
 *
 * POST /api/zk/login
 *
 * Authenticates a ZK user by verifying the authKeyHash matches.
 * Returns a session token for subsequent requests.
 *
 * Request body:
 * {
 *   email: string,
 *   authKeyHash: string  // SHA-256 hash of authKey (64 hex chars)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   userId: string,
 *   token: string  // Session token (JWT or simple token)
 * }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ============================================
// Validation Schema
// ============================================

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  authKeyHash: z.string().regex(/^[0-9a-f]{64}$/, "Invalid authKeyHash format"),
});

// ============================================
// Simple Token Generation
// ============================================

/**
 * Generate a simple session token.
 * For production, use proper JWT with expiry.
 */
function generateToken(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  // Simple token: userId.timestamp.random (base64 encoded)
  const payload = `${userId}.${timestamp}.${random}`;
  return Buffer.from(payload).toString("base64url");
}

// ============================================
// Route Handler
// ============================================

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, authKeyHash } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.zkUser.findUnique({
      where: { email },
    });

    if (!user) {
      // Use same error message to prevent email enumeration
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify authKeyHash matches
    // Use timing-safe comparison to prevent timing attacks
    if (!timingSafeEqual(user.authKeyHash, authKeyHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate session token
    const token = generateToken(user.id);

    // Set token in HTTP-only cookie for security
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      token, // Also return in body for client storage options
    });

    // Set secure cookie
    response.cookies.set("zk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// ============================================
// Security Utilities
// ============================================

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
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
