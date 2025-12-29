'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/request'

interface LanguageSelectorProps {
  currentLocale: string
}

export default function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace the locale in the current path
    const currentPathLocale = locales.find(l => pathname.startsWith(`/${l}`))
    let newPath = pathname
    
    if (currentPathLocale) {
      newPath = pathname.replace(`/${currentPathLocale}`, `/${newLocale}`)
    } else {
      newPath = `/${newLocale}${pathname}`
    }
    
    router.push(newPath)
    setIsOpen(false)
  }

  const currentLocaleData = {
    code: currentLocale as Locale,
    name: localeNames[currentLocale as Locale] || 'Français',
    flag: localeFlags[currentLocale as Locale] || '🇫🇷'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-zinc-300"
      >
        <span className="text-base">{currentLocaleData.flag}</span>
        <span className="hidden sm:inline">{currentLocaleData.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  locale === currentLocale 
                    ? 'bg-pink-600/20 text-pink-400' 
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="text-base">{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


