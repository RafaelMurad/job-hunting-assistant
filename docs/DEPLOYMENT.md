# 🚀 Production Deployment Guide - Vercel

This guide walks through deploying the Job Hunting Assistant to Vercel with production-ready PostgreSQL database.

---

## 🎯 Prerequisites

Before deploying, ensure you have:

- ✅ **Vercel Account** - [Sign up free](https://vercel.com/signup)
- ✅ **PostgreSQL Database** - Recommended: [Neon](https://neon.tech) (free tier) or [Supabase](https://supabase.com)
- ✅ **AI API Key** - At least one: [Gemini](https://aistudio.google.com/app/apikey) (free), OpenAI, or Claude
- ✅ **GitHub Repo** - Code pushed to GitHub
- ✅ **Vercel CLI** - Install: `npm i -g vercel`

---

## 📋 Step-by-Step Deployment

### **Step 1: Get PostgreSQL Database**

**Option A: Neon (Recommended - Free Tier)**

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project → Choose region close to you
4. Copy the connection string (starts with `postgresql://`)

**Option B: Supabase (Alternative - Free Tier)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy "Connection pooling" URL for serverless (Vercel)

**Option C: Vercel Postgres (Paid after free tier)**

1. In Vercel dashboard → Storage → Create Database
2. Choose Postgres → Follow prompts
3. Connection string auto-added to environment variables

---

### **Step 2: Install Vercel CLI**

```bash
npm install -g vercel

# Login to Vercel
vercel login
```

---

### **Step 3: Link Your Project**

```bash
# From project root
vercel link

# Choose:
# - Link to existing project? No
# - Project name? job-hunting-assistant (or your choice)
# - Which scope? (your account)
# - Link to directory? Yes
```

This creates `.vercel/` folder (already in `.gitignore`).

---

### **Step 4: Set Environment Variables**

**Option A: Via Vercel CLI (Recommended)**

```bash
# Set production environment variables
vercel env add DATABASE_URL production
# Paste your PostgreSQL connection string

vercel env add AI_PROVIDER production
# Enter: gemini (or openai, claude)

vercel env add GEMINI_API_KEY production
# Paste your Gemini API key

# Optional: Add other AI providers
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
```

**Option B: Via Vercel Dashboard**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - `DATABASE_URL` → Your PostgreSQL connection string
   - `AI_PROVIDER` → `gemini` (or `openai`, `claude`)
   - `GEMINI_API_KEY` → Your API key
   - (Optional) `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

**Important:** Set variables for **Production** environment.

---

### **Step 5: Run Pre-Deployment Validation**

Before deploying, ensure your code is production-ready:

```bash
# Run the pre-deployment hook manually
.husky/pre-deploy

# Or use the npm script
npm run vercel:deploy:production
```

This checks:

- ✅ Environment variables are set
- ✅ Code is properly formatted
- ✅ No ESLint errors/warnings
- ✅ No TypeScript errors
- ✅ Database schema is valid
- ✅ Production build works

**If validation fails, fix issues before deploying!**

---

### **Step 6: Deploy to Production**

**Option A: Deploy via CLI**

```bash
# Deploy to production
vercel --prod

# Or use the npm script (with pre-checks)
npm run vercel:deploy:production
```

**Option B: Deploy via GitHub (Automatic)**

1. Push code to `main` branch:

   ```bash
   git push origin main
   ```

2. Vercel auto-deploys on every push to `main`
3. Check deployment status at vercel.com/dashboard

---

### **Step 7: Run Database Migrations**

After first deployment, run migrations:

```bash
# Option A: Via Vercel CLI
vercel env pull .env.production  # Download production env vars
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Option B: Migrations run automatically during build
# (Already configured in build:production script)
```

---

### **Step 8: Verify Deployment**

1. Visit your Vercel deployment URL (e.g., `https://job-hunting-assistant.vercel.app`)
2. Test the application:
   - ✅ Home page loads
   - ✅ Can create/update profile
   - ✅ Job analysis works
   - ✅ Cover letter generation works
   - ✅ Application tracker works

---

## 🔒 Security Best Practices

### **Environment Variables**

✅ **NEVER commit** `.env` files to git
✅ **Use Vercel secrets** for sensitive data
✅ **Rotate API keys** periodically
✅ **Use different keys** for dev/staging/production

### **Database Connection**

✅ **Use connection pooling** (already configured)
✅ **Enable SSL** (most providers enforce this)
✅ **Set connection limits** (Neon/Supabase do this)

### **API Keys**

✅ **Set spending limits** on OpenAI/Claude
✅ **Monitor usage** via provider dashboards
✅ **Use free tier** (Gemini) when possible

---

## 🛠️ Production Scripts Reference

```bash
# Build for production (with migrations)
npm run build:production

# Database commands
npm run db:push              # Push schema changes (dev)
npm run db:migrate           # Create migration (dev)
npm run db:migrate:deploy    # Run migrations (production)
npm run db:studio            # Open Prisma Studio

# Deployment commands
npm run vercel:deploy              # Deploy to preview
npm run vercel:deploy:production   # Deploy to production (with validation)

# Validation (runs before deploy)
npm run validate              # Lint + Type + Format check
.husky/pre-deploy            # Full pre-deployment validation
```

---

## 🔄 Automatic Deployments

### **How It Works**

1. **Push to `main`** → Vercel auto-deploys to production
2. **Push to other branches** → Vercel creates preview deployments
3. **Pull requests** → Vercel comments with preview URL

### **Pre-Push Hook**

Before pushing to `main`, the `pre-push` hook runs:

- ✅ Full validation (`npm run validate`)
- ✅ Production build test
- ✅ Only for `main` branch (feature branches skip)

**This prevents broken code from reaching Vercel.**

---

## 🐛 Troubleshooting

### **"Build failed: Prisma migrate deploy"**

**Cause:** Database connection issue or missing migrations.

**Fix:**

```bash
# 1. Check DATABASE_URL is set in Vercel
vercel env ls

# 2. Manually run migrations
vercel env pull .env.production
DATABASE_URL="your-url" npx prisma migrate deploy

# 3. Redeploy
vercel --prod
```

### **"Module not found: Can't resolve '@prisma/client'"**

**Cause:** Prisma client not generated during build.

**Fix:** Already configured in `build:production` script. If still failing:

```bash
# Add to vercel.json build.env
"PRISMA_GENERATE_SKIP_AUTOINSTALL": "false"
```

### **"Environment variable not found"**

**Cause:** Environment variables not set or set for wrong environment.

**Fix:**

```bash
# Check current variables
vercel env ls

# Pull production variables locally
vercel env pull .env.production

# Re-add missing variables
vercel env add VARIABLE_NAME production
```

### **"Database connection failed"**

**Cause:** Wrong connection string or database not accessible.

**Fix:**

1. Test connection locally:
   ```bash
   DATABASE_URL="your-url" npx prisma db push
   ```
2. Ensure connection string includes `?pgbouncer=true` for Neon
3. Check database is running (not paused on free tier)

### **"Hook failed: pre-push"**

**Cause:** Code doesn't pass validation (lint, type-check, or build errors).

**Fix:**

```bash
# See what's failing
npm run validate

# Fix formatting
npm run format

# Fix linting
npm run lint:fix

# Check types
npm run type-check

# Test build
npm run build
```

---

## 📊 Monitoring Production

### **Vercel Dashboard**

- **Analytics** - Page views, visitors, performance
- **Logs** - Real-time function logs
- **Deployments** - Deployment history and rollback

### **Database Monitoring**

**Neon:**

- Dashboard → Operations → See query stats
- Dashboard → Billing → Check free tier usage

**Supabase:**

- Dashboard → Database → Connection pooling stats
- Dashboard → Reports → Usage metrics

### **AI API Usage**

**Gemini:**

- [AI Studio](https://aistudio.google.com/app/apikey) → View quota usage

**OpenAI:**

- [Platform Usage](https://platform.openai.com/usage) → Track spending

**Claude:**

- [Console](https://console.anthropic.com/) → Usage dashboard

---

## 🔄 Rolling Back Deployment

If production has issues:

```bash
# Via Vercel dashboard
# Deployments → Find previous working deployment → Promote to Production

# Via CLI
vercel rollback
```

---

## 💰 Cost Breakdown

### **Free Tier (Recommended for MVP)**

| Service        | Free Tier                | Cost After     |
| -------------- | ------------------------ | -------------- |
| **Vercel**     | 100GB bandwidth/month    | $20/month Pro  |
| **Neon**       | 0.5GB storage, 1 project | $19/month      |
| **Gemini API** | 15 req/min, 1500 req/day | Free (for now) |
| **Total**      | **$0/month**             | ~$39/month     |

### **Paid Tier (Better AI)**

| Service             | Cost                  |
| ------------------- | --------------------- |
| **Vercel**          | $20/month (Pro)       |
| **Neon**            | $19/month (Launch)    |
| **OpenAI GPT-4**    | ~$0.03 per analysis   |
| **Claude Sonnet**   | ~$0.015 per analysis  |
| **Estimated Total** | ~$40-50/month + usage |

---

## ✅ Production Checklist

Before going live:

- [ ] PostgreSQL database created and accessible
- [ ] All environment variables set in Vercel
- [ ] Pre-deployment validation passes (`npm run vercel:deploy:production`)
- [ ] Database migrations applied (`prisma migrate deploy`)
- [ ] Test deployment works (profile, analysis, cover letter)
- [ ] Set up monitoring/alerts (Vercel, database, AI API)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (Vercel auto-provides)
- [ ] Analytics tracking enabled (Vercel Analytics)

---

## 🎉 You're Live!

Once deployed, share your app:

- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: Configure in Vercel → Settings → Domains

**Next steps:**

- Monitor usage and costs
- Gather user feedback
- Add features based on needs
- Scale database/API as needed

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
