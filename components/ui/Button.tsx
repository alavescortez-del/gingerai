'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95',
    outline: 'border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-pink-500/50',
    ghost: 'text-zinc-400 hover:text-white hover:bg-white/5'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-[8px]',
    md: 'px-6 py-3 text-[9px]',
    lg: 'px-8 py-4 text-[10px]'
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-pink-600 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
      )}
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
