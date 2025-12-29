'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
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
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20">
          {/* Placeholder - replace with actual model image */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-500 opacity-20" />
          <div className="absolute bottom-12 left-12">
            <p className="text-white text-4xl font-black">Sugar<span className="text-pink-500">ush</span></p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >

          <h1 className="text-3xl font-black text-white mb-2">
            Créer un compte
          </h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 mb-6">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="E-mail"
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

            <p className="text-zinc-500 text-xs">Minimum 6 caractères</p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/30 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Création...</span>
                </div>
              ) : (
                'CRÉER UN COMPTE GRATUIT'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-zinc-500">ou continuer avec</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social logins */}
          <div className="space-y-3 mb-8">
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
              <span>Google</span>
            </button>
          </div>

          {/* Terms */}
          <p className="text-zinc-500 text-xs text-center mb-6">
            En vous inscrivant, vous acceptez les{' '}
            <Link href="/terms" className="text-pink-500 hover:text-pink-400 underline">
              Conditions d'utilisation
            </Link>
          </p>

          {/* Login link */}
          <p className="text-center text-zinc-400 text-sm">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-pink-500 hover:text-pink-400 transition-colors font-bold">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

