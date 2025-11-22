# Exercises: React Native Mobile App

## Exercise 1: Pull-to-Refresh

**File:** `mobile/app/(tabs)/index.tsx`

**Goal:** Add pull-to-refresh to reload data.

```tsx
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  // Fetch new data
  await fetchData();
  setRefreshing(false);
}, []);

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.fjord[600]}
    />
  }
>
```

---

## Exercise 2: Swipe Actions

**File:** `mobile/app/(tabs)/tracker.tsx`

**Goal:** Add swipe-to-delete on application cards.

**Install:**
```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

```tsx
import { Swipeable } from 'react-native-gesture-handler';

function ApplicationCard({ onDelete }) {
  const renderRightActions = () => (
    <Pressable onPress={onDelete} style={styles.deleteAction}>
      <Ionicons name="trash" size={24} color="white" />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {/* Card content */}
    </Swipeable>
  );
}
```

---

## Exercise 3: Keyboard Handling

**File:** `mobile/app/(tabs)/analyze.tsx`

**Goal:** Form should scroll when keyboard appears.

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={100}
>
  <ScrollView>
    {/* Form content */}
  </ScrollView>
</KeyboardAvoidingView>
```

---

## Exercise 4: Image Picker

**File:** `mobile/app/(tabs)/profile.tsx`

**Goal:** Allow users to pick a profile photo.

**Install:**
```bash
npx expo install expo-image-picker
```

```tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    setProfileImage(result.assets[0].uri);
  }
};
```

---

## Exercise 5: Connect to API

**Goal:** Replace mock data with real API calls.

**File:** Create `mobile/hooks/useApplications.ts`

```tsx
import { useState, useEffect } from 'react';
import { applicationsApi, setApiBaseUrl } from '@job-hunter/shared/api';

// Set your API URL
setApiBaseUrl('https://your-api.vercel.app');

export function useApplications(userId: string) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    applicationsApi.list(userId)
      .then(setApplications)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { applications, loading, error };
}
```

---

## Exercise 6: Push Notifications

**Goal:** Send notifications for interview reminders.

**Install:**
```bash
npx expo install expo-notifications
```

```tsx
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Interview Reminder",
    body: "You have an interview at Google tomorrow!",
  },
  trigger: {
    date: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  },
});
```

---

## Bonus: Build for Production

1. **Configure app.json** with proper bundle IDs
2. **Create Expo account**: `npx expo register`
3. **Build**: `npx expo build:ios` / `npx expo build:android`
4. **Or use EAS Build**: `npx eas-cli build`

See: https://docs.expo.dev/build/introduction/
