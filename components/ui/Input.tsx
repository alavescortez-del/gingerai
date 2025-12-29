'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-6 py-4 rounded-2xl
            bg-zinc-900/80 border border-white/10
            text-white placeholder-zinc-600
            focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10
            transition-all duration-300 text-sm
            ${error ? 'border-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
