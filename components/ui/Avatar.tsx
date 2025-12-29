'use client'

import Image from 'next/image'

interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

export default function Avatar({ src, alt, size = 'md', online, className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }
  
  const onlineSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  }
  
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div className={`
        ${sizes[size]} rounded-full overflow-hidden
        bg-gradient-to-br from-ginger-primary to-ginger-hot
        border-2 border-ginger-primary/30
        relative
      `}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {online !== undefined && (
        <span className={`
          absolute bottom-0 right-0
          ${onlineSizes[size]} rounded-full
          ${online ? 'bg-green-500' : 'bg-gray-500'}
          border-2 border-ginger-dark
        `} />
      )}
    </div>
  )
}

