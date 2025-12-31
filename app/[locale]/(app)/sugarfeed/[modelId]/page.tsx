'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Drop, Model } from '@/types/database'
import { Heart, MessageCircle, Play, ArrowLeft, MessageSquare, Sparkles, ImageIcon, Film, X } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'all' | 'dropsy'>('all')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

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
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (dropsData && user) {
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

  // Publications = tout, Dropsy = vidéos uniquement
  const videoDrops = drops.filter(d => d.media_type === 'video')
  const displayedDrops = activeTab === 'all' ? drops : videoDrops

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950/50 via-fuchsia-950/30 to-black flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
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
            <Link href={`/${locale}/sugarfeed`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="font-black text-white">SugarFeed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8"
        >
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Avatar avec glow */}
            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 rounded-full blur-md opacity-60" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                <Image
                  src={model.avatar_url}
                  alt={model.name}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Badge vérifié */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                <span className="text-sm">✓</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{model.name}</h1>
              
              {model.bio && (
                <p className="text-white/70 text-sm mb-4 max-w-lg">{model.bio}</p>
              )}

              {/* Stats Pills */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <span className="font-black text-white">{drops.length}</span>
                  <span className="text-white/60 ml-1 text-sm">posts</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <span className="font-black text-white">{formatCount(model.followers_count || 0)}</span>
                  <span className="text-white/60 ml-1 text-sm">fans</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-pink-500/20 backdrop-blur-sm border border-pink-500/30">
                  <span className="font-black text-pink-400">{formatCount(drops.reduce((acc, d) => acc + d.likes_count, 0))}</span>
                  <span className="text-pink-400/70 ml-1 text-sm">❤️</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href={`/${locale}/dm/${model.id}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
              >
                <MessageSquare className="w-5 h-5" />
                Discuter avec {model.name}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs style Sugarush */}
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
            onClick={() => setActiveTab('dropsy')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'dropsy' 
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            Dropsy
            <span className="text-xs opacity-70">({videoDrops.length})</span>
          </button>
        </div>
      </div>

      {/* Grid avec style unique */}
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
              {activeTab === 'all' ? 'Aucune publication' : 'Aucun Dropsy'}
            </h3>
            <p className="text-white/50">
              {model.name} n'a pas encore partagé de {activeTab === 'all' ? 'contenu' : 'vidéo'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {displayedDrops.map((drop, index) => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedDrop({ ...drop, model })}
              >
                {/* Card avec bordure dégradée */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/50 to-purple-500/50 p-[1px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-900">
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
                        {/* Badge vidéo */}
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

                    {/* Hover Overlay avec stats */}
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

                    {/* Pinned */}
                    {drop.is_pinned && (
                      <div className="absolute top-3 left-3 bg-amber-500 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        📌
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Drop */}
      {selectedDrop && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedDrop(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-lg w-full rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl" />
            <div className="relative m-[2px] bg-zinc-900 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500">
                    <Image
                      src={model.avatar_url}
                      alt={model.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white">{model.name}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(selectedDrop.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDrop(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
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
                      className={`w-7 h-7 ${selectedDrop.is_liked ? 'text-pink-500' : 'text-white'}`}
                      fill={selectedDrop.is_liked ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button className="transition-transform hover:scale-110">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </button>
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  {formatCount(selectedDrop.likes_count)} j'aime
                </p>
                {selectedDrop.caption && (
                  <p className="text-sm text-zinc-300">
                    <span className="font-bold text-white mr-2">{model.name}</span>
                    {selectedDrop.caption}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
