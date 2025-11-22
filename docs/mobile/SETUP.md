# Mobile App Setup Guide

## Prerequisites

1. **Node.js** 18+ installed
2. **Expo Go** app on your phone (iOS/Android)
3. For iOS Simulator: macOS with Xcode
4. For Android Emulator: Android Studio

## Installation

```bash
# From project root
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npm start
```

## Running the App

### Option 1: Expo Go (Easiest)

1. Run `npm start` in the mobile folder
2. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app
3. App opens on your device

### Option 2: iOS Simulator (macOS only)

```bash
# Install iOS simulator
npm run ios
```

### Option 3: Android Emulator

1. Open Android Studio
2. Start an AVD (Android Virtual Device)
3. Run `npm run android`

## Project Structure

```
mobile/
├── app/                 # Screens (Expo Router)
│   ├── _layout.tsx     # Root layout
│   └── (tabs)/         # Tab navigation
├── components/          # Reusable components
├── constants/           # Theme, colors
├── hooks/              # Custom hooks
├── assets/             # Images, fonts
├── app.json            # Expo config
└── package.json
```

## Connecting to Web API

Update the API base URL:

```typescript
// In mobile/hooks/useApi.ts or similar
import { setApiBaseUrl } from '@job-hunter/shared/api';

// Development (same machine)
setApiBaseUrl('http://localhost:3000');

// Production
setApiBaseUrl('https://your-app.vercel.app');
```

**Note:** For local development on physical device, use your computer's IP address instead of `localhost`.

## Environment Variables

Create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://your-api.vercel.app
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Common Issues

### "Unable to resolve module"

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### iOS build fails

```bash
cd ios
pod install
cd ..
```

### Android build fails

```bash
cd android
./gradlew clean
cd ..
```

## Next Steps

1. Complete the exercises in `EXERCISES.md`
2. Customize the theme in `constants/theme.ts`
3. Add more screens and features
4. Build for production with EAS Build
