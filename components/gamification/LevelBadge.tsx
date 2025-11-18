/**
 * LevelBadge Component
 *
 * A simple badge displaying the user's current level.
 * Used in navigation and profile headers.
 *
 * See docs/redesign/components.md for usage examples.
 */

import { Star } from 'lucide-react'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  return (
    <div className={`
      inline-flex items-center gap-1
      bg-purple-500 text-white font-bold
      rounded-full border-2 border-purple-600
      shadow-sm hover:shadow-md
      transition-shadow duration-200
      ${sizeClasses[size]}
    `}>
      <Star size={iconSizes[size]} fill="currentColor" />
      <span>Lvl {level}</span>
    </div>
  )
}
