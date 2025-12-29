'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Lock, MessageSquare, Image as ImageIcon, Zap, X, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Button from './Button'
import Link from 'next/link'

interface PlanLimitModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'messages' | 'photos' | 'scenario' | 'phase'
  plan: 'free' | 'soft' | 'unleashed'
  modelAvatar?: string
}

export default function PlanLimitModal({ isOpen, onClose, type, plan, modelAvatar }: PlanLimitModalProps) {
  const t = useTranslations('planLimit')
  const params = useParams()
  const locale = (params.locale as string) || 'fr'
  
  const getContent = () => {
    const planKey = plan === 'free' ? 'free' : 'soft'
    switch (type) {
      case 'messages':
        return {
          title: t('messages.title'),
          description: t(`messages.${planKey}`),
          icon: <MessageSquare className="w-8 h-8 text-pink-500" />
        }
      case 'photos':
        return {
          title: t('photos.title'),
          description: t(`photos.${planKey}`),
          icon: <ImageIcon className="w-8 h-8 text-pink-500" />
        }
      case 'scenario':
        return {
          title: t('scenario.title'),
          description: t('scenario.desc'),
          icon: <Lock className="w-8 h-8 text-pink-500" />
        }
      case 'phase':
        return {
          title: t('phase.title'),
          description: t(`phase.${planKey}`),
          icon: <Crown className="w-8 h-8 text-yellow-500" />
        }
      default:
        return {
          title: t('default.title'),
          description: t('default.desc'),
          icon: <Zap className="w-8 h-8 text-pink-500" />
        }
    }
  }

  const content = getContent()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-zinc-950 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-white/10 transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left side: Model Image */}
            <div className="hidden md:block w-1/2 relative aspect-[4/5]">
              {modelAvatar ? (
                <>
                  <img 
                    src={modelAvatar} 
                    alt="Model" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950" />
                  
                  <div className="absolute bottom-10 left-10 right-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-600/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 fill-white" />
                      {t('imageBadge')}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      {t('imageTitle')}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                  <div className="w-20 h-20 bg-pink-500/10 rounded-full blur-2xl" />
                </div>
              )}
            </div>

            {/* Right side: Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto md:mx-0">
                {content.icon}
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                {content.title}
              </h2>
              
              <p className="text-zinc-400 font-medium mb-10 leading-relaxed">
                {content.description}
              </p>

              <div className="space-y-4">
                <Link href={`/${locale}/subscriptions`} className="block">
                  <Button className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-gradient-to-r from-pink-600 to-rose-600 shadow-xl shadow-pink-600/20">
                    <span className="flex items-center justify-center gap-2">
                      {t('cta')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full py-2 text-zinc-500 hover:text-white font-bold uppercase text-[10px] tracking-widest transition-colors"
                >
                  {t('later')}
                </button>
              </div>

              {/* Plans Preview */}
              <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">{t('planSoft')}</p>
                  <p className="text-xs text-zinc-400">{t('planSoftDesc')}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{t('planUnleashed')}</p>
                  <p className="text-xs text-zinc-400">{t('planUnleashedDesc')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
