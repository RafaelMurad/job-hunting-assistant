# Feature Flags Architecture

Control feature rollout without deployments.

## Why Feature Flags?

1. **Safe Releases**: Toggle features without redeploying
2. **A/B Testing**: Test variations with users
3. **Gradual Rollout**: Release to subset of users first
4. **Quick Rollback**: Disable broken features instantly
5. **Modular Development**: Work on features in isolation

## Implementation

### Core Files

```
lib/feature-flags/
├── index.ts          # Core logic, storage
├── flags.config.ts   # Flag definitions
├── provider.tsx      # React Context
└── hooks.ts          # useFeatureFlag hook
```

### Adding a Flag

```typescript
// lib/feature-flags/flags.config.ts
export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "my_new_feature",
    name: "My New Feature",
    description: "What this feature does",
    defaultEnabled: false,
    category: "experimental",
  },
];
```

### Using a Flag

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";

function MyComponent() {
  const isEnabled = useFeatureFlag("my_new_feature");

  if (!isEnabled) return null;
  return <NewFeature />;
}
```

### Server-Side

```typescript
// In API route
import { isFeatureEnabled } from "@/lib/feature-flags";

if (!isFeatureEnabled("my_feature")) {
  return Response.json({ error: "Not available" }, { status: 404 });
}
```

## Flag Categories

| Category | Use Case |
|----------|----------|
| `core` | Essential features, usually enabled |
| `experimental` | New features in development |
| `beta` | Ready for testing |
| `deprecated` | Being phased out |

## Environment Overrides

```bash
# .env.local
NEXT_PUBLIC_FF_MY_FEATURE=true
```

Priority: localStorage > env vars > defaults

## Admin Panel

Access at `/admin/flags` to toggle flags during development.

## Best Practices

1. **Default to false** for new features
2. **Clean up** flags after full rollout
3. **Document** what each flag controls
4. **Test both states** (enabled and disabled)
5. **Use categories** for organization

## Migration Path

For production, consider:
- [LaunchDarkly](https://launchdarkly.com/) - Enterprise
- [Unleash](https://www.getunleash.io/) - Open source
- [PostHog](https://posthog.com/) - Analytics + flags
