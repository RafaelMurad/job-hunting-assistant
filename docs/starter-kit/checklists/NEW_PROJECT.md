# New Project Checklist

Use this checklist when starting any new project.

## Phase 1: Setup (Day 1)

### Repository
- [ ] Clone starter kit
- [ ] Remove `.git`, run `git init`
- [ ] Update `package.json` (name, description)
- [ ] Create GitHub repo
- [ ] Push initial commit
- [ ] Set up branch protection

### Environment
- [ ] Copy `.env.example` to `.env.local`
- [ ] Generate `NEXTAUTH_SECRET`
- [ ] Set up database
- [ ] Update `DATABASE_URL`
- [ ] Test `npm run dev`

### Configuration
- [ ] Update `app/layout.tsx` metadata
- [ ] Update `public/manifest.json`
- [ ] Replace favicon/icons
- [ ] Update color scheme (if needed)

## Phase 2: Foundation (Week 1)

### Database
- [ ] Design initial schema
- [ ] Create Prisma models
- [ ] Run migrations
- [ ] Seed sample data

### Authentication
- [ ] Choose auth method
- [ ] Implement login flow
- [ ] Protect routes
- [ ] Test auth flow

### Core Features
- [ ] List required features
- [ ] Create feature flags for each
- [ ] Scaffold feature directories
- [ ] Define data models

## Phase 3: Development (Weeks 2+)

### Per Feature
- [ ] Create types
- [ ] Build API routes
- [ ] Create UI components
- [ ] Add tests
- [ ] Enable feature flag
- [ ] Test in staging

### Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Accessibility checked

## Phase 4: Deployment

### Staging
- [ ] Connect to Vercel
- [ ] Configure env vars
- [ ] Deploy preview
- [ ] Test critical paths

### Production
- [ ] Set production env vars
- [ ] Configure custom domain
- [ ] Enable analytics
- [ ] Set up monitoring
- [ ] Deploy to production

## Phase 5: Handoff

### Documentation
- [ ] README complete
- [ ] API documented
- [ ] Environment vars listed
- [ ] Deployment guide written

### Client
- [ ] Demo completed
- [ ] Access granted
- [ ] Training provided
- [ ] Support plan agreed
