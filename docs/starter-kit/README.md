# Freelance Starter Kit

Your professional foundation for bootstrapping new projects.

## What's Included

### Architecture Decisions
- [Tech Stack](architecture/TECH_STACK.md) - Why Next.js, TypeScript, etc.
- [Project Structure](architecture/PROJECT_STRUCTURE.md) - How to organize code
- [Design System](architecture/DESIGN_SYSTEM.md) - Nordic design tokens
- [Feature Flags](architecture/FEATURE_FLAGS.md) - Modular feature development

### Templates
- [Component Template](templates/components/) - React component patterns
- [Feature Template](templates/features/) - Full feature scaffold
- [API Route Template](templates/api/) - Next.js API patterns

### Workflows
- [Client Onboarding](workflows/CLIENT_ONBOARDING.md)
- [Project Kickoff](workflows/PROJECT_KICKOFF.md)
- [Development Workflow](workflows/DEVELOPMENT.md)
- [Deployment Checklist](workflows/DEPLOYMENT.md)

### Checklists
- [New Project Checklist](checklists/NEW_PROJECT.md)
- [Code Review Checklist](checklists/CODE_REVIEW.md)
- [Launch Checklist](checklists/LAUNCH.md)

## Quick Start: New Project

```bash
# 1. Clone the starter kit
git clone <this-repo> my-new-project
cd my-new-project

# 2. Remove git history and start fresh
rm -rf .git
git init

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env.local

# 5. Start developing
npm run dev
```

## Philosophy

1. **Feature Flags First** - Every feature can be toggled
2. **Modular Architecture** - Easy to add/remove features
3. **Documentation** - Every decision is documented
4. **Learning Built-In** - Exercises for growth
5. **Production Ready** - Not just demos, real patterns

## Stack Overview

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 16 | App Router, RSC, great DX |
| Language | TypeScript | Type safety, better tooling |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Database | Prisma + PostgreSQL | Type-safe ORM, scalable |
| Testing | Vitest | Fast, Vite-native |
| Mobile | Expo (React Native) | Cross-platform, shared code |
