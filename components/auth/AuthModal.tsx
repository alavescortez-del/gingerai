'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, initialView = 'register' }: AuthModalProps) {
  const router = useRouter()
  const t = useTranslations('auth')
  const [view, setView] = useState<'login' | 'register'>(initialView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [randomImage, setRandomImage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchRandomImage()
      setView(initialView)
    }
  }, [isOpen, initialView])

  const fetchRandomImage = async () => {
    const { data } = await supabase.from('models').select('avatar_url').limit(10)
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      setRandomImage(data[randomIndex].avatar_url)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (view === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
      }
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-zinc-950 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-white/10 transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left side: Image (Hidden on mobile) */}
            <div className="hidden md:block w-1/2 relative aspect-[4/5]">
              {randomImage ? (
                <>
                  <img 
                    src={randomImage} 
                    alt="Sugarush Model" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950" />
                  
                  <div className="absolute bottom-10 left-10 right-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-600/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 fill-white" />
                      {t('modal.badge')}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      {t('modal.title')}
                    </h3>
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      {t('modal.subtitle')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
              )}
            </div>

            {/* Right side: Form */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-8 hidden md:block">
                <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-pink-600/20 mb-4">G</div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {view === 'register' ? t('register.title') : t('login.title')}
                </h2>
                <button 
                  onClick={onClose}
                  className="hidden md:flex p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {view === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{t('register.name')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('register.namePlaceholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{t('login.email')}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('register.emailPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{t('login.password')}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 shadow-xl shadow-pink-600/20 font-black uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {view === 'register' ? t('register.submit') : t('login.submit')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-zinc-500 text-sm font-medium">
                  {view === 'register' ? t('register.hasAccount') : t('login.noAccount')}
                  {' '}
                  <button 
                    onClick={() => setView(view === 'register' ? 'login' : 'register')}
                    className="text-pink-500 font-black uppercase text-xs tracking-widest hover:underline ml-1"
                  >
                    {view === 'register' ? t('register.login') : t('login.register')}
                  </button>
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('modal.anonymous')}</span>
                </div>
                <div className="w-px h-4 bg-white/5" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('modal.free')}</span>
                </div>
                <div className="w-px h-4 bg-white/5" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('modal.secure')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


