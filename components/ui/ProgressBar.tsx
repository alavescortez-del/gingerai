'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'gradient' | 'success'
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const variants = {
    default: 'bg-ginger-primary',
    gradient: 'bg-gradient-to-r from-ginger-primary via-ginger-accent to-ginger-hot',
    success: 'bg-green-500'
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs">
          <span className="text-ginger-muted">{value}</span>
          <span className="text-ginger-muted">{max}</span>
        </div>
      )}
      <div className={`w-full ${sizes[size]} rounded-full bg-ginger-secondary overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${variants[variant]}`}
        />
      </div>
    </div>
  )
}

