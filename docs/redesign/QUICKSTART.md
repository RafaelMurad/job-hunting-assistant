# 🚀 Quick Start Guide

**For:** Continuing development on the gamification redesign
**Branch:** `feature/gamification-redesign`

---

## 📦 Step 1: Install Dependencies

```bash
# Install new gamification dependencies
npm install framer-motion recharts canvas-confetti

# Verify installation
npm list framer-motion recharts canvas-confetti
```

---

## 🗄️ Step 2: Run Database Migration

```bash
# Create migration for new gamification fields
npx prisma migrate dev --name add-gamification

# This adds to User model:
# - totalXP, level, currentStreak, longestStreak, achievements
# - lastActionAt, streakUpdatedAt

# Regenerate Prisma client
npx prisma generate

# Verify in Prisma Studio
npx prisma studio
# Check User table has new columns
```

---

## 🧑‍💻 Step 3: Implement Core Functions

**File:** `lib/gamification.ts`

### 3a. Implement `calculateStreak()`

```typescript
export function calculateStreak(applications: Application[]): number {
  if (applications.length === 0) return 0

  // 1. Sort by appliedAt descending
  const sorted = [...applications].sort((a, b) =>
    b.appliedAt.getTime() - a.appliedAt.getTime()
  )

  // 2. Normalize dates to start of day
  const today = startOfDay(new Date())
  const appDates = sorted.map(app => startOfDay(app.appliedAt))

  // 3. Check if there's an application today
  const hasToday = appDates.some(date => date.getTime() === today.getTime())
  if (!hasToday) return 0

  // 4. Count consecutive days backwards from today
  let streak = 0
  let currentDate = today

  while (true) {
    const hasAppOnDate = appDates.some(
      date => date.getTime() === currentDate.getTime()
    )

    if (!hasAppOnDate) break

    streak++
    currentDate = startOfDay(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))
  }

  return streak
}
```

**Test it:**
```bash
# In Node.js REPL or test file
const apps = [
  { appliedAt: new Date('2025-01-03') },
  { appliedAt: new Date('2025-01-02') },
  { appliedAt: new Date('2025-01-01') },
]
calculateStreak(apps) // Should return 3 (if today is Jan 3)
```

### 3b. Implement `calculateLevel()`

```typescript
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}
```

**Test it:**
```typescript
calculateLevel(0)    // Returns 1
calculateLevel(100)  // Returns 2
calculateLevel(450)  // Returns 3
calculateLevel(900)  // Returns 4
```

### 3c. Implement `xpForNextLevel()`

```typescript
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100
}
```

**Test it:**
```typescript
xpForNextLevel(1)  // Returns 100
xpForNextLevel(2)  // Returns 400
xpForNextLevel(3)  // Returns 900
```

### 3d. Implement `calculateVelocity()`

```typescript
export function calculateVelocity(applications: Application[]): number {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return applications.filter(app =>
    app.appliedAt >= weekAgo
  ).length
}
```

**Test it:**
```typescript
// Apps from last week
const recentApps = [
  { appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
]
calculateVelocity(recentApps) // Returns 3
```

---

## 🎨 Step 4: Update UI Components

### 4a. Update Home Page

**File:** `app/page.tsx`

Add stats card above profile form:

```typescript
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { XPBar } from '@/components/gamification/XPBar'
import { calculateStreak, calculateLevel, xpForNextLevel } from '@/lib/gamification'

export default async function HomePage() {
  const user = await prisma.user.findFirst()
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: 'desc' }
  })

  const streak = calculateStreak(applications)
  const level = user.level
  const totalXP = user.totalXP
  const nextLevelXP = xpForNextLevel(level)
  const currentLevelXP = totalXP - (level - 1) * (level - 1) * 100

  return (
    <div className="container py-8">
      {/* Stats Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <StreakCounter streak={streak} showMessage={true} />
            </div>
            <div>
              <XPBar
                currentXP={currentLevelXP}
                nextLevelXP={nextLevelXP}
                level={level}
                totalXP={totalXP}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing profile form */}
      {/* ... */}
    </div>
  )
}
```

### 4b. Update Navbar

**File:** `app/layout.tsx`

