# Free AI Setup Guide - Google Gemini

## Why Gemini?

✅ **Completely FREE** (1,500 requests/day = 1,500 job analyses per day)
✅ **No credit card** required
✅ **Good quality** for job matching and cover letters
✅ **Easy setup** (2 minutes)

---

## Setup Steps

### 1. Get Free Gemini API Key (2 minutes)

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Get API key"**
3. Click **"Create API key"**
4. Copy the API key

### 2. Add to Your App

Create `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="file:./dev.db"

# AI Provider - Using free Gemini
AI_PROVIDER="gemini"

# Your Gemini API Key (paste the key you just got)
GEMINI_API_KEY="paste-your-api-key-here"
```

### 3. Install Dependencies

```bash
npm install
```

This will install:

- `@google/generative-ai` - Gemini SDK (free)
- `openai` - OpenAI SDK (optional, for later)
- `@anthropic-ai/sdk` - Claude SDK (optional, for later)

### 4. Initialize Database

```bash
npx prisma migrate dev --name init
```

### 5. Start the App

```bash
npm run dev
```

Open http://localhost:3000

---

## Free Tier Limits

**Google Gemini Free Tier:**

- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ Unlimited days (doesn't expire!)

**What This Means:**

- Analyze 1,500 jobs per day for free
- Perfect for active job hunting
- No credit card needed

---

## Switching AI Providers (Later)

If you want to upgrade later, just change the `.env.local`:

### Option 1: OpenAI (Paid)

```bash
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

- Cost: ~$0.0005 per job analysis
- Get key: https://platform.openai.com/api-keys

### Option 2: Claude (Paid)

```bash
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-..."
```

- Cost: ~$0.002 per job analysis
- Get key: https://console.anthropic.com/

---

## Troubleshooting

### Error: "Cannot find module '@google/generative-ai'"

Run: `npm install`

### Error: "GEMINI_API_KEY is not defined"

1. Check `.env.local` exists in project root
2. Check the file has: `GEMINI_API_KEY="your-key"`
3. Restart the dev server: `npm run dev`

### Rate Limit Error

You've hit the free tier limit (1,500/day). Either:

- Wait until tomorrow (resets daily)
- Switch to paid provider (OpenAI/Claude)

---

## Cost Comparison

| Provider   | Free Tier         | Cost After Free | Quality              |
| ---------- | ----------------- | --------------- | -------------------- |
| **Gemini** | 1,500/day forever | N/A             | Good ⭐⭐⭐⭐        |
| OpenAI     | $5 for 3 months   | $0.0005/job     | Excellent ⭐⭐⭐⭐⭐ |
| Claude     | None              | $0.002/job      | Excellent ⭐⭐⭐⭐⭐ |

**Recommendation:** Start with Gemini (free), upgrade if needed later.

---

## Next Steps

Once running:

1. Fill in your profile on the home page
2. Go to "Analyze New Job" page
3. Paste a job description
4. Get AI match score + cover letter
5. Save to your tracker

Happy job hunting! 🚀
