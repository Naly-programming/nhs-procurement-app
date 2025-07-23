import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { pdf } from '@react-pdf/renderer'
import ContractPDF from '@/components/pdf/ContractPDF'
import { globalLimiter } from '@/lib/rateLimit'
import { track } from '@/lib/analytics'

import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'global'
  if (!globalLimiter.check(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Extract id from URL
  const url = new URL(request.url)
  const parts = url.pathname.split('/')
  const id = parts[parts.length - 2] // works for /api/contracts/[id]/export

  const { data, error } = await supabaseAdmin
    .from('user_documents')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  const clauses = (data.content ? JSON.parse(data.content) : []) as { text: string }[]
  const doc = <ContractPDF title={data.title} clauses={clauses} />
  const blob = await pdf(doc).toBuffer()

  track('contract_exported', { id })

  return new NextResponse(blob as unknown as BodyInit, {
    status: 200,
    headers: { 'Content-Type': 'application/pdf' },
  })
}
