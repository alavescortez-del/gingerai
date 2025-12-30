import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildDMPrompt, buildPhotoConfirmationPrompt, getCurrentContext } from '@/lib/prompts'
import { createClient } from '@supabase/supabase-js'
import { detectPhotoCategories, detectColors } from '@/lib/photo-categories'

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
      locale = 'fr',
      userHour = new Date().getHours(), // Heure locale de l'utilisateur
      lastPhotoContext = null // Contexte de la dernière photo envoyée
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

    // Detect photo requests - More intelligent detection
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    const lastUserMessageLower = lastUserMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    
    // Patterns qui indiquent une VRAIE demande de photo
    const photoRequestPatterns = [
      // Demandes explicites
      /envoie[- ]?(moi|nous)?\s*(une|des|ta|tes)?\s*(photo|image|pic|selfie)/i,
      /envoie[- ]?(une|des|ta|tes)\s*(photo|image|pic|selfie)/i,
      /(montre|fais voir|fait voir)[- ]?(moi|nous)?\s*(une|des|ta|tes)?\s*(photo|image)?/i,
      /(je veux|j'veux|jveux)\s*(voir|une|des|ta|tes)\s*(photo|image|toi)/i,
      /(tu peux|peux[- ]?tu)\s*(m'envoyer|envoyer|montrer)\s*(une|des|ta|tes)?\s*(photo|image)?/i,
      /(une|des|ta|tes)\s*(photo|image|pic|selfie)\s*(de toi|stp|s'?il te plait|please)?$/i,
      /photo\s*(de toi|stp|s'?il te plait|please|now|maintenant)/i,
      // Questions directes
      /(t'as|tu as|as[- ]?tu)\s*(une|des)?\s*(photo|image|pic)/i,
      // Demandes de contenu spécifique (nude, lingerie, etc.)
      /(envoie|montre|fais voir|je veux)\s*.{0,20}(nude|nue|sexy|lingerie|bikini|maillot|sous[- ]?vetement)/i,
      /une\s*(photo|image)\s*.{0,10}(sport|gym|workout|fitness|plage|beach|piscine)/i,
      // Réponses courtes de demande
      /^(photo|image|selfie|pic|nude)\s*[!?]*$/i,
      /^envoie\s*[!?]*$/i,
    ]
    
    // Patterns qui NE SONT PAS des demandes (à exclure)
    const notPhotoPatterns = [
      /j'ai (une|des|la|les) (photo|image)/i, // "J'ai une photo"
      /(ma|mes|cette|ces) (photo|image)/i, // "Ma photo"
      /la photo (de|que|qui)/i, // "La photo de..."
      /sur (la|une|cette) (photo|image)/i, // "Sur la photo..."
      /(parle|parlait|parler) (de|d'une) (photo|image)/i, // "Je parle de photo"
    ]
    
    // Vérifier si c'est une vraie demande
    const matchesRequest = photoRequestPatterns.some(pattern => pattern.test(lastUserMessageLower))
    const matchesExclusion = notPhotoPatterns.some(pattern => pattern.test(lastUserMessageLower))
    
    const isPhotoRequest = isDM && matchesRequest && !matchesExclusion
    
    // Detect photo categories AND colors from the message
    const photoCategories = isPhotoRequest ? detectPhotoCategories(lastUserMessage) : []
    const photoColors = isPhotoRequest ? detectColors(lastUserMessage) : []
    
    console.log('📸 Photo detection:', {
      message: lastUserMessageLower,
      matchesRequest,
      matchesExclusion,
      isDM,
      isPhotoRequest,
      categories: photoCategories,
      colors: photoColors
    })
    
    // Check photo limit if it's a photo request
    if (isPhotoRequest && (finalUserData.daily_photos_count || 0) >= limits.photos) {
      return NextResponse.json({ 
        error: 'LIMIT_REACHED', 
        type: 'photos',
        plan: userPlan 
      }, { status: 403 })
    }

    // Build system prompt based on context
    let systemPrompt: string
    if (isDM) {
      systemPrompt = buildDMPrompt(model, locale, userHour)
    } else {
      systemPrompt = buildSystemPrompt(model, scenario, phase, locale)
    }

    // Ajouter le contexte de la dernière photo si disponible
    if (lastPhotoContext && isDM) {
      systemPrompt += `\n\n📸 DERNIÈRE PHOTO ENVOYÉE: Tu as récemment envoyé une photo. Voici ce qu'elle montre: ${lastPhotoContext}
Si l'utilisateur pose une question sur cette photo ou fait un commentaire dessus, tu peux y répondre naturellement en te référant à ce que tu sais de la photo.
Exemples de questions possibles: "Elle est où cette photo ?", "C'est quoi ta tenue ?", "T'es sexy dessus", etc.`
    }

    // Get current context for potential photo dialogue
    const currentContext = getCurrentContext(userHour)

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

    // If user requested a photo
    if (isPhotoRequest) {
      // Si l'utilisateur a spécifié une catégorie (sport, lingerie, etc.) → Répondre avec excitation et envoyer
      // Si pas de catégorie spécifique → Proposer un dialogue de confirmation
      if (photoCategories.length > 0) {
        // L'utilisateur sait ce qu'il veut → Répondre brièvement et envoyer la photo
        apiMessages.push({
          role: 'system',
          content: `DIRECTIVE PHOTO: L'utilisateur veut une photo spécifique (catégorie: ${photoCategories.join(', ')}). 
Réponds TRÈS brièvement avec excitation (1 phrase MAX) pour dire que tu lui envoies.
EXEMPLES: "Mmh, celle-là va te plaire 😏", "Regarde ce que j'ai pour toi 🔥", "Tiens, rien que pour toi 💋"
NE PROPOSE PAS D'AUTRE CHOIX, la photo va être envoyée automatiquement après ta réponse.`
        })
      } else {
        // Pas de catégorie spécifique → Proposer un choix basé sur le contexte actuel
        const photoConfirmationPrompt = buildPhotoConfirmationPrompt(userHour)
        apiMessages.push({
          role: 'system',
          content: photoConfirmationPrompt
        })
      }
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
        model: 'meta-llama/llama-3.1-70b-instruct', // Modèle ultra-rapide et permissif
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

    // Increment usage counters (photos will be incremented when actually sent)
    try {
      await supabase.rpc('increment_usage', { 
        user_id: user.id, 
        inc_messages: 1, 
        inc_photos: 0 
      })
    } catch (rpcError) {
      console.error('RPC Error (non-blocking):', rpcError)
    }

    return NextResponse.json({ 
      content,
      shouldSendPhoto: isPhotoRequest, // Flag to trigger photo sending from frontend
      photoCategories: photoCategories, // Categories detected in user's request
      photoColors: photoColors // Colors detected in user's request
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

