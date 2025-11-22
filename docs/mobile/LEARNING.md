# Learning Guide: React Native & Expo

## Core Concepts

### 1. React Native vs React

| React (Web) | React Native |
|-------------|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<Pressable>` / `<TouchableOpacity>` |
| CSS | StyleSheet |

### 2. Styling

```typescript
// Web CSS
const styles = {
  container: {
    display: 'flex',
    padding: '16px',
  }
};

// React Native StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,        // flexDirection: 'column' by default
    padding: 16,    // No units, just numbers
  }
});
```

**Key differences:**
- No CSS units (px, rem) - just numbers
- `flexDirection: 'column'` by default
- No CSS grid (use nested flex)
- No pseudo-classes (`:hover`)
- Platform-specific shadows

### 3. Navigation (Expo Router)

File-based routing like Next.js:

```
app/
├── _layout.tsx      # Root layout
├── index.tsx        # / route
├── profile.tsx      # /profile route
└── (tabs)/          # Tab group
    ├── _layout.tsx  # Tab navigator
    ├── index.tsx    # First tab
    └── settings.tsx # Second tab
```

### 4. Expo vs Bare React Native

**Expo (Managed):**
- Easy setup
- OTA updates
- Pre-built native modules
- Limited native customization

**Bare React Native:**
- Full native access
- Custom native modules
- More complex setup
- Manual linking

### 5. Common Patterns

**Safe Area:**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Content */}
    </SafeAreaView>
  );
}
```

**Platform-Specific Code:**
```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
});
```

**Keyboard Avoiding:**
```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

## Debugging

- **Expo Go**: Scan QR code to test on device
- **React DevTools**: `npx react-devtools`
- **Flipper**: Advanced debugging tool
- **Console**: `console.log()` shows in terminal

## Performance Tips

1. Use `FlatList` for long lists (not `ScrollView`)
2. Memoize components with `React.memo`
3. Use `useCallback` for event handlers
4. Avoid inline styles in render
5. Use `Image` caching strategies
