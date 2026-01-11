<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI_Powered-Gemini-4285F4?style=for-the-badge&logo=google" alt="AI Powered" />
</p>

<h1 align="center">🎯 CareerPal - Job Hunting Assistant</h1>

<p align="center">
  <strong>Privacy-first job hunting. Your data never leaves your browser.</strong>
  <br />
  Clone, run locally, and own your job search data completely.
</p>

<p align="center">
  <a href="https://job-hunting-assistant.vercel.app">🎭 Try Demo</a>
  •
  <a href="#-quick-start">Clone & Run</a>
  •
  <a href="#-features">Features</a>
  •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## 🌟 Why This Project?

Job hunting shouldn't feel like a second full-time job. This project tackles the fragmented, tedious nature of modern job applications by bringing everything into one intelligent platform—**without compromising your privacy**.

### 🔒 Privacy-First Architecture

| Mode           | How It Works                                             | Your Data                                                     |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| **Local Mode** | Clone repo, run locally                                  | Stored in your browser (IndexedDB). Never touches any server. |
| **Demo Mode**  | [Try the demo](https://job-hunting-assistant.vercel.app) | Server-stored, resets daily. Great for testing.               |

### 💡 Problems Solved

| Problem                               | Solution                                                           |
| ------------------------------------- | ------------------------------------------------------------------ |
| 📄 Updating CVs for each application  | Upload once → AI extracts → Edit with professional LaTeX templates |
| ✍️ Writing personalized cover letters | One-click AI generation tailored to each job                       |
| 🔍 Understanding job fit              | Instant match scoring with skill gap analysis                      |
| 📊 Tracking applications              | Unified tracker with status workflow and notes                     |
| 🔐 Trusting SaaS with career data     | Run locally—bring your own AI keys, zero server liability          |

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 📝 LaTeX CV Editor

**The crown jewel of this project**

- **AI-Powered Import** — Upload PDF/DOCX, AI extracts to professional LaTeX
- **Syntax Highlighting** — CodeMirror editor with LaTeX language support
- **Template Gallery** — Switch between professional templates instantly
- **Live Preview** — See your changes rendered in real-time
- **ATS Optimized** — Designed to pass Applicant Tracking Systems

</td>
<td width="50%" valign="top">

### 🤖 AI Job Analysis

**Understand your fit before you apply**

- **Match Scoring** — Get a 0-100% compatibility score
- **Skill Gap Analysis** — See exactly what you're missing
- **Top Requirements** — Know what matters most to the employer
- **Smart Recommendations** — Actionable suggestions to improve your odds

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 💌 Cover Letter Generation

**Personalized letters in seconds**

- **One-Click Generation** — AI crafts tailored letters instantly
- **Job-Specific** — References key requirements from the posting
- **Professional Tone** — Polished, concise, and compelling
- **Easy Editing** — Fine-tune before sending

</td>
<td width="50%" valign="top">

### 📊 Application Tracker

**Never lose track again**

- **Visual Workflow** — Saved → Applied → Interview → Offer/Rejected
- **Quick Stats** — Dashboard with application metrics
- **Rich Notes** — Add context and follow-up reminders
- **History Timeline** — See your entire job search journey

</td>
</tr>
</table>

---

## 🛠 Tech Stack

This project showcases modern full-stack development with cutting-edge technologies:

<table>
<tr>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
<br>Next.js 16
</td>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br>React 19
</td>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind 4
</td>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
<br>PostgreSQL
</td>
<td align="center" valign="top" width="96">
<img src="https://skillicons.dev/icons?i=prisma" width="48" height="48" alt="Prisma" />
<br>Prisma
</td>
</tr>
</table>

| Layer              | Technology                   | Why                                                 |
| ------------------ | ---------------------------- | --------------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)      | Server Components, streaming, latest React features |
| **Type Safety**    | tRPC v11 + Zod               | End-to-end type safety, no API boilerplate          |
| **Database**       | PostgreSQL (Neon) + Prisma   | Serverless-ready, connection pooling, type-safe ORM |
| **Authentication** | Neon Auth                    | Seamless email/password + OAuth integration         |
| **AI Provider**    | Google Gemini 2.5 Flash      | Free tier, excellent for document processing        |
| **Editor**         | CodeMirror 6                 | Professional code editing with LaTeX support        |
| **Styling**        | TailwindCSS 4 + Shadcn/ui    | Nordic-inspired design system                       |
| **Quality**        | Qodana + Vitest + Playwright | Static analysis, unit tests, E2E coverage           |

---

## 💡 Engineering Highlights

