// scrapers/findTenderApi.ts
import * as dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service credentials
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// FTS API endpoint (OCDS release package format)
const FTS_API = process.env.FTS_API_URL || 'https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages'

// Fetch existing OCIDs to avoid duplicates
async function fetchExisting(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('tenders')
    .select('external_reference')
    .eq('source', 'findtender')
    .limit(50000)
  if (error) throw error
  return new Set((data || []).map((r: any) => r.external_reference))
}

// Map a single OCDS release to your tender schema
function mapRel(
  rel: any,
  pkgInfo: { uri?: string; publisher?: any; publishedDate?: string }
) {
  const t = rel.tender || {}
  const cls = Array.isArray(t.classification)
    ? t.classification
    : t.classification
      ? [t.classification]
      : []

  return {
    source: 'findtender',
    external_reference: rel.ocid,
    url: pkgInfo.uri || '',
    title: t.title || '',
    organisation: pkgInfo.publisher?.name || '',
    location: '',
    cpv_codes: cls.map((c: any) => c.id),
    industry: cls.map((c: any) => c.description),
    value_min: t.value?.amount || 0,
    value_max: t.value?.amount || 0,
    procurement_reference: t.id || '',
    published_date: pkgInfo.publishedDate?.split('T')[0] || null,
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
    buyer_name: pkgInfo.publisher?.name || '',
    buyer_email: '',
    source_url: pkgInfo.uri || ''
  }
}

// Main runner function
async function runFTS() {
  const existing = await fetchExisting()

  const resp = await axios.get(FTS_API)
  const pkg = resp.data
  const releases: any[] = Array.isArray(pkg.releases) ? pkg.releases : []

  let count = 0
  for (const rel of releases) {
    const ocid = rel.ocid
    if (!ocid || existing.has(ocid)) continue

    const rec = mapRel(rel, {
      uri: pkg.uri,
      publisher: pkg.publisher,
      publishedDate: pkg.publishedDate
    })

    const { error } = await supabase.from('tenders').insert(rec)
    if (error) console.error('Insert FTS error:', error)
    else {
      existing.add(ocid)
      count++
    }
  }

  console.log(`FTS: inserted ${count} new tenders`)
}

// Run if invoked directly
if (require.main === module) {
  runFTS().catch(err => { console.error(err); process.exit(1) })
}
