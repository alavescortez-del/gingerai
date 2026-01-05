'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop, Model } from '@/types/database'
import { Heart, MessageCircle, Play, ArrowLeft, MessageSquare, Sparkles, ImageIcon, Film, X, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Fonction pour mélanger un tableau (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
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
      
      {/* Play/Pause overlay au centre */}
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
      
      {/* Progress bar minimaliste en bas */}
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

// Composant pour afficher la description avec "voir plus"
function CaptionText({ name, caption }: { name: string, caption: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = caption.length > 100

  return (
    <p className="text-sm text-zinc-300 mt-1">
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

export default function ModelProfilePage() {
  const t = useTranslations('sweetspot')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const modelId = params.modelId as string
  
  const [model, setModel] = useState<Model | null>(null)
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDropIndex, setSelectedDropIndex] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pops'>('all')

  const isPremium = userPlan === 'soft' || userPlan === 'unleashed'
  const FREE_POSTS_LIMIT = 3

  // Filtrer selon l'onglet actif
  const displayedDrops = activeTab === 'all' 
    ? drops 
    : drops.filter(d => d.media_type === 'video')

  const selectedDrop = selectedDropIndex !== null ? displayedDrops[selectedDropIndex] : null

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setIsAuthenticated(true)
        
        const { data: userData } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setUserPlan(userData.plan || 'free')
        }
      }

      const { data: modelData } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single()

      if (modelData) setModel(modelData)

      const { data: dropsData } = await supabase
        .from('drops')
        .select('*')
        .eq('model_id', modelId)

      if (dropsData && user) {
        const { data: likes } = await supabase
          .from('drop_likes')
          .select('drop_id')
          .eq('user_id', user.id)

        const likedDropIds = new Set(likes?.map(l => l.drop_id) || [])
        
        // Séparer les épinglés du reste, mélanger le reste
        const pinnedDrops = dropsData.filter(d => d.is_pinned).map(drop => ({
          ...drop,
          is_liked: likedDropIds.has(drop.id)
        }))
        const otherDrops = shuffleArray(dropsData.filter(d => !d.is_pinned).map(drop => ({
          ...drop,
          is_liked: likedDropIds.has(drop.id)
        })))
        
        setDrops([...pinnedDrops, ...otherDrops])
      } else if (dropsData) {
        // Séparer les épinglés du reste, mélanger le reste
        const pinnedDrops = dropsData.filter(d => d.is_pinned)
        const otherDrops = shuffleArray(dropsData.filter(d => !d.is_pinned))
        setDrops([...pinnedDrops, ...otherDrops])
      }

      setLoading(false)
    }

    fetchData()
  }, [modelId])

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedDropIndex === null) return
      
      if (e.key === 'ArrowLeft') {
        navigatePrev()
      } else if (e.key === 'ArrowRight') {
        navigateNext()
      } else if (e.key === 'Escape') {
        setSelectedDropIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDropIndex, displayedDrops.length])

  const navigateNext = useCallback(() => {
    if (selectedDropIndex === null) return
    const nextIndex = selectedDropIndex + 1
    if (nextIndex < displayedDrops.length) {
      const isNextLocked = !isPremium && nextIndex >= FREE_POSTS_LIMIT
      if (!isNextLocked) {
        setSelectedDropIndex(nextIndex)
      }
    }
  }, [selectedDropIndex, displayedDrops.length, isPremium])

  const navigatePrev = useCallback(() => {
    if (selectedDropIndex === null) return
    const prevIndex = selectedDropIndex - 1
    if (prevIndex >= 0) {
      setSelectedDropIndex(prevIndex)
    }
  }, [selectedDropIndex])

  const handleLike = async (dropId: string) => {
    if (!userId) return

    const drop = drops.find(d => d.id === dropId)
    if (!drop) return

    if (drop.is_liked) {
      await supabase
        .from('drop_likes')
        .delete()
        .eq('drop_id', dropId)
        .eq('user_id', userId)

      setDrops(drops.map(d => 
        d.id === dropId 
          ? { ...d, is_liked: false, likes_count: d.likes_count - 1 }
          : d
      ))
    } else {
      await supabase
        .from('drop_likes')
        .insert({ drop_id: dropId, user_id: userId })

      setDrops(drops.map(d => 
        d.id === dropId 
          ? { ...d, is_liked: true, likes_count: d.likes_count + 1 }
          : d
      ))
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950/50 via-fuchsia-950/30 to-black">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950/50 via-fuchsia-950/30 to-black flex items-center justify-center">
        <p className="text-zinc-500">Model not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950/50 via-fuchsia-950/30 to-black">
      {/* Header avec retour */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-rose-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/sweetspot`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="font-black text-white">SweetSpot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-8"
        >
          {/* Glow effect - hidden on mobile */}
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="hidden md:block absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          
          {/* Mobile Layout: 2 colonnes */}
          <div className="relative flex md:hidden items-center gap-4">
            <div className="shrink-0 w-[72px] h-[72px] rounded-full border-2 border-white/20 overflow-hidden">
              <Image
                src={model.avatar_url}
                alt={model.name}
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-lg font-black text-white truncate">{model.name}</h1>
                <Link
                  href={`/${locale}/dm/${model.id}`}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 transition-colors text-pink-400 text-xs font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  DM
                </Link>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span><strong className="text-white">{drops.length}</strong> <span className="text-white/50">posts</span></span>
                <span><strong className="text-white">{formatCount(model.followers_count || 0)}</strong> <span className="text-white/50">fans</span></span>
                <span><strong className="text-pink-400">{formatCount(drops.reduce((acc, d) => acc + d.likes_count, 0))}</strong> <span className="text-white/50">❤️</span></span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="relative hidden md:flex items-center gap-8">
            <div className="shrink-0 w-[136px] h-[136px] rounded-full border-2 border-white/20 overflow-hidden">
              <Image
                src={model.avatar_url}
                alt={model.name}
                width={136}
                height={136}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{model.name}</h1>
                <Link
                  href={`/${locale}/dm/${model.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  DM
                </Link>
              </div>
              <div className="flex items-center gap-5 mb-3 text-sm">
                <span><strong className="text-white">{drops.length}</strong> <span className="text-white/60">publications</span></span>
                <span><strong className="text-white">{formatCount(model.followers_count || 0)}</strong> <span className="text-white/60">fans</span></span>
                <span><strong className="text-pink-400">{formatCount(drops.reduce((acc, d) => acc + d.likes_count, 0))}</strong> <span className="text-white/60">j'aime</span></span>
              </div>
              {model.bio && (
                <p className="text-white/70 text-sm max-w-lg">{model.bio}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Publications
            <span className="text-xs opacity-70">({drops.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pops')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'pops' 
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            POPS
            <span className="text-xs opacity-70">({drops.filter(d => d.media_type === 'video').length})</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {displayedDrops.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              {activeTab === 'all' ? (
                <ImageIcon className="w-12 h-12 text-pink-400" />
              ) : (
                <Film className="w-12 h-12 text-purple-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'all' ? 'Aucune publication' : 'Aucun POPS'}
            </h3>
            <p className="text-white/50">
              {model.name} n'a pas encore partagé de {activeTab === 'all' ? 'contenu' : 'vidéo'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {displayedDrops.map((drop, index) => {
              const isLocked = !isPremium && index >= FREE_POSTS_LIMIT
              const canClick = isAuthenticated && (isPremium || index < FREE_POSTS_LIMIT)
              
              return (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className={`relative aspect-[3/4] group ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push(`/${locale}?auth=register`)
                    } else if (canClick) {
                      setSelectedDropIndex(index)
                    } else {
                      router.push(`/${locale}/subscriptions`)
                    }
                  }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/50 to-purple-500/50 p-[1px] ${isLocked ? 'blur-lg' : ''}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-900">
                      {drop.media_type === 'video' ? (
                        <>
                          <video
                            src={drop.media_url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => !isLocked && e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                          />
                          <div className="absolute top-3 right-3 bg-purple-500 p-2 rounded-xl shadow-lg">
                            <Play className="w-4 h-4 text-white" fill="white" />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={drop.media_url}
                          alt={drop.caption || 'Drop'}
                          fill
                          className="object-cover"
                        />
                      )}

                      {/* Hover Overlay */}
                      {canClick && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-white">
                              <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
                              <span className="font-bold text-sm">{formatCount(drop.likes_count)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white">
                              <MessageCircle className="w-5 h-5 text-blue-400" />
                              <span className="font-bold text-sm">{formatCount(drop.comments_count)}</span>
                            </div>
                          </div>
                          {drop.caption && (
                            <p className="text-white/80 text-xs mt-2 line-clamp-2">{drop.caption}</p>
                          )}
                        </div>
                      )}

                      {/* Pinned */}
                      {drop.is_pinned && !isLocked && (
                        <div className="absolute top-3 left-3 bg-amber-500 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          📌
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-bold text-sm">Premium</p>
                    </div>
                  )}

                  {/* Not authenticated overlay */}
                  {!isAuthenticated && !isLocked && (
                    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-sm text-center px-2">Inscris-toi pour voir</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full Screen Modal with Navigation */}
      <AnimatePresence>
        {selectedDrop && selectedDropIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950/95 via-fuchsia-950/95 to-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setSelectedDropIndex(null)}
          >
            {/* Glow effects */}
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close button - hidden on mobile */}
            <button 
              onClick={() => setSelectedDropIndex(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-colors hidden md:block"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Swipe indicator on mobile */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 md:hidden">
              <div className="w-10 h-1 bg-white/40 rounded-full" />
            </div>

            {/* Navigation Previous - hidden on mobile */}
            {selectedDropIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-pink-500/30 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 hidden md:block"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Navigation Next - hidden on mobile */}
            {selectedDropIndex < displayedDrops.length - 1 && (isPremium || selectedDropIndex + 1 < FREE_POSTS_LIMIT) && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-pink-500/30 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 hidden md:block"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Content - Swipeable on mobile */}
            <motion.div
              key={selectedDrop.id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.3, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                const canGoNext = selectedDropIndex !== null && selectedDropIndex < displayedDrops.length - 1 && (isPremium || selectedDropIndex + 1 < FREE_POSTS_LIMIT)
                // Swipe up = next video
                if (info.offset.y < -80 && canGoNext) {
                  setSelectedDropIndex(selectedDropIndex + 1)
                }
                // Swipe down = previous video or close if first
                else if (info.offset.y > 80) {
                  if (selectedDropIndex !== null && selectedDropIndex > 0) {
                    setSelectedDropIndex(selectedDropIndex - 1)
                  } else {
                    setSelectedDropIndex(null)
                  }
                }
              }}
              className="relative w-full max-w-lg mx-auto h-full flex flex-col"
              style={{ touchAction: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500">
                  <Image
                    src={model.avatar_url}
                    alt={model.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{model.name}</p>
                </div>
                {/* Counter */}
                <span className="text-white/50 text-sm">
                  {selectedDropIndex + 1} / {isPremium ? displayedDrops.length : Math.min(displayedDrops.length, FREE_POSTS_LIMIT)}
                </span>
              </div>

              {/* Media */}
              <div className="flex-1 flex items-center justify-center min-h-0 px-4">
                {selectedDrop.media_type === 'video' ? (
                  <InstaVideoPlayer src={selectedDrop.media_url} />
                ) : (
                  <div className="relative w-full h-full max-h-[70vh]">
                    <Image
                      src={selectedDrop.media_url}
                      alt={selectedDrop.caption || 'Drop'}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 shrink-0 max-h-[30vh] overflow-y-auto">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => handleLike(selectedDrop.id)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart 
                      className={`w-7 h-7 ${selectedDrop.is_liked ? 'text-red-500' : 'text-white'}`}
                      fill={selectedDrop.is_liked ? 'currentColor' : 'none'}
                    />
                  </button>
                  <span className="text-sm font-bold text-white">
                    {formatCount(selectedDrop.likes_count)} {t('likes')}
                  </span>
                </div>
                {selectedDrop.caption && (
                  <CaptionText 
                    name={model.name} 
                    caption={selectedDrop.caption} 
                  />
                )}
                {selectedDrop.tags && selectedDrop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDrop.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
