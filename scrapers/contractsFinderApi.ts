// scrapers/contractsFinderApi.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with backend credentials
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// API configuration
const CF_API = process.env.CF_API_URL || 'https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search'
const PAGE_LIMIT = 100

// Fetch existing OCIDs to prevent duplicates
async function fetchExistingOcidSet(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('tenders')
    .select('external_reference')
    .limit(10000)
  if (error) throw new Error(error.message)
  return new Set(data.map((row: any) => row.external_reference))
}

// Map API release to your DB schema
function mapReleaseToTender(release: any) {
  const t = release.tender || {}
const classifications = Array.isArray(t.classification)
  ? t.classification
  : t.classification
    ? [t.classification]
    : []

const cpvs = classifications.map((c: any) => c.id)
const cpvNames = classifications.map((c: any) => c.description)
  const org = release.buyer?.name || ''
  return {
    source: 'contractsfinder',
    external_reference: release.ocid,
    url: release.uri,
    title: t.title,
    organisation: org,
    location: t.value?.description || '',
    cpv_codes: cpvs,
    industry: cpvNames,
    value_min: t.value?.amount || 0,
    value_max: t.value?.amount || 0,
    procurement_reference: t.procuringEntity?.id || '',
    published_date: release.datePublished?.split('T')[0] || null,
    closing_date: t.tenderPeriod?.endDate?.split('T')[0] || null,
    closing_time: t.tenderPeriod?.endDate?.split('T')[1]?.split('Z')[0] || '',
    contract_start_date: t.contractPeriod?.startDate?.split('T')[0] || null,
    contract_end_date: t.contractPeriod?.endDate?.split('T')[0] || null,
    contract_type: t.procurementMethod || '',
    procedure_type: t.procurementMethodDetails || '',
    is_suitable_for_sme: t.features?.some((f: any) => /SME/i.test(f.title)) || false,
    is_suitable_for_vcse: t.features?.some((f: any) => /VCSE/i.test(f.title)) || false,
    description: t.description || '',
    how_to_apply: t.awardCriteria || '',
    buyer_name: release.buyer?.contactPoint?.name || '',
    buyer_email: release.buyer?.contactPoint?.email || '',
    source_url: release.uri
  }
}

async function run() {
  const existing = await fetchExistingOcidSet()
  let cursor: string | undefined
  let newCount = 0

  do {
    const params: any = { limit: PAGE_LIMIT, stages: 'tender' }
    if (cursor) params.cursor = cursor

    const resp = await axios.get(CF_API, { params })
    const data = resp.data

    for (const rel of data.releases) {
      const ocid = rel.ocid
      if (existing.has(ocid)) continue

      const tender = mapReleaseToTender(rel)
      const { error } = await supabase.from('tenders').insert(tender)
      if (error) console.error('Insert error:', error)
      else {
        existing.add(ocid)
        newCount++
        console.log('✅ Inserted:', tender.title)
      }
    }
    cursor = data.cursor
  } while (cursor)

  console.log(`🎉 Done. Inserted ${newCount} new tenders.`)
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
