'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'
import { motion } from 'framer-motion'
import { Home, Film, Users, Zap, LogOut, LogIn, UserPlus, Gem, Sparkles } from 'lucide-react'
import AuthModal from '@/components/auth/AuthModal'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { locales } from '@/i18n/request'

const navItems = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/scenarios', labelKey: 'scenarios', icon: Film },
  { href: '/contacts', labelKey: 'contacts', icon: Users },
  { href: '/sugarfeed', labelKey: 'sugarfeed', icon: Sparkles },
  { href: '/subscriptions', labelKey: 'premium', icon: Gem, isPremium: true },
]

export default function HeaderNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{ open: boolean, view: 'login' | 'register' }>({ open: false, view: 'register' })
  const { credits, setUser, setCredits } = useGameStore()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Extract locale from pathname
  const currentLocale = locales.find(l => pathname?.startsWith(`/${l}`)) || 'fr'

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const auth = urlParams.get('auth')
    if (auth === 'login' || auth === 'register') {
      setAuthModal({ open: true, view: auth as 'login' | 'register' })
    }
  }, [pathname])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUser(profile)
          setCredits(profile.credits)
        }
      }
    }

    checkAuth()
  }, [setUser, setCredits])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-lg">🍬</span>
                </div>
              </div>
              <span className="text-lg font-black tracking-tighter text-white">
                Sugar<span className="text-pink-500">ush</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const localizedHref = `/${currentLocale}${item.href === '/' ? '' : item.href}`
                const isActive = pathname === localizedHref || (item.href !== '/' && pathname?.includes(item.href))
                const Icon = item.icon
                
                if (item.isPremium) {
                  return (
                    <Link
                      key={item.href}
                      href={localizedHref}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                        isActive 
                          ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' 
                          : 'bg-white/5 text-pink-400 hover:bg-white/10 border border-pink-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t(item.labelKey)}
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={localizedHref}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors relative group ${
                      isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    {t(item.labelKey)}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3 min-w-[100px] justify-end">
              {/* Language Selector */}
              <LanguageSelector currentLocale={currentLocale} />

              {isAuthenticated === null ? (
                <div className="h-8 w-8 rounded-full border-2 border-white/5 border-t-pink-500 animate-spin" />
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="hidden md:block text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setAuthModal({ open: true, view: 'login' })}
                    className="hidden md:block text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    {t('login')}
                  </button>
                  <button 
                    onClick={() => setAuthModal({ open: true, view: 'register' })}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-black hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
                  >
                    {t('register')}
                  </button>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const localizedHref = `/${currentLocale}${item.href === '/' ? '' : item.href}`
                const isActive = pathname === localizedHref || (item.href !== '/' && pathname?.includes(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={localizedHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    } ${item.isPremium && !isActive ? 'text-pink-400 bg-pink-500/5' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.isPremium ? 'text-pink-500' : 'text-zinc-500'}`} />
                    {t(item.labelKey)}
                  </Link>
                )
              })}

              {isAuthenticated ? (
                <>
                  <div className="h-px bg-white/5 my-2" />
                  <Link href="/subscriptions" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold text-white">Abonnement</span>
                    </div>
                    <span className="text-sm font-black text-pink-400">Gérer</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/5 my-2" />
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthModal({ open: true, view: 'login' }); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <LogIn className="w-5 h-5" />
                    Connexion
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Spacer pour compenser le header fixe */}
      <div className="h-16" />

      <AuthModal 
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        initialView={authModal.view}
      />
    </>
  )
}

