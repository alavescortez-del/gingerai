'use client'

import { motion } from 'framer-motion'
import { Check, CreditCard, Landmark, ShieldCheck, Lock, Shield, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useGameStore } from '@/lib/stores/gameStore'
import { useRouter, useParams } from 'next/navigation'
import AuthModal from '@/components/auth/AuthModal'

type PlanId = 'soft' | 'unleashed'
type PaymentMethod = 'CARD' | 'PAY_BY_BANK' | 'CRYPTO'

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptions')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { user } = useGameStore()
  
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('soft')
  const [isLoading, setIsLoading] = useState<PaymentMethod | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans = [
    {
      id: 'soft' as PlanId,
      name: t('plans.soft.name'),
      pricePerMonth: '9',
      priceCents: '99',
      popular: true
    },
    {
      id: 'unleashed' as PlanId,
      name: t('plans.unleashed.name'),
      pricePerMonth: '12',
      priceCents: '99',
      popular: false
    }
  ]

  const softFeatures = t.raw('plans.soft.features') as string[]
  const unleashedFeatures = t.raw('plans.unleashed.features') as string[]
  const currentFeatures = selectedPlan === 'soft' ? softFeatures : unleashedFeatures

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsLoading(paymentMethod)
    setError(null)

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan,
          userId: user.id,
          userEmail: user.email,
          paymentMethod: paymentMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement')
      }

      // Rediriger vers la page de paiement UpGate
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error('URL de paiement non reçue')
      }

    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-ginger-bg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Layout principal - 2 colonnes sur desktop */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Colonne gauche - Image du modèle */}
          <div className="hidden lg:block w-[350px] shrink-0 self-start sticky top-8">
            <img 
              src="https://eyezejnwhhiheabkcntx.supabase.co/storage/v1/object/public/models-ia/Lily/promote-lily.webp" 
              alt="Model"
              className="w-full h-auto rounded-3xl object-cover shadow-2xl"
            />
          </div>

          {/* Colonne centrale - Choix abonnement + Paiement */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0">
            
            {/* Titre */}
            <h1 className="text-2xl font-black text-white uppercase mb-6 text-center lg:text-left">
              {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
            </h1>
            
            {/* Sélection des offres - Style radio */}
            <div className="space-y-3 mb-6">
              {plans.map((plan) => (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
                    selectedPlan === plan.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio button */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id ? 'border-pink-500' : 'border-zinc-500'
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      )}
                    </div>
                    
                    {/* Info plan */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{plan.name}</span>
                        {plan.popular && (
                          <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {t('popular')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-2xl font-black">€{plan.pricePerMonth}</span>
                      <span className="text-zinc-400 text-sm">,{plan.priceCents}</span>
                      <span className="text-zinc-500 text-xs">/mois</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Réassurances - Textes avec boucliers */}
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                  <Shield className="w-3 h-3 text-green-500" />
                </div>
                <span className="text-zinc-300 text-xs">Aucune transaction en lien avec un contenu Adulte sur votre relevé bancaire</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                  <Shield className="w-3 h-3 text-green-500" />
                </div>
                <span className="text-zinc-300 text-xs">Pas de frais cachés • Annulez l'abonnement à tout moment</span>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Boutons de paiement */}
            <div className="space-y-2">
              {/* Carte bancaire */}
              <button 
                onClick={() => handlePayment('CARD')}
                disabled={isLoading !== null}
                className="w-full py-3 px-5 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-pink-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'CARD' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Payer avec Carte Bancaire</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-white rounded px-1 py-0.5">
                        <span className="text-blue-600 font-bold text-[10px]">VISA</span>
                      </div>
                      <div className="bg-white rounded px-1 py-0.5">
                        <div className="flex">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 -mr-1" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </button>

              {/* Virement bancaire */}
              <button 
                onClick={() => handlePayment('PAY_BY_BANK')}
                disabled={isLoading !== null}
                className="w-full py-3 px-5 bg-zinc-800 border border-white/10 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'PAY_BY_BANK' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Paiement Bancaire Instantané</span>
                    <Landmark className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Crypto */}
              <button 
                onClick={() => handlePayment('CRYPTO')}
                disabled={isLoading !== null}
                className="w-full py-3 px-5 bg-zinc-800 border border-white/10 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'CRYPTO' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Payer avec</span>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">₿</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">Ξ</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">Ł</span>
                      </div>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Info prélèvement */}
            <p className="text-center text-zinc-500 text-xs mt-4 mb-6">
              Prélèvement mensuel • Renouvellement automatique • Résiliable à tout moment
            </p>

            {/* Trust badges - Style Candy.ai */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <p className="text-white text-xs font-bold">Antivirus</p>
                <p className="text-zinc-500 text-[10px]">Sécurisé</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <p className="text-white text-xs font-bold">Confidentialité</p>
                <p className="text-zinc-500 text-[10px]">bancaire</p>
              </div>
            </div>

          </div>

          {/* Colonne droite - Features + Image */}
          <div className="hidden lg:block w-[280px] shrink-0">
            {/* Features dynamiques selon le plan */}
            <div className="space-y-3 mb-6">
              <h3 className="text-white font-bold text-sm mb-4">
                {selectedPlan === 'soft' ? t('plans.soft.name') : t('plans.unleashed.name')} inclut :
              </h3>
              {currentFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-pink-500" />
                  </div>
                  <span className="text-zinc-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Deuxième image */}
            <img 
              src="https://eyezejnwhhiheabkcntx.supabase.co/storage/v1/object/public/models-ia/Emma/emma-promote.webp" 
              alt="Model Emma"
              className="w-full h-auto rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
      />
    </div>
  )
}

