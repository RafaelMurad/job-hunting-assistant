# 🛠️ Implementation Plan

**Version:** 1.0.0
**Estimated Time:** 4-6 hours (with TODOs for you to complete)

---

## Overview

This guide walks you through implementing the gamification redesign **step by step**. Each step includes:
- ✅ What's already done
- 📝 TODOs for you to implement
- 🧪 How to test

---

## Phase 1: Setup & Core Components

### Step 1: Install Dependencies

```bash
npm install framer-motion recharts react-confetti date-fns
```

**What you'll use:**
- `framer-motion` - Animations
- `recharts` - Charts for velocity
- `react-confetti` - Celebration effects
- `date-fns` - Date calculations for streaks

✅ **Status:** Ready to run

---

### Step 2: Create Gamification Utilities

**File:** `lib/gamification.ts`

✅ **Provided:** Type definitions, XP values, achievement list

📝 **TODO for you:**

```typescript
// lib/gamification.ts

export function calculateStreak(applications: Application[]): number {
  // TODO: Implement streak calculation
  // Hints in docs/redesign/gamification.md
  return 0
}

export function calculateLevel(totalXP: number): number {
  // TODO: Implement level calculation
  // Formula: Level = floor(sqrt(XP / 100)) + 1
  return 1
}

export function xpForNextLevel(currentLevel: number): number {
  // TODO: Implement XP needed for next level
  // Formula: (currentLevel^2) * 100
  return 100
}

export function calculateVelocity(applications: Application[]): number {
  // TODO: Count applications in last 7 days
  return 0
}
```

🧪 **Test:**
```bash
npm run test # (after writing tests)
```

---

### Step 3: Update Database Schema

**File:** `prisma/schema.prisma`

✅ **Provided:** Added gamification fields to `User` model

```prisma
model User {
  // ... existing fields

  // Gamification
  totalXP       Int      @default(0)
  level         Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  achievements  Json     @default("[]")

  lastActionAt    DateTime?
  streakUpdatedAt DateTime?
}
```

📝 **TODO for you:**

```bash
# Run migration to update database
npx prisma migrate dev --name add-gamification

# Regenerate Prisma client
npx prisma generate
```

🧪 **Test:**
```bash
# Check database has new columns
npx prisma studio
# View User table, should see new fields
```

---

## Phase 2: Core UI Components

### Step 4: Create Streak Counter

**File:** `components/gamification/StreakCounter.tsx`

✅ **Provided:** Basic component structure

📝 **TODO for you:**

```typescript
'use client'

import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

interface StreakCounterProps {
  streak: number
}

export function StreakCounter({ streak }: StreakCounterProps) {
  // TODO: Add animation when streak increases
  //
  // Hints:
  // - Use framer-motion's <motion.div>
  // - Animate scale when streak changes
  // - Add pulse animation for streaks > 3
  //
  // Example:
  // <motion.div
  //   initial={{ scale: 0.8 }}
  //   animate={{ scale: 1 }}
  //   transition={{ type: 'spring', stiffness: 500 }}
  // >

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500
                    text-white font-bold px-4 py-2 rounded-full shadow-md">
      <Flame size={20} />
      <span className="text-lg font-extrabold">{streak} days</span>
    </div>
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Navigate to home page
# Should see streak counter (will be 0 initially)
```

---

### Step 5: Create XP Bar

**File:** `components/gamification/XPBar.tsx`

✅ **Provided:** Basic progress bar

📝 **TODO for you:**

```typescript
'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface XPBarProps {
  currentXP: number
  nextLevelXP: number
  level: number
}

export function XPBar({ currentXP, nextLevelXP, level }: XPBarProps) {
  const progress = (currentXP / nextLevelXP) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Star className="text-purple-500" size={20} />
          <span className="font-semibold text-slate-900">Level {level}</span>
        </div>
        <span className="text-sm text-slate-600">
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        {/* TODO: Animate the progress bar filling

            Hints:
            - Use motion.div for the inner bar
            - Animate width from 0 to {progress}%
            - Duration: 500ms
            - Easing: ease-out

            Example:
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
        */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Should see XP bar on profile page
# Width should match XP percentage
```

