'use client'

import { motion } from 'framer-motion'
import { XCircle, RefreshCw, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

export default function PaymentFailurePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const transactionId = searchParams.get('transaction_id')
  const errorCode = searchParams.get('error')

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'declined':
        return 'Ta banque a refusé la transaction. Vérifie tes informations de carte ou essaie un autre moyen de paiement.'
      case 'insufficient_funds':
        return 'Fonds insuffisants sur ton compte. Vérifie ton solde ou utilise une autre carte.'
      case 'expired_card':
        return 'Ta carte a expiré. Utilise une carte valide.'
      case 'cancelled':
        return 'Tu as annulé le paiement. Pas de souci, tu peux réessayer quand tu veux !'
      default:
        return 'Une erreur est survenue lors du paiement. Pas de panique, aucun montant n\'a été prélevé.'
    }
  }

  return (
    <div className="min-h-screen bg-ginger-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-md w-full text-center"
      >
        {/* Icon d'erreur */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative inline-block mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <XCircle className="w-14 h-14 text-white" />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-black text-white mb-4"
        >
          Oups, ça n'a pas marché
        </motion.h1>

        {/* Message d'erreur */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 text-lg mb-8"
        >
          {getErrorMessage()}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Réessayer */}
          <Link
            href={`/${locale}/subscriptions`}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer le paiement
          </Link>

          {/* Retour */}
          <Link
            href={`/${locale}`}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white font-semibold hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Aide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-2 justify-center mb-2">
            <MessageCircle className="w-4 h-4 text-pink-500" />
            <span className="text-white text-sm font-semibold">Besoin d'aide ?</span>
          </div>
          <p className="text-zinc-500 text-xs">
            Contacte notre support à <a href="mailto:support@sugarush.com" className="text-pink-500 hover:underline">support@sugarush.com</a>
          </p>
        </motion.div>

        {/* Transaction ID */}
        {transactionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-zinc-600 text-xs mt-8"
          >
            Référence: {transactionId}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

