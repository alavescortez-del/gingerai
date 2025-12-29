'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function MentionsLegalesPage() {
  const t = useTranslations('legal.mentions')
  const params = useParams()
  const locale = params?.locale as string || 'fr'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
          <h1 className="text-4xl font-black text-white mb-4">{t('title')}</h1>
          <p className="text-zinc-400">{t('lastUpdate')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="bg-white/5 rounded-2xl p-8 space-y-8">
            {/* Éditeur */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('editor.title')}</h2>
              <div className="text-zinc-300 space-y-2">
                <p><strong>{t('editor.company')}</strong> Sugarush</p>
                <p><strong>{t('editor.address')}</strong> [Adresse complète]</p>
                <p><strong>{t('editor.siret')}</strong> [Numéro SIRET]</p>
                <p><strong>{t('editor.email')}</strong> contact@sugarush.me</p>
                <p><strong>{t('editor.phone')}</strong> [Téléphone]</p>
              </div>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('hosting.title')}</h2>
              <div className="text-zinc-300 space-y-2">
                <p><strong>{t('hosting.provider')}</strong> Vercel Inc.</p>
                <p><strong>{t('hosting.address')}</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>{t('hosting.website')}</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400">vercel.com</a></p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('intellectual.title')}</h2>
              <p className="text-zinc-300">{t('intellectual.content')}</p>
            </section>

            {/* Données personnelles */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('data.title')}</h2>
              <p className="text-zinc-300">
                {t('data.content')}{' '}
                <Link href={`/${locale}/legal/privacy`} className="text-pink-500 hover:text-pink-400">
                  {t('data.privacyLink')}
                </Link>
              </p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('liability.title')}</h2>
              <p className="text-zinc-300">{t('liability.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

