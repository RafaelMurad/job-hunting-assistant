# Adding New Feature Flags

## Step 1: Define the Flag

Edit `lib/feature-flags/flags.config.ts`:

```typescript
export const FEATURE_FLAGS: FeatureFlag[] = [
  // ... existing flags

  {
    key: "my_new_feature", // Unique identifier (snake_case)
    name: "My New Feature", // Human-readable name
    description: "What this feature does",
    defaultEnabled: false, // Start disabled
    category: "experimental", // core | experimental | beta | deprecated
  },
];
```

## Step 2: Use the Flag

```tsx
"use client";

import { useFeatureFlag } from "@/lib/feature-flags/hooks";

export function MyComponent() {
  const isEnabled = useFeatureFlag("my_new_feature");

  if (!isEnabled) {
    return <LegacyComponent />; // or null
  }

  return <NewFeature />;
}
```

## Step 3: Test

1. Go to `/admin/flags`
2. Toggle your flag on/off
3. Verify the feature shows/hides correctly

## Categories

| Category       | Use For                             |
| -------------- | ----------------------------------- |
| `core`         | Essential features, usually enabled |
| `experimental` | New features in development         |
| `beta`         | Features ready for testing          |
| `deprecated`   | Features being phased out           |

## Environment Variables

For production, use environment variables:

```bash
# .env.local or Vercel dashboard
NEXT_PUBLIC_FF_MY_NEW_FEATURE=true
```

## Best Practices

1. **Isolate completely**: Feature should work when enabled AND when disabled
2. **Default to false**: New features should be off by default
3. **Clean up**: Remove flags once feature is stable and fully rolled out
4. **Document**: Add description explaining what the flag controls

## Server-Side Checks

For API routes or server components:

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function GET() {
  if (!isFeatureEnabled("my_feature")) {
    return Response.json({ error: "Feature not available" }, { status: 404 });
  }
  // ... feature logic
}
```

Note: Server-side only sees environment variables, not localStorage.
