'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Identifiants invalides'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🍬</span>
          </div>
          <span className="text-3xl font-black gradient-text">Sugarush</span>
        </Link>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h1 className="text-3xl font-black text-white text-center mb-2">
            Content de te revoir
          </h1>
          <p className="text-zinc-400 text-center mb-8">
            Connecte-toi pour continuer l'aventure
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-800/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-zinc-800/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-zinc-800 text-pink-500 focus:ring-pink-500/50"
                />
                Se souvenir de moi
              </label>
              <Link href="/forgot-password" className="text-pink-500 hover:text-pink-400 transition-colors">
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/30 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                'SE CONNECTER'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-zinc-500">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl bg-white text-zinc-900 font-bold uppercase tracking-wider text-sm transition-all hover:bg-zinc-100 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>CONTINUER AVEC GOOGLE</span>
          </button>

          {/* Register link */}
          <p className="mt-6 text-center text-zinc-400 text-sm">
            Pas encore de compte?{' '}
            <Link href="/register" className="text-pink-500 hover:text-pink-400 transition-colors font-bold">
              S'inscrire
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

