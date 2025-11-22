# React Native Mobile App

Cross-platform mobile app built with Expo and React Native.

## What You'll Learn

- **React Native**: Mobile development with React
- **Expo**: Managed workflow and tools
- **Expo Router**: File-based navigation
- **Monorepo**: Code sharing between web and mobile
- **Mobile Patterns**: Native gestures, navigation, offline

## Architecture

```
job-hunting-assistant/
├── app/                    # Next.js web app
├── mobile/                 # Expo mobile app
│   ├── app/               # Expo Router screens
│   │   ├── (tabs)/       # Tab navigation
│   │   └── _layout.tsx   # Root layout
│   ├── components/        # Reusable components
│   ├── constants/         # Theme, config
│   └── hooks/             # Custom hooks
└── packages/
    └── shared/            # Shared code
        ├── types/         # TypeScript types
        ├── utils/         # Helper functions
        └── api/           # API client
```

## Quick Start

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Home | `app/(tabs)/index.tsx` | Dashboard with stats |
| Tracker | `app/(tabs)/tracker.tsx` | Job applications list |
| Analyze | `app/(tabs)/analyze.tsx` | Job analysis form |
| Profile | `app/(tabs)/profile.tsx` | User profile & settings |

## Code Sharing

The `@job-hunter/shared` package contains code used by both apps:

```typescript
// In mobile app
import { formatRelativeTime } from "@job-hunter/shared/utils";
import type { Application } from "@job-hunter/shared/types";
```

## Official Documentation

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
