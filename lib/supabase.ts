import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a browser client for SSR compatibility
// This ensures cookies are used consistently with the middleware
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey && typeof window !== 'undefined'
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createSupabaseClient(supabaseUrl, supabaseAnonKey) // Fallback for server-side

// Server-side client for API routes
export const createServerClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}
