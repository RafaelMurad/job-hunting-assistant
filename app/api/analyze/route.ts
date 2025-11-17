import { NextRequest, NextResponse } from 'next/server'
import { analyzeJob } from '@/lib/claude'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobDescription, userId } = body

    if (!jobDescription || !userId) {
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

    // Analyze with Claude
    const analysis = await analyzeJob(jobDescription, userCV)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing job:', error)
    return NextResponse.json(
      { error: 'Failed to analyze job. Please try again.' },
      { status: 500 }
    )
  }
}
