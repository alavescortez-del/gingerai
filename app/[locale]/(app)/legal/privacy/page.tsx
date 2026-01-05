'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const t = useTranslations('legal.privacy')
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

            {/* Données collectées */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('collected.title')}</h2>
              <p className="text-zinc-300">{t('collected.content')}</p>
              <ul className="list-disc list-inside text-zinc-300 mt-4 space-y-2">
                <li>{t('collected.item1')}</li>
                <li>{t('collected.item2')}</li>
                <li>{t('collected.item3')}</li>
                <li>{t('collected.item4')}</li>
              </ul>
            </section>

            {/* Utilisation des données */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('usage.title')}</h2>
              <p className="text-zinc-300">{t('usage.content')}</p>
            </section>

            {/* Base légale */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('legal.title')}</h2>
              <p className="text-zinc-300">{t('legal.content')}</p>
            </section>

            {/* Partage des données */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('sharing.title')}</h2>
              <p className="text-zinc-300">{t('sharing.content')}</p>
            </section>

            {/* Conservation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('retention.title')}</h2>
              <p className="text-zinc-300">{t('retention.content')}</p>
            </section>

            {/* Vos droits */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('rights.title')}</h2>
              <p className="text-zinc-300">{t('rights.content')}</p>
              <ul className="list-disc list-inside text-zinc-300 mt-4 space-y-2">
                <li>{t('rights.item1')}</li>
                <li>{t('rights.item2')}</li>
                <li>{t('rights.item3')}</li>
                <li>{t('rights.item4')}</li>
                <li>{t('rights.item5')}</li>
              </ul>
              <p className="text-zinc-300 mt-4">{t('rights.contact')}</p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('cookies.title')}</h2>
              <p className="text-zinc-300">{t('cookies.content')}</p>
            </section>

            {/* Sécurité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('security.title')}</h2>
              <p className="text-zinc-300">{t('security.content')}</p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('changes.title')}</h2>
              <p className="text-zinc-300">{t('changes.content')}</p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('contact.title')}</h2>
              <p className="text-zinc-300">{t('contact.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}



