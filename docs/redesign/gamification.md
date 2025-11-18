# 🎮 Gamification Mechanics

**Version:** 1.0.0
**Status:** Phase 1 (Streaks only)

---

## Overview

The Job Hunt AI gamification system uses **3 core mechanics**:

1. **🔥 Daily Streaks** - Maintain momentum (Phase 1 - Implemented)
2. **⚡ XP & Levels** - Track progress (Phase 2 - Partially implemented)
3. **🏆 Achievements** - Unlock milestones (Phase 3 - Future)

---

## 🔥 Daily Streaks (Phase 1)

### What is a Streak?

A streak is the **number of consecutive days** you've applied to at least one job.

**Example:**
- Day 1: Applied to 2 jobs → Streak: 1 🔥
- Day 2: Applied to 3 jobs → Streak: 2 🔥🔥
- Day 3: No applications → Streak: 0 (reset)
- Day 4: Applied to 1 job → Streak: 1 🔥

### Rules

✅ **Streak increases** when:
- You apply to at least 1 job today
- It's a new calendar day (midnight in your timezone)
- Previous day had at least 1 application

❌ **Streak resets** when:
- You skip a full day (no applications for 24+ hours)
- Manual reset (future feature)

⚠️ **Grace Period** (Future):
- 1 "free pass" per week to skip a day without losing streak
- Not implemented in Phase 1

### Calculation Logic

```typescript
// lib/gamification.ts

/**
 * Calculate the current streak for a user
 *
 * @param applications - Array of Application objects (from Prisma)
 * @returns Current streak count (number of consecutive days)
 */
export function calculateStreak(applications: Application[]): number {
  // TODO: Implement this function
  //
  // Hint:
  // 1. Sort applications by `appliedAt` descending (newest first)
  // 2. Check if there's an application today
  //    - If no: return 0
  //    - If yes: continue
  // 3. Loop backwards through days:
  //    - For each day, check if there's at least 1 application
  //    - If yes: increment streak
  //    - If no: break loop
  // 4. Return streak count
  //
  // Edge cases:
  // - Empty applications array → return 0
  // - Applications on same day count as 1 day
  // - Use startOfDay() to normalize dates (from date-fns)

  return 0 // Replace with your implementation
}
```

### UI Display

**Navbar:**
```tsx
<div className="streak-badge">
  <Flame className="text-amber-500" />
  <span>{streak} days</span>
</div>
```

**Home Page (Profile):**
```tsx
<Card>
  <h3>Your Streak 🔥</h3>
  <div className="text-4xl font-bold text-amber-500">
    {streak} Days
  </div>
  <p>Keep applying to maintain your momentum!</p>
</Card>
```

**Streak Milestones:**
| Streak | Badge | Message |
|--------|-------|---------|
| 1-2 days | 🔥 | "Good start!" |
| 3-6 days | 🔥🔥 | "Building momentum!" |
| 7-13 days | 🔥🔥🔥 | "On fire!" |
| 14-29 days | 🔥🔥🔥🔥 | "Unstoppable!" |
| 30+ days | 🔥🔥🔥🔥🔥 | "Legendary!" |

---

## ⚡ XP & Levels (Phase 2)

### Experience Points (XP)

XP is earned by performing actions. More valuable actions = more XP.

**XP Values:**
| Action | XP Awarded | Reason |
|--------|-----------|---------|
| Create profile | 50 XP | One-time setup |
| Analyze a job | 10 XP | Research |
| Generate cover letter | 15 XP | Effort |
| Save application | 25 XP | Commitment |
| Update status to "Applied" | 50 XP | Real action |
| Update status to "Interview" | 100 XP | Progress! |
| Update status to "Offer" | 500 XP | Success! |
| Maintain 7-day streak | 100 XP | Consistency |
| Daily login (bonus) | 5 XP | Engagement |

### Level System

