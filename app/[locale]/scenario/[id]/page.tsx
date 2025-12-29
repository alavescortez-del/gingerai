'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Sparkles, Phone, Send, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'
import { calculateAffinityBonus, buildSystemPrompt } from '@/lib/prompts'
import VideoLooper from '@/components/video/VideoLooper'
import ChatBubble from '@/components/chat/ChatBubble'
import TypingIndicator from '@/components/chat/TypingIndicator'
import AffinityGauge from '@/components/scenario/AffinityGauge'
import ActionMenu from '@/components/scenario/ActionMenu'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PlanLimitModal from '@/components/ui/PlanLimitModal'
import { Scenario, Model, Phase, VideoLoop, Action, UserScenario, Message } from '@/types/database'
import { X, Volume2, VolumeX, Lock, HelpCircle } from 'lucide-react'

// Fallback for crypto.randomUUID for non-secure contexts and older browsers
const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface ScenarioData extends Scenario {
  model: Model
  phases: (Phase & { video_loops: VideoLoop[] })[]
  actions: Action[]
}

export default function ScenarioPage() {
  const params = useParams()
  const router = useRouter()
  const scenarioId = params.id as string
  const locale = (params.locale as string) || 'fr'

  const {
    currentScenario,
    setCurrentScenario,
    affinity,
    setAffinity,
    addAffinity,
    messages,
    addMessage,
    clearMessages,
    currentVideoUrl,
    setCurrentVideoUrl,
    availableActions,
    setAvailableActions,
    isTyping,
    setIsTyping,
    addContact
  } = useGameStore()

  const [scenario, setScenario] = useState<ScenarioData | null>(null)
  const [userScenario, setUserScenario] = useState<UserScenario | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [isMuted, setIsMuted] = useState(true)
  const [lockedPhaseMessage, setLockedPhaseMessage] = useState<string | null>(null)
  const [limitModal, setLimitModal] = useState<{ open: boolean, type: 'messages' | 'photos' | 'scenario' | 'phase' }>({ open: false, type: 'messages' })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  useEffect(() => {
    // Petit délai pour laisser le DOM se mettre à jour
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, isTyping])

  useEffect(() => {
    fetchScenarioData()
  }, [scenarioId])

  useEffect(() => {
    if (scenario?.actions) {
      const filtered = scenario.actions.filter(a => 
        !a.phase_id || 
        a.phase_id === scenario.phases.find(p => p.phase_number === currentPhase)?.id
      )
      setAvailableActions(filtered)
    }
  }, [currentPhase, scenario])

  const fetchScenarioData = async () => {
    try {
      // 1. Parallelize main data and auth check
      const [scenarioRes, authRes] = await Promise.all([
        supabase
          .from('scenarios')
          .select(`
            *,
            model:models(*),
            phases(*, video_loops(*)),
            actions(*)
          `)
          .eq('id', scenarioId)
          .single(),
        supabase.auth.getUser()
      ])

      const { data: scenarioData, error: scenarioError } = scenarioRes
      const { data: { user } } = authRes

      if (scenarioError) throw scenarioError
      setScenario(scenarioData as ScenarioData)

      if (user) {
        // 2. Fetch user profile, or create user scenario and messages in parallel
        const [profileRes, scenarioRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', user.id).single(),
          supabase
            .from('user_scenarios')
            .select('*')
            .eq('user_id', user.id)
            .eq('scenario_id', scenarioId)
            .single()
        ])

        if (profileRes.data) {
          setUserProfile(profileRes.data)
        }

        const existingUserScenario = scenarioRes.data
        let currentUsc = existingUserScenario

        if (!currentUsc) {
          const { data: newUserScenario } = await supabase
            .from('user_scenarios')
            .insert({
              user_id: user.id,
              scenario_id: scenarioId,
              affinity_score: 0,
              current_phase: 1
            })
            .select()
            .single()
          currentUsc = newUserScenario
        }

        if (currentUsc) {
          setUserScenario(currentUsc)
          setCurrentScenario(currentUsc)
          setAffinity(currentUsc.affinity_score)
          setCurrentPhase(currentUsc.current_phase)

          // Fetch existing messages
          const { data: existingMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('user_scenario_id', currentUsc.id)
            .order('created_at', { ascending: true })

          if (existingMessages) {
            clearMessages()
            existingMessages.forEach(msg => addMessage(msg))
          }
        }
      }

      // Set initial video
      const phase1 = scenarioData?.phases?.find((p: Phase) => p.phase_number === 1)
      const defaultVideo = phase1?.video_loops?.find((v: VideoLoop) => v.is_default) || phase1?.video_loops?.[0]
      if (defaultVideo) {
        setCurrentVideoUrl(defaultVideo.video_url)
      }
    } catch (error) {
      console.error('Error fetching scenario:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = useCallback(async (content: string) => {
    if (!scenario || !userScenario || !userProfile) return

    // Plan restrictions: Free users max 5 messages in scenario
    if (userProfile.plan === 'free' && messages.length >= 5) {
      setLimitModal({ open: true, type: 'scenario' })
      return
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      user_scenario_id: userScenario.id,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    }
    addMessage(userMessage)

    // Save user message to DB
    await supabase.from('messages').insert({
      user_scenario_id: userScenario.id,
      role: 'user',
      content
    })

    // Show typing indicator
    setIsTyping(true)

    try {
      // Get auth token for API calls
      const { data: { session } } = await supabase.auth.getSession()
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      }

      // Build messages for API
      const chatHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          messages: [
            ...chatHistory,
            { role: 'user', content }
          ],
          model: scenario.model,
          scenario,
          phase: currentPhase,
          locale
        })
      })

      if (!response.ok) throw new Error('Chat API error')

      const data = await response.json()
      const aiContent = data.content

      // Update local counter
      setUserProfile((prev: any) => ({
        ...prev,
        daily_messages_count: (prev?.daily_messages_count || 0) + 1
      }))

      // Add AI message
      const aiMessage: Message = {
        id: generateId(),
        user_scenario_id: userScenario.id,
        role: 'assistant',
        content: aiContent,
        created_at: new Date().toISOString()
      }
      addMessage(aiMessage)

      // Save AI message to DB
      await supabase.from('messages').insert({
        user_scenario_id: userScenario.id,
        role: 'assistant',
        content: aiContent
      })

      // Calculate and add affinity
      const bonus = calculateAffinityBonus(content, aiContent)
      const newAffinity = Math.min(100, affinity + bonus)
      
      // Check for newly unlocked actions before updating state
      const newlyUnlockedActions = scenario.actions?.filter(a => 
        a.affinity_required > affinity && a.affinity_required <= newAffinity
      )

      addAffinity(bonus)

      // Update user scenario in DB with error handling
      const { error: affinityUpdateError } = await supabase
        .from('user_scenarios')
        .update({ affinity_score: newAffinity })
        .eq('id', userScenario.id)

      if (affinityUpdateError) {
        console.error('Failed to save affinity:', affinityUpdateError)
      } else {
        // Update local state to stay in sync
        setUserScenario(prev => prev ? { ...prev, affinity_score: newAffinity } : null)
      }

      // If actions were unlocked, trigger a message from the AI
      if (newlyUnlockedActions && newlyUnlockedActions.length > 0) {
        setIsTyping(true)
        const unlockResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            messages: [
              ...chatHistory,
              { role: 'user', content },
              { role: 'assistant', content: aiContent }
            ],
            model: scenario.model,
            scenario,
            phase: currentPhase,
            isUnlock: true,
            unlockedAction: newlyUnlockedActions[0].label,
            locale
          })
        })

        if (unlockResponse.ok) {
          const unlockData = await unlockResponse.json()
          const unlockMessage: Message = {
            id: generateId(),
            user_scenario_id: userScenario.id,
            role: 'assistant',
            content: unlockData.content,
            created_at: new Date().toISOString()
          }
          addMessage(unlockMessage)
          await supabase.from('messages').insert({
            user_scenario_id: userScenario.id,
            role: 'assistant',
            content: unlockData.content
          })
        }
        setIsTyping(false)
      }

      // Check for phase transition
      const currentPhaseData = scenario.phases?.find(p => p.phase_number === currentPhase)
      const nextPhase = scenario.phases?.find(p => p.phase_number === currentPhase + 1)
      
      if (nextPhase && newAffinity >= (currentPhaseData?.next_phase_affinity || 50)) {
        const newPhase = currentPhase + 1
        setCurrentPhase(newPhase)
        
        const { error: phaseUpdateError } = await supabase
          .from('user_scenarios')
          .update({ current_phase: newPhase })
          .eq('id', userScenario.id)

        if (phaseUpdateError) {
          console.error('Failed to save phase:', phaseUpdateError)
        } else {
          setUserScenario(prev => prev ? { ...prev, current_phase: newPhase } : null)
        }

        // Update video to next phase
        const nextVideo = nextPhase.video_loops?.find(v => v.is_default) || nextPhase.video_loops?.[0]
        if (nextVideo) {
          setCurrentVideoUrl(nextVideo.video_url)
        }

        // Trigger a transition message from the AI
        setIsTyping(true)
        const transitionResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            messages: [
              ...chatHistory,
              { role: 'user', content },
              { role: 'assistant', content: aiContent }
            ],
            model: scenario.model,
            scenario,
            phase: currentPhase + 1,
            isTransition: true,
            locale
          })
        })

        if (transitionResponse.ok) {
          const transData = await transitionResponse.json()
          const transMessage: Message = {
            id: generateId(),
            user_scenario_id: userScenario.id,
            role: 'assistant',
            content: transData.content,
            created_at: new Date().toISOString()
          }
          addMessage(transMessage)
          await supabase.from('messages').insert({
            user_scenario_id: userScenario.id,
            role: 'assistant',
            content: transData.content
          })
        }
        setIsTyping(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }, [scenario, userScenario, messages, affinity, currentPhase])

  const handleActionTrigger = async (action: Action) => {
    if (!scenario || !userProfile) return

    // Plan restrictions for actions
    if (userProfile.plan === 'free') {
      if (action.affinity_required > 0) {
        setLimitModal({ open: true, type: 'phase' }) // Use phase type for general "locked" feel
        return
      }
      if (messages.length >= 5) {
        setLimitModal({ open: true, type: 'scenario' })
        return
      }
    }

    if (userProfile.plan === 'soft') {
      const phase = scenario.phases.find(p => p.id === action.phase_id)
      if (phase && phase.phase_number > 1) {
        setLimitModal({ open: true, type: 'phase' })
        return
      }
    }

    // Change video if action has one
    if (action.trigger_video_url) {
      setCurrentVideoUrl(action.trigger_video_url)
    }

    // Add user message about action
    const actionMessage: Message = {
      id: generateId(),
      user_scenario_id: userScenario?.id,
      role: 'user',
      content: `${action.label} !`,
      created_at: new Date().toISOString()
    }
    addMessage(actionMessage)

    // Also record message in DB for history
    if (userScenario) {
      await supabase.from('messages').insert({
        user_scenario_id: userScenario.id,
        role: 'user',
        content: `${action.label} !`
      })
    }

    // Add affinity for action
    addAffinity(10)

    // Trigger immediate short AI reaction
    setIsTyping(true)
    try {
      // Get auth token for API call
      const { data: { session } } = await supabase.auth.getSession()
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      }

      const chatHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          messages: [
            ...chatHistory,
            { role: 'user', content: `${action.label} !` }
          ],
          model: scenario.model,
          scenario,
          phase: currentPhase,
          isActionTrigger: true,
          locale
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: generateId(),
          user_scenario_id: userScenario?.id || '',
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString()
        }
        addMessage(aiMessage)
        
        if (userScenario) {
          await supabase.from('messages').insert({
            user_scenario_id: userScenario.id,
            role: 'assistant',
            content: data.content
          })
        }
      }
    } catch (error) {
      console.error('Error getting action reaction:', error)
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ginger-dark">
        <div className="w-12 h-12 border-4 border-ginger-primary/30 border-t-ginger-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ginger-dark p-4">
        <h2 className="text-2xl font-bold text-ginger-text mb-4">Scénario introuvable</h2>
        <Link href="/scenarios">
          <Button>Retour aux scénarios</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex flex-col lg:flex-row bg-black overflow-hidden relative">
      {/* MOBILE LAYOUT (ABSOLUTE OVERLAYS) */}
      <div className="lg:hidden absolute inset-0 z-0">
        <VideoLooper
          src={currentVideoUrl || '/videos/placeholder.mp4'}
          className="w-full h-full object-cover"
          isMuted={isMuted}
        />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />
      </div>

      {/* MOBILE UI ELEMENTS */}
      <div className="lg:hidden relative z-20 flex flex-col h-[100dvh] w-full pointer-events-none">
        {/* Top Bar */}
        <div className="p-6 flex justify-between items-start pointer-events-auto">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{scenario.model?.name}</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                {currentPhase === 1 ? scenario.context : 'Chambre de ' + scenario.model?.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link 
              href="/scenarios"
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white"
            >
              <X className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white pointer-events-auto"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Bottom: Chat & Controls */}
        <div className="mt-auto flex flex-col w-full pointer-events-auto">
          {/* Messages Overlay - Only show the last one on mobile */}
          <div className="h-[120px] flex items-end p-6 bg-gradient-to-t from-black/90 to-transparent overflow-hidden">
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <TypingIndicator name={scenario.model?.name || ''} />
                </motion.div>
              ) : messages.length > 0 ? (
                <motion.div
                  key={messages[messages.length - 1].id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <ChatBubble
                    message={messages[messages.length - 1]}
                    modelName={scenario.model?.name || ''}
                    modelAvatar={scenario.model?.avatar_url}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 bg-black/90 backdrop-blur-sm border-t border-white/10 space-y-4">
            {/* Switcher above input */}
            {scenario.phases?.length > 1 && (
              <div className="flex flex-col items-center gap-2">
                <AnimatePresence>
                  {lockedPhaseMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20"
                    >
                      {lockedPhaseMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 relative">
                  {scenario.phases
                    .sort((a, b) => a.phase_number - b.phase_number)
                    .map((p, idx, array) => {
                      const requiredAffinity = idx > 0 ? (array[idx-1].next_phase_affinity || 50) : 0;
                      let isLocked = idx > 0 && affinity < requiredAffinity;
                      let lockReason = `Affinité requise : ${requiredAffinity}%`;

                      // Plan restrictions for phases
                      let isPlanLocked = false;
                      if (idx > 0 && userProfile?.plan === 'soft' && p.phase_number > 1) {
                        isPlanLocked = true;
                        isLocked = true;
                        lockReason = "Abonnement Unleashed requis pour cette phase.";
                      } else if (idx > 0 && userProfile?.plan === 'free') {
                        isPlanLocked = true;
                        isLocked = true;
                        lockReason = "Abonnement Soft ou Unleashed requis pour cette phase.";
                      }
                      
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            if (isPlanLocked) {
                              setLimitModal({ open: true, type: 'phase' });
                              return;
                            }
                            if (isLocked) {
                              setLockedPhaseMessage(lockReason);
                              setTimeout(() => setLockedPhaseMessage(null), 3000);
                              return;
                            }
                            setCurrentPhase(p.phase_number);
                            const video = p.video_loops?.find(v => v.is_default) || p.video_loops?.[0];
                            if (video) setCurrentVideoUrl(video.video_url);
                          }}
                          className={`
                            px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5
                            ${currentPhase === p.phase_number 
                              ? 'bg-pink-600 text-white shadow-lg' 
                              : isLocked 
                                ? 'text-zinc-600 opacity-50'
                                : 'text-white/40 hover:text-white'
                            }
                          `}
                        >
                          {isLocked && <Lock className="w-2.5 h-2.5" />}
                          {p.location || `Phase ${p.phase_number}`}
                          {isLocked && <HelpCircle className="w-2.5 h-2.5 ml-0.5" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const input = form.message.value
                if (!input.trim()) return
                handleSendMessage(input)
                form.reset()
              }} className="flex-1 relative">
                <input
                  name="message"
                  type="text"
                  placeholder="Posez n'importe quelle question"
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-pink-500">
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <ActionMenu onActionTrigger={handleActionTrigger} />
            </div>

            {/* Affinity Gauge at the absolute bottom */}
            <div className="pt-2">
              <AffinityGauge />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (HIDDEN ON MOBILE) */}
      <div className="hidden lg:flex flex-1 flex-row w-full h-full">
        {/* Video section */}
        <div className="relative w-[65%] h-full bg-black flex items-center justify-center">
          {/* Top-level controls */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
            <Link 
              href="/scenarios"
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm border border-white/10 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Video Switcher */}
          {scenario.phases?.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
              <AnimatePresence>
                {lockedPhaseMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[10px] font-bold text-pink-500 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-pink-500/20"
                  >
                    {lockedPhaseMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                {scenario.phases
                  .sort((a, b) => a.phase_number - b.phase_number)
                  .map((p, idx, array) => {
                    const requiredAffinity = idx > 0 ? (array[idx-1].next_phase_affinity || 50) : 0;
                    let isLocked = idx > 0 && affinity < requiredAffinity;
                    let lockReason = `Affinité requise : ${requiredAffinity}%`;

                    // Plan restrictions for phases
                    let isPlanLocked = false;
                    if (idx > 0 && userProfile?.plan === 'soft' && p.phase_number > 1) {
                      isPlanLocked = true;
                      isLocked = true;
                      lockReason = "Abonnement Unleashed requis pour cette phase.";
                    } else if (idx > 0 && userProfile?.plan === 'free') {
                      isPlanLocked = true;
                      isLocked = true;
                      lockReason = "Abonnement Soft ou Unleashed requis pour cette phase.";
                    }
                    
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isPlanLocked) {
                            setLimitModal({ open: true, type: 'phase' });
                            return;
                          }
                          if (isLocked) {
                            setLockedPhaseMessage(lockReason);
                            setTimeout(() => setLockedPhaseMessage(null), 3000);
                            return;
                          }
                          setCurrentPhase(p.phase_number);
                          const video = p.video_loops?.find(v => v.is_default) || p.video_loops?.[0];
                          if (video) setCurrentVideoUrl(video.video_url);
                        }}
                        className={`
                          px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5
                          ${currentPhase === p.phase_number 
                            ? 'bg-white text-black shadow-lg' 
                            : isLocked
                              ? 'text-zinc-500 hover:text-white/60'
                              : 'text-white/60 hover:text-white'
                          }
                        `}
                      >
                        {isLocked && <Lock className="w-2.5 h-2.5" />}
                        {p.location || `Phase ${p.phase_number}`}
                        {isLocked && <HelpCircle className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Video player container - Forced Portrait */}
          <div className="h-full aspect-[9/16] relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <VideoLooper
              src={currentVideoUrl || '/videos/placeholder.mp4'}
              className="w-full h-full"
              isMuted={isMuted}
            />
          </div>

          {/* Location indicator */}
          <div className="absolute bottom-6 left-6 z-20">
            <p className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-1">Localisation</p>
            <p className="text-lg font-black text-white">
              {currentPhase === 1 ? scenario.context : 'Chambre de ' + scenario.model?.name}
            </p>
          </div>
        </div>

        {/* Chat section */}
        <div className="w-[35%] h-full flex flex-col bg-zinc-950 border-l border-white/10">
          <div className="shrink-0 border-b border-white/10 bg-zinc-900/50 p-6">
            <h2 className="text-3xl font-black text-white mb-3">{scenario.model?.name}</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBubble
                    message={message}
                    modelName={scenario.model?.name || ''}
                    modelAvatar={scenario.model?.avatar_url}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator name={scenario.model?.name || ''} />}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-6 border-t border-white/10 bg-zinc-900/50 space-y-4">
            <div className="flex items-center gap-3">
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const input = form.message.value
                if (!input.trim()) return
                handleSendMessage(input)
                form.reset()
              }} className="flex-1 flex items-center gap-3">
                <input
                  name="message"
                  type="text"
                  placeholder="Écrire..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                />
                <button type="submit" className="hidden" />
              </form>
              <ActionMenu onActionTrigger={handleActionTrigger} />
            </div>
            
            {/* Affinity Gauge at the absolute bottom */}
            <div className="pt-2">
              <AffinityGauge />
            </div>
          </div>
        </div>
      </div>

      <PlanLimitModal
        isOpen={limitModal.open}
        onClose={() => setLimitModal({ ...limitModal, open: false })}
        type={limitModal.type}
        plan={userProfile?.plan || 'free'}
        modelAvatar={scenario?.model?.avatar_url}
      />
    </div>
  )
}

