import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

// Helper to extract ID from URL path
function extractIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url)
  const parts = url.pathname.split('/')
  return parts[parts.length - 2] // assumes `[id]/sign-request`
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const id = extractIdFromRequest(request)
  const token = uuidv4()

  const { error } = await supabaseAdmin
    .from('user_documents')
    .update({ sign_token: token })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  track('sign_request_created', { id })

  return NextResponse.json({ link: `/dashboard/contracts/${id}/sign?token=${token}` })
}
