import HeaderNav from '@/components/layout/HeaderNav'
import Footer from '@/components/layout/Footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderNav />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}





