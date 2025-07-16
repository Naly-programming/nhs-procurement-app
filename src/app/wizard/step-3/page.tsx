'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WizardStepThree() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intakeId = searchParams.get('intake_id')

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('intake_responses')
        .select('step_data')
        .eq('id', intakeId)
        .single()

      setData(data?.step_data || {})
      setLoading(false)
    }

    if (intakeId) fetchData()
  }, [intakeId])

  const handleSubmit = async () => {
    setSubmitting(true)

    await supabase
      .from('intake_responses')
      .update({ submitted_at: new Date().toISOString() })
      .eq('id', intakeId)

    router.push('/dashboard/documents')
  }

  const handleBack = () => {
    router.push(`/wizard/step-2?intake_id=${intakeId}`)
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Step 3: Review & Submit</h2>

      <div className="bg-white border rounded p-4 mb-6 space-y-2 text-sm">
        <div>
          <strong>Company Name:</strong> {data.company_name || '—'}
        </div>
        <div>
          <strong>Website:</strong> {data.website || '—'}
        </div>
        <div>
          <strong>Product Description:</strong> {data.product_desc || '—'}
        </div>
        <div>
          <strong>Used in NHS?:</strong> {data.used_in_nhs ? 'Yes' : 'No'}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          {submitting ? 'Submitting...' : 'Submit & Continue'}
        </button>
      </div>
    </section>
  )
}
