import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sugarush - Dating Simulator Immersif',
  description: 'L\'expérience de dating simulator la plus addictive et réaliste. Rencontrez des personnages virtuels uniques.',
  keywords: ['dating simulator', 'AI chat', 'virtual girlfriend', 'roleplay', 'sugarush'],
  openGraph: {
    title: 'Sugarush - Dating Simulator Immersif',
    description: 'L\'expérience de dating simulator la plus addictive et réaliste.',
    type: 'website',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale?: string }
}

export default function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const locale = params?.locale || 'fr'
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-ginger-bg">
        {/* Background effects */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-ginger-dark via-ginger-surface to-ginger-card pointer-events-none">
          <div className="blob-pink top-[-20%] left-[-10%] w-[600px] h-[600px]" />
          <div className="blob-rose bottom-[-20%] right-[-10%] w-[500px] h-[500px]" />
          <div className="texture-overlay" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}

