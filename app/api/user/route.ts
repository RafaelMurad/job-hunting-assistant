import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Mock user for when database is unavailable
const MOCK_USER = {
  id: "mock-user-1",
  name: "Demo User",
  email: "demo@example.com",
  phone: "+1 234 567 8900",
  location: "San Francisco, CA",
  summary: "Experienced software engineer with 5+ years in full-stack development. Passionate about building user-friendly applications and solving complex problems.",
  experience: "Senior Software Engineer | TechCorp (2021 - Present)\n- Led development of customer-facing dashboard\n- Improved API performance by 40%\n\nSoftware Engineer | StartupXYZ (2019 - 2021)\n- Built React components for e-commerce platform\n- Implemented CI/CD pipelines",
  skills: "React, TypeScript, Next.js, Node.js, PostgreSQL, AWS, Docker, Git",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// GET user (for now, we'll just get the first user or create if none exists)
export async function GET(): Promise<NextResponse> {
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
    console.error("Error fetching user (using mock):", error);
    // Return mock user when database is unavailable
    return NextResponse.json(MOCK_USER);
  }
}

// POST/PUT update user
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Parse body first so variables are available in catch block
  const body = await request.json();
  const { id, name, email, phone, location, summary, experience, skills } = body as {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    experience?: string;
    skills?: string;
  };

  try {
    let user;
    if (id) {
      // Build update data object - only include fields that have values
      const updateData: Record<string, string | null> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (location !== undefined) updateData.location = location;
      if (summary !== undefined) updateData.summary = summary;
      if (experience !== undefined) updateData.experience = experience;
      if (skills !== undefined) updateData.skills = skills;

      // Update existing user
      user = await prisma.user.update({
        where: { id },
        data: updateData,
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
    console.error("Error saving user (using mock):", error);
    // Return updated mock user when database is unavailable
    const mockResponse = {
      ...MOCK_USER,
      name: name || MOCK_USER.name,
      email: email || MOCK_USER.email,
      phone: phone || MOCK_USER.phone,
      location: location || MOCK_USER.location,
      summary: summary || MOCK_USER.summary,
      experience: experience || MOCK_USER.experience,
      skills: skills || MOCK_USER.skills,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(mockResponse);
  }
}
