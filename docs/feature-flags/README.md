# Feature Flags System

A lightweight, type-safe feature flag system for controlling feature rollout.

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";

function MyComponent() {
  const isEnabled = useFeatureFlag("my_feature");

  if (!isEnabled) return null;
  return <NewFeature />;
}
```

## Admin Panel

Access the admin panel at: `/admin/flags`

Toggle flags on/off during development. Changes persist in localStorage.

## Architecture

```
lib/feature-flags/
├── flags.config.ts   # Flag definitions
├── index.ts          # Core logic (storage, env overrides)
├── provider.tsx      # React Context provider
└── hooks.ts          # useFeatureFlag, useFeatureFlags
```

## How It Works

1. **Defaults**: Each flag has a `defaultEnabled` value in `flags.config.ts`
2. **Environment Overrides**: `NEXT_PUBLIC_FF_FLAG_NAME=true` overrides defaults
3. **localStorage**: Admin panel saves to localStorage (development only)
4. **Priority**: localStorage > environment > defaults

## Files

| File              | Purpose                          |
| ----------------- | -------------------------------- |
| `flags.config.ts` | Define all flags here            |
| `index.ts`        | Core functions, storage logic    |
| `provider.tsx`    | React Context for app-wide state |
| `hooks.ts`        | `useFeatureFlag()` hook          |

## Next Steps

- See [ADDING_FLAGS.md](./ADDING_FLAGS.md) for adding new flags
