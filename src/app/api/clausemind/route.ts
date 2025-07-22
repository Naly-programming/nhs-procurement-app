import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { action, text } = await request.json()
  if (!action || !text) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const prompts: Record<string, string> = {
    explain: `Explain this clause in simple terms:\n\n${text}`,
    rewrite: `Rewrite the following clause for clarity:\n\n${text}`,
    simplify: `Simplify this clause:\n\n${text}`
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompts[action] }],
      temperature: 0.7
    })
  })

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error }, { status: 500 })
  }

  const data = await res.json()
  const result = data.choices?.[0]?.message?.content?.trim()
  return NextResponse.json({ result })
}
