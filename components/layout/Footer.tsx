'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart, Instagram, Twitter, Mail, Shield, ShieldCheck } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const params = useParams()
  const locale = (params.locale as string) || 'fr'
  const t = useTranslations('footer')
  const tn = useTranslations('nav')

  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6 text-center md:text-left">
            <Link href={`/${locale}`} className="inline-block">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center">
                  <span className="text-lg">🍬</span>
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase">Sugarush</span>
              </div>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0 font-medium">
              {t('tagline')}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-pink-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-pink-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:contact@ginger.ai" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-pink-600 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">{t('navigation')}</h4>
            <ul className="space-y-4">
              <li><Link href={`/${locale}/scenarios`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{tn('scenarios')}</Link></li>
              <li><Link href={`/${locale}/contacts`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{tn('contacts')}</Link></li>
              <li><Link href={`/${locale}/subscriptions`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{tn('subscriptions')}</Link></li>
              <li><Link href={`/${locale}/support`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">{t('legal')}</h4>
            <ul className="space-y-4">
              <li><Link href={`/${locale}/legal/terms`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{t('terms')}</Link></li>
              <li><Link href={`/${locale}/legal/privacy`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{t('privacy')}</Link></li>
              <li><Link href={`/${locale}/legal/sales`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">CGV</Link></li>
              <li><Link href={`/${locale}/legal/mentions`} className="text-zinc-500 hover:text-pink-500 text-sm font-bold transition-colors">{t('legalNotice')}</Link></li>
            </ul>
          </div>

          {/* Trust Column */}
          <div className="bg-white/5 rounded-3xl p-8 text-center space-y-4">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-white font-black uppercase tracking-widest text-xs">{t('secureTitle')}</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
              {t('secureDesc')}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            © {currentYear} Sugarush • {t('allRights')}
          </p>
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest">
            {t('madeWith')} <Heart className="w-3 h-3 text-pink-600 fill-pink-600" /> {t('forLovers')}
          </div>
        </div>
      </div>
    </footer>
  )
}
