'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'

export default function DashboardPage() {
  const { credits, user } = useGameStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    scenariosCompleted: 0,
    contactsUnlocked: 0,
    messagesCount: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Scénarios terminés
      const { count: scenariosCount } = await supabase
        .from('user_scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('is_completed', true)

      // Contacts débloqués
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)

      // Messages envoyés
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')

      setStats({
        scenariosCompleted: scenariosCount || 0,
        contactsUnlocked: contactsCount || 0,
        messagesCount: messagesCount || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-black text-white mb-2">
          Mon Compte
        </h1>
        <p className="text-zinc-400">
          Gère ton abonnement et tes paramètres
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="text-5xl font-black gradient-text mb-2">
            {stats.scenariosCompleted}
          </div>
          <p className="text-zinc-400">Scénarios terminés</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="text-5xl font-black gradient-text mb-2">
            {stats.contactsUnlocked}
          </div>
          <p className="text-zinc-400">Contacts débloqués</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="text-5xl font-black gradient-text mb-2">
            {stats.messagesCount}
          </div>
          <p className="text-zinc-400">Messages envoyés</p>
        </motion.div>
      </div>

      {/* Account Management */}
      <div className="space-y-6">
        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Crédits Premium</h2>
              <p className="text-zinc-400">Utilise tes Piments pour débloquer du contenu exclusif</p>
            </div>
            <div className="text-5xl font-black gradient-text flex items-center gap-2">
              {credits} <span className="text-3xl">🌶️</span>
            </div>
          </div>
          <Link 
            href="/credits"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:scale-105 transition-transform"
          >
            Recharger
          </Link>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-black text-white mb-4">Abonnement</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white mb-1">
                {user?.plan === 'unleashed' ? 'Unleashed' : user?.plan === 'soft' ? 'Soft' : 'Gratuit'}
              </p>
              <p className="text-zinc-400 text-sm">
                {user?.plan === 'unleashed' 
                  ? 'Accès illimité à tout le contenu' 
                  : 'Passe à Unleashed pour débloquer tout'}
              </p>
            </div>
            {user?.plan !== 'unleashed' && (
              <Link 
                href="/subscriptions"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:scale-105 transition-transform"
              >
                Améliorer
              </Link>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-black text-white mb-6">Actions rapides</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link 
              href="/scenarios"
              className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-bold"
            >
              🎬 Voir les scénarios
            </Link>
            <Link 
              href="/contacts"
              className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-bold"
            >
              💬 Mes contacts
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
