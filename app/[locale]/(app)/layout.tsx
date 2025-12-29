'use client'

import { usePathname } from 'next/navigation'
import HeaderNav from '@/components/layout/HeaderNav'
import Footer from '@/components/layout/Footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Masquer le footer sur les pages de chat et scénario
  const hideFooter = pathname?.includes('/dm/') || pathname?.includes('/scenario/')
  
  return (
    <>
      <HeaderNav />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}