<details>
<summary><strong>🔒 Type-Safe Architecture</strong></summary>

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  React Components → Custom Hooks → tRPC Client               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Full Type Inference
┌──────────────────────────▼──────────────────────────────────┐
│                          tRPC                                │
│  Input (Zod) → Procedures → Output (inferred)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Types
┌──────────────────────────▼──────────────────────────────────┐
│                        Database                              │
│  PostgreSQL → Prisma ORM → Generated Types                  │
└─────────────────────────────────────────────────────────────┘
```

Zero runtime type errors. Change a database column? TypeScript catches every affected line.

</details>

<details>
<summary><strong>🤖 Multi-Model AI System</strong></summary>

```typescript
// lib/ai/ - Modular AI provider system
├── config.ts      // Model definitions & availability
├── prompts.ts     // Reusable prompt templates
├── schemas.ts     // Zod schemas for AI responses
├── providers/
│   ├── gemini.ts  // Google Gemini integration
│   └── openrouter.ts // OpenRouter for fallbacks
```

- **Free-tier first** — Optimized for Gemini's generous free quota
- **Graceful fallbacks** — Switch providers without code changes
- **Structured outputs** — Zod validation ensures consistent AI responses
</details>

<details>
<summary><strong>🧪 Testing Excellence</strong></summary>

```bash
npm run validate  # Runs all quality checks

✅ ESLint        — Zero warnings allowed
✅ TypeScript    — Strict mode, no implicit any
✅ Prettier      — Consistent formatting
✅ Vitest        — 380+ unit/integration tests
✅ Playwright    — E2E browser automation
✅ Qodana        — Static code analysis (JetBrains)
```

</details>

<details>
<summary><strong>🎨 Nordic Design System</strong></summary>

A carefully crafted design language inspired by Scandinavian minimalism:

- **Clean typography** — Inter for UI, Fira Code for code
- **Muted palette** — Professional grays with strategic accent colors
- **Generous spacing** — Breathable layouts that reduce cognitive load
- **Dark mode** — Full theme support with smooth transitions
</details>

---

## 🚀 Quick Start

### Option 1: Run Locally (Recommended)

**Your data stays in your browser. No database needed.**

```bash
# 1. Clone the repository
git clone https://github.com/RafaelMurad/job-hunting-assistant.git
cd job-hunting-assistant

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and start hunting! 🎯

> **Note**: For AI features, add your own API keys in Settings:
>
> - **Gemini** (free): [Get key from AI Studio](https://aistudio.google.com/app/apikey)
> - **OpenRouter** (optional): [Get key](https://openrouter.ai/keys)

### Option 2: Try the Demo

Don't want to clone? **[Try the live demo →](https://job-hunting-assistant.vercel.app)**

Demo mode uses server-hosted AI (rate-limited) and resets daily.

### Advanced: Server Mode Setup

If you want to run with server-side storage (like the demo), see [docs/DUAL_MODE_DEPLOYMENT.md](docs/DUAL_MODE_DEPLOYMENT.md) for database and auth configuration.

---

## 📁 Project Architecture

```
📦 job-hunting-assistant
├── 🎨 app/                    # Next.js App Router
│   ├── dashboard/             # Stats overview
│   ├── profile/               # CV upload & profile
│   ├── analyze/               # Job analysis
│   ├── cv/                    # LaTeX editor
│   └── tracker/               # Application tracking
│
├── 🧩 components/             # React components
│   ├── ui/                    # Shadcn/ui primitives
│   └── latex-editor.tsx       # CodeMirror LaTeX editor
│
├── 📚 lib/                    # Core logic
│   ├── ai/                    # AI providers & prompts
│   ├── trpc/                  # Type-safe API layer
│   ├── hooks/                 # Custom React hooks
│   └── validations/           # Zod schemas
│
├── 🗄️ prisma/                 # Database schema
│
└── 🧪 __tests__/              # Test suites
    ├── unit/                  # Unit tests
    ├── integration/           # API tests
    └── e2e/                   # Playwright E2E
```

---

## 🎯 Roadmap

- [x] **v1.0** — MVP with core features
- [x] **v1.1** — UX overhaul + mobile support
- [x] **v1.2** — Neon Auth integration
- [ ] **v1.3** — PDF export + email integration
- [ ] **v1.4** — Job board API integrations
- [ ] **v2.0** — Interview prep AI assistant

---

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome! Feel free to:

- ⭐ Star the repo if you find it interesting
- 🐛 Open issues for bugs or suggestions
- 💬 Reach out with questions

---

## 👨‍💻 Author

<table>
<tr>
<td align="center">
<strong>Rafael Murad</strong>
<br />
<sub>Frontend Engineer</sub>
<br />
<sub>React • TypeScript • Next.js</sub>
<br /><br />
<a href="https://github.com/RafaelMurad">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github" alt="GitHub" />
</a>
<a href="https://www.linkedin.com/in/rflmurad">
<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
</a>
</td>
</tr>
</table>

---

<p align="center">
  <sub>Built with ☕ and a passion for clean code</sub>
  <br />
  <sub>© 2026 Rafael Murad</sub>
</p>
