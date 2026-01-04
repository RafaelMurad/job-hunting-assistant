# Job Hunting Assistant

AI-powered job hunting tool that analyzes job descriptions, generates tailored cover letters, and helps you track applications — all in one place.

**🚀 Live Demo:** [job-hunting-assistant.vercel.app](https://job-hunting-assistant.vercel.app)

---

## ✨ Features

### LaTeX CV Editor (Main Showcase)

- Upload PDF/DOCX and AI extracts content to LaTeX
- Multiple professional templates with instant switching
- Live PDF preview and compilation
- ATS compliance checking

### AI Job Analysis

- Paste any job description
- Get match score (0-100%) based on your CV
- See skill gaps and recommendations
- Identify top requirements

### Cover Letter Generation

- One-click AI-generated cover letters
- Tailored to specific job + your experience
- Professional tone, concise format

### Application Tracker

- Track all applications in one place
- Status workflow: Saved → Applied → Interview → Offer
- Notes, dates, and company details

---

## 🛠 Tech Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| **Frontend**   | Next.js 16 (App Router), React 19, TypeScript    |
| **Styling**    | TailwindCSS 4, Shadcn/ui components              |
| **Backend**    | tRPC v11 with React Query                        |
| **Database**   | PostgreSQL (Neon) with Prisma ORM                |
| **Auth**       | NextAuth.js v5 with GitHub OAuth                 |
| **AI**         | Google Gemini 2.5 Flash (free tier) + OpenRouter |
| **Deployment** | Vercel with CI/CD                                |

---

## 💡 What This Demonstrates

| Skill                     | Implementation                                               |
| ------------------------- | ------------------------------------------------------------ |
| **Full-Stack TypeScript** | End-to-end type safety with Next.js + tRPC + Prisma          |
| **AI Integration**        | Multi-model support, streaming responses, prompt engineering |
| **Modern React**          | Server Components, Suspense, custom hooks                    |
| **API Design**            | Type-safe tRPC procedures with Zod validation                |
| **Database Design**       | PostgreSQL schema with Prisma, connection pooling            |
| **Authentication**        | OAuth flow with NextAuth.js v5, JWT sessions                 |
| **Code Quality**          | ESLint, Prettier, Husky hooks, automated testing             |
| **DevOps**                | Vercel deployment, pre-commit validation, CI checks          |

---

## 📸 Screenshots

<!-- TODO: Add screenshots -->

_Coming soon_

---

## 🧪 Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) free tier)
- Gemini API key (free from [AI Studio](https://aistudio.google.com/app/apikey))

### Setup

```bash
# Clone and install
git clone https://github.com/RafaelMurad/job-hunting-assistant.git
cd job-hunting-assistant
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and GEMINI_API_KEY

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/                    # Next.js App Router pages
├── dashboard/          # Stats overview
├── profile/            # CV upload and profile management
├── analyze/            # Job analysis + cover letter generation
├── cv/                 # LaTeX CV editor
└── tracker/            # Application tracking

lib/
├── ai/                 # AI providers and prompts
├── trpc/               # tRPC routers and procedures
├── hooks/              # Custom React hooks
└── validations/        # Zod schemas

components/
├── ui/                 # Shadcn/ui components
└── ...                 # Feature components
```

---

## 👨‍💻 Author

**Rafael Murad**

Senior Frontend Engineer • React, TypeScript, Next.js

- GitHub: [@RafaelMurad](https://github.com/RafaelMurad)
- LinkedIn: [linkedin.com/in/rafaelmurad](https://linkedin.com/in/rafaelmurad)
