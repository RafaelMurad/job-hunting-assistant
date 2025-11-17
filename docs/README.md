# Job Hunt AI

**An intelligent job application management system powered by AI**

Job Hunt AI eliminates the friction from job hunting through AI-powered CV tailoring, natural language tracking, and intelligent application management.

---

## 🎯 Core Features

- **AI-Powered CV Tailoring** - Automatically adapts your CV to match each job's requirements using Claude AI
- **Intelligent Context Extraction** - Understands natural language ("I've applied") without manual data entry
- **Professional Document Generation** - Creates tailored CVs and cover letters in multiple styles
- **Smart Organization** - Automatic folder structure and file naming
- **Application Tracking** - Complete pipeline visibility with Kanban board, table, and calendar views
- **Persistent Storage** - Never lose application data with cloud-based storage

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod validation
- **PDF Generation:** @react-pdf/renderer

### Backend
- **Runtime:** Node.js 20+
- **API:** tRPC (type-safe APIs)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Database:** PostgreSQL

### AI/LLM
- **Primary:** Claude Sonnet 4.5 (Anthropic)
- **Use Cases:** Job analysis, CV tailoring, cover letter generation

### Infrastructure
- **Hosting:** Vercel
- **Database:** Neon / Supabase
- **File Storage:** AWS S3 / Cloudflare R2
- **Email:** Resend
- **Analytics:** PostHog / Mixpanel
- **Error Tracking:** Sentry

---

## 📖 Documentation

- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Detailed technical implementation guide (6-10 week MVP)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL 16+ running (or use Docker)
- Claude API key from Anthropic
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/RafaelMurad/job-hunting-assistant.git
cd job-hunting-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma generate

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📊 Roadmap

### MVP (Phase 1) - Weeks 1-8
- ✅ Project planning and architecture
- 🔄 Foundation setup
- ⏳ Master CV builder
- ⏳ Job analysis with Claude AI
- ⏳ CV tailoring and PDF generation
- ⏳ Application tracking and dashboard

### Phase 2 - Weeks 9-16
- Email notifications
- Calendar integration
- Advanced analytics
- Interview preparation
- Chrome extension (autofill)

### Phase 3 - Weeks 17-24
- Mobile app
- AI interview coach
- Network analysis
- Team accounts
- API for integrations

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Rafael Murad**

Senior Frontend Engineer with expertise in React, TypeScript, Next.js, and Redux. Previously at Just Eat, delivering features to millions of users across 15+ European markets.

- GitHub: [@RafaelMurad](https://github.com/RafaelMurad)

---

**Built with ❤️ using Claude AI**
