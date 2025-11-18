import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET user (for now, we'll just get the first user or create if none exists)
export async function GET() {
  try {
    let user = await prisma.user.findFirst();

    if (!user) {
      // Create default user if none exists
      user = await prisma.user.create({
        data: {
          name: "",
          email: "",
          location: "",
          summary: "",
          experience: "",
          skills: "",
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// POST/PUT update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, location, summary, experience, skills } = body;

    let user;
    if (id) {
      // Update existing user
      user = await prisma.user.update({
        where: { id },
        data: {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          location: location || undefined,
          summary: summary || undefined,
          experience: experience || undefined,
          skills: skills || undefined,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: name || "",
          email: email || "",
          phone: phone || null,
          location: location || "",
          summary: summary || "",
          experience: experience || "",
          skills: skills || "",
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
