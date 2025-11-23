# Code Review Checklist

Use when reviewing PRs (yours or others).

## Functionality

- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No obvious bugs

## Code Quality

- [ ] Follows project conventions
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] Names are descriptive
- [ ] Comments where needed (not obvious code)

## TypeScript

- [ ] No `any` types (unless justified)
- [ ] Types are accurate
- [ ] No type assertions (`as`) unless necessary
- [ ] Proper use of generics

## Performance

- [ ] No unnecessary re-renders
- [ ] Heavy computations memoized
- [ ] Database queries efficient
- [ ] No N+1 queries
- [ ] Images optimized

## Security

- [ ] No secrets in code
- [ ] User input validated
- [ ] SQL injection prevented (Prisma helps)
- [ ] XSS prevented
- [ ] Auth checks in place

## Testing

- [ ] Tests exist for new code
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases tested
- [ ] Tests pass

## Accessibility

- [ ] Semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient

## Documentation

- [ ] README updated (if needed)
- [ ] JSDoc for complex functions
- [ ] Breaking changes noted

## Review Questions

Ask yourself:

1. **Would I understand this code in 6 months?**
2. **Is there a simpler way to do this?**
3. **What could go wrong?**
4. **Is this tested?**
5. **Does this follow our patterns?**

## Giving Feedback

### Good
```
Consider using useMemo here to avoid recalculating on every render.
```

### Better
```
This calculation runs on every render. Consider using useMemo:

const result = useMemo(() => expensiveCalc(data), [data]);

This will only recalculate when data changes.
```

### Don't
```
This is wrong.
```

## Receiving Feedback

1. **Don't take it personally** - it's about the code
2. **Ask questions** if unclear
3. **Explain your reasoning** if you disagree
4. **Thank reviewers** for their time
