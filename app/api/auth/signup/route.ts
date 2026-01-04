/**
 * Sign Up API Route
 *
 * Creates a new user account with email and password.
 * Password is hashed with bcrypt before storage.
 */

import { prisma } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";

const SALT_ROUNDS = 12;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    // Validate input
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with default profile values
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: "", // Required field, empty default
        summary: "",
        experience: "",
        skills: "",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: "Account created successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
