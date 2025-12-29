'use client'

import { Message } from '@/types/database'
import { Lock } from 'lucide-react'

interface ChatBubbleProps {
  message: Message
  modelName: string
  modelAvatar?: string
}

export default function ChatBubble({ message, modelName, modelAvatar }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {/* Avatar for AI messages */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ginger-primary to-ginger-hot flex-shrink-0 flex items-center justify-center overflow-hidden">
          {modelAvatar ? (
            <img src={modelAvatar} alt={modelName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{modelName.charAt(0)}</span>
          )}
        </div>
      )}
      
      <div className={`
        max-w-[80%] md:max-w-[70%]
        ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
      `}>
        {/* Text content */}
        <p className="text-ginger-text whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {/* Media content */}
        {message.media_url && (
          <div className="mt-2 rounded-lg overflow-hidden relative">
            <img
              src={message.media_url}
              alt="Media"
              className={`w-full h-auto ${message.is_blurred ? 'blur-ppv' : ''}`}
            />
            {message.is_blurred && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-ginger-accent mx-auto mb-2" />
                  <p className="text-sm text-ginger-text">Débloquer pour 10 🌶️</p>
                </div>
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
  )
}

