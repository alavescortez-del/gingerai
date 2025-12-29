'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const t = useTranslations('legal.terms')
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
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('intro.title')}</h2>
              <p className="text-zinc-300">{t('intro.content')}</p>
            </section>

            {/* Objet */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('object.title')}</h2>
              <p className="text-zinc-300">{t('object.content')}</p>
            </section>

            {/* Accès au service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('access.title')}</h2>
              <p className="text-zinc-300">{t('access.content')}</p>
            </section>

            {/* Compte utilisateur */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('account.title')}</h2>
              <p className="text-zinc-300">{t('account.content')}</p>
            </section>

            {/* Contenu */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('content.title')}</h2>
              <p className="text-zinc-300">{t('content.content')}</p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('liability.title')}</h2>
              <p className="text-zinc-300">{t('liability.content')}</p>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('intellectual.title')}</h2>
              <p className="text-zinc-300">{t('intellectual.content')}</p>
            </section>

            {/* Résiliation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('termination.title')}</h2>
              <p className="text-zinc-300">{t('termination.content')}</p>
            </section>

            {/* Loi applicable */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('law.title')}</h2>
              <p className="text-zinc-300">{t('law.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

