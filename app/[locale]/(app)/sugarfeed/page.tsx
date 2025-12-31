'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop, Model } from '@/types/database'
import { Heart, MessageCircle, Play, Grid3X3, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SugarFeedPage() {
  const t = useTranslations('sugarfeed')
  const params = useParams()
  const locale = params.locale as string
  
  const [drops, setDrops] = useState<Drop[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // Fetch all models
      const { data: modelsData } = await supabase
        .from('models')
        .select('*')
        .order('name')

      if (modelsData) setModels(modelsData)

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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">SugarFeed</h1>
                <p className="text-xs text-zinc-500">{t('subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories / Models Row */}
      <div className="border-b border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/${locale}/sugarfeed/${model.id}`}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 rounded-full" />
                  <div className="relative w-16 h-16 rounded-full border-2 border-black overflow-hidden">
                    <Image
                      src={model.avatar_url}
                      alt={model.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-400 font-medium truncate max-w-[70px]">
                  {model.name}
                </span>
              </Link>
            ))}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
            {drops.map((drop, index) => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedDrop(drop)}
              >
                {/* Media */}
                <div className="absolute inset-0 bg-zinc-900 rounded-lg overflow-hidden">
                  {drop.media_type === 'video' ? (
                    <>
                      <video
                        src={drop.media_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
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

                {/* Hover Overlay */}
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

                {/* Model Avatar (bottom left) */}
                <Link
                  href={`/${locale}/sugarfeed/${drop.model_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2 left-2 z-10"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-lg">
                    <Image
                      src={drop.model?.avatar_url || ''}
                      alt={drop.model?.name || ''}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
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
            className="relative max-w-lg w-full bg-zinc-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Link href={`/${locale}/sugarfeed/${selectedDrop.model_id}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={selectedDrop.model?.avatar_url || ''}
                    alt={selectedDrop.model?.name || ''}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              </Link>
              <div>
                <Link href={`/${locale}/sugarfeed/${selectedDrop.model_id}`}>
                  <p className="font-bold text-white hover:underline">{selectedDrop.model?.name}</p>
                </Link>
                <p className="text-xs text-zinc-500">
                  {new Date(selectedDrop.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Media */}
            <div className="relative aspect-square">
              {selectedDrop.media_type === 'video' ? (
                <video
                  src={selectedDrop.media_url}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <Image
                  src={selectedDrop.media_url}
                  alt={selectedDrop.caption || 'Drop'}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={() => handleLike(selectedDrop.id)}
                  className="transition-transform hover:scale-110"
                >
                  <Heart 
                    className={`w-7 h-7 ${selectedDrop.is_liked ? 'text-red-500' : 'text-white'}`}
                    fill={selectedDrop.is_liked ? 'currentColor' : 'none'}
                  />
                </button>
                <button className="transition-transform hover:scale-110">
                  <MessageCircle className="w-7 h-7 text-white" />
                </button>
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {formatCount(selectedDrop.likes_count)} {t('likes')}
              </p>
              {selectedDrop.caption && (
                <p className="text-sm text-zinc-300">
                  <span className="font-bold text-white mr-2">{selectedDrop.model?.name}</span>
                  {selectedDrop.caption}
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                {t('viewComments', { count: selectedDrop.comments_count })}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

