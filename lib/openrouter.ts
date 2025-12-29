const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
}

export async function generateChatResponse(
  messages: ChatMessage[],
  model: string = 'nousresearch/hermes-3-llama-3.1-405b',
  temperature: number = 0.8
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Sugarush',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function* streamChatResponse(
  messages: ChatMessage[],
  model: string = 'nousresearch/hermes-3-llama-3.1-405b',
  temperature: number = 0.8
): AsyncGenerator<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Sugarush',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 500,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

