import { NextRequest, NextResponse } from 'next/server'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const { priceId } = await request.json()
  const key = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 500 })

  const params = new URLSearchParams()
  params.append('mode', 'subscription')
  params.append('success_url', `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', `${appUrl}/pricing`)
  params.append('line_items[0][price]', priceId)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  track('checkout_session_created')
  return NextResponse.json({ url: data.url })
}
