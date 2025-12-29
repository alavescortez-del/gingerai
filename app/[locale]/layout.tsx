import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n/request'
import AgeVerificationModal from '@/components/modals/AgeVerificationModal'

// Import all messages statically to avoid caching issues
import frMessages from '@/messages/fr.json'
import enMessages from '@/messages/en.json'
import deMessages from '@/messages/de.json'

const allMessages: Record<string, typeof frMessages> = {
  fr: frMessages,
  en: enMessages,
  de: deMessages
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Get messages for the current locale
  const messages = allMessages[locale] || allMessages.fr

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AgeVerificationModal />
      {children}
    </NextIntlClientProvider>
  )
}

