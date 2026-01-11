# 🚀 Dual-Mode Deployment Guide

This guide explains how to deploy CareerPal in dual-mode architecture:

- **careerpal.app** (Local Mode) - Privacy-first, browser storage, BYOK
- **demo.careerpal.app** (Demo Mode) - Server storage, rate-limited AI, portfolio showcase

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Single Codebase                              │
│                    (job-hunting-assistant repo)                      │
├─────────────────────────────────┬───────────────────────────────────┤
│        LOCAL MODE               │          DEMO MODE                 │
│   NEXT_PUBLIC_MODE=local        │   NEXT_PUBLIC_MODE=demo            │
├─────────────────────────────────┼───────────────────────────────────┤
│   Storage: IndexedDB (Dexie)    │   Storage: PostgreSQL (Prisma)    │
│   AI Keys: User-provided (BYOK) │   AI Keys: Server (rate-limited)  │
│   Auth: None required           │   Auth: Neon Auth (OAuth)         │
│   Data: Never leaves browser    │   Data: Server-side, resets daily │
└─────────────────────────────────┴───────────────────────────────────┘
```

---

## 🎯 Prerequisites

- **Vercel Account** - [Sign up](https://vercel.com/signup)
- **GitHub Repo** - Your code pushed to GitHub
- **For Demo Mode:**
  - PostgreSQL Database ([Neon](https://neon.tech))
  - Upstash Redis ([Upstash](https://upstash.com))
  - AI API Keys (Gemini, OpenRouter)

---

## 📦 Step 1: Create Two Vercel Projects

You need **two separate Vercel projects** pointing to the same GitHub repo:

### Project 1: Local Mode (careerpal.app)

```bash
# Create new project via CLI
vercel link --yes

# When prompted:
# - Project name: careerpal-local
# - Link to directory: Yes
```

### Project 2: Demo Mode (demo.careerpal.app)

```bash
# Create second project
vercel link --yes --project careerpal-demo
```

Or create both via the Vercel dashboard:

1. Import from GitHub → Select your repo
2. Project name: `careerpal-local`
3. Repeat for `careerpal-demo`

---

## ⚙️ Step 2: Configure Environment Variables

### Local Mode (careerpal-local)

Only ONE environment variable is required:

| Variable           | Value   | Purpose           |
| ------------------ | ------- | ----------------- |
| `NEXT_PUBLIC_MODE` | `local` | Enable local mode |

```bash
vercel env add NEXT_PUBLIC_MODE production --project careerpal-local
# Enter: local
```

**That's it!** Local mode doesn't need:

- Database (uses IndexedDB)
- Auth secrets (no server auth)
- AI keys (users provide their own)

### Demo Mode (careerpal-demo)

Full server configuration required:

| Variable                   | Value              | Purpose          |
| -------------------------- | ------------------ | ---------------- |
| `NEXT_PUBLIC_MODE`         | `demo`             | Enable demo mode |
| `DATABASE_URL`             | `postgresql://...` | Neon PostgreSQL  |
| `NEON_AUTH_TOKEN`          | `...`              | Neon Auth        |
| `GEMINI_API_KEY`           | `AIza...`          | AI processing    |
| `OPENROUTER_API_KEY`       | `sk-or-v1-...`     | Fallback AI      |
| `UPSTASH_REDIS_REST_URL`   | `https://...`      | Rate limiting    |
| `UPSTASH_REDIS_REST_TOKEN` | `...`              | Rate limiting    |
| `CRON_SECRET`              | `your-secret`      | Daily reset auth |

```bash
# Set demo mode
vercel env add NEXT_PUBLIC_MODE production --project careerpal-demo
# Enter: demo

# Database
vercel env add DATABASE_URL production --project careerpal-demo
# Paste Neon connection string

# Auth
vercel env add NEON_AUTH_TOKEN production --project careerpal-demo

# AI Keys
vercel env add GEMINI_API_KEY production --project careerpal-demo
vercel env add OPENROUTER_API_KEY production --project careerpal-demo

# Rate limiting (Upstash)
vercel env add UPSTASH_REDIS_REST_URL production --project careerpal-demo
vercel env add UPSTASH_REDIS_REST_TOKEN production --project careerpal-demo

# Cron job authentication
vercel env add CRON_SECRET production --project careerpal-demo
# Generate with: openssl rand -base64 32
```

