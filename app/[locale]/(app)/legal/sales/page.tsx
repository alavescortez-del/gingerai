'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SalesPage() {
  const t = useTranslations('legal.sales')
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
            {/* Préambule */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('preamble.title')}</h2>
              <p className="text-zinc-300">{t('preamble.content')}</p>
            </section>

            {/* Prix */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('prices.title')}</h2>
              <p className="text-zinc-300">{t('prices.content')}</p>
            </section>

            {/* Commande */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('order.title')}</h2>
              <p className="text-zinc-300">{t('order.content')}</p>
            </section>

            {/* Paiement */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('payment.title')}</h2>
              <p className="text-zinc-300">{t('payment.content')}</p>
            </section>

            {/* Livraison */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('delivery.title')}</h2>
              <p className="text-zinc-300">{t('delivery.content')}</p>
            </section>

            {/* Rétractation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('withdrawal.title')}</h2>
              <p className="text-zinc-300">{t('withdrawal.content')}</p>
            </section>

            {/* Garanties */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('warranty.title')}</h2>
              <p className="text-zinc-300">{t('warranty.content')}</p>
            </section>

            {/* Réclamations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('claims.title')}</h2>
              <p className="text-zinc-300">{t('claims.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}



