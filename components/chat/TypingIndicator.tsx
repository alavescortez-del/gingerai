'use client'

interface TypingIndicatorProps {
  name: string
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ginger-primary to-ginger-hot flex-shrink-0 flex items-center justify-center">
        <span className="text-white text-sm font-bold">{name.charAt(0)}</span>
      </div>
      
      <div className="chat-bubble-ai">
        <div className="flex items-center gap-2">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="text-sm text-ginger-muted">{name} est en train d&apos;écrire</span>
        </div>
      </div>
    </div>
  )
}

