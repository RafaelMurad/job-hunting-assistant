# 📦 Component Library

**Version:** 1.0.0
**Status:** Partial (Phase 1)

---

## Overview

This document lists all reusable gamification components, their props, and usage examples.

---

## 🔥 StreakCounter

Displays the user's current application streak with a flame icon and motivational message.

### Props

```typescript
interface StreakCounterProps {
  streak: number          // Current streak count
  showMessage?: boolean   // Show motivational message (default: false)
}
```

### Usage

**Basic:**
```tsx
import { StreakCounter } from '@/components/gamification/StreakCounter'

<StreakCounter streak={5} />
```

**With message:**
```tsx
<StreakCounter streak={7} showMessage={true} />
```

### Variants

**In Navbar** (compact):
```tsx
<nav>
  <StreakCounter streak={currentStreak} />
</nav>
```

**In Stats Card** (with message):
```tsx
<Card>
  <h3>Your Streak</h3>
  <StreakCounter streak={currentStreak} showMessage={true} />
  <p>Keep applying to maintain your momentum!</p>
</Card>
```

### Behavior

- **0 days:** Gray color, "Start your streak today!"
- **1-2 days:** Amber, "Good start!"
- **3-6 days:** Amber, "Building momentum!"
- **7-13 days:** Orange + pulse animation, "You're on fire! 🔥"
- **14-29 days:** Red + pulse, "Unstoppable!"
- **30+ days:** Dark red + pulse, "Legendary! 🔥🔥🔥"

### Accessibility

- **ARIA label:** Automatically added for screen readers
- **Color contrast:** Meets WCAG AA standards
- **Keyboard accessible:** N/A (display only)

---

## ⚡ XPBar

Progress bar showing XP progress toward the next level.

### Props

```typescript
interface XPBarProps {
  currentXP: number       // Current XP in this level (0 to nextLevelXP)
  nextLevelXP: number     // XP required for next level
  level: number           // Current level
  totalXP?: number        // Total XP earned (optional, shows below bar)
  compact?: boolean       // Compact mode for navbar (default: false)
}
```

### Usage

**Standard (full):**
```tsx
import { XPBar } from '@/components/gamification/XPBar'

<XPBar
  currentXP={450}
  nextLevelXP={900}
  level={3}
  totalXP={1350}
/>
```

**Compact (navbar):**
```tsx
<XPBar
  currentXP={450}
  nextLevelXP={900}
  level={3}
  compact={true}
/>
```

### Variants

**Home Page (full details):**
```tsx
<Card>
  <h3>Your Progress</h3>
  <XPBar
    currentXP={user.totalXP % xpForNextLevel(user.level)}
    nextLevelXP={xpForNextLevel(user.level)}
    level={user.level}
    totalXP={user.totalXP}
  />
</Card>
```

**Navbar (minimal):**
```tsx
<nav>
  <XPBar
    currentXP={currentLevelXP}
    nextLevelXP={nextLevelXP}
    level={level}
    compact={true}
  />
</nav>
```

### Behavior

- **Progress bar:** Fills from left to right (0-100%)
- **Animation:** Smooth transition when XP increases (500ms ease-out)
- **Percentage:** Shows inside bar when > 20%
- **Glow effect:** Subtle shadow matching gradient colors
- **Level title:** Shows based on current level (e.g., "Career Explorer")

### TODO (For You)

- [ ] Animate progress bar with Framer Motion
- [ ] Add glow effect when near level-up (> 90%)
- [ ] Animate XP number counting up
- [ ] Add particle effects on XP gain

---

## 🌟 LevelBadge

Simple badge displaying current level.

### Props

```typescript
interface LevelBadgeProps {
  level: number           // Current level
  size?: 'sm' | 'md' | 'lg'  // Badge size (default: 'md')
}
```

### Usage

**Basic:**
```tsx
import { LevelBadge } from '@/components/gamification/LevelBadge'

<LevelBadge level={5} />
```

