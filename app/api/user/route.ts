/**
 * User API Route
 *
 * WHY: API routes handle HTTP requests to your app.
 * They run on the server, so they can safely access the database.
 * The client never sees database credentials or queries.
 *
 * WHAT: This file defines GET and PUT endpoints for user data.
 * - GET /api/user → Retrieve the current user's profile
 * - PUT /api/user → Update the user's profile (with validation)
 *
 * HOW: Next.js App Router uses file-based routing.
 * This file at app/api/user/route.ts creates /api/user endpoint.
 * Export functions named GET, POST, PUT, DELETE to handle those HTTP methods.
 *
 * Learning Points:
 * 1. Request/Response handling with NextRequest/NextResponse
 * 2. Zod validation with error handling
 * 3. Prisma CRUD operations
 * 4. Proper HTTP status codes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userSchema, userUpdateSchema } from "@/lib/validations/user";
import { ZodError } from "zod";

/**
 * GET /api/user
 *
 * Retrieves the user profile. For MVP, we only have one user.
 * In a real app, you'd get the user ID from authentication.
 *
 * Returns:
 * - 200: { user: User } or { user: null }
 * - 500: { error: string } on server error
 */
export async function GET(): Promise<NextResponse> {
  try {
    // For MVP: Get the first (and only) user
    // FUTURE: Get user from auth session
    const user = await prisma.user.findFirst();

    // Return user or null (let frontend handle empty state)
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/user] Error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

/**
 * PUT /api/user
 *
 * Creates or updates the user profile.
 * Uses Zod to validate the request body before saving.
 *
 * Request Body: UserInput (see lib/validations/user.ts)
 *
 * Returns:
 * - 200: { user: User } on success
 * - 400: { error: string, details: ZodIssue[] } on validation error
 * - 500: { error: string } on server error
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse the request body
    const body = await request.json();

    // 2. Check if this is an update (has id) or create (no id)
    const existingUser = await prisma.user.findFirst();

    if (existingUser) {
      // UPDATE: Validate with id required
      const validated = userUpdateSchema.parse({
        ...body,
        id: existingUser.id,
      });

      const user = await prisma.user.update({
        where: { id: validated.id },
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone ?? null,
          location: validated.location,
          summary: validated.summary,
          experience: validated.experience,
          skills: validated.skills,
        },
      });

      return NextResponse.json({ user });
    } else {
      // CREATE: Validate without id
      const validated = userSchema.parse(body);

      const user = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone ?? null,
          location: validated.location,
          summary: validated.summary,
          experience: validated.experience,
          skills: validated.skills,
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    }
  } catch (error) {
    // Handle Zod validation errors specially
    if (error instanceof ZodError) {
      console.error("[PUT /api/user] Validation error:", error.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("[PUT /api/user] Error:", error);

    // In development/preview, include error details for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to save user profile",
        details: process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user
 *
 * Alias for PUT - both create/update the user.
 * This maintains backwards compatibility with existing frontend code.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return PUT(request);
}
