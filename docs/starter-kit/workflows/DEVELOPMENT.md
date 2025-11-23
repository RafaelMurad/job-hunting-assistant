# Development Workflow

Day-to-day development practices.

## Git Workflow

### Branch Naming

```
feature/    - New features
fix/        - Bug fixes
refactor/   - Code improvements
docs/       - Documentation
chore/      - Maintenance
```

Examples:
- `feature/user-authentication`
- `fix/login-redirect-loop`
- `refactor/simplify-api-client`

### Commit Messages

```
type(scope): description

feat(auth): add Google OAuth login
fix(api): handle null user gracefully
docs(readme): update installation steps
refactor(hooks): extract shared logic
chore(deps): update dependencies
```

### PR Process

1. Create branch from `main`
2. Make changes, commit often
3. Push and create PR
4. Fill out PR template
5. Request review
6. Address feedback
7. Squash and merge

## Development Cycle

### Daily

1. `git pull origin main`
2. Check project board for tasks
3. Create branch for task
4. Develop with tests
5. Push and create PR

### Weekly

1. Review open PRs
2. Update project board
3. Check for dependency updates
4. Review error logs

## Code Quality

### Before Committing

```bash
# Run all checks
npm run validate

# Or individually
npm run lint
npm run type-check
npm run test
```

### Pre-commit Hooks

Husky runs automatically:
- Prettier formatting
- ESLint fixes
- TypeScript check

## Feature Development

### 1. Plan

- Understand requirements
- Break into tasks
- Create feature flag

### 2. Scaffold

```bash
# Create feature structure
mkdir -p lib/features/my-feature/{components,hooks,utils}
```

### 3. Implement

- Start with types
- Build utilities
- Create hooks
- Add components
- Write tests

### 4. Review

- Self-review first
- Request peer review
- Address feedback

### 5. Release

- Enable feature flag for testing
- Test in staging
- Enable for production
- Monitor for issues

## Testing Strategy

### Unit Tests
- Pure functions
- Utilities
- Hooks (with renderHook)

### Integration Tests
- API routes
- Database operations
- Auth flows

### Component Tests
- User interactions
- State changes
- Accessibility

### E2E Tests (when needed)
- Critical user journeys
- Payment flows
- Auth flows

## Debugging

### Console
```typescript
console.log('[Module] Description:', value);
```

### React DevTools
- Component tree
- State inspection
- Profiler

### Network
- Browser DevTools Network tab
- Check API responses
- Verify request payloads

## Performance

### Checklist
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Database queries efficient
- [ ] Caching where appropriate
