'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/types/database'
import { Lock, X } from 'lucide-react'

interface ChatBubbleProps {
  message: Message
  modelName: string
  modelAvatar?: string
}

export default function ChatBubble({ message, modelName, modelAvatar }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const [showImageModal, setShowImageModal] = useState(false)
  
  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
        {/* Avatar for AI messages */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ginger-primary to-ginger-hot flex-shrink-0 flex items-center justify-center overflow-hidden">
            {modelAvatar ? (
              <img 
                src={modelAvatar} 
                alt={modelName} 
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            ) : (
              <span className="text-white text-sm font-bold">{modelName.charAt(0)}</span>
            )}
          </div>
        )}
        
        <div className={`
          max-w-[80%] md:max-w-[70%]
          ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
        `}>
          {/* Text content - Hide emoji-only photo indicator */}
          {message.content !== '📸' && (
            <p className="text-ginger-text whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          
          {/* Media content - WhatsApp style: smaller thumbnail */}
          {message.media_url && (
            <div 
              className="mt-1 rounded-xl overflow-hidden relative cursor-pointer group w-[140px] md:w-[180px]"
              onClick={() => !message.is_blurred && setShowImageModal(true)}
            >
              <img
                src={message.media_url}
                alt="Photo"
                className={`w-full h-auto rounded-xl transition-transform duration-200 group-hover:scale-[1.02] ${message.is_blurred ? 'blur-ppv' : ''}`}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              {message.is_blurred && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-ginger-accent mx-auto mb-2" />
                    <p className="text-sm text-ginger-text">Débloquer pour 10 🌶️</p>
                  </div>
                </div>
              )}
              {/* Subtle "tap to enlarge" indicator */}
              {!message.is_blurred && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded-md text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  Agrandir
                </div>
              )}
            </div>
          )}
          
          {/* Timestamp */}
          <p className={`text-[10px] mt-1 ${isUser ? 'text-white/60' : 'text-ginger-muted'}`}>
            {new Date(message.created_at).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Image Modal - Full screen overlay */}
      <AnimatePresence>
        {showImageModal && message.media_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
          >
            {/* Close button - Subtle but visible, below header */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowImageModal(false)
              }}
              className="absolute top-20 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-[210]"
            >
              <X className="w-5 h-5" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
            >
              <img
                src={message.media_url}
                alt="Photo"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                style={{ pointerEvents: 'none' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

