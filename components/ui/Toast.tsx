'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: (id: string) => void
  duration?: number
}

export default function Toast({ id, message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-ginger-primary" />
  }

  const colors = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-ginger-primary/30 bg-ginger-primary/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border
        ${colors[type]}
        shadow-lg backdrop-blur-sm
      `}
    >
      {icons[type]}
      <p className="flex-1 text-sm text-ginger-text">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-ginger-muted" />
      </button>
    </motion.div>
  )
}

// Toast Container for managing multiple toasts
export function ToastContainer({ toasts, onClose }: { 
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>
  onClose: (id: string) => void 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

