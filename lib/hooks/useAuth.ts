'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/lib/stores/gameStore'
import { User } from '@/types/database'

export function useAuth() {
  const router = useRouter()
  const { setUser, setCredits, resetGame } = useGameStore()
  const [loading, setLoading] = useState(true)
  const [authUser, setAuthUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            setAuthUser(profile)
            setUser(profile)
            setCredits(profile.credits)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setAuthUser(profile)
          setUser(profile)
          setCredits(profile.credits)
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null)
        resetGame()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setCredits, resetGame])

  const signOut = async () => {
    await supabase.auth.signOut()
    resetGame()
    router.push('/')
  }

  return {
    user: authUser,
    loading,
    signOut
  }
}
