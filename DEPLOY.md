# 🚀 Vercel Deployment Quick Reference

## One-Time Setup (5 minutes)

### 1. Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 2. Get PostgreSQL Database

**Neon (Recommended - Free):**

- Visit: https://neon.tech
- Create project → Copy connection string
- Format: `postgresql://user:pass@host/db?pgbouncer=true`

### 3. Set Environment Variables

```bash
vercel env add DATABASE_URL production
# Paste your PostgreSQL connection string

vercel env add AI_PROVIDER production
# Enter: gemini

vercel env add GEMINI_API_KEY production
# Paste your Gemini API key from: https://aistudio.google.com/app/apikey
```

### 4. Deploy

```bash
# Link project (first time only)
vercel link

# Deploy to production (with validation)
npm run vercel:deploy:production
```

---

## Daily Workflow

### Deploy Changes

```bash
# Option 1: Automatic (recommended)
git push origin main  # Vercel auto-deploys

# Option 2: Manual
npm run vercel:deploy:production
```

### Check Deployment

```bash
# View deployments
vercel ls

# View logs
vercel logs [deployment-url]

# Rollback if needed
vercel rollback
```

---

## Validation Layers (Automatic)

Every deployment goes through 4 validation layers:

1. **Pre-Commit** ✅
   - Format code (Prettier)
   - Lint code (ESLint zero warnings)
   - Type check (TypeScript strict mode)

2. **Pre-Push** ✅ (when pushing to `main`)
   - Full validation (`npm run validate`)
   - Production build test

3. **GitHub Actions** ✅ (on PR/push)
   - Format check
   - Lint check
   - Type check
   - Prisma schema validation
   - Production build test

4. **Pre-Deploy** ✅ (via `npm run vercel:deploy:production`)
   - Environment variables check
   - Format check
   - Lint check (zero warnings)
   - Type check
   - Prisma schema validation
   - Production build test

**If any layer fails, deployment is blocked.** 🚫

---

## Environment Variables

**Required (Production):**

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth JWT secret (required for route protection)
- `NEXTAUTH_URL` - Production URL (recommended; helps cookie/redirect correctness)
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` - OAuth sign-in (or Google/LinkedIn)
- `AI_PROVIDER` - `gemini`, `openai`, or `claude`
- `GEMINI_API_KEY` - Your Gemini API key

**Optional:**

- `OPENAI_API_KEY` - If using OpenAI
- `ANTHROPIC_API_KEY` - If using Claude
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - Google sign-in
- `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET` - LinkedIn sign-in
- `SOCIAL_ENCRYPTION_KEY` - Required if using social integrations (GitHub/LinkedIn sync)
- `OWNER_EMAIL` - Required for OWNER role assignment (admin features)

**View current variables:**

```bash
vercel env ls
```

**Download production env locally:**

```bash
vercel env pull .env.production
```

---

## Database Migrations

Migrations are **not** run automatically during Vercel builds.

`build:production` currently runs `prisma generate && next build` (no `prisma migrate deploy`).

**Manual migration:**

```bash
# Pull production environment
vercel env pull .env.production

# Run migration
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

---

## Troubleshooting

### Build Failed

```bash
# Test build locally first
npm run build

# Check what's failing
npm run validate
```

### Environment Variable Missing

```bash
# List all env vars
vercel env ls

# Re-add missing variable
vercel env add VARIABLE_NAME production
```

### Database Connection Error

```bash
# Test connection locally
DATABASE_URL="your-url" npx prisma db push

# Ensure connection string has ?pgbouncer=true for Neon
```

### Rollback Bad Deployment

```bash
# Via CLI
vercel rollback

# Or via dashboard
# vercel.com → Project → Deployments → Previous version → Promote
```

---

## Monitoring

**Vercel Dashboard:**

- Analytics: Page views, performance
- Logs: Real-time function logs
- Deployments: History and status

**Database:**

- Neon: Dashboard → Operations
- Supabase: Dashboard → Reports

**AI Usage:**

- Gemini: https://aistudio.google.com/app/apikey
- OpenAI: https://platform.openai.com/usage
- Claude: https://console.anthropic.com/

---

## Costs

**Free Tier:**

- Vercel: 100GB bandwidth/month
- Neon: 0.5GB storage, 1 project
- Gemini: 1,500 requests/day
- **Total: $0/month** ✅

**After free tier:**

- Vercel Pro: $20/month
- Neon Launch: $19/month
- OpenAI GPT-4: ~$0.03/analysis
- Total: ~$40-50/month + API usage

---

## Security Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database connection uses SSL (Neon/Supabase auto-enable)
- [ ] API keys are production keys (not test/dev keys)
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Spending limits set on AI providers
- [ ] Regular backups enabled (database)

---

## Quick Commands

```bash
# Local development
npm run dev

# Validate before pushing
npm run validate

# Deploy to production (with validation)
npm run vercel:deploy:production

# View deployments
vercel ls

# View logs
vercel logs

# Rollback
vercel rollback

# Database studio
npm run db:studio

# Run migrations
npm run db:migrate:deploy
```

---

## Support

**Full Guide:** See [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

**Documentation:**

- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs

**Issues?** Check GitHub Actions tab for CI/CD logs.
