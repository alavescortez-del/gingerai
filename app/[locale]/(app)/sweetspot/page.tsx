'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop } from '@/types/database'
import { Heart, MessageCircle, Play, Grid3X3, Lock, ChevronLeft, ChevronRight, X } from 'lucide-react'
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

// Composant vidéo avec autoplay contrôlé (pour la grille)
function VideoThumbnail({ src, shouldPlay, isLocked }: { src: string, shouldPlay: boolean, isLocked: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    if (!videoRef.current || isLocked) return
    
    if (shouldPlay || isHovered) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [shouldPlay, isHovered, isLocked])
  
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
        <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
      </div>
    </>
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

export default function SweetSpotPage() {
  const t = useTranslations('sweetspot')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDropIndex, setSelectedDropIndex] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

  const isPremium = userPlan === 'soft' || userPlan === 'unleashed'
  const FREE_POSTS_LIMIT = 3

  const selectedDrop = selectedDropIndex !== null ? drops[selectedDropIndex] : null
  
  // Animation automatique de 2-3 vidéos random
  useEffect(() => {
    if (drops.length === 0) return
    
    const videoDrops = drops.filter(d => d.media_type === 'video')
    if (videoDrops.length === 0) return
    
    const selectRandomVideos = () => {
      const count = Math.min(2 + Math.floor(Math.random() * 2), videoDrops.length) // 2-3 vidéos
      const shuffled = shuffleArray(videoDrops)
      const selected = shuffled.slice(0, count).map(d => d.id)
      setPlayingVideos(new Set(selected))
    }
    
    selectRandomVideos()
    const interval = setInterval(selectRandomVideos, 4000) // Change toutes les 4 secondes
    
    return () => clearInterval(interval)
  }, [drops])

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

      const { data: dropsData } = await supabase
        .from('drops')
        .select(`
          *,
          model:models(*)
        `)

      if (dropsData && user) {
        const { data: likes } = await supabase
          .from('drop_likes')
          .select('drop_id')
          .eq('user_id', user.id)

        const likedDropIds = new Set(likes?.map(l => l.drop_id) || [])
        
        // Mélanger aléatoirement les drops
        const shuffledDrops = shuffleArray(dropsData.map(drop => ({
          ...drop,
          is_liked: likedDropIds.has(drop.id)
        })))
        setDrops(shuffledDrops)
      } else if (dropsData) {
        // Mélanger aléatoirement les drops
        setDrops(shuffleArray(dropsData))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

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
  }, [selectedDropIndex, drops.length])

  const navigateNext = useCallback(() => {
    if (selectedDropIndex === null) return
    const nextIndex = selectedDropIndex + 1
    if (nextIndex < drops.length) {
      // Vérifier si le prochain est accessible
      const isNextLocked = !isPremium && nextIndex >= FREE_POSTS_LIMIT
      if (!isNextLocked) {
        setSelectedDropIndex(nextIndex)
      }
    }
  }, [selectedDropIndex, drops.length, isPremium])

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950/50 via-black to-black">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-rose-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Sweet<span className="text-pink-400">Spot</span>
            </h1>
            <p className="text-sm text-white/60 mt-1">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {drops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Grid3X3 className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('empty.title')}</h3>
            <p className="text-zinc-500">{t('empty.description')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-3">
            {drops.map((drop, index) => {
              const isLocked = !isPremium && index >= FREE_POSTS_LIMIT
              const canClick = isAuthenticated && (isPremium || index < FREE_POSTS_LIMIT)
              
              return (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
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
                  {/* Media */}
                  <div className={`absolute inset-0 bg-zinc-900 rounded-lg overflow-hidden ${isLocked ? 'blur-lg' : ''}`}>
                    {drop.media_type === 'video' ? (
                      <VideoThumbnail 
                        src={drop.media_url} 
                        shouldPlay={playingVideos.has(drop.id)} 
                        isLocked={isLocked} 
                      />
                    ) : (
                      <Image
                        src={drop.media_url}
                        alt={drop.caption || 'Drop'}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-bold text-sm">Premium</p>
                    </div>
                  )}

                  {/* Not authenticated overlay */}
                  {!isAuthenticated && !isLocked && (
                    <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-sm text-center px-2">Inscris-toi pour voir</p>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {canClick && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Heart className="w-6 h-6" fill="white" />
                        <span>{formatCount(drop.likes_count)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-bold">
                        <MessageCircle className="w-6 h-6" fill="white" />
                        <span>{formatCount(drop.comments_count)}</span>
                      </div>
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
            {selectedDropIndex < drops.length - 1 && (isPremium || selectedDropIndex + 1 < FREE_POSTS_LIMIT) && (
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
                const canGoNext = selectedDropIndex !== null && selectedDropIndex < drops.length - 1 && (isPremium || selectedDropIndex + 1 < FREE_POSTS_LIMIT)
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
                <Link href={`/${locale}/sweetspot/${selectedDrop.model_id}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500">
                    <Image
                      src={selectedDrop.model?.avatar_url || ''}
                      alt={selectedDrop.model?.name || ''}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1">
                  <Link href={`/${locale}/sweetspot/${selectedDrop.model_id}`}>
                    <p className="font-bold text-white hover:underline">{selectedDrop.model?.name}</p>
                  </Link>
                </div>
                {/* Counter */}
                <span className="text-white/50 text-sm">
                  {selectedDropIndex + 1} / {isPremium ? drops.length : Math.min(drops.length, FREE_POSTS_LIMIT)}
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
                    name={selectedDrop.model?.name || ''} 
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
