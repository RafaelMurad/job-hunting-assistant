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

## 📋 Project Status

**Current Phase:** Planning & Foundation Setup
**MVP Target:** 6-10 weeks
**Version:** 0.1.0-alpha

### Implementation Progress

- [ ] Phase 1.1: Foundation Setup (Weeks 1-2)
  - [ ] Next.js project initialization
  - [ ] Prisma + PostgreSQL setup
  - [ ] TailwindCSS + Shadcn/ui configuration
  - [ ] tRPC setup
  - [ ] Authentication (NextAuth.js)

- [ ] Phase 1.2: Master CV System (Weeks 3-4)
  - [ ] Master CV data models
  - [ ] Onboarding wizard (5 steps)
  - [ ] CV editor interface

- [ ] Phase 1.3: Job Analysis (Weeks 5-6)
  - [ ] Claude API integration
  - [ ] Job description analysis
  - [ ] Match scoring algorithm
  - [ ] Analysis results UI

- [ ] Phase 1.4: CV Generation & Tracking (Weeks 7-8)
  - [ ] CV tailoring logic
  - [ ] PDF generation (3 styles)
  - [ ] Cover letter generation
  - [ ] Application tracking system
  - [ ] Dashboard (Kanban, Table, Calendar)

- [ ] Phase 1.5: Polish & Deploy (Week 8)
  - [ ] Error handling & loading states
  - [ ] Responsive design
  - [ ] Testing (unit, integration, E2E)
  - [ ] Documentation
  - [ ] Production deployment

---

## 📖 Documentation

- **[Product Specification](./docs/product-spec.md)** - Full product documentation
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Detailed technical implementation guide
- **[API Documentation](./docs/api.md)** - API endpoints and schemas (Coming soon)
- **[User Guide](./docs/user-guide.md)** - How to use Job Hunt AI (Coming soon)

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

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobhuntai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Claude API
ANTHROPIC_API_KEY="your-claude-api-key"

# Email (optional for MVP)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@jobhuntai.com"

# File Storage (optional for MVP)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""
```

---

## 🗂️ Project Structure

```
job-hunt-ai/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── (auth)/          # Authentication routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── jobs/            # Job analysis
│   │   ├── cv/              # CV management
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   └── features/        # Feature-specific components
│   ├── lib/
│   │   ├── api/             # tRPC client
│   │   ├── db/              # Prisma client
│   │   ├── ai/              # Claude API integration
│   │   ├── pdf/             # PDF generation
│   │   └── utils/           # Helper functions
│   ├── server/
│   │   ├── routers/         # tRPC routers
│   │   └── trpc.ts          # tRPC config
│   └── types/               # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── tests/                   # Test files
└── docs/                    # Documentation
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma migrate dev   # Create and apply migrations
npx prisma generate      # Generate Prisma Client

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
```

### Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit: `git commit -m "feat: your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

---

## 🎨 Design System

### Colors

- **Brand Primary:** `#2563eb` (Blue)
- **Status Colors:**
  - Applied: `#6b7280` (Gray)
  - Screening: `#3b82f6` (Blue)
  - Technical: `#8b5cf6` (Purple)
  - Final: `#f59e0b` (Amber)
  - Offer: `#10b981` (Green)
  - Rejected: `#ef4444` (Red)

### Typography

- **Font:** Inter (sans-serif)
- **Monospace:** JetBrains Mono

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Setup

1. **Database:** Set up PostgreSQL on Neon or Supabase
2. **File Storage:** Configure S3 or Cloudflare R2
3. **Environment Variables:** Add all variables in Vercel dashboard
4. **Domain:** Configure custom domain (optional)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Update documentation
6. Submit a pull request

### Code Style

- Use TypeScript for all code
- Follow ESLint rules
- Format with Prettier
- Write meaningful commit messages (Conventional Commits)

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
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [Prisma](https://www.prisma.io/) - Database ORM
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Hosting platform

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Link to docs]

---

**Built with ❤️ by Rafael Murad**
