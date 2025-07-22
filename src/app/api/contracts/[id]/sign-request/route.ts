import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { id } = params
  const token = uuidv4()
  const { error } = await supabaseAdmin.from('user_documents').update({ sign_token: token }).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  track('sign_request_created', { id })
  return NextResponse.json({ link: `/dashboard/contracts/${id}/sign?token=${token}` })
}
