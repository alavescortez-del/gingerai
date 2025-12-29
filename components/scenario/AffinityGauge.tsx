'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { useGameStore } from '@/lib/stores/gameStore'

interface AffinityGaugeProps {
  showLabel?: boolean
  className?: string
}

export default function AffinityGauge({ showLabel = true, className = '' }: AffinityGaugeProps) {
  const { affinity } = useGameStore()
  
  const getGaugeColor = () => {
    if (affinity >= 80) return 'from-ginger-hot via-ginger-primary to-ginger-accent'
    if (affinity >= 50) return 'from-ginger-primary to-ginger-hot'
    return 'from-ginger-primary/70 to-ginger-primary'
  }
  
  const getHeartAnimation = () => {
    if (affinity >= 80) return { scale: [1, 1.2, 1], transition: { duration: 0.5, repeat: Infinity } }
    if (affinity >= 50) return { scale: [1, 1.1, 1], transition: { duration: 0.8, repeat: Infinity } }
    return {}
  }
  
  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-ginger-muted flex items-center gap-1">
            <motion.div animate={getHeartAnimation()}>
              <Heart className={`w-4 h-4 ${affinity >= 80 ? 'text-ginger-hot fill-ginger-hot' : 'text-ginger-primary'}`} />
            </motion.div>
            Affinité
          </span>
          <span className="text-sm font-semibold text-ginger-text">{affinity}%</span>
        </div>
      )}
      
      <div className="affinity-gauge relative">
        <motion.div
          className={`affinity-gauge-fill bg-gradient-to-r ${getGaugeColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${affinity}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Sparkle at 100% */}
        {affinity >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <Sparkles className="w-5 h-5 text-ginger-accent animate-pulse" />
          </motion.div>
        )}
      </div>
      
      {/* Milestone markers */}
      <div className="flex justify-between mt-1 text-[10px] text-ginger-muted">
        <span>0</span>
        <span className={affinity >= 25 ? 'text-ginger-primary' : ''}>25</span>
        <span className={affinity >= 50 ? 'text-ginger-primary' : ''}>50</span>
        <span className={affinity >= 75 ? 'text-ginger-primary' : ''}>75</span>
        <span className={affinity >= 100 ? 'text-ginger-accent' : ''}>💋</span>
      </div>
    </div>
  )
}

