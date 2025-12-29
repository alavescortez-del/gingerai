'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[90%] ${sizes[size]}
              bg-[#0a0612] border border-white/10
              rounded-[32px] p-8
              z-50 shadow-[0_0_80px_rgba(0,0,0,0.8)]
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              {title && (
                <h2 className="text-xl font-semibold text-white">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors ml-auto absolute top-4 right-4"
              >
                <X className="w-5 h-5 text-zinc-500 hover:text-white" />
              </button>
            </div>
            
            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

