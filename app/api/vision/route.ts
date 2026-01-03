import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface VisionRequest {
  photoUrl: string
  modelName: string
  modelPersonality?: string
}

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, modelName, modelPersonality } = await request.json() as VisionRequest

    if (!photoUrl || !modelName) {
      return NextResponse.json({ error: 'Missing photoUrl or modelName' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    console.log('👁️ Vision API called for:', photoUrl)

    // Appel au modèle vision
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Sugarush Vision',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Modèle vision rapide et efficace
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Tu es ${modelName}, une jeune femme séduisante qui vient d'envoyer cette photo à quelqu'un qui lui plaît beaucoup.

ANALYSE cette photo et génère DEUX choses:

1. **COMMENTAIRE** (1-2 phrases): Un message court, coquin et naturel que tu enverrais avec cette photo. Parle à la première personne comme si c'était TOI sur la photo. Sois sexy mais pas vulgaire. Utilise des emojis.
Exemples de ton:
- "Tu aimes mon petit haut ? Je l'ai mis rien que pour toi 😏"
- "J'étais en pause à la salle... tu aurais aimé être là ? 🔥"
- "Cette photo date de ce matin, j'avais envie de te la montrer 💋"

2. **CONTEXTE** (mots-clés): Liste les éléments visibles: lieu, tenue, pose, couleurs, ambiance. Format: mot1, mot2, mot3...

Réponds UNIQUEMENT dans ce format JSON:
{
  "comment": "ton commentaire sexy ici",
  "context": "mot1, mot2, mot3, mot4"
}

${modelPersonality ? `\nPERSONNALITÉ de ${modelName}: ${modelPersonality}` : ''}`
              },
              {
                type: 'image_url',
                image_url: { url: photoUrl }
              }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.9
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Vision API error:', errorData)
      return NextResponse.json({ error: 'Vision API failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    console.log('👁️ Vision response:', content)

    if (!content) {
      return NextResponse.json({ error: 'No content from vision model' }, { status: 500 })
    }

    // Parser le JSON de la réponse
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanContent)
      
      return NextResponse.json({
        success: true,
        comment: parsed.comment || '',
        context: parsed.context || '',
        raw: content
      })
    } catch (parseError) {
      // Si le parsing échoue, essayer d'extraire le commentaire autrement
      console.log('Failed to parse JSON, using raw content')
      return NextResponse.json({
        success: true,
        comment: content.slice(0, 150), // Limiter la longueur
        context: '',
        raw: content
      })
    }

  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


