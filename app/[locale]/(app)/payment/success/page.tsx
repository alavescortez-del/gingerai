'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    // Lancer les confettis
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f472b6', '#a855f7', '#8b5cf6']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f472b6', '#a855f7', '#8b5cf6']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-ginger-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-md w-full text-center"
      >
        {/* Icon de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative inline-block mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full border-2 border-dashed border-pink-500/30"
          />
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-black text-white mb-4"
        >
          Bienvenue dans <span className="gradient-text">l'expérience Premium</span> !
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 text-lg mb-8"
        >
          Ton abonnement est maintenant actif. Profite de toutes les fonctionnalités exclusives.
        </motion.p>

        {/* Features débloquées */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="text-white font-bold">Ce qui t'attend</h3>
          </div>
          <ul className="text-left space-y-3">
            {[
              'Conversations illimitées avec tes modèles préférées',
              'Accès à tous les scénarios premium',
              'Photos et vidéos exclusives',
              'SweetSpot complet sans restriction'
            ].map((feature, i) => (
              <motion.li
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 text-zinc-300"
              >
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
          >
            Commencer l'aventure
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Transaction ID */}
        {transactionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-zinc-600 text-xs mt-8"
          >
            Transaction: {transactionId}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

