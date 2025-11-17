# Job Hunt AI

Job Hunt AI eliminates the friction from job hunting through AI-powered CV analysis, cover letter generation, and intelligent application management.

---

## 🎯 MVP Features (v0.1.0)

- **AI-Powered Job Analysis** - Claude Sonnet 4.5 analyzes job fit and provides match scores (0-100%)
- **Cover Letter Generation** - Automatically generate tailored cover letters (max 250 words)
- **Application Tracking** - Track all job applications with status, dates, and notes
- **Master CV System** - Maintain one source of truth for your professional profile

---

## 🚀 Quick Start

See **[SETUP.md](./SETUP.md)** for complete setup instructions.

**TL;DR:**

```bash
npm install
npx prisma migrate dev --name init
# Add ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

---

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn/ui
- **Backend:** Prisma ORM, SQLite (local), Node.js
- **AI:** Claude Sonnet 4.5 (Anthropic)

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Quick start guide and setup instructions
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Detailed technical implementation guide
- **[Product Specification](./docs/product-spec.md)** - Full product documentation

---

## 👨‍💻 Author

**Rafael Murad**

Senior Frontend Engineer with expertise in React, TypeScript, Next.js, and Redux. Previously at Just Eat, delivering features to millions of users across 15+ European markets.

- GitHub: [@RafaelMurad](https://github.com/RafaelMurad)

---

**Built with ❤️ using Claude Code**
