'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Sparkles, Flame, Shield, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import { useState } from 'react'

const PLAN_IDS = ['free', 'soft', 'unleashed'] as const

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptions')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = PLAN_IDS.map((id, index) => ({
    id,
    name: t(`plans.${id}.name`),
    price: id === 'free' ? '0' : id === 'soft' ? '9,99' : '12,99',
    description: t(`plans.${id}.desc`),
    features: t.raw(`plans.${id}.features`) as string[],
    buttonText: id === 'free' ? t('currentPlan') : `${t('choosePlan')} ${t(`plans.${id}.name`)}`,
    highlight: id === 'soft',
    badge: id === 'soft' ? t('popular') : undefined,
  }))

  return (
    <div className="min-h-screen bg-ginger-bg py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter"
          >
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`relative glass rounded-[40px] p-8 flex flex-col border transition-all duration-500 ${
                plan.highlight 
                  ? 'border-pink-500/50 shadow-2xl shadow-pink-500/10 scale-105 z-10' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2 uppercase">{plan.name}</h3>
                <p className="text-zinc-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{plan.price}€</span>
                <span className="text-zinc-500 font-bold uppercase text-xs">{t('perMonth')}</span>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.id === 'unleashed' ? 'bg-pink-500/20' : 'bg-white/5'}`}>
                      <Check className={`w-3 h-3 ${plan.id === 'unleashed' ? 'text-pink-500' : 'text-zinc-400'}`} />
                    </div>
                    <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.highlight ? 'primary' : 'outline'}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                  plan.id === 'unleashed' ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-none shadow-xl shadow-pink-600/20' : ''
                }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-10 border-t border-white/5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('trust.secure')}</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('trust.instant')}</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('trust.cancel')}</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('trust.noCensorship')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
