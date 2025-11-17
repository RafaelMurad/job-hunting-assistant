# Job Hunting Assistant - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
npx prisma migrate dev --name init
```

### 3. Add Your Claude API Key
Create `.env.local` file:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

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

- **AI-Powered Job Analysis**: Uses Claude Sonnet 4.5 to analyze job fit
- **Match Scoring**: Get 0-100% match scores based on your CV
- **Cover Letter Generation**: Automatically generate tailored cover letters (max 250 words)
- **Application Tracking**: Track status, dates, and notes for each application

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite
- TailwindCSS + Shadcn/ui
- Claude API (Sonnet 4.5)

## Troubleshooting

**Issue**: Prisma errors
**Fix**: Run `npx prisma generate && npx prisma migrate dev`

**Issue**: API errors during analysis
**Fix**: Verify your ANTHROPIC_API_KEY is set in `.env.local`

**Issue**: Port 3000 already in use
**Fix**: Run `npm run dev -- -p 3001` to use a different port

## Next Steps for Development

- Add authentication (Clerk or NextAuth)
- Add application status updates
- Export applications to CSV
- Email reminders for follow-ups
- Chrome extension for quick job saves
