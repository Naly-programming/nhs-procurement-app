// scrapers/publicContractsScotland.ts
import * as dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PCS_API = process.env.PCS_API_URL || 'https://api.publiccontractsscotland.gov.uk/v1/Notices'

// Format date param correctly
function getCurrentMonthYear(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${month}-${year}` // correct as "MM-YYYY"
}

function mapReleaseToRecord(rel: any) {
  const notice = rel // the OCDS release
  const t = notice.tender || {}
  const cls = Array.isArray(t.classification)
    ? t.classification
    : t.classification ? [t.classification] : []

  return {
    source: 'pcs',
    external_reference: notice.ocid,
    url: notice.uri || '',
    title: t.title || '',
    organisation: notice.buyer?.name || '',
    location: '',
    cpv_codes: cls.map((c: any) => c.id),
    industry: cls.map((c: any) => c.description),
    value_min: t.value?.amount || 0,
    value_max: t.value?.amount || 0,
    procurement_reference: t.id || '',
    published_date: notice.datePublished?.split('T')[0] || null,
    closing_date: t.tenderPeriod?.endDate?.split('T')[0] || null,
    closing_time: t.tenderPeriod?.endDate?.split('T')[1]?.split('Z')[0] || '',
    contract_start_date: t.contractPeriod?.startDate?.split('T')[0] || null,
    contract_end_date: t.contractPeriod?.endDate?.split('T')[0] || null,
    contract_type: t.status || '',
    procedure_type: t.procurementMethodDetails || '',
    is_suitable_for_sme: t.suitability?.sme || false,
    is_suitable_for_vcse: t.suitability?.vcse || false,
    description: t.description || '',
    how_to_apply: '',
    buyer_name: notice.buyer?.name || '',
    buyer_email: notice.buyer?.contactPoint?.email || '',
    source_url: notice.uri || ''
  }
}

export async function runPCS() {
  const { data: existing, error: fetchErr } = await supabase
    .from('tenders')
    .select('external_reference')
    .eq('source', 'pcs')
    .limit(10000)
  if (fetchErr) throw fetchErr
  const existingIds = new Set(existing.map((r: any) => r.external_reference))

  const dateFrom = getCurrentMonthYear()
  const url = `${PCS_API}?dateFrom=${dateFrom}&noticeType=2&outputType=0`
  console.log('🔍 FETCH URL:', url)

  const resp = await axios.get(url)
  console.log('🧩 Top-level keys:', Object.keys(resp.data))

  const releases = Array.isArray(resp.data.releases) ? resp.data.releases : []
  console.log(`📦 PCS: fetched ${releases.length} releases from OCDS schema`)

  let count = 0
  for (const rel of releases) {
    if (!rel.ocid || existingIds.has(rel.ocid)) continue
    const record = mapReleaseToRecord(rel)
    const { error } = await supabase.from('tenders').insert(record)
    if (error) console.error('🛑 PCS insert error:', error)
    else {
      existingIds.add(rel.ocid)
      count++
      console.log('✅ Inserted:', rel.ocid)
    }
  }

  console.log(`🎉 PCS: imported ${count} new tenders`)
}

if (require.main === module) {
  runPCS().catch(err => {
    console.error('🔴 Fatal PCS error:', err)
    process.exit(1)
  })
}