**Formula:**
```typescript
// lib/gamification.ts

/**
 * Calculate the user's level based on total XP
 *
 * Formula: Level = floor(sqrt(XP / 100)) + 1
 *
 * This gives a logarithmic progression:
 * - Level 1: 0 XP
 * - Level 2: 100 XP
 * - Level 3: 400 XP
 * - Level 4: 900 XP
 * - Level 5: 1,600 XP
 *
 * @param totalXP - Total XP earned
 * @returns Current level (1-50)
 */
export function calculateLevel(totalXP: number): number {
  // TODO: Implement this function
  //
  // Hint:
  // - Use Math.floor() and Math.sqrt()
  // - Add 1 so level starts at 1 (not 0)
  // - Cap at level 50 (optional)

  return 1 // Replace with your implementation
}

/**
 * Calculate XP needed for next level
 *
 * @param currentLevel - Current user level
 * @returns XP needed to reach next level
 */
export function xpForNextLevel(currentLevel: number): number {
  // TODO: Implement this function
  //
  // Hint:
  // - Reverse the level formula
  // - nextLevelXP = (currentLevel^2) * 100
  // - Example: Level 2 → 3 needs 400 XP (2^2 * 100)

  return 100 // Replace with your implementation
}
```

**Level Titles:**
| Level | Title |
|-------|-------|
| 1 | Novice Hunter |
| 2-3 | Applicant |
| 4-5 | Job Seeker |
| 6-8 | Career Explorer |
| 9-12 | Opportunity Scout |
| 13-17 | Application Expert |
| 18-24 | Interview Master |
| 25-32 | Offer Magnet |
| 33-42 | Career Champion |
| 43-50 | Legendary Hunter |

### UI Display

**XP Bar:**
```tsx
<div className="xp-bar">
  <div className="flex justify-between mb-2">
    <span>Level {level}</span>
    <span>{currentXP} / {nextLevelXP} XP</span>
  </div>
  <div className="w-full bg-slate-200 rounded-full h-3">
    <div
      className="h-full bg-gradient-to-r from-blue-500 to-purple-500
                 transition-all duration-500"
      style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
    />
  </div>
</div>
```

**Level Badge:**
```tsx
<div className="level-badge">
  <Star className="text-purple-500" />
  <span>Lvl {level}</span>
</div>
```

---

## 🏆 Achievements (Phase 3 - Future)

### Achievement Categories

1. **Application Milestones**
   - First Application (apply to 1 job)
   - Getting Started (apply to 5 jobs)
   - Active Seeker (apply to 25 jobs)
   - Job Hunter (apply to 50 jobs)
   - Career Explorer (apply to 100 jobs)

2. **Streak Achievements**
   - 3-Day Streak
   - Week Warrior (7 days)
   - Two Weeks Strong (14 days)
   - Month Master (30 days)
   - Unstoppable (100 days)

3. **Success Achievements**
   - First Interview
   - Interview Pro (5 interviews)
   - Offer Received
   - Multiple Offers (3+ offers)
   - Dream Job (accept an offer)

4. **Quality Achievements**
   - Perfect Match (analyze a 100% match job)
   - Cover Letter Pro (generate 25 cover letters)
   - Organized (update all app statuses)
   - Fast Responder (apply within 24h of analyzing)

### Achievement Data Structure

```typescript
// lib/gamification.ts

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string // Emoji or Lucide icon name
  xpReward: number
  unlocked: boolean
  unlockedAt?: Date
  progress?: number // For progressive achievements (e.g., 5/25 applications)
  maxProgress?: number
}

// Example:
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-application',
    title: 'First Step',
    description: 'Apply to your first job',
    icon: '🎯',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day application streak',
    icon: '🔥',
    xpReward: 100,
    unlocked: false,
  },
  // ... more achievements
]
```

### Unlock Logic

```typescript
// lib/gamification.ts

/**
 * Check which achievements the user has unlocked
 *
 * @param user - User object with stats
 * @param applications - User's applications
 * @returns Array of newly unlocked achievements
 */
export function checkAchievements(
  user: User,
  applications: Application[]
): Achievement[] {
  // TODO: Implement this function
  //
  // Hint:
  // 1. Loop through all achievements
  // 2. Check if unlock condition is met
  //    - e.g., applications.length >= 5 for "Getting Started"
  // 3. If met and not already unlocked, add to return array
  // 4. Update user.achievements in database

  return [] // Replace with your implementation
}
```

