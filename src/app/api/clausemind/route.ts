import { NextRequest, NextResponse } from 'next/server'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { action, text, messages } = await request.json()
  if (!text) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const prompts: Record<string, string> = {
    explain: `Explain this clause in simple terms:\n\n${text}`,
    rewrite: `Rewrite the following clause for clarity:\n\n${text}`,
    simplify: `Simplify this clause:\n\n${text}`
  }

  const userPrompt = prompts[action] ?? text

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }

  const history = Array.isArray(messages)
    ? messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }))
    : []
  history.push({ role: 'user', content: userPrompt })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: history,
      temperature: 0.7
    })
  })

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error }, { status: 500 })
  }

  const data = await res.json()
  const result = data.choices?.[0]?.message?.content?.trim()
  track('clause_action', { action })
  return NextResponse.json({ result })
}
