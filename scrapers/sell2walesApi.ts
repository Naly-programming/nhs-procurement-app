// scrapers/sell2walesApi.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FILE_PATH = path.resolve('data/sell2wales.json')
const USE_FILE = false

const now = new Date()
const mm = String(now.getMonth() + 1).padStart(2, '0')
const yyyy = now.getFullYear()
const API_URL = `https://api.sell2wales.gov.wales/v1/Notices` +
  `?noticeType=3&outputType=1&dateFrom=${mm}-${yyyy}&locale=2057`

async function loadNotices(): Promise<any[]> {
  if (USE_FILE) {
    try {
      const raw = await fs.readFile(FILE_PATH, 'utf-8')
      return JSON.parse(raw)?.Notices ?? []
    } catch (err) {
      console.error('❌ Failed to load file:', err)
      return []
    }
  } else {
    console.log('📡 Fetching API URL:', API_URL)
    try {
      const resp = await fetch(API_URL)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      console.log('✅ API response keys:', Object.keys(json))
      return json?.notices ?? []
    } catch (err) {
      console.error('❌ Failed API fetch:', err)
      return []
    }
  }
}

function mapNotice(n: any): any | null {
  const uuid = n.Form_Section?.Notice_UUID
  if (!uuid) {
    console.warn('⛔ Skipping: missing Notice_UUID', n)
    return null
  }

  const form = (n.Form_Section as any).F03_2014
  if (!form) {
    console.warn('⛔ Skipping: no form section', uuid)
    return null
  }

  const obj = form.Object_Contract?.[0]
  const body = form.Contracting_Body?.Address_Contracting_Body
  const complementary = form.Complementary_Info
  if (!obj || !body) {
    console.warn('⛔ Skipping: missing object or body', uuid)
    return null
  }

  return {
    source: 'sell2wales',
    external_reference: uuid,
    url: body.URL_Buyer || '',
    title: obj.Title || '',
    organisation: body.OfficialName || '',
    location: body.Town || '',
    cpv_codes: [obj.CPV_Main?.CPV_Code?.Code || ''],
    industry: [],
    value_min: 0,
    value_max: parseFloat(obj.Val_Total?.Value || '0'),
    procurement_reference: obj.Reference_Number || '',
    published_date: complementary?.Date_Dispatch_Notice || null,
    closing_date: null,
    closing_time: null,
    contract_start_date: null,
    contract_end_date: null,
    contract_type: obj.Type_Contract?.CType || '',
    procedure_type: form.Procedure?.PT_Open ? 'open' : '',
    is_suitable_for_sme: null,
    is_suitable_for_vcse: null,
    description: obj.Short_Descr || '',
    how_to_apply: complementary?.Info_Add || '',
    buyer_name: body.OfficialName || '',
    buyer_email: body.E_Mail || '',
    source_url: body.URL_Buyer || ''
  }
}

async function run() {
  const { data: existingTenders, error: fetchError } = await supabase
    .from('tenders')
    .select('external_reference')
    .eq('source', 'sell2wales')

  if (fetchError) {
    console.error('❌ Supabase fetch error:', fetchError)
    return
  }

  const existing = new Set(existingTenders?.map((t: any) => t.external_reference))
  console.log('🔍 Existing Sell2Wales IDs:', existing.size)

  const notices = await loadNotices()
  console.log(`📦 Fetched ${notices.length} notices`)

  let newCount = 0
  for (const n of notices) {
    const record = mapNotice(n)
    if (!record) continue
    if (existing.has(record.external_reference)) continue

    console.log('🔍 Inserting record:', record.external_reference, record.title)
    const { error } = await supabase
      .from('tenders')
      .insert(record)

    if (error) console.error('❌ Insert error:', error)
    else {
      existing.add(record.external_reference)
      newCount++
      console.log('✅ Inserted:', record.external_reference)
    }
  }

  console.log(`🎉 Finished — ${newCount} new tenders inserted`)
}

run()
