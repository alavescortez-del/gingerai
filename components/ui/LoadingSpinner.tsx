'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} text-ginger-primary`}
      >
        <Flame className="w-full h-full" />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-ginger-muted text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

