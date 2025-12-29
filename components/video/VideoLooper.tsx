'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

interface VideoLooperProps {
  src: string
  poster?: string
  className?: string
  isMuted?: boolean
  onVideoChange?: () => void
}

export default function VideoLooper({ src, poster, className = '', isMuted: externalMuted, onVideoChange }: VideoLooperProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [internalMuted, setInternalMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)

  const isMuted = externalMuted !== undefined ? externalMuted : internalMuted
  
  useEffect(() => {
    if (src !== currentSrc) {
      setIsLoading(true)
      setCurrentSrc(src)
      onVideoChange?.()
    }
  }, [src, currentSrc, onVideoChange])
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const handleCanPlay = () => {
      setIsLoading(false)
      video.play().catch(() => {
        // Autoplay was prevented, that's okay
      })
    }
    
    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }
    
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleEnded)
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentSrc])
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setInternalMuted(!isMuted)
    }
  }
  
  return (
    <div className={`relative overflow-hidden bg-ginger-dark ${className}`}>
      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-ginger-dark z-10"
          >
            <div className="w-12 h-12 border-4 border-ginger-primary/30 border-t-ginger-primary rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Video */}
      <video
        ref={videoRef}
        src={currentSrc}
        poster={poster}
        muted={isMuted}
        playsInline
        loop
        className="w-full h-full object-cover"
      />
      
      {/* Phone frame effect (optional but nice) */}
      <div className="absolute inset-0 border-x border-white/5 pointer-events-none" />
      
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      
      {/* Breathing effect overlay */}
      <motion.div
        animate={{
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-t from-ginger-primary/20 to-transparent pointer-events-none"
      />
    </div>
  )
}

