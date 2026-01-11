# 📚 CareerPal Documentation

> Privacy-first job hunting assistant with dual-mode architecture

---

## 🚀 Quick Start

| Task                       | Document                                             |
| -------------------------- | ---------------------------------------------------- |
| **Local Development**      | [../SETUP.md](../SETUP.md)                           |
| **Deploy to Production**   | [DEPLOYMENT.md](./DEPLOYMENT.md)                     |
| **Dual-Mode Setup**        | [DUAL_MODE_DEPLOYMENT.md](./DUAL_MODE_DEPLOYMENT.md) |
| **Quick Deploy Reference** | [../DEPLOY.md](../DEPLOY.md)                         |

---

## 🏗️ Architecture

| Document                             | Description                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | **Technical architecture** - dual-mode design, storage layer, AI integration |
| [PRD.md](./PRD.md)                   | Product requirements and feature specs                                       |
| [ROADMAP.md](./ROADMAP.md)           | Development roadmap and milestones                                           |

### Key Concepts

- **Local Mode** (`careerpal.app`): Browser storage, BYOK AI, zero server liability
- **Demo Mode** (`demo.careerpal.app`): PostgreSQL, rate-limited AI, daily reset

---

## 🔒 Security & Quality

| Document                                         | Description                         |
| ------------------------------------------------ | ----------------------------------- |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)         | Security review and recommendations |
| [STRICT_RULES.md](./STRICT_RULES.md)             | Code quality gates and validation   |
| [CODE_QUALITY_SETUP.md](./CODE_QUALITY_SETUP.md) | ESLint, Prettier, TypeScript config |
| [TESTING_SETUP.md](./TESTING_SETUP.md)           | Vitest, Playwright setup            |

---

## 🎨 Design & UX

| Document                                                 | Description                       |
| -------------------------------------------------------- | --------------------------------- |
| [ux/README.md](./ux/README.md)                           | UX documentation index            |
| [ux/design-principles.md](./ux/design-principles.md)     | Nordic-inspired design principles |
| [ux/user-journeys.md](./ux/user-journeys.md)             | User flow documentation           |
| [DESIGN_SYSTEM_AUDIT.md](./DESIGN_SYSTEM_AUDIT.md)       | Component library audit           |
| [NORDIC_DESIGN_RESEARCH.md](./NORDIC_DESIGN_RESEARCH.md) | Design research notes             |

---

## 🔧 Technical Notes

Learning notes captured while building:

| Document                                         | Description                  |
| ------------------------------------------------ | ---------------------------- |
| [ai-debugging.md](./ai-debugging.md)             | AI integration lessons       |
| [nextjs-patterns.md](./nextjs-patterns.md)       | Next.js App Router patterns  |
| [database-decisions.md](./database-decisions.md) | Prisma, PostgreSQL decisions |
| [code-quality.md](./code-quality.md)             | Code quality observations    |
| [PACKAGE_AUDIT.md](./PACKAGE_AUDIT.md)           | Dependency audit             |

---

## 🚩 Feature Flags

| Document                                                         | Description                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [feature-flags/README.md](./feature-flags/README.md)             | Feature flag system overview |
| [feature-flags/ADDING_FLAGS.md](./feature-flags/ADDING_FLAGS.md) | How to add new flags         |

---

## 📁 Archive

Historical documents that are no longer actively maintained:

- [archive/IMPLEMENTATION_PLAN.md](./archive/IMPLEMENTATION_PLAN.md)

---

## 🗂️ Related Files

| Location                                             | Description                         |
| ---------------------------------------------------- | ----------------------------------- |
| [../SETUP.md](../SETUP.md)                           | Local development setup             |
| [../DEPLOY.md](../DEPLOY.md)                         | Quick deployment reference          |
| [../OAUTH_VERCEL_SETUP.md](../OAUTH_VERCEL_SETUP.md) | OAuth configuration                 |
| [../FREE-AI-SETUP.md](../FREE-AI-SETUP.md)           | Free AI API setup guide             |
| [../.planning/](../.planning/)                       | GSD planning documents (gitignored) |

---

## 📊 Project Status

See [ARCHITECTURE.md](./ARCHITECTURE.md) for current technical state.

| Phase                     | Status        |
| ------------------------- | ------------- |
| Storage Abstraction       | ✅ Complete   |
| BYOK (Bring Your Own Key) | ✅ Complete   |
| Demo Mode Protections     | ✅ Complete   |
| UI Mode Adaptations       | ✅ Complete   |
| Dual Deployment           | ✅ Documented |
| Documentation             | ✅ Complete   |

---

**Last updated:** January 11, 2026