---

## 🌐 Step 3: Configure Domains

### Local Mode Domain

1. Go to Vercel Dashboard → `careerpal-local` → Settings → Domains
2. Add: `careerpal.app` (or your domain)
3. Follow DNS instructions

### Demo Mode Domain

1. Go to Vercel Dashboard → `careerpal-demo` → Settings → Domains
2. Add: `demo.careerpal.app` (subdomain)
3. Add CNAME record pointing to Vercel

---

## 🔄 Step 4: Set Up Daily Demo Reset

The demo mode includes a cron job that resets data daily at midnight UTC.

### Cron Configuration (already in vercel.json)

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

### Verify Cron Secret

1. Ensure `CRON_SECRET` is set in demo project
2. Vercel automatically calls the cron endpoint with this secret
3. Check Vercel Dashboard → Functions → Cron for execution logs

---

## 🚀 Step 5: Deploy Both Projects

### Option A: Automatic (Recommended)

Both projects auto-deploy when you push to `main`:

```bash
git push origin main
```

Vercel builds both projects with their respective environment variables.

### Option B: Manual Deployment

```bash
# Deploy local mode
vercel --prod --project careerpal-local

# Deploy demo mode
vercel --prod --project careerpal-demo
```

---

## ✅ Verification Checklist

### Local Mode (careerpal.app)

- [ ] Landing page shows "Privacy-First Job Search Assistant"
- [ ] Primary CTA is "Start Using CareerPal"
- [ ] User menu shows "Local User" (no Sign In)
- [ ] Settings page shows API key configuration
- [ ] Data persists in browser (IndexedDB)
- [ ] No database errors in console

### Demo Mode (demo.careerpal.app)

- [ ] Landing page shows "Your AI Job Search Companion"
- [ ] Primary CTA is "Get Started Free"
- [ ] User menu shows "Sign In" button
- [ ] Auth flow works (OAuth sign-in)
- [ ] AI analysis works (with rate limiting)
- [ ] Mode banner shows "Demo Mode" message
- [ ] Cron job runs daily (check Vercel logs)

---

## 🔒 Security Notes

### Local Mode

- **Zero server liability** - all data in browser
- **No API keys on server** - users provide their own
- **No auth cookies** - no session to steal

### Demo Mode

- **Rate limiting** - 5 AI requests/min per user
- **Daily reset** - no data accumulation liability
- **Sample data** - curated demo content
- **CRON_SECRET** - protects reset endpoint

---

## 🐛 Troubleshooting

### "Mode not detected correctly"

Check `NEXT_PUBLIC_MODE` is set correctly:

```bash
vercel env ls --project careerpal-local
# Should show: NEXT_PUBLIC_MODE = local
```

### "Database connection failed" (Demo only)

```bash
# Test connection
DATABASE_URL="your-url" npx prisma db push
```

### "Rate limit always succeeds" (Demo only)

Upstash Redis not configured. Check:

```bash
vercel env ls --project careerpal-demo
# Should show UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

### "Cron job not running"

1. Cron only runs on Vercel Pro/Enterprise
2. Check `CRON_SECRET` is set
3. Verify in Vercel Dashboard → Functions → Cron

---

## 💰 Cost Breakdown

### Local Mode (careerpal.app)

| Service   | Cost          |
| --------- | ------------- |
| Vercel    | Free tier     |
| Database  | None          |
| AI        | User-provided |
| **Total** | **$0/month**  |

### Demo Mode (demo.careerpal.app)

| Service         | Cost                               |
| --------------- | ---------------------------------- |
| Vercel          | Free tier (or $20/mo Pro for cron) |
| Neon PostgreSQL | Free tier                          |
| Upstash Redis   | Free tier                          |
| Gemini API      | Free tier                          |
| **Total**       | **$0-20/month**                    |

---

## 📚 Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [../DEPLOY.md](../DEPLOY.md) - Quick deployment reference

---

## 🎉 You're Live!

After deployment:

- **Local Mode**: `https://careerpal.app`
- **Demo Mode**: `https://demo.careerpal.app`

Share your portfolio showcase (demo mode) while maintaining a privacy-first main product (local mode)!
