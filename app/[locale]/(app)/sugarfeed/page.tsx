'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop } from '@/types/database'
import { Heart, MessageCircle, Play, Grid3X3, Lock, Gem } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SugarFeedPage() {
  const t = useTranslations('sugarfeed')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const isPremium = userPlan === 'soft' || userPlan === 'unleashed'
  const FREE_POSTS_LIMIT = 3

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setIsAuthenticated(true)
        
        // Get user plan
        const { data: userData } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setUserPlan(userData.plan || 'free')
        }
      }

      // Fetch all drops with model info
      const { data: dropsData } = await supabase
        .from('drops')
        .select(`
          *,
          model:models(*)
        `)
        .order('created_at', { ascending: false })

      if (dropsData && user) {
        // Check which drops are liked by current user
        const { data: likes } = await supabase
          .from('drop_likes')
          .select('drop_id')
          .eq('user_id', user.id)

        const likedDropIds = new Set(likes?.map(l => l.drop_id) || [])
        
        setDrops(dropsData.map(drop => ({
          ...drop,
          is_liked: likedDropIds.has(drop.id)
        })))
      } else if (dropsData) {
        setDrops(dropsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLike = async (dropId: string) => {
    if (!userId) return

    const drop = drops.find(d => d.id === dropId)
    if (!drop) return

    if (drop.is_liked) {
      // Unlike
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
      // Like
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
              Sugar<span className="text-pink-400">Feed</span>
            </h1>
            <p className="text-sm text-white/60 mt-1">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Feed Grid - Masonry Style */}
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
                  transition={{ delay: index * 0.05 }}
                  className={`relative aspect-[3/4] group ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push(`/${locale}?auth=register`)
                    } else if (canClick) {
                      setSelectedDrop(drop)
                    } else {
                      router.push(`/${locale}/subscriptions`)
                    }
                  }}
                >
                  {/* Media */}
                  <div className={`absolute inset-0 bg-zinc-900 rounded-lg overflow-hidden ${isLocked ? 'blur-lg' : ''}`}>
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
                        <div className="absolute top-2 right-2">
                          <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
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
                  </div>

                  {/* Lock Overlay for non-premium */}
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

                  {/* Hover Overlay (only for accessible posts) */}
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

      {/* Drop Modal */}
      {selectedDrop && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedDrop(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm md:max-w-md bg-zinc-900 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-white/10 shrink-0">
              <Link href={`/${locale}/sugarfeed/${selectedDrop.model_id}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={selectedDrop.model?.avatar_url || ''}
                    alt={selectedDrop.model?.name || ''}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/${locale}/sugarfeed/${selectedDrop.model_id}`}>
                  <p className="font-bold text-white text-sm hover:underline">{selectedDrop.model?.name}</p>
                </Link>
              </div>
              <button 
                onClick={() => setSelectedDrop(null)}
                className="text-white/60 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Media - avec hauteur limitée */}
            <div className="relative flex-1 min-h-0">
              <div className="relative w-full h-full max-h-[60vh]">
                {selectedDrop.media_type === 'video' ? (
                  <video
                    src={selectedDrop.media_url}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <Image
                    src={selectedDrop.media_url}
                    alt={selectedDrop.caption || 'Drop'}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handleLike(selectedDrop.id)}
                  className="transition-transform hover:scale-110"
                >
                  <Heart 
                    className={`w-6 h-6 ${selectedDrop.is_liked ? 'text-red-500' : 'text-white'}`}
                    fill={selectedDrop.is_liked ? 'currentColor' : 'none'}
                  />
                </button>
                <button className="transition-transform hover:scale-110">
                  <MessageCircle className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-xs font-bold text-white">
                {formatCount(selectedDrop.likes_count)} {t('likes')}
              </p>
              {selectedDrop.caption && (
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                  <span className="font-bold text-white mr-1">{selectedDrop.model?.name}</span>
                  {selectedDrop.caption}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

