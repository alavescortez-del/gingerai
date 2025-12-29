'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Vérifier si c'est un admin
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'admin') {
        router.push('/goodwin/dashboard')
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Vérifier le role admin
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Accès non autorisé')
      }

      router.push('/goodwin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
          <p className="text-zinc-400">Connexion sécurisée</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 glass p-8 rounded-3xl">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="admin@ginger.ai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black uppercase tracking-wider hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <Link href="/" className="block text-center text-sm text-zinc-500 hover:text-white transition-colors">
            ← Retour au site
          </Link>
        </form>
      </div>
    </div>
  )
}







