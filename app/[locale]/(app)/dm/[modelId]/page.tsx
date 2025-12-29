'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Image as ImageIcon, Lock, Search, 
  Info, ChevronRight, MessageSquare,
  User, Heart, Star, Languages, Briefcase, 
  Smile, Zap, Settings, X, Send, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PlanLimitModal from '@/components/ui/PlanLimitModal'
import { Model, Contact, Message } from '@/types/database'
import ChatBubble from '@/components/chat/ChatBubble'
import TypingIndicator from '@/components/chat/TypingIndicator'

interface ContactWithModel extends Contact {
  model: Model
  last_message?: Message
}

export default function DMPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.modelId as string
  const locale = (params.locale as string) || 'fr'

  const {
    messages,
    addMessage,
    clearMessages,
    isTyping,
    setIsTyping,
    credits,
    deductCredits
  } = useGameStore()

  const [model, setModel] = useState<Model | null>(null)
  const [contact, setContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<ContactWithModel[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileSidebar, setShowProfileSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPPVModal, setShowPPVModal] = useState(false)
  const [limitModal, setLimitModal] = useState<{ open: boolean, type: 'messages' | 'photos' | 'scenario' | 'phase' }>({ open: false, type: 'messages' })
  const [ppvCost] = useState(10)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    // Reset state immediately when modelId changes
    setLoading(true)
    clearMessages()
    setModel(null)
    setContact(null)
    
    fetchData()
    fetchContacts()
  }, [modelId])

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: contactsData } = await supabase
      .from('contacts')
      .select('*, model:models(*)')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })

    if (contactsData) {
      // Pour chaque contact, on récupère le dernier message pour l'aperçu
      const contactsWithMessages = await Promise.all(contactsData.map(async (c: any) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('contact_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        return {
          ...c,
          last_message: messages?.[0] || undefined
        }
      }))
      setContacts(contactsWithMessages)
    }
  }

  const ensureContact = async (userId: string, targetModelId: string) => {
    const { data: existing } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('model_id', targetModelId)
      .maybeSingle()

    if (!existing) {
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({ user_id: userId, model_id: targetModelId, is_unlocked: true })
        .select()
        .single()
      
      return newContact as Contact
    }
    return existing as Contact
  }

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/register?redirect=/dm/${modelId}`)
        return
      }

      const { data: modelData } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single()

      if (!modelData) {
        router.push('/contacts')
        return
      }

      setModel(modelData)

      const [contactData, profileRes] = await Promise.all([
        ensureContact(user.id, modelId),
        supabase.from('users').select('*').eq('id', user.id).single()
      ])

      if (profileRes.data) {
        setUserProfile(profileRes.data)
      }

      if (!contactData) {
        router.push('/contacts')
        return
      }

      setContact(contactData)

      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contactData.id)
        .order('created_at', { ascending: true })

      // Messages are already cleared in useEffect, just add the new ones
      if (existingMessages && existingMessages.length > 0) {
        existingMessages.forEach(msg => addMessage(msg))
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || !model || !contact || !userProfile) return

    // Plan limits
    const limits = {
      free: { messages: 5 },
      soft: { messages: 30 },
      unleashed: { messages: Infinity }
    }
    
    const currentLimit = limits[userProfile.plan as keyof typeof limits].messages
    if (userProfile.daily_messages_count >= currentLimit) {
      setLimitModal({ open: true, type: 'messages' })
      return
    }

    const content = input.trim()
    setInput('')

    const userMessage: Message = {
      id: crypto.randomUUID(),
      contact_id: contact.id,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    }
    addMessage(userMessage)

    await supabase.from('messages').insert({
      contact_id: contact.id,
      role: 'user',
      content
    })

    await supabase
      .from('contacts')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', contact.id)

    setIsTyping(true)

    try {
      const chatHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))

      // Get the current session token for API authentication
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content }],
          model,
          isDM: true,
          locale
        })
      })

      if (!response.ok) throw new Error('Chat API error')

      const data = await response.json()
      let aiContent = data.content

      // Update local counter
      setUserProfile((prev: any) => ({
        ...prev,
        daily_messages_count: (prev?.daily_messages_count || 0) + 1
      }))

      const shouldSendPPV = Math.random() < 0.15 && content.toLowerCase().includes('photo')
      
      if (shouldSendPPV) aiContent += '\n\n📸 *envoie une photo*'

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        contact_id: contact.id,
        role: 'assistant',
        content: aiContent,
        media_url: shouldSendPPV ? '/images/ppv-placeholder.jpg' : undefined,
        is_blurred: shouldSendPPV,
        created_at: new Date().toISOString()
      }
      
      addMessage(aiMessage)

      // Update sidebar preview immediately
      setContacts(prev => prev.map(c => 
        c.id === contact.id ? { ...c, last_message: aiMessage } : c
      ))

      await supabase.from('messages').insert({
        contact_id: contact.id,
        role: 'assistant',
        content: aiContent,
        media_url: shouldSendPPV ? '/images/ppv-placeholder.jpg' : undefined,
        is_blurred: shouldSendPPV
      })

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-ginger-bg"><div className="w-12 h-12 border-4 border-ginger-primary/30 border-t-ginger-primary rounded-full animate-spin" /></div>

  return (
    <div className="h-[calc(100vh-64px)] flex bg-ginger-bg overflow-hidden font-sans relative z-20">
      {/* Background effects bloqués pour éviter le scroll global */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="blob-pink top-[-20%] left-[-10%] w-[600px] h-[600px]" />
        <div className="blob-rose bottom-[-20%] right-[-10%] w-[500px] h-[500px]" />
      </div>

      {/* LEFT SIDEBAR: Contacts */}
      <div className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-ginger-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Discuter</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Rechercher un profil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-ginger-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {contacts
            .filter(c => c.model.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(c => (
            <Link 
              key={c.id} 
              href={`/dm/${c.model_id}`}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/5 group ${c.model_id === modelId ? 'bg-white/5 border border-white/10' : 'border border-transparent'}`}
            >
              <Avatar src={c.model.avatar_url} alt={c.model.name} size="md" online={true} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-white text-sm truncate">{c.model.name}</h4>
                  <span className="text-[10px] text-zinc-500">2:04PM</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {c.last_message?.content || "Eh bien, eh bien... si ce n'est..."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CENTER: Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-ginger-bg">
        {/* Chat Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-ginger-bg/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Link href="/contacts" className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Avatar src={model?.chat_avatar_url || model?.avatar_url} alt={model?.name || ''} size="md" online={true} />
            <div>
              <h1 className="font-bold text-white">{model?.name}</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">En ligne</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowProfileSidebar(!showProfileSidebar)}
              className={`p-2.5 rounded-full transition-all ${showProfileSidebar ? 'text-ginger-primary bg-ginger-primary/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBubble
                    message={message}
                    modelName={model?.name || ''}
                    modelAvatar={model?.avatar_url}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator name={model?.name || ''} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-6">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto flex items-center gap-3"
          >
            <div className="flex-1 relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden focus-within:border-ginger-primary/30 transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez un message..."
                className="flex-1 bg-transparent py-4 px-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <div className="flex items-center gap-1 pr-4">
                <button type="button" className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest transition-all">
                  Actions <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-4 rounded-2xl bg-pink-600 text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Profile */}
      <AnimatePresence>
        {showProfileSidebar && model && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden xl:flex flex-col border-l border-white/5 bg-ginger-card overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 group">
                <img src={model.avatar_url} alt={model.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ginger-card via-transparent to-transparent opacity-60" />
                <div className="absolute inset-x-0 bottom-0 p-6 flex justify-between items-end">
                  <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{model.name}</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                    {model.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">À propos de moi:</h3>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Âge</p>
                        <p className="text-xs font-bold text-white">{model.age || 18} ans</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Langue</p>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          Français
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlanLimitModal
        isOpen={limitModal.open}
        onClose={() => setLimitModal({ ...limitModal, open: false })}
        type={limitModal.type}
        plan={userProfile?.plan || 'free'}
        modelAvatar={model?.avatar_url}
      />
    </div>
  )
}
