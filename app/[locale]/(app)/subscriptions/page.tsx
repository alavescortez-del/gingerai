'use client'

import { motion } from 'framer-motion'
import { Check, CreditCard, Landmark, ShieldCheck, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type PlanId = 'soft' | 'unleashed'

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptions')
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('soft')
  const [imageError, setImageError] = useState(false)

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
              onError={(e) => {
                console.error('Image error:', e)
                setImageError(true)
              }}
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

            {/* Réassurances - Textes verts */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-zinc-300 text-xs">Aucune transaction en lien avec un contenu Adulte sur votre relevé bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-zinc-300 text-xs">Pas de frais cachés • Annulez l'abonnement à tout moment</span>
              </div>
            </div>

            {/* Boutons de paiement */}
            <div className="space-y-3">
              {/* Carte bancaire */}
              <button className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-pink-600/20">
                <span>Payer avec Carte Bancaire</span>
                <div className="flex items-center gap-1">
                  <div className="bg-white rounded px-1 py-0.5">
                    <span className="text-blue-600 font-bold text-xs">VISA</span>
                  </div>
                  <div className="bg-white rounded px-1 py-0.5">
                    <div className="flex">
                      <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Virement bancaire */}
              <button className="w-full py-4 px-6 bg-zinc-800 border border-white/10 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:bg-zinc-700 transition-colors">
                <span>Paiement Bancaire Instantané</span>
                <Landmark className="w-5 h-5" />
              </button>

              {/* Crypto */}
              <button className="w-full py-4 px-6 bg-zinc-800 border border-white/10 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:bg-zinc-700 transition-colors">
                <span>Payer avec</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">₿</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">Ξ</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">Ł</span>
                  </div>
                </div>
              </button>
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

        {/* Footer - Trust badges */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-white text-xs font-bold">Antivirus</p>
                <p className="text-zinc-500 text-[10px]">Sécurisé</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-white text-xs font-bold">Confidentialité</p>
                <p className="text-zinc-500 text-[10px]">bancaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
