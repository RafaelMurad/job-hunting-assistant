/**
 * XPBar Component
 *
 * Displays a progress bar showing XP progress toward next level.
 * Animates when XP increases.
 *
 * See docs/redesign/gamification.md for details.
 */

'use client'

// import { motion } from 'framer-motion'
import { Star, Zap } from 'lucide-react'
import { getLevelTitle } from '@/lib/gamification'

interface XPBarProps {
  currentXP: number
  nextLevelXP: number
  level: number
  totalXP?: number
  compact?: boolean
}

export function XPBar({
  currentXP,
  nextLevelXP,
  level,
  totalXP,
  compact = false
}: XPBarProps) {
  const progress = (currentXP / nextLevelXP) * 100
  const levelTitle = getLevelTitle(level)

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
          <Star size={16} />
          <span>Lvl {level}</span>
        </div>

        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
          {/* TODO: Animate the progress bar filling

              Current implementation is static. Add:
              - Framer Motion animation
              - Smooth width transition
              - Glow effect on fill

              Hints:
              - Use motion.div for the inner bar
              - Animate width from 0 to {progress}%
              - Duration: 500ms
              - Easing: ease-out

              Example:
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
          */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500
                       transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-slate-600 tabular-nums min-w-[60px] text-right">
          {currentXP}/{nextLevelXP}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full
                          bg-purple-100 text-purple-700 font-bold text-sm">
            <Star size={16} />
            <span>Level {level}</span>
          </div>
          <span className="text-sm text-slate-600 font-medium">{levelTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          <span className="text-sm text-slate-600 font-medium tabular-nums">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
          {/* TODO: Add advanced animations

              Current: Basic CSS transition
              Goal: Smooth animated progress with glow effect

              Steps:
              1. Replace the inner div with motion.div
              2. Animate width from previous value to current
              3. Add a subtle glow effect using box-shadow
              4. Add a shimmer effect (optional)

              Bonus:
              - Animate XP number counting up
              - Add particle effects when XP increases
              - Pulsing glow when near level-up (progress > 90%)
          */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500
                       bg-size-200 animate-gradient
                       shadow-md shadow-blue-500/30
                       transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundSize: '200% 100%'
            }}
          />
        </div>

        {/* Percentage Label */}
        {progress > 20 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Total XP (optional) */}
      {totalXP !== undefined && (
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Total XP: <span className="font-semibold text-slate-700">{totalXP}</span>
          </p>
        </div>
      )}
    </div>
  )
}
