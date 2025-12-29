'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Lock } from 'lucide-react'
import { useGameStore } from '@/lib/stores/gameStore'
import { Action } from '@/types/database'

interface ActionMenuProps {
  onActionTrigger: (action: Action) => void
  className?: string
}

export default function ActionMenu({ onActionTrigger, className = '' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { availableActions, affinity } = useGameStore()
  
  const handleActionClick = (action: Action) => {
    if (affinity < action.affinity_required) {
      // Show locked message
      return
    }
    
    onActionTrigger(action)
    setIsOpen(false)
  }
  
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop invisible pour fermer en cliquant ailleurs */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Actions Modal - Aligné à droite au-dessus du bouton */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, originX: '100%', originY: '100%' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full right-0 mb-4 w-80 lg:w-[400px] z-50"
            >
              <div className="bg-zinc-900 rounded-3xl border border-white/10 p-6 shadow-2xl shadow-black/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                    Interaction directe
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-500" />
                  </button>
                </div>

                {/* Actions List */}
                <div className="space-y-2">
                  {availableActions.length === 0 ? (
                    <p className="text-center text-zinc-500 py-4 text-sm">Aucune action disponible</p>
                  ) : (
                    availableActions.map((action) => {
                      const isLocked = affinity < action.affinity_required
                      const isDisabled = isLocked

                      return (
                        <motion.button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { x: 4 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          className={`
                            w-full px-4 py-4 rounded-xl text-left
                            flex items-center justify-between
                            transition-all
                            ${isDisabled 
                              ? 'bg-zinc-800/30 opacity-40 cursor-not-allowed' 
                              : 'bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {isLocked && <Lock className="w-4 h-4 text-zinc-500" />}
                            <span className={`text-sm font-black uppercase tracking-wide ${isDisabled ? 'text-zinc-500' : 'text-white'}`}>
                              {action.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLocked && (
                              <span className="text-[10px] text-zinc-500 font-bold">
                                {action.affinity_required}%
                              </span>
                            )}
                          </div>
                        </motion.button>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main toggle button - Rectangulaire rose */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="shrink-0 p-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:scale-105 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center"
      >
        <Flame className="w-5 h-5" />
      </motion.button>
    </div>
  )
}