---

### Step 6: Create Level Badge

**File:** `components/gamification/LevelBadge.tsx`

✅ **Provided:** Complete implementation (no TODOs)

```typescript
import { Star } from 'lucide-react'

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1
                    bg-purple-500 text-white font-bold
                    px-3 py-1 rounded-full text-sm
                    border-2 border-purple-600">
      <Star size={14} />
      <span>Lvl {level}</span>
    </div>
  )
}
```

---

## Phase 3: Update Main Pages

### Step 7: Update Navigation

**File:** `app/layout.tsx`

✅ **Provided:** Updated nav structure

📝 **TODO for you:**

```typescript
// In app/layout.tsx, update the navigation:

import { StreakCounter } from '@/components/gamification/StreakCounter'
import { LevelBadge } from '@/components/gamification/LevelBadge'

// Inside the layout function:
export default async function RootLayout({ children }) {
  // TODO: Fetch user data to get streak and level
  //
  // Hints:
  // - Fetch from /api/user
  // - Calculate streak using calculateStreak()
  // - Display in navbar
  //
  // Example:
  // const user = await prisma.user.findFirst()
  // const applications = await prisma.application.findMany({
  //   where: { userId: user.id }
  // })
  // const streak = calculateStreak(applications)

  return (
    <html>
      <body>
        <nav className="border-b">
          <div className="container flex items-center justify-between py-4">
            <h1>Job Hunt AI</h1>

            {/* TODO: Add streak and level here */}
            <div className="flex items-center gap-4">
              {/* <StreakCounter streak={streak} /> */}
              {/* <LevelBadge level={level} /> */}
            </div>

            <div className="flex gap-4">
              <Link href="/">Profile</Link>
              <Link href="/analyze">Analyze</Link>
              <Link href="/tracker">Tracker</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Check navbar shows streak and level
```

---

### Step 8: Update Home Page (Profile)

**File:** `app/page.tsx`

✅ **Provided:** Existing profile form

📝 **TODO for you:**

```typescript
// Add gamification stats to the profile page

import { StreakCounter } from '@/components/gamification/StreakCounter'
import { XPBar } from '@/components/gamification/XPBar'

export default function HomePage() {
  // ... existing code

  // TODO: Add a "Stats" card above the profile form
  //
  // Include:
  // - Streak counter (large)
  // - XP bar
  // - Total applications count
  // - Velocity (apps/week)
  //
  // Example:
  // <Card className="mb-6">
  //   <h2>Your Progress</h2>
  //   <div className="grid grid-cols-2 gap-4">
  //     <div>
  //       <StreakCounter streak={currentStreak} />
  //     </div>
  //     <div>
  //       <XPBar currentXP={totalXP} nextLevelXP={xpNeeded} level={level} />
  //     </div>
  //   </div>
  // </Card>

  return (
    <div className="container py-8">
      {/* TODO: Add stats card here */}

      {/* Existing profile form */}
      <Card>
        <h2>Your Profile</h2>
        {/* ... */}
      </Card>
    </div>
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Visit home page
# Should see stats card with streak, XP, level
```

---

### Step 9: Update Analyze Page

**File:** `app/analyze/page.tsx`

✅ **Provided:** Job analysis logic

📝 **TODO for you:**

```typescript
// Add XP reward notification after analyzing a job

import confetti from 'canvas-confetti'

export default function AnalyzePage() {
  // ... existing analysis logic

  const handleAnalyze = async () => {
    // ... existing analysis code

    // TODO: After successful analysis, award XP
    //
    // Steps:
    // 1. Update user.totalXP in database (+10 XP for analysis)
    // 2. Check if user leveled up
    // 3. If leveled up, trigger confetti
    // 4. Show "+10 XP" toast notification
    //
    // Example:
    // await fetch('/api/user/xp', {
    //   method: 'POST',
    //   body: JSON.stringify({ xpGain: 10, action: 'analyze' })
    // })
    //
    // if (leveledUp) {
    //   confetti({
    //     particleCount: 100,
    //     spread: 70,
    //     origin: { y: 0.6 }
    //   })
    // }
  }

  return (
    // ... existing UI
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Analyze a job
# Should see "+10 XP" notification
# If you level up, confetti should fire
```

