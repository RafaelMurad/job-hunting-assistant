# Deployment Workflow

From local to production safely.

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Local | Development | localhost:3000 |
| Preview | PR testing | Auto-generated |
| Staging | Pre-production | staging.app.com |
| Production | Live users | app.com |

## Vercel Deployment

### Initial Setup

1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Set up custom domain
4. Enable preview deployments

### Environment Variables

```bash
# Required for all environments
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Optional/feature-specific
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
```

### Deployment Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Or via GitHub
# Push to main → auto-deploy
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Bundle size acceptable

### Database
- [ ] Migrations applied
- [ ] Seed data (if needed)
- [ ] Backup exists

### Environment
- [ ] All env vars set
- [ ] API keys valid
- [ ] Secrets rotated (if needed)

### Features
- [ ] Feature flags configured
- [ ] Critical paths tested
- [ ] Error handling works

## Database Migrations

### Development
```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Apply migration
npx prisma db push
```

### Production
```bash
# Deploy migrations
npx prisma migrate deploy
```

## Rollback Plan

### Code Rollback
```bash
# Vercel - use dashboard
# Or redeploy previous commit
git revert HEAD
git push origin main
```

### Database Rollback
```bash
# If migration failed
npx prisma migrate resolve --rolled-back "migration_name"
```

## Monitoring

### What to Watch

- Error rates (increase after deploy?)
- Response times
- User complaints
- Console errors

### Tools

- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (session replay)

## Post-Deployment

1. **Smoke test** critical paths
2. **Monitor** error rates
3. **Announce** to team
4. **Update** documentation if needed

## Incident Response

### If Something Breaks

1. **Assess** - How bad is it?
2. **Communicate** - Alert team/client
3. **Rollback** - If critical
4. **Fix** - Root cause
5. **Post-mortem** - Document learnings

### Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| P0 | App down | Immediate rollback |
| P1 | Major feature broken | Fix within hours |
| P2 | Minor issue | Fix in next sprint |
| P3 | Cosmetic | Backlog |