Add streak and level to navigation:

```typescript
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { LevelBadge } from '@/components/gamification/LevelBadge'

export default async function RootLayout({ children }) {
  const user = await prisma.user.findFirst()
  const applications = await prisma.application.findMany({
    where: { userId: user.id }
  })
  const streak = calculateStreak(applications)

  return (
    <html>
      <body>
        <nav className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-xl font-bold">Job Hunt AI</h1>

              {/* Gamification Stats */}
              <div className="flex items-center gap-4">
                <StreakCounter streak={streak} />
                <LevelBadge level={user.level} size="sm" />
              </div>

              {/* Navigation Links */}
              <div className="flex gap-4">
                <Link href="/">Profile</Link>
                <Link href="/analyze">Analyze</Link>
                <Link href="/tracker">Tracker</Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

---

## ⚡ Step 5: Create XP Endpoint

**File:** `app/api/user/xp/route.ts` (create this file)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateLevel, xpForNextLevel } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  const { userId, xpGain } = await request.json()

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const newTotalXP = user.totalXP + xpGain
  const newLevel = calculateLevel(newTotalXP)
  const leveledUp = newLevel > user.level

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXP: newTotalXP,
      level: newLevel,
    }
  })

  return NextResponse.json({
    totalXP: newTotalXP,
    level: newLevel,
    leveledUp,
    xpGained: xpGain
  })
}
```

---

## 🎯 Step 6: Award XP on Actions

### 6a. On Job Analysis

**File:** `app/analyze/page.tsx`

```typescript
const handleAnalyze = async () => {
  // ... existing analysis code

  // Award XP
  await fetch('/api/user/xp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      xpGain: 10 // XP for analyzing job
    })
  })
}
```

### 6b. On Save Application

**File:** `app/api/applications/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { userId, ...data } = await request.json()

  // Save application
  const application = await prisma.application.create({
    data: {
      userId,
      ...data
    }
  })

  // Award XP
  await fetch('http://localhost:3000/api/user/xp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      xpGain: 25 // XP for saving application
    })
  })

  return NextResponse.json(application)
}
```

---

## 🎊 Step 7: Add Celebration Effects

Install confetti:

```bash
npm install canvas-confetti
```

Use on level-up:

```typescript
'use client'

import confetti from 'canvas-confetti'

const handleAnalyze = async () => {
  // ... analysis code

  const response = await fetch('/api/user/xp', {
    method: 'POST',
    body: JSON.stringify({ userId, xpGain: 10 })
  })

  const { leveledUp } = await response.json()

  if (leveledUp) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }
}
```

---

## 🧪 Step 8: Test Everything

```bash
# Start app
npm run dev

# Test Flow:
1. Open http://localhost:3000
2. Fill in profile → Should show XP bar
3. Go to /analyze
4. Paste job description → Analyze
   - Should gain +10 XP
5. Generate cover letter → +15 XP
6. Save application → +25 XP
7. Check navbar → Streak should be 1
8. Check home page → XP bar should fill

# Test Leveling:
- Keep analyzing/saving until 100 XP
- Should level up to Level 2
- Confetti should trigger

# Test Streaks:
- Apply tomorrow → Streak = 2
- Skip a day → Streak = 0
```

---

## ✅ Done!

You should now have:
- ✅ Streaks working
- ✅ XP & levels working
- ✅ UI updated with stats
- ✅ Confetti on level-up

---

## 🔜 Next Steps (Optional)

1. **Add animations** - Implement Framer Motion TODOs
2. **Velocity chart** - Add Recharts chart on tracker page
3. **Achievements** - Implement achievement system

---

## 🐛 Troubleshooting

**Streak always 0:**
- Check `calculateStreak()` implementation
- Verify applications have `appliedAt` dates
- Use `console.log()` to debug date comparisons

**XP not updating:**
- Check `/api/user/xp` endpoint works (test with curl)
- Verify Prisma client regenerated
- Check browser console for errors

**Level not increasing:**
- Verify `calculateLevel()` formula
- Check database has `level` column
- Look at `totalXP` value in database

---

**You're ready to code! 🚀**

Follow this guide step-by-step and you'll have gamification working in no time.
