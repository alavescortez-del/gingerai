'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ChevronDown, Mail, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SupportPage() {
  const params = useParams()
  const locale = params?.locale as string || 'fr'
  const t = useTranslations('support')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: t('faq.q1.question'),
      answer: t('faq.q1.answer')
    },
    {
      question: t('faq.q2.question'),
      answer: t('faq.q2.answer')
    },
    {
      question: t('faq.q3.question'),
      answer: t('faq.q3.answer')
    },
    {
      question: t('faq.q4.question'),
      answer: t('faq.q4.answer')
    },
    {
      question: t('faq.q5.question'),
      answer: t('faq.q5.answer')
    },
    {
      question: t('faq.q6.question'),
      answer: t('faq.q6.answer')
    },
    {
      question: t('faq.q7.question'),
      answer: t('faq.q7.answer')
    },
    {
      question: t('faq.q8.question'),
      answer: t('faq.q8.answer')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/${locale}/`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4">{t('title')}</h1>
            <p className="text-xl text-zinc-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">💬</span>
            {t('faqTitle')}
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-pink-500/30 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-pink-400 transition-colors flex-shrink-0" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-zinc-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl blur-3xl" />
          
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">{t('contactTitle')}</h2>
              <p className="text-zinc-300 text-lg">{t('contactSubtitle')}</p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Email Button */}
              <a
                href="mailto:support@sugarush.me"
                className="block w-full px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105 shadow-xl shadow-pink-500/20 text-center"
              >
                📧 support@sugarush.me
              </a>

              {/* Response Time */}
              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  ⏱️ {t('responseTime')}
                </p>
              </div>

              {/* Support Hours */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span>🕐</span>
                  {t('hoursTitle')}
                </h3>
                <p className="text-zinc-300 text-sm">
                  {t('hoursContent')}
                </p>
              </div>

              {/* What to Include */}
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span>📝</span>
                  {t('includeTitle')}
                </h3>
                <ul className="text-zinc-300 text-sm space-y-2">
                  <li>• {t('include1')}</li>
                  <li>• {t('include2')}</li>
                  <li>• {t('include3')}</li>
                  <li>• {t('include4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/legal/terms`}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all group"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-pink-400 transition-colors">
                {t('quickLinks.terms')}
              </h3>
              <p className="text-zinc-400 text-sm">{t('quickLinks.termsDesc')}</p>
            </Link>

            <Link
              href={`/${locale}/legal/privacy`}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all group"
            >
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-pink-400 transition-colors">
                {t('quickLinks.privacy')}
              </h3>
              <p className="text-zinc-400 text-sm">{t('quickLinks.privacyDesc')}</p>
            </Link>

            <Link
              href={`/${locale}/subscriptions`}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all group"
            >
              <div className="text-3xl mb-3">💎</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-pink-400 transition-colors">
                {t('quickLinks.plans')}
              </h3>
              <p className="text-zinc-400 text-sm">{t('quickLinks.plansDesc')}</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

