import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data })
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { user_id, title, content } = await request.json()
  if (!user_id || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const id = uuidv4()
  const { error } = await supabaseAdmin.from('user_documents').insert({
    id,
    user_id,
    title,
    content: content || '',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  track('contract_created', { user_id })

  return NextResponse.json({ id })
}
