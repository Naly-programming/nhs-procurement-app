'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface StepData {
  company_name?: string
  website?: string
  product_desc?: string
  used_in_nhs?: boolean
  has_data_policy?: boolean
  has_ico_registration?: boolean
  is_dsp_toolkit_compliant?: boolean
}

export default function WizardStepThree() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intakeId = searchParams.get('intake_id')

  const [data, setData] = useState<StepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: result, error } = await supabase
        .from('intake_responses')
        .select('step_data')
        .eq('id', intakeId)
        .single()

      if (error) {
        console.error('Error fetching step data:', error)
        setData({})
      } else {
        setData(result?.step_data || {})
      }
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

  if (loading || !data) return <p className="text-center mt-10">Loading...</p>

  const booleanDisplay = (val?: boolean) => (val ? 'Yes' : 'No')

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
          <strong>Used in NHS?:</strong> {booleanDisplay(data.used_in_nhs)}
        </div>
        <hr className="my-2" />
        <div>
          <strong>Data Protection Policy:</strong> {booleanDisplay(data.has_data_policy)}
        </div>
        <div>
          <strong>ICO Registered:</strong> {booleanDisplay(data.has_ico_registration)}
        </div>
        <div>
          <strong>DSP Toolkit Compliant:</strong> {booleanDisplay(data.is_dsp_toolkit_compliant)}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit & Continue'}
        </button>
      </div>
    </section>
  )
}
