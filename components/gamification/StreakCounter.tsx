/**
 * StreakCounter Component
 *
 * Displays the user's current application streak with a flame icon.
 * Animates when the streak increases.
 *
 * See docs/redesign/gamification.md for details.
 */

'use client'

import { Flame } from 'lucide-react'
// import { motion } from 'framer-motion'
import { getStreakMessage } from '@/lib/gamification'

interface StreakCounterProps {
  streak: number
  showMessage?: boolean
}

export function StreakCounter({ streak, showMessage = false }: StreakCounterProps) {
  // TODO: Add animation when streak increases
  //
  // Hints:
  // - Use framer-motion's <motion.div>
  // - Animate scale when streak changes
  // - Add pulse animation for streaks > 3
  //
  // Example:
  // <motion.div
  //   key={streak} // Re-animate when streak changes
  //   initial={{ scale: 0.8, opacity: 0 }}
  //   animate={{ scale: 1, opacity: 1 }}
  //   transition={{ type: 'spring', stiffness: 500 }}
  // >
  //
  // Bonus:
  // - Add continuous pulse for streaks >= 7
  // - Use keyframes for pulse effect

  // const streakColor = getStreakColor(streak)
  const message = getStreakMessage(streak)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500
                      text-white font-bold px-4 py-2 rounded-full shadow-md
                      hover:shadow-lg transition-shadow duration-200">
        <Flame size={20} className={streak >= 7 ? 'animate-pulse' : ''} />
        <span className="text-lg font-extrabold tabular-nums">{streak}</span>
        <span className="text-sm">day{streak !== 1 ? 's' : ''}</span>
      </div>

      {showMessage && (
        <p className="text-sm text-slate-600 text-center">{message}</p>
      )}
    </div>
  )
}
