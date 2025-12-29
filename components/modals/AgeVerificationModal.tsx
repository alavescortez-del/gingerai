'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AgeVerificationModal() {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations('ageVerification')

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà confirmé son âge
    const ageVerified = localStorage.getItem('sugarush_age_verified')
    
    if (!ageVerified) {
      // Petit délai pour ne pas afficher immédiatement
      setTimeout(() => {
        setIsVisible(true)
      }, 500)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('sugarush_age_verified', 'true')
    setIsVisible(false)
  }

  const handleDecline = () => {
    // Redirige vers Google
    window.location.href = 'https://www.google.com'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl max-w-lg w-full p-8 md:p-10 shadow-2xl">
              
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
                {t('title')}
              </h2>

              {/* Message */}
              <p className="text-zinc-400 text-center text-lg mb-8 leading-relaxed">
                {t('message')}
              </p>

              {/* Warning */}
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4 mb-8">
                <p className="text-pink-300 text-sm text-center font-medium">
                  ⚠️ {t('warning')}
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                {/* Accept Button */}
                <button
                  onClick={handleAccept}
                  className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105 shadow-xl shadow-pink-500/20"
                >
                  {t('accept')}
                </button>

                {/* Decline Button */}
                <button
                  onClick={handleDecline}
                  className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-lg rounded-full transition-all border border-white/10"
                >
                  {t('decline')}
                </button>
              </div>

              {/* Legal Text */}
              <p className="text-zinc-600 text-xs text-center mt-6">
                {t('legal')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

