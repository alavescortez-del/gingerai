import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserScenario, Message, Contact, Action } from '@/types/database'

interface GameState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  
  // Credits
  credits: number
  setCredits: (credits: number) => void
  deductCredits: (amount: number) => boolean
  addCredits: (amount: number) => void
  
  // Current scenario
  currentScenario: UserScenario | null
  setCurrentScenario: (scenario: UserScenario | null) => void
  
  // Affinity
  affinity: number
  setAffinity: (value: number) => void
  addAffinity: (bonus: number) => void
  
  // Messages (current session)
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void
  
  // Current video
  currentVideoUrl: string | null
  setCurrentVideoUrl: (url: string | null) => void
  
  // Available actions
  availableActions: Action[]
  setAvailableActions: (actions: Action[]) => void
  
  // Unlocked contacts
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  
  // UI state
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  showActionMenu: boolean
  setShowActionMenu: (show: boolean) => void
  
  // Reset
  resetGame: () => void
}

const initialState = {
  user: null,
  credits: 0,
  currentScenario: null,
  affinity: 0,
  messages: [],
  currentVideoUrl: null,
  availableActions: [],
  contacts: [],
  isTyping: false,
  showActionMenu: false,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user, credits: user?.credits || 0 }),
      
      setCredits: (credits) => set({ credits }),
      
      deductCredits: (amount) => {
        const { credits } = get()
        if (credits >= amount) {
          set({ credits: credits - amount })
          return true
        }
        return false
      },
      
      addCredits: (amount) => {
        const { credits } = get()
        set({ credits: credits + amount })
      },
      
      setCurrentScenario: (scenario) => set({ 
        currentScenario: scenario,
        affinity: scenario?.affinity_score || 0,
        messages: []
      }),
      
      setAffinity: (value) => set({ affinity: Math.min(100, Math.max(0, value)) }),
      
      addAffinity: (bonus) => {
        const { affinity } = get()
        const newAffinity = Math.min(100, affinity + bonus)
        set({ affinity: newAffinity })
      },
      
      addMessage: (message) => {
        const { messages } = get()
        set({ messages: [...messages, message] })
      },
      
      clearMessages: () => set({ messages: [] }),
      
      setCurrentVideoUrl: (url) => set({ currentVideoUrl: url }),
      
      setAvailableActions: (actions) => set({ availableActions: actions }),
      
      setContacts: (contacts) => set({ contacts }),
      
      addContact: (contact) => {
        const { contacts } = get()
        if (!contacts.find(c => c.id === contact.id)) {
          set({ contacts: [...contacts, contact] })
        }
      },
      
      setIsTyping: (typing) => set({ isTyping: typing }),
      
      setShowActionMenu: (show) => set({ showActionMenu: show }),
      
      resetGame: () => set(initialState),
    }),
    {
      name: 'ginger-game-store',
      partialize: (state) => ({
        credits: state.credits,
        contacts: state.contacts,
      }),
    }
  )
)