**Sizes:**
```tsx
<LevelBadge level={3} size="sm" />  // Small (navbar)
<LevelBadge level={5} size="md" />  // Medium (default)
<LevelBadge level={8} size="lg" />  // Large (profile header)
```

### Variants

**In Navbar:**
```tsx
<nav>
  <LevelBadge level={user.level} size="sm" />
</nav>
```

**In Profile Header:**
```tsx
<div className="flex items-center gap-3">
  <Avatar />
  <div>
    <h2>{user.name}</h2>
    <LevelBadge level={user.level} size="lg" />
  </div>
</div>
```

### Behavior

- **Star icon:** Filled with white color
- **Background:** Purple gradient (purple-500 → purple-600)
- **Border:** 2px purple-600
- **Hover:** Shadow increases
- **Animation:** None (static badge)

---

## 🏆 AchievementPopup (Future - Phase 3)

Animated popup that appears when user unlocks an achievement.

### Props

```typescript
interface AchievementPopupProps {
  achievement: Achievement  // Achievement object
  onClose: () => void       // Close callback
  autoClose?: boolean       // Auto-dismiss after 3s (default: true)
}
```

### Usage

```tsx
import { AchievementPopup } from '@/components/gamification/AchievementPopup'

const [showAchievement, setShowAchievement] = useState(false)
const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)

// When achievement unlocks:
setUnlockedAchievement(achievement)
setShowAchievement(true)

// In render:
{showAchievement && unlockedAchievement && (
  <AchievementPopup
    achievement={unlockedAchievement}
    onClose={() => setShowAchievement(false)}
  />
)}
```

### Behavior

- **Animation:** Slides up from bottom
- **Auto-dismiss:** After 3 seconds
- **Click to dismiss:** Click anywhere to close early
- **Confetti:** Triggers celebration effect
- **Sound:** (Optional) Achievement unlock sound

### TODO (For You)

- [ ] Implement AchievementPopup component
- [ ] Add slide-up animation (Framer Motion)
- [ ] Add confetti effect
- [ ] Add sound effect (optional)
- [ ] Handle multiple achievements (queue them)

---

## 📊 VelocityChart (Future - Phase 2)

Line chart showing application velocity over time.

### Props

```typescript
interface VelocityChartProps {
  applications: Application[]  // User's applications
  weeks?: number                // Number of weeks to show (default: 4)
}
```

### Usage

```tsx
import { VelocityChart } from '@/components/gamification/VelocityChart'

<Card>
  <h3>Application Velocity</h3>
  <VelocityChart applications={applications} weeks={4} />
</Card>
```

### Behavior

- **Chart type:** Line chart (Recharts)
- **X-axis:** Weeks (e.g., "Week 1", "Week 2")
- **Y-axis:** Number of applications
- **Trend:** Shows if increasing/decreasing

### TODO (For You)

- [ ] Implement VelocityChart component
- [ ] Use Recharts library
- [ ] Calculate weekly application counts
- [ ] Add trend indicator (up/down arrow)
- [ ] Color code based on trend

---

## 🎯 StatCard

Reusable card for displaying gamification stats.

### Props

```typescript
interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'blue' | 'purple' | 'amber' | 'green'
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}
```

### Usage

```tsx
import { StatCard } from '@/components/gamification/StatCard'
import { TrendingUp } from 'lucide-react'

<StatCard
  title="Application Velocity"
  value="12 apps/week"
  icon={TrendingUp}
  color="blue"
  trend="up"
  subtitle="+20% from last week"
/>
```

### Variants

```tsx
// Total XP
<StatCard
  title="Total XP"
  value={totalXP}
  icon={Zap}
  color="amber"
/>

// Current Streak
<StatCard
  title="Current Streak"
  value={`${streak} days`}
  icon={Flame}
  color="amber"
  trend={streak > longestStreak ? 'up' : 'neutral'}
/>

// Level
<StatCard
  title="Level"
  value={level}
  icon={Star}
  color="purple"
  subtitle={getLevelTitle(level)}
/>
```

