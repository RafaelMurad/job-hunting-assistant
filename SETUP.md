# Job Hunting Assistant - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root.

Start from `.env.example` and set at minimum:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."              # pooled/serverless URL
DATABASE_URL_UNPOOLED="postgresql://..."    # direct URL for migrations

# NextAuth (required)
AUTH_SECRET="your-random-secret"

# At least one OAuth provider for sign-in (GitHub is easiest)
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# AI (pick one provider)
AI_PROVIDER="gemini"
GEMINI_API_KEY="..."
```

### 3. Set Up Database

```bash
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Usage Flow

### First Time Setup

1. **Enter Your Profile** (Home page)
   - Fill in your name, email, location
   - Add your professional summary
   - Paste your experience and skills
   - Click "Save Profile"

### Analyzing Jobs

2. **Analyze a Job** (Navigate to "Analyze New Job")
   - Paste the job description
   - Click "Analyze with AI"
   - Review the match score and analysis
   - Click "Generate Cover Letter" if interested
   - Click "Save to Tracker" to save the application

### Tracking Applications

3. **View Your Applications** (Navigate to "Application Tracker")
   - See all saved jobs
   - View stats: total, applied, interviewing, offers
   - Track your average match score

## Key Features

- **AI-Powered Job Analysis**: Uses Gemini/OpenAI/Claude (configurable) to analyze job fit
- **Match Scoring**: Get 0-100% match scores based on your CV
- **Cover Letter Generation**: Automatically generate tailored cover letters (max 250 words)
- **Application Tracking**: Track status, dates, and notes for each application

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL (Neon recommended)
- TailwindCSS + Shadcn/ui
- Multi-provider AI (Gemini / OpenAI / Claude)

## Troubleshooting

**Issue**: Prisma errors
**Fix**: Run `npx prisma generate && npx prisma migrate dev`

**Issue**: API errors during analysis
**Fix**: Verify your selected AI provider key is set in `.env.local` (e.g., `GEMINI_API_KEY`)

**Issue**: Port 3000 already in use
**Fix**: Run `npm run dev -- -p 3001` to use a different port

## Next Steps for Development

For what’s next, see the roadmap: `docs/ROADMAP.md`.
