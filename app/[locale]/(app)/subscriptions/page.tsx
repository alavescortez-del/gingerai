'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Sparkles, Flame, Shield, Clock, CreditCard, EyeOff, ShieldCheck, Lock, BadgeCheck } from 'lucide-react'
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

        {/* Section réassurance - Textes importants */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass rounded-3xl p-6 md:p-8 border border-white/5">
            <div className="space-y-4">
              {/* Transaction discrète */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t('reassurance.discreet')}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{t('reassurance.discreetDesc')}</p>
                </div>
              </div>

              {/* Pas de frais cachés */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t('reassurance.noHidden')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-white/5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
              <ShieldCheck className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('trust.antivirus')}</p>
              <p className="text-[10px] text-zinc-500">{t('trust.antivirusDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <Lock className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('trust.privacy')}</p>
              <p className="text-[10px] text-zinc-500">{t('trust.privacyDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20">
              <Clock className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('trust.cancel')}</p>
              <p className="text-[10px] text-zinc-500">{t('trust.cancelDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 flex items-center justify-center border border-pink-500/20">
              <Zap className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('trust.instant')}</p>
              <p className="text-[10px] text-zinc-500">{t('trust.instantDesc')}</p>
            </div>
          </div>
        </div>

        {/* Footer réassurance */}
        <div className="text-center mt-10 pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-600" />
              <span className="text-xs text-zinc-500">{t('trust.cards')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-zinc-600" />
              <span className="text-xs text-zinc-500">{t('trust.ssl')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