### Achievement Popup

```tsx
// components/gamification/AchievementPopup.tsx

interface AchievementPopupProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  // TODO: Implement this component
  //
  // Requirements:
  // - Animate in from bottom (slide up)
  // - Show achievement icon, title, description
  // - Show XP reward (e.g., "+50 XP")
  // - Auto-dismiss after 3 seconds
  // - Click to dismiss early
  // - Play confetti animation (optional)
  //
  // Bonus:
  // - Use Framer Motion for animations
  // - Add sound effect (optional)

  return (
    <div className="achievement-popup">
      {/* Your implementation here */}
    </div>
  )
}
```

---

## 📊 Stats Dashboard (Future)

### Velocity Metric

**Definition:** Number of applications per week

**Calculation:**
```typescript
export function calculateVelocity(applications: Application[]): number {
  // TODO: Implement this function
  //
  // Hint:
  // 1. Get applications from last 7 days
  // 2. Count them
  // 3. Return count
  //
  // Bonus:
  // - Return average over last 4 weeks
  // - Show trend (increasing/decreasing)

  return 0
}
```

**UI Display:**
```tsx
<Card>
  <h3>Application Velocity</h3>
  <div className="text-4xl font-bold text-blue-500">
    {velocity} apps/week
  </div>
  <TrendingUp className="text-green-500" />
  <p>+20% from last week</p>
</Card>
```

---

## Database Schema Updates

### User Table

```prisma
model User {
  // ... existing fields

  // Gamification fields
  totalXP       Int      @default(0)
  level         Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  achievements  Json     @default("[]") // Array of achievement IDs

  // Timestamps for streak calculation
  lastActionAt  DateTime? // Last time user did anything
  streakUpdatedAt DateTime? // Last time streak was updated
}
```

### Application Table

```prisma
model Application {
  // ... existing fields

  // Track when user actually applied (for streak)
  appliedAt DateTime @default(now()) // When they saved the app
}
```

---

## Testing the System

### Manual Tests

1. **Streak Calculation:**
   ```bash
   # Apply to jobs on consecutive days
   # Check navbar shows correct streak count
   # Skip a day, verify streak resets
   ```

2. **XP & Level:**
   ```bash
   # Perform actions (apply, interview, offer)
   # Check XP increases correctly
   # Verify level increases at right XP thresholds
   ```

3. **Achievements** (Future):
   ```bash
   # Trigger achievement unlock
   # Check popup appears
   # Verify XP bonus applied
   ```

### Unit Tests (Future)

```typescript
// lib/gamification.test.ts

describe('calculateStreak', () => {
  it('returns 0 for no applications', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 for applications today only', () => {
    const apps = [{ appliedAt: new Date() }]
    expect(calculateStreak(apps)).toBe(1)
  })

  it('calculates consecutive days correctly', () => {
    const apps = [
      { appliedAt: new Date('2025-01-03') },
      { appliedAt: new Date('2025-01-02') },
      { appliedAt: new Date('2025-01-01') },
    ]
    expect(calculateStreak(apps)).toBe(3)
  })

  it('stops at first gap', () => {
    const apps = [
      { appliedAt: new Date('2025-01-05') },
      { appliedAt: new Date('2025-01-04') },
      // Gap here (Jan 3 missing)
      { appliedAt: new Date('2025-01-02') },
      { appliedAt: new Date('2025-01-01') },
    ]
    expect(calculateStreak(apps)).toBe(2) // Only counts Jan 4-5
  })
})
```

---

## Resources

- **Gamification Patterns:** [gamifyux.com](https://www.gamifyux.com/)
- **Psychology of Streaks:** [Duolingo's Streak System](https://blog.duolingo.com/streaks/)
- **XP Systems:** [Game Design Patterns](https://www.gamedeveloper.com/design/designing-game-progression)

---

**Next:** Read [Component Library](./components.md) to see reusable UI components.
