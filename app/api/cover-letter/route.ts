import { NextRequest, NextResponse } from 'next/server'
import { generateCoverLetter, type JobAnalysisResult } from '@/lib/claude'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobDescription, userId, analysis } = body as {
      jobDescription: string
      userId: string
      analysis: JobAnalysisResult
    }

    if (!jobDescription || !userId || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's CV data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build user CV string
    const userCV = `
Name: ${user.name}
Email: ${user.email}
Location: ${user.location}

Professional Summary:
${user.summary}

Work Experience:
${user.experience}

Skills:
${user.skills}
    `.trim()

    // Generate cover letter with Claude
    const coverLetter = await generateCoverLetter(jobDescription, userCV, analysis)

    return NextResponse.json({ coverLetter })
  } catch (error) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    )
  }
}
