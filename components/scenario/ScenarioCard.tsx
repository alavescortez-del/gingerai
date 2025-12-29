'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Crown, Flame, Play } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Scenario, Model, Phase, VideoLoop, Action } from '@/types/database'
import { useGameStore } from '@/lib/stores/gameStore'
import AuthModal from '@/components/auth/AuthModal'
import { getTitle, getDescription } from '@/lib/i18n-helpers'

interface ScenarioWithModel extends Scenario {
  model: Model
  actions: Action[]
  phases: (Phase & { video_loops: VideoLoop[] })[]
}

interface ScenarioCardProps {
  scenario: ScenarioWithModel
  index: number
}

export default function ScenarioCard({ scenario, index }: ScenarioCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useGameStore()
  const params = useParams()
  const locale = (params.locale as string) || 'fr'
  const t = useTranslations('scenario')
  const tc = useTranslations('common')
  
  const hasHard = scenario.actions?.some(a => a.is_hard)
  
  const phase1 = scenario.phases?.find(p => p.phase_number === 1)
  const previewVideo = phase1?.video_loops?.find(v => v.is_default)?.video_url || phase1?.video_loops?.[0]?.video_url

  const handleLaunch = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <Link href={`/${locale}/scenario/${scenario.id}`} className="block relative" onClick={handleLaunch}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 * index }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative aspect-[2/3] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-500 hover:border-pink-500/50 hover:shadow-pink-500/20"
      >
        {/* Media Container */}
        <div className="absolute inset-0">
          {previewVideo ? (
            <div className="absolute inset-0">
              <video
                src={previewVideo}
                autoPlay
                muted
                loop
                playsInline
                className={`w-full h-full object-cover scale-105 transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 group-hover:opacity-100'}`}
              />
              {!isHovered && scenario.thumbnail_url && (
                <img 
                  src={scenario.thumbnail_url} 
                  alt={scenario.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
                />
              )}
            </div>
          ) : scenario.thumbnail_url ? (
            <img 
              src={scenario.thumbnail_url} 
              alt={scenario.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-orange-500/20">
              <span className="text-8xl font-black text-white/10">{scenario.model?.name?.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Badges */}
        <div className="absolute top-5 right-5 flex flex-col gap-2 items-end z-20">
          {scenario.is_premium && (
            <Badge variant="premium" className="bg-yellow-500 text-black border-none font-black text-[10px] uppercase tracking-wider px-3 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-3 sm:space-y-4 z-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tighter group-hover:text-pink-500 transition-colors">
                {scenario.model?.name}
              </h3>
              <span className="text-xs sm:text-sm font-bold text-white/40">{scenario.model?.age} {tc('years')}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white tracking-wide line-clamp-1">
              {getTitle(scenario, locale)}
            </p>
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {getDescription(scenario, locale)}
          </p>

          {/* CTA Button */}
          <div className="pt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-2xl shadow-pink-500/40">
              <Play className="w-4 h-4 fill-white" />
              {t('launch')}
            </div>
          </div>
        </div>
      </motion.div>
      </Link>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
      />
    </>
  )
}

