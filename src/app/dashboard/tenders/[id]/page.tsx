import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function TenderDetail({ params }: { params: { id: string } }) {
  const { data: tender } = await supabase
    .from('tenders')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!tender) return notFound()

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-8">
      <div className="mb-6">
        <Link
          href="/dashboard/tenders"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
        >
          ← Back to Tenders
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{tender.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Published:</span> {new Date(tender.published_date).toLocaleDateString('en-GB')}</p>
              <p><span className="font-medium">Deadline:</span> {tender.closing_date ? new Date(tender.closing_date).toLocaleDateString('en-GB') : 'N/A'}</p>
              <p><span className="font-medium">Contract Start:</span> {tender.contract_start_date ? new Date(tender.contract_start_date).toLocaleDateString('en-GB') : 'N/A'}</p>
              <p><span className="font-medium">Value:</span> {tender.value_min ? `£${tender.value_min}` : 'N/A'}{tender.value_max && tender.value_max !== tender.value_min ? ` - £${tender.value_max}` : ''}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Additional Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Source:</span> {tender.source}</p>
              <p><span className="font-medium">Industries:</span> {tender.industry?.join(', ') || 'N/A'}</p>
              <p><span className="font-medium">Procurement Reference:</span> {tender.procurement_reference || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-line">{tender.description}</p>
        </div>

        {tender.how_to_apply && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">How to Apply</h2>
            <p className="whitespace-pre-line">{tender.how_to_apply}</p>
          </div>
        )}
      </div>
    </div>
  )
}