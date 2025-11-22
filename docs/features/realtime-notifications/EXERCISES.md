# Exercises: Real-Time Notifications

Work through these exercises to understand SSE and event-driven architecture.

## Exercise 1: Implement SSE Connection

**File:** `lib/features/realtime-notifications/hooks/useNotifications.tsx`

**Goal:** Complete the `connect` function to establish an SSE connection.

**Steps:**

1. Create an `EventSource` instance:
   ```typescript
   const es = new EventSource(endpoint);
   ```

2. Handle the `open` event:
   ```typescript
   es.onopen = () => {
     setIsConnected(true);
   };
   ```

3. Handle incoming messages:
   ```typescript
   es.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.type === 'notification') {
       const notification = {
         ...data.data,
         timestamp: new Date(data.data.timestamp),
       };
       setNotifications(prev => [notification, ...prev]);
     }
   };
   ```

4. Handle errors and reconnection:
   ```typescript
   es.onerror = () => {
     setIsConnected(false);
     es.close();
     reconnectTimeoutRef.current = setTimeout(connect, 5000);
   };
   ```

5. Store the reference:
   ```typescript
   eventSourceRef.current = es;
   ```

**Test:** Enable the feature flag, open the app, and check browser DevTools Network tab for the SSE connection.

---

## Exercise 2: Type-Based Notification Styling

**File:** `lib/features/realtime-notifications/components/NotificationBell.tsx`

**Goal:** Add visual indicators based on notification type.

**Steps:**

1. Create a helper function:
   ```typescript
   function getTypeStyles(type: NotificationType) {
     const styles = {
       application_update: {
         bg: 'bg-fjord-100',
         dot: 'bg-fjord-500',
         icon: '📋',
       },
       interview_reminder: {
         bg: 'bg-amber-100',
         dot: 'bg-amber-500',
         icon: '📅',
       },
       new_match: {
         bg: 'bg-forest-100',
         dot: 'bg-forest-500',
         icon: '✨',
       },
       achievement: {
         bg: 'bg-purple-100',
         dot: 'bg-purple-500',
         icon: '🏆',
       },
       system: {
         bg: 'bg-nordic-neutral-100',
         dot: 'bg-nordic-neutral-500',
         icon: 'ℹ️',
       },
     };
     return styles[type] || styles.system;
   }
   ```

2. Use the styles in `NotificationItem`:
   ```tsx
   const styles = getTypeStyles(type);

   return (
     <li className={`... ${!read ? styles.bg : 'bg-white'}`}>
       <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
       {/* or use styles.icon */}
     </li>
   );
   ```

---

## Exercise 3: Toast Animation States

**File:** `lib/features/realtime-notifications/components/NotificationToast.tsx`

**Goal:** The animation is already implemented. Study it and then:

1. Change the animation from slide-in to fade-in
2. Add a progress bar that shows time until auto-dismiss

**Hints:**

```tsx
// Progress bar state
const [progress, setProgress] = useState(100);

useEffect(() => {
  const interval = setInterval(() => {
    setProgress(p => Math.max(0, p - (100 / (duration / 100))));
  }, 100);
  return () => clearInterval(interval);
}, [duration]);

// In JSX
<div
  className="h-1 bg-fjord-500 transition-all"
  style={{ width: `${progress}%` }}
/>
```

---

## Exercise 4: Enhance SSE Endpoint

**File:** `app/api/notifications/stream/route.ts`

**Goal:** Add more realistic notification scenarios.

**Ideas:**

1. Send a random notification every 10 seconds
2. Implement `Last-Event-ID` for reconnection
3. Add user-specific notifications (pass userId in query)

**Sample random notifications:**

```typescript
const sampleNotifications = [
  {
    type: 'application_update',
    title: 'Application Update',
    message: 'Your application to Google was viewed',
  },
  {
    type: 'interview_reminder',
    title: 'Interview Tomorrow',
    message: 'Don\'t forget your interview at 2pm',
  },
  {
    type: 'new_match',
    title: 'New Job Match',
    message: '3 new jobs match your profile',
  },
];
```

---

## Bonus Challenges

### Challenge A: Persistent Notifications

Store notifications in localStorage so they persist across page reloads.

### Challenge B: Push to Desktop

Use the Notification API to show desktop notifications:
```typescript
if (Notification.permission === 'granted') {
  new Notification(title, { body: message });
}
```

### Challenge C: Sound Effects

Play a sound when a notification arrives:
```typescript
const audio = new Audio('/notification.mp3');
audio.play();
```

---

## Solutions

Reference implementations are in `exercises/solutions/`.

Look at them only after attempting the exercises yourself!
