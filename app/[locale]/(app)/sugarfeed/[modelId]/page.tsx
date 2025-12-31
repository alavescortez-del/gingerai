'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop, Model } from '@/types/database'
import { Heart, MessageCircle, Play, Grid3X3, ArrowLeft, MessageSquare, Users, Verified } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ModelProfilePage() {
  const t = useTranslations('sugarfeed')
  const params = useParams()
  const locale = params.locale as string
  const modelId = params.modelId as string
  
  const [model, setModel] = useState<Model | null>(null)
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'grid' | 'reels'>('grid')

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // Fetch model
      const { data: modelData } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single()

      if (modelData) setModel(modelData)

      // Fetch drops for this model
      const { data: dropsData } = await supabase
        .from('drops')
        .select('*')
        .eq('model_id', modelId)
        .order('is_pinned', { ascending: false })
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
  }, [modelId])

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
      if (selectedDrop?.id === dropId) {
        setSelectedDrop({ ...selectedDrop, is_liked: false, likes_count: selectedDrop.likes_count - 1 })
      }
    } else {
      await supabase
        .from('drop_likes')
        .insert({ drop_id: dropId, user_id: userId })

      setDrops(drops.map(d => 
        d.id === dropId 
          ? { ...d, is_liked: true, likes_count: d.likes_count + 1 }
          : d
      ))
      if (selectedDrop?.id === dropId) {
        setSelectedDrop({ ...selectedDrop, is_liked: true, likes_count: selectedDrop.likes_count + 1 })
      }
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const imageDrops = drops.filter(d => d.media_type === 'image')
  const videoDrops = drops.filter(d => d.media_type === 'video')
  const displayedDrops = activeTab === 'grid' ? imageDrops : videoDrops

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Model not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/sugarfeed`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-lg font-bold text-white">{model.name}</h1>
            <Verified className="w-5 h-5 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 rounded-full" />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-black overflow-hidden">
              <Image
                src={model.avatar_url}
                alt={model.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <h2 className="text-2xl font-bold text-white">{model.name}</h2>
              <Verified className="w-6 h-6 text-pink-500" />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-8 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{drops.length}</p>
                <p className="text-xs text-zinc-500">{t('posts')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{formatCount(model.followers_count || 0)}</p>
                <p className="text-xs text-zinc-500">{t('followers')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{formatCount(drops.reduce((acc, d) => acc + d.likes_count, 0))}</p>
                <p className="text-xs text-zinc-500">{t('likes')}</p>
              </div>
            </div>

            {/* Bio */}
            {model.bio && (
              <p className="text-sm text-zinc-300 mb-4 max-w-md">{model.bio}</p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Link
                href={`/${locale}/dm/${model.id}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
              >
                <MessageSquare className="w-4 h-4" />
                {t('message')}
              </Link>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors">
                <Users className="w-4 h-4" />
                {t('follow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === 'grid' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">{t('posts')}</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === 'reels' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Play className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Dropsy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-1 py-1">
        {displayedDrops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              {activeTab === 'grid' ? (
                <Grid3X3 className="w-10 h-10 text-zinc-600" />
              ) : (
                <Play className="w-10 h-10 text-zinc-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'grid' ? t('noPosts') : t('noReels')}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayedDrops.map((drop, index) => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedDrop({ ...drop, model })}
              >
                <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Heart className="w-5 h-5" fill="white" />
                    <span>{formatCount(drop.likes_count)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <MessageCircle className="w-5 h-5" fill="white" />
                    <span>{formatCount(drop.comments_count)}</span>
                  </div>
                </div>

                {/* Pinned indicator */}
                {drop.is_pinned && (
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs text-white">📌</span>
                  </div>
                )}
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
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={model.avatar_url}
                  alt={model.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{model.name}</p>
                  <Verified className="w-4 h-4 text-pink-500" />
                </div>
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
                  <span className="font-bold text-white mr-2">{model.name}</span>
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

