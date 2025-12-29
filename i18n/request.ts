import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['fr', 'en', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch'
}

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  de: '🇩🇪'
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  }
})

