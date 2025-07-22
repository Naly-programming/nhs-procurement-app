import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const ip = _request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { id } = params
  const { data, error } = await supabaseAdmin
    .from('user_documents')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { id } = params
  const { title, content } = await request.json()
  const { error } = await supabaseAdmin
    .from('user_documents')
    .update({ title, content })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  track('contract_updated', { id })

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const ip = _request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { id } = params
  const { error } = await supabaseAdmin.from('user_documents').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  track('contract_deleted', { id })
  return NextResponse.json({ success: true })
}
