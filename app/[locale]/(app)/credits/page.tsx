'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'
import Link from 'next/link'

const subscriptionPlans = [
  {
    id: 'monthly',
    name: 'Premium 1 mois',
    price: 12.99,
    period: '/mois',
    credits: 50,
    billingInfo: 'Facturation mensuelle',
    features: [
      '50 Piments par mois',
      'Tous les scénarios débloqués',
      'Messages illimités',
      'Mode DM débloqué',
      'Actions "hard"',
      'Contenu exclusif',
    ],
  },
  {
    id: 'quarterly',
    name: 'Premium 3 mois',
    price: 12.99,
    period: '/mois',
    credits: 150,
    billingInfo: 'Facturation trimestrielle (38,97€)',
    popular: true,
    features: [
      '150 Piments par mois',
      'Tous les scénarios débloqués',
      'Messages illimités',
      'Mode DM débloqué',
      'Actions "hard"',
      'Contenu exclusif',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium 12 mois',
    price: 12.99,
    period: '/mois',
    credits: 600,
    billingInfo: 'Facturation annuelle (155,88€)',
    hot: true,
    features: [
      '600 Piments par mois',
      'Tous les scénarios débloqués',
      'Messages illimités',
      'Mode DM débloqué',
      'Actions "hard"',
      'Contenu exclusif',
    ],
  },
]

const creditPacks = [
  { id: 'pack-50', amount: 50, price: 4.99, discount: '0%' },
  { id: 'pack-150', amount: 150, price: 12.99, discount: '13%', popular: true },
  { id: 'pack-500', amount: 500, price: 34.99, discount: '30%' },
  { id: 'pack-1000', amount: 1000, price: 59.99, discount: '40%', hot: true },
  { id: 'pack-2500', amount: 2500, price: 129.99, discount: '48%' },
  { id: 'pack-5000', amount: 5000, price: 229.99, discount: '54%' },
]

export default function CreditsPage() {
  const { credits, user } = useGameStore()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<'subscription' | 'credits'>('subscription')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handlePurchase = async (id: string) => {
    setPurchasing(id)
    setTimeout(() => {
      alert('Stripe sera intégré prochainement')
      setPurchasing(null)
    }, 1000)
  }

  // If not authenticated, show CTA
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20" />
            <div className="relative space-y-4">
              <div className="text-6xl mb-4">🌶️</div>
              <h1 className="text-4xl md:text-6xl font-black text-white">
                Débloque tout Sugarush
              </h1>
              <p className="text-xl text-zinc-400">
                Inscris-toi pour accéder aux abonnements et crédits premium
              </p>
            </div>
          </div>

          <div className="grid gap-4 max-w-md mx-auto">
            <Link href="/register" className="group relative">
              <div className="absolute inset-0 bg-pink-600 blur-xl opacity-40 group-hover:opacity-70 transition-opacity rounded-2xl" />
              <div className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-xl">
                Commencer gratuitement
              </div>
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Choisis ton <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-8">
          Abonnement mensuel ou crédits à l&apos;unité, c&apos;est toi qui décides
        </p>

        {/* Tab Switch */}
        <div className="inline-flex items-center gap-2 p-2 rounded-full glass">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Abonnements
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all ${
              activeTab === 'credits'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🌶️ Piments
          </button>
        </div>
      </motion.div>

      {/* Subscription Plans */}
      {activeTab === 'subscription' && (
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass p-8 rounded-3xl relative ${
                plan.popular ? 'border-2 border-pink-500' : ''
              }`}
            >
              {/* Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black uppercase tracking-wider">
                  Populaire
                </div>
              )}
              {plan.hot && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-black uppercase tracking-wider">
                  Best Value
                </div>
              )}

              {/* Plan name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <div className="text-5xl font-black gradient-text mb-1">
                  {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                </div>
                {plan.price > 0 && <p className="text-zinc-500">{plan.period}</p>}
                {plan.billingInfo && <p className="text-zinc-600 text-xs mt-1">{plan.billingInfo}</p>}
              </div>

              {/* Credits */}
              {plan.credits > 0 && (
                <div className="text-center mb-6 p-3 rounded-xl bg-pink-500/10 border border-pink-500/30">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-pink-400 font-bold">{plan.credits}</span>
                    <span className="text-lg">🌶️</span>
                    <span className="text-zinc-500 text-sm">/ mois</span>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={purchasing === plan.id}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:scale-105 shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {purchasing === plan.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>S&apos;abonner</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Credit Packs */}
      {activeTab === 'credits' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPacks.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass p-8 rounded-3xl relative ${
                pack.popular ? 'border-2 border-pink-500' : ''
              }`}
            >
              {/* Badge */}
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black uppercase tracking-wider">
                  Populaire
                </div>
              )}
              {pack.hot && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-black uppercase tracking-wider">
                  Meilleure offre
                </div>
              )}

              {/* Discount badge */}
              {pack.discount !== '0%' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold">
                  -{pack.discount}
                </div>
              )}

              {/* Amount */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🌶️</span>
                  <span className="text-3xl font-black text-white">
                    {pack.amount.toLocaleString()}
                  </span>
                  <span className="text-zinc-400 text-lg">Piments</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <div className="text-2xl font-black text-white mb-1">
                  {pack.price}€
                </div>
                <p className="text-zinc-500 text-xs">Paiement unique</p>
              </div>

              {/* Payment methods */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-zinc-500 text-xs">Carte de débit ou de crédit</p>
                  <svg className="h-4 opacity-60" viewBox="0 0 48 32" fill="white">
                    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M18 10h-4l-4 12h4l4-12zm8 0l-3.6 12h4l3.6-12h-4zm8.4 0l-2 7.2c-.4 1.2-1.2 2-2.4 2h-1.6l2-9.2h4z" fill="currentColor"/>
                  </svg>
                  <svg className="h-4 opacity-60" viewBox="0 0 48 32" fill="white">
                    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1"/>
                    <circle cx="18" cy="16" r="8" fill="currentColor" fillOpacity="0.3"/>
                    <circle cx="30" cy="16" r="8" fill="currentColor" fillOpacity="0.3"/>
                  </svg>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing === pack.id}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  pack.popular
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:scale-105 shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {purchasing === pack.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Acheter</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center space-y-6"
      >
        <h2 className="text-2xl font-black text-white">À quoi servent les Piments ?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass p-6 rounded-2xl">
            <div className="text-3xl mb-3">🔓</div>
            <h3 className="font-bold text-white mb-2">Débloquer des actions</h3>
            <p className="text-zinc-400 text-sm">
              Utilise tes Piments pour débloquer des actions exclusives dans les scénarios
            </p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-white mb-2">Messages illimités</h3>
            <p className="text-zinc-400 text-sm">
              Continue tes conversations sans limites de messages quotidiens
            </p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold text-white mb-2">Contenu premium</h3>
            <p className="text-zinc-400 text-sm">
              Accède à du contenu exclusif et des moments privilégiés
            </p>
          </div>
        </div>

        <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
          💳 Paiement sécurisé via Stripe • 🔒 Transactions chiffrées • 🎯 Crédits ajoutés instantanément
        </p>
      </motion.div>
    </div>
  )
}
