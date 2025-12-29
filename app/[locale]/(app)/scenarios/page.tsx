'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, Flame, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import ScenarioCard from '@/components/scenario/ScenarioCard'
import { Scenario, Model, Phase, VideoLoop, Action } from '@/types/database'

interface ScenarioWithModel extends Scenario {
  model: Model
  actions: Action[]
  phases: (Phase & { video_loops: VideoLoop[] })[]
}

export default function ScenariosPage() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<ScenarioWithModel[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
    fetchScenarios()
  }, [])
  
  // Check auth but don't redirect (allow browsing)
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const fetchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select(`
          *,
          model:models(*),
          actions(*),
          phases(*, video_loops(*))
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setScenarios(data as any)
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-ginger-primary/30 border-t-ginger-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ginger-dark relative overflow-hidden">
      {/* Background Glows pour l'immersion */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-20 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight">
              Choisis ton <span className="gradient-text">Destin</span>
            </h1>
            <p className="text-zinc-400 text-lg lg:text-xl max-w-2xl mx-auto font-medium">
              Chaque scénario est une porte ouverte sur tes désirs les plus fous.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        {scenarios.length === 0 ? (
          <div className="text-center py-32 glass rounded-[40px] border border-white/5">
            <Flame className="w-20 h-20 text-pink-500/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">Bientôt disponible</h3>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 gap-6 md:gap-8 lg:gap-12 pb-8 md:pb-0">
            {scenarios.map((scenario, index) => (
              <div key={scenario.id} className="min-w-[85%] md:min-w-0 snap-center">
                <ScenarioCard scenario={scenario} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

