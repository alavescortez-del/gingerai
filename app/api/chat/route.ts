import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildDMPrompt } from '@/lib/prompts'
import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const PLAN_LIMITS = {
  free: { messages: 5, photos: 5 },
  soft: { messages: 30, photos: 20 },
  unleashed: { messages: Infinity, photos: Infinity }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      messages, 
      model, 
      scenario, 
      phase, 
      isDM = false, 
      isTransition = false, 
      isUnlock = false, 
      unlockedAction = '',
      isActionTrigger = false,
      locale = 'fr'
    } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Get auth token from request headers (sent by client)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Verify user with the token
    const { data: { user }, error: authError } = accessToken 
      ? await supabase.auth.getUser(accessToken)
      : { data: { user: null }, error: new Error('No token') }

    if (authError || !user) {
      console.error('Auth error:', authError?.message || 'No token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user plan and current usage
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, daily_messages_count, daily_photos_count')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      // If user not found in users table, use defaults
      const defaultUserData = { plan: 'free', daily_messages_count: 0, daily_photos_count: 0 }
      // Continue with defaults instead of failing
    }
    
    const finalUserData = userData || { plan: 'free', daily_messages_count: 0, daily_photos_count: 0 }

    const userPlan = (finalUserData.plan || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[userPlan]

    // Check message limit
    if ((finalUserData.daily_messages_count || 0) >= limits.messages) {
      return NextResponse.json({ 
        error: 'LIMIT_REACHED', 
        type: 'messages',
        plan: userPlan 
      }, { status: 403 })
    }

    // If AI is expected to send a photo (simplified check based on isUnlock or isTransition or content)
    // For now, let's assume photos are requested explicitly in messages or by flags
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || ''
    const isPhotoRequest = lastUserMessage.includes('photo') || lastUserMessage.includes('image') || lastUserMessage.includes('voir')
    
    if (isPhotoRequest && (finalUserData.daily_photos_count || 0) >= limits.photos) {
      // We don't block the message, but we might want to tell the AI not to send a photo
      // Or we can block if it's strictly a photo request
    }

    // Build system prompt based on context
    let systemPrompt: string
    if (isDM) {
      systemPrompt = buildDMPrompt(model, locale)
    } else {
      systemPrompt = buildSystemPrompt(model, scenario, phase, locale)
    }

    // Prepare messages for API
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10) // Keep last 10 messages for context
    ]

    // If it's a phase transition, add a final directive to guide the model
    if (isTransition) {
      apiMessages.push({
        role: 'system',
        content: `DIRECTIVE SPÉCIALE: Tu viens de passer à la phase ${phase}. Tu es excitée et tu veux que l'utilisateur le sache. Fais une remarque courte et sexy sur le fait que la température monte ou que vous allez passer aux choses sérieuses.`
      })
    }

    // If it's an action unlock, add a directive
    if (isUnlock) {
      apiMessages.push({
        role: 'system',
        content: `DIRECTIVE SPÉCIALE: L'utilisateur a débloqué l'action "${unlockedAction}". Fais une remarque courte et sexy pour lui faire savoir qu'il peut maintenant te demander ça.`
      })
    }

    // If it's a short action trigger reaction
    if (isActionTrigger) {
      apiMessages.push({
        role: 'system',
        content: `DIRECTIVE CRITIQUE: L'utilisateur vient de déclencher une action spécifique. RÉPONDS PAR 5 MOTS MAXIMUM. Ta réponse doit être ultra-courte, sexy et montrer ton excitation immédiate. EXEMPLES: "Oh oui, j'adore ça...", "C'est tellement bon...", "Encore, s'il te plaît..."`
      })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('CRITICAL: OPENROUTER_API_KEY is not defined in environment variables')
      return NextResponse.json({ error: 'API Key configuration error' }, { status: 500 })
    }

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Sugarush',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Modèle ultra-rapide et permissif
        messages: apiMessages,
        temperature: 0.9,
        max_tokens: 150, // Réduit pour des réponses courtes style WhatsApp
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate response', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      )
    }

    // Increment usage counters
    const isAiPhoto = content.includes('📸') || content.includes('*envoie une photo*')
    
    try {
      await supabase.rpc('increment_usage', { 
        user_id: user.id, 
        inc_messages: 1, 
        inc_photos: isAiPhoto ? 1 : 0 
      })
    } catch (rpcError) {
      console.error('RPC Error (non-blocking):', rpcError)
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

