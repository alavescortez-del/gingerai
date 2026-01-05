'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-zinc-950">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
              <span className="text-4xl">💥</span>
            </div>
            <h1 className="text-3xl font-black text-white">Erreur critique</h1>
            <p className="text-zinc-400">
              Une erreur inattendue s'est produite. Veuillez réessayer.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}




