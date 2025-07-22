import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const { id } = params
  const { dataUrl, token } = await request.json()
  if (!dataUrl) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const { data: doc } = await supabaseAdmin.from('user_documents').select('sign_token').eq('id', id).maybeSingle()
  if (doc && doc.sign_token && doc.sign_token !== token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  // Upload signature image
  const fileName = `${id}-signature.png`
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  const { error: uploadError } = await supabaseAdmin.storage
    .from('signatures')
    .upload(fileName, buffer, { contentType: 'image/png', upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('signatures').getPublicUrl(fileName)
  await supabaseAdmin
    .from('user_documents')
    .update({ signature_url: urlData.publicUrl, signed_at: new Date().toISOString() })
    .eq('id', id)

  track('contract_signed', { id })

  return NextResponse.json({ url: urlData.publicUrl })
}
