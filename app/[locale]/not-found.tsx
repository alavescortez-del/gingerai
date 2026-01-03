import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-pink-500/10 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-6xl font-black text-white">404</h1>
        <h2 className="text-2xl font-bold text-zinc-300">Page introuvable</h2>
        <p className="text-zinc-400">
          La page que tu cherches n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-pink-500/20"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}



