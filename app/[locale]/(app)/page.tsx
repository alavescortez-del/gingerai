'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Scenario, Model, Drop } from '@/types/database'
import ScenarioCard from '@/components/scenario/ScenarioCard'
import AuthModal from '@/components/auth/AuthModal'
import { useGameStore } from '@/lib/stores/gameStore'
import { getDescription } from '@/lib/i18n-helpers'
import { Play, Sparkles, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface ScenarioWithModel extends Scenario {
  model: Model
  actions: any[]
  phases: any[]
}

interface DropWithModel extends Drop {
  model?: Model
}

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Composant vidéo POPS pour la grille
function PopsVideo({ src, isAnimating }: { src: string, isAnimating: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    if (!videoRef.current) return
    
    if (isAnimating || isHovered) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isAnimating, isHovered])
  
  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <div className="absolute top-2 right-2">
        <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
      </div>
    </>
  )
}

// Composant pour afficher la description avec "voir plus"
function CaptionText({ name, caption }: { name: string, caption: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = caption.length > 100

  return (
    <p className="text-sm text-zinc-300">
      <span className="font-bold text-white mr-1">{name}</span>
      {isLong && !expanded ? (
        <>
          {caption.slice(0, 100)}...
          <button 
            onClick={() => setExpanded(true)}
            className="text-zinc-500 ml-1 hover:text-white transition-colors"
          >
            voir plus
          </button>
        </>
      ) : (
        <>
          {caption}
          {isLong && (
            <button 
              onClick={() => setExpanded(false)}
              className="text-zinc-500 ml-1 hover:text-white transition-colors"
            >
              voir moins
            </button>
          )}
        </>
      )}
    </p>
  )
}

// Lecteur vidéo style Instagram (pour le modal)
function InstaVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showPlayIcon, setShowPlayIcon] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
    setShowPlayIcon(true)
    setTimeout(() => setShowPlayIcon(false), 600)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(percent)
  }

  return (
    <div 
      className="relative max-w-full max-h-full cursor-pointer" 
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-[70vh] object-contain rounded-lg"
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Play/Pause overlay */}
      <AnimatePresence>
        {showPlayIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              {isPlaying ? (
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              ) : (
                <div className="flex gap-1">
                  <div className="w-3 h-10 bg-white rounded-sm" />
                  <div className="w-3 h-10 bg-white rounded-sm" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}

const CAROUSEL_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=800&fit=crop', key: 'title1' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&h=800&fit=crop', key: 'title2' },
  { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=800&fit=crop', key: 'title3' },
]

// Composant Modal POPS avec Portal pour isolation complète du DOM
function PopsModal({ 
  selectedPop, 
  selectedPopIndex, 
  allPops, 
  onClose, 
  onPrev, 
  onNext,
  locale
}: { 
  selectedPop: DropWithModel | null, 
  selectedPopIndex: number | null, 
  allPops: DropWithModel[], 
  onClose: () => void,
  onPrev: () => void,
  onNext: () => void,
  locale: string
}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const isOpen = selectedPopIndex !== null && selectedPop !== null

  // Bloquer le scroll quand ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Ne rien rendre si pas monté ou pas ouvert
  if (!mounted || !isOpen || !selectedPop) return null

  return createPortal(
    <div 
      className="fixed inset-0 bg-gradient-to-b from-purple-950/95 via-fuchsia-950/95 to-black/95 backdrop-blur-xl flex items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
          {/* Glow effects */}
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button - hidden on mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-colors hidden md:block"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Previous - hidden on mobile */}
          {selectedPopIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/10 hover:bg-pink-500/30 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 hidden md:block"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Navigation Next - hidden on mobile */}
          {selectedPopIndex < allPops.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/10 hover:bg-pink-500/30 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 hidden md:block"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Content */}
          <div
            className="relative w-full max-w-lg mx-auto h-full flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 shrink-0">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <Link 
                href={`/${locale}/sweetspot/${selectedPop.model_id}`}
                onClick={onClose}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500">
                  <Image
                    src={selectedPop.model?.avatar_url || ''}
                    alt={selectedPop.model?.name || ''}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1">
                <Link 
                  href={`/${locale}/sweetspot/${selectedPop.model_id}`}
                  onClick={onClose}
                >
                  <p className="font-bold text-white hover:underline">{selectedPop.model?.name}</p>
                </Link>
              </div>
            </div>

            {/* Media */}
            <div className="flex-1 flex items-center justify-center min-h-0 px-4">
              <InstaVideoPlayer src={selectedPop.media_url} />
            </div>

            {/* Caption */}
            <div className="p-4 shrink-0 max-h-[30vh] overflow-y-auto">
              {selectedPop.caption && (
                <CaptionText 
                  name={selectedPop.model?.name || ''} 
                  caption={selectedPop.caption} 
                />
              )}
            </div>
          </div>
    </div>,
    document.body
  )
}

export default function HomePage() {
  const params = useParams()
  const locale = (params.locale as string) || 'fr'
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const [dbScenarios, setDbScenarios] = useState<ScenarioWithModel[]>([])
  const [dbModels, setDbModels] = useState<Model[]>([])
  const [latestPops, setLatestPops] = useState<DropWithModel[]>([])
  const [allPops, setAllPops] = useState<DropWithModel[]>([])
  const [animatingPops, setAnimatingPops] = useState<Set<string>>(new Set())
  const [selectedPopIndex, setSelectedPopIndex] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useGameStore()

  const selectedPop = selectedPopIndex !== null ? allPops[selectedPopIndex] : null

  // Navigation dans le modal
  const navigatePrev = useCallback(() => {
    if (selectedPopIndex !== null && selectedPopIndex > 0) {
      setSelectedPopIndex(selectedPopIndex - 1)
    }
  }, [selectedPopIndex])

  const navigateNext = useCallback(() => {
    if (selectedPopIndex !== null && selectedPopIndex < allPops.length - 1) {
      setSelectedPopIndex(selectedPopIndex + 1)
    }
  }, [selectedPopIndex, allPops.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPopIndex === null) return
      if (e.key === 'ArrowLeft') navigatePrev()
      if (e.key === 'ArrowRight') navigateNext()
      if (e.key === 'Escape') setSelectedPopIndex(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPopIndex, navigatePrev, navigateNext])

  useEffect(() => {
    fetchData()
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Animation aléatoire des POPS
  useEffect(() => {
    if (latestPops.length === 0) return
    
    const animateRandomPops = () => {
      const popIds = latestPops.map(p => p.id)
      const shuffled = shuffleArray(popIds)
      const toAnimate = new Set(shuffled.slice(0, 2))
      setAnimatingPops(toAnimate)
    }
    
    animateRandomPops()
    const interval = setInterval(animateRandomPops, 4000)
    return () => clearInterval(interval)
  }, [latestPops])

  const fetchData = async () => {
    try {
      // Fetch scenarios with models, actions and phases for the card
      const { data: scenData } = await supabase
        .from('scenarios')
        .select(`
          *, 
          model:models(*),
          actions(*),
          phases(*, video_loops(*))
        `)
        .limit(4)
        .order('created_at', { ascending: false })
      
      if (scenData) setDbScenarios(scenData as any)

      // Fetch models for free discussion - Filter out models already used in scenarios
      const scenarioModelIds = scenData?.map(s => s.model_id) || []
      
      let modelsQuery = supabase
        .from('models')
        .select('*')
      
      if (scenarioModelIds.length > 0) {
        modelsQuery = modelsQuery.not('id', 'in', `(${scenarioModelIds.join(',')})`)
      }

      const { data: modData } = await modelsQuery
        .limit(4)
        .order('created_at', { ascending: false })
      
      if (modData) setDbModels(modData as Model[])

      // Fetch ALL POPS (vidéos uniquement) avec modèle pour navigation
      const { data: popsData } = await supabase
        .from('drops')
        .select(`
          *,
          model:models(*)
        `)
        .eq('media_type', 'video')
        .order('created_at', { ascending: false })
      
      if (popsData) {
        // Mélanger pour affichage aléatoire
        const shuffledPops = shuffleArray(popsData as DropWithModel[])
        setAllPops(shuffledPops) // Tous les POPS pour la navigation
        setLatestPops(shuffledPops.slice(0, 6)) // 6 premiers pour l'affichage
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* SECTION 1: Hero Carousel */}
      <section className="relative h-[300px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={CAROUSEL_IMAGES[currentSlide].url}
              alt={t(`hero.${CAROUSEL_IMAGES[currentSlide].key}`)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 px-6 max-w-4xl">
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-black text-white"
            >
              {t(`hero.${CAROUSEL_IMAGES[currentSlide].key}`)}
            </motion.h1>
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-zinc-300"
            >
              {t(`hero.desc${currentSlide + 1}`)}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                href={`/${locale}/register`}
                className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl shadow-pink-500/50"
              >
                {t('hero.cta')}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-pink-500' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Scénarios Immersifs */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t('scenarios.title')}
          </h2>
          <p className="text-zinc-400 text-lg">
            {t('scenarios.subtitle')}
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 gap-6 md:gap-8 lg:gap-12 pb-8 md:pb-0">
          {dbScenarios.map((scenario, index) => (
            <div key={scenario.id} className="min-w-[85%] md:min-w-0 snap-center">
              <ScenarioCard scenario={scenario} index={index} />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: SweetSpot POPS */}
      {latestPops.length > 0 && (
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Link href={`/${locale}/sweetspot`} className="inline-flex items-center gap-3 group">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                SweetSpot
              </h2>
            </Link>
            <p className="text-zinc-400 text-lg mt-4">
              Les derniers POPS de tes modèles préférées 🔥
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {latestPops.map((pop, index) => (
              <motion.div
                key={pop.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button 
                  className="block relative aspect-[9/16] rounded-xl overflow-hidden group w-full"
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true)
                    } else {
                      // Trouver l'index dans allPops
                      const allPopsIndex = allPops.findIndex(p => p.id === pop.id)
                      setSelectedPopIndex(allPopsIndex !== -1 ? allPopsIndex : 0)
                    }
                  }}
                >
                  <PopsVideo 
                    src={pop.media_url} 
                    isAnimating={animatingPops.has(pop.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Model avatar */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    {pop.model?.avatar_url && (
                      <img 
                        src={pop.model.avatar_url} 
                        alt={pop.model.name || ''}
                        className="w-6 h-6 rounded-full border border-pink-500"
                      />
                    )}
                    <span className="text-white text-xs font-bold truncate">
                      {pop.model?.name}
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href={`/${locale}/sweetspot`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white font-bold hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault()
                  setShowAuthModal(true)
                }
              }}
            >
              <Sparkles className="w-5 h-5 text-pink-500" />
              Voir tout le SweetSpot
            </Link>
          </div>
        </section>
      )}

      {/* SECTION 4: Discuter Librement */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t('chat.title')}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t('chat.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {dbModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
              >
                <Link 
                  href={`/${locale}/dm/${model.id}`}
                  className="block glass rounded-3xl overflow-hidden group"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault()
                      setShowAuthModal(true)
                    }
                  }}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {model.show_video ? (
                      <div className="absolute inset-0">
                        <video
                          src={model.show_video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className={`w-full h-full object-cover scale-105 transition-all duration-700 ${hoveredModel === model.id ? 'opacity-100' : 'opacity-0 md:opacity-0 group-hover:opacity-100'}`}
                        />
                        {hoveredModel !== model.id && (
                          <img 
                            src={model.avatar_url} 
                            alt={model.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
                          />
                        )}
                      </div>
                    ) : (
                      <motion.img
                        src={model.avatar_url}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: hoveredModel === model.id ? 1.1 : 1
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  
                  <motion.div 
                    className="p-3 md:p-6"
                    animate={{
                      y: hoveredModel === model.id ? -10 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-sm md:text-2xl font-black text-white mb-1">
                      {model.name}, {model.age}
                    </h3>
                    
                    <div className="flex gap-2 mb-2 md:mb-3">
                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg bg-pink-500/20 text-pink-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        {tc('available')}
                      </span>
                    </div>
                    
                    <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 hidden md:block">
                      {getDescription(model, locale)}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">{t('features.ai.title')}</h3>
            <p className="text-zinc-400 text-sm">
              {t('features.ai.desc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">{t('features.content.title')}</h3>
            <p className="text-zinc-400 text-sm">
              {t('features.content.desc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">{t('features.privacy.title')}</h3>
            <p className="text-zinc-400 text-sm">
              {t('features.privacy.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: SEO Content */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t('seo.title')}
            </h2>
            <p className="text-xl text-zinc-400">
              {t('seo.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('seo.aiTitle')}
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                {t('seo.aiDesc')}
              </p>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('seo.freedomTitle')}
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                {t('seo.freedomDesc')}
              </p>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('seo.customTitle')}
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                {t('seo.customDesc')}
              </p>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('seo.progressTitle')}
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                {t('seo.progressDesc')}
              </p>
            </div>
          </div>

          <div className="text-center p-8 glass rounded-3xl">
            <p className="text-xl text-zinc-300 mb-6">
              {t('seo.progressCta')}
            </p>
            <p className="text-2xl font-black text-white">
              {t('seo.waitingForYou')} 🔥
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Immersion & Tech */}
      <section className="px-6 py-32 bg-gradient-to-b from-transparent to-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                {t('immersion.title')} <br />
                <span className="text-pink-500">{t('immersion.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                {t('immersion.desc')}
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('immersion.sound.title')}</h3>
                    <p className="text-zinc-400">{t('immersion.sound.desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('immersion.aiTech.title')}</h3>
                    <p className="text-zinc-400">{t('immersion.aiTech.desc')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[40px] overflow-hidden glass border-white/5"
            >
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" 
                alt="Technologie IA"
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-900/40" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="text-center space-y-6">
                  <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
                    Next-Gen Tech
                  </div>
                  <p className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    L&apos;avenir de la compagnie virtuelle est ici.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Final CTA (Simplified) */}
      <section className="px-6 py-32 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              {t('cta.title')}
            </h2>
            <p className="text-zinc-400 text-lg">{t('cta.subtitle')}</p>
          </div>
          
          <Link 
            href={`/${locale}/register`}
            className="inline-block px-12 py-5 rounded-full bg-white text-black text-lg font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-2xl shadow-white/10"
          >
            {t('cta.button')}
          </Link>
          
          <div className="flex flex-wrap justify-center gap-8 text-zinc-500 text-sm font-medium uppercase tracking-widest">
            <span>{t('cta.private')}</span>
            <span>{t('cta.noCommitment')}</span>
            <span>{t('cta.instant')}</span>
          </div>
        </motion.div>
      </section>

            {/* POPS Full Screen Modal */}
      <PopsModal 
        selectedPop={selectedPop}
        selectedPopIndex={selectedPopIndex}
        allPops={allPops}
        onClose={() => setSelectedPopIndex(null)}
        onPrev={navigatePrev}
        onNext={navigateNext}
        locale={locale}
      />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
      />
    </div>
  )
}
