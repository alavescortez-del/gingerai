import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface TranslateRequest {
  texts: {
    field: string
    value: string
  }[]
  targetLanguages: ('en' | 'de')[]
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { texts, targetLanguages } = body

    if (!texts || texts.length === 0) {
      return NextResponse.json({ error: 'No texts provided' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Translation API not configured' }, { status: 500 })
    }

    const translations: Record<string, Record<string, string>> = {}

    // Translate to each target language
    for (const lang of targetLanguages) {
      const langName = lang === 'en' ? 'English' : 'German'
      
      // Build the prompt with all texts to translate
      const textsToTranslate = texts.map(t => `${t.field}: "${t.value}"`).join('\n')
      
      const prompt = `You are a professional translator. Translate the following French texts to ${langName}. 
Keep the same tone and style. For romantic/adult content, keep it sensual and appealing.
Return ONLY a JSON object with the field names as keys and translations as values.

Texts to translate:
${textsToTranslate}

Return format example:
{"title": "translated title", "description": "translated description"}

IMPORTANT: Return ONLY the JSON, no markdown, no explanation.`

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Sugarush Translation',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        console.error('Translation API error:', await response.text())
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content) {
        try {
          // Clean the response (remove markdown code blocks if present)
          let cleanContent = content.trim()
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```/g, '')
          }
          
          const parsed = JSON.parse(cleanContent)
          translations[lang] = parsed
        } catch (parseError) {
          console.error('Failed to parse translation response:', content)
        }
      }
    }

    return NextResponse.json({ translations })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

