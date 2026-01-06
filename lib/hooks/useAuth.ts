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
          // Essayer d'abord profiles (nouvelle table), sinon users (ancienne table)
          let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (!profile) {
            const { data: userProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()
            profile = userProfile
          }

          if (profile) {
            // Adapter le format pour le store
            const userForStore = {
              ...profile,
              credits: profile.credits || 0
            }
            setAuthUser(userForStore as any)
            setUser(userForStore as any)
            setCredits(profile.credits || 0)
          } else {
            // User existe dans auth mais pas de profile -> créer un objet minimal
            const minimalUser = {
              id: user.id,
              email: user.email,
              credits: 0
            }
            setAuthUser(minimalUser as any)
            setUser(minimalUser as any)
            setCredits(0)
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
        // Essayer d'abord profiles, sinon users
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          profile = userProfile
        }

        if (profile) {
          const userForStore = {
            ...profile,
            credits: profile.credits || 0
          }
          setAuthUser(userForStore as any)
          setUser(userForStore as any)
          setCredits(profile.credits || 0)
        } else {
          // User existe dans auth mais pas de profile -> créer un objet minimal
          const minimalUser = {
            id: session.user.id,
            email: session.user.email,
            credits: 0
          }
          setAuthUser(minimalUser as any)
          setUser(minimalUser as any)
          setCredits(0)
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

