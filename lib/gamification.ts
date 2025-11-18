/**
 * Gamification System - Streaks, XP, Levels
 *
 * This file contains all the game mechanics for the Job Hunt AI app.
 * See docs/redesign/gamification.md for detailed documentation.
 */

import { Application, User } from '@prisma/client'
// import { startOfDay, differenceInDays } from 'date-fns'

// ===========================
// XP VALUES
// ===========================

/**
 * XP awarded for each action
 */
export const XP_VALUES = {
  CREATE_PROFILE: 50,
  ANALYZE_JOB: 10,
  GENERATE_COVER_LETTER: 15,
  SAVE_APPLICATION: 25,
  STATUS_APPLIED: 50,
  STATUS_INTERVIEW: 100,
  STATUS_OFFER: 500,
  STREAK_7_DAYS: 100,
  DAILY_LOGIN: 5,
} as const

// ===========================
// STREAK CALCULATION
// ===========================

/**
 * Calculate the current streak for a user
 *
 * A streak is the number of consecutive days the user has applied to at least one job.
 *
 * @param applications - Array of Application objects (from Prisma)
 * @returns Current streak count (number of consecutive days)
 *
 * @example
 * const apps = [
 *   { appliedAt: new Date('2025-01-03') },
 *   { appliedAt: new Date('2025-01-02') },
 *   { appliedAt: new Date('2025-01-01') },
 * ]
 * calculateStreak(apps) // Returns: 3
 */
export function calculateStreak(_applications: Application[]): number {
  // TODO: Implement streak calculation
  //
  // Algorithm:
  // 1. If no applications, return 0
  // 2. Sort applications by appliedAt (newest first)
  // 3. Get today's date (normalized to start of day)
  // 4. Check if there's an application today
  //    - If no: return 0
  //    - If yes: continue
  // 5. Loop backwards through days:
  //    - For each day, check if there's at least 1 application
  //    - If yes: increment streak
  //    - If no: break loop
  // 6. Return streak count
  //
  // Edge cases:
  // - Empty applications array → return 0
  // - Multiple applications on same day count as 1 day
  // - Use startOfDay() to normalize dates (from date-fns)
  //
  // Hints:
  // - Use startOfDay(date) to normalize to midnight
  // - Use differenceInDays(dateLeft, dateRight) to compare dates
  // - Loop from today backwards, checking each day

  return 0 // Replace with your implementation
}

// ===========================
// XP & LEVEL CALCULATION
// ===========================

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
 * - Level 10: 8,100 XP
 *
 * @param totalXP - Total XP earned
 * @returns Current level (1-50)
 *
 * @example
 * calculateLevel(0) // Returns: 1
 * calculateLevel(100) // Returns: 2
 * calculateLevel(450) // Returns: 3 (sqrt(450/100) = 2.12, floor = 2, +1 = 3)
 */
export function calculateLevel(_totalXP: number): number {
  // TODO: Implement level calculation
  //
  // Formula: Level = floor(sqrt(XP / 100)) + 1
  //
  // Hints:
  // - Use Math.floor() to round down
  // - Use Math.sqrt() for square root
  // - Add 1 so level starts at 1 (not 0)
  // - Optional: Cap at level 50 with Math.min(calculated, 50)

  return 1 // Replace with your implementation
}

/**
 * Calculate XP needed to reach the next level
 *
 * Formula: nextLevelXP = (currentLevel^2) * 100
 *
 * @param currentLevel - Current user level
 * @returns XP needed to reach next level
 *
 * @example
 * xpForNextLevel(1) // Returns: 100  (Level 1 → 2 needs 100 XP)
 * xpForNextLevel(2) // Returns: 400  (Level 2 → 3 needs 400 XP)
 * xpForNextLevel(3) // Returns: 900  (Level 3 → 4 needs 900 XP)
 */
export function xpForNextLevel(_currentLevel: number): number {
  // TODO: Implement XP needed for next level
  //
  // Formula: (currentLevel^2) * 100
  //
  // Hints:
  // - currentLevel^2 is currentLevel * currentLevel
  // - Or use Math.pow(currentLevel, 2)
  //
  // Example: Level 2 → 3 needs (2^2) * 100 = 400 XP

  return 100 // Replace with your implementation
}

// ===========================
// VELOCITY CALCULATION
// ===========================

/**
 * Calculate application velocity (applications per week)
 *
 * Returns the number of applications in the last 7 days.
 *
 * @param applications - Array of Application objects
 * @returns Number of applications in last 7 days
 *
 * @example
 * calculateVelocity(applications) // Returns: 5 (if 5 apps in last week)
 */
