'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { useGameStore } from '@/lib/stores/gameStore'
import ChatBubble from './ChatBubble'
import TypingIndicator from './TypingIndicator'

interface ChatInterfaceProps {
  modelName: string
  modelAvatar?: string
  onSendMessage: (message: string) => Promise<void>
  placeholder?: string
}

export default function ChatInterface({ 
  modelName, 
  modelAvatar,
  onSendMessage,
  placeholder = "Écris ton message..."
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { messages, isTyping } = useGameStore()
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    
    const message = input.trim()
    setInput('')
    setSending(true)
    
    try {
      await onSendMessage(message)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-ginger-dark/50">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-ginger-primary/10 glass">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ginger-primary to-ginger-hot flex items-center justify-center overflow-hidden">
          {modelAvatar ? (
            <img src={modelAvatar} alt={modelName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{modelName.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-ginger-text">{modelName}</h3>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            En ligne
          </p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble
                message={message}
                modelName={modelName}
                modelAvatar={modelAvatar}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TypingIndicator name={modelName} />
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-ginger-primary/10 glass">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={sending}
              className="
                w-full px-4 py-3 pr-12 rounded-xl
                bg-ginger-secondary/50 border border-ginger-primary/20
                text-ginger-text placeholder-ginger-muted
                focus:outline-none focus:border-ginger-primary
                transition-all duration-300
              "
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ginger-primary hover:text-ginger-accent transition-colors"
              title="Suggestions"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="
              p-3 rounded-xl
              bg-gradient-to-r from-ginger-primary to-ginger-hot
              text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-lg hover:shadow-ginger-primary/30
              transition-all duration-300
            "
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

