# Job Hunt AI

Job Hunt AI eliminates the friction from job hunting through AI-powered CV analysis, cover letter generation, and intelligent application management.

**Live Demo:** [job-hunting-assistant.vercel.app](https://job-hunting-assistant.vercel.app)

---

## 🎯 Features (v1.1)

### Core Features

- **AI-Powered Job Analysis** - Analyze job descriptions against your CV with match scores (0-100%)
- **Cover Letter Generation** - Automatically generate tailored cover letters (max 250 words)
- **Application Tracking** - Track all job applications with status, dates, and notes
- **Master CV System** - Maintain one source of truth for your professional profile
- **CV Upload** - Import PDF/DOCX files with AI-powered data extraction
- **CV LaTeX Editor** - Edit and compile professional CV templates

### Authentication & Integrations (v1.1)

- **OAuth Sign-In** - GitHub, Google, LinkedIn authentication
- **GitHub Integration** - Import repos, languages, contributions
- **LinkedIn Integration** - Profile sync (API limited)
- **Mobile Navigation** - Responsive hamburger menu for mobile devices

### Free AI Option

- Use Google Gemini (1,500 free analyses/day) or paid options (OpenAI, Claude)

---

## 🚀 Quick Start

See **[FREE-AI-SETUP.md](./FREE-AI-SETUP.md)** for using the free Google Gemini option (recommended).

Or see **[SETUP.md](./SETUP.md)** for complete setup instructions.

**TL;DR (Free Setup):**

```bash
# Get free Gemini API key from: https://aistudio.google.com/app/apikey
npm install
npx prisma migrate dev --name init
# Add GEMINI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

---

## 🚀 Tech Stack

- **Frontend:** Next.js 16, TypeScript, TailwindCSS, Shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL (Neon)
- **AI:** Multi-provider support
  - Google Gemini 2.0 Flash (FREE - 1,500 requests/day) ⭐ Recommended
  - OpenAI GPT-4o-mini (Paid - ~$0.0005/analysis)
  - Claude Sonnet 4.5 (Paid - ~$0.002/analysis)

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Quick start guide and local setup
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment to Vercel 🚀
- **[STRICT_RULES.md](./docs/STRICT_RULES.md)** - Code quality and validation rules
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Technical implementation details
- **[PRD](./docs/PRD.md)** - Product Requirements Document

---

## 🌐 Production Deployment

This app is production-ready with:

- ✅ **Vercel Deployment** - One-click deploy with automatic CI/CD
- ✅ **PostgreSQL Database** - Production-ready with connection pooling
- ✅ **Pre-Deployment Validation** - Automated checks before every deploy
- ✅ **Multi-Layer Quality Gates** - Pre-commit, pre-push, and CI checks
- ✅ **Security Headers** - XSS protection, frame-deny, CSP

**Deploy now:** See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for step-by-step guide.

```bash
# Deploy to Vercel (with validation)
npm run vercel:deploy:production
```

---

## 👨‍💻 Author

**Rafael Murad**

Senior Frontend Engineer with expertise in React, TypeScript, Next.js, and Redux. Previously at Just Eat, delivering features to millions of users across 15+ European markets.

- GitHub: [@RafaelMurad](https://github.com/RafaelMurad)

---

**Built with ❤️ using Claude Code**
