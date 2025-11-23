# Project Kickoff Workflow

First steps when starting any new project.

## Day 1 Checklist

### Repository Setup
- [ ] Create GitHub repository
- [ ] Clone starter kit template
- [ ] Remove .git and reinitialize
- [ ] Set up branch protection (main)
- [ ] Add collaborators

### Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set up database (Supabase/Neon/local)
- [ ] Configure authentication (if needed)
- [ ] Verify `npm run dev` works

### Project Management
- [ ] Create project board (Linear/GitHub Projects)
- [ ] Define initial milestones
- [ ] Create first sprint/iteration
- [ ] Set up documentation (Notion/README)

### Communication
- [ ] Create Slack/Discord channel
- [ ] Schedule recurring meetings
- [ ] Share relevant credentials securely

## Technical Decisions Document

Create `docs/DECISIONS.md`:

```markdown
# Technical Decisions

## [Date] - [Decision Title]

**Context:** Why we needed to decide
**Decision:** What we decided
**Consequences:** What this means going forward
**Alternatives:** What else we considered
```

## Initial Architecture

### Questions to Answer

1. **Data Model**
   - What are the main entities?
   - How do they relate?
   - What needs to be persisted?

2. **Authentication**
   - Who can access?
   - What auth method?
   - Role-based access needed?

3. **Integrations**
   - External APIs?
   - Payment processing?
   - Email/notifications?

4. **Scale Expectations**
   - Users: tens, hundreds, thousands?
   - Data volume?
   - Geographic distribution?

## Feature Flags Setup

Create flags for all planned features:

```typescript
// lib/feature-flags/flags.config.ts
export const FEATURE_FLAGS = [
  { key: "feature_a", defaultEnabled: false, category: "experimental" },
  { key: "feature_b", defaultEnabled: false, category: "experimental" },
  // Add all planned features
];
```

## Sprint 0 Goals

First sprint should deliver:

1. **Working skeleton** - App runs, deploys
2. **Auth flow** - Users can sign in
3. **Core data model** - Database schema
4. **CI/CD** - Automated tests + deploy
5. **Documentation** - README complete

## Definition of Done

For this project, "done" means:

- [ ] Feature works as specified
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
