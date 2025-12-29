'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'premium' | 'hot' | 'success' | 'live'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-white/5 text-zinc-400 border-white/10',
    premium: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
    hot: 'bg-rose-600 text-white border-rose-500',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[7px]',
    md: 'px-3 py-1 text-[8px]'
  }
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-widest border backdrop-blur-sm
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {variant === 'live' && (
        <span className="relative w-1.5 h-1.5">
          <span className="absolute inset-0 bg-emerald-500 blur-sm opacity-60 animate-pulse" />
          <span className="relative block w-full h-full bg-emerald-500 rounded-full" />
        </span>
      )}
      {children}
    </span>
  )
}
