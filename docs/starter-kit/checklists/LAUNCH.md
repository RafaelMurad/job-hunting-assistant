# Launch Checklist

Final checks before going live.

## Pre-Launch (1 Week Before)

### Code
- [ ] All features complete
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security review done

### Content
- [ ] Copy finalized
- [ ] Images optimized
- [ ] Legal pages ready (Privacy, Terms)
- [ ] 404 page customized
- [ ] Error pages styled

### Infrastructure
- [ ] Production database ready
- [ ] All env vars configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] CDN configured (if needed)

### Monitoring
- [ ] Error tracking set up (Sentry)
- [ ] Analytics enabled
- [ ] Uptime monitoring configured
- [ ] Alerts configured

## Launch Day

### Morning
- [ ] Final staging test
- [ ] Database backup
- [ ] Deploy to production
- [ ] Smoke test critical paths

### Verification
- [ ] Home page loads
- [ ] Authentication works
- [ ] Core features work
- [ ] Payments process (if applicable)
- [ ] Emails send

### Communication
- [ ] Team notified
- [ ] Client notified
- [ ] Users notified (if applicable)
- [ ] Social media posted (if applicable)

## Post-Launch (First 24 Hours)

### Monitor
- [ ] Error rates
- [ ] Response times
- [ ] User feedback
- [ ] Server resources

### Be Ready To
- [ ] Rollback if needed
- [ ] Hot fix critical issues
- [ ] Scale resources
- [ ] Communicate issues

## Post-Launch (First Week)

### Review
- [ ] Analyze user behavior
- [ ] Gather feedback
- [ ] Prioritize fixes
- [ ] Plan improvements

### Document
- [ ] Post-mortem (if issues)
- [ ] Update documentation
- [ ] Archive launch materials

## Common Launch Issues

| Issue | Solution |
|-------|----------|
| 500 errors | Check logs, env vars |
| Slow pages | Check database, caching |
| Auth failures | Check secrets, URLs |
| Missing styles | Check build, CDN |
| Form failures | Check validation, CSRF |

## Emergency Contacts

Have ready:
- Hosting support (Vercel)
- Database support (Supabase/Neon)
- Domain registrar
- Payment processor
- Team members

## Rollback Plan

If things go wrong:

1. **Don't panic**
2. **Assess severity**
3. **Communicate** to stakeholders
4. **Rollback** to last working version
5. **Investigate** root cause
6. **Fix** and redeploy
7. **Post-mortem** to prevent recurrence
