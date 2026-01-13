/**
 * Zero-Knowledge Registration Endpoint
 *
 * POST /api/zk/register
 *
 * Creates a new ZK user account. The client derives keys from password,
 * hashes the authKey, and sends only the hashed value. The server never
 * sees the password or raw authKey.
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
 *   userId: string
 * }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ============================================
// Validation Schema
// ============================================

const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  authKeyHash: z.string().regex(/^[0-9a-f]{64}$/, "Invalid authKeyHash format"),
});

// ============================================
// Route Handler
// ============================================

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, authKeyHash } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.zkUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create new ZK user
    const user = await prisma.zkUser.create({
      data: {
        email,
        authKeyHash,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