---

### Step 10: Update Tracker Page

**File:** `app/tracker/page.tsx`

✅ **Provided:** Application list

📝 **TODO for you:**

```typescript
// Add velocity chart and gamification stats

import { Line } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { calculateVelocity } from '@/lib/gamification'

export default function TrackerPage() {
  // ... existing code

  // TODO: Calculate velocity (applications per week)
  //
  // const velocity = calculateVelocity(applications)

  // TODO: Create chart data for last 4 weeks
  //
  // const chartData = [
  //   { week: 'Week 1', apps: 3 },
  //   { week: 'Week 2', apps: 5 },
  //   { week: 'Week 3', apps: 7 },
  //   { week: 'Week 4', apps: 9 },
  // ]

  return (
    <div className="container py-8">
      {/* TODO: Add velocity card */}
      {/* <Card>
        <h3>Application Velocity</h3>
        <div className="text-4xl font-bold text-blue-500">
          {velocity} apps/week
        </div>
        <TrendingUp className="text-green-500" />
      </Card> */}

      {/* Existing stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* ... */}
      </div>

      {/* TODO: Add line chart */}
      {/* <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="apps" stroke="#3B82F6" />
        </LineChart>
      </ResponsiveContainer> */}

      {/* Existing application list */}
      {/* ... */}
    </div>
  )
}
```

🧪 **Test:**
```bash
npm run dev
# Visit tracker page
# Should see velocity stat
# Should see trend chart (after implementing)
```

---

## Phase 4: API Routes

### Step 11: Create XP Endpoint

**File:** `app/api/user/xp/route.ts`

📝 **TODO for you:**

```typescript
// Create API endpoint to award XP

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateLevel, xpForNextLevel } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  // TODO: Implement XP award logic
  //
  // Steps:
  // 1. Get userId and xpGain from request body
  // 2. Fetch user from database
  // 3. Calculate new totalXP (user.totalXP + xpGain)
  // 4. Calculate new level
  // 5. Check if level increased (leveledUp = true/false)
  // 6. Update user in database
  // 7. Return { totalXP, level, leveledUp }
  //
  // Example:
  // const { userId, xpGain } = await request.json()
  // const user = await prisma.user.findUnique({ where: { id: userId } })
  // const newTotalXP = user.totalXP + xpGain
  // const newLevel = calculateLevel(newTotalXP)
  // const leveledUp = newLevel > user.level
  //
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { totalXP: newTotalXP, level: newLevel }
  // })
  //
  // return NextResponse.json({ totalXP: newTotalXP, level: newLevel, leveledUp })

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
```

🧪 **Test:**
```bash
curl -X POST http://localhost:3000/api/user/xp \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "xpGain": 50}'

# Should return: { totalXP: 50, level: 1, leveledUp: false }
```

---

### Step 12: Update Application API

**File:** `app/api/applications/route.ts`

📝 **TODO for you:**

```typescript
// Award XP when user saves an application

export async function POST(request: NextRequest) {
  // ... existing code to save application

  // TODO: After saving application, award XP
  //
  // - Award 25 XP for saving application
  // - Award 50 XP if status is "applied"
  //
  // Example:
  // await fetch('/api/user/xp', {
  //   method: 'POST',
  //   body: JSON.stringify({ userId, xpGain: 25 })
  // })

  return NextResponse.json(newApplication)
}
```

---

## Phase 5: Polish & Testing

### Step 13: Add Animations

📝 **TODO for you:**

```typescript
// Add micro-interactions throughout the app

// 1. Fade in stat cards on tracker page
// 2. Scale animation when clicking "Save Application"
// 3. Slide in notifications
// 4. Pulse effect on streak counter when > 7 days
//
// Use Framer Motion's variants for consistent animations:
//
// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 }
// }
//
// <motion.div variants={fadeIn} initial="hidden" animate="visible">
```

