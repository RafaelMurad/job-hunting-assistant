# 🚀 Dual-Mode Deployment Guide

CareerPal runs in two modes from a single codebase:

- **Local Mode** - Self-hosted, privacy-first, your data never leaves your browser
- **Demo Mode** - Vercel-hosted showcase with server storage and rate-limited AI

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Single Codebase                              │
│                    (job-hunting-assistant repo)                      │
├─────────────────────────────────┬───────────────────────────────────┤
│        LOCAL MODE               │          DEMO MODE                 │
│   (Self-Hosted)                 │   (Vercel Deployment)              │
├─────────────────────────────────┼───────────────────────────────────┤
│   Storage: IndexedDB (Dexie)    │   Storage: PostgreSQL (Prisma)    │
│   AI Keys: User-provided (BYOK) │   AI Keys: Server (rate-limited)  │
│   Auth: None required           │   Auth: Neon Auth (OAuth)         │
│   Data: Never leaves browser    │   Data: Server-side, resets daily │
│   Deploy: Clone & run locally   │   Deploy: Vercel                  │
└─────────────────────────────────┴───────────────────────────────────┘
```

---

## 🏠 Running Locally (Privacy-First Mode)

This is the primary way to use CareerPal. Your data stays in your browser.

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/RafaelMurad/job-hunting-assistant.git
cd job-hunting-assistant

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

**That's it!** No environment variables needed for local mode.

### What You Get

- ✅ **Complete privacy** - All data stored in IndexedDB (browser)
- ✅ **BYOK** - Bring your own Gemini/OpenRouter API keys
- ✅ **Full features** - Same functionality as demo mode
- ✅ **No account needed** - No sign-in, no OAuth
- ✅ **Offline capable** - Works without internet (except AI features)

### Setting Up AI Keys

1. Go to Settings in the app
2. Add your API keys:
   - **Gemini**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **OpenRouter**: Get from [OpenRouter](https://openrouter.ai/keys) (optional)

Keys are stored in `localStorage` and never sent to any server.

### Production Build (Optional)

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🎭 Demo Mode Deployment (Vercel)

Demo mode is for portfolio showcases. Deploy once to Vercel and share the link.

### Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Neon Database](https://neon.tech) (PostgreSQL)
- [Upstash Redis](https://upstash.com) (Rate limiting)
- AI API Keys (Gemini, optionally OpenRouter)

### Step 1: Create Vercel Project

```bash
# Link to your Vercel account
vercel link --project job-hunting-assistant
```

Or via Vercel Dashboard:

1. Import from GitHub → Select your repo
2. Project name: `job-hunting-assistant`

### Step 2: Configure Environment Variables

| Variable                   | Value              | Purpose           |
| -------------------------- | ------------------ | ----------------- |
| `NEXT_PUBLIC_MODE`         | `demo`             | Enable demo mode  |
| `DATABASE_URL`             | `postgresql://...` | Neon PostgreSQL   |
| `DATABASE_URL_UNPOOLED`    | `postgresql://...` | Neon (migrations) |
| `NEON_AUTH_BASE_URL`       | `https://...`      | Neon Auth         |
| `GEMINI_API_KEY`           | `AIza...`          | AI processing     |
| `OPENROUTER_API_KEY`       | `sk-or-v1-...`     | Fallback AI       |
| `UPSTASH_REDIS_REST_URL`   | `https://...`      | Rate limiting     |
| `UPSTASH_REDIS_REST_TOKEN` | `...`              | Rate limiting     |
| `CRON_SECRET`              | `your-secret`      | Daily reset auth  |
| `BLOB_READ_WRITE_TOKEN`    | `...`              | File storage      |

```bash
# Set demo mode
vercel env add NEXT_PUBLIC_MODE production
# Enter: demo

# Database (from Neon Console)
vercel env add DATABASE_URL production
vercel env add DATABASE_URL_UNPOOLED production

# Neon Auth
vercel env add NEON_AUTH_BASE_URL production

# AI Keys
vercel env add GEMINI_API_KEY production

# Rate limiting (from Upstash Console)
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Cron job authentication
vercel env add CRON_SECRET production
# Generate with: openssl rand -base64 32

# Blob storage (from Vercel Storage)
vercel env add BLOB_READ_WRITE_TOKEN production
```

### Step 3: Configure Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (optional - Vercel provides `job-hunting-assistant.vercel.app`)
3. Configure DNS as instructed

### Step 4: Deploy

```bash
# Deploy to production
vercel --prod
```

Or push to `main` for automatic deployment.

---

## 🔄 Daily Demo Reset

Demo mode includes a cron job that resets data at midnight UTC.

### Cron Configuration (in vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-demo",
      "schedule": "0 0 * * *"
    }
  ]
}
```

> **Note**: Cron jobs require Vercel Pro plan. On free tier, data won't auto-reset.

---

## ✅ Verification Checklist

### Local Mode (localhost:3000)

- [ ] App loads without errors
- [ ] User menu shows "Local User" (no Sign In)
- [ ] Settings page shows API key configuration
- [ ] Data persists after refresh (IndexedDB)
- [ ] AI features work with your API keys

### Demo Mode (Vercel deployment)

- [ ] Mode banner shows "Demo Mode"
- [ ] Sign In button appears
- [ ] OAuth authentication works
- [ ] AI analysis works (with rate limiting)
- [ ] Rate limit errors appear after 5 requests/min

---

## 🔒 Security Notes

### Local Mode

- **Zero server liability** - All data in browser
- **No API keys on server** - Users provide their own
- **No auth cookies** - Nothing to steal
- **You control everything** - Clone, modify, run

### Demo Mode

- **Rate limiting** - 5 AI requests/min per user
- **Daily reset** - No data accumulation liability
- **OAuth only** - No password storage
- **CRON_SECRET** - Protects reset endpoint

---

## 💰 Cost Breakdown

### Local Mode (Self-Hosted)

| Service   | Cost           |
| --------- | -------------- |
| Hosting   | Your machine   |
| Database  | None (browser) |
| AI        | Your keys      |
| **Total** | **$0**         |

### Demo Mode (Vercel)

| Service         | Cost                               |
| --------------- | ---------------------------------- |
| Vercel          | Free tier (or $20/mo Pro for cron) |
| Neon PostgreSQL | Free tier                          |
| Upstash Redis   | Free tier                          |
| Gemini API      | Free tier                          |
| **Total**       | **$0-20/month**                    |

---

## 🐛 Troubleshooting

### "AI features not working" (Local Mode)

Check that you've added API keys in Settings.

### "Database connection failed" (Demo Mode)

```bash
# Test connection locally
DATABASE_URL="your-url" npx prisma db push
```

### "Rate limit always succeeds" (Demo Mode)

Check Upstash credentials:

```bash
vercel env ls
# Should show UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

---

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [FREE-AI-SETUP.md](./FREE-AI-SETUP.md) - Getting free AI API keys
- [CODE_QUALITY_SETUP.md](./CODE_QUALITY_SETUP.md) - Development setup
