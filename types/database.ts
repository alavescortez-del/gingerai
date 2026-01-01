export interface User {
  id: string
  email: string
  credits: number
  plan: 'free' | 'soft' | 'unleashed'
  daily_messages_count: number
  daily_photos_count: number
  daily_messages_reset_at: string
  created_at: string
}

export interface Model {
  id: string
  name: string
  age?: number
  description?: string
  avatar_url: string
  show_video?: string
  chat_avatar_url?: string
  photo_folder_path?: string
  bio?: string
  followers_count?: number
  persona_prompt: string
  speaking_style: string
  personality_traits: {
    dominance: number
    playfulness: number
    sensuality: number
  }
}

export interface Scenario {
  id: string
  model_id: string
  title: string
  context: string
  ai_context?: string
  description?: string
  thumbnail_url?: string
  phase: number
  is_premium: boolean
  model?: Model
}

export interface Phase {
  id: string
  scenario_id: string
  phase_number: number
  location: string
  mood: string
  next_phase_affinity: number
  ai_instructions?: string
}

export interface VideoLoop {
  id: string
  phase_id: string
  type: 'face' | 'back' | 'pov'
  video_url: string
  is_default: boolean
}

export interface Action {
  id: string
  scenario_id: string
  phase_id?: string
  label: string
  description?: string
  trigger_video_url?: string
  affinity_required: number
  credit_cost: number
  is_hard: boolean
}

export interface UserScenario {
  id: string
  user_id: string
  scenario_id: string
  affinity_score: number
  current_phase: number
  is_completed: boolean
  number_unlocked: boolean
  scenario?: Scenario
}

export interface Message {
  id: string
  user_scenario_id?: string
  contact_id?: string
  role: 'user' | 'assistant'
  content: string
  media_url?: string
  is_blurred?: boolean
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  model_id: string
  is_unlocked: boolean
  unlocked_at?: string
  model?: Model
  last_message?: Message
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'spend' | 'bonus'
  description: string
  created_at: string
}

// SugarFeed Types
export interface Drop {
  id: string
  model_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption?: string
  tags?: string[]
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  model?: Model
  is_liked?: boolean
}

export interface DropLike {
  id: string
  drop_id: string
  user_id: string
  created_at: string
}

export interface DropComment {
  id: string
  drop_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
  }
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      models: {
        Row: Model
        Insert: Omit<Model, 'id'>
        Update: Partial<Omit<Model, 'id'>>
      }
      scenarios: {
        Row: Scenario
        Insert: Omit<Scenario, 'id'>
        Update: Partial<Omit<Scenario, 'id'>>
      }
      phases: {
        Row: Phase
        Insert: Omit<Phase, 'id'>
        Update: Partial<Omit<Phase, 'id'>>
      }
      video_loops: {
        Row: VideoLoop
        Insert: Omit<VideoLoop, 'id'>
        Update: Partial<Omit<VideoLoop, 'id'>>
      }
      actions: {
        Row: Action
        Insert: Omit<Action, 'id'>
        Update: Partial<Omit<Action, 'id'>>
      }
      user_scenarios: {
        Row: UserScenario
        Insert: Omit<UserScenario, 'id'>
        Update: Partial<Omit<UserScenario, 'id'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id'>>
      }
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id'>
        Update: Partial<Omit<Contact, 'id'>>
      }
      credits_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<CreditTransaction, 'id'>>
      }
    }
  }
}