---

### Step 14: Add Celebration Effects

📝 **TODO for you:**

```typescript
// Trigger confetti when:
// 1. User levels up
// 2. Streak reaches 7, 14, 30 days
// 3. User gets an offer (status = "offer")
//
// Example:
// import confetti from 'canvas-confetti'
//
// function celebrateLevel

Up() {
//   confetti({
//     particleCount: 100,
//     spread: 70,
//     origin: { y: 0.6 }
//   })
// }
```

---

### Step 15: Test Complete Flow

🧪 **Manual Test Checklist:**

```bash
✅ Install dependencies
✅ Run migration
✅ Start app (npm run dev)

# Test Streak:
- [ ] Apply to 1 job → Streak = 1
- [ ] Wait 24h, apply again → Streak = 2
- [ ] Skip a day → Streak = 0

# Test XP & Levels:
- [ ] Analyze job → +10 XP
- [ ] Save application → +25 XP
- [ ] Update to "applied" → +50 XP
- [ ] Reach 100 XP → Level up to 2

# Test UI:
- [ ] Streak shows in navbar
- [ ] Level badge shows in navbar
- [ ] XP bar fills correctly
- [ ] Stats cards display on home page
- [ ] Tracker shows velocity

# Test Animations:
- [ ] Confetti on level up
- [ ] XP bar animates
- [ ] Streak counter pulses (if > 7)
```

---

## Phase 6: Documentation

### Step 16: Write Unit Tests

📝 **TODO for you:**

Create `lib/gamification.test.ts`:

```typescript
import { calculateStreak, calculateLevel, xpForNextLevel } from './gamification'

describe('Gamification Functions', () => {
  describe('calculateStreak', () => {
    it('returns 0 for empty applications', () => {
      // TODO: Write test
    })

    it('calculates consecutive days', () => {
      // TODO: Write test
    })
  })

  describe('calculateLevel', () => {
    it('returns level 1 for 0 XP', () => {
      // TODO: Write test
    })

    it('returns level 2 for 100 XP', () => {
      // TODO: Write test
    })
  })
})
```

---

### Step 17: Update README

📝 **TODO for you:**

Add gamification section to main README:

```markdown
## 🎮 Gamification Features

- **Daily Streaks** - Maintain your application momentum
- **XP & Levels** - Track your progress from Novice to Legend
- **Achievements** - Unlock badges for milestones (coming soon)

See [docs/redesign/](./docs/redesign/) for complete documentation.
```

---

## Complete!

✅ **You should now have:**
- Working streak system
- XP and level system
- Updated UI with gamification components
- API endpoints for XP
- Animations and celebrations

---

## Next Steps

**Phase 2 Features** (Future):
- Achievement system
- Velocity charts
- Daily goals
- Leaderboard (optional)

**Phase 3 Polish** (Future):
- Dark mode
- Sound effects
- Mobile optimizations
- Performance improvements

---

## Troubleshooting

### Common Issues:

**Streak always shows 0:**
- Check `calculateStreak()` implementation
- Verify applications have `appliedAt` timestamps
- Ensure dates are being compared correctly (use `startOfDay()`)

**XP not updating:**
- Check `/api/user/xp` endpoint is implemented
- Verify database has `totalXP` column
- Check Prisma client is regenerated (`npx prisma generate`)

**Confetti not showing:**
- Ensure `canvas-confetti` is installed
- Check `leveledUp` flag is being set correctly
- Verify confetti is triggered client-side (in `'use client'` component)

**Animations not working:**
- Ensure `framer-motion` is installed
- Check component has `'use client'` directive
- Verify CSS classes are correct

---

## Resources

- **Framer Motion Docs:** [framer.com/motion](https://www.framer.com/motion/)
- **Recharts Examples:** [recharts.org/examples](https://recharts.org/en-US/examples)
- **Confetti Docs:** [github.com/catdad/canvas-confetti](https://github.com/catdad/canvas-confetti)

---

**Happy building! 🚀**

If you get stuck, refer back to the design docs or reach out for help.
