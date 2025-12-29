'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        rounded-4xl p-6
        bg-gradient-to-br from-ginger-surface/60 to-ginger-card/80
        border border-white/5
        shadow-luxury
        transition-all duration-500
        ${hover ? 'hover:border-pink-500/30 hover:shadow-glow-pink' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