### TODO (For You)

- [ ] Implement StatCard component
- [ ] Add gradient backgrounds per color
- [ ] Add trend arrows (up/down)
- [ ] Add hover animations

---

## Component Composition Examples

### Dashboard Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    title="Current Streak"
    value={`${streak} days`}
    icon={Flame}
    color="amber"
  />

  <StatCard
    title="Level"
    value={level}
    icon={Star}
    color="purple"
    subtitle={getLevelTitle(level)}
  />

  <StatCard
    title="Total XP"
    value={totalXP}
    icon={Zap}
    color="amber"
  />

  <StatCard
    title="Velocity"
    value={`${velocity} apps/week`}
    icon={TrendingUp}
    color="blue"
    trend="up"
  />
</div>
```

### Profile Header

```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 rounded-xl">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">{user.name}</h1>
      <p className="text-blue-100">{user.email}</p>
    </div>

    <div className="flex items-center gap-4">
      <StreakCounter streak={streak} />
      <LevelBadge level={level} size="lg" />
    </div>
  </div>

  <div className="mt-6">
    <XPBar
      currentXP={currentLevelXP}
      nextLevelXP={nextLevelXP}
      level={level}
      totalXP={totalXP}
    />
  </div>
</div>
```

### Navbar

```tsx
<nav className="border-b">
  <div className="container flex items-center justify-between py-4">
    <h1>Job Hunt AI</h1>

    <div className="flex items-center gap-4">
      <StreakCounter streak={streak} />
      <LevelBadge level={level} size="sm" />
    </div>

    <div className="flex gap-4">
      <Link href="/">Profile</Link>
      <Link href="/analyze">Analyze</Link>
      <Link href="/tracker">Tracker</Link>
    </div>
  </div>
</nav>
```

---

## Component Status

| Component | Status | Phase | TODOs |
|-----------|--------|-------|-------|
| StreakCounter | ✅ Implemented | 1 | Animation improvements |
| XPBar | ✅ Implemented | 1 | Framer Motion animation |
| LevelBadge | ✅ Complete | 1 | None |
| AchievementPopup | ⏳ TODO | 3 | Full implementation |
| VelocityChart | ⏳ TODO | 2 | Full implementation |
| StatCard | ⏳ TODO | 2 | Full implementation |

---

## Testing Components

### Manual Testing

**StreakCounter:**
```bash
# Test different streak values
<StreakCounter streak={0} />  # "Start your streak"
<StreakCounter streak={1} />  # "Good start"
<StreakCounter streak={7} />  # Pulse animation
<StreakCounter streak={30} /> # "Legendary"
```

**XPBar:**
```bash
# Test different progress levels
<XPBar currentXP={0} nextLevelXP={100} level={1} />    # 0%
<XPBar currentXP={50} nextLevelXP={100} level={1} />   # 50%
<XPBar currentXP={95} nextLevelXP={100} level={1} />   # 95% (near level-up)
<XPBar currentXP={100} nextLevelXP={100} level={1} />  # 100% (ready to level up)
```

### Unit Tests (Future)

```typescript
// components/gamification/StreakCounter.test.tsx

describe('StreakCounter', () => {
  it('renders streak count', () => {
    render(<StreakCounter streak={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows correct message for streak < 3', () => {
    render(<StreakCounter streak={2} showMessage={true} />)
    expect(screen.getByText(/good start/i)).toBeInTheDocument()
  })

  it('applies pulse animation for streak >= 7', () => {
    const { container } = render(<StreakCounter streak={7} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
```

---

## Resources

- **Framer Motion Docs:** [framer.com/motion/component](https://www.framer.com/motion/component/)
- **Lucide Icons:** [lucide.dev](https://lucide.dev/)
- **Recharts Examples:** [recharts.org/en-US/examples](https://recharts.org/en-US/examples)
- **Component Patterns:** [patterns.dev](https://www.patterns.dev/)

---

**Next:** Read [Implementation Plan](./implementation.md) to build these components.
