import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

const supabaseUrl = 'https://bsxevvhibgwxippwhgkv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGV2dmhpYmd3eGlwcHdoZ2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MDQ5NjAsImV4cCI6MjA2ODE4MDk2MH0.isJ9sfVAncsE13IFBbm0JB92qvmWMKXKl4Hu2LRydHc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchExistingURLs(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('tenders')
    .select('url')
    .limit(10000) // adjust as needed
  if (error) {
    console.error('Error fetching existing tenders:', error)
    return new Set()
  }
  return new Set(data.map((row: any) => row.url))
}

async function fetchTenderLinksFromSearchPages(pages = 3): Promise<string[]> {
  const links: string[] = []

  for (let page = 1; page <= pages; page++) {
    const searchUrl = `https://www.contractsfinder.service.gov.uk/Search/Results?keywords=nhs&location=uk&status=Open&showClosed=0&page=${page}`
    const res = await axios.get(searchUrl)
    const $ = cheerio.load(res.data)

    $('.search-result a').each((_, el) => {
      const href = $(el).attr('href')
      if (href && href.includes('/Notice/')) {
        const fullUrl = `https://www.contractsfinder.service.gov.uk${href.replace('/Notice/', '/notice/print.html?noticeId=')}`
        links.push(fullUrl)
      }
    })
  }

  return [...new Set(links)]
}

function parseValue(valueStr: string): [number, number] {
  const matched = valueStr.match(/\£([\d,]+)\s*to\s*\£([\d,]+)/)
  if (matched) {
    return [
      parseInt(matched[1].replace(/,/g, '')),
      parseInt(matched[2].replace(/,/g, '')),
    ]
  }
  return [0, 0]
}

function hashTender(tender: any): string {
  const json = JSON.stringify(tender)
  return crypto.createHash('sha256').update(json).digest('hex')
}

async function scrapeTenderPage(url: string) {
  const html = await axios.get(url).then((res) => res.data)
  const $ = cheerio.load(html)

  const title = $('h1').text().trim()
  const description = $('#content').text().trim()

  const publishedDate = $('dt:contains("Published date") + dd').text().trim()
  const closingDate = $('dt:contains("Closing date") + dd').text().trim()
  const closingTime = $('dt:contains("Closing time") + dd').text().trim()
  const contractStart = $('dt:contains("Contract start date") + dd').text().trim()
  const contractEnd = $('dt:contains("Contract end date") + dd').text().trim()
  const procurementRef = $('dt:contains("Procurement reference") + dd').text().trim()
  const valueRange = $('dt:contains("Value of contract") + dd').text().trim()
  const contractType = $('dt:contains("Contract type") + dd').text().trim()
  const procedureType = $('dt:contains("Procedure type") + dd').text().trim()
  const location = $('dt:contains("Location of contract") + dd').text().trim()
  const organisation = $('dt:contains("Name of buyer") + dd').text().trim()
  const buyerName = $('dt:contains("Contact name") + dd').text().trim()
  const buyerEmail = $('dt:contains("Email") + dd').text().trim()
  const buyerAddress = $('dt:contains("Address") + dd').text().trim()
  const sme = $('dt:contains("SMEs") + dd').text().trim().toLowerCase().includes('yes')
  const vcse = $('dt:contains("VCSEs") + dd').text().trim().toLowerCase().includes('yes')

  const industryLabels: string[] = []
  const industryCodes: string[] = []
  $('dt:contains("Industry") + dd li').each((_, el) => {
    const text = $(el).text()
    const match = text.match(/(.*)\s+-\s+(\d{8})/)
    if (match) {
      industryLabels.push(match[1].trim())
      industryCodes.push(match[2].trim())
    }
  })

  const [value_min, value_max] = parseValue(valueRange)

  return {
    title,
    organisation,
    published_date: publishedDate,
    closing_date: closingDate,
    closing_time: closingTime,
    contract_start_date: contractStart,
    contract_end_date: contractEnd,
    industry_codes: industryCodes,
    industry_labels: industryLabels,
    location,
    value_min,
    value_max,
    procurement_reference: procurementRef,
    contract_type: contractType,
    procedure_type: procedureType,
    is_suitable_for_sme: sme,
    is_suitable_for_vcse: vcse,
    description,
    how_to_apply: 'Follow instructions in notice or Atamis portal',
    buyer_name: buyerName,
    buyer_address: buyerAddress,
    buyer_email: buyerEmail,
    source_url: url,
  }
}

async function run() {
  const existingURLs = await fetchExistingURLs()
  const links = await fetchTenderLinksFromSearchPages(5)

  console.log(`🔍 Found ${links.length} links. Checking for new ones...`)
  let inserted = 0

  for (const link of links) {
    if (existingURLs.has(link)) {
      console.log(`⏭️  Skipping existing tender: ${link}`)
      continue
    }

    try {
      const tender = await scrapeTenderPage(link)

      const { error } = await supabase.from('tenders').insert([tender])

      if (error) {
        console.error(`❌ Error inserting ${link}:`, error)
      } else {
        console.log(`✅ Inserted tender: ${tender.title}`)
        inserted++
      }
    } catch (err) {
      console.error(`❌ Failed to process ${link}:`, err)
    }
  }

  console.log(`🎉 Finished. ${inserted} new tenders inserted.`)
}

run()
