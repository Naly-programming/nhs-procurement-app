// scrapers/contractsFinderApi.ts
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configuration: API endpoint + query params
const CF_API = process.env.CF_API_URL || 'https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search'
const PAGE_LIMIT = 100

async function fetchExistingOcidSet(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('tenders')
    .select('external_reference')
    .limit(10000)
  if (error) throw new Error(error.message)
  return new Set(data.map((row: any) => row.external_reference))
}

function mapReleaseToTender(release: any) {
  const t = release.tender || {}
  const cpvs = t.classification?.map((c: any) => c.id) || []
  const cpvNames = t.classification?.map((c: any) => c.description) || []
  const org = release.buyer?.name || ''
  return {
    source: 'contractsfinder',
    external_reference: release.ocid,
    url: release.uri,
    title: release.tender.title,
    organisation: org,
    location: (release.tender.value?.description) || '',
    cpv_codes: cpvs,
    industry: cpvNames,
    value_min: release.tender.value?.amount || 0,
    value_max: release.tender.value?.amount || 0,
    procurement_reference: t.procuringEntity?.id || '',
    published_date: release.datePublished?.split('T')[0],
    closing_date: t.tenderPeriod?.endDate?.split('T')[0],
    closing_time: t.tenderPeriod?.endDate?.split('T')[1]?.split('Z')[0] || '',
    contract_start_date: t.contractPeriod?.startDate?.split('T')[0],
    contract_end_date: t.contractPeriod?.endDate?.split('T')[0],
    contract_type: t.procurementMethod,
    procedure_type: t.procurementMethodDetails,
    is_suitable_for_sme: t.features?.some((f: any) => f.title?.match(/SME/i)) || false,
    is_suitable_for_vcse: t.features?.some((f: any) => f.title?.match(/VCSE/i)) || false,
    description: t.description || '',
    how_to_apply: t.awardCriteria || '',
    contact_name: release.buyer?.contactPoint?.name || '',
    contact_email: release.buyer?.contactPoint?.email || '',
    source_url: release.uri
  }
}

async function run() {
  const existing = await fetchExistingOcidSet()
  let cursor: string | undefined
  let newCount = 0

  do {
    const params: any = { limit: PAGE_LIMIT, stages: 'tender', q: 'nhs' }
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
      }
    }
    cursor = data.cursor
  } while (cursor)

  console.log(`Inserted ${newCount} new tenders`)
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
