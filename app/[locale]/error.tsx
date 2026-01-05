'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
          <span className="text-4xl">😵</span>
        </div>
        <h1 className="text-3xl font-black text-white">Oups !</h1>
        <p className="text-zinc-400">
          Une erreur s'est produite. Ne t'inquiète pas, ce n'est pas de ta faute.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href={`/${locale}/`}
            className="px-6 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}