export function calculateVelocity(_applications: Application[]): number {
  // TODO: Implement velocity calculation
  //
  // Algorithm:
  // 1. Get current date
  // 2. Filter applications from last 7 days
  // 3. Return count
  //
  // Hints:
  // - Use differenceInDays(now, appliedAt) <= 7
  // - Filter applications where appliedAt is within last 7 days
  //
  // Bonus:
  // - Calculate average over last 4 weeks
  // - Return trend (increasing/decreasing)

  return 0 // Replace with your implementation
}

// ===========================
// LEVEL TITLES
// ===========================

/**
 * Get the title for a given level
 *
 * @param level - User's current level
 * @returns Level title (e.g., "Novice Hunter", "Career Champion")
 */
export function getLevelTitle(level: number): string {
  if (level === 1) return 'Novice Hunter'
  if (level <= 3) return 'Applicant'
  if (level <= 5) return 'Job Seeker'
  if (level <= 8) return 'Career Explorer'
  if (level <= 12) return 'Opportunity Scout'
  if (level <= 17) return 'Application Expert'
  if (level <= 24) return 'Interview Master'
  if (level <= 32) return 'Offer Magnet'
  if (level <= 42) return 'Career Champion'
  return 'Legendary Hunter'
}

// ===========================
// ACHIEVEMENTS (Future)
// ===========================

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string // Emoji or Lucide icon name
  xpReward: number
  unlocked: boolean
  unlockedAt?: Date
  progress?: number // For progressive achievements
  maxProgress?: number
}

/**
 * All available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-application',
    title: 'First Step',
    description: 'Apply to your first job',
    icon: '🎯',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Apply to 5 jobs',
    icon: '🚀',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'active-seeker',
    title: 'Active Seeker',
    description: 'Apply to 25 jobs',
    icon: '⚡',
    xpReward: 250,
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
  {
    id: 'two-weeks-strong',
    title: 'Two Weeks Strong',
    description: 'Maintain a 14-day application streak',
    icon: '🔥🔥',
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Maintain a 30-day application streak',
    icon: '🔥🔥🔥',
    xpReward: 500,
    unlocked: false,
  },
  {
    id: 'first-interview',
    title: 'Interview Ready',
    description: 'Schedule your first interview',
    icon: '🎤',
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'first-offer',
    title: 'Offer Received',
    description: 'Receive your first job offer',
    icon: '🎉',
    xpReward: 1000,
    unlocked: false,
  },
]

/**
 * Check which achievements the user has unlocked
 *
 * @param user - User object with stats
 * @param applications - User's applications
 * @returns Array of newly unlocked achievements
 */
export function checkAchievements(
  _user: User,
  _applications: Application[]
): Achievement[] {
  // TODO: Implement achievement checking (Phase 3)
  //
  // Algorithm:
  // 1. Loop through all achievements
  // 2. Check if unlock condition is met
  //    - e.g., applications.length >= 5 for "Getting Started"
  // 3. Check if achievement is not already unlocked
  // 4. If met and not unlocked, add to return array
  // 5. Update user.achievements in database
  //
  // Unlock conditions:
  // - first-application: applications.length >= 1
  // - getting-started: applications.length >= 5
  // - active-seeker: applications.length >= 25
  // - week-warrior: user.currentStreak >= 7
  // - two-weeks-strong: user.currentStreak >= 14
  // - month-master: user.currentStreak >= 30
  // - first-interview: applications with status 'SCREENING' or 'TECHNICAL'
  // - first-offer: applications with status 'OFFER'

  return [] // Replace with your implementation
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Get streak message based on current streak
 *
 * @param streak - Current streak count
 * @returns Motivational message
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!"
  if (streak <= 2) return "Good start! Keep going!"
  if (streak <= 6) return "Building momentum!"
  if (streak <= 13) return "You're on fire! 🔥"
  if (streak <= 29) return "Unstoppable!"
  return "Legendary! 🔥🔥🔥"
}

/**
 * Get color class based on streak length
 *
 * @param streak - Current streak count
 * @returns Tailwind color class
 */
export function getStreakColor(streak: number): string {
  if (streak === 0) return 'text-slate-400'
  if (streak <= 2) return 'text-amber-400'
  if (streak <= 6) return 'text-amber-500'
  if (streak <= 13) return 'text-orange-500'
  if (streak <= 29) return 'text-red-500'
  return 'text-red-600'
}
